"""Structured JSON logging, request tracing, and metrics collection."""
import json
import time
import logging
from datetime import datetime, timezone
from typing import Optional
from contextvars import ContextVar
from collections import defaultdict

# --- Structured JSON Formatter ---
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)


def setup_json_logging(level: str = "INFO"):
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(getattr(logging, level.upper()))


# --- Request Context ---
_request_id: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
_user_id: ContextVar[Optional[int]] = ContextVar("user_id", default=None)


def get_request_id() -> Optional[str]:
    return _request_id.get()


def get_user_id() -> Optional[int]:
    return _user_id.get()


# --- Prometheus-style Metrics ---
class MetricsCollector:
    """Collect and expose application metrics."""

    def __init__(self):
        self._counters: dict[str, int] = defaultdict(int)
        self._histograms: dict[str, list[float]] = defaultdict(list)
        self._gauges: dict[str, float] = {}
        self._start_time = time.time()

    def inc(self, name: str, value: int = 1):
        self._counters[name] += value

    def observe(self, name: str, value: float):
        self._histograms[name].append(value)

    def set(self, name: str, value: float):
        self._gauges[name] = value

    def get_metrics(self) -> dict:
        uptime = time.time() - self._start_time
        metrics = {
            "uptime_seconds": round(uptime, 1),
            "counters": dict(self._counters),
            "gauges": dict(self._gauges),
            "histograms": {},
        }
        for name, values in self._histograms.items():
            if values:
                metrics["histograms"][name] = {
                    "count": len(values),
                    "sum": round(sum(values), 3),
                    "avg": round(sum(values) / len(values), 3),
                    "min": round(min(values), 3),
                    "max": round(max(values), 3),
                    "p95": round(sorted(values)[int(len(values) * 0.95)], 3),
                }
        return metrics

    def prometheus_format(self) -> str:
        """Export metrics in Prometheus text format."""
        lines = []
        for name, value in sorted(self._counters.items()):
            lines.append(f"udaansetu_{name}_total {value}")
        for name, value in sorted(self._gauges.items()):
            lines.append(f"udaansetu_{name} {value}")
        for name, values in sorted(self._histograms.items()):
            if values:
                lines.append(f"udaansetu_{name}_count {len(values)}")
                lines.append(f"udaansetu_{name}_sum {sum(values):.3f}")
                for q, v in [("0.5", 0.5), ("0.9", 0.9), ("0.95", 0.95), ("0.99", 0.99)]:
                    idx = int(len(values) * v)
                    lines.append(f"udaansetu_{name}{{quantile=\"{q}\"}} {sorted(values)[min(idx, len(values)-1)]:.3f}")
        return "\n".join(lines) + "\n"


# Global metrics
metrics = MetricsCollector()


# --- Middleware ---
def metrics_middleware(app):
    """FastAPI middleware for metrics collection."""
    from starlette.middleware.base import BaseHTTPMiddleware

    class MetricsMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            import uuid
            req_id = str(uuid.uuid4())[:8]
            _request_id.set(req_id)

            start = time.time()
            metrics.inc("http_requests_total")
            metrics.inc(f"http_requests_by_method_{request.method}")

            response = await call_next(request)

            duration = time.time() - start
            metrics.observe("http_request_duration_seconds", duration)
            metrics.inc(f"http_responses_by_status_{response.status_code}")
            metrics.set("http_active_requests", 0)

            response.headers["X-Request-ID"] = req_id
            response.headers["X-Metrics-Duration"] = f"{duration:.3f}"
            return response

    app.add_middleware(MetricsMiddleware)
