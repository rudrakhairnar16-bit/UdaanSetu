"""Base class for government API integrations.

All government API clients inherit from BaseGovernmentClient.
In production, replace mock implementations with real HTTP calls.
"""
import logging
import hashlib
import time
from abc import ABC, abstractmethod
from typing import Any

from app.config import settings


class BaseGovernmentClient(ABC):
    """Abstract base for government API integrations."""

    service_name: str = "base"

    def __init__(self):
        self._log = logging.getLogger(f"udaansetu.gov.{self.service_name}")
        self._base_url = getattr(settings, f"{self.service_name.upper()}_API_URL", "")
        self._api_key = getattr(settings, f"{self.service_name.upper()}_API_KEY", "")

    @abstractmethod
    async def verify(self, **kwargs) -> dict[str, Any]:
        """Perform verification/lookup against the government API."""
        ...

    def _mock_response(self, status: str, **extra) -> dict[str, Any]:
        """Return a standardized mock response."""
        return {
            "service": self.service_name,
            "status": status,
            "timestamp": int(time.time()),
            "request_id": hashlib.sha256(f"{self.service_name}-{time.time()}".encode()).hexdigest()[:16],
            "demo": True,
            **extra,
        }

    def _log_audit(self, action: str, detail: dict):
        self._log.info(f"[AUDIT] {action}: {detail}")
