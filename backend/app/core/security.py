"""
app/core/security.py
─────────────────────
JWT token creation/verification and bcrypt password hashing.
All cryptographic operations are centralised here for easy auditing.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# ── Password Hashing ──────────────────────────────────────────────────────────
def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of the given plain-text password."""
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


# ── JWT Helpers ───────────────────────────────────────────────────────────────
def _create_token(subject: Any, token_type: str, expires_delta: timedelta) -> str:
    """Internal helper: create a signed JWT with the given expiry."""
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": str(subject),
        "type": token_type,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: int) -> str:
    """Create a short-lived access token (default: 60 minutes)."""
    return _create_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=settings.jwt_access_token_expire_minutes),
    )


def create_refresh_token(user_id: int) -> str:
    """Create a long-lived refresh token (default: 7 days)."""
    return _create_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=settings.jwt_refresh_token_expire_days),
    )


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT.
    Raises jose.JWTError if the token is invalid, expired, or tampered.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError as exc:
        raise exc
