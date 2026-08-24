from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import ComplianceChecklist, Procurement
from app.schemas import ComplianceChecklistIn, ComplianceChecklistOut
from app.utils import audit_entity

router = APIRouter(prefix="/compliance", tags=["compliance-checklists"])


@router.get("/procurement/{procurement_id}", response_model=list[ComplianceChecklistOut])
def list_compliance_items(procurement_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(ComplianceChecklist).filter_by(procurement_id=procurement_id).order_by(ComplianceChecklist.id).all()


@router.post("/procurement/{procurement_id}", response_model=ComplianceChecklistOut)
def create_compliance_item(
    procurement_id: int, x: ComplianceChecklistIn, s: Session = Depends(db),
    u=Depends(authorize("procurement_officer", "govt_officer", "admin")),
):
    proc = s.get(Procurement, procurement_id)
    if not proc:
        raise HTTPException(404, "Procurement not found")
    item = ComplianceChecklist(procurement_id=procurement_id, **x.model_dump())
    s.add(item)
    s.commit()
    s.refresh(item)
    audit_entity(s, u.id, "compliance_checklist", item.id, "created", {"procurement_id": procurement_id, "item": item.item})
    return item


@router.patch("/{item_id}", response_model=ComplianceChecklistOut)
def update_compliance_item(
    item_id: int, x: dict, s: Session = Depends(db),
    u=Depends(authorize("procurement_officer", "admin")),
):
    item = s.get(ComplianceChecklist, item_id)
    if not item:
        raise HTTPException(404, "Compliance item not found")
    if "status" in x:
        item.status = x["status"]
    if "notes" in x:
        item.notes = x["notes"]
    item.checked_by = u.id
    s.commit()
    s.refresh(item)
    audit_entity(s, u.id, "compliance_checklist", item.id, "updated", {"status": item.status})
    return item


@router.post("/procurement/{procurement_id}/auto-populate")
def auto_populate_checklist(
    procurement_id: int, s: Session = Depends(db),
    u=Depends(authorize("procurement_officer", "admin")),
):
    proc = s.get(Procurement, procurement_id)
    if not proc:
        raise HTTPException(404, "Procurement not found")
    items = [
        "DPIIT Registration Certificate verified",
        "Maharashtra Startup Policy eligibility confirmed",
        "Financial bid within approved budget",
        "Technical evaluation completed by expert panel",
        "No conflict of interest declarations pending",
        "Data protection compliance (DPDP Act 2023) verified",
        "Cybersecurity requirements (CERT-In) confirmed",
        "GeM/tender reference number valid",
        "Performance bank guarantee received",
        "Insurance coverage verified",
    ]
    created = []
    for item_text in items:
        existing = s.query(ComplianceChecklist).filter_by(procurement_id=procurement_id, item=item_text).first()
        if not existing:
            c = ComplianceChecklist(procurement_id=procurement_id, item=item_text)
            s.add(c)
            created.append(item_text)
    s.commit()
    audit_entity(s, u.id, "compliance_checklist", procurement_id, "auto_populated", {"count": len(created)})
    return {"message": f"Auto-populated {len(created)} compliance items", "items": created}
