from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/similar", tags=["similar"])

class SimilarRequest(BaseModel):
    entity_id: int
    limit: int = 10

class SimilarResponse(BaseModel):
    items: list

@router.post("/find", response_model=SimilarResponse)
async def find_similar(request: dict):
    return {"items": []}