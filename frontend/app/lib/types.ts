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
