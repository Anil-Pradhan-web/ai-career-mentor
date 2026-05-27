from __future__ import annotations

from typing import Any

from loguru import logger
from sqlalchemy.orm import Session

from app.models.models import MarketAnalysis


def save_market_analysis(
    db: Session,
    user_id: str,
    target_role: str,
    location: str,
    analysis: dict[str, Any] | None,
) -> MarketAnalysis | None:
    """Persist market context so later voice sessions know the user's target location."""
    if not analysis:
        return None

    try:
        record = MarketAnalysis(
            user_id=user_id,
            target_role=target_role,
            location=location,
            analysis=analysis,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except Exception as exc:
        db.rollback()
        logger.error(f"Failed to save market analysis for voice context: {exc}")
        return None
