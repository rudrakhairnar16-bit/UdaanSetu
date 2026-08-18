"""UdaanSetu API — SIH1608 Innovation Ecosystem Platform."""
import logging
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Record
from app.middleware import setup_middleware
from app.seed import seed

from app.routes.auth import router as auth_router
from app.routes.records import router as records_router
from app.routes.dashboard import router as dashboard_router
from app.routes.ai import router as ai_router
from app.routes.notifications import router as notifications_router
from app.routes.audit import router as audit_router
from app.routes.documents import router as documents_router
from app.routes.government import router as government_router

_log = logging.getLogger("udaansetu")


def _init_ml_background():
    """Initialize ML models in background thread."""
    try:
        s = SessionLocal()
        try:
            records = s.query(Record).all()
            if records:
                from app.ml.engine import get_semantic_engine, get_training_pipeline
                sem = get_semantic_engine()
                _log.info("Loading semantic model (first time downloads ~90MB)...")
                sem.initialize(
                    [f"{r.title} {r.description} {r.sector} {r.district}" for r in records],
                    [r.id for r in records],
                )
                pipeline = get_training_pipeline()
                pipeline.train_all([{"id": r.id, "title": r.title, "description": r.description,
                                    "sector": r.sector, "district": r.district} for r in records])
                _log.info(f"ML init complete: {len(records)} records indexed")
        finally:
            s.close()
    except Exception as e:
        _log.warning(f"ML init skipped (will lazy-load on first request): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed()
    threading.Thread(target=_init_ml_background, daemon=True).start()
    yield


app = FastAPI(
    title="UdaanSetu API",
    version="1.0.0",
    description="SIH1608 Innovation Ecosystem Platform",
    lifespan=lifespan,
)

setup_middleware(app)

app.include_router(auth_router)
app.include_router(records_router)
app.include_router(dashboard_router)
app.include_router(ai_router)
app.include_router(notifications_router)
app.include_router(audit_router)
app.include_router(documents_router)
app.include_router(government_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "UdaanSetu API", "version": "1.0.0", "demo_data": True}


# --- Backward compatibility: re-export everything tests import from app.main ---
# This block ensures existing test files continue to work without modification.
from app.models import User, Record, AuditLog, Notification, TokenBlacklist  # noqa: F401, E402
from app.dependencies import pwd, create_token, token_hash, db  # noqa: F401, E402
from app.utils import (  # noqa: F401, E402
    words, similarity, compute_risk, sanitize_input, validate_password_strength, RECORD_KINDS,
)
from app.config import settings as settings  # noqa: F401, E402


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
