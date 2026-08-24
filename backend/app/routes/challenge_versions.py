from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Challenge, ChallengeVersion
from app.schemas import ChallengeVersionOut
from app.utils import audit_entity

router = APIRouter(prefix="/challenges", tags=["challenge-versions"])


@router.get("/{challenge_id}/versions", response_model=list[ChallengeVersionOut])
def list_challenge_versions(challenge_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(ChallengeVersion).filter_by(challenge_id=challenge_id).order_by(ChallengeVersion.version.desc()).all()


@router.post("/{challenge_id}/versions", response_model=ChallengeVersionOut)
def create_challenge_version(
    challenge_id: int, change_summary: str = "", s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    last = s.query(ChallengeVersion).filter_by(challenge_id=challenge_id).order_by(ChallengeVersion.version.desc()).first()
    next_ver = (last.version + 1) if last else 1
    snapshot = {
        "title": c.title, "description": c.description, "category": c.category,
        "status": c.status, "budget_range": c.budget_range, "timeline_weeks": c.timeline_weeks,
        "evaluation_criteria": c.evaluation_criteria, "district": c.district, "sector": c.sector,
        "meta": c.meta,
    }
    v = ChallengeVersion(
        challenge_id=challenge_id, version=next_ver, snapshot=snapshot,
        changed_by=u.id, change_summary=change_summary,
    )
    s.add(v)
    s.commit()
    s.refresh(v)
    audit_entity(s, u.id, "challenge_version", v.id, "created", {"challenge_id": challenge_id, "version": next_ver})
    return v


@router.post("/{challenge_id}/versions/{version_id}/restore")
def restore_challenge_version(
    challenge_id: int, version_id: int, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    v = s.get(ChallengeVersion, version_id)
    if not v or v.challenge_id != challenge_id:
        raise HTTPException(404, "Version not found")
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    snap = v.snapshot
    for field in ["title", "description", "category", "status", "budget_range", "timeline_weeks", "evaluation_criteria", "district", "sector", "meta"]:
        if field in snap:
            setattr(c, field, snap[field])
    s.commit()
    audit_entity(s, u.id, "challenge", c.id, "restored_version", {"version": v.version})
    return {"message": f"Challenge restored to version {v.version}"}
