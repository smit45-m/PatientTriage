/* ── PatientTriage.ai — Shared Constants ──────────────────────────────────── */

/** ESI level color palette — used by ESIBadge, TriageCard, and monitor pages */
export const ESI_COLORS: Record<number, string> = {
  1: '#ef4444', // Red — Resuscitation
  2: '#f97316', // Orange — Emergent
  3: '#eab308', // Yellow — Urgent
  4: '#10b981', // Green — Less Urgent
  5: '#3b82f6', // Blue — Non-Urgent
};

/** ESI level human-readable labels */
export const ESI_LABELS: Record<number, string> = {
  1: 'Resuscitation',
  2: 'Emergent',
  3: 'Urgent',
  4: 'Less Urgent',
  5: 'Non-Urgent',
};

/** ESI safe wait-time thresholds in minutes — mirrors backend ESI_WAIT_THRESHOLDS */
export const ESI_WAIT_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 10,
  3: 30,
  4: 60,
  5: 120,
};

/** Department routing labels by ESI level */
export const ESI_ROUTING: Record<number, string> = {
  1: 'Resuscitation Bay',
  2: 'Acute Care',
  3: 'Urgent Care',
  4: 'Fast Track',
  5: 'Waiting Room',
};

/** Action type labels for triage governance */
export const ACTION_TYPES: Record<string, { label: string; color: string; bgColor: string }> = {
  DECIDE: {
    label: 'Auto-Escalated',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  ESCALATE: {
    label: 'Senior Review',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  RECOMMEND: {
    label: 'AI Recommended',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
};

/** Pipeline stage names for the 5-agent graph visualization */
export const PIPELINE_STAGES = [
  { id: 'intake', name: 'Intake & Scoring', shortName: 'Intake' },
  { id: 'ml_nlp', name: 'ML & NLP Fusion', shortName: 'ML/NLP' },
  { id: 'safety', name: 'Safety Governance', shortName: 'Safety' },
  { id: 'rag', name: 'RAG Explainer', shortName: 'RAG' },
  { id: 'cockpit', name: 'Decision Cockpit', shortName: 'Cockpit' },
] as const;

/** Confidence level thresholds */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.70,
  LOW: 0.0,
} as const;
