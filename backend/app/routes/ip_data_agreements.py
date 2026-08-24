from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import IPDataAgreement, Pilot
from app.schemas import IPDataAgreementIn, IPDataAgreementOut
from app.utils import audit_entity

router = APIRouter(prefix="/ip-data-agreements", tags=["ip-data-agreements"])


@router.get("", response_model=list[IPDataAgreementOut])
def list_agreements(pilot_id: int = 0, s: Session = Depends(db), u=Depends(current)):
    q = s.query(IPDataAgreement)
    if pilot_id:
        q = q.filter(IPDataAgreement.pilot_id == pilot_id)
    return q.order_by(IPDataAgreement.created_at.desc()).all()


@router.get("/{agreement_id}", response_model=IPDataAgreementOut)
def get_agreement(agreement_id: int, s: Session = Depends(db), u=Depends(current)):
    a = s.get(IPDataAgreement, agreement_id)
    if not a:
        raise HTTPException(404, "IP/Data agreement not found")
    return a


@router.post("", response_model=IPDataAgreementOut)
def create_agreement(
    pilot_id: int = 0, x: IPDataAgreementIn = IPDataAgreementIn(),
    s: Session = Depends(db), u=Depends(authorize("govt_officer", "admin")),
):
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")
    a = IPDataAgreement(pilot_id=pilot_id, **x.model_dump())
    s.add(a)
    s.commit()
    s.refresh(a)
    audit_entity(s, u.id, "ip_data_agreement", a.id, "created", {"pilot_id": pilot_id})
    return a


@router.patch("/{agreement_id}", response_model=IPDataAgreementOut)
def update_agreement(
    agreement_id: int, x: IPDataAgreementIn, s: Session = Depends(db),
    u=Depends(authorize("govt_officer", "admin")),
):
    a = s.get(IPDataAgreement, agreement_id)
    if not a:
        raise HTTPException(404, "IP/Data agreement not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(a, k, v)
    s.commit()
    s.refresh(a)
    audit_entity(s, u.id, "ip_data_agreement", a.id, "updated", {"pilot_id": a.pilot_id})
    return a


@router.delete("/{agreement_id}")
def delete_agreement(agreement_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    a = s.get(IPDataAgreement, agreement_id)
    if not a:
        raise HTTPException(404, "IP/Data agreement not found")
    s.delete(a)
    s.commit()
    audit_entity(s, u.id, "ip_data_agreement", agreement_id, "deleted", {"pilot_id": a.pilot_id})
    return {"message": "IP/Data agreement deleted"}
