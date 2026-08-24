from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, authorize, db
from app.models import DocumentVersion
from app.utils import audit_entity

router = APIRouter(prefix="/document-versions", tags=["document-versions"])


@router.get("/record/{record_id}")
def list_versions(record_id: int, s: Session = Depends(db), u=Depends(current)):
    return s.query(DocumentVersion).filter_by(record_id=record_id).order_by(DocumentVersion.version.desc()).all()


@router.post("/record/{record_id}")
def create_version(
    record_id: int, filename: str = "", file_url: str = "", change_summary: str = "",
    s: Session = Depends(db), u=Depends(authorize("admin", "govt_officer", "startup")),
):
    last = s.query(DocumentVersion).filter_by(record_id=record_id).order_by(DocumentVersion.version.desc()).first()
    next_ver = (last.version + 1) if last else 1
    v = DocumentVersion(
        record_id=record_id, version=next_ver, filename=filename,
        file_url=file_url, uploaded_by=u.id, change_summary=change_summary,
    )
    s.add(v)
    s.commit()
    s.refresh(v)
    audit_entity(s, u.id, "document_version", v.id, "created", {"record_id": record_id, "version": next_ver, "filename": filename})
    return {"id": v.id, "version": v.version, "filename": v.filename, "created_at": str(v.created_at)}
