from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api import risk, recommendations, similar, training

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="UdaanSetu ML Service",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk.router, prefix="/risk", tags=["risk"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(similar.router, prefix="/similar", tags=["similar"])
app.include_router(training.router, prefix="/training", tags=["training"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "udaansetu-ml"}