from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Challenge, ChallengeRequirement
from app.schemas import ChallengeRequirementIn, ChallengeRequirementOut
from app.utils import audit_entity

router = APIRouter(prefix="/challenges", tags=["challenge-requirements"])


@router.get("/{challenge_id}/requirements", response_model=list[ChallengeRequirementOut])
def list_requirements(challenge_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(ChallengeRequirement).filter_by(challenge_id=challenge_id).order_by(ChallengeRequirement.id).all()


@router.post("/{challenge_id}/requirements", response_model=ChallengeRequirementOut)
def create_requirement(
    challenge_id: int, x: ChallengeRequirementIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    r = ChallengeRequirement(challenge_id=challenge_id, **x.model_dump())
    s.add(r)
    s.commit()
    s.refresh(r)
    audit_entity(s, u.id, "challenge_requirement", r.id, "created", {"challenge_id": challenge_id, "key": r.key})
    return r


@router.patch("/{challenge_id}/requirements/{req_id}", response_model=ChallengeRequirementOut)
def update_requirement(
    challenge_id: int, req_id: int, x: ChallengeRequirementIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    r = s.get(ChallengeRequirement, req_id)
    if not r or r.challenge_id != challenge_id:
        raise HTTPException(404, "Requirement not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    s.commit()
    s.refresh(r)
    audit_entity(s, u.id, "challenge_requirement", r.id, "updated", {"challenge_id": challenge_id})
    return r


@router.delete("/{challenge_id}/requirements/{req_id}")
def delete_requirement(challenge_id: int, req_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    r = s.get(ChallengeRequirement, req_id)
    if not r or r.challenge_id != challenge_id:
        raise HTTPException(404, "Requirement not found")
    s.delete(r)
    s.commit()
    audit_entity(s, u.id, "challenge_requirement", req_id, "deleted", {"challenge_id": challenge_id})
    return {"message": "Requirement deleted"}
