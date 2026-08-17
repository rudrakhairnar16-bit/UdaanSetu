from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Record, User
from app.schemas import ItemIn, ItemOut
from app.utils import sanitize_input, audit, notify, RECORD_KINDS

router = APIRouter(tags=["records"])


@router.get("/records", response_model=list[ItemOut])
def list_records(
    kind: Optional[str] = None,
    parent_id: Optional[int] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    stage: Optional[str] = None,
    q: str = "",
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=500),
    s: Session = Depends(db),
    u=Depends(current),
):
    query = s.query(Record)
    if kind:
        query = query.filter(Record.kind == kind)
    if parent_id:
        query = query.filter(Record.parent_id == parent_id)
    if district:
        query = query.filter(Record.district == district)
    if sector:
        query = query.filter(Record.sector == sector)
    if stage:
        query = query.filter(Record.stage == stage)
    if q:
        safe_q = sanitize_input(q)
        query = query.filter(
            (Record.title.ilike(f"%{safe_q}%")) | (Record.description.ilike(f"%{safe_q}%"))
        )
    return query.order_by(Record.updated_at.desc()).offset((page - 1) * per_page).limit(per_page).all()


@router.get("/records/{record_id}", response_model=ItemOut)
def get_record(record_id: int, s: Session = Depends(db), u=Depends(current)):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    return r


@router.post("/records/{kind}", response_model=ItemOut)
def create_record(
    kind: str, x: ItemIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "researcher", "incubator", "mentor", "investor")),
):
    if kind not in RECORD_KINDS:
        raise HTTPException(400, f"Unsupported record type: {kind}")
    r = Record(kind=kind, owner_id=u.id, **x.model_dump())
    s.add(r)
    s.flush()
    audit(s, u, "created", r)
    if kind == "funding_request":
        for investor_u in s.query(User).filter_by(role="investor").all():
            notify(s, investor_u.id, f"New funding request: {r.title}", "action")
    s.commit()
    s.refresh(r)
    return r


@router.patch("/records/{record_id}", response_model=ItemOut)
def update_record(
    record_id: int, x: ItemIn, s: Session = Depends(db), u=Depends(current),
):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    if u.role != "admin" and r.owner_id not in (u.id, None):
        raise HTTPException(403, "Not your record")
    old_stage = r.stage
    for k, v in x.model_dump().items():
        setattr(r, k, v)
    audit(s, u, "updated", r)
    if old_stage != r.stage and r.owner_id:
        notify(s, r.owner_id, f"'{r.title}' stage updated: {old_stage} → {r.stage}", "info")
    s.commit()
    s.refresh(r)
    return r


@router.delete("/records/{record_id}")
def delete_record(record_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    audit(s, u, "deleted", r)
    s.delete(r)
    s.commit()
    return {"message": f"Record {record_id} deleted"}
