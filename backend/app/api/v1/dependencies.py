"""
app/api/v1/dependencies.py
───────────────────────────
Reusable FastAPI dependencies injected into protected route handlers.
`get_current_user` extracts and validates the Bearer JWT from every request.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user as _resolve_user

_bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency — extracts Bearer token, decodes JWT, and
    returns the authenticated User ORM object.
    Raises 401 if the token is missing, invalid, or expired.
    """
    return await _resolve_user(db, credentials.credentials)
