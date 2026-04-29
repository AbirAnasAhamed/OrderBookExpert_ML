"""
app/schemas/auth.py
────────────────────
Pydantic v2 schemas for authentication endpoints.
Separate Request and Response models to control exactly
what data is accepted and returned.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Registration ──────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name:     str      = Field(..., min_length=2, max_length=100, examples=["Alice"])
    email:    EmailStr = Field(...,               examples=["alice@example.com"])
    password: str      = Field(..., min_length=8, examples=["StrongP@ss1"])

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class RegisterResponse(BaseModel):
    id:         int
    name:       str
    email:      str
    role:       str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Login ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    EmailStr = Field(..., examples=["alice@example.com"])
    password: str      = Field(..., examples=["StrongP@ss1"])


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    expires_in:    int          # seconds until access token expiry


# ── Refresh ───────────────────────────────────────────────────────────────────
class RefreshRequest(BaseModel):
    refresh_token: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"


# ── Current User ──────────────────────────────────────────────────────────────
class UserResponse(BaseModel):
    id:         int
    name:       str
    email:      str
    role:       str
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}
