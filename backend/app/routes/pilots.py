from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Pilot, PilotMilestone
from app.schemas import PilotIn, PilotOut, PilotMilestoneIn, PilotMilestoneOut
from app.utils import audit_entity

router = APIRouter(prefix="/pilots", tags=["pilots"])


@router.get("", response_model=list[PilotOut])
def list_pilots(
    status: str = "",
    challenge_id: int = 0,
    startup_id: int = 0,
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(Pilot)
    if status:
        q = q.filter(Pilot.status == status)
    if challenge_id:
        q = q.filter(Pilot.challenge_id == challenge_id)
    if startup_id:
        q = q.filter(Pilot.startup_id == startup_id)
    return q.order_by(Pilot.created_at.desc()).all()


@router.get("/{pilot_id}", response_model=PilotOut)
def get_pilot(pilot_id: int, s: Session = Depends(db), u=Depends(current)):
    p = s.get(Pilot, pilot_id)
    if not p:
        raise HTTPException(404, "Pilot not found")
    return p


@router.post("", response_model=PilotOut)
def create_pilot(x: PilotIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    p = Pilot(**x.model_dump(), owner_id=u.id)
    s.add(p)
    s.commit()
    s.refresh(p)
    audit_entity(s, u.id, "pilot", p.id, "created", {"challenge_id": p.challenge_id})
    return p


@router.patch("/{pilot_id}", response_model=PilotOut)
def update_pilot(
    pilot_id: int, x: PilotIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    p = s.get(Pilot, pilot_id)
    if not p:
        raise HTTPException(404, "Pilot not found")
    if p.owner_id != u.id and u.role != "admin":
        raise HTTPException(403, "Not authorized")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    s.commit()
    s.refresh(p)
    audit_entity(s, u.id, "pilot", p.id, "updated", {"challenge_id": p.challenge_id})
    return p


@router.delete("/{pilot_id}")
def delete_pilot(pilot_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    p = s.get(Pilot, pilot_id)
    if not p:
        raise HTTPException(404, "Pilot not found")
    s.delete(p)
    s.commit()
    audit_entity(s, u.id, "pilot", pilot_id, "deleted", {"challenge_id": p.challenge_id})
    return {"message": "Pilot deleted"}


@router.post("/{pilot_id}/start")
def start_pilot(pilot_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    p = s.get(Pilot, pilot_id)
    if not p:
        raise HTTPException(404, "Pilot not found")
    if p.status != "approved":
        raise HTTPException(400, "Pilot must be approved before starting")
    p.status = "active"
    p.start_date = datetime.now(timezone.utc)
    s.commit()
    audit_entity(s, u.id, "pilot", p.id, "started", {"challenge_id": p.challenge_id})
    return {"message": "Pilot started", "status": p.status}


@router.post("/{pilot_id}/approve")
def approve_pilot(pilot_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    p = s.get(Pilot, pilot_id)
    if not p:
        raise HTTPException(404, "Pilot not found")
    if p.status != "proposed":
        raise HTTPException(400, "Pilot must be in proposed status")
    p.status = "approved"
    s.commit()
    audit_entity(s, u.id, "pilot", p.id, "approved", {"challenge_id": p.challenge_id})
    return {"message": "Pilot approved", "status": p.status}


@router.post("/{pilot_id}/complete")
def complete_pilot(pilot_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    p = s.get(Pilot, pilot_id)
    if not p:
        raise HTTPException(404, "Pilot not found")
    if p.status != "active":
        raise HTTPException(400, "Pilot must be active")
    p.status = "completed"
    p.end_date = datetime.now(timezone.utc)
    s.commit()
    audit_entity(s, u.id, "pilot", p.id, "completed", {"challenge_id": p.challenge_id})
    return {"message": "Pilot completed", "status": p.status}


# Milestone endpoints
@router.get("/{pilot_id}/milestones", response_model=list[PilotMilestoneOut])
def list_milestones(pilot_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(PilotMilestone).filter_by(pilot_id=pilot_id).order_by(PilotMilestone.created_at).all()


@router.post("/{pilot_id}/milestones", response_model=PilotMilestoneOut)
def create_milestone(
    pilot_id: int, x: PilotMilestoneIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    m = PilotMilestone(**x.model_dump())
    s.add(m)
    s.commit()
    s.refresh(m)
    return m


@router.patch("/milestones/{milestone_id}", response_model=PilotMilestoneOut)
def update_milestone(
    milestone_id: int, x: PilotMilestoneIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    m = s.get(PilotMilestone, milestone_id)
    if not m:
        raise HTTPException(404, "Milestone not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    s.commit()
    s.refresh(m)
    return m


@router.post("/milestones/{milestone_id}/approve")
def approve_milestone(
    milestone_id: int, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    m = s.get(PilotMilestone, milestone_id)
    if not m:
        raise HTTPException(404, "Milestone not found")
    m.approval_status = "approved"
    m.approved_by = u.id
    m.approved_at = datetime.now(timezone.utc)
    s.commit()
    return {"message": "Milestone approved", "status": m.approval_status}


@router.post("/milestones/{milestone_id}/complete")
def complete_milestone(
    milestone_id: int, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    m = s.get(PilotMilestone, milestone_id)
    if not m:
        raise HTTPException(404, "Milestone not found")
    m.completed_date = datetime.now(timezone.utc)
    s.commit()
    return {"message": "Milestone completed"}
