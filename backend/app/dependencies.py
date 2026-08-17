import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import User, TokenBlacklist

pwd = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)


def db():
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()


def create_token(user: User) -> str:
    return jwt.encode(
        {
            "sub": str(user.id),
            "role": user.role,
            "name": user.name,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiry_hours),
        },
        settings.secret_key,
        algorithm="HS256",
    )


def token_hash(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()


def current(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    s: Session = Depends(db),
):
    if not cred:
        raise HTTPException(401, "Authentication required")
    try:
        data = jwt.decode(cred.credentials, settings.secret_key, algorithms=["HS256"])
        if s.query(TokenBlacklist).filter_by(token_hash=token_hash(cred.credentials)).first():
            raise HTTPException(401, "Token has been revoked")
        u = s.get(User, int(data["sub"]))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    if not u:
        raise HTTPException(401, "User unavailable")
    return u


def authorize(*roles):
    def inner(u=Depends(current)):
        if u.role not in roles:
            raise HTTPException(403, "Your role cannot perform this action")
        return u
    return inner
