import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class GestureLog(Base):
    __tablename__ = "gesture_logs"

    # ─── Primary Key ─────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # ─── Foreign Key ─────────────────────────────────────
    # Links each gesture log to the user who made it
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # ─── Gesture Data ─────────────────────────────────────
    gesture_name = Column(String, nullable=False, index=True)
    confidence = Column(Float, nullable=False)   # 0.0 to 1.0
    latency_ms = Column(Float, nullable=True)    # How fast ML responded
    session_id = Column(String, nullable=True, index=True)

    # ─── Timestamps ──────────────────────────────────────
    detected_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True
    )

    # ─── Relationships ───────────────────────────────────
    user = relationship("User", back_populates="gesture_logs")

    def __repr__(self) -> str:
        return f"<GestureLog {self.gesture_name} ({self.confidence})>"