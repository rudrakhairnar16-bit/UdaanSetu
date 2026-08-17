from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import authorize, db
from app.models import AuditLog
from app.schemas import AuditOut

router = APIRouter(tags=["audit"])


@router.get("/audit", response_model=list[AuditOut])
def audit_log(limit: int = Query(100, le=500), s: Session = Depends(db), u=Depends(authorize("admin"))):
    return s.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
