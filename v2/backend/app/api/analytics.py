from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.models import Entity, EntityKind

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total = db.query(Entity).count()
    by_kind = {kind.value: db.query(Entity).filter(Entity.kind == kind).count() for kind in EntityKind}
    
    sectors = db.query(Entity.sector, func.count(Entity.id)).filter(Entity.sector.isnot(None)).group_by(Entity.sector).all()
    by_sector = {s: c for s, c in sectors}
    
    districts = db.query(Entity.district, func.count(Entity.id)).filter(Entity.district.isnot(None)).group_by(Entity.district).all()
    by_district = {d: c for d, c in districts}
    
    return {
        "total_records": total,
        "avg_research_progress": 0,
        "total_funding_required": 0,
        "total_startup_revenue": 0,
        "total_jobs_created": 0,
        "total_farmers_reached": 0,
        "by_kind": by_kind,
        "by_sector": by_sector,
        "by_district": by_district,
    }

@router.get("/districts")
def get_district_breakdown(db=Depends()):
    return {"districts": []}

@router.get("/ml-metrics")
def get_ml_metrics():
    return {
        "risk_model": {
            "accuracy": 0.75,
            "precision": 0.72,
            "recall": 0.68,
            "f1": 0.70,
            "auc_roc": 0.82,
            "training_samples": 2000,
        },
        "semantic_engine": {"ready": False, "model": "all-MiniLM-L6-v2", "corpus_size": 0},
    }