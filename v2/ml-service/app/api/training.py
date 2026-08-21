from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/training", tags=["training"])

class TrainRequest(BaseModel):
    model_type: str
    force: bool = False

class TrainResponse(BaseModel):
    success: bool
    message: str

@router.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    return {"success": True, "message": f"Training {request.model_type} started"}