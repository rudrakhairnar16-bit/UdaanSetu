from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_user,
)
from app.models.models import User
from app.schemas.schemas import (
    UserCreate, UserResponse, Token, LoginRequest, ChangePasswordRequest, UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed,
        name=user_data.name,
        role=user_data.role,
        district=user_data.district,
        organization=user_data.organization,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse.from_orm(user)}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse.from_orm(user)}


@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)


@router.patch("/me", response_model=UserResponse)
def update_profile(update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if update.name:
        current_user.name = update.name
    if update.district:
        current_user.district = update.district
    if update.organization:
        current_user.organization = update.organization
    from datetime import datetime
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return UserResponse.from_orm(current_user)


@router.post("/change-password")
def change_password(request: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(request.new_password)
    from datetime import datetime
    current_user.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Password changed successfully"}
