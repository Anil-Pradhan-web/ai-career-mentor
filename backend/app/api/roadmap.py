"""
Roadmap API — Thin route layer.
  POST /roadmap/generate → Given target_role + skill_gaps, call unified registry
                           runners (run_roadmap_structure + run_roadmap_details_batch)
                           and return a structured week-by-week learning plan.
                           Same runners used by the Full Analysis LangGraph graph.

Business logic lives in app.core.roadmap:
  - prompts.py   → System prompts
  - agents.py    → LLM agent runners
  - helpers.py   → JSON parsing, normalisation, fallback generation
  - quiz.py      → Quiz generation (LLM + fallback)
"""
import json
import asyncio

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from loguru import logger

from app.models.schemas import RoadmapRequest, RoadmapResponse, RoadmapWeek
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.config import settings
from sqlalchemy.orm import Session
from app.models.models import CareerRoadmap
from app.core.activity import log_activity
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.cache import get_cached_response, set_cached_response
from app.core.search_engine import enrich_weeks_with_resources

# ── Re-exports from core.roadmap (used by workflow.py and tests) ─────────────
from app.core.roadmap.agents import run_roadmap_structure, run_roadmap_details_batch  # noqa: F401
from app.core.roadmap.helpers import (                                                # noqa: F401
    parse_agent_json as _parse_agent_json,
    normalise_week as _normalise_week,
    generate_fallback_roadmap as _generate_fallback_roadmap,
    build_validated_weeks as _build_validated_weeks,
)

router = APIRouter()


# ── POST /roadmap/generate ─────────────────────────────────────────────────────
@router.post(
    "/generate",
    response_model=RoadmapResponse,
    summary="Generate a week-by-week career learning roadmap",
)
async def generate_roadmap(
    body: RoadmapRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapResponse:
    """
    Input  : target_role (str) + skill_gaps (list of strings)
    Process: Career_Coach AutoGen agent builds a 8-week plan
    Output : RoadmapResponse with structured weekly milestones
    """
    try:
        check_daily_limit(current_user.id, "roadmap")

        # -- Validate input ─────────────────────────────────────────────────────────
        target_role = body.target_role.strip()
        skill_gaps = [s.strip() for s in body.skill_gaps if s.strip()]

        if not target_role:
            raise HTTPException(status_code=400, detail="target_role must not be empty.")
        if not skill_gaps:
            raise HTTPException(status_code=400, detail="skill_gaps list must not be empty.")

        logger.info(
            f"roadmap/generate: role='{target_role}' | gaps={skill_gaps}"
        )

        # ── Learning Style & Experience Preferences from request ───────────────────────
        req_exp_level = getattr(body, "experience_level", "intermediate") or "intermediate"
        req_style = getattr(body, "learning_style", "balanced") or "balanced"

        # ── Cache check ────────────────────────────────────────────────────────────
        gaps_key = "-".join(sorted(skill_gaps))
        cached_weeks_dicts = get_cached_response("roadmap", target_role, gaps_key, body.provider, req_exp_level)
        if cached_weeks_dicts:
            weeks_objs = [RoadmapWeek(**w) for w in cached_weeks_dicts]
            steps_data = []
            for w in cached_weeks_dicts:
                w["experience_level"] = req_exp_level
                steps_data.append(w)
            roadmap_record = CareerRoadmap(
                user_id=current_user.id,
                target_role=target_role,
                steps=steps_data
            )
            db.add(roadmap_record)
            db.commit()
            db.refresh(roadmap_record)

            increment_usage(current_user.id, "roadmap")
            log_activity(db, current_user.id, f"Generated Roadmap for {target_role} (Cached)", "roadmap")
            return RoadmapResponse(id=roadmap_record.id, target_role=target_role, weeks=weeks_objs)

        # ── Retrieve latest parsed Resume for candidate profile context ──────────────────
        resume_analysis = None
        try:
            from app.models.models import Resume
            resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
            if resume and resume.parsed_content:
                resume_analysis = resume.parsed_content
        except Exception as e:
            logger.warning(f"Could not load resume context for personalization: {e}")

        # ── Run via unified roadmap runners ─────────────────────────────────────────
        preferred_provider = body.provider or settings.LLM_PROVIDER

        structure = await asyncio.to_thread(
            run_roadmap_structure,
            target_role,
            skill_gaps,
            "Stable",
            preferred_provider,
            None,  # custom_prompt is None to build it dynamically
            resume_analysis,
            req_exp_level,
            req_style,
        )

        if not structure:
            logger.warning("roadmap: structure empty, using programmatic fallback")
            weeks = _generate_fallback_roadmap(target_role, skill_gaps)
        else:
            # Batch detail generation: 3 parallel chunks of 3, 3, 2 weeks
            chunk_1 = structure[0:3]
            chunk_2 = structure[3:6]
            chunk_3 = structure[6:]

            batch_results = await asyncio.gather(
                asyncio.to_thread(run_roadmap_details_batch, chunk_1, target_role, preferred_provider),
                asyncio.to_thread(run_roadmap_details_batch, chunk_2, target_role, preferred_provider),
                asyncio.to_thread(run_roadmap_details_batch, chunk_3, target_role, preferred_provider),
            )

            # Flatten + merge with structure fields
            raw_weeks = []
            for batch in batch_results:
                raw_weeks.extend(batch)

            # Validate + normalise to exactly 8 weeks
            try:
                import json as _json
                weeks = _build_validated_weeks(_json.dumps(raw_weeks))
            except (ValueError, Exception) as parse_err:
                logger.warning(f"roadmap: batch parse failed ({parse_err}), attempting repair via fallback")
                repair_structure = await asyncio.to_thread(
                    run_roadmap_structure, target_role, skill_gaps, "Stable", preferred_provider
                )
                if repair_structure:
                    weeks = [_normalise_week(w, i) for i, w in enumerate(repair_structure[:8])]
                    while len(weeks) < 8:
                        last = weeks[-1].copy() if weeks else {}
                        last["week"] = len(weeks) + 1
                        last["topic"] = f"Advanced Capstone — {target_role}"
                        last["mini_project"] = "Build and deploy a production-grade component."
                        weeks.append(last)
                else:
                    weeks = _generate_fallback_roadmap(target_role, skill_gaps)

        logger.info(f"roadmap/generate: built {len(weeks)}-week roadmap for '{target_role}'. Enriching resources...")

        # Enrich with DDG URLs
        enriched_weeks = await asyncio.to_thread(enrich_weeks_with_resources, weeks)
        weeks_objs = [RoadmapWeek(**w) for w in enriched_weeks]

        roadmap_id = None
        # Save to DB
        try:
            steps_data = []
            for w in weeks_objs:
                w_dict = w.model_dump()
                w_dict["experience_level"] = req_exp_level
                steps_data.append(w_dict)

            roadmap_record = CareerRoadmap(
                user_id=current_user.id,
                target_role=target_role,
                steps=steps_data
            )
            db.add(roadmap_record)
            db.commit()
            db.refresh(roadmap_record)
            roadmap_id = roadmap_record.id
        except Exception as db_err:
            db.rollback()
            logger.error(f"Failed to save roadmap to DB for user {current_user.id}: {db_err}")

        set_cached_response("roadmap", [w.model_dump() for w in weeks_objs], target_role, gaps_key, body.provider, req_exp_level)
        log_activity(db, current_user.id, f"Generated Roadmap for {target_role}", "roadmap")
        increment_usage(current_user.id, "roadmap")

        return RoadmapResponse(id=roadmap_id, target_role=target_role, weeks=weeks_objs)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the roadmap.")


# ── GET /roadmap/history ───────────────────────────────────────────────────────
@router.get("/history")
async def get_roadmap_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch previous roadmaps for the user."""
    roadmaps = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).order_by(CareerRoadmap.created_at.desc()).all()

    return {
        "history": [
            {
                "id": r.id,
                "target_role": r.target_role,
                "created_at": r.created_at.isoformat(),
                "weeks": json.loads(r.steps) if isinstance(r.steps, str) else r.steps
            }
            for r in roadmaps
        ]
    }


# ── DELETE /roadmap/{roadmap_id} ───────────────────────────────────────────────
@router.delete("/{roadmap_id}")
async def delete_roadmap(
    roadmap_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific roadmap."""
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    db.delete(roadmap)
    db.commit()
    return {"message": "Roadmap deleted successfully"}


# ── PUT /roadmap/{roadmap_id}/toggle-week/{week_number} ────────────────────────
@router.put("/{roadmap_id}/toggle-week/{week_number}")
async def toggle_week(
    roadmap_id: str,
    week_number: int,
    completed: Optional[bool] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle or explicitly set the completed status of a specific week in the roadmap.
    """
    from sqlalchemy.orm.attributes import flag_modified

    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    steps = roadmap.steps
    if isinstance(steps, str):
        try:
            steps = json.loads(steps)
        except Exception as e:
            logger.error(f"Failed to parse steps JSON string: {e}")
            raise HTTPException(status_code=500, detail="Invalid steps data in database")

    steps = list(steps or [])
    found = False
    for step in steps:
        if isinstance(step, dict) and step.get("week") == week_number:
            if completed is not None:
                step["completed"] = completed
            else:
                step["completed"] = not step.get("completed", False)
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Week {week_number} not found in this roadmap")

    try:
        import copy
        roadmap.steps = copy.deepcopy(steps)
        flag_modified(roadmap, "steps")
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
    except Exception as db_err:
        db.rollback()
        logger.error(f"Failed to toggle week in database: {db_err}")
        raise HTTPException(status_code=500, detail=f"Failed to sync with database: {str(db_err)}")

    return {
        "message": f"Week {week_number} completion updated",
        "weeks": roadmap.steps
    }


# ── GET /roadmap/{roadmap_id}/quiz/{week_number} ──────────────────────────────
@router.get("/{roadmap_id}/quiz/{week_number}")
async def get_week_quiz(
    roadmap_id: str,
    week_number: int,
    provider: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get 5 AI-generated multiple-choice questions (MCQs) for the specified week's topic.
    """
    from app.core.roadmap.quiz import generate_quiz

    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    steps = roadmap.steps
    if isinstance(steps, str):
        try:
            steps = json.loads(steps)
        except Exception as e:
            logger.error(f"Failed to parse steps JSON string: {e}")
            raise HTTPException(status_code=500, detail="Invalid steps data in database")

    steps = steps or []
    week_data = None
    for step in steps:
        if isinstance(step, dict) and step.get("week") == week_number:
            week_data = step
            break

    if not week_data:
        raise HTTPException(status_code=404, detail=f"Week {week_number} not found in this roadmap")

    topic = week_data.get("topic") or "Software Engineering"

    # Determine user experience level for custom quiz complexity
    years_of_experience = 0.0
    try:
        from app.models.models import Resume
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
        if latest_resume and latest_resume.parsed_content:
            years_of_experience = latest_resume.parsed_content.get("years_of_experience", 0.0)
    except Exception as exp_err:
        logger.warning(f"Could not load resume context for quiz level: {exp_err}")

    is_beginner = years_of_experience < 2.0

    # Check if the roadmap itself indicates beginner level
    if isinstance(steps, list) and len(steps) > 0 and isinstance(steps[0], dict):
        roadmap_exp = steps[0].get("experience_level", "")
        if "beginner" in roadmap_exp.lower():
            is_beginner = True

    return await generate_quiz(topic, is_beginner, provider="nvidia")
