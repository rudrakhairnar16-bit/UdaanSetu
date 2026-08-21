from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.core.database import get_db
from app.models.models import Entity, EntityKind, User, Milestone
from app.schemas.schemas import (
    EntityCreate, EntityUpdate, EntityResponse, EntityListResponse,
    MilestoneCreate, MilestoneResponse, PaginationParams,
)

router = APIRouter(prefix="/entities", tags=["entities"])

KIND_STAGES = {
    "research": ["Draft", "Concept", "Lab Testing", "Prototype", "Field Trial", "Validation", "Completed"],
    "innovation": ["Concept", "Prototype", "Validation", "IPR Screening", "Ready for Market"],
    "ipr": ["Idea", "Screening", "Filed", "Examination", "Granted", "Rejected"],
    "startup": ["Idea", "Pre-seed", "Seed", "Series A", "Series B", "Growth"],
    "mentor": ["Available", "Busy", "On Leave"],
    "scheme": ["Open", "Closed", "Upcoming"],
    "incubator": ["Open", "Full", "Selective"],
    "funding_request": ["Submitted", "Under Review", "Approved", "Rejected", "Funded"],
    "milestone": ["Pending", "In Progress", "Done", "Overdue"],
}

@router.get("", response_model=EntityListResponse)
def list_entities(
    kind: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    stage: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Entity)
    
    if kind:
        query = query.filter(Entity.kind == kind)
    if district:
        query = query.filter(Entity.district == district)
    if sector:
        query = query.filter(Entity.sector == sector)
    if stage:
        query = query.filter(Entity.stage == stage)
    if search:
        query = query.filter(
            or_(
                Entity.title.ilike(f"%{search}%"),
                Entity.description.ilike(f"%{search}%"),
            )
        )
    
    total = query.count()
    items = query.order_by(Entity.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return {"items": [EntityResponse.from_orm(e) for e in items], "total": total, "page": page, "size": size}

@router.get("/{entity_id}", response_model=EntityResponse)
def get_entity(entity_id: int, db: Session = Depends(get_db)):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return EntityResponse.from_orm(entity)

@router.post("", response_model=EntityResponse, status_code=status.HTTP_201_CREATED)
def create_entity(entity: EntityCreate, db: Session = Depends(get_db)):
    if entity.kind not in KIND_STAGES:
        raise HTTPException(status_code=400, detail="Invalid entity kind")
    
    if entity.stage not in KIND_STAGES[entity.kind]:
        raise HTTPException(status_code=400, detail=f"Invalid stage for {entity.kind}")
    
    db_entity = Entity(**entity.model_dump())
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    return EntityResponse.from_orm(db_entity)

@router.patch("/{entity_id}", response_model=EntityResponse)
def update_entity(entity_id: int, update: EntityUpdate, db: Session = Depends(get_db)):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entity, field, value)
    
    from datetime import datetime
    entity.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entity)
    return EntityResponse.from_orm(entity)

@router.delete("/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity(entity_id: int, db: Session = Depends(get_db)):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    db.delete(entity)
    db.commit()

@router.get("/stats/summary")
def get_stats(db: Session = Depends(get_db)):
    counts = {}
    for kind in EntityKind:
        counts[kind.value] = db.query(Entity).filter(Entity.kind == kind).count()
    return counts

# Milestone endpoints
@router.post("/{entity_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def create_milestone(entity_id: int, milestone: MilestoneCreate, db: Session = Depends(get_db)):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    db_milestone = Milestone(entity_id=entity_id, **milestone.model_dump(exclude={"entity_id"}))
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return MilestoneResponse.from_orm(db_milestone)

@router.get("/{entity_id}/milestones", response_model=List[MilestoneResponse])
def get_milestones(entity_id: int, db: Session = Depends(get_db)):
    return db.query(Milestone).filter(Milestone.entity_id == entity_id).all()

@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(milestone_id: int, milestone: MilestoneCreate, db: Session = Depends(get_db)):
    db_milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    for field, value in milestone.model_dump(exclude={"entity_id"}).items():
        setattr(db_milestone, field, value)
    
    from datetime import datetime
    db_milestone.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_milestone)
    return MilestoneResponse.from_orm(db_milestone)

@router.delete("/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(milestone_id: int, db: Session = Depends(get_db)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(milestone)
    db.commit()