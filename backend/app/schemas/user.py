from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    """Data required to register a new user."""
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    """Data required to log in."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """What we send back when returning user info.
    Notice: no password field — never expose that!
    """
    id: UUID
    email: str
    username: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}