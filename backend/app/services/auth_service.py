"""
app/services/auth_service.py
─────────────────────────────
Authentication business logic — registration, login, and token refresh.
All DB interaction is async. Raises HTTPException on business errors
so routes stay thin.
"""
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.models.bot_config import BotConfig
from app.schemas.auth import RegisterRequest, TokenResponse, UserResponse


# ── Helpers ───────────────────────────────────────────────────────────────────
async def _get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def _get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


def _build_token_response(user_id: int) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
        expires_in=settings.jwt_access_token_expire_minutes * 60,
    )


# ── Registration ──────────────────────────────────────────────────────────────
async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    """
    Create a new user account and a default BotConfig for them.
    Raises 409 if the email is already registered.
    """
    existing = await _get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.flush()  # Get user.id without committing

    # Create a default bot config for the new user
    bot_config = BotConfig(user_id=user.id)
    db.add(bot_config)

    await db.commit()
    await db.refresh(user)
    return user


# ── Login ─────────────────────────────────────────────────────────────────────
async def login_user(db: AsyncSession, email: str, password: str) -> TokenResponse:
    """
    Validate credentials and return JWT tokens.
    Raises 401 with a generic message (never reveal which field is wrong).
    """
    _INVALID = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user = await _get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise _INVALID

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    return _build_token_response(user.id)


# ── Token Refresh ─────────────────────────────────────────────────────────────
async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenResponse:
    """Validate a refresh token and issue a new access token pair."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token.",
    )
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise credentials_error
        user_id: int = int(payload["sub"])
    except Exception:
        raise credentials_error

    user = await _get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise credentials_error

    return _build_token_response(user.id)


# ── Current User (from token) ─────────────────────────────────────────────────
async def get_current_user(db: AsyncSession, token: str) -> User:
    """Decode access token and return the associated User object."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_error
        user_id: int = int(payload["sub"])
    except Exception:
        raise credentials_error

    user = await _get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise credentials_error

    return user
