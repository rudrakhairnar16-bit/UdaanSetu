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
from app.monitoring import metrics_middleware

from app.routes.auth import router as auth_router
from app.routes.records import router as records_router
from app.routes.dashboard import router as dashboard_router
from app.routes.ai import router as ai_router
from app.routes.notifications import router as notifications_router
from app.routes.audit import router as audit_router
from app.routes.documents import router as documents_router
from app.routes.government import router as government_router
from app.routes.ml_production import router as ml_prod_router
from app.routes.challenges import router as challenges_router
from app.routes.departments import router as departments_router
from app.routes.pilots import router as pilots_router
from app.routes.payments import router as payments_router
from app.routes.evaluations import router as evaluations_router
from app.routes.scale_ups import router as scale_ups_router
from app.routes.templates import router as templates_router
from app.routes.applications import router as applications_router
from app.routes.validations import router as validations_router
from app.routes.procurements import router as procurements_router
from app.routes.grievances import router as grievances_router
from app.routes.challenge_versions import router as challenge_versions_router
from app.routes.challenge_requirements import router as challenge_requirements_router
from app.routes.purchase_orders import router as purchase_orders_router
from app.routes.ip_data_agreements import router as ip_data_agreements_router
from app.routes.compliance import router as compliance_router
from app.routes.evaluation_scores import router as evaluation_scores_router
from app.routes.document_versions import router as document_versions_router
from app.routes.pilot_incidents import router as pilot_incidents_router

_log = logging.getLogger("udaansetu")


def _init_ml_background():
    """Initialize ML models in background thread."""
    try:
        s = SessionLocal()
        try:
            records = s.query(Record).all()
            if records:
                from app.ml.engine import get_semantic_engine, get_training_pipeline, build_records_data
                sem = get_semantic_engine()
                _log.info(f"Initializing ML with {len(records)} records...")
                sem.initialize(
                    [f"{r.title} {r.description} {r.sector} {r.district}" for r in records],
                    [r.id for r in records],
                )
                pipeline = get_training_pipeline()
                results = pipeline.train_all(build_records_data(records))
                risk_info = results.get("risk_source", {})
                _log.info(f"ML init complete: {len(records)} records, "
                         f"risk model source={risk_info.get('source','?')}, "
                         f"samples={risk_info.get('samples',0)}")
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
    title="UdaanSetu · SIH26136 · Govt of Maharashtra",
    description="Innovation Discovery & Procurement Workflow Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.openapi_tags = [
    {"name": "users", "description": "User management and authentication"},
    {"name": "challenges", "description": "Govt problem challenges lifecycle"},
    {"name": "challenge-versions", "description": "Challenge version history and restore"},
    {"name": "challenge-requirements", "description": "Challenge requirements management"},
    {"name": "applications", "description": "Startup applications and eligibility"},
    {"name": "evaluations", "description": "Evaluation committee scoring"},
    {"name": "evaluation-scores", "description": "Weighted evaluation scoring"},
    {"name": "pilots", "description": "Pilot management and milestones"},
    {"name": "pilot-incidents", "description": "Pilot incident management"},
    {"name": "pilot-metrics", "description": "Pilot KPI tracking"},
    {"name": "pilot-evidence", "description": "Pilot evidence uploads"},
    {"name": "validations", "description": "Independent validation"},
    {"name": "procurements", "description": "Procurement workflow"},
    {"name": "purchase-orders", "description": "Purchase order lifecycle"},
    {"name": "ip-data-agreements", "description": "IP and data governance"},
    {"name": "compliance", "description": "Compliance checklists"},
    {"name": "scale-ups", "description": "Scale-up decisions"},
    {"name": "grievances", "description": "Grievance redressal"},
    {"name": "templates", "description": "Procurement templates"},
    {"name": "documents", "description": "Document management and ACL"},
    {"name": "document-versions", "description": "Document version tracking"},
    {"name": "analytics", "description": "Dashboard analytics and metrics"},
    {"name": "ai", "description": "AI-powered matching and predictions"},
]

setup_middleware(app)
metrics_middleware(app)

app.include_router(auth_router)
app.include_router(records_router)
app.include_router(dashboard_router)
app.include_router(ai_router)
app.include_router(notifications_router)
app.include_router(audit_router)
app.include_router(documents_router)
app.include_router(government_router)
app.include_router(ml_prod_router)
app.include_router(challenges_router)
app.include_router(departments_router)
app.include_router(pilots_router)
app.include_router(payments_router)
app.include_router(evaluations_router)
app.include_router(scale_ups_router)
app.include_router(templates_router)
app.include_router(applications_router)
app.include_router(validations_router)
app.include_router(procurements_router)
app.include_router(grievances_router)
app.include_router(challenge_versions_router)
app.include_router(challenge_requirements_router)
app.include_router(purchase_orders_router)
app.include_router(ip_data_agreements_router)
app.include_router(compliance_router)
app.include_router(evaluation_scores_router)
app.include_router(document_versions_router)
app.include_router(pilot_incidents_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "UdaanSetu API", "version": "2.0.0", "demo_data": True}


@app.get("/metrics")
def metrics_endpoint():
    """Prometheus-compatible metrics endpoint."""
    from app.monitoring import metrics
    return metrics.get_metrics()


@app.get("/metrics/prometheus")
def metrics_prometheus():
    """Prometheus text format metrics."""
    from app.monitoring import metrics
    from starlette.responses import Response
    return Response(content=metrics.prometheus_format(), media_type="text/plain")


# --- Backward compatibility: re-export everything tests import from app.main ---
# This block ensures existing test files continue to work without modification.
from app.models import User, Record, AuditLog, Notification, TokenBlacklist, Challenge, Department, Pilot, PilotMilestone, Payment, Evaluation, ScaleUpDecision, Template, Application, EligibilityCheck, Validation, Procurement, Contract, Grievance, IPDataAgreement, PilotMetric, PilotEvidence, EvaluationScore, ConflictOfInterest, ChallengeRequirement, PurchaseOrder, ChallengeVersion, ComplianceChecklist, DocumentVersion, DocumentACL, PilotIncident  # noqa: F401, E402
from app.dependencies import pwd, create_token, token_hash, db  # noqa: F401, E402
from app.utils import (  # noqa: F401, E402
    words, similarity, compute_risk, sanitize_input, validate_password_strength, RECORD_KINDS,
)
from app.config import settings as settings  # noqa: F401, E402


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
