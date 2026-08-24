from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import ScaleUpDecision
from app.schemas import ScaleUpDecisionIn, ScaleUpDecisionOut
from app.utils import audit_entity

router = APIRouter(prefix="/scale-up-decisions", tags=["scale-up-decisions"])


@router.get("", response_model=list[ScaleUpDecisionOut])
def list_scale_up_decisions(
    pilot_id: int = 0,
    decision: str = "",
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(ScaleUpDecision)
    if pilot_id:
        q = q.filter(ScaleUpDecision.pilot_id == pilot_id)
    if decision:
        q = q.filter(ScaleUpDecision.decision == decision)
    return q.order_by(ScaleUpDecision.created_at.desc()).all()


@router.get("/{decision_id}", response_model=ScaleUpDecisionOut)
def get_scale_up_decision(decision_id: int, s: Session = Depends(db), u=Depends(current)):
    d = s.get(ScaleUpDecision, decision_id)
    if not d:
        raise HTTPException(404, "Scale-up decision not found")
    return d


@router.post("", response_model=ScaleUpDecisionOut)
def create_scale_up_decision(x: ScaleUpDecisionIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    d = ScaleUpDecision(**x.model_dump(), decided_by=u.id, decided_at=datetime.now(timezone.utc))
    s.add(d)
    s.commit()
    s.refresh(d)
    audit_entity(s, u.id, "scale_up_decision", d.id, "created", {"pilot_id": d.pilot_id, "decision": d.decision})
    return d


@router.patch("/{decision_id}", response_model=ScaleUpDecisionOut)
def update_scale_up_decision(
    decision_id: int, x: ScaleUpDecisionIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    d = s.get(ScaleUpDecision, decision_id)
    if not d:
        raise HTTPException(404, "Scale-up decision not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(d, k, v)
    s.commit()
    s.refresh(d)
    audit_entity(s, u.id, "scale_up_decision", d.id, "updated", {"pilot_id": d.pilot_id})
    return d


@router.delete("/{decision_id}")
def delete_scale_up_decision(decision_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    d = s.get(ScaleUpDecision, decision_id)
    if not d:
        raise HTTPException(404, "Scale-up decision not found")
    s.delete(d)
    s.commit()
    audit_entity(s, u.id, "scale_up_decision", decision_id, "deleted", {"pilot_id": d.pilot_id})
    return {"message": "Scale-up decision deleted"}
