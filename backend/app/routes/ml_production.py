"""ML Production routes — feedback, drift, model registry, batch prediction."""
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any

from app.dependencies import current
from app.ml.production import (
    get_model_registry, get_drift_detector, get_feedback_store, get_batch_predictor,
)
from app.ml.engine import get_risk_engine, get_semantic_engine, get_training_pipeline
from dataclasses import asdict

router = APIRouter(prefix="/ml", tags=["ML Production"])
_log = logging.getLogger("udaansetu.ml.routes")


# --- Feedback ---

class FeedbackIn(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_type: str
    record_id: int
    prediction_type: str
    predicted_value: Any
    actual_value: Any
    notes: str = ""


@router.post("/feedback")
async def submit_feedback(body: FeedbackIn, user=Depends(current)):
    """Submit user feedback on ML prediction for model improvement."""
    store = get_feedback_store()
    result = store.submit(
        model_type=body.model_type,
        record_id=body.record_id,
        prediction_type=body.prediction_type,
        predicted_value=body.predicted_value,
        actual_value=body.actual_value,
        user_id=user.id,
        notes=body.notes,
    )
    return result


@router.get("/feedback/accuracy")
async def feedback_accuracy(model_type: str = "", prediction_type: str = "", user=Depends(current)):
    """Get accuracy metrics from user feedback."""
    store = get_feedback_store()
    return store.get_accuracy(model_type, prediction_type)


@router.get("/feedback/recent")
async def feedback_recent(limit: int = 20, user=Depends(current)):
    """Get recent feedback entries."""
    store = get_feedback_store()
    return store.get_recent(limit)


# --- Drift Detection ---

@router.get("/drift/status")
async def drift_status(model_type: str = "risk", user=Depends(current)):
    """Get drift detection status for a model."""
    detector = get_drift_detector()
    return detector.get_status(model_type)


@router.get("/drift/alerts")
async def drift_alerts(model_type: str = "", severity: str = "", user=Depends(current)):
    """Get drift alerts."""
    detector = get_drift_detector()
    return detector.get_alerts(model_type, severity)


# --- Model Registry ---

@router.get("/registry/versions")
async def list_versions(model_type: str = "", user=Depends(current)):
    """List all model versions."""
    registry = get_model_registry()
    return registry.list_versions(model_type)


@router.get("/registry/active/{model_type}")
async def active_version(model_type: str, user=Depends(current)):
    """Get active version for a model type."""
    registry = get_model_registry()
    v = registry.get_active(model_type)
    if not v:
        raise HTTPException(404, f"No active version for {model_type}")
    return asdict(v)


@router.post("/registry/promote")
async def promote_version(version: str, model_type: str, user=Depends(current)):
    """Promote a model version to active."""
    if user.role != "admin":
        raise HTTPException(403, "Only admins can promote models")
    registry = get_model_registry()
    registry.promote(version, model_type)
    return {"message": f"Promoted {model_type} v{version}"}


# --- Batch Prediction ---

class BatchRiskIn(BaseModel):
    record_ids: list[int]


@router.post("/batch/risk")
async def batch_risk(body: BatchRiskIn, user=Depends(current)):
    """Submit a batch risk prediction job."""
    predictor = get_batch_predictor()
    job_id = predictor.submit_risk_batch(
        [{"id": rid} for rid in body.record_ids], user.id
    )
    return {"job_id": job_id, "status": "queued", "total": len(body.record_ids)}


@router.get("/batch/{job_id}")
async def batch_status(job_id: str, user=Depends(current)):
    """Get batch prediction job status."""
    predictor = get_batch_predictor()
    job = predictor.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


# --- Model Retraining ---

@router.post("/retrain")
async def retrain_model(user=Depends(current)):
    """Trigger model retraining with current data."""
    if user.role != "admin":
        raise HTTPException(403, "Only admins can trigger retraining")
    from app.database import SessionLocal
    from app.models import Record

    _log.info(f"Retrain triggered by user {user.id}")
    s = SessionLocal()
    try:
        records = s.query(Record).all()
        pipeline = get_training_pipeline()
        results = pipeline.train_all([
            {"id": r.id, "title": r.title, "description": r.description,
             "sector": r.sector, "district": r.district}
            for r in records
        ])

        # Register new version
        registry = get_model_registry()
        if pipeline.risk_engine._metrics:
            from dataclasses import asdict
            registry.register("risk_model", asdict(pipeline.risk_engine._metrics), "risk_model.pkl", "Retrained via API")

        return {"message": f"Retrained on {len(records)} records", "results": results}
    finally:
        s.close()
