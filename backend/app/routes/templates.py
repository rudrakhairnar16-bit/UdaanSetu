from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import Template
from app.schemas import TemplateIn, TemplateOut
from app.utils import audit_entity

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=list[TemplateOut])
def list_templates(
    type: str = "",
    is_active: bool = True,
    s: Session = Depends(db),
    u=Depends(current),
):
    q = s.query(Template)
    if type:
        q = q.filter(Template.type == type)
    if is_active is not None:
        q = q.filter(Template.is_active == is_active)
    return q.order_by(Template.name).all()


@router.get("/{template_id}", response_model=TemplateOut)
def get_template(template_id: int, s: Session = Depends(db), u=Depends(current)):
    t = s.get(Template, template_id)
    if not t:
        raise HTTPException(404, "Template not found")
    return t


@router.post("", response_model=TemplateOut)
def create_template(x: TemplateIn, s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer"))):
    t = Template(**x.model_dump())
    s.add(t)
    s.commit()
    s.refresh(t)
    audit_entity(s, u.id, "template", t.id, "created", {"name": t.name})
    return t


@router.patch("/{template_id}", response_model=TemplateOut)
def update_template(
    template_id: int, x: TemplateIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "govt_officer")),
):
    t = s.get(Template, template_id)
    if not t:
        raise HTTPException(404, "Template not found")
    for k, v in x.model_dump(exclude_unset=True).items():
        setattr(t, k, v)
    s.commit()
    s.refresh(t)
    audit_entity(s, u.id, "template", t.id, "updated", {"name": t.name})
    return t


@router.delete("/{template_id}")
def delete_template(template_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    t = s.get(Template, template_id)
    if not t:
        raise HTTPException(404, "Template not found")
    s.delete(t)
    s.commit()
    audit_entity(s, u.id, "template", template_id, "deleted", {"name": t.name})
    return {"message": "Template deleted"}
