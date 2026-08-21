from fastapi import APIRouter
from typing import List, Dict, Any
import random
import hashlib
import json

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

SECTOR_SIMILARITY = {
    "AgriTech": ["FoodTech", "CleanTech", "WaterTech", "IoT", "Energy"],
    "CleanTech": ["AgriTech", "Energy", "WasteManagement", "WaterTech", "Manufacturing"],
    "HealthTech": ["Biotech", "Pharma", "AI_ML", "IoT", "EdTech"],
    "FinTech": ["AI_ML", "Retail", "Cybersecurity", "EdTech", "Logistics"],
    "AI_ML": ["IoT", "Cybersecurity", "HealthTech", "FinTech", "EdTech"],
    "EdTech": ["AI_ML", "Media", "HealthTech", "FinTech", "Other"],
    "FoodTech": ["AgriTech", "Logistics", "Manufacturing", "CleanTech", "Retail"],
    "Textiles": ["Manufacturing", "Retail", "CleanTech", "Other", "AgriTech"],
    "Manufacturing": ["Textiles", "IoT", "CleanTech", "AgriTech", "Energy"],
    "Energy": ["CleanTech", "IoT", "Manufacturing", "AgriTech", "WaterTech"],
    "IoT": ["AI_ML", "Cybersecurity", "Energy", "HealthTech", "AgriTech"],
    "Cybersecurity": ["AI_ML", "IoT", "FinTech", "HealthTech", "Other"],
    "Pharma": ["HealthTech", "Biotech", "AI_ML", "FoodTech", "Other"],
    "Biotech": ["HealthTech", "Pharma", "AgriTech", "FoodTech", "CleanTech"],
    "Logistics": ["Retail", "FoodTech", "IoT", "Manufacturing", "FinTech"],
    "Retail": ["FinTech", "Logistics", "Textiles", "EdTech", "Media"],
    "Media": ["EdTech", "Retail", "AI_ML", "Other", "FinTech"],
    "WaterTech": ["CleanTech", "AgriTech", "IoT", "Energy", "WasteManagement"],
    "WasteManagement": ["CleanTech", "AgriTech", "Manufacturing", "WaterTech", "Energy"],
    "Other": ["Retail", "EdTech", "Media", "Manufacturing", "Logistics"],
}


def get_entity_hash(entity_id: int) -> str:
    return hashlib.md5(f"entity_{entity_id}".encode()).hexdigest()[:8]


def generate_recommendations(entity_id: int, entity_data: dict = None, limit: int = 5) -> Dict[str, Any]:
    if entity_data is None:
        entity_data = {
            "sector": random.choice(list(SECTOR_SIMILARITY.keys())),
            "stage": random.choice(["Idea", "Prototype", "MVP", "Pilot", "Early Traction", "Growth"]),
            "district": random.choice(["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"]),
            "title": f"Entity {entity_id}",
        }

    sector = entity_data.get("sector", "Other")
    similar_sectors = SECTOR_SIMILARITY.get(sector, ["Other"])

    matches = []
    for i in range(min(limit, 5)):
        rec_sector = random.choice(similar_sectors)
        rec_stage = random.choice(["Prototype", "MVP", "Pilot", "Early Traction"])
        confidence = random.uniform(0.65, 0.95)
        score = random.uniform(0.6, 0.95)

        match_type = random.choice(["sector", "stage", "funding", "mentor", "scheme"])

        reasons = []
        if match_type == "sector":
            reasons.append(f"Active in {rec_sector} sector")
        elif match_type == "stage":
            reasons.append(f"Similar stage: {rec_stage}")
        elif match_type == "funding":
            reasons.append("Similar funding requirements")
        elif match_type == "mentor":
            reasons.append("Relevant mentor expertise")
        else:
            reasons.append("Applicable government scheme")

        matches.append({
            "entity_id": entity_id + random.randint(1, 50),
            "title": f"{rec_sector} Solution {random.randint(1,100)}",
            "sector": rec_sector,
            "stage": rec_stage,
            "score": round(score, 4),
            "confidence": round(confidence, 4),
            "match_type": match_type,
            "reasons": reasons,
        })

    matches.sort(key=lambda x: x["score"], reverse=True)

    insights = [
        f"Found {len(matches)} entities in related sectors ({', '.join(similar_sectors[:3])})",
        f"Sector '{sector}' has {len(matches) * 12} potential collaborations in Gujarat",
        f"Average match confidence: {sum(m['confidence'] for m in matches) / max(len(matches), 1):.1%}",
    ]

    return {
        "entity_id": entity_id,
        "matches": matches,
        "insight": random.choice(insights),
        "method": "semantic",
    }


@router.post("/get")
async def get_recommendations(request: dict):
    entity_id = request.get("entity_id", 1)
    limit = request.get("limit", 5)
    entity_data = request.get("entity_data")
    return generate_recommendations(entity_id, entity_data, limit)


@router.get("/health")
async def health():
    return {"status": "ok", "service": "recommendations", "version": "2.0.0"}
