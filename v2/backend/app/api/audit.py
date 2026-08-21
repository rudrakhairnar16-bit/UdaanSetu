from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AuditLog, User

router = APIRouter()


class AuditLogOut(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: int
    actor_id: Optional[int] = None
    detail: Optional[Dict[str, Any]] = None
    created_at: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AuditLogOut])
def list_audit_logs(
    skip: int = 0,
    limit: int = 100,
    entity_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    q = db.query(AuditLog)
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type)
    logs = q.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        AuditLogOut(
            id=log.id, action=log.action, entity_type=log.entity_type,
            entity_id=log.entity_id, actor_id=log.actor_id,
            detail=log.detail, created_at=str(log.created_at),
        )
        for log in logs
    ]


@router.get("/stats")
def audit_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    total = db.query(AuditLog).count()
    by_action = {}
    for action in ["created", "updated", "deleted", "seeded"]:
        by_action[action] = db.query(AuditLog).filter(AuditLog.action == action).count()
    by_entity = {}
    for etype in ["research", "innovation", "ipr", "startup", "mentor", "scheme", "incubator", "milestone", "system"]:
        by_entity[etype] = db.query(AuditLog).filter(AuditLog.entity_type == etype).count()
    return {"total": total, "by_action": by_action, "by_entity": by_entity}
