from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Application, Challenge, EligibilityCheck, ConflictOfInterest
from app.schemas import ApplicationIn, ApplicationOut, EligibilityCheckIn, EligibilityCheckOut
from app.utils import audit_entity

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationOut])
def list_applications(
    challenge_id: int = 0,
    status: str = "",
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(Application)
    if challenge_id:
        q = q.filter(Application.challenge_id == challenge_id)
    if status:
        q = q.filter(Application.status == status)
    return q.order_by(Application.created_at.desc()).all()


@router.get("/{app_id}", response_model=ApplicationOut)
def get_application(app_id: int, s: Session = Depends(db), u=Depends(current)):
    a = s.get(Application, app_id)
    if not a:
        raise HTTPException(404, "Application not found")
    return a


@router.post("", response_model=ApplicationOut)
def create_application(x: ApplicationIn, s: Session = Depends(db), u=Depends(authorize("startup", "admin", "govt_officer"))):
    challenge = s.get(Challenge, x.challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    if challenge.status != "open":
        raise HTTPException(400, "Challenge is not open for applications")
    from app.models import Record
    startup = s.query(Record).filter_by(kind="startup").first()
    if not startup:
        raise HTTPException(400, "No startup profile found")
    a = Application(
        challenge_id=x.challenge_id, startup_id=startup.id,
        proposal=x.proposal, proposed_budget=x.proposed_budget,
        proposed_timeline_weeks=x.proposed_timeline_weeks, meta=x.meta,
    )
    s.add(a)
    s.commit()
    s.refresh(a)
    audit_entity(s, u.id, "application", a.id, "created", {"challenge_id": a.challenge_id})
    return a


@router.patch("/{app_id}", response_model=ApplicationOut)
def update_application(app_id: int, x: ApplicationIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    a = s.get(Application, app_id)
    if not a:
        raise HTTPException(404, "Application not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(a, k, v)
    s.commit()
    s.refresh(a)
    audit_entity(s, u.id, "application", a.id, "updated", {"challenge_id": a.challenge_id})
    return a


@router.post("/{app_id}/submit")
def submit_application(app_id: int, s: Session = Depends(db), u=Depends(authorize("startup", "admin"))):
    a = s.get(Application, app_id)
    if not a:
        raise HTTPException(404, "Application not found")
    a.status = "submitted"
    s.commit()
    audit_entity(s, u.id, "application", a.id, "submitted", {"challenge_id": a.challenge_id})
    return {"message": "Application submitted", "status": a.status}


@router.delete("/{app_id}")
def delete_application(app_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    a = s.get(Application, app_id)
    if not a:
        raise HTTPException(404, "Application not found")
    s.delete(a)
    s.commit()
    audit_entity(s, u.id, "application", app_id, "deleted", {"challenge_id": a.challenge_id})
    return {"message": "Application deleted"}


# ── Eligibility Check ──

@router.post("/{app_id}/eligibility-check", response_model=EligibilityCheckOut)
def run_eligibility_check(app_id: int, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    a = s.get(Application, app_id)
    if not a:
        raise HTTPException(404, "Application not found")

    challenge = s.get(Challenge, a.challenge_id)
    meta = challenge.meta or {}
    target_districts = meta.get("target_districts", [])

    rules = {
        "dpiit_registered": True,
        "district_match": True,
        "budget_within_range": True,
    }
    failed = {}
    from app.models import Record
    startup = s.get(Record, a.startup_id)
    if startup:
        if not startup.meta.get("dpiit_registered", False):
            failed["dpiit_registered"] = "Startup not DPIIT-registered"
        if target_districts and startup.district not in target_districts:
            rules["district_match"] = False
            failed["district_match"] = f"Startup in {startup.district}, required: {target_districts}"

    result = "eligible" if not failed else "ineligible"
    check = EligibilityCheck(
        application_id=app_id, rules_checked=rules,
        result=result, failed_conditions=failed,
    )
    s.add(check)
    s.commit()
    s.refresh(check)
    audit_entity(s, u.id, "eligibility_check", check.id, "created", {"application_id": app_id, "result": result})
    return check


@router.post("/{app_id}/eligibility-override")
def override_eligibility(app_id: int, reason: str = "", s: Session = Depends(db), u=Depends(authorize("govt_officer", "admin"))):
    check = s.query(EligibilityCheck).filter_by(application_id=app_id).order_by(EligibilityCheck.id.desc()).first()
    if not check:
        raise HTTPException(404, "No eligibility check found")
    check.result = "conditional_review"
    check.override_reason = reason
    check.overridden_by = u.id
    s.commit()
    audit_entity(s, u.id, "eligibility_check", check.id, "overridden", {"application_id": app_id, "reason": reason})
    return {"message": "Eligibility overridden", "result": check.result}


@router.get("/{app_id}/eligibility", response_model=list[EligibilityCheckOut])
def get_eligibility_checks(app_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(EligibilityCheck).filter_by(application_id=app_id).all()


# ── Conflict of Interest ──

@router.post("/{app_id}/coi")
def declare_coi(app_id: int, x: dict = {}, s: Session = Depends(db), u=Depends(authorize("evaluator", "admin"))):
    existing = s.query(ConflictOfInterest).filter_by(
        evaluator_id=u.id, application_id=app_id
    ).first()
    if existing:
        existing.has_conflict = x.get("has_conflict", False)
        existing.declaration = x.get("declaration", "")
    else:
        coi = ConflictOfInterest(
            evaluator_id=u.id, application_id=app_id,
            has_conflict=x.get("has_conflict", False),
            declaration=x.get("declaration", ""),
        )
        s.add(coi)
    s.commit()
    audit_entity(s, u.id, "conflict_of_interest", coi.id if existing else 0, "declared", {"application_id": app_id, "has_conflict": x.get("has_conflict", False)})
    return {"message": "COI declared"}
