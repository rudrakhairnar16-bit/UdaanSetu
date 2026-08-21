from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON, Boolean, Index
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    researcher = "researcher"
    mentor = "mentor"
    investor = "investor"
    incubator = "incubator"

class EntityKind(str, enum.Enum):
    research = "research"
    innovation = "innovation"
    ipr = "ipr"
    startup = "startup"
    milestone = "milestone"
    mentor = "mentor"
    scheme = "scheme"
    incubator = "incubator"
    funding_request = "funding_request"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.researcher)
    district = Column(String(100), nullable=True)
    organization = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    entities = relationship("Entity", back_populates="owner")
    notifications = relationship("Notification", back_populates="user")

class Entity(Base):
    __tablename__ = "entities"
    
    id = Column(Integer, primary_key=True, index=True)
    kind = Column(SQLEnum(EntityKind), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    stage = Column(String(100), nullable=False, index=True)
    sector = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True, index=True)
    meta = Column(JSON, nullable=True)
    is_demo = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("entities.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="entities")
    parent = relationship("Entity", remote_side=[id], backref="children")
    milestones = relationship("Milestone", back_populates="entity")
    notifications = relationship("Notification", back_populates="entity")

class Milestone(Base):
    __tablename__ = "milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    stage = Column(String(100), nullable=False, default="Pending")
    due_date = Column(DateTime, nullable=True)
    progress = Column(Integer, default=0)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    entity = relationship("Entity", back_populates="milestones")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id"), nullable=True)
    kind = Column(String(50), nullable=False)  # info, action, warning, system
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="notifications")
    entity = relationship("Entity", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    detail = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    
    id = Column(Integer, primary_key=True, index=True)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Indexes for performance
Index('ix_entities_kind_stage_district', Entity.kind, Entity.stage, Entity.district)
Index('ix_entities_owner_kind', Entity.owner_id, Entity.kind)
Index('ix_notifications_user_read', Notification.user_id, Notification.read)