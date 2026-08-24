from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import PurchaseOrder, Contract
from app.schemas import PurchaseOrderIn, PurchaseOrderOut
from app.utils import audit_entity

router = APIRouter(prefix="/purchase-orders", tags=["purchase-orders"])


@router.get("", response_model=list[PurchaseOrderOut])
def list_purchase_orders(s: Session = Depends(db), u=Depends(current)):
    return s.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).all()


@router.get("/{po_id}", response_model=PurchaseOrderOut)
def get_purchase_order(po_id: int, s: Session = Depends(db), u=Depends(current)):
    po = s.get(PurchaseOrder, po_id)
    if not po:
        raise HTTPException(404, "Purchase order not found")
    return po


@router.post("", response_model=PurchaseOrderOut)
def create_purchase_order(
    contract_id: int = 0, x: PurchaseOrderIn = PurchaseOrderIn(),
    s: Session = Depends(db), u=Depends(authorize("procurement_officer", "govt_officer", "admin")),
):
    contract = s.get(Contract, contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    po = PurchaseOrder(contract_id=contract_id, **x.model_dump())
    s.add(po)
    s.commit()
    s.refresh(po)
    audit_entity(s, u.id, "purchase_order", po.id, "created", {"contract_id": contract_id, "po_number": po.po_number})
    return po


@router.patch("/{po_id}", response_model=PurchaseOrderOut)
def update_purchase_order(
    po_id: int, x: PurchaseOrderIn, s: Session = Depends(db),
    u=Depends(authorize("procurement_officer", "admin")),
):
    po = s.get(PurchaseOrder, po_id)
    if not po:
        raise HTTPException(404, "Purchase order not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(po, k, v)
    s.commit()
    s.refresh(po)
    audit_entity(s, u.id, "purchase_order", po.id, "updated", {"po_number": po.po_number})
    return po


@router.post("/{po_id}/issue")
def issue_purchase_order(po_id: int, s: Session = Depends(db), u=Depends(authorize("procurement_officer", "admin"))):
    po = s.get(PurchaseOrder, po_id)
    if not po:
        raise HTTPException(404, "Purchase order not found")
    po.status = "issued"
    po.issued_date = datetime.utcnow()
    s.commit()
    audit_entity(s, u.id, "purchase_order", po.id, "issued", {"po_number": po.po_number})
    return {"message": "Purchase order issued", "status": po.status}


@router.post("/{po_id}/fulfill")
def fulfill_purchase_order(po_id: int, s: Session = Depends(db), u=Depends(authorize("procurement_officer", "admin"))):
    po = s.get(PurchaseOrder, po_id)
    if not po:
        raise HTTPException(404, "Purchase order not found")
    po.status = "fulfilled"
    s.commit()
    audit_entity(s, u.id, "purchase_order", po.id, "fulfilled", {"po_number": po.po_number})
    return {"message": "Purchase order fulfilled", "status": po.status}


@router.delete("/{po_id}")
def delete_purchase_order(po_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    po = s.get(PurchaseOrder, po_id)
    if not po:
        raise HTTPException(404, "Purchase order not found")
    s.delete(po)
    s.commit()
    audit_entity(s, u.id, "purchase_order", po_id, "deleted", {"po_number": po.po_number})
    return {"message": "Purchase order deleted"}
