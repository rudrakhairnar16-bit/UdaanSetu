from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies import current, db
from app.models import Record

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def dashboard(district: Optional[str] = None, s: Session = Depends(db), u=Depends(current)):
    query = s.query(Record)
    if district:
        query = query.filter(Record.district == district)
    allr = query.all()
    research = [r for r in allr if r.kind == "research"]
    milestones = [r for r in allr if r.kind == "milestone"]
    at_risk = []
    from app.ml.engine import get_risk_engine
    risk_engine = get_risk_engine()
    for rp in research:
        rp_milestones = [m for m in milestones if m.parent_id == rp.id]
        prediction = risk_engine.predict(rp, rp_milestones)
        at_risk.append({
            "id": rp.id, "title": rp.title,
            "score": prediction.score, "level": prediction.level,
            "confidence": prediction.confidence,
            "feature_importance": prediction.feature_importance,
            "reasons": prediction.reasons, "method": prediction.method,
        })
    at_risk.sort(key=lambda x: x["score"], reverse=True)

    pipeline = {}
    for kind in ["research", "innovation", "ipr", "startup", "funding_request"]:
        items = [r for r in allr if r.kind == kind]
        stages = {}
        for item in items:
            stages[item.stage] = stages.get(item.stage, 0) + 1
        pipeline[kind] = {"total": len(items), "stages": stages}

    return {
        "banner": "DEMO DATA — representative prototype records only",
        "counts": {k: sum(1 for r in allr if r.kind == k)
                   for k in ["research", "innovation", "ipr", "startup",
                             "mentor", "scheme", "incubator", "funding_request"]},
        "at_risk": at_risk,
        "recent": allr[:10],
        "pipeline": pipeline,
        "districts": list(set(r.district for r in allr if r.district)),
    }


@router.get("/analytics/overview")
def analytics_overview(s: Session = Depends(db), u=Depends(current)):
    total = s.query(Record).count()
    by_kind = dict(s.query(Record.kind, func.count(Record.id)).group_by(Record.kind).all())
    by_sector = dict(s.query(Record.sector, func.count(Record.id)).filter(Record.sector != "").group_by(Record.sector).all())
    by_district = dict(s.query(Record.district, func.count(Record.id)).filter(Record.district != "").group_by(Record.district).all())
    research = s.query(Record).filter_by(kind="research").all()
    avg_progress = sum(r.meta.get("progress", 0) for r in research) / max(1, len(research))
    total_funding = sum(r.meta.get("funding_required", 0) for r in research)
    startups = s.query(Record).filter_by(kind="startup").all()
    return {
        "total_records": total, "by_kind": by_kind, "by_sector": by_sector,
        "by_district": by_district, "avg_research_progress": round(avg_progress, 1),
        "total_funding_required": total_funding,
        "total_startup_revenue": sum(r.meta.get("revenue", 0) for r in startups),
        "total_jobs_created": sum(r.meta.get("jobs_created", 0) for r in startups),
        "total_farmers_reached": sum(r.meta.get("farmers_reached", 0) for r in startups),
        "label": "DEMO DATA — representative prototype metrics only",
    }


@router.get("/analytics/districts")
def district_analytics(s: Session = Depends(db), u=Depends(current)):
    rows = (
        s.query(Record.district, Record.kind, func.count(Record.id))
        .filter(Record.district != "")
        .group_by(Record.district, Record.kind)
        .all()
    )
    data = {}
    for d, k, n in rows:
        data.setdefault(d, {})[k] = n
    return {
        "label": "DEMO DATA — not government statistics",
        "districts": [{"district": d, **v} for d, v in data.items()],
    }
