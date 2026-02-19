from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.gesture import GestureRequest, GestureResponse, GestureLogResponse
from app.services.ml_client import ml_client
from app.models.gesture_log import GestureLog
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/predict", response_model=GestureResponse)
async def predict_gesture(
    request: GestureRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Predict a gesture from a base64 image.
    Saves the result to the database for analytics.
    """
    result = await ml_client.predict(request.image_base64)

    # Save to database
    log = GestureLog(
        user_id=current_user.id,
        gesture_name=result["gesture_name"],
        confidence=result["confidence"],
        latency_ms=result.get("latency_ms", 0),
        session_id="web_session",
    )
    db.add(log)
    await db.commit()

    return result


@router.post("/ml/predict-face")
async def predict_face_direction(request: GestureRequest):
    """Face direction detection for face-controlled snake"""
    result = await ml_client.predict_face(request.image_base64)
    return result


@router.get("/history", response_model=List[GestureLogResponse])
async def get_gesture_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50,
):
    """
    Get recent gesture detection history for the current user.
    """
    from sqlalchemy import select

    stmt = (
        select(GestureLog)
        .where(GestureLog.user_id == current_user.id)
        .order_by(GestureLog.detected_at.desc())
        .limit(limit)
    )

    result = await db.execute(stmt)
    logs = result.scalars().all()

    return [
        GestureLogResponse(
            id=log.id,
            gesture_name=log.gesture_name,
            confidence=log.confidence,
            latency_ms=log.latency_ms,
            detected_at=log.detected_at,
        )
        for log in logs
    ]