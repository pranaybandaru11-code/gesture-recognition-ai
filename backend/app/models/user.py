import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    # ─── Primary Key ─────────────────────────────────────
    # UUID is better than 1,2,3... for security
    # (attackers can't guess other user IDs)
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # ─── User Info ───────────────────────────────────────
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # ─── Timestamps ──────────────────────────────────────
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ─── Relationships ───────────────────────────────────
    # One user can have many gesture logs
    gesture_logs = relationship("GestureLog", back_populates="user")

    def __repr__(self) -> str:
        return f"<User {self.email}>"