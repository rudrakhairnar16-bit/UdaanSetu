from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Notification, User

router = APIRouter()


class NotificationCreate(BaseModel):
    user_id: int
    kind: str = "info"
    message: str


class NotificationOut(BaseModel):
    id: int
    kind: str
    message: str
    read: bool
    created_at: str
    entity_id: Optional[int] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificationOut])
def list_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Notification)
    if unread_only:
        q = q.filter(Notification.user_id == current_user.id, Notification.read == False)
    else:
        q = q.filter(Notification.user_id == current_user.id)
    items = q.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return [
        NotificationOut(
            id=n.id, kind=n.kind, message=n.message, read=n.read,
            created_at=str(n.created_at), entity_id=n.entity_id,
        )
        for n in items
    ]


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.read == False)
        .count()
    )
    return {"count": count}


@router.post("/", response_model=NotificationOut)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    notif = Notification(user_id=data.user_id, kind=data.kind, message=data.message)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return NotificationOut(
        id=notif.id, kind=notif.kind, message=notif.message, read=notif.read,
        created_at=str(notif.created_at), entity_id=notif.entity_id,
    )


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    return {"status": "ok"}


@router.post("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.read == False
    ).update({"read": True})
    db.commit()
    return {"status": "ok"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"status": "ok"}
