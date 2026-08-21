from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ml", tags=["ml"])

class RiskRequest(BaseModel):
    entity_id: int

class RecommendationRequest(BaseModel):
    entity_id: int
    limit: int = 5

class SimilarRequest(BaseModel):
    entity_id: int
    limit: int = 10

class DuplicateRequest(BaseModel):
    kind: str
    title: str
    description: str

class TrainRequest(BaseModel):
    force: bool = False

@router.post("/risk")
async def predict_risk(data: RiskRequest):
    return {"score": 0, "level": "Low", "confidence": 0, "reasons": [], "feature_importance": {}}

@router.post("/recommendations")
async def get_recommendations(data: RecommendationRequest):
    return {"matches": [], "insight": "", "method": "semantic"}

@router.post("/similar")
async def find_similar(data: SimilarRequest):
    return []

@router.post("/detect-duplicates")
async def detect_duplicates(data: DuplicateRequest):
    return {"duplicates": []}

@router.post("/train")
async def train_models(data: TrainRequest):
    return {"success": True, "message": "Training started (mock)"}

@router.get("/metrics")
async def get_metrics():
    return {
        "risk_model": {
            "accuracy": 0.75, "precision": 0.72, "recall": 0.68, "f1": 0.70, "auc_roc": 0.82,
            "training_samples": 2000,
        },
        "semantic_engine": {"ready": False, "model": "all-MiniLM-L6-v2", "corpus_size": 0},
    }