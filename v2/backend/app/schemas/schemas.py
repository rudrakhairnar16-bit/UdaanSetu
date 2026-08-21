from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    researcher = "researcher"
    mentor = "mentor"
    investor = "investor"
    incubator = "incubator"

class EntityKind(str, Enum):
    research = "research"
    innovation = "innovation"
    ipr = "ipr"
    startup = "startup"
    milestone = "milestone"
    mentor = "mentor"
    scheme = "scheme"
    incubator = "incubator"
    funding_request = "funding_request"

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2)
    role: UserRole
    district: Optional[str] = None
    organization: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    organization: Optional[str] = None

class UserResponse(UserBase):
    id: int
    district: Optional[str] = None
    organization: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class EntityBase(BaseModel):
    kind: str
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    stage: str
    sector: Optional[str] = None
    district: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    parent_id: Optional[int] = None

class EntityCreate(EntityBase):
    pass

class EntityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[str] = None
    sector: Optional[str] = None
    district: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

class EntityResponse(EntityBase):
    id: int
    is_demo: bool
    owner_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    owner: Optional["UserResponse"] = None
    
    class Config:
        from_attributes = True

class EntityListResponse(BaseModel):
    items: List[EntityResponse]
    total: int
    page: int
    size: int

class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    stage: str = "Pending"
    due_date: Optional[datetime] = None
    progress: int = 0
    meta: Optional[Dict[str, Any]] = None

class MilestoneCreate(MilestoneBase):
    entity_id: int

class MilestoneResponse(MilestoneBase):
    id: int
    entity_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    kind: str
    message: str
    read: bool
    created_at: datetime
    entity_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    pipeline: Dict[str, Dict[str, int]]
    counts: Dict[str, int]
    banner: str
    at_risk: List[Dict[str, Any]] = []
    recent: List[Dict[str, Any]] = []

class AnalyticsOverview(BaseModel):
    total_records: int
    avg_research_progress: float
    total_funding_required: int
    total_startup_revenue: int
    total_jobs_created: int
    total_farmers_reached: int
    by_kind: Dict[str, int]
    by_sector: Dict[str, int]
    by_district: Dict[str, int]

class GovtAadhaarVerify(BaseModel):
    aadhaar_number: str
    name: Optional[str] = None

class GovtDigiLockerVerify(BaseModel):
    document_type: str
    document_id: Optional[str] = None

class GovtStartupIndiaVerify(BaseModel):
    registration_number: str
    startup_name: Optional[str] = None

class GovtIPIndiaVerify(BaseModel):
    application_number: str
    patent_title: Optional[str] = None

class GovtIPIndiaSearch(BaseModel):
    query: str

class GovtONDCSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None

class GovtONDCVerify(BaseModel):
    seller_id: str

class MLRiskPrediction(BaseModel):
    entity_id: int

class MLRecommendations(BaseModel):
    entity_id: int
    limit: int = 5

class MLSimilar(BaseModel):
    entity_id: int
    limit: int = 10

class MLTrainRequest(BaseModel):
    force: bool = False

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: str = "desc"