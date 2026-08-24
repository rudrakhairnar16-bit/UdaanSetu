export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  district: string;
  organization: string;
}

export interface AppRecord {
  id: number;
  kind: string;
  title: string;
  description: string;
  stage: string;
  district: string;
  sector: string;
  owner_id: number | null;
  parent_id: number | null;
  meta: { [key: string]: any };
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  banner: string;
  counts: { [key: string]: number };
  at_risk: { id: number; title: string; score: number; level: string; confidence: number; feature_importance: Record<string, number>; reasons: string[]; method: string }[];
  recent: AppRecord[];
  pipeline: { [key: string]: { total: number; stages: { [key: string]: number } } };
  districts: string[];
}

export interface AIRecommendation {
  innovation_id: number;
  title: string;
  matches: {
    id: number;
    type: string;
    title: string;
    score: number;
    reason: string;
    stage?: string;
    sector?: string;
    district?: string;
  }[];
  insight: string;
  method: string;
}

export interface Notification {
  id: number;
  message: string;
  kind: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id: number;
  actor_id: number | null;
  detail: { [key: string]: any };
  created_at: string;
}

export interface Analytics {
  total_records: number;
  by_kind: { [key: string]: number };
  by_sector: { [key: string]: number };
  by_district: { [key: string]: number };
  avg_research_progress: number;
  total_funding_required: number;
  total_startup_revenue: number;
  total_jobs_created: number;
  total_farmers_reached: number;
  label: string;
}

export interface AIMetrics {
  risk_model: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    auc_roc: number;
    training_samples: number;
    feature_names: string[];
    confusion_matrix: number[][];
    trained_at: string;
  } | null;
  semantic_engine: {
    model: string;
    corpus_size: number;
    ready: boolean;
  };
}

export interface SuccessPrediction {
  research_id: number;
  title: string;
  probability: number;
  confidence_interval: [number, number];
  key_factors: { feature: string; importance: number; current_value: string }[];
  comparable_projects: { id: number; title: string; similarity: number; method: string }[];
  method: string;
}

export interface DuplicateCluster {
  id: number;
  records: { id: number; title: string }[];
  similarity: number;
  description: string;
}

export interface GovResponse {
  service: string;
  status: string;
  timestamp: number;
  request_id: string;
  demo: boolean;
  [key: string]: any;
}

export interface Department {
  id: number;
  name: string;
  sector: string;
  district: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address: string;
  meta: { [key: string]: any };
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  department_id: number | null;
  status: string;
  budget_range: string;
  timeline_weeks: number;
  evaluation_criteria: { [key: string]: any };
  district: string;
  sector: string;
  owner_id: number | null;
  meta: { [key: string]: any };
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pilot {
  id: number;
  challenge_id: number;
  startup_id: number;
  duration_weeks: number;
  scope: string;
  budget: string;
  data_clauses: { [key: string]: any };
  ip_clauses: { [key: string]: any };
  cybersecurity_requirements: string;
  risk_management: { [key: string]: any };
  status: string;
  start_date: string | null;
  end_date: string | null;
  owner_id: number | null;
  meta: { [key: string]: any };
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PilotMilestone {
  id: number;
  pilot_id: number;
  title: string;
  description: string;
  deliverables: { [key: string]: any };
  payment_amount: string;
  payment_status: string;
  due_date: string | null;
  completed_date: string | null;
  approval_status: string;
  approved_by: number | null;
  approved_at: string | null;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  pilot_id: number;
  milestone_id: number | null;
  amount: string;
  currency: string;
  invoice_number: string;
  invoice_date: string | null;
  payment_status: string;
  payment_date: string | null;
  transaction_id: string;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: number;
  challenge_id: number;
  startup_id: number;
  evaluator_id: number;
  scores: { [key: string]: any };
  recommendation: { [key: string]: any };
  comments: string;
  evaluated_at: string | null;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface ScaleUpDecision {
  id: number;
  pilot_id: number;
  decision: string;
  decided_by: number | null;
  decided_at: string | null;
  target_departments: { [key: string]: any };
  budget_allocation: string;
  rationale: string;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  name: string;
  type: string;
  content: { [key: string]: any };
  version: string;
  is_active: boolean;
  meta: { [key: string]: any };
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  challenge_id: number;
  startup_id: number;
  status: string;
  proposal: string;
  proposed_budget: string;
  proposed_timeline_weeks: number;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface Validation {
  id: number;
  pilot_id: number;
  validator_id: number;
  outcome: string;
  recommendation: string;
  scores: { [key: string]: any };
  evidence_review: string;
  rationale: string;
  kpi_achievement_pct: number;
  cost_efficiency_pct: number;
  security_score: number;
  scalability_score: number;
  validated_at: string | null;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  pilot_id: number;
  contract_number: string;
  status: string;
  signed_date: string | null;
  expiry_date: string | null;
  value: string;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: number;
  contract_id: number;
  po_number: string;
  status: string;
  amount: string;
  issued_date: string | null;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface Grievance {
  id: number;
  startup_id: number;
  challenge_id: number | null;
  pilot_id: number | null;
  category: string;
  subject: string;
  description: string;
  status: string;
  assigned_to: number | null;
  resolution: string;
  sla_days: number;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface EligibilityCheck {
  id: number;
  application_id: number;
  rules_checked: { [key: string]: any };
  result: string;
  failed_conditions: { [key: string]: any };
  override_reason: string;
  overridden_by: number | null;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface ConflictOfInterest {
  id: number;
  evaluator_id: number;
  application_id: number;
  has_conflict: boolean;
  declaration: string;
  created_at: string;
}

export interface PilotMetric {
  id: number;
  pilot_id: number;
  name: string;
  description: string;
  unit: string;
  baseline_value: string;
  target_value: string;
  actual_value: string;
  status: string;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface PilotEvidence {
  id: number;
  pilot_id: number;
  milestone_id: number | null;
  title: string;
  description: string;
  evidence_type: string;
  file_url: string;
  submitted_by: number | null;
  meta: { [key: string]: any };
  created_at: string;
}

export interface ChallengeRequirement {
  id: number;
  challenge_id: number;
  req_type: string;
  key: string;
  value: string;
  is_mandatory: boolean;
  meta: { [key: string]: any };
  created_at: string;
}

export interface EvaluationScore {
  id: number;
  evaluation_id: number;
  criterion: string;
  weight: number;
  score: number;
  comments: string;
  created_at: string;
}

export interface ChallengeVersion {
  id: number;
  challenge_id: number;
  version: number;
  snapshot: { [key: string]: any };
  changed_by: number | null;
  change_summary: string;
  created_at: string;
}

export interface IPDataAgreement {
  id: number;
  pilot_id: number;
  background_ip: string;
  foreground_ip: string;
  data_ownership: string;
  data_access: string;
  data_retention: string;
  confidentiality: string;
  model_source_code: string;
  exit_terms: string;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface ComplianceChecklist {
  id: number;
  procurement_id: number;
  item: string;
  status: string;
  checked_by: number | null;
  notes: string;
  meta: { [key: string]: any };
  created_at: string;
  updated_at: string;
}
