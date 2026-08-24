from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Validation, Pilot, PilotMetric, PilotEvidence
from app.schemas import ValidationIn, ValidationOut, PilotMetricIn, PilotMetricOut, PilotEvidenceIn, PilotEvidenceOut
from app.utils import audit_entity

router = APIRouter(prefix="/validations", tags=["validations"])


@router.get("", response_model=list[ValidationOut])
def list_validations(s: Session = Depends(db), u=Depends(current)):
    return s.query(Validation).order_by(Validation.created_at.desc()).all()


@router.get("/{val_id}", response_model=ValidationOut)
def get_validation(val_id: int, s: Session = Depends(db), u=Depends(current)):
    v = s.get(Validation, val_id)
    if not v:
        raise HTTPException(404, "Validation not found")
    return v


@router.post("", response_model=ValidationOut)
def create_validation(x: ValidationIn, pilot_id: int = 0, s: Session = Depends(db), u=Depends(authorize("validator", "admin"))):
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")
    v = Validation(
        pilot_id=pilot_id, validator_id=u.id,
        outcome=x.outcome, recommendation=x.recommendation,
        scores=x.scores, evidence_review=x.evidence_review,
        rationale=x.rationale,
        kpi_achievement_pct=x.kpi_achievement_pct,
        cost_efficiency_pct=x.cost_efficiency_pct,
        security_score=x.security_score,
        scalability_score=x.scalability_score,
        meta=x.meta,
    )
    s.add(v)
    s.commit()
    s.refresh(v)
    audit_entity(s, u.id, "validation", v.id, "created", {"pilot_id": pilot_id, "outcome": v.outcome})
    return v


@router.patch("/{val_id}", response_model=ValidationOut)
def update_validation(val_id: int, x: ValidationIn, s: Session = Depends(db), u=Depends(authorize("validator", "admin"))):
    v = s.get(Validation, val_id)
    if not v:
        raise HTTPException(404, "Validation not found")
    for k, val in x.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    from datetime import datetime
    v.validated_at = datetime.utcnow()
    s.commit()
    s.refresh(v)
    audit_entity(s, u.id, "validation", v.id, "updated", {"pilot_id": v.pilot_id, "outcome": v.outcome})
    return v


@router.delete("/{val_id}")
def delete_validation(val_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    v = s.get(Validation, val_id)
    if not v:
        raise HTTPException(404, "Validation not found")
    s.delete(v)
    s.commit()
    audit_entity(s, u.id, "validation", val_id, "deleted", {"pilot_id": v.pilot_id})
    return {"message": "Validation deleted"}


# ── Pilot Metrics ──

@router.get("/pilot/{pilot_id}/metrics", response_model=list[PilotMetricOut])
def list_pilot_metrics(pilot_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(PilotMetric).filter_by(pilot_id=pilot_id).all()


@router.post("/pilot/{pilot_id}/metrics", response_model=PilotMetricOut)
def create_pilot_metric(pilot_id: int, x: PilotMetricIn, s: Session = Depends(db), u=Depends(authorize("govt_officer", "admin"))):
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")
    m = PilotMetric(pilot_id=pilot_id, **x.model_dump())
    s.add(m)
    s.commit()
    s.refresh(m)
    return m


@router.patch("/metrics/{metric_id}", response_model=PilotMetricOut)
def update_pilot_metric(metric_id: int, x: dict, s: Session = Depends(db), u=Depends(authorize("govt_officer", "admin"))):
    m = s.get(PilotMetric, metric_id)
    if not m:
        raise HTTPException(404, "Metric not found")
    if "actual_value" in x:
        m.actual_value = x["actual_value"]
    if "status" in x:
        m.status = x["status"]
    s.commit()
    s.refresh(m)
    return m


# ── Pilot Evidence ──

@router.get("/pilot/{pilot_id}/evidence", response_model=list[PilotEvidenceOut])
def list_pilot_evidence(pilot_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(PilotEvidence).filter_by(pilot_id=pilot_id).all()


@router.post("/pilot/{pilot_id}/evidence", response_model=PilotEvidenceOut)
def create_pilot_evidence(pilot_id: int, x: PilotEvidenceIn, s: Session = Depends(db), u=Depends(authorize("startup", "govt_officer", "admin"))):
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")
    e = PilotEvidence(pilot_id=pilot_id, submitted_by=u.id, **x.model_dump())
    s.add(e)
    s.commit()
    s.refresh(e)
    return e
