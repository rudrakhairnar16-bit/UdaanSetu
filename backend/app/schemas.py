import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

from app.utils import sanitize_input


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "researcher"
    district: str = ""
    organization: str = ""

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 120:
            raise ValueError("Name must be 120 characters or fewer")
        return sanitize_input(v)


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    organization: Optional[str] = None


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        errors = []
        if len(v) < 8:
            errors.append("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            errors.append("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            errors.append("Password must contain at least one digit")
        if errors:
            raise ValueError("; ".join(errors))
        return v


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


class DepartmentIn(BaseModel):
    name: str
    sector: str = ""
    district: str = ""
    contact_email: str = ""
    contact_phone: str = ""
    website: str = ""
    address: str = ""
    meta: dict = {}

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 200:
            raise ValueError("Name must be 200 characters or fewer")
        return sanitize_input(v)


class DepartmentOut(BaseModel):
    id: int
    name: str
    sector: str
    district: str
    contact_email: str
    contact_phone: str
    website: str
    address: str
    meta: dict
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ChallengeIn(BaseModel):
    title: str
    description: str = ""
    category: str = ""
    department_id: Optional[int] = None
    status: str = "draft"
    budget_range: str = ""
    timeline_weeks: int = 12
    evaluation_criteria: dict = {}
    district: str = ""
    sector: str = ""
    template_id: Optional[int] = None
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


class ChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    department_id: Optional[int]
    status: str
    budget_range: str
    timeline_weeks: int
    evaluation_criteria: dict
    district: str
    sector: str
    owner_id: Optional[int]
    meta: dict
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PilotIn(BaseModel):
    challenge_id: int
    startup_id: int
    duration_weeks: int = 8
    scope: str = ""
    budget: str = ""
    data_clauses: dict = {}
    ip_clauses: dict = {}
    cybersecurity_requirements: str = ""
    risk_management: dict = {}
    status: str = "proposed"
    meta: dict = {}


class PilotOut(BaseModel):
    id: int
    challenge_id: int
    startup_id: int
    duration_weeks: int
    scope: str
    budget: str
    data_clauses: dict
    ip_clauses: dict
    cybersecurity_requirements: str
    risk_management: dict
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    owner_id: Optional[int]
    meta: dict
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PilotMilestoneIn(BaseModel):
    pilot_id: int
    title: str
    description: str = ""
    deliverables: dict = {}
    payment_amount: str = "0"
    due_date: Optional[datetime] = None
    meta: dict = {}

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Title is required")
        if len(v) > 200:
            raise ValueError("Title must be 200 characters or fewer")
        return sanitize_input(v)


class PilotMilestoneOut(BaseModel):
    id: int
    pilot_id: int
    title: str
    description: str
    deliverables: dict
    payment_amount: str
    payment_status: str
    due_date: Optional[datetime]
    completed_date: Optional[datetime]
    approval_status: str
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PaymentIn(BaseModel):
    pilot_id: int
    milestone_id: Optional[int] = None
    amount: str
    currency: str = "INR"
    invoice_number: str = ""
    invoice_date: Optional[datetime] = None
    meta: dict = {}


class PaymentOut(BaseModel):
    id: int
    pilot_id: int
    milestone_id: Optional[int]
    amount: str
    currency: str
    invoice_number: str
    invoice_date: Optional[datetime]
    payment_status: str
    payment_date: Optional[datetime]
    transaction_id: str
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class EvaluationIn(BaseModel):
    challenge_id: int
    startup_id: int
    scores: dict = {}
    recommendation: dict = {}
    comments: str = ""
    meta: dict = {}


class EvaluationOut(BaseModel):
    id: int
    challenge_id: int
    startup_id: int
    evaluator_id: int
    scores: dict
    recommendation: dict
    comments: str
    evaluated_at: Optional[datetime]
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ScaleUpDecisionIn(BaseModel):
    pilot_id: int
    decision: str = "pending"
    target_departments: dict = {}
    budget_allocation: str = ""
    rationale: str = ""
    meta: dict = {}


class ScaleUpDecisionOut(BaseModel):
    id: int
    pilot_id: int
    decision: str
    decided_by: Optional[int]
    decided_at: Optional[datetime]
    target_departments: dict
    budget_allocation: str
    rationale: str
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TemplateIn(BaseModel):
    name: str
    type: str
    content: dict = {}
    version: str = "1.0"
    meta: dict = {}

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 200:
            raise ValueError("Name must be 200 characters or fewer")
        return sanitize_input(v)


class TemplateOut(BaseModel):
    id: int
    name: str
    type: str
    content: dict
    version: str
    is_active: bool
    meta: dict
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Application Schemas ──

class ApplicationIn(BaseModel):
    challenge_id: int
    proposal: str = ""
    proposed_budget: str = ""
    proposed_timeline_weeks: int = 12
    meta: dict = {}


class ApplicationOut(BaseModel):
    id: int
    challenge_id: int
    startup_id: int
    status: str
    proposal: str
    proposed_budget: str
    proposed_timeline_weeks: int
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Eligibility Check Schemas ──

class EligibilityCheckIn(BaseModel):
    rules_checked: dict = {}
    result: str = "pending"
    failed_conditions: dict = {}
    override_reason: str = ""
    meta: dict = {}


class EligibilityCheckOut(BaseModel):
    id: int
    application_id: int
    rules_checked: dict
    result: str
    failed_conditions: dict
    override_reason: str
    overridden_by: Optional[int]
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Challenge Requirement Schemas ──

class ChallengeRequirementIn(BaseModel):
    req_type: str
    key: str
    value: str = ""
    is_mandatory: bool = True
    meta: dict = {}


class ChallengeRequirementOut(BaseModel):
    id: int
    challenge_id: int
    req_type: str
    key: str
    value: str
    is_mandatory: bool
    meta: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Evaluation Score Schemas ──

class EvaluationScoreIn(BaseModel):
    criterion: str
    weight: float = 0.0
    score: float = 0.0
    comments: str = ""


class EvaluationScoreOut(BaseModel):
    id: int
    evaluation_id: int
    criterion: str
    weight: float
    score: float
    comments: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Pilot Metric Schemas ──

class PilotMetricIn(BaseModel):
    name: str
    description: str = ""
    unit: str = ""
    baseline_value: str = ""
    target_value: str = ""
    meta: dict = {}


class PilotMetricOut(BaseModel):
    id: int
    pilot_id: int
    name: str
    description: str
    unit: str
    baseline_value: str
    target_value: str
    actual_value: str
    status: str
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Pilot Evidence Schemas ──

class PilotEvidenceIn(BaseModel):
    milestone_id: Optional[int] = None
    title: str
    description: str = ""
    evidence_type: str = "document"
    file_url: str = ""
    meta: dict = {}


class PilotEvidenceOut(BaseModel):
    id: int
    pilot_id: int
    milestone_id: Optional[int]
    title: str
    description: str
    evidence_type: str
    file_url: str
    submitted_by: Optional[int]
    meta: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Validation Schemas ──

class ValidationIn(BaseModel):
    outcome: str = "pending"
    recommendation: str = "pending"
    scores: dict = {}
    evidence_review: str = ""
    rationale: str = ""
    kpi_achievement_pct: float = 0.0
    cost_efficiency_pct: float = 0.0
    security_score: float = 0.0
    scalability_score: float = 0.0
    meta: dict = {}


class ValidationOut(BaseModel):
    id: int
    pilot_id: int
    validator_id: int
    outcome: str
    recommendation: str
    scores: dict
    evidence_review: str
    rationale: str
    kpi_achievement_pct: float
    cost_efficiency_pct: float
    security_score: float
    scalability_score: float
    validated_at: Optional[datetime]
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Procurement Schemas ──

class ProcurementIn(BaseModel):
    procurement_method: str = ""
    estimated_value: str = ""
    approving_authority: str = ""
    external_reference_type: str = ""
    external_reference_id: str = ""
    meta: dict = {}


class ProcurementOut(BaseModel):
    id: int
    pilot_id: int
    status: str
    procurement_method: str
    estimated_value: str
    approved_value: str
    approving_authority: str
    approval_status: str
    external_reference_type: str
    external_reference_id: str
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Contract Schemas ──

class ContractIn(BaseModel):
    contract_number: str = ""
    value: str = ""
    meta: dict = {}


class ContractOut(BaseModel):
    id: int
    pilot_id: int
    contract_number: str
    status: str
    signed_date: Optional[datetime]
    expiry_date: Optional[datetime]
    value: str
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Grievance Schemas ──

class GrievanceIn(BaseModel):
    challenge_id: Optional[int] = None
    pilot_id: Optional[int] = None
    category: str = "other"
    subject: str
    description: str = ""
    meta: dict = {}

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Subject must be at least 2 characters")
        return sanitize_input(v)


class GrievanceOut(BaseModel):
    id: int
    startup_id: int
    challenge_id: Optional[int]
    pilot_id: Optional[int]
    category: str
    subject: str
    description: str
    status: str
    assigned_to: Optional[int]
    resolution: str
    sla_days: int
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: IP/Data Agreement Schemas ──

class IPDataAgreementIn(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    background_ip: str = ""
    foreground_ip: str = ""
    data_ownership: str = ""
    data_access: str = ""
    data_retention: str = ""
    confidentiality: str = ""
    model_source_code: str = ""
    exit_terms: str = ""
    meta: dict = {}


class IPDataAgreementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    pilot_id: int
    background_ip: str
    foreground_ip: str
    data_ownership: str
    data_access: str
    data_retention: str
    confidentiality: str
    model_source_code: str
    exit_terms: str
    meta: dict
    created_at: datetime
    updated_at: datetime


# ── SIH26136: Conflict of Interest Schemas ──

class ConflictOfInterestIn(BaseModel):
    has_conflict: bool = False
    declaration: str = ""


class ConflictOfInterestOut(BaseModel):
    id: int
    evaluator_id: int
    application_id: int
    has_conflict: bool
    declaration: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Challenge Version Schemas ──

class ChallengeVersionOut(BaseModel):
    id: int
    challenge_id: int
    version: int
    snapshot: dict
    changed_by: Optional[int]
    change_summary: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Purchase Order Schemas ──

class PurchaseOrderIn(BaseModel):
    po_number: str = ""
    amount: str = ""
    meta: dict = {}


class PurchaseOrderOut(BaseModel):
    id: int
    contract_id: int
    po_number: str
    status: str
    amount: str
    issued_date: Optional[datetime]
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Compliance Checklist Schemas ──

class ComplianceChecklistIn(BaseModel):
    item: str
    notes: str = ""
    meta: dict = {}


class ComplianceChecklistOut(BaseModel):
    id: int
    procurement_id: int
    item: str
    status: str
    checked_by: Optional[int]
    notes: str
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Document Version Schemas ──

class DocumentVersionOut(BaseModel):
    id: int
    record_id: int
    version: int
    filename: str
    file_url: str
    uploaded_by: Optional[int]
    change_summary: str
    meta: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── SIH26136: Pilot Incident Schemas ──

class PilotIncidentOut(BaseModel):
    id: int
    pilot_id: int
    title: str
    description: str
    severity: str
    status: str
    reported_by: Optional[int]
    resolved_at: Optional[datetime]
    resolution: str
    meta: dict
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
