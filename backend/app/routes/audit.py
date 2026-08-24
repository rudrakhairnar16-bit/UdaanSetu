import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.dependencies import authorize, db
from app.models import AuditLog
from app.schemas import AuditOut

router = APIRouter(tags=["audit"])


@router.get("/audit", response_model=list[AuditOut])
def audit_log(limit: int = Query(100, le=500), s: Session = Depends(db), u=Depends(authorize("admin"))):
    return s.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()


@router.get("/audit/export")
def export_audit_logs(
    entity_type: str = None,
    action: str = None,
    limit: int = 1000,
    s: Session = Depends(db),
    u=Depends(authorize("admin", "auditor")),
):
    q = s.query(AuditLog)
    if entity_type:
        q = q.filter(AuditLog.entity == entity_type)
    if action:
        q = q.filter(AuditLog.action == action)
    logs = q.order_by(AuditLog.created_at.desc()).limit(limit).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "actor_id", "entity", "entity_id", "action", "detail", "timestamp"])
    for log in logs:
        writer.writerow([
            log.id, log.actor_id, log.entity, log.entity_id,
            log.action, str(log.detail), str(log.created_at),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_export.csv"},
    )
