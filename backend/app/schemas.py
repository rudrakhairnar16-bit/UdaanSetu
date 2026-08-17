import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

from app.utils import sanitize_input


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "researcher"
    district: str = ""
    organization: str = ""

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 120:
            raise ValueError("Name must be 120 characters or fewer")
        return sanitize_input(v)


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    organization: Optional[str] = None


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        errors = []
        if len(v) < 8:
            errors.append("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            errors.append("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            errors.append("Password must contain at least one digit")
        if errors:
            raise ValueError("; ".join(errors))
        return v


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    district: str
    organization: str = ""
    model_config = ConfigDict(from_attributes=True)


class ItemIn(BaseModel):
    title: str
    description: str = ""
    stage: str = "Draft"
    district: str = ""
    sector: str = ""
    parent_id: Optional[int] = None
    meta: dict = {}

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Title is required")
        if len(v) > 240:
            raise ValueError("Title must be 240 characters or fewer")
        return sanitize_input(v)

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        if len(v) > 10000:
            raise ValueError("Description must be 10000 characters or fewer")
        return sanitize_input(v)

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v: str) -> str:
        return sanitize_input(v)


class ItemOut(BaseModel):
    id: int
    kind: str
    title: str
    description: str
    stage: str
    district: str
    sector: str
    owner_id: Optional[int]
    parent_id: Optional[int]
    meta: dict
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class NotifOut(BaseModel):
    id: int
    message: str
    kind: str
    read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AuditOut(BaseModel):
    id: int
    action: str
    entity: str
    entity_id: int
    actor_id: Optional[int]
    detail: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
