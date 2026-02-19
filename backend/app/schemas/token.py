from pydantic import BaseModel


class Token(BaseModel):
    """What we send back after successful login."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """What's inside the JWT token."""
    sub: str | None = None