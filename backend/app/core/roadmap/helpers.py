"""
Roadmap Helpers — JSON parsing, week normalisation, and fallback generation.

Pure utility functions with no LLM calls or API dependencies.
"""
import json
import re
from loguru import logger


def parse_agent_json(raw: str) -> list[dict]:
    """
    Robustly extract a JSON array from the agent reply using regex if needed.
    """
    cleaned = raw.strip()

    # Try regular parsing first
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    # Remove trailing commas (common LLM JSON issue)
    cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # REGEX FALLBACK: find the first '[' and last ']'
        match = re.search(r"\[\s*\{.*\}\s*\]", cleaned, re.DOTALL)
        if not match:
            # Try on raw string as well
            raw_cleaned = re.sub(r',\s*([\]}])', r'\1', raw)
            match = re.search(r"\[\s*\{.*\}\s*\]", raw_cleaned, re.DOTALL)

        if match:
            try:
                parsed = json.loads(match.group(0))
            except Exception:
                raise ValueError("Could not repair JSON array from agent response.")
        else:
            raise ValueError("Agent response contained no valid JSON array.")

    # Agent might return {"weeks": [...]} instead of a bare array
    if isinstance(parsed, dict):
        for key in ("weeks", "roadmap", "plan", "learning_plan"):
            if key in parsed and isinstance(parsed[key], list):
                return parsed[key]
        raise ValueError(f"Agent returned a dict but no expected list key.")

    if not isinstance(parsed, list):
        raise ValueError("Agent output is not a list.")

    return parsed


def normalise_week(raw_week: dict, idx: int) -> dict:
    """
    Coerce a raw dict from the agent into a validated dict matching RoadmapWeek.
    Handles alternate key names the agent sometimes uses.
    """
    # week number
    week_num = int(raw_week.get("week", idx + 1))

    # topic — also called 'title', 'subject'
    topic = (
        raw_week.get("topic")
        or raw_week.get("title")
        or raw_week.get("subject")
        or f"Week {week_num}"
    )

    # Extract resource_search_queries
    queries = raw_week.get("resource_search_queries", [])
    if not isinstance(queries, list):
        queries = [str(queries)]

    # estimated_hours — also called 'hours', 'time', 'duration'
    hours_raw = (
        raw_week.get("estimated_hours")
        or raw_week.get("hours")
        or raw_week.get("time")
        or raw_week.get("duration")
        or 8
    )
    try:
        estimated_hours = int(float(str(hours_raw).split()[0]))
    except (ValueError, TypeError):
        estimated_hours = 8

    # mini_project — also called 'project', 'task', 'assignment', 'practice'
    mini_project = (
        raw_week.get("mini_project")
        or raw_week.get("project")
        or raw_week.get("task")
        or raw_week.get("assignment")
        or raw_week.get("practice")
        or "Build a small hands-on project using the week's skill."
    )

    raw_week["week"] = week_num
    raw_week["topic"] = str(topic)
    raw_week["estimated_hours"] = estimated_hours
    raw_week["mini_project"] = str(mini_project)
    raw_week["resource_search_queries"] = queries
    raw_week["skill_gap_addressed"] = raw_week.get("skill_gap_addressed", "General Knowledge")
    sc = raw_week.get("success_criteria", "Complete the project successfully")
    if isinstance(sc, dict):
        # LLM sometimes returns {"can_do_x": True, "can_do_y": True} format
        parts = []
        for k, v in sc.items():
            key_readable = k.replace("_", " ").capitalize()
            if isinstance(v, bool):
                if v:
                    parts.append(key_readable)
            elif v:
                parts.append(f"{key_readable}: {v}")
        sc = ". ".join(parts) if parts else "Complete the project successfully"
    elif isinstance(sc, list):
        # LLM sometimes returns ["criteria1", "criteria2"] format
        sc = ". ".join(str(item) for item in sc if item)
    raw_week["success_criteria"] = str(sc).strip() if sc else "Complete the project successfully"
    raw_week["why_it_matters"] = str(raw_week.get("why_it_matters") or raw_week.get("explanation") or f"Developing deep competency in {topic} is highly relevant for building production-grade systems.")
    raw_week["completed"] = raw_week.get("completed", False)
    return raw_week


def generate_fallback_roadmap(target_role: str, skill_gaps: list[str]) -> list[dict]:
    """
    Generate a generic, structured 8-week roadmap as a fail-safe backup.
    """
    logger.info(f"Generating fallback roadmap programmatically for '{target_role}'")
    weeks = []

    gaps = skill_gaps if skill_gaps else ["Core Concepts"]

    for i in range(8):
        week_num = i + 1

        gap_index = min(i // 2, len(gaps) - 1)
        current_gap = gaps[gap_index]

        if week_num == 1:
            topic = f"Foundations of {current_gap} and {target_role} Architecture"
            mini_project = f"Setup environment and build a basic prototype focusing on {current_gap}."
            success_criteria = "Successfully compile, run, and test the initial prototype."
            hours = 10
        elif week_num == 2:
            topic = f"Advanced {current_gap} Patterns and Systems Integration"
            mini_project = f"Extend the prototype by implementing modular structure and core data layers."
            success_criteria = "Verify modular codebase structures and validate all integrated modules."
            hours = 11
        elif week_num == 3:
            topic = f"Implementing {current_gap} in Practical Applications"
            mini_project = f"Develop a functional backend service or application component incorporating {current_gap}."
            success_criteria = "App builds successfully and passes initial local component tests."
            hours = 12
        elif week_num == 4:
            topic = f"Production Hardening and Resiliency for {current_gap}"
            mini_project = f"Add error-handling, logging, and automated unit tests to the {current_gap} service."
            success_criteria = "Verify that system handles failure states gracefully and achieves test coverage."
            hours = 13
        elif week_num == 5:
            topic = f"Scalability and Load Considerations of {current_gap}"
            mini_project = f"Implement asynchronous tasks or simple event-driven architecture with {current_gap}."
            success_criteria = "Tasks process asynchronously and queue items are handled without blocking."
            hours = 14
        elif week_num == 6:
            topic = f"Performance Optimization and Caching for {current_gap}"
            mini_project = f"Integrate a caching layer or optimize hot code paths of {current_gap}."
            success_criteria = "Demonstrate reduction in data retrieval time via cache hits."
            hours = 15
        elif week_num == 7:
            topic = f"Securing {current_gap} Implementations and API Endpoints"
            mini_project = f"Add authentication, CORS settings, or basic data encryption to {current_gap} assets."
            success_criteria = "Verify security middleware blocks unauthorized access successfully."
            hours = 16
        else:
            topic = f"Capstone Deployment and CI/CD for {current_gap}"
            mini_project = f"Write Dockerfiles, build configurations, and deploy the {current_gap} capstone project."
            success_criteria = "Application is containerized and ready for CI/CD staging pipeline."
            hours = 18

        weeks.append({
            "week": week_num,
            "topic": topic,
            "skill_gap_addressed": current_gap,
            "estimated_hours": hours,
            "why_it_matters": f"Mastering {current_gap} is critical for qualifying as a professional {target_role}.",
            "mini_project": mini_project,
            "success_criteria": success_criteria,
            "resource_search_queries": [
                f"{current_gap} best practices",
                f"{current_gap} tutorial",
                f"{target_role} {current_gap} project"
            ]
        })

    return weeks


def build_validated_weeks(raw_content: str) -> list[dict]:
    """Parse raw JSON content and normalise into exactly 8 validated weeks."""
    raw_weeks = parse_agent_json(raw_content)
    if not raw_weeks:
        raise ValueError("Agent returned an empty roadmap.")

    weeks = [normalise_week(w, idx) for idx, w in enumerate(raw_weeks)]

    # Robust length adjustment to guarantee exactly 8 weeks
    if len(weeks) != 8:
        logger.warning(f"Agent returned {len(weeks)} weeks instead of 8. Adjusting...")
        if len(weeks) < 8:
            # Pad with additional weeks
            last_week = weeks[-1] if weeks else {}
            while len(weeks) < 8:
                new_week = last_week.copy() if last_week else {}
                new_week["week"] = len(weeks) + 1
                new_week["topic"] = f"Advanced Deep Dive in {last_week.get('topic', 'Target Role')}"
                new_week["mini_project"] = f"Build an advanced capstone component expanding on: {last_week.get('mini_project', 'previous project')}"
                new_week["estimated_hours"] = max(8, last_week.get("estimated_hours", 10))
                new_week["why_it_matters"] = "Consolidating and extending your skills is critical for senior-level proficiency."
                new_week["success_criteria"] = "Extend the previous project with additional features."
                new_week["skill_gap_addressed"] = last_week.get("skill_gap_addressed", "Advanced Architecture")
                new_week["resource_search_queries"] = last_week.get("resource_search_queries", [])
                weeks.append(new_week)
        else:
            # Truncate to 8
            weeks = weeks[:8]

    # Re-normalize and validate fields
    for i, week in enumerate(weeks):
        week["week"] = i + 1

        # Ensure non-empty topic and mini_project
        if not str(week.get("topic", "")).strip():
            week["topic"] = f"Specialized Training in Target Role (Week {i + 1})"
        if not str(week.get("mini_project", "")).strip():
            week["mini_project"] = "Build a hands-on implementation project using the week's technology."

    return weeks
