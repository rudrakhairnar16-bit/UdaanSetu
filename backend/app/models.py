from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Role(str, Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    MENTOR = "mentor"
    INVESTOR = "investor"
    INCUBATOR = "incubator"
    GOVT_OFFICER = "govt_officer"
    PROCUREMENT_OFFICER = "procurement_officer"
    EVALUATOR = "evaluator"
    VALIDATOR = "validator"
    STARTUP = "startup"
    AUDITOR = "auditor"


VALID_ROLES = {r.value for r in Role}


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), default=Role.RESEARCHER.value)
    district: Mapped[str] = mapped_column(String(100), default="")
    organization: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


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
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    action: Mapped[str] = mapped_column(String(100))
    entity: Mapped[str] = mapped_column(String(60))
    entity_id: Mapped[int] = mapped_column()
    actor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    detail: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text)
    kind: Mapped[str] = mapped_column(String(40), default="info")
    read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    id: Mapped[int] = mapped_column(primary_key=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    sector: Mapped[str] = mapped_column(String(100), default="")
    district: Mapped[str] = mapped_column(String(100), default="")
    contact_email: Mapped[str] = mapped_column(String(200), default="")
    contact_phone: Mapped[str] = mapped_column(String(20), default="")
    website: Mapped[str] = mapped_column(String(300), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Challenge(Base):
    __tablename__ = "challenges"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(240))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(100), default="")
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="draft")
    budget_range: Mapped[str] = mapped_column(String(100), default="")
    timeline_weeks: Mapped[int] = mapped_column(Integer, default=12)
    evaluation_criteria: Mapped[dict] = mapped_column(JSON, default=dict)
    district: Mapped[str] = mapped_column(String(100), default="")
    sector: Mapped[str] = mapped_column(String(100), default="")
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Pilot(Base):
    __tablename__ = "pilots"
    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    startup_id: Mapped[int] = mapped_column(ForeignKey("records.id"))
    duration_weeks: Mapped[int] = mapped_column(Integer, default=8)
    scope: Mapped[str] = mapped_column(Text, default="")
    budget: Mapped[str] = mapped_column(String(100), default="")
    data_clauses: Mapped[dict] = mapped_column(JSON, default=dict)
    ip_clauses: Mapped[dict] = mapped_column(JSON, default=dict)
    cybersecurity_requirements: Mapped[str] = mapped_column(Text, default="")
    risk_management: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(40), default="proposed")
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    budget_utilization_pct: Mapped[float] = mapped_column(default=0.0)
    actual_spend: Mapped[str] = mapped_column(String(100), default="0")
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class PilotMilestone(Base):
    __tablename__ = "pilot_milestones"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    deliverables: Mapped[dict] = mapped_column(JSON, default=dict)
    payment_amount: Mapped[str] = mapped_column(String(50), default="0")
    payment_status: Mapped[str] = mapped_column(String(40), default="pending")
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    approval_status: Mapped[str] = mapped_column(String(40), default="pending")
    approved_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    milestone_id: Mapped[Optional[int]] = mapped_column(ForeignKey("pilot_milestones.id"), nullable=True)
    amount: Mapped[str] = mapped_column(String(50))
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    invoice_number: Mapped[str] = mapped_column(String(100), default="")
    invoice_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    payment_status: Mapped[str] = mapped_column(String(40), default="pending")
    payment_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    transaction_id: Mapped[str] = mapped_column(String(100), default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Evaluation(Base):
    __tablename__ = "evaluations"
    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    startup_id: Mapped[int] = mapped_column(ForeignKey("records.id"))
    evaluator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    scores: Mapped[dict] = mapped_column(JSON, default=dict)
    recommendation: Mapped[dict] = mapped_column(JSON, default=dict)
    comments: Mapped[str] = mapped_column(Text, default="")
    evaluated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class ScaleUpDecision(Base):
    __tablename__ = "scale_up_decisions"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    decision: Mapped[str] = mapped_column(String(40), default="pending")
    decided_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    target_departments: Mapped[dict] = mapped_column(JSON, default=dict)
    budget_allocation: Mapped[str] = mapped_column(String(100), default="")
    rationale: Mapped[str] = mapped_column(Text, default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    target_districts: Mapped[dict] = mapped_column(JSON, default=dict)
    pilot_kpis: Mapped[dict] = mapped_column(JSON, default=dict)
    scale_kpis: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(40), default="proposed")
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Template(Base):
    __tablename__ = "templates"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    type: Mapped[str] = mapped_column(String(60))
    content: Mapped[dict] = mapped_column(JSON, default=dict)
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    is_active: Mapped[bool] = mapped_column(default=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Application (Startup applies to Challenge) ──

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    startup_id: Mapped[int] = mapped_column(ForeignKey("records.id"))
    status: Mapped[str] = mapped_column(String(40), default="submitted")
    proposal: Mapped[str] = mapped_column(Text, default="")
    proposed_budget: Mapped[str] = mapped_column(String(100), default="")
    proposed_timeline_weeks: Mapped[int] = mapped_column(Integer, default=12)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Eligibility Check ──

class EligibilityCheck(Base):
    __tablename__ = "eligibility_checks"
    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    rules_checked: Mapped[dict] = mapped_column(JSON, default=dict)
    result: Mapped[str] = mapped_column(String(40), default="pending")
    failed_conditions: Mapped[dict] = mapped_column(JSON, default=dict)
    override_reason: Mapped[str] = mapped_column(Text, default="")
    overridden_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Challenge Requirements ──

class ChallengeRequirement(Base):
    __tablename__ = "challenge_requirements"
    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    req_type: Mapped[str] = mapped_column(String(60))
    key: Mapped[str] = mapped_column(String(200))
    value: Mapped[str] = mapped_column(Text, default="")
    is_mandatory: Mapped[bool] = mapped_column(default=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ── SIH26136: Evaluation Score (criterion-level) ──

class EvaluationScore(Base):
    __tablename__ = "evaluation_scores"
    id: Mapped[int] = mapped_column(primary_key=True)
    evaluation_id: Mapped[int] = mapped_column(ForeignKey("evaluations.id"))
    criterion: Mapped[str] = mapped_column(String(200))
    weight: Mapped[float] = mapped_column(default=0.0)
    score: Mapped[float] = mapped_column(default=0.0)
    comments: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ── SIH26136: Conflict of Interest Declaration ──

class ConflictOfInterest(Base):
    __tablename__ = "conflict_of_interests"
    id: Mapped[int] = mapped_column(primary_key=True)
    evaluator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    has_conflict: Mapped[bool] = mapped_column(default=False)
    declaration: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ── SIH26136: Pilot Metric (KPI tracking) ──

class PilotMetric(Base):
    __tablename__ = "pilot_metrics"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    unit: Mapped[str] = mapped_column(String(50), default="")
    baseline_value: Mapped[str] = mapped_column(String(100), default="")
    target_value: Mapped[str] = mapped_column(String(100), default="")
    actual_value: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[str] = mapped_column(String(40), default="tracking")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Pilot Evidence ──

class PilotEvidence(Base):
    __tablename__ = "pilot_evidence"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    milestone_id: Mapped[Optional[int]] = mapped_column(ForeignKey("pilot_milestones.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    evidence_type: Mapped[str] = mapped_column(String(60), default="document")
    file_url: Mapped[str] = mapped_column(String(500), default="")
    submitted_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ── SIH26136: Independent Validation ──

class Validation(Base):
    __tablename__ = "validations"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    validator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    outcome: Mapped[str] = mapped_column(String(40), default="pending")
    recommendation: Mapped[str] = mapped_column(String(40), default="pending")
    scores: Mapped[dict] = mapped_column(JSON, default=dict)
    evidence_review: Mapped[str] = mapped_column(Text, default="")
    rationale: Mapped[str] = mapped_column(Text, default="")
    kpi_achievement_pct: Mapped[float] = mapped_column(default=0.0)
    cost_efficiency_pct: Mapped[float] = mapped_column(default=0.0)
    security_score: Mapped[float] = mapped_column(default=0.0)
    scalability_score: Mapped[float] = mapped_column(default=0.0)
    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Procurement ──

class Procurement(Base):
    __tablename__ = "procurements"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    status: Mapped[str] = mapped_column(String(40), default="recommended")
    procurement_method: Mapped[str] = mapped_column(String(100), default="")
    estimated_value: Mapped[str] = mapped_column(String(100), default="")
    approved_value: Mapped[str] = mapped_column(String(100), default="")
    approving_authority: Mapped[str] = mapped_column(String(200), default="")
    approval_status: Mapped[str] = mapped_column(String(40), default="pending")
    external_reference_type: Mapped[str] = mapped_column(String(100), default="")
    external_reference_id: Mapped[str] = mapped_column(String(200), default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Contract ──

class Contract(Base):
    __tablename__ = "contracts"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    contract_number: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[str] = mapped_column(String(40), default="draft")
    signed_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    value: Mapped[str] = mapped_column(String(100), default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Purchase Order ──

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"))
    po_number: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[str] = mapped_column(String(40), default="draft")
    amount: Mapped[str] = mapped_column(String(100), default="")
    issued_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Grievance ──

class Grievance(Base):
    __tablename__ = "grievances"
    id: Mapped[int] = mapped_column(primary_key=True)
    startup_id: Mapped[int] = mapped_column(ForeignKey("records.id"))
    challenge_id: Mapped[Optional[int]] = mapped_column(ForeignKey("challenges.id"), nullable=True)
    pilot_id: Mapped[Optional[int]] = mapped_column(ForeignKey("pilots.id"), nullable=True)
    category: Mapped[str] = mapped_column(String(60), default="other")
    subject: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(40), default="open")
    assigned_to: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    resolution: Mapped[str] = mapped_column(Text, default="")
    sla_days: Mapped[int] = mapped_column(Integer, default=15)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: IP/Data Agreement ──

class IPDataAgreement(Base):
    __tablename__ = "ip_data_agreements"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    background_ip: Mapped[str] = mapped_column(Text, default="")
    foreground_ip: Mapped[str] = mapped_column(Text, default="")
    data_ownership: Mapped[str] = mapped_column(Text, default="")
    data_access: Mapped[str] = mapped_column(Text, default="")
    data_retention: Mapped[str] = mapped_column(Text, default="")
    confidentiality: Mapped[str] = mapped_column(Text, default="")
    model_source_code: Mapped[str] = mapped_column(Text, default="")
    exit_terms: Mapped[str] = mapped_column(Text, default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Document Version ──

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    id: Mapped[int] = mapped_column(primary_key=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("records.id"))
    version: Mapped[int] = mapped_column(Integer, default=1)
    filename: Mapped[str] = mapped_column(String(300))
    file_url: Mapped[str] = mapped_column(String(500))
    uploaded_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    change_summary: Mapped[str] = mapped_column(Text, default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ── SIH26136: Document ACL ──

class DocumentACL(Base):
    __tablename__ = "document_acls"
    id: Mapped[int] = mapped_column(primary_key=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("records.id"))
    role: Mapped[str] = mapped_column(String(40))
    can_read: Mapped[bool] = mapped_column(default=True)
    can_write: Mapped[bool] = mapped_column(default=False)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ── SIH26136: Challenge Version History ──

class ChallengeVersion(Base):
    __tablename__ = "challenge_versions"
    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    version: Mapped[int] = mapped_column(Integer, default=1)
    snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    changed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    change_summary: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ── SIH26136: Compliance Checklist Item ──

class ComplianceChecklist(Base):
    __tablename__ = "compliance_checklists"
    id: Mapped[int] = mapped_column(primary_key=True)
    procurement_id: Mapped[int] = mapped_column(ForeignKey("procurements.id"))
    item: Mapped[str] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(40), default="pending")
    checked_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── SIH26136: Pilot Incident ──

class PilotIncident(Base):
    __tablename__ = "pilot_incidents"
    id: Mapped[int] = mapped_column(primary_key=True)
    pilot_id: Mapped[int] = mapped_column(ForeignKey("pilots.id"))
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(40), default="low")
    status: Mapped[str] = mapped_column(String(40), default="open")
    reported_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolution: Mapped[str] = mapped_column(Text, default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
