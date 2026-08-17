import re
from datetime import datetime, timezone

from app.models import AuditLog, Notification


RECORD_KINDS = {"research", "milestone", "innovation", "ipr", "startup",
                "funding_request", "mentor", "scheme", "incubator"}


def words(text: str) -> set[str]:
    return set(re.findall(r"[a-z]{3,}", text.lower()))


def similarity(a: str, b: str) -> float:
    x, y = words(a), words(b)
    return round(len(x & y) / max(1, len(x | y)) * 100, 1)


def audit(s, u, action, r):
    s.add(AuditLog(
        action=action, entity=r.kind, entity_id=r.id,
        actor_id=u.id, detail={"title": r.title}
    ))


def notify(s, user_id, message, kind="info"):
    s.add(Notification(user_id=user_id, message=message, kind=kind))


def compute_risk(r, milestones):
    overdue = sum(
        1 for m in milestones
        if m.stage.lower() not in ("done", "complete", "completed")
        and m.meta.get("due_date", "") < datetime.now(timezone.utc).date().isoformat()
    )
    p = float(r.meta.get("progress", 0))
    stage_penalty = 15 if r.stage.lower() in ("stalled", "at risk") else 0
    score = min(100, round(overdue * 24 + (100 - p) * 0.35 + stage_penalty))
    reasons = []
    if overdue:
        reasons.append(f"{overdue} overdue milestone(s)")
    if p < 50:
        reasons.append("Low reported progress")
    if stage_penalty:
        reasons.append(f"Stage flagged as '{r.stage}'")
    return {
        "score": score,
        "level": "High" if score >= 60 else "Medium" if score >= 30 else "Low",
        "reasons": reasons or ["On track"],
    }


def sanitize_input(text: str) -> str:
    text = text.strip()
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("\x00", "")
    return text


def validate_password_strength(password: str) -> list[str]:
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one digit")
    return errors
