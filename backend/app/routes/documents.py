import re
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import current, db
from app.models import Record
from app.utils import audit

router = APIRouter(tags=["documents"])

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx", ".md", ".csv"}


@router.post("/documents/upload")
async def upload_document(
    record_id: int = Form(...),
    file: UploadFile = File(...),
    s: Session = Depends(db),
    u=Depends(current),
):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    suffix = Path(file.filename or "upload.txt").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {suffix}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(413, f"File too large. Max size: {settings.max_upload_bytes // (1024 * 1024)} MB")
    target = Path("uploads")
    target.mkdir(exist_ok=True)
    safe_name = re.sub(r"[^\w.\-]", "_", file.filename or "upload.txt")
    path = target / f"{int(datetime.now(timezone.utc).timestamp())}_{safe_name}"
    with path.open("wb") as f:
        f.write(content)
    text = ""
    try:
        if suffix in (".txt", ".md", ".csv"):
            text = content.decode("utf-8", errors="ignore")
        elif suffix == ".pdf":
            from pypdf import PdfReader
            text = " ".join(p.extract_text() or "" for p in PdfReader(path).pages)
        elif suffix == ".docx":
            from docx import Document
            text = " ".join(p.text for p in Document(path).paragraphs)
    except Exception:
        text = "Extraction could not be completed."
    r.meta = {**r.meta, "document": {"name": file.filename, "extracted_preview": text[:2000]}}
    audit(s, u, "uploaded_document", r)
    s.commit()
    return {"filename": file.filename, "size": len(content),
            "extracted_preview": text[:2000],
            "note": "Best-effort extraction; validate source content manually."}
