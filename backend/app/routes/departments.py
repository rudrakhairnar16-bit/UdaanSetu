from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Department
from app.schemas import DepartmentIn, DepartmentOut
from app.utils import audit_entity

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentOut])
def list_departments(
    sector: str = "",
    district: str = "",
    q: str = "",
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(Department)
    if sector:
        q = q.filter(Department.sector == sector)
    if district:
        q = q.filter(Department.district == district)
    if q_text := (q or "").strip():
        q = q.filter(
            Department.name.ilike(f"%{q_text}%")
        )
    return q.order_by(Department.name).all()


@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(dept_id: int, s: Session = Depends(db), u=Depends(current)):
    d = s.get(Department, dept_id)
    if not d:
        raise HTTPException(404, "Department not found")
    return d


@router.post("", response_model=DepartmentOut)
def create_department(x: DepartmentIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    d = Department(**x.model_dump())
    s.add(d)
    s.commit()
    s.refresh(d)
    audit_entity(s, u.id, "department", d.id, "created", {"name": d.name})
    return d


@router.patch("/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: int, x: DepartmentIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    d = s.get(Department, dept_id)
    if not d:
        raise HTTPException(404, "Department not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(d, k, v)
    s.commit()
    s.refresh(d)
    audit_entity(s, u.id, "department", d.id, "updated", {"name": d.name})
    return d


@router.delete("/{dept_id}")
def delete_department(dept_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    d = s.get(Department, dept_id)
    if not d:
        raise HTTPException(404, "Department not found")
    s.delete(d)
    s.commit()
    audit_entity(s, u.id, "department", dept_id, "deleted", {"name": d.name})
    return {"message": "Department deleted"}
