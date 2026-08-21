from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, entities, dashboard, analytics, govt, ml, notifications, audit

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="UdaanSetu API",
    description="Gujarat Innovation Ecosystem Platform",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["auth"])
app.include_router(entities.router, tags=["entities"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(analytics.router, tags=["analytics"])
app.include_router(govt.router, tags=["government"])
app.include_router(ml.router, tags=["ml"])
app.include_router(notifications.router, tags=["notifications"])
app.include_router(audit.router, tags=["audit"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "udaansetu-api"}