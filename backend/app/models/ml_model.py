import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class MLModel(Base):
    __tablename__ = "ml_models"

    # ─── Primary Key ─────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # ─── Model Info ───────────────────────────────────────
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # ─── Timestamps ──────────────────────────────────────
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<MLModel {self.name} v{self.version}>"