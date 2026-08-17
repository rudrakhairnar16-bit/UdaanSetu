from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import current, db
from app.models import Notification
from app.schemas import NotifOut

router = APIRouter(tags=["notifications"])


@router.get("/notifications", response_model=list[NotifOut])
def list_notifications(s: Session = Depends(db), u=Depends(current)):
    return s.query(Notification).filter_by(user_id=u.id).order_by(Notification.created_at.desc()).limit(50).all()


@router.patch("/notifications/{notif_id}/read")
def mark_read(notif_id: int, s: Session = Depends(db), u=Depends(current)):
    n = s.get(Notification, notif_id)
    if not n or n.user_id != u.id:
        raise HTTPException(404, "Notification not found")
    n.read = True
    s.commit()
    return {"message": "Marked as read"}


@router.post("/notifications/read-all")
def mark_all_read(s: Session = Depends(db), u=Depends(current)):
    s.query(Notification).filter_by(user_id=u.id, read=False).update({"read": True})
    s.commit()
    return {"message": "All notifications marked as read"}
