from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Grievance
from app.schemas import GrievanceIn, GrievanceOut
from app.utils import audit_entity

router = APIRouter(prefix="/grievances", tags=["grievances"])


@router.get("", response_model=list[GrievanceOut])
def list_grievances(status: str = "", s: Session = Depends(db), u=Depends(current)):
    q = s.query(Grievance)
    if status:
        q = q.filter(Grievance.status == status)
    return q.order_by(Grievance.created_at.desc()).all()


@router.get("/{gr_id}", response_model=GrievanceOut)
def get_grievance(gr_id: int, s: Session = Depends(db), u=Depends(current)):
    g = s.get(Grievance, gr_id)
    if not g:
        raise HTTPException(404, "Grievance not found")
    return g


@router.post("", response_model=GrievanceOut)
def create_grievance(x: GrievanceIn, s: Session = Depends(db), u=Depends(authorize("startup", "admin"))):
    from app.models import Record
    startup = s.query(Record).filter_by(kind="startup").first()
    g = Grievance(
        startup_id=startup.id if startup else 0,
        challenge_id=x.challenge_id, pilot_id=x.pilot_id,
        category=x.category, subject=x.subject,
        description=x.description, meta=x.meta,
    )
    s.add(g)
    s.commit()
    s.refresh(g)
    audit_entity(s, u.id, "grievance", g.id, "created", {"subject": g.subject, "category": g.category})
    return g


@router.patch("/{gr_id}", response_model=GrievanceOut)
def update_grievance(gr_id: int, x: dict, s: Session = Depends(db), u=Depends(authorize("govt_officer", "admin"))):
    g = s.get(Grievance, gr_id)
    if not g:
        raise HTTPException(404, "Grievance not found")
    if "status" in x:
        g.status = x["status"]
    if "resolution" in x:
        g.resolution = x["resolution"]
    if "assigned_to" in x:
        g.assigned_to = x["assigned_to"]
    s.commit()
    s.refresh(g)
    audit_entity(s, u.id, "grievance", g.id, "updated", {"status": g.status})
    return g


@router.delete("/{gr_id}")
def delete_grievance(gr_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    g = s.get(Grievance, gr_id)
    if not g:
        raise HTTPException(404, "Grievance not found")
    s.delete(g)
    s.commit()
    audit_entity(s, u.id, "grievance", gr_id, "deleted", {"subject": g.subject})
    return {"message": "Grievance deleted"}


# ── SLA Escalation ──

@router.get("/sla/check")
def check_sla_breaches(s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    open_grievances = s.query(Grievance).filter(Grievance.status.in_(["open", "in_progress"])).all()
    breaches = []
    for g in open_grievances:
        age_days = (now - g.created_at).days
        if age_days > g.sla_days:
            escalation_level = min(3, (age_days - g.sla_days) // 5 + 1)
            breaches.append({
                "id": g.id, "subject": g.subject, "category": g.category,
                "age_days": age_days, "sla_days": g.sla_days,
                "overdue_days": age_days - g.sla_days,
                "escalation_level": escalation_level,
                "status": g.status, "assigned_to": g.assigned_to,
            })
    breaches.sort(key=lambda x: -x["overdue_days"])
    return {
        "label": "SLA Breach Check",
        "total_open": len(open_grievances),
        "breaches": breaches,
        "breach_count": len(breaches),
    }


@router.post("/{gr_id}/escalate")
def escalate_grievance(gr_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    from datetime import datetime
    g = s.get(Grievance, gr_id)
    if not g:
        raise HTTPException(404, "Grievance not found")
    age_days = (datetime.utcnow() - g.created_at).days
    escalation_level = min(3, (age_days - g.sla_days) // 5 + 1) if age_days > g.sla_days else 1
    g.status = "escalated"
    g.meta = {**g.meta, "escalated_at": datetime.utcnow().isoformat(), "escalation_level": escalation_level}
    s.commit()
    audit_entity(s, u.id, "grievance", g.id, "escalated", {"level": escalation_level, "age_days": age_days})
    return {"message": f"Grievance escalated to level {escalation_level}", "escalation_level": escalation_level}
