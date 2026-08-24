import csv
import io
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, cast, String
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


@router.get("/records/search")
def search_records(
    q: str = Query("", min_length=0),
    kind: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    stage: Optional[str] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    has_website: Optional[bool] = None,
    sort_by: str = Query("relevance", regex="^(relevance|name|date|district)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=500),
    s: Session = Depends(db),
    u=Depends(current),
):
    """Advanced search with full-text matching across title, description, meta fields."""
    query = s.query(Record)

    if kind:
        query = query.filter(Record.kind == kind)
    if district:
        query = query.filter(Record.district == district)
    if sector:
        query = query.filter(Record.sector == sector)
    if stage:
        query = query.filter(Record.stage == stage)

    if q:
        safe_q = sanitize_input(q)
        terms = safe_q.split()
        conditions = []
        for term in terms:
            pattern = f"%{term}%"
            conditions.append(Record.title.ilike(pattern))
            conditions.append(Record.description.ilike(pattern))
            conditions.append(Record.sector.ilike(pattern))
            conditions.append(Record.district.ilike(pattern))
            conditions.append(cast(Record.meta["cin"], String).ilike(pattern))
            conditions.append(cast(Record.meta["legal_name"], String).ilike(pattern))
            conditions.append(cast(Record.meta["services_provided"], String).ilike(pattern))
        query = query.filter(or_(*conditions))

    if min_year or max_year:
        query = query.filter(Record.meta["data_as_on"].astext != None)

    if has_website is not None:
        if has_website:
            query = query.filter(cast(Record.meta["company_website"], String) != None)
            query = query.filter(cast(Record.meta["company_website"], String) != "")
        else:
            query = query.filter(
                or_(
                    cast(Record.meta["company_website"], String) == None,
                    cast(Record.meta["company_website"], String) == ""
                )
            )

    total = query.count()

    if sort_by == "name":
        query = query.order_by(Record.title.asc())
    elif sort_by == "date":
        query = query.order_by(Record.created_at.desc())
    elif sort_by == "district":
        query = query.order_by(Record.district.asc(), Record.title.asc())
    else:
        query = query.order_by(Record.updated_at.desc())

    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
        "items": items,
    }


@router.get("/records/filters")
def get_filter_options(s: Session = Depends(db), u=Depends(current)):
    """Get available filter values for the search UI."""
    districts = [r[0] for r in s.query(Record.district).filter(Record.district != "").distinct().order_by(Record.district).all()]
    sectors = [r[0] for r in s.query(Record.sector).filter(Record.sector != "").distinct().order_by(Record.sector).all()]
    stages = [r[0] for r in s.query(Record.stage).filter(Record.stage != "").distinct().order_by(Record.stage).all()]
    kinds = [r[0] for r in s.query(Record.kind).distinct().order_by(Record.kind).all()]
    return {
        "districts": districts,
        "sectors": sectors,
        "stages": stages,
        "kinds": kinds,
    }


@router.get("/records/export")
def export_records(
    kind: str = Query("startup"),
    district: Optional[str] = None,
    sector: Optional[str] = None,
    format: str = Query("csv", regex="^(csv|json)$"),
    s: Session = Depends(db),
    u=Depends(current),
):
    """Export Gujarat startup data as CSV or JSON."""
    query = s.query(Record).filter(Record.kind == kind)
    if district:
        query = query.filter(Record.district == district)
    if sector:
        query = query.filter(Record.sector == sector)

    records = query.order_by(Record.title).all()

    if format == "json":
        data = []
        for r in records:
            data.append({
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "district": r.district,
                "sector": r.sector,
                "stage": r.stage,
                "cin": r.meta.get("cin", ""),
                "website": r.meta.get("company_website", ""),
                "legal_name": r.meta.get("legal_name", ""),
                "focus_sector": r.meta.get("focus_sector", ""),
                "services_provided": r.meta.get("services_provided", ""),
                "data_as_on": r.meta.get("data_as_on", ""),
            })
        content = json.dumps(data, indent=2, default=str)
        return StreamingResponse(
            io.BytesIO(content.encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={kind}_export.json"}
        )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "title", "district", "sector", "stage", "cin", "website",
                     "legal_name", "focus_sector", "services_provided", "data_as_on"])
    for r in records:
        writer.writerow([
            r.id, r.title, r.district, r.sector, r.stage,
            r.meta.get("cin", ""), r.meta.get("company_website", ""),
            r.meta.get("legal_name", ""), r.meta.get("focus_sector", ""),
            r.meta.get("services_provided", ""), r.meta.get("data_as_on", ""),
        ])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={kind}_export.csv"}
    )


@router.get("/analytics/gujarat")
def gujarat_analytics(
    s: Session = Depends(db),
    u=Depends(current),
):
    """Gujarat-specific analytics for the dashboard."""
    startups = s.query(Record).filter(Record.kind == "startup").all()

    by_district = {}
    by_sector = {}
    by_stage = {}
    by_year = {}
    for r in startups:
        d = r.district or "Unknown"
        by_district[d] = by_district.get(d, 0) + 1
        sec = r.sector or "Unknown"
        by_sector[sec] = by_sector.get(sec, 0) + 1
        stg = r.stage or "Unknown"
        by_stage[stg] = by_stage.get(stg, 0) + 1
        website = r.meta.get("company_website", "")
        if website:
            by_stage["_with_website"] = by_stage.get("_with_website", 0) + 1

    top_districts = sorted(by_district.items(), key=lambda x: x[1], reverse=True)[:15]
    top_sectors = sorted(by_sector.items(), key=lambda x: x[1], reverse=True)[:20]

    return {
        "total_startups": len(startups),
        "by_district": dict(top_districts),
        "by_sector": dict(top_sectors),
        "by_stage": {k: v for k, v in by_stage.items() if not k.startswith("_")},
        "website_count": by_stage.get("_with_website", 0),
        "districts_count": len(by_district),
        "sectors_count": len(by_sector),
    }


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
