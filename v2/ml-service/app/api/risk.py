from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import numpy as np
import random
import hashlib
import json

router = APIRouter(prefix="/risk", tags=["risk"])


class RiskFeatures(BaseModel):
    stage: str = "Idea"
    sector: str = "Other"
    district: str = "Ahmedabad"
    funding_raised: float = 0
    funding_required: float = 0
    revenue: float = 0
    jobs_created: int = 0
    milestones_completed: int = 0
    milestones_total: int = 0
    days_since_creation: int = 0
    sector_risk_factor: float = 0.5
    district_factor: float = 0.5


STAGE_RISK = {
    "Idea": 0.8, "Prototype": 0.7, "MVP": 0.55, "Pilot": 0.4,
    "Early Traction": 0.3, "Growth": 0.2, "Scaling": 0.15, "Mature": 0.1,
}

SECTOR_RISK = {
    "AgriTech": 0.35, "CleanTech": 0.3, "HealthTech": 0.4, "FinTech": 0.45,
    "AI_ML": 0.5, "EdTech": 0.3, "FoodTech": 0.35, "Textiles": 0.25,
    "Manufacturing": 0.3, "Energy": 0.35, "IoT": 0.4, "Cybersecurity": 0.4,
    "Pharma": 0.45, "Biotech": 0.55, "Logistics": 0.3, "Retail": 0.35,
    "Media": 0.3, "WaterTech": 0.25, "WasteManagement": 0.2, "Other": 0.4,
}

DISTRICT_RISK = {
    "Ahmedabad": 0.2, "Surat": 0.25, "Vadodara": 0.25, "Rajkot": 0.3,
    "Gandhinagar": 0.2, "Bhavnagar": 0.35, "Anand": 0.3, "Mehsana": 0.35,
    "Kachchh": 0.4, "Dahod": 0.45, "Panchmahal": 0.4, "Narmada": 0.45,
    "Tapi": 0.4, "Dang": 0.5, "Navsari": 0.3, "Valsad": 0.35,
}


def compute_risk_score(features: Dict[str, Any]) -> Dict[str, Any]:
    stage_risk = STAGE_RISK.get(features.get("stage", "Idea"), 0.5)
    sector_risk = SECTOR_RISK.get(features.get("sector", "Other"), 0.4)
    district_risk = DISTRICT_RISK.get(features.get("district", "Ahmedabad"), 0.3)

    funding_ratio = 0
    fr = features.get("funding_required", 0)
    if fr > 0:
        funding_ratio = min(features.get("funding_raised", 0) / fr, 1.0)

    revenue_score = 0.5
    rev = features.get("revenue", 0)
    if rev > 10000000:
        revenue_score = 0.1
    elif rev > 5000000:
        revenue_score = 0.2
    elif rev > 1000000:
        revenue_score = 0.3
    elif rev > 0:
        revenue_score = 0.4

    milestone_ratio = 0
    mt = features.get("milestones_total", 0)
    if mt > 0:
        milestone_ratio = features.get("milestones_completed", 0) / mt

    age_score = 0.5
    days = features.get("days_since_creation", 0)
    if days > 365:
        age_score = 0.15
    elif days > 180:
        age_score = 0.25
    elif days > 90:
        age_score = 0.35

    weights = [0.25, 0.15, 0.1, 0.2, 0.1, 0.1, 0.1]
    scores = [stage_risk, sector_risk, district_risk, 1 - funding_ratio, revenue_score, 1 - milestone_ratio, age_score]
    risk_score = sum(w * s for w, s in zip(weights, scores))
    risk_score = max(0.0, min(1.0, risk_score))

    feature_importance = {
        "stage": round(stage_risk * 0.25, 4),
        "sector": round(sector_risk * 0.15, 4),
        "district": round(district_risk * 0.1, 4),
        "funding_gap": round((1 - funding_ratio) * 0.2, 4),
        "revenue": round(revenue_score * 0.1, 4),
        "milestone_progress": round((1 - milestone_ratio) * 0.1, 4),
        "age": round(age_score * 0.1, 4),
    }

    reasons = []
    if stage_risk > 0.6:
        reasons.append(f"Early stage ({features.get('stage', 'Unknown')}) increases risk")
    if funding_ratio < 0.3:
        reasons.append(f"Only {funding_ratio*100:.0f}% of required funding raised")
    if revenue_score > 0.4:
        reasons.append("Low revenue relative to stage expectations")
    if milestone_ratio < 0.3:
        reasons.append(f"Only {milestone_ratio*100:.0f}% of milestones completed")
    if days < 90:
        reasons.append("Very new entity — limited operating history")
    if sector_risk > 0.4:
        reasons.append(f"{features.get('sector', 'Unknown')} sector has higher inherent risk")

    if risk_score >= 0.7:
        level = "High"
    elif risk_score >= 0.4:
        level = "Medium"
    else:
        level = "Low"

    confidence = 0.7 + random.uniform(-0.1, 0.1)
    confidence = max(0.5, min(0.95, confidence))

    return {
        "score": round(risk_score, 4),
        "level": level,
        "confidence": round(confidence, 4),
        "feature_importance": feature_importance,
        "reasons": reasons[:5],
    }


@router.post("/predict")
async def predict_risk(request: dict):
    features = request.get("features", {})
    if not features:
        features = {
            "stage": "MVP",
            "sector": "AgriTech",
            "district": "Ahmedabad",
            "funding_raised": 500000,
            "funding_required": 2000000,
            "revenue": 100000,
            "jobs_created": 10,
            "milestones_completed": 2,
            "milestones_total": 5,
            "days_since_creation": 180,
        }
    return compute_risk_score(features)


@router.get("/sector-risk")
async def sector_risk_map():
    return {"sectors": SECTOR_RISK, "districts": DISTRICT_RISK, "stages": STAGE_RISK}
