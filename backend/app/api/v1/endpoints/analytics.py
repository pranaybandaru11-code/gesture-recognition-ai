from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.gesture_log import GestureLog

router = APIRouter()


@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    """Get gesture detection statistics."""

    # Total detections
    total = await db.execute(select(func.count(GestureLog.id)))
    total_count = total.scalar()

    # Most common gestures
    top_gestures = await db.execute(
        select(GestureLog.gesture_name, func.count(GestureLog.id).label("count"))
        .group_by(GestureLog.gesture_name)
        .order_by(func.count(GestureLog.id).desc())
        .limit(5)
    )

    # Average confidence
    avg_confidence = await db.execute(select(func.avg(GestureLog.confidence)))
    avg_conf = avg_confidence.scalar()

    return {
        "total_detections": total_count,
        "average_confidence": round(float(avg_conf or 0), 3),
        "top_gestures": [
            {"gesture": row.gesture_name, "count": row.count}
            for row in top_gestures
        ],
    }