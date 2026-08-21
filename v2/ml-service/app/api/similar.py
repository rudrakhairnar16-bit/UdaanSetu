from fastapi import APIRouter
from typing import List, Dict, Any
import random
import hashlib

router = APIRouter(prefix="/similar", tags=["similar"])

SECTOR_KEYWORDS = {
    "AgriTech": ["farm", "crop", "agriculture", "irrigation", "soil", "harvest", "precision"],
    "CleanTech": ["solar", "wind", "green", "sustainable", "carbon", "renewable", "eco"],
    "HealthTech": ["health", "medical", "diagnostic", "telemedicine", "patient", "clinical"],
    "FinTech": ["payment", "lending", "banking", "insurance", "credit", "digital"],
    "AI_ML": ["artificial intelligence", "machine learning", "deep learning", "neural", "predictive"],
    "EdTech": ["education", "learning", "training", "skill", "course", "online"],
    "FoodTech": ["food", "nutrition", "processing", "packaging", "cold chain", "organic"],
    "Textiles": ["textile", "fabric", "weaving", "fashion", "cotton", "garment"],
    "Manufacturing": ["manufacturing", "production", "factory", "automation", "assembly"],
    "Energy": ["energy", "power", "grid", "battery", "storage", "electricity"],
    "IoT": ["sensor", "connected", "smart", "monitor", "wireless", "device"],
    "Cybersecurity": ["security", "cyber", "data protection", "encryption", "privacy"],
    "Pharma": ["pharmaceutical", "drug", "medicine", "clinical trial", "regulatory"],
    "Biotech": ["biotechnology", "genetic", "genomics", "fermentation", "bio"],
    "WaterTech": ["water", "purification", "treatment", "desalination", "irrigation"],
    "WasteManagement": ["waste", "recycling", "disposal", "compost", "circular"],
}


def compute_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = sum(a ** 2 for a in vec_a) ** 0.5
    norm_b = sum(b ** 2 for b in vec_b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def text_to_vector(text: str) -> List[float]:
    words = text.lower().split()
    vec = [0.0] * 20
    for i, word in enumerate(words[:20]):
        vec[i] = hash(word) % 1000 / 1000.0
    return vec


def find_similar(entity_id: int, entities: List[Dict] = None, limit: int = 10) -> Dict[str, Any]:
    if entities is None:
        entities = []
        for i in range(1, 31):
            sector = random.choice(list(SECTOR_KEYWORDS.keys()))
            stage = random.choice(["Idea", "Prototype", "MVP", "Pilot", "Early Traction", "Growth"])
            district = random.choice(["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"])
            entities.append({
                "id": i,
                "title": f"{sector} Solution {i}",
                "sector": sector,
                "stage": stage,
                "district": district,
                "description": f"{sector} innovation from {district} at {stage} stage",
            })

    target = next((e for e in entities if e["id"] == entity_id), None)
    if not target:
        target = entities[0] if entities else {"id": entity_id, "sector": "AgriTech", "stage": "MVP", "district": "Ahmedabad", "description": "Default entity"}

    target_text = f"{target.get('sector', '')} {target.get('stage', '')} {target.get('district', '')} {target.get('description', '')}"
    target_vec = text_to_vector(target_text)

    scored = []
    for e in entities:
        if e["id"] == entity_id:
            continue
        e_text = f"{e.get('sector', '')} {e.get('stage', '')} {e.get('district', '')} {e.get('description', '')}"
        e_vec = text_to_vector(e_text)
        sim = compute_similarity(target_vec, e_vec)

        sector_bonus = 0.2 if e.get("sector") == target.get("sector") else 0
        stage_bonus = 0.1 if e.get("stage") == target.get("stage") else 0
        district_bonus = 0.1 if e.get("district") == target.get("district") else 0

        total = sim + sector_bonus + stage_bonus + district_bonus
        scored.append({
            "id": e["id"],
            "title": e.get("title", "Unknown"),
            "sector": e.get("sector", "Other"),
            "stage": e.get("stage", "Unknown"),
            "district": e.get("district", "Unknown"),
            "similarity": round(total, 4),
            "factors": {
                "text_similarity": round(sim, 4),
                "sector_match": sector_bonus > 0,
                "stage_match": stage_bonus > 0,
                "district_match": district_bonus > 0,
            },
        })

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    items = scored[:limit]

    return {
        "entity_id": entity_id,
        "items": items,
        "method": "cosine_similarity",
        "total_entities": len(entities),
    }


@router.post("/find")
async def find_similar_entities(request: dict):
    entity_id = request.get("entity_id", 1)
    limit = request.get("limit", 10)
    return find_similar(entity_id, limit=limit)


@router.get("/health")
async def health():
    return {"status": "ok", "service": "similar", "version": "2.0.0"}
