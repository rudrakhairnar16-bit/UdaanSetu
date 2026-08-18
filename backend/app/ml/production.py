"""
ML Production Enhancements
==========================
Model versioning, drift detection, feedback loop, and monitoring.
"""
import json, time, logging
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Optional
from dataclasses import dataclass, field, asdict
from collections import deque

import numpy as np

logger = logging.getLogger("udaansetu.ml.prod")

MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Model Registry — version tracking
# ---------------------------------------------------------------------------
@dataclass
class ModelVersion:
    version: str
    model_type: str
    trained_at: str
    metrics: dict
    artifact_path: str
    is_active: bool = True
    promoted_by: str = "system"
    notes: str = ""


class ModelRegistry:
    """Track model versions, artifacts, and promote/deprecate."""

    def __init__(self):
        self._versions_file = MODEL_DIR / "model_versions.json"
        self._versions: list[ModelVersion] = []
        self._load()

    def _load(self):
        if self._versions_file.exists():
            with open(self._versions_file) as f:
                data = json.load(f)
            self._versions = [ModelVersion(**v) for v in data]
        else:
            self._versions = []

    def _save(self):
        with open(self._versions_file, "w") as f:
            json.dump([asdict(v) for v in self._versions], f, indent=2)

    def register(self, model_type: str, metrics: dict, artifact_path: str, notes: str = "") -> ModelVersion:
        """Register a new model version."""
        now = datetime.now(timezone.utc)
        # Auto-increment version
        existing = [v for v in self._versions if v.model_type == model_type]
        major = max([int(v.version.split(".")[0]) for v in existing], default=0) + 1
        version_str = f"{major}.0.0"

        mv = ModelVersion(
            version=version_str,
            model_type=model_type,
            trained_at=now.isoformat(),
            metrics=metrics,
            artifact_path=artifact_path,
            is_active=True,
            notes=notes,
        )
        self._versions.append(mv)
        self._save()
        logger.info(f"Registered model {model_type} v{version_str}")
        return mv

    def get_active(self, model_type: str) -> Optional[ModelVersion]:
        """Get the active version for a model type."""
        active = [v for v in self._versions if v.model_type == model_type and v.is_active]
        return active[-1] if active else None

    def promote(self, version: str, model_type: str):
        """Promote a version (deactivate others)."""
        for v in self._versions:
            if v.model_type == model_type:
                v.is_active = v.version == version
        self._save()
        logger.info(f"Promoted {model_type} v{version}")

    def list_versions(self, model_type: str = "") -> list[dict]:
        """List all versions, optionally filtered."""
        filtered = [v for v in self._versions if not model_type or v.model_type == model_type]
        return [asdict(v) for v in filtered]


# ---------------------------------------------------------------------------
# Drift Detector — monitor prediction distributions
# ---------------------------------------------------------------------------
@dataclass
class DriftAlert:
    model_type: str
    drift_type: str  # "prediction_drift", "feature_drift", "performance_degradation"
    severity: str    # "low", "medium", "high"
    message: str
    detected_at: str
    details: dict = field(default_factory=dict)


class DriftDetector:
    """Detect model drift by monitoring prediction and feature distributions."""

    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self._predictions: dict[str, deque] = {}
        self._features: dict[str, deque] = {}
        self._baseline: dict = {}
        self._alerts: list[DriftAlert] = []
        self._drift_file = MODEL_DIR / "drift_history.json"
        self._load()

    def _load(self):
        if self._drift_file.exists():
            with open(self._drift_file) as f:
                data = json.load(f)
            self._alerts = [DriftAlert(**a) for a in data.get("alerts", [])]

    def _save(self):
        with open(self._drift_file, "w") as f:
            json.dump({"alerts": [asdict(a) for a in self._alerts[-100:]]}, f, indent=2)

    def set_baseline(self, model_type: str, predictions: list[float], features: dict[str, list[float]]):
        """Set baseline distribution for drift detection."""
        self._baseline[model_type] = {
            "mean": float(np.mean(predictions)),
            "std": float(np.std(predictions)),
            "feature_means": {k: float(np.mean(v)) for k, v in features.items()},
            "feature_stds": {k: float(np.std(v)) for k, v in features.items()},
            "set_at": datetime.now(timezone.utc).isoformat(),
        }
        self._predictions[model_type] = deque(predictions[-self.window_size:], maxlen=self.window_size)
        self._features[model_type] = {}
        for k, v in features.items():
            self._features[model_type][k] = deque(v[-self.window_size:], maxlen=self.window_size)

    def record_prediction(self, model_type: str, prediction: float, features: dict[str, float] = None):
        """Record a new prediction for drift monitoring."""
        if model_type not in self._predictions:
            self._predictions[model_type] = deque(maxlen=self.window_size)
        self._predictions[model_type].append(prediction)

        if features:
            if model_type not in self._features:
                self._features[model_type] = {}
            for k, v in features.items():
                if k not in self._features[model_type]:
                    self._features[model_type][k] = deque(maxlen=self.window_size)
                self._features[model_type][k].append(v)

        # Check drift every window_size predictions
        if len(self._predictions[model_type]) >= self.window_size:
            self._check_drift(model_type)

    def _check_drift(self, model_type: str):
        """Run drift detection checks."""
        if model_type not in self._baseline:
            return

        baseline = self._baseline[model_type]
        current = list(self._predictions[model_type])

        # 1. Prediction distribution drift (KS test approximation)
        curr_mean = float(np.mean(current))
        curr_std = float(np.std(current))
        mean_drift = abs(curr_mean - baseline["mean"]) / max(baseline["std"], 0.01)
        std_drift = abs(curr_std - baseline["std"]) / max(baseline["std"], 0.01)

        if mean_drift > 2.0:
            alert = DriftAlert(
                model_type=model_type,
                drift_type="prediction_drift",
                severity="high",
                message=f"Prediction mean shifted by {mean_drift:.1f}σ (baseline: {baseline['mean']:.3f}, current: {curr_mean:.3f})",
                detected_at=datetime.now(timezone.utc).isoformat(),
                details={"baseline_mean": baseline["mean"], "current_mean": curr_mean, "drift_sigma": mean_drift},
            )
            self._alerts.append(alert)
            logger.warning(f"DRIFT ALERT [{alert.severity}]: {alert.message}")

        # 2. Feature drift (PSI approximation)
        if model_type in self._features:
            for fname, fvals in self._features[model_type].items():
                if fname in baseline["feature_means"] and len(fvals) > 10:
                    curr_fmean = float(np.mean(fvals))
                    base_fmean = baseline["feature_means"][fname]
                    base_fstd = baseline["feature_stds"].get(fname, 0.01)
                    drift = abs(curr_fmean - base_fmean) / max(base_fstd, 0.01)

                    if drift > 2.5:
                        alert = DriftAlert(
                            model_type=model_type,
                            drift_type="feature_drift",
                            severity="medium",
                            message=f"Feature '{fname}' drifted by {drift:.1f}σ",
                            detected_at=datetime.now(timezone.utc).isoformat(),
                            details={"feature": fname, "baseline": base_fmean, "current": curr_fmean, "drift_sigma": drift},
                        )
                        self._alerts.append(alert)
                        logger.warning(f"FEATURE DRIFT: {alert.message}")

        self._save()

    def get_alerts(self, model_type: str = "", severity: str = "") -> list[dict]:
        """Get drift alerts."""
        filtered = self._alerts
        if model_type:
            filtered = [a for a in filtered if a.model_type == model_type]
        if severity:
            filtered = [a for a in filtered if a.severity == severity]
        return [asdict(a) for a in filtered[-50:]]

    def get_status(self, model_type: str) -> dict:
        """Get drift status summary."""
        baseline = self._baseline.get(model_type, {})
        recent_alerts = [a for a in self._alerts if a.model_type == model_type]
        return {
            "model_type": model_type,
            "baseline_set": bool(baseline),
            "baseline_date": baseline.get("set_at"),
            "prediction_window": len(self._predictions.get(model_type, [])),
            "total_alerts": len(recent_alerts),
            "high_severity": len([a for a in recent_alerts if a.severity == "high"]),
            "medium_severity": len([a for a in recent_alerts if a.severity == "medium"]),
            "low_severity": len([a for a in recent_alerts if a.severity == "low"]),
        }


# ---------------------------------------------------------------------------
# Feedback Store — user corrections for RLHF
# ---------------------------------------------------------------------------
@dataclass
class FeedbackEntry:
    id: int
    model_type: str
    record_id: int
    prediction_type: str  # "risk", "success", "recommendation"
    predicted_value: any
    actual_value: any
    user_id: int
    notes: str
    created_at: str


class FeedbackStore:
    """Store user feedback on ML predictions for model improvement."""

    def __init__(self):
        self._feedback_file = MODEL_DIR / "feedback.json"
        self._entries: list[FeedbackEntry] = []
        self._next_id = 1
        self._load()

    def _load(self):
        if self._feedback_file.exists():
            with open(self._feedback_file) as f:
                data = json.load(f)
            self._entries = [FeedbackEntry(**e) for e in data]
            self._next_id = max([e.id for e in self._entries], default=0) + 1

    def _save(self):
        with open(self._feedback_file, "w") as f:
            json.dump([asdict(e) for e in self._entries], f, indent=2)

    def submit(self, model_type: str, record_id: int, prediction_type: str,
               predicted_value: any, actual_value: any, user_id: int, notes: str = "") -> dict:
        """Submit user feedback on a prediction."""
        entry = FeedbackEntry(
            id=self._next_id,
            model_type=model_type,
            record_id=record_id,
            prediction_type=prediction_type,
            predicted_value=predicted_value,
            actual_value=actual_value,
            user_id=user_id,
            notes=notes,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._entries.append(entry)
        self._next_id += 1
        self._save()
        logger.info(f"Feedback #{entry.id}: {prediction_type} for record {record_id}")
        return asdict(entry)

    def get_accuracy(self, model_type: str = "", prediction_type: str = "") -> dict:
        """Calculate accuracy from user feedback."""
        filtered = self._entries
        if model_type:
            filtered = [e for e in filtered if e.model_type == model_type]
        if prediction_type:
            filtered = [e for e in filtered if e.prediction_type == prediction_type]

        if not filtered:
            return {"total": 0, "correct": 0, "accuracy": None}

        correct = sum(1 for e in filtered if self._is_correct(e))
        return {
            "total": len(filtered),
            "correct": correct,
            "accuracy": round(correct / len(filtered) * 100, 1) if filtered else None,
            "by_type": self._group_accuracy(filtered),
        }

    def _is_correct(self, entry: FeedbackEntry) -> bool:
        """Check if feedback indicates correct prediction."""
        if entry.prediction_type == "risk":
            # Risk was correct if user marked it as same level
            return str(entry.predicted_value).lower() == str(entry.actual_value).lower()
        elif entry.prediction_type == "success":
            # Success prediction correct if within 20% of actual
            try:
                pred = float(entry.predicted_value)
                actual = float(entry.actual_value)
                return abs(pred - actual) < 20
            except (ValueError, TypeError):
                return False
        return entry.predicted_value == entry.actual_value

    def _group_accuracy(self, entries: list[FeedbackEntry]) -> dict:
        """Group accuracy by prediction type."""
        groups = {}
        for e in entries:
            if e.prediction_type not in groups:
                groups[e.prediction_type] = {"total": 0, "correct": 0}
            groups[e.prediction_type]["total"] += 1
            if self._is_correct(e):
                groups[e.prediction_type]["correct"] += 1

        for k, v in groups.items():
            v["accuracy"] = round(v["correct"] / v["total"] * 100, 1) if v["total"] > 0 else None
        return groups

    def get_recent(self, limit: int = 20) -> list[dict]:
        """Get recent feedback entries."""
        return [asdict(e) for e in self._entries[-limit:]]


# ---------------------------------------------------------------------------
# Batch Predictor — async inference
# ---------------------------------------------------------------------------
class BatchPredictor:
    """Run batch predictions efficiently in background."""

    def __init__(self):
        self._jobs: dict[str, dict] = {}
        self._results_file = MODEL_DIR / "batch_results.json"

    def submit_risk_batch(self, records: list[dict], user_id: int) -> str:
        """Submit a batch risk prediction job."""
        import uuid
        job_id = str(uuid.uuid4())[:8]
        self._jobs[job_id] = {
            "id": job_id,
            "type": "risk_batch",
            "status": "queued",
            "total": len(records),
            "completed": 0,
            "results": [],
            "user_id": user_id,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None,
        }
        return job_id

    def get_job(self, job_id: str) -> Optional[dict]:
        """Get job status and results."""
        return self._jobs.get(job_id)

    def complete_job(self, job_id: str, results: list[dict]):
        """Mark job as complete with results."""
        if job_id in self._jobs:
            self._jobs[job_id]["status"] = "completed"
            self._jobs[job_id]["results"] = results
            self._jobs[job_id]["completed"] = len(results)
            self._jobs[job_id]["completed_at"] = datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Global instances
# ---------------------------------------------------------------------------
_model_registry: Optional[ModelRegistry] = None
_drift_detector: Optional[DriftDetector] = None
_feedback_store: Optional[FeedbackStore] = None
_batch_predictor: Optional[BatchPredictor] = None


def get_model_registry() -> ModelRegistry:
    global _model_registry
    if _model_registry is None:
        _model_registry = ModelRegistry()
    return _model_registry


def get_drift_detector() -> DriftDetector:
    global _drift_detector
    if _drift_detector is None:
        _drift_detector = DriftDetector()
    return _drift_detector


def get_feedback_store() -> FeedbackStore:
    global _feedback_store
    if _feedback_store is None:
        _feedback_store = FeedbackStore()
    return _feedback_store


def get_batch_predictor() -> BatchPredictor:
    global _batch_predictor
    if _batch_predictor is None:
        _batch_predictor = BatchPredictor()
    return _batch_predictor
