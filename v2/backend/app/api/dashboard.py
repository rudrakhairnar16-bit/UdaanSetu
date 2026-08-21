from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.models import Entity, EntityKind, Milestone, User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    pipeline = {}
    for kind in ["research", "innovation", "ipr", "startup"]:
        total = db.query(Entity).filter(Entity.kind == kind).count()
        active = db.query(Entity).filter(Entity.kind == kind, Entity.stage != "Completed").count()
        pipeline[kind] = {"total": total, "active": active}
    
    pipeline["impact"] = {"total": db.query(Entity).filter(Entity.kind == "startup", Entity.stage == "Growth").count(), "active": 0}
    
    counts = {}
    for kind in EntityKind:
        counts[kind.value] = db.query(Entity).filter(Entity.kind == kind).count()
    
    at_risk = []  # TODO: Implement ML risk scoring
    recent = db.query(Entity).order_by(Entity.created_at.desc()).limit(5).all()
    
    return {
        "pipeline": pipeline,
        "counts": {k.value: v for k, v in {kind: db.query(Entity).filter(Entity.kind == kind).count() for kind in EntityKind}.items()},
        "banner": "Welcome to Gujarat Innovation Ecosystem!",
        "at_risk": at_risk,
        "recent": [{"id": e.id, "title": e.title, "kind": e.kind, "stage": e.stage, "district": e.district} for e in recent],
    }

@router.get("/at-risk", response_model=List[Dict])
def get_at_risk(limit: int = 10, db: Session = Depends(get_db)):
    # TODO: Implement ML-based risk scoring
    return []