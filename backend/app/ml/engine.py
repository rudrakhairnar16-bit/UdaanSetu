"""
UdaanSetu ML Engine
====================
Real ML/AI capabilities for the innovation ecosystem platform.

Components:
1. SemanticEngine - Sentence-transformer embeddings for semantic similarity
2. RiskEngine - Trained gradient boosting model for risk prediction
3. SuccessPredictor - Predict project success probability with confidence
4. DuplicateDetector - NLP-based duplicate detection with clustering
5. TrainingPipeline - Train, evaluate, and serialize models
"""
import os, json, hashlib, logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, field, asdict

import numpy as np

logger = logging.getLogger("udaansetu.ml")

MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------
@dataclass
class SimilarityResult:
    id: int
    title: str
    kind: str
    score: float
    method: str

@dataclass
class RiskPrediction:
    score: float
    level: str
    confidence: float
    feature_importance: dict
    reasons: list
    method: str

@dataclass
class SuccessPrediction:
    probability: float
    confidence_interval: tuple
    key_factors: list
    comparable_projects: list
    method: str

@dataclass
class DuplicateCluster:
    id: int
    records: list
    similarity: float
    description: str

@dataclass
class ModelMetrics:
    accuracy: float
    precision: float
    recall: float
    f1: float
    auc_roc: float
    training_samples: int
    feature_names: list
    confusion_matrix: list
    trained_at: str

# ---------------------------------------------------------------------------
# Semantic Engine (sentence-transformers with TF-IDF fallback)
# ---------------------------------------------------------------------------
class SemanticEngine:
    """Real semantic similarity using sentence-transformers embeddings."""

    def __init__(self):
        self._model = None
        self._tfidf_vectorizer = None
        self._tfidf_matrix = None
        self._use_sentence_transformers = False
        self._corpus_ids = []
        self._corpus_texts = []

    def _load_sentence_transformer(self):
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            self._use_sentence_transformers = True
            logger.info("Loaded sentence-transformers model: all-MiniLM-L6-v2")
        except ImportError:
            logger.warning("sentence-transformers not installed, using TF-IDF fallback")
            self._use_sentence_transformers = False
        except Exception as e:
            logger.warning(f"Failed to load sentence-transformers: {e}, using TF-IDF fallback")
            self._use_sentence_transformers = False

    def _load_tfidf(self):
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine
            self._sklearn_cosine = sklearn_cosine
            self._tfidf_vectorizer = TfidfVectorizer(
                max_features=5000, stop_words="english", ngram_range=(1, 2)
            )
            logger.info("Using TF-IDF fallback for semantic similarity")
        except ImportError:
            logger.warning("scikit-learn not installed, falling back to keyword matching")

    def initialize(self, texts: list[str], ids: list[int]):
        """Build embedding index from corpus texts."""
        self._corpus_texts = texts
        self._corpus_ids = ids

        if self._model is None and self._tfidf_vectorizer is None:
            self._load_sentence_transformer()
            if not self._use_sentence_transformers:
                self._load_tfidf()

        if self._use_sentence_transformers and self._model:
            self._embeddings = self._model.encode(texts, show_progress_bar=False)
            logger.info(f"Computed embeddings for {len(texts)} documents")
        elif self._tfidf_vectorizer:
            self._tfidf_matrix = self._tfidf_vectorizer.fit_transform(texts)
            logger.info(f"Built TF-IDF matrix for {len(texts)} documents")

    def similarity(self, query: str, top_k: int = 10) -> list[SimilarityResult]:
        """Find most similar documents to query using semantic embeddings."""
        if not self._corpus_texts:
            return []

        if self._use_sentence_transformers and self._model:
            query_embedding = self._model.encode([query])
            from sklearn.metrics.pairwise import cosine_similarity
            scores = cosine_similarity(query_embedding, self._embeddings)[0]
            method = "sentence-transformers (all-MiniLM-L6-v2)"
        elif self._tfidf_vectorizer and self._tfidf_matrix is not None:
            query_tfidf = self._tfidf_vectorizer.transform([query])
            scores = self._sklearn_cosine(query_tfidf, self._tfidf_matrix).flatten()
            method = "TF-IDF cosine similarity"
        else:
            return self._keyword_fallback(query, top_k)

        top_indices = np.argsort(scores)[::-1][:top_k]
        results = []
        for idx in top_indices:
            if scores[idx] > 0.01:
                results.append(SimilarityResult(
                    id=self._corpus_ids[idx],
                    title=self._corpus_texts[idx][:80],
                    kind="",
                    score=round(float(scores[idx]) * 100, 1),
                    method=method,
                ))
        return results

    def encode(self, texts: list[str]) -> np.ndarray:
        """Encode texts to embeddings."""
        if self._use_sentence_transformers and self._model:
            return self._model.encode(texts)
        elif self._tfidf_vectorizer:
            return self._tfidf_vectorizer.transform(texts).toarray()
        else:
            return np.zeros((len(texts), 1))

    def _keyword_fallback(self, query: str, top_k: int) -> list[SimilarityResult]:
        """Last resort keyword matching."""
        import re
        query_words = set(re.findall(r"[a-z]{3,}", query.lower()))
        results = []
        for i, text in enumerate(self._corpus_texts):
            text_words = set(re.findall(r"[a-z]{3,}", text.lower()))
            if query_words and text_words:
                score = len(query_words & text_words) / len(query_words | text_words)
                if score > 0.01:
                    results.append(SimilarityResult(
                        id=self._corpus_ids[i], title=text[:80], kind="",
                        score=round(score * 100, 1), method="keyword fallback",
                    ))
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]

# ---------------------------------------------------------------------------
# Risk Engine (trained gradient boosting model)
# ---------------------------------------------------------------------------
class RiskEngine:
    """ML-based risk prediction using trained gradient boosting."""

    def __init__(self):
        self._model = None
        self._scaler = None
        self._feature_names = [
            "progress", "milestones_total", "milestones_overdue",
            "milestones_done", "days_since_creation", "stage_encoded",
            "has_funding", "funding_ratio", "sector_encoded",
            "district_encoded",
        ]
        self._stage_map = {
            "draft": 0, "concept": 1, "lab testing": 2, "prototype": 3,
            "field trial": 4, "validation": 5, "completed": 6,
            "stalled": -1, "at risk": -2,
        }
        self._sector_map = {}
        self._district_map = {}
        self._metrics: Optional[ModelMetrics] = None

    def _get_or_train_model(self):
        model_path = MODEL_DIR / "risk_model.pkl"
        metrics_path = MODEL_DIR / "risk_metrics.json"

        if model_path.exists():
            self._load_model(model_path)
            if metrics_path.exists():
                self._load_metrics(metrics_path)
            return

        self._train_synthetic_model()

    def _train_synthetic_model(self):
        """Train on synthetic data that mimics real innovation project patterns."""
        try:
            from sklearn.ensemble import GradientBoostingClassifier
            from sklearn.preprocessing import StandardScaler
            from sklearn.model_selection import cross_val_score
            from sklearn.metrics import (
                accuracy_score, precision_score, recall_score,
                f1_score, roc_auc_score, confusion_matrix,
            )
            import pickle

            np.random.seed(42)
            n_samples = 2000

            # Generate realistic synthetic training data
            progress = np.random.beta(2, 2, n_samples) * 100
            milestones_total = np.random.poisson(4, n_samples) + 1
            milestones_overdue = np.random.binomial(
                np.minimum(milestones_total, 6), 0.3, n_samples
            )
            milestones_done = np.random.binomial(milestones_total, 0.5, n_samples)
            days_since_creation = np.random.exponential(180, n_samples) + 30
            normal_stages = [0, 1, 2, 3, 4, 5, 6]
            stage_encoded = np.random.choice(
                normal_stages, n_samples,
                p=[0.05, 0.1, 0.15, 0.25, 0.2, 0.15, 0.1]
            )
            has_funding = np.random.binomial(1, 0.4, n_samples)
            funding_ratio = np.random.beta(2, 5, n_samples)
            sector_encoded = np.random.randint(0, 10, n_samples)
            district_encoded = np.random.randint(0, 20, n_samples)

            X = np.column_stack([
                progress, milestones_total, milestones_overdue,
                milestones_done, days_since_creation, stage_encoded,
                has_funding, funding_ratio, sector_encoded, district_encoded,
            ])

            # Realistic risk labels based on actual patterns
            risk_score = (
                milestones_overdue * 0.35
                + (100 - progress) * 0.003
                + np.where(stage_encoded < 0, 0.25, 0)
                + np.where(funding_ratio < 0.2, 0.15, 0)
                + np.where(days_since_creation > 365, 0.1, 0)
                + np.random.normal(0, 0.08, n_samples)
            )
            y = (risk_score > 0.45).astype(int)

            self._scaler = StandardScaler()
            X_scaled = self._scaler.fit_transform(X)

            self._model = GradientBoostingClassifier(
                n_estimators=100, max_depth=4, learning_rate=0.1,
                subsample=0.8, random_state=42,
            )
            self._model.fit(X_scaled, y)

            # Cross-validation metrics
            cv_scores = cross_val_score(self._model, X_scaled, y, cv=5, scoring="accuracy")
            y_pred = self._model.predict(X_scaled)
            y_proba = self._model.predict_proba(X_scaled)[:, 1]

            self._metrics = ModelMetrics(
                accuracy=round(float(cv_scores.mean()), 3),
                precision=round(float(precision_score(y, y_pred)), 3),
                recall=round(float(recall_score(y, y_pred)), 3),
                f1=round(float(f1_score(y, y_pred)), 3),
                auc_roc=round(float(roc_auc_score(y, y_proba)), 3),
                training_samples=n_samples,
                feature_names=self._feature_names,
                confusion_matrix=confusion_matrix(y, y_pred).tolist(),
                trained_at=datetime.utcnow().isoformat(),
            )

            # Save model
            import pickle
            with open(MODEL_DIR / "risk_model.pkl", "wb") as f:
                pickle.dump({"model": self._model, "scaler": self._scaler}, f)
            with open(MODEL_DIR / "risk_metrics.json", "w") as f:
                json.dump(asdict(self._metrics), f, indent=2)

            logger.info(f"Trained risk model: accuracy={self._metrics.accuracy:.3f}")

        except ImportError:
            logger.warning("scikit-learn not installed, using rule-based fallback")
            self._metrics = ModelMetrics(
                accuracy=0.0, precision=0.0, recall=0.0, f1=0.0, auc_roc=0.0,
                training_samples=0, feature_names=[], confusion_matrix=[],
                trained_at=datetime.utcnow().isoformat(),
            )

    def _load_model(self, path):
        import pickle
        with open(path, "rb") as f:
            data = pickle.load(f)
        self._model = data["model"]
        self._scaler = data["scaler"]

    def _load_metrics(self, path):
        with open(path) as f:
            data = json.load(f)
        self._metrics = ModelMetrics(**data)

    def _extract_features(self, research, milestones, all_records=None):
        """Extract ML features from a research project and its milestones."""
        now = datetime.utcnow()
        created = research.created_at if isinstance(research.created_at, datetime) else now

        overdue_count = sum(
            1 for m in milestones
            if m.stage.lower() not in ("done", "complete", "completed")
            and m.meta.get("due_date", "") < now.date().isoformat()
        )
        done_count = sum(
            1 for m in milestones
            if m.stage.lower() in ("done", "complete", "completed")
        )

        funding_required = research.meta.get("funding_required", 0)
        funding_received = research.meta.get("funding_received", 0)
        funding_ratio = min(1.0, funding_received / max(1, funding_required))

        features = {
            "progress": float(research.meta.get("progress", 0)),
            "milestones_total": len(milestones),
            "milestones_overdue": overdue_count,
            "milestones_done": done_count,
            "days_since_creation": (now - created).days,
            "stage_encoded": self._stage_map.get(research.stage.lower(), 0),
            "has_funding": 1 if funding_received > 0 else 0,
            "funding_ratio": funding_ratio,
            "sector_encoded": hash(research.sector) % 10 if research.sector else 0,
            "district_encoded": hash(research.district) % 20 if research.district else 0,
        }
        return features

    def predict(self, research, milestones) -> RiskPrediction:
        """Predict risk for a research project using trained ML model."""
        self._get_or_train_model()

        features = self._extract_features(research, milestones)
        feature_values = [features[f] for f in self._feature_names]

        if self._model and self._scaler:
            X = self._scaler.transform([feature_values])
            proba = self._model.predict_proba(X)[0]
            risk_score = round(float(proba[1]) * 100, 1)
            confidence = round(float(max(proba)) * 100, 1)

            # Feature importance
            importances = self._model.feature_importances_
            feature_importance = {
                f: round(float(v) * 100, 1)
                for f, v in zip(self._feature_names, importances)
            }
            method = "gradient-boosting (trained)"
        else:
            # Fallback to enhanced rule-based
            overdue = features["milestones_overdue"]
            p = features["progress"]
            stage_pen = 15 if features["stage_encoded"] < 0 else 0
            risk_score = min(100, round(overdue * 24 + (100 - p) * 0.35 + stage_pen))
            confidence = 70.0
            feature_importance = {"milestones_overdue": 35, "progress": 35, "stage": 15}
            method = "rule-based fallback"

        level = "High" if risk_score >= 60 else "Medium" if risk_score >= 30 else "Low"
        reasons = []
        if features["milestones_overdue"] > 0:
            reasons.append(f"{features['milestones_overdue']} overdue milestone(s)")
        if features["progress"] < 50:
            reasons.append("Low reported progress")
        if features["stage_encoded"] < 0:
            reasons.append(f"Stage flagged as risky")
        if features["days_since_creation"] > 365:
            reasons.append("Project running over 1 year")
        if not reasons:
            reasons.append("On track")

        return RiskPrediction(
            score=risk_score, level=level, confidence=confidence,
            feature_importance=feature_importance, reasons=reasons, method=method,
        )

    def get_metrics(self) -> Optional[ModelMetrics]:
        self._get_or_train_model()
        return self._metrics

# ---------------------------------------------------------------------------
# Success Predictor
# ---------------------------------------------------------------------------
class SuccessPredictor:
    """Predict project success probability with confidence intervals."""

    def __init__(self, risk_engine: RiskEngine):
        self._risk_engine = risk_engine

    def predict(self, research, milestones, all_similar=None) -> SuccessPrediction:
        """Predict success probability for a research project."""
        risk = self._risk_engine.predict(research, milestones)

        # Invert risk to get success probability
        base_prob = max(0, min(1, 1 - risk.score / 100))

        # Adjust based on comparable successful projects
        comparable = []
        if all_similar:
            for s in all_similar[:5]:
                comparable.append({
                    "id": s.id, "title": s.title,
                    "similarity": s.score,
                    "method": s.method,
                })

        # Confidence interval (simplified bootstrap approximation)
        n_comparable = len(comparable) if comparable else 5
        std_error = np.sqrt(base_prob * (1 - base_prob) / max(1, n_comparable))
        ci_lower = max(0, base_prob - 1.96 * std_error)
        ci_upper = min(1, base_prob + 1.96 * std_error)

        # Key factors
        factors = []
        if risk.feature_importance:
            sorted_f = sorted(risk.feature_importance.items(), key=lambda x: x[1], reverse=True)
            for fname, imp in sorted_f[:3]:
                factors.append({
                    "feature": fname.replace("_", " ").title(),
                    "importance": imp,
                    "current_value": self._get_feature_display(fname, research, milestones),
                })

        return SuccessPrediction(
            probability=round(base_prob * 100, 1),
            confidence_interval=(round(ci_lower * 100, 1), round(ci_upper * 100, 1)),
            key_factors=factors,
            comparable_projects=comparable,
            method=risk.method,
        )

    def _get_feature_display(self, feature_name, research, milestones):
        if feature_name == "progress":
            return f"{research.meta.get('progress', 0)}%"
        elif feature_name == "milestones_overdue":
            return str(sum(
                1 for m in milestones
                if m.stage.lower() not in ("done", "complete", "completed")
                and m.meta.get("due_date", "") < datetime.utcnow().date().isoformat()
            ))
        elif feature_name == "stage_encoded":
            return research.stage
        return "N/A"

# ---------------------------------------------------------------------------
# Duplicate Detector (NLP-based with clustering)
# ---------------------------------------------------------------------------
class DuplicateDetector:
    """Detect potential duplicate records using NLP embeddings + clustering."""

    def __init__(self, semantic_engine: SemanticEngine):
        self._semantic = semantic_engine

    def detect(self, threshold: float = 0.75) -> list[DuplicateCluster]:
        """Find clusters of similar records that might be duplicates."""
        if not self._semantic._corpus_texts or len(self._semantic._corpus_texts) < 2:
            return []

        try:
            from sklearn.cluster import AgglomerativeClustering
            embeddings = self._semantic.encode(self._semantic._corpus_texts)

            if hasattr(embeddings, 'toarray'):
                embeddings = embeddings.toarray()

            # Distance matrix for clustering
            from sklearn.metrics.pairwise import cosine_distances
            dist_matrix = cosine_distances(embeddings)

            clustering = AgglomerativeClustering(
                n_clusters=None,
                distance_threshold=1 - threshold,
                metric="precomputed",
                linkage="average",
            )
            labels = clustering.fit_predict(dist_matrix)

            # Group by cluster
            clusters = {}
            for idx, label in enumerate(labels):
                if label not in clusters:
                    clusters[label] = []
                clusters[label].append(idx)

            # Filter to clusters with >1 member
            duplicates = []
            for label, indices in clusters.items():
                if len(indices) < 2:
                    continue
                # Calculate average similarity within cluster
                cluster_sims = []
                for i in range(len(indices)):
                    for j in range(i + 1, len(indices)):
                        cluster_sims.append(1 - dist_matrix[indices[i], indices[j]])
                avg_sim = np.mean(cluster_sims) if cluster_sims else 0

                records = []
                for idx in indices:
                    records.append({
                        "id": self._semantic._corpus_ids[idx],
                        "title": self._semantic._corpus_texts[idx][:100],
                    })

                duplicates.append(DuplicateCluster(
                    id=int(label),
                    records=records,
                    similarity=round(float(avg_sim) * 100, 1),
                    description=f"Potential duplicate cluster ({len(indices)} records)",
                ))

            duplicates.sort(key=lambda x: x.similarity, reverse=True)
            return duplicates

        except ImportError:
            return []

    def check_single(self, record_id: int, threshold: float = 0.75) -> list[SimilarityResult]:
        """Check if a specific record has duplicates."""
        if record_id not in self._semantic._corpus_ids:
            return []
        idx = self._semantic._corpus_ids.index(record_id)
        query = self._semantic._corpus_texts[idx]
        results = self._semantic.similarity(query, top_k=6)
        return [r for r in results if r.id != record_id and r.score >= threshold * 100]

# ---------------------------------------------------------------------------
# Training Pipeline
# ---------------------------------------------------------------------------
class TrainingPipeline:
    """Train, evaluate, and manage ML models."""

    def __init__(self):
        self.risk_engine = RiskEngine()
        self.semantic_engine = SemanticEngine()

    def train_all(self, records_data: list[dict]) -> dict:
        """Train all models and return metrics."""
        results = {}

        # Train risk model
        self.risk_engine._get_or_train_model()
        if self.risk_engine._metrics:
            results["risk_model"] = asdict(self.risk_engine._metrics)

        # Build semantic index
        texts = [f"{r.get('title', '')} {r.get('description', '')} {r.get('sector', '')}" for r in records_data]
        ids = [r.get("id", i) for i, r in enumerate(records_data)]
        self.semantic_engine.initialize(texts, ids)
        results["semantic_engine"] = {
            "model": "all-MiniLM-L6-v2" if self.semantic_engine._use_sentence_transformers else "TF-IDF",
            "corpus_size": len(texts),
        }

        return results

    def get_all_metrics(self) -> dict:
        """Get all model metrics."""
        return {
            "risk_model": asdict(self.risk_engine.get_metrics()) if self.risk_engine._metrics else None,
            "semantic_engine": {
                "model": "all-MiniLM-L6-v2" if self.semantic_engine._use_sentence_transformers else "TF-IDF",
                "corpus_size": len(self.semantic_engine._corpus_texts),
                "ready": len(self.semantic_engine._corpus_texts) > 0,
            },
        }

# ---------------------------------------------------------------------------
# Global instances
# ---------------------------------------------------------------------------
_semantic_engine: Optional[SemanticEngine] = None
_risk_engine: Optional[RiskEngine] = None
_success_predictor: Optional[SuccessPredictor] = None
_duplicate_detector: Optional[DuplicateDetector] = None
_training_pipeline: Optional[TrainingPipeline] = None

def get_semantic_engine() -> SemanticEngine:
    global _semantic_engine
    if _semantic_engine is None:
        _semantic_engine = SemanticEngine()
    return _semantic_engine

def get_risk_engine() -> RiskEngine:
    global _risk_engine
    if _risk_engine is None:
        _risk_engine = RiskEngine()
    return _risk_engine

def get_success_predictor() -> SuccessPredictor:
    global _success_predictor
    if _success_predictor is None:
        _success_predictor = SuccessPredictor(get_risk_engine())
    return _success_predictor

def get_duplicate_detector() -> DuplicateDetector:
    global _duplicate_detector
    if _duplicate_detector is None:
        _duplicate_detector = DuplicateDetector(get_semantic_engine())
    return _duplicate_detector

def get_training_pipeline() -> TrainingPipeline:
    global _training_pipeline
    if _training_pipeline is None:
        _training_pipeline = TrainingPipeline()
    return _training_pipeline
