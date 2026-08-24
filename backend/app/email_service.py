"""Email notification service (stub for future SMTP integration)."""
import logging
from typing import Optional

logger = logging.getLogger("udaansetu.email")


def send_email(to: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    """
    Send an email notification. Currently logs only.
    In production, integrate with SMTP/SendGrid/SES.
    """
    logger.info(f"EMAIL → {to} | Subject: {subject}")
    logger.info(f"  Body: {body[:200]}")
    # TODO: integrate SMTP
    return True


def send_sla_breach_email(to: str, entity_type: str, entity_id: int, deadline: str):
    """Send SLA breach notification email."""
    return send_email(
        to=to,
        subject=f"SLA Breach Alert: {entity_type} #{entity_id}",
        body=f"The SLA deadline for {entity_type} #{entity_id} was {deadline}. Please take action.",
    )


def send_escalation_email(to: str, entity_type: str, entity_id: int, reason: str):
    """Send escalation notification email."""
    return send_email(
        to=to,
        subject=f"Escalation: {entity_type} #{entity_id}",
        body=f"{entity_type} #{entity_id} has been escalated. Reason: {reason}",
    )
