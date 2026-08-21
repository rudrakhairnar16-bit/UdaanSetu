from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

class RecRequest(BaseModel):
    entity_id: int
    limit: int = 5

class RecResponse(BaseModel):
    matches: list
    insight: str
    method: str

@router.post("/get", response_model=RecResponse)
async def get_recommendations(request: dict):
    return {"matches": [], "insight": "", "method": "semantic"}