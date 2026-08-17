import json, os, re, shutil, math, hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path
from enum import Enum
from typing import Optional, Any
import httpx, jwt
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from pydantic_settings import BaseSettings
from pwdlib import PasswordHash
from sqlalchemy import (
    create_engine, String, Text, Integer, Float, DateTime,
    ForeignKey, JSON, func, distinct, case
)
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, sessionmaker, Session
)

# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://udaansetu:udaansetu@db:5432/udaansetu"
    secret_key: str = "dev-only-change-me-in-production"
    ollama_enabled: bool = False
    ollama_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "deepseek-r1:8b"
    max_upload_bytes: int = 10 * 1024 * 1024  # 10 MB
    rate_limit_per_minute: int = 120
    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)

class Base(DeclarativeBase):
    pass

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class Role(str, Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    MENTOR = "mentor"
    INVESTOR = "investor"
    INCUBATOR = "incubator"

VALID_ROLES = {r.value for r in Role}

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), default=Role.RESEARCHER.value)
    district: Mapped[str] = mapped_column(String(100), default="")
    organization: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Record(Base):
    __tablename__ = "records"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(40), index=True)
    title: Mapped[str] = mapped_column(String(240))
    description: Mapped[str] = mapped_column(Text, default="")
    stage: Mapped[str] = mapped_column(String(60), default="Draft")
    district: Mapped[str] = mapped_column(String(100), default="")
    sector: Mapped[str] = mapped_column(String(100), default="")
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("records.id"), nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    action: Mapped[str] = mapped_column(String(100))
    entity: Mapped[str] = mapped_column(String(60))
    entity_id: Mapped[int] = mapped_column()
    actor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    detail: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text)
    kind: Mapped[str] = mapped_column(String(40), default="info")
    read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    id: Mapped[int] = mapped_column(primary_key=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
pwd = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)

def db():
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()

def create_token(user: User) -> str:
    return jwt.encode(
        {
            "sub": str(user.id),
            "role": user.role,
            "name": user.name,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        },
        settings.secret_key,
        algorithm="HS256",
    )

def token_hash(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()

def current(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    s: Session = Depends(db),
):
    if not cred:
        raise HTTPException(401, "Authentication required")
    try:
        data = jwt.decode(cred.credentials, settings.secret_key, algorithms=["HS256"])
        if s.query(TokenBlacklist).filter_by(token_hash=token_hash(cred.credentials)).first():
            raise HTTPException(401, "Token has been revoked")
        u = s.get(User, int(data["sub"]))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    if not u:
        raise HTTPException(401, "User unavailable")
    return u

def authorize(*roles):
    def inner(u=Depends(current)):
        if u.role not in roles:
            raise HTTPException(403, "Your role cannot perform this action")
        return u
    return inner

# ---------------------------------------------------------------------------
# Security: Rate limiting (in-memory, per-IP)
# ---------------------------------------------------------------------------
_rate_store: dict[str, list[float]] = {}
RATE_WINDOW = 60.0  # seconds

def check_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = datetime.now(timezone.utc).timestamp()
    window_start = now - RATE_WINDOW
    if ip not in _rate_store:
        _rate_store[ip] = []
    _rate_store[ip] = [t for t in _rate_store[ip] if t > window_start]
    if len(_rate_store[ip]) >= settings.rate_limit_per_minute:
        raise HTTPException(429, "Rate limit exceeded. Try again later.")
    _rate_store[ip].append(now)

# ---------------------------------------------------------------------------
# Security: Input sanitization
# ---------------------------------------------------------------------------
def sanitize_input(text: str) -> str:
    text = text.strip()
    text = re.sub(r"<[^>]+>", "", text)  # strip HTML tags
    text = text.replace("\x00", "")  # null bytes
    return text

# ---------------------------------------------------------------------------
# Security: Password validation
# ---------------------------------------------------------------------------
def validate_password_strength(password: str) -> list[str]:
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one digit")
    return errors

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    district: str
    organization: str = ""
    model_config = ConfigDict(from_attributes=True)

class ItemIn(BaseModel):
    title: str
    description: str = ""
    stage: str = "Draft"
    district: str = ""
    sector: str = ""
    parent_id: Optional[int] = None
    meta: dict = {}

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Title is required")
        if len(v) > 240:
            raise ValueError("Title must be 240 characters or fewer")
        return sanitize_input(v)

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        if len(v) > 10000:
            raise ValueError("Description must be 10000 characters or fewer")
        return sanitize_input(v)

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v: str) -> str:
        return sanitize_input(v)

class ItemOut(BaseModel):
    id: int
    kind: str
    title: str
    description: str
    stage: str
    district: str
    sector: str
    owner_id: Optional[int]
    parent_id: Optional[int]
    meta: dict
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class NotifOut(BaseModel):
    id: int
    message: str
    kind: str
    read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditOut(BaseModel):
    id: int
    action: str
    entity: str
    entity_id: int
    actor_id: Optional[int]
    detail: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------
def words(text):
    return set(re.findall(r"[a-z]{3,}", text.lower()))

def similarity(a, b):
    x, y = words(a), words(b)
    return round(len(x & y) / max(1, len(x | y)) * 100, 1)

def audit(s, u, action, r):
    s.add(AuditLog(
        action=action, entity=r.kind, entity_id=r.id,
        actor_id=u.id, detail={"title": r.title}
    ))

def notify(s, user_id, message, kind="info"):
    s.add(Notification(user_id=user_id, message=message, kind=kind))

def compute_risk(r, milestones):
    overdue = sum(
        1 for m in milestones
        if m.stage.lower() not in ("done", "complete", "completed")
        and m.meta.get("due_date", "") < datetime.utcnow().date().isoformat()
    )
    p = float(r.meta.get("progress", 0))
    stage_penalty = 15 if r.stage.lower() in ("stalled", "at risk") else 0
    score = min(100, round(overdue * 24 + (100 - p) * 0.35 + stage_penalty))
    reasons = []
    if overdue:
        reasons.append(f"{overdue} overdue milestone(s)")
    if p < 50:
        reasons.append("Low reported progress")
    if stage_penalty:
        reasons.append(f"Stage flagged as '{r.stage}'")
    return {
        "score": score,
        "level": "High" if score >= 60 else "Medium" if score >= 30 else "Low",
        "reasons": reasons or ["On track"],
    }

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="UdaanSetu API",
    version="0.3.0",
    description="SIH1608 Innovation Ecosystem Platform — DEMO DATA only",
)

# --- Security middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if not response.headers.get("content-type", "").startswith("text/html"):
        pass
    return response

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/health"):
        return await call_next(request)
    check_rate_limit(request)
    return await call_next(request)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# ---------------------------------------------------------------------------
# Seed data on startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
def seed():
    Base.metadata.create_all(engine)
    s = SessionLocal()
    try:
        if s.query(User).count():
            return

        admin = User(
            name="Demo Administrator", email="admin@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="admin",
            district="Ahmedabad", organization="UdaanSetu Platform",
        )
        researcher = User(
            name="Aarav Patel", email="researcher@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="researcher",
            district="Ahmedabad", organization="Gujarat Agricultural University",
        )
        researcher2 = User(
            name="Priya Sharma", email="researcher2@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="researcher",
            district="Pune", organization="MIT College of Engineering",
        )
        mentor = User(
            name="Dr. Nisha Shah", email="mentor@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="mentor",
            district="Ahmedabad", organization="IIM Ahmedabad",
        )
        investor = User(
            name="Rajesh Kumar", email="investor@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="investor",
            district="Mumbai", organization="SeedFund Ventures",
        )
        incubator_user = User(
            name="Sunita Reddy", email="incubator@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="incubator",
            district="Hyderabad", organization="T-Hub Incubator",
        )
        s.add_all([admin, researcher, researcher2, mentor, investor, incubator_user])
        s.flush()

        r1 = Record(kind="research", title="Solar Cold Storage for Small Farms",
            description="DEMO DATA: Affordable thermal storage and IoT monitoring for post-harvest loss reduction.",
            stage="Prototype", district="Ahmedabad", sector="AgriTech", owner_id=researcher.id,
            meta={"progress": 62, "institution": "Gujarat Agricultural University", "funding_required": 750000}, is_demo=True)
        r2 = Record(kind="research", title="Water Purification Using Biochar Filters",
            description="DEMO DATA: Low-cost biochar-based water filtration for arsenic-affected districts.",
            stage="Lab Testing", district="Patna", sector="CleanTech", owner_id=researcher2.id,
            meta={"progress": 38, "institution": "MIT College of Engineering", "funding_required": 500000}, is_demo=True)
        r3 = Record(kind="research", title="AI-Powered Crop Disease Detection",
            description="DEMO DATA: Mobile app using edge AI for real-time plant disease identification.",
            stage="Field Trial", district="Jaipur", sector="AgriTech", owner_id=researcher.id,
            meta={"progress": 75, "institution": "Rajasthan Agricultural University", "funding_required": 400000}, is_demo=True)
        r4 = Record(kind="research", title="Biodegradable Packaging from Agricultural Waste",
            description="DEMO DATA: Converting rice straw and sugarcane bagasse into compostable packaging.",
            stage="Validation", district="Ludhiana", sector="Materials", owner_id=researcher2.id,
            meta={"progress": 55, "institution": "PAU Ludhiana", "funding_required": 600000}, is_demo=True)
        s.add_all([r1, r2, r3, r4]); s.flush()

        m1 = Record(kind="milestone", title="Field pilot validation", description="DEMO DATA",
            stage="In Progress", parent_id=r1.id, meta={"due_date": "2026-08-01", "progress": 40}, is_demo=True)
        m2 = Record(kind="milestone", title="Prototype thermal efficiency report", description="DEMO DATA",
            stage="Done", parent_id=r1.id, meta={"due_date": "2026-06-15", "progress": 100}, is_demo=True)
        m3 = Record(kind="milestone", title="Regulatory submission", description="DEMO DATA",
            stage="Pending", parent_id=r1.id, meta={"due_date": "2026-09-30", "progress": 0}, is_demo=True)
        m4 = Record(kind="milestone", title="Biochar filter prototyping", description="DEMO DATA",
            stage="In Progress", parent_id=r2.id, meta={"due_date": "2026-07-20", "progress": 55}, is_demo=True)
        m5 = Record(kind="milestone", title="Mobile app beta release", description="DEMO DATA",
            stage="Done", parent_id=r3.id, meta={"due_date": "2026-05-30", "progress": 100}, is_demo=True)
        m6 = Record(kind="milestone", title="Packaging material stress testing", description="DEMO DATA",
            stage="In Progress", parent_id=r4.id, meta={"due_date": "2026-08-15", "progress": 30}, is_demo=True)
        s.add_all([m1, m2, m3, m4, m5, m6]); s.flush()

        i1 = Record(kind="innovation", title="ThermaCrop Storage Module",
            description="DEMO DATA: Phase-change thermal battery for farm cold storage.",
            stage="IPR Screening", district="Ahmedabad", sector="AgriTech",
            owner_id=researcher.id, parent_id=r1.id, meta={"readiness_level": "TRL 5"}, is_demo=True)
        i2 = Record(kind="innovation", title="BioChar+ Water Filter Cartridge",
            description="DEMO DATA: Modular biochar filter with replaceable cartridges.",
            stage="Concept", district="Patna", sector="CleanTech",
            owner_id=researcher2.id, parent_id=r2.id, meta={"readiness_level": "TRL 3"}, is_demo=True)
        i3 = Record(kind="innovation", title="CropGuard AI Mobile App",
            description="DEMO DATA: Edge-AI mobile application for crop disease detection.",
            stage="Ready for Market", district="Jaipur", sector="AgriTech",
            owner_id=researcher.id, parent_id=r3.id, meta={"readiness_level": "TRL 7"}, is_demo=True)
        i4 = Record(kind="innovation", title="GreenPack Compostable Material",
            description="DEMO DATA: Agricultural waste-based biodegradable packaging.",
            stage="Prototype", district="Ludhiana", sector="Materials",
            owner_id=researcher2.id, parent_id=r4.id, meta={"readiness_level": "TRL 4"}, is_demo=True)
        s.add_all([i1, i2, i3, i4]); s.flush()

        ipr1 = Record(kind="ipr", title="ThermaCrop provisional patent", description="DEMO DATA",
            stage="Filed", parent_id=i1.id, sector="AgriTech", district="Ahmedabad",
            meta={"filing_date": "2026-03-15", "application_no": "IN/2026/41234"}, is_demo=True)
        ipr2 = Record(kind="ipr", title="CropGuard AI algorithm patent", description="DEMO DATA",
            stage="Examination", parent_id=i3.id, sector="AgriTech", district="Jaipur",
            meta={"filing_date": "2025-11-20", "application_no": "IN/2025/98765"}, is_demo=True)
        ipr3 = Record(kind="ipr", title="GreenPack material composition", description="DEMO DATA",
            stage="Screening", parent_id=i4.id, sector="Materials", district="Ludhiana",
            meta={"filing_date": "2026-06-01", "application_no": "IN/2026/55678"}, is_demo=True)
        s.add_all([ipr1, ipr2, ipr3]); s.flush()

        st1 = Record(kind="startup", title="ThermaCrop Labs", description="DEMO DATA",
            stage="Pre-seed", parent_id=i1.id, sector="AgriTech", district="Ahmedabad",
            meta={"jobs_created": 4, "farmers_reached": 80, "revenue": 0,
                  "impact_description": "Reduced post-harvest losses by 30% in pilot farms"}, is_demo=True)
        st2 = Record(kind="startup", title="CropGuard Technologies", description="DEMO DATA",
            stage="Seed", parent_id=i3.id, sector="AgriTech", district="Jaipur",
            meta={"jobs_created": 12, "farmers_reached": 340, "revenue": 850000,
                  "impact_description": "340 farmers using the app"}, is_demo=True)
        st3 = Record(kind="startup", title="GreenPack Solutions", description="DEMO DATA",
            stage="Idea", parent_id=i4.id, sector="Materials", district="Ludhiana",
            meta={"jobs_created": 2, "farmers_reached": 0, "revenue": 120000,
                  "impact_description": "Pilot production line"}, is_demo=True)
        s.add_all([st1, st2, st3]); s.flush()

        mnt1 = Record(kind="mentor", title="Dr. Nisha Shah", description="DEMO DATA",
            stage="Available", sector="AgriTech", district="Ahmedabad",
            meta={"expertise": ["IPR", "cold chain", "product development"],
                  "bio": "Former CSIR scientist."}, is_demo=True)
        mnt2 = Record(kind="mentor", title="Prof. Vikram Menon", description="DEMO DATA",
            stage="Available", sector="CleanTech", district="Pune",
            meta={"expertise": ["water purification", "biomaterials"],
                  "bio": "IIT Bombay professor."}, is_demo=True)
        mnt3 = Record(kind="mentor", title="Ananya Gupta", description="DEMO DATA",
            stage="Available", sector="AgriTech", district="Mumbai",
            meta={"expertise": ["go-to-market", "rural distribution"],
                  "bio": "Serial entrepreneur."}, is_demo=True)
        mnt4 = Record(kind="mentor", title="Karthik Iyer", description="DEMO DATA",
            stage="Available", sector="IPR", district="Bangalore",
            meta={"expertise": ["patent drafting", "IPR strategy"],
                  "bio": "Top IP law firm veteran."}, is_demo=True)
        s.add_all([mnt1, mnt2, mnt3, mnt4]); s.flush()

        fs1 = Record(kind="scheme", title="Prototype Support Grant", description="DEMO DATA",
            stage="Open", sector="AgriTech", district="Gandhinagar",
            meta={"amount": 500000, "eligibility": "prototype stage", "deadline": "2026-12-31", "type": "Grant"}, is_demo=True)
        fs2 = Record(kind="scheme", title="Rural Innovation Impact Fund", description="DEMO DATA",
            stage="Open", sector="General", district="New Delhi",
            meta={"amount": 2000000, "eligibility": "rural impact", "deadline": "2026-10-15", "type": "Equity-free Grant"}, is_demo=True)
        fs3 = Record(kind="scheme", title="CleanTech Accelerator Program", description="DEMO DATA",
            stage="Open", sector="CleanTech", district="Pune",
            meta={"amount": 1000000, "eligibility": "cleantech early-stage", "deadline": "2026-09-01", "type": "Accelerator"}, is_demo=True)
        fs4 = Record(kind="scheme", title="Deep-Tech Patent Filing Support", description="DEMO DATA",
            stage="Open", sector="General", district="Bangalore",
            meta={"amount": 200000, "eligibility": "deep-tech", "deadline": "2026-11-30", "type": "Grant"}, is_demo=True)
        s.add_all([fs1, fs2, fs3, fs4]); s.flush()

        inc1 = Record(kind="incubator", title="Demo Innovation Hub", description="DEMO DATA",
            stage="Open", sector="ClimateTech", district="Ahmedabad",
            meta={"capacity": 20, "services": ["lab access", "mentorship"]}, is_demo=True)
        inc2 = Record(kind="incubator", title="T-Hub Innovation Campus", description="DEMO DATA",
            stage="Open", sector="General", district="Hyderabad",
            meta={"capacity": 50, "services": ["prototyping", "investor network"]}, is_demo=True)
        inc3 = Record(kind="incubator", title="GreenVentures Climate Lab", description="DEMO DATA",
            stage="Open", sector="ClimateTech", district="Pune",
            meta={"capacity": 15, "services": ["sustainability lab"]}, is_demo=True)
        s.add_all([inc1, inc2, inc3]); s.flush()

        fr1 = Record(kind="funding_request", title="ThermaCrop Series Pre-Seed", description="DEMO DATA",
            stage="Submitted", sector="AgriTech", district="Ahmedabad", parent_id=st1.id,
            meta={"amount": 750000, "scheme_id": fs1.id, "startup_id": st1.id}, is_demo=True)
        fr2 = Record(kind="funding_request", title="CropGuard Seed Round", description="DEMO DATA",
            stage="Under Review", sector="AgriTech", district="Jaipur", parent_id=st2.id,
            meta={"amount": 2000000, "scheme_id": fs2.id, "startup_id": st2.id}, is_demo=True)
        s.add_all([fr1, fr2]); s.flush()

        for uid in [researcher.id, researcher2.id]:
            notify(s, uid, "Welcome to UdaanSetu!", "info")
        notify(s, admin.id, "System seeded with demo data.", "system")
        notify(s, investor.id, "2 funding requests pending review.", "action")

        for r in [r1, r2, i1, i3, st1, st2]:
            audit(s, admin, "seeded", r)

        s.commit()
    finally:
        s.close()

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "service": "UdaanSetu API", "version": "0.3.0", "demo_data": True}

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
@app.post("/auth/login")
def login(x: LoginIn, s: Session = Depends(db)):
    u = s.query(User).filter_by(email=x.email).first()
    if not u or not pwd.verify(x.password, u.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    t = create_token(u)
    return {"access_token": t, "token_type": "bearer", "user": UserOut.model_validate(u)}

@app.post("/auth/logout")
def logout(u=Depends(current), cred: Optional[HTTPAuthorizationCredentials] = Depends(bearer), s: Session = Depends(db)):
    if cred:
        s.add(TokenBlacklist(token_hash=token_hash(cred.credentials)))
        s.commit()
    return {"message": "Logged out successfully"}

@app.get("/auth/me", response_model=UserOut)
def me(u=Depends(current)):
    return u

@app.get("/auth/users", response_model=list[UserOut])
def list_users(s: Session = Depends(db), u=Depends(authorize("admin"))):
    return s.query(User).all()

# ---------------------------------------------------------------------------
# Records CRUD
# ---------------------------------------------------------------------------
RECORD_KINDS = {"research", "milestone", "innovation", "ipr", "startup",
                "funding_request", "mentor", "scheme", "incubator"}

@app.get("/records", response_model=list[ItemOut])
def list_records(
    kind: Optional[str] = None,
    parent_id: Optional[int] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    stage: Optional[str] = None,
    q: str = "",
    s: Session = Depends(db),
    u=Depends(current),
):
    query = s.query(Record)
    if kind:
        query = query.filter(Record.kind == kind)
    if parent_id:
        query = query.filter(Record.parent_id == parent_id)
    if district:
        query = query.filter(Record.district == district)
    if sector:
        query = query.filter(Record.sector == sector)
    if stage:
        query = query.filter(Record.stage == stage)
    if q:
        safe_q = sanitize_input(q)
        query = query.filter(
            (Record.title.ilike(f"%{safe_q}%")) | (Record.description.ilike(f"%{safe_q}%"))
        )
    return query.order_by(Record.updated_at.desc()).all()

@app.get("/records/{record_id}", response_model=ItemOut)
def get_record(record_id: int, s: Session = Depends(db), u=Depends(current)):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    return r

@app.post("/records/{kind}", response_model=ItemOut)
def create_record(
    kind: str, x: ItemIn, s: Session = Depends(db),
    u=Depends(authorize("admin", "researcher", "incubator", "mentor", "investor")),
):
    if kind not in RECORD_KINDS:
        raise HTTPException(400, f"Unsupported record type: {kind}")
    r = Record(kind=kind, owner_id=u.id, **x.model_dump())
    s.add(r)
    s.flush()
    audit(s, u, "created", r)
    if kind == "funding_request":
        for investor_u in s.query(User).filter_by(role="investor").all():
            notify(s, investor_u.id, f"New funding request: {r.title}", "action")
    s.commit()
    s.refresh(r)
    return r

@app.patch("/records/{record_id}", response_model=ItemOut)
def update_record(
    record_id: int, x: ItemIn, s: Session = Depends(db), u=Depends(current),
):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    if u.role != "admin" and r.owner_id not in (u.id, None):
        raise HTTPException(403, "Not your record")
    old_stage = r.stage
    for k, v in x.model_dump().items():
        setattr(r, k, v)
    audit(s, u, "updated", r)
    if old_stage != r.stage and r.owner_id:
        notify(s, r.owner_id, f"'{r.title}' stage updated: {old_stage} → {r.stage}", "info")
    s.commit()
    s.refresh(r)
    return r

@app.delete("/records/{record_id}")
def delete_record(record_id: int, s: Session = Depends(db), u=Depends(authorize("admin"))):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    audit(s, u, "deleted", r)
    s.delete(r)
    s.commit()
    return {"message": f"Record {record_id} deleted"}

# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
@app.get("/dashboard")
def dashboard(district: Optional[str] = None, s: Session = Depends(db), u=Depends(current)):
    query = s.query(Record)
    if district:
        query = query.filter(Record.district == district)
    allr = query.all()
    research = [r for r in allr if r.kind == "research"]
    milestones = [r for r in allr if r.kind == "milestone"]
    at_risk = []
    risk_engine = get_risk_engine()
    for rp in research:
        rp_milestones = [m for m in milestones if m.parent_id == rp.id]
        prediction = risk_engine.predict(rp, rp_milestones)
        at_risk.append({
            "id": rp.id, "title": rp.title,
            "score": prediction.score, "level": prediction.level,
            "confidence": prediction.confidence,
            "feature_importance": prediction.feature_importance,
            "reasons": prediction.reasons, "method": prediction.method,
        })
    at_risk.sort(key=lambda x: x["score"], reverse=True)

    pipeline = {}
    for kind in ["research", "innovation", "ipr", "startup", "funding_request"]:
        items = [r for r in allr if r.kind == kind]
        stages = {}
        for item in items:
            stages[item.stage] = stages.get(item.stage, 0) + 1
        pipeline[kind] = {"total": len(items), "stages": stages}

    return {
        "banner": "DEMO DATA — representative prototype records only",
        "counts": {k: sum(1 for r in allr if r.kind == k)
                   for k in ["research", "innovation", "ipr", "startup",
                             "mentor", "scheme", "incubator", "funding_request"]},
        "at_risk": at_risk,
        "recent": allr[:10],
        "pipeline": pipeline,
        "districts": list(set(r.district for r in allr if r.district)),
    }

# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------
@app.get("/analytics/districts")
def district_analytics(s: Session = Depends(db), u=Depends(current)):
    rows = (
        s.query(Record.district, Record.kind, func.count(Record.id))
        .filter(Record.district != "")
        .group_by(Record.district, Record.kind)
        .all()
    )
    data = {}
    for d, k, n in rows:
        data.setdefault(d, {})[k] = n
    return {
        "label": "DEMO DATA — not government statistics",
        "districts": [{"district": d, **v} for d, v in data.items()],
    }

@app.get("/analytics/overview")
def analytics_overview(s: Session = Depends(db), u=Depends(current)):
    total = s.query(Record).count()
    by_kind = dict(s.query(Record.kind, func.count(Record.id)).group_by(Record.kind).all())
    by_sector = dict(s.query(Record.sector, func.count(Record.id)).filter(Record.sector != "").group_by(Record.sector).all())
    by_district = dict(s.query(Record.district, func.count(Record.id)).filter(Record.district != "").group_by(Record.district).all())
    research = s.query(Record).filter_by(kind="research").all()
    avg_progress = sum(r.meta.get("progress", 0) for r in research) / max(1, len(research))
    total_funding = sum(r.meta.get("funding_required", 0) for r in research)
    startups = s.query(Record).filter_by(kind="startup").all()
    return {
        "total_records": total, "by_kind": by_kind, "by_sector": by_sector,
        "by_district": by_district, "avg_research_progress": round(avg_progress, 1),
        "total_funding_required": total_funding,
        "total_startup_revenue": sum(r.meta.get("revenue", 0) for r in startups),
        "total_jobs_created": sum(r.meta.get("jobs_created", 0) for r in startups),
        "total_farmers_reached": sum(r.meta.get("farmers_reached", 0) for r in startups),
        "label": "DEMO DATA — representative prototype metrics only",
    }

# ---------------------------------------------------------------------------
# AI/ML endpoints (sentence-transformers + trained models)
# ---------------------------------------------------------------------------
from app.ml.engine import (
    get_semantic_engine, get_risk_engine, get_success_predictor,
    get_duplicate_detector, get_training_pipeline,
)

@app.on_event("startup")
def init_ml():
    """Initialize ML models on startup. Resilient to DB/model failures."""
    import logging
    _log = logging.getLogger("udaansetu.startup")
    try:
        s = SessionLocal()
        try:
            records = s.query(Record).all()
            if records:
                texts = [f"{r.title} {r.description} {r.sector} {r.district}" for r in records]
                ids = [r.id for r in records]
                sem = get_semantic_engine()
                sem.initialize(texts, ids)
                pipeline = get_training_pipeline()
                pipeline.train_all([{"id": r.id, "title": r.title, "description": r.description,
                                    "sector": r.sector, "district": r.district} for r in records])
                _log.info(f"ML init complete: {len(records)} records indexed")
        finally:
            s.close()
    except Exception as e:
        _log.warning(f"ML startup init skipped (will lazy-load on first request): {e}")

@app.get("/ai/risk/{research_id}")
def ai_risk(research_id: int, s: Session = Depends(db), u=Depends(current)):
    r = s.get(Record, research_id)
    if not r or r.kind != "research":
        raise HTTPException(404, "Research project not found")
    milestones = s.query(Record).filter_by(kind="milestone", parent_id=r.id).all()
    risk_engine = get_risk_engine()
    prediction = risk_engine.predict(r, milestones)
    return {
        "research_id": r.id, "title": r.title,
        "score": prediction.score, "level": prediction.level,
        "confidence": prediction.confidence,
        "feature_importance": prediction.feature_importance,
        "reasons": prediction.reasons, "method": prediction.method,
    }

@app.get("/ai/success/{research_id}")
def ai_success(research_id: int, s: Session = Depends(db), u=Depends(current)):
    """Predict success probability for a research project."""
    r = s.get(Record, research_id)
    if not r or r.kind != "research":
        raise HTTPException(404, "Research project not found")
    milestones = s.query(Record).filter_by(kind="milestone", parent_id=r.id).all()
    predictor = get_success_predictor()
    # Find comparable projects via semantic similarity
    sem = get_semantic_engine()
    query_text = f"{r.title} {r.description} {r.sector}"
    similar = sem.similarity(query_text, top_k=5)
    prediction = predictor.predict(r, milestones, all_similar=similar)
    return {
        "research_id": r.id, "title": r.title,
        "probability": prediction.probability,
        "confidence_interval": prediction.confidence_interval,
        "key_factors": prediction.key_factors,
        "comparable_projects": prediction.comparable_projects,
        "method": prediction.method,
    }

@app.get("/ai/recommendations/{innovation_id}")
async def recommend(innovation_id: int, s: Session = Depends(db), u=Depends(current)):
    i = s.get(Record, innovation_id)
    if not i or i.kind != "innovation":
        raise HTTPException(404, "Innovation not found")
    corpus = s.query(Record).filter(Record.kind.in_(["mentor", "scheme", "incubator"])).all()
    query_text = f"{i.title} {i.description} {i.sector} {i.district}"

    # Use semantic engine for real similarity
    sem = get_semantic_engine()
    corpus_texts = [f"{x.title} {x.description} {x.sector} {x.district}" for x in corpus]
    corpus_ids = [x.id for x in corpus]

    # Build temporary index if corpus changed
    if set(corpus_ids) != set(sem._corpus_ids):
        sem.initialize(corpus_texts, corpus_ids)

    semantic_results = sem.similarity(query_text, top_k=len(corpus))

    # Map results back to corpus records
    id_to_record = {x.id: x for x in corpus}
    matches = []
    for result in semantic_results:
        rec = id_to_record.get(result.id)
        if rec:
            matches.append({
                "id": rec.id, "type": rec.kind, "title": rec.title,
                "stage": rec.stage, "sector": rec.sector, "district": rec.district,
                "score": result.score,
                "reason": f"Semantic match ({result.method}) — shared context in {rec.sector or 'General'}",
            })

    insight = f"Semantic analysis of '{i.title}' using {semantic_results[0].method if semantic_results else 'fallback'}."
    method = semantic_results[0].method if semantic_results else "fallback"

    if settings.ollama_enabled:
        try:
            p = {"model": settings.ollama_model, "stream": False,
                 "prompt": f"In 2-3 sentences, advise this innovation: {query_text}. Do not invent facts."}
            async with httpx.AsyncClient(timeout=25) as client:
                resp = await client.post(f"{settings.ollama_url}/api/generate", json=p)
                insight = resp.json().get("response", insight)
            method = f"Ollama {settings.ollama_model} + {method}"
        except Exception:
            insight += " Ollama was unavailable."

    return {"innovation_id": i.id, "title": i.title, "matches": matches,
            "insight": insight, "method": method}

@app.get("/ai/similar/{record_id}")
def similar(record_id: int, s: Session = Depends(db), u=Depends(current)):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")

    sem = get_semantic_engine()
    query_text = f"{r.title} {r.description} {r.sector}"
    results = sem.similarity(query_text, top_k=11)

    # Filter out self and map to records
    out = []
    for result in results:
        if result.id != record_id:
            rec = s.get(Record, result.id)
            if rec:
                out.append({
                    "id": rec.id, "title": rec.title, "type": rec.kind,
                    "similarity": result.score, "method": result.method,
                })
    return out[:10]

@app.get("/ai/match/{innovation_id}")
def smart_match(innovation_id: int, s: Session = Depends(db), u=Depends(current)):
    i = s.get(Record, innovation_id)
    if not i or i.kind not in ("innovation", "startup"):
        raise HTTPException(404, "Innovation or startup not found")

    query_text = f"{i.title} {i.description} {i.sector} {i.district}"
    sem = get_semantic_engine()

    def score_matches(items, limit=3):
        if not items:
            return []
        item_texts = [f"{x.title} {x.description} {x.sector} {x.district}" for x in items]
        item_ids = [x.id for x in items]

        # Temporary index
        old_texts, old_ids = sem._corpus_texts[:], sem._corpus_ids[:]
        sem.initialize(item_texts + [query_text], item_ids + [-1])
        results = sem.similarity(query_text, top_k=min(limit, len(items)))
        sem.initialize(old_texts, old_ids)

        id_to_item = {x.id: x for x in items}
        scored = []
        for result in results:
            item = id_to_item.get(result.id)
            if item:
                scored.append({
                    "id": item.id, "title": item.title, "stage": item.stage,
                    "score": result.score,
                    "match_reason": f"Semantic match ({result.method}) — {item.sector or 'General'}",
                })
        return scored

    mentors = s.query(Record).filter_by(kind="mentor").all()
    schemes = s.query(Record).filter_by(kind="scheme").all()
    incubators = s.query(Record).filter_by(kind="incubator").all()

    return {
        "innovation_id": i.id, "title": i.title,
        "mentors": score_matches(mentors),
        "schemes": score_matches(schemes),
        "incubators": score_matches(incubators),
        "method": "semantic matching (sentence-transformers / TF-IDF)",
    }

@app.get("/ai/duplicates")
def find_duplicates(threshold: float = Query(75.0, ge=50, le=100), s: Session = Depends(db), u=Depends(current)):
    """Find potential duplicate records using NLP clustering."""
    sem = get_semantic_engine()
    all_records = s.query(Record).filter(Record.kind.in_(["research", "innovation", "ipr"])).all()
    if not all_records:
        return {"clusters": [], "method": "no records"}

    texts = [f"{r.title} {r.description} {r.sector}" for r in all_records]
    ids = [r.id for r in all_records]
    sem.initialize(texts, ids)

    detector = get_duplicate_detector()
    clusters = detector.detect(threshold=threshold / 100)

    return {
        "clusters": [
            {"id": c.id, "records": c.records, "similarity": c.similarity, "description": c.description}
            for c in clusters
        ],
        "total_checked": len(all_records),
        "threshold": threshold,
        "method": "Agglomerative clustering on semantic embeddings",
    }

@app.get("/ai/metrics")
def ai_metrics(u=Depends(authorize("admin"))):
    """Get ML model performance metrics."""
    pipeline = get_training_pipeline()
    metrics = pipeline.get_all_metrics()
    return metrics

@app.post("/ai/retrain")
def retrain_models(s: Session = Depends(db), u=Depends(authorize("admin"))):
    """Retrain all ML models with current data."""
    records = s.query(Record).all()
    records_data = [
        {"id": r.id, "title": r.title, "description": r.description,
         "sector": r.sector, "district": r.district}
        for r in records
    ]
    pipeline = get_training_pipeline()
    results = pipeline.train_all(records_data)

    # Rebuild semantic index
    texts = [f"{r.title} {r.description} {r.sector} {r.district}" for r in records]
    ids = [r.id for r in records]
    sem = get_semantic_engine()
    sem.initialize(texts, ids)

    return {"message": "Models retrained", "results": results}

# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------
@app.get("/notifications", response_model=list[NotifOut])
def list_notifications(s: Session = Depends(db), u=Depends(current)):
    return s.query(Notification).filter_by(user_id=u.id).order_by(Notification.created_at.desc()).limit(50).all()

@app.patch("/notifications/{notif_id}/read")
def mark_read(notif_id: int, s: Session = Depends(db), u=Depends(current)):
    n = s.get(Notification, notif_id)
    if not n or n.user_id != u.id:
        raise HTTPException(404, "Notification not found")
    n.read = True; s.commit()
    return {"message": "Marked as read"}

@app.post("/notifications/read-all")
def mark_all_read(s: Session = Depends(db), u=Depends(current)):
    s.query(Notification).filter_by(user_id=u.id, read=False).update({"read": True}); s.commit()
    return {"message": "All notifications marked as read"}

# ---------------------------------------------------------------------------
# Audit Log
# ---------------------------------------------------------------------------
@app.get("/audit", response_model=list[AuditOut])
def audit_log(limit: int = Query(100, le=500), s: Session = Depends(db), u=Depends(authorize("admin"))):
    return s.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()

# ---------------------------------------------------------------------------
# Document upload
# ---------------------------------------------------------------------------
ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx", ".md", ".csv"}

@app.post("/documents/upload")
async def upload_document(
    record_id: int = Form(...),
    file: UploadFile = File(...),
    s: Session = Depends(db),
    u=Depends(current),
):
    r = s.get(Record, record_id)
    if not r:
        raise HTTPException(404, "Record not found")
    suffix = Path(file.filename or "upload.txt").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {suffix}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(413, f"File too large. Max size: {settings.max_upload_bytes // (1024*1024)} MB")
    target = Path("uploads"); target.mkdir(exist_ok=True)
    safe_name = re.sub(r"[^\w.\-]", "_", file.filename or "upload.txt")
    path = target / f"{int(datetime.utcnow().timestamp())}_{safe_name}"
    with path.open("wb") as f:
        f.write(content)
    text = ""
    try:
        if suffix in (".txt", ".md", ".csv"):
            text = content.decode("utf-8", errors="ignore")
        elif suffix == ".pdf":
            from pypdf import PdfReader
            text = " ".join(p.extract_text() or "" for p in PdfReader(path).pages)
        elif suffix == ".docx":
            from docx import Document
            text = " ".join(p.text for p in Document(path).paragraphs)
    except Exception:
        text = "Extraction could not be completed."
    r.meta = {**r.meta, "document": {"name": file.filename, "extracted_preview": text[:2000]}}
    audit(s, u, "uploaded_document", r); s.commit()
    return {"filename": file.filename, "size": len(content),
            "extracted_preview": text[:2000],
            "note": "Best-effort extraction; validate source content manually."}

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
