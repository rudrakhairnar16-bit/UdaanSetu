from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import PilotIncident, Pilot
from app.utils import audit_entity

router = APIRouter(prefix="/pilot-incidents", tags=["pilot-incidents"])


@router.get("/pilot/{pilot_id}")
def list_incidents(pilot_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(PilotIncident).filter_by(pilot_id=pilot_id).order_by(PilotIncident.created_at.desc()).all()


@router.post("/pilot/{pilot_id}")
def create_incident(
    pilot_id: int, title: str = "", description: str = "", severity: str = "low",
    s: Session = Depends(db), u=Depends(authorize("startup", "govt_officer", "admin")),
):
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")
    inc = PilotIncident(pilot_id=pilot_id, title=title, description=description, severity=severity, reported_by=u.id)
    s.add(inc)
    s.commit()
    s.refresh(inc)
    audit_entity(s, u.id, "pilot_incident", inc.id, "created", {"pilot_id": pilot_id, "severity": severity})
    return {"id": inc.id, "title": inc.title, "severity": inc.severity, "status": inc.status}


@router.patch("/{incident_id}")
def update_incident(
    incident_id: int, x: dict, s: Session = Depends(db),
    u=Depends(authorize("govt_officer", "admin")),
):
    inc = s.get(PilotIncident, incident_id)
    if not inc:
        raise HTTPException(404, "Incident not found")
    if "status" in x:
        inc.status = x["status"]
    if "resolution" in x:
        inc.resolution = x["resolution"]
    if inc.status == "resolved":
        inc.resolved_at = datetime.utcnow()
    s.commit()
    audit_entity(s, u.id, "pilot_incident", inc.id, "updated", {"status": inc.status})
    return {"id": inc.id, "status": inc.status, "resolution": inc.resolution}
