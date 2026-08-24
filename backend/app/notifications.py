"""Notification service for SLA breaches, escalations, and milestones."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Grievance, Pilot, Challenge, Notification


def check_sla_breaches(s: Session) -> list:
    """Check for SLA breaches across grievances and return breach records."""
    breaches = []

    # Check grievances with open SLA
    grievances = s.query(Grievance).filter(
        Grievance.status.in_(["open", "assigned"]),
    ).all()

    for g in grievances:
        if hasattr(g, 'meta') and g.meta:
            sla_deadline = g.meta.get("sla_deadline")
            if sla_deadline:
                try:
                    deadline = datetime.fromisoformat(sla_deadline)
                    if datetime.utcnow() > deadline:
                        breaches.append({
                            "type": "grievance_sla_breach",
                            "id": g.id,
                            "title": g.subject,
                            "breached_at": str(datetime.utcnow()),
                            "deadline": sla_deadline,
                            "category": g.category,
                        })
                except Exception:
                    pass

    # Check pilots with overdue milestones
    pilots = s.query(Pilot).filter(Pilot.status == "active").all()
    for p in pilots:
        if hasattr(p, 'meta') and p.meta:
            milestones = p.meta.get("milestones", [])
            for ms in milestones:
                if ms.get("due_date") and not ms.get("completed"):
                    try:
                        due = datetime.fromisoformat(ms["due_date"])
                        if datetime.utcnow() > due:
                            breaches.append({
                                "type": "pilot_milestone_overdue",
                                "pilot_id": p.id,
                                "milestone": ms.get("name", "Unknown"),
                                "due_date": ms["due_date"],
                                "breached_at": str(datetime.utcnow()),
                            })
                    except Exception:
                        pass

    return breaches


def generate_notification(user_id: int, ntype: str, title: str, message: str, s: Session):
    """Create an in-app notification."""
    n = Notification(user_id=user_id, kind=ntype, message=f"{title}: {message}")
    s.add(n)
    s.commit()
    return n
