from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import pwd, current, authorize, create_token, token_hash, bearer, db
from app.models import User, TokenBlacklist
from app.schemas import LoginIn, RegisterIn, ProfileUpdate, ChangePasswordIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(x: LoginIn, s: Session = Depends(db)):
    u = s.query(User).filter_by(email=x.email).first()
    if not u or not pwd.verify(x.password, u.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    t = create_token(u)
    return {"access_token": t, "token_type": "bearer", "user": UserOut.model_validate(u)}


@router.post("/register")
def register(x: RegisterIn, s: Session = Depends(db)):
    from app.models import VALID_ROLES
    if x.role not in VALID_ROLES:
        raise HTTPException(400, f"Invalid role: {x.role}")
    if s.query(User).filter_by(email=x.email).first():
        raise HTTPException(409, "Email already registered")
    u = User(
        name=x.name, email=x.email,
        password_hash=pwd.hash(x.password),
        role=x.role, district=x.district, organization=x.organization,
    )
    s.add(u)
    s.commit()
    s.refresh(u)
    t = create_token(u)
    return {"access_token": t, "token_type": "bearer", "user": UserOut.model_validate(u)}


@router.post("/logout")
def logout(
    u=Depends(current),
    cred: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    s: Session = Depends(db),
):
    if cred:
        s.add(TokenBlacklist(token_hash=token_hash(cred.credentials)))
        s.commit()
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def me(u=Depends(current)):
    return u


@router.patch("/me", response_model=UserOut)
def update_profile(x: ProfileUpdate, u=Depends(current), s: Session = Depends(db)):
    if x.name is not None:
        u.name = x.name.strip()
    if x.district is not None:
        u.district = x.district.strip()
    if x.organization is not None:
        u.organization = x.organization.strip()
    s.commit()
    s.refresh(u)
    return u


@router.post("/change-password")
def change_password(x: ChangePasswordIn, u=Depends(current), s: Session = Depends(db)):
    if not pwd.verify(x.current_password, u.password_hash):
        raise HTTPException(401, "Current password is incorrect")
    u.password_hash = pwd.hash(x.new_password)
    s.commit()
    return {"message": "Password changed successfully"}


@router.get("/users", response_model=list[UserOut])
def list_users(s: Session = Depends(db), u=Depends(authorize("admin"))):
    return s.query(User).all()
