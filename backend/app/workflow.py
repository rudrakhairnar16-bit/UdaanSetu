"""Finite state machine for entity lifecycle transitions."""
from typing import Dict, List, Tuple


class WorkflowFSM:
    def __init__(self, transitions: Dict[str, List[Tuple[str, str]]]):
        """
        transitions: {
            "entity_type": {
                "from_status": [(allowed_action, to_status), ...]
            }
        }
        """
        self._transitions = transitions

    def can_transition(self, entity_type: str, current_status: str, action: str) -> bool:
        trans = self._transitions.get(entity_type, {}).get(current_status, [])
        return any(t[0] == action for t in trans)

    def transition(self, entity_type: str, current_status: str, action: str) -> str:
        trans = self._transitions.get(entity_type, {}).get(current_status, [])
        for allowed_action, to_status in trans:
            if allowed_action == action:
                return to_status
        raise ValueError(f"Invalid transition: {entity_type}/{current_status}/{action}")


WORKFLOWS = {
    "challenge": {
        "draft": [("publish", "published"), ("cancel", "cancelled")],
        "published": [("pause", "paused"), ("close", "closed"), ("award", "awarded")],
        "paused": [("publish", "published"), ("close", "closed")],
        "awarded": [("close", "closed")],
        "cancelled": [],
        "closed": [],
    },
    "application": {
        "submitted": [("screen", "screened"), ("reject", "rejected")],
        "screened": [("shortlist", "shortlisted"), ("reject", "rejected")],
        "shortlisted": [("select", "selected"), ("reject", "rejected")],
        "selected": [("start_pilot", "pilot")],
        "rejected": [],
        "pilot": [],
    },
    "pilot": {
        "planning": [("start", "active")],
        "active": [("complete", "completed"), ("suspend", "suspended")],
        "completed": [],
        "suspended": [("start", "active")],
    },
    "validation": {
        "pending": [("validate", "validated")],
        "validated": [],
    },
    "grievance": {
        "open": [("assign", "assigned"), ("resolve", "resolved"), ("close", "closed")],
        "assigned": [("resolve", "resolved"), ("escalate", "escalated")],
        "escalated": [("resolve", "resolved"), ("close", "closed")],
        "resolved": [("close", "closed"), ("reopen", "open")],
        "closed": [],
    },
}

fsm = WorkflowFSM(WORKFLOWS)
