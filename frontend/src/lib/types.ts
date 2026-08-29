/* ── PatientTriage.ai — Shared TypeScript Type Definitions ────────────────── */

// ── Auth & User Types ──────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hospital: string;
  specialty?: string;
  avatar: string;
  badge: string;
  is_physician?: boolean;
  created_at?: string;
}

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: string;
  badge: string;
  avatar: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ── Patient Types ──────────────────────────────────────────────────────────

export interface Vitals {
  hr: number;
  sbp: number;
  dbp: number;
  spo2: number;
  rr: number;
  temp: number;
  pain: number | null;
}

export interface Patient {
  patient_id: string;
  name: string;
  age: number;
  sex: string;
  arrival_mode: string;
  chief_complaint: string;
  vitals: Vitals;
  medical_history: string[];
  medications: string[];
  allergies: string[];
  has_prior_records: boolean;
  arrival_timestamp: string;
  expected_esi?: number;
}

// ── Triage Result Types ────────────────────────────────────────────────────

export interface DerivedScores {
  shock_index: number | null;
  mews: number | null;
  map: number | null;
}

export interface MLScore {
  esi_prediction: number;
  probabilities: number[];
  confidence: number;
  feature_importance: Record<string, number>;
}

export interface NLPExtraction {
  urgency_score: number;
  urgency_level: string;
  key_phrases: string[];
  semantic_flags: string[];
  negations: string[];
}

export interface FusedPrediction {
  esi: number;
  confidence: number;
  probabilities: number[];
}

export interface SafetyOverride {
  rule_id: string;
  rule_name: string;
  triggered_by: string;
  override_esi: number;
  severity: string;
  action: string;
}

export interface AdjustedPrediction {
  esi: number;
  confidence: number;
  probabilities: number[];
  adjustment: {
    original_esi: number;
    adjusted_esi: number;
    adjustment_applied: boolean;
    reason: string;
  };
}

export interface ConfidenceResult {
  confidence_level: string;
  needs_senior_review: boolean;
  recommendation: string;
}

export interface TriageResult {
  patient: Patient;
  age_group: string;
  derived_scores: DerivedScores;
  vital_flags: string[];
  missing_data: string[];
  thresholds: Record<string, number>;
  ml_score: MLScore;
  nlp_extraction: NLPExtraction;
  fused_prediction: FusedPrediction;
  safety_overrides: SafetyOverride[];
  confidence_flag: string;
  confidence_result: ConfidenceResult;
  action_type: string;
  adjusted_prediction: AdjustedPrediction;
  rag_rationale: string;
  retrieved_guidelines: Record<string, unknown>;
  recommendations: string[];
  final_esi: number;
  final_confidence: number;
  shap_values: Record<string, number>;
  routing: string;
  audit_entry: Record<string, unknown>;
}

// ── Monitoring Types ───────────────────────────────────────────────────────

export interface WaitingPatient {
  patient_id: string;
  name: string;
  esi_level: number;
  arrival_time: string;
  status?: string;
  wait_minutes?: number;
  threshold_minutes?: number;
}

export interface SurgeStatus {
  is_surge: boolean;
  current_rate_per_hour: number;
  baseline_rate: number;
  threshold: number;
}

export interface WaitingRoomResponse {
  queue: WaitingPatient[];
  stats: {
    total_waiting: number;
    by_esi: Record<number, number>;
  };
}

// ── Audit Types ────────────────────────────────────────────────────────────

export interface AuditOverride {
  original_esi: number;
  new_esi: number;
  reason: string;
}

export interface AuditEntry {
  event_id: string;
  timestamp: string;
  patient_id: string;
  patient_name?: string;
  nurse_id: string;
  pipeline_version?: string;
  age_group?: string;
  final_esi: number;
  final_confidence?: number;
  action_type: string;
  confidence_flag?: string;
  routing?: string;
  rationale?: string;
  override?: AuditOverride | null;
  type?: string;
}
