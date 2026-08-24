from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Procurement, Contract, PurchaseOrder, Pilot
from app.schemas import ProcurementIn, ProcurementOut, ContractIn, ContractOut
from app.utils import audit_entity

router = APIRouter(prefix="/procurements", tags=["procurements"])


@router.get("", response_model=list[ProcurementOut])
def list_procurements(s: Session = Depends(db), u=Depends(current)):
    return s.query(Procurement).order_by(Procurement.created_at.desc()).all()


@router.get("/{proc_id}", response_model=ProcurementOut)
def get_procurement(proc_id: int, s: Session = Depends(db), u=Depends(current)):
    p = s.get(Procurement, proc_id)
    if not p:
        raise HTTPException(404, "Procurement not found")
    return p


@router.post("", response_model=ProcurementOut)
def create_procurement(pilot_id: int = 0, x: ProcurementIn = ProcurementIn(), s: Session = Depends(db), u=Depends(authorize("procurement_officer", "govt_officer", "admin"))):
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")
    p = Procurement(
        pilot_id=pilot_id, status="recommended",
        procurement_method=x.procurement_method,
        estimated_value=x.estimated_value,
        approving_authority=x.approving_authority,
        external_reference_type=x.external_reference_type,
        external_reference_id=x.external_reference_id,
        meta=x.meta,
    )
    s.add(p)
    s.commit()
    s.refresh(p)
    audit_entity(s, u.id, "procurement", p.id, "created", {"pilot_id": pilot_id, "method": p.procurement_method})
    return p


@router.patch("/{proc_id}", response_model=ProcurementOut)
def update_procurement(proc_id: int, x: ProcurementIn, s: Session = Depends(db), u=Depends(authorize("procurement_officer", "govt_officer", "admin"))):
    p = s.get(Procurement, proc_id)
    if not p:
        raise HTTPException(404, "Procurement not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    s.commit()
    s.refresh(p)
    audit_entity(s, u.id, "procurement", p.id, "updated", {"pilot_id": p.pilot_id})
    return p


@router.post("/{proc_id}/approve")
def approve_procurement(proc_id: int, s: Session = Depends(db), u=Depends(authorize("procurement_officer", "admin"))):
    p = s.get(Procurement, proc_id)
    if not p:
        raise HTTPException(404, "Procurement not found")
    p.approval_status = "approved"
    p.approving_authority = u.name
    s.commit()
    audit_entity(s, u.id, "procurement", p.id, "approved", {"pilot_id": p.pilot_id})
    return {"message": "Procurement approved", "status": p.approval_status}


@router.delete("/{proc_id}")
def delete_procurement(proc_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    p = s.get(Procurement, proc_id)
    if not p:
        raise HTTPException(404, "Procurement not found")
    s.delete(p)
    s.commit()
    audit_entity(s, u.id, "procurement", proc_id, "deleted", {"pilot_id": p.pilot_id})
    return {"message": "Procurement deleted"}


# ── Contracts ──

@router.get("/contracts", response_model=list[ContractOut])
def list_contracts(s: Session = Depends(db), u=Depends(current)):
    return s.query(Contract).order_by(Contract.created_at.desc()).all()


@router.get("/contracts/{contract_id}", response_model=ContractOut)
def get_contract(contract_id: int, s: Session = Depends(db), u=Depends(current)):
    c = s.get(Contract, contract_id)
    if not c:
        raise HTTPException(404, "Contract not found")
    return c


@router.post("/contracts", response_model=ContractOut)
def create_contract(pilot_id: int = 0, x: ContractIn = ContractIn(), s: Session = Depends(db), u=Depends(authorize("procurement_officer", "govt_officer", "admin"))):
    pilot = s.get(Pilot, pilot_id)
    if not pilot:
        raise HTTPException(404, "Pilot not found")
    c = Contract(pilot_id=pilot_id, **x.model_dump())
    s.add(c)
    s.commit()
    s.refresh(c)
    audit_entity(s, u.id, "contract", c.id, "created", {"pilot_id": pilot_id, "number": c.contract_number})
    return c


@router.patch("/contracts/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, x: ContractIn, s: Session = Depends(db), u=Depends(authorize("procurement_officer", "admin"))):
    c = s.get(Contract, contract_id)
    if not c:
        raise HTTPException(404, "Contract not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    s.commit()
    s.refresh(c)
    audit_entity(s, u.id, "contract", c.id, "updated", {"pilot_id": c.pilot_id})
    return c


@router.post("/contracts/{contract_id}/sign")
def sign_contract(contract_id: int, s: Session = Depends(db), u=Depends(authorize("procurement_officer", "admin"))):
    from datetime import datetime
    c = s.get(Contract, contract_id)
    if not c:
        raise HTTPException(404, "Contract not found")
    c.status = "signed"
    c.signed_date = datetime.utcnow()
    s.commit()
    audit_entity(s, u.id, "contract", c.id, "signed", {"pilot_id": c.pilot_id})
    return {"message": "Contract signed", "status": c.status}
