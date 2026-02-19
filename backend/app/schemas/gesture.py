from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class GestureRequest(BaseModel):
    """What the frontend sends — a base64 image frame."""
    image_base64: str
    session_id: str | None = None


class GestureResponse(BaseModel):
    """What we send back after detecting a gesture."""
    gesture_name: str
    confidence: float = Field(ge=0.0, le=1.0)  # Must be between 0 and 1
    latency_ms: float
    session_id: str | None = None


class GestureLogResponse(BaseModel):
    """What we send back when returning gesture history."""
    id: UUID
    gesture_name: str
    confidence: float
    latency_ms: float | None
    session_id: str | None
    detected_at: datetime

    model_config = {"from_attributes": True}