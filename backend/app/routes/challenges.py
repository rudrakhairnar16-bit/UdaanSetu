from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Challenge, User
from app.schemas import ChallengeIn, ChallengeOut
from app.utils import audit_entity

router = APIRouter(prefix="/challenges", tags=["challenges"])


def check_eligibility_period(challenge):
    """Check if challenge is within its eligibility period."""
    from datetime import datetime
    now = datetime.utcnow()
    if hasattr(challenge, "eligibility") and isinstance(challenge.eligibility, dict):
        start = challenge.eligibility.get("start_date")
        end = challenge.eligibility.get("end_date")
        if start and now < datetime.fromisoformat(start):
            return False, "Challenge not yet open for applications"
        if end and now > datetime.fromisoformat(end):
            return False, "Challenge eligibility period has ended"
    return True, "OK"


@router.get("", response_model=list[ChallengeOut])
def list_challenges(
    category: str = "",
    district: str = "",
    sector: str = "",
    status: str = "",
    department_id: int = 0,
    q: str = "",
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(Challenge)
    if category:
        q = q.filter(Challenge.category == category)
    if district:
        q = q.filter(Challenge.district == district)
    if sector:
        q = q.filter(Challenge.sector == sector)
    if status:
        q = q.filter(Challenge.status == status)
    if department_id:
        q = q.filter(Challenge.department_id == department_id)
    if q_text := (q or "").strip():
        q = q.filter(
            Challenge.title.ilike(f"%{q_text}%")
            | Challenge.description.ilike(f"%{q_text}%")
        )
    return q.order_by(Challenge.created_at.desc()).all()


@router.get("/{challenge_id}", response_model=ChallengeOut)
def get_challenge(challenge_id: int, s: Session = Depends(db), u=Depends(current)):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    return c


@router.post("", response_model=ChallengeOut)
def create_challenge(x: ChallengeIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    data = x.model_dump()

    # Template auto-population
    template_id = data.pop("template_id", None)
    if template_id:
        from app.models import Template
        tmpl = s.get(Template, template_id)
        if tmpl and tmpl.meta:
            if not data.get("department_id") and tmpl.meta.get("default_department"):
                data["department_id"] = tmpl.meta["default_department"]
            if not data.get("sector") and tmpl.meta.get("sector"):
                data["sector"] = tmpl.meta["sector"]
            if not data.get("evaluation_criteria") and tmpl.content:
                data["evaluation_criteria"] = tmpl.content

    c = Challenge(**data, owner_id=u.id)
    s.add(c)
    s.commit()
    s.refresh(c)
    audit_entity(s, u.id, "challenge", c.id, "created", {"title": c.title})
    return c


@router.patch("/{challenge_id}", response_model=ChallengeOut)
def update_challenge(
    challenge_id: int, x: ChallengeIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    if c.owner_id != u.id and u.role != "admin":
        raise HTTPException(403, "Not authorized")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    s.commit()
    s.refresh(c)
    audit_entity(s, u.id, "challenge", c.id, "updated", {"title": c.title})
    return c


@router.delete("/{challenge_id}")
def delete_challenge(challenge_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    s.delete(c)
    s.commit()
    audit_entity(s, u.id, "challenge", challenge_id, "deleted", {"title": c.title})
    return {"message": "Challenge deleted"}


@router.post("/{challenge_id}/validate")
def validate_challenge(challenge_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    c.status = "validated"
    s.commit()
    audit_entity(s, u.id, "challenge", c.id, "validated", {"title": c.title})
    return {"message": "Challenge validated", "status": c.status}


@router.post("/{challenge_id}/publish")
def publish_challenge(challenge_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    c.status = "published"
    s.commit()
    audit_entity(s, u.id, "challenge", c.id, "published", {"title": c.title})
    return {"message": "Challenge published", "status": c.status}


@router.post("/{challenge_id}/award")
def award_challenge(challenge_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    c.status = "awarded"
    s.commit()
    audit_entity(s, u.id, "challenge", c.id, "awarded", {"title": c.title})
    return {"message": "Challenge awarded", "status": c.status}


@router.post("/{challenge_id}/close")
def close_challenge(challenge_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    c = s.get(Challenge, challenge_id)
    if not c:
        raise HTTPException(404, "Challenge not found")
    c.status = "closed"
    s.commit()
    audit_entity(s, u.id, "challenge", c.id, "closed", {"title": c.title})
    return {"message": "Challenge closed", "status": c.status}


@router.get("/my", response_model=list[ChallengeOut])
def my_challenges(s: Session = Depends(db), u=Depends(current)):
    return s.query(Challenge).filter_by(owner_id=u.id).order_by(Challenge.created_at.desc()).all()
