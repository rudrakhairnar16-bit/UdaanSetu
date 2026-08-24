from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Payment
from app.schemas import PaymentIn, PaymentOut

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("", response_model=list[PaymentOut])
def list_payments(
    pilot_id: int = 0,
    milestone_id: int = 0,
    payment_status: str = "",
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(Payment)
    if pilot_id:
        q = q.filter(Payment.pilot_id == pilot_id)
    if milestone_id:
        q = q.filter(Payment.milestone_id == milestone_id)
    if payment_status:
        q = q.filter(Payment.payment_status == payment_status)
    return q.order_by(Payment.created_at.desc()).all()


@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: int, s: Session = Depends(db), u=Depends(current)):
    p = s.get(Payment, payment_id)
    if not p:
        raise HTTPException(404, "Payment not found")
    return p


@router.post("", response_model=PaymentOut)
def create_payment(x: PaymentIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    p = Payment(**x.model_dump())
    s.add(p)
    s.commit()
    s.refresh(p)
    return p


@router.patch("/{payment_id}", response_model=PaymentOut)
def update_payment(
    payment_id: int, x: PaymentIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    p = s.get(Payment, payment_id)
    if not p:
        raise HTTPException(404, "Payment not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    s.commit()
    s.refresh(p)
    return p


@router.post("/{payment_id}/process")
def process_payment(payment_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    p = s.get(Payment, payment_id)
    if not p:
        raise HTTPException(404, "Payment not found")
    if p.payment_status != "pending":
        raise HTTPException(400, "Payment already processed")
    p.payment_status = "processing"
    s.commit()
    return {"message": "Payment processing", "status": p.payment_status}


@router.post("/{payment_id}/complete")
def complete_payment(payment_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    p = s.get(Payment, payment_id)
    if not p:
        raise HTTPException(404, "Payment not found")
    p.payment_status = "completed"
    s.commit()
    return {"message": "Payment completed", "status": p.payment_status}


@router.delete("/{payment_id}")
def delete_payment(payment_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    p = s.get(Payment, payment_id)
    if not p:
        raise HTTPException(404, "Payment not found")
    s.delete(p)
    s.commit()
    return {"message": "Payment deleted"}
