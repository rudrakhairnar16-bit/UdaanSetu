from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/risk", tags=["risk"])

class RiskPredictRequest(BaseModel):
    entity_id: int
    features: dict = {}

class RiskResponse(BaseModel):
    score: float
    level: str
    confidence: float
    feature_importance: dict
    reasons: list

@router.post("/predict", response_model=RiskResponse)
async def predict_risk(request: dict):
    return {
        "score": 0.0,
        "level": "Low",
        "confidence": 0.0,
        "feature_importance": {},
        "reasons": [],
    }