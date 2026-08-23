'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, ClipboardList, Brain, ShieldAlert, BookOpen, MonitorCheck,
  CheckCircle2, Code, ArrowRight, Sparkles, ChevronRight
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const AGENT_SPECS = [
  {
    id: 'intake', name: 'Intake & Clinical Scoring', icon: ClipboardList, color: '#3b82f6',
    summary: 'Validates vital signs against age-stratified thresholds (pediatric / adult / geriatric) and calculates derived physiological scores.',
    inputs: ['Heart Rate, Blood Pressure, SpO2, Respiratory Rate, Temperature, Pain Scale', 'Patient demographics (age, sex, arrival mode)'],
    outputs: ['Shock Index (HR/SBP)', 'Modified Early Warning Score (MEWS)', 'Mean Arterial Pressure (MAP)', 'Vital sign anomaly flags per age group'],
    code: `def intake_agent(state):\n  vitals = state["patient"]["vitals"]\n  thresholds = get_thresholds(state["patient"]["age"])\n  shock_index = vitals["hr"] / vitals["sbp"]\n  mews = calculate_mews(vitals, thresholds)\n  return {"derived_scores": {"shock_index": shock_index, "mews": mews}}`,
  },
  {
    id: 'ml_nlp', name: 'ML & NLP Prediction Fusion', icon: Brain, color: '#a855f7',
    summary: 'Combines tabular ML (XGBoost on 13 features) with 5-tier NLP text analysis via weighted late fusion for ESI prediction.',
    inputs: ['13 clinical features (vitals + derived scores)', 'Free-text chief complaint', 'Fusion weights: ML=0.65, NLP=0.35'],
    outputs: ['5-class ESI probability distribution', 'NLP urgency classification with keyword matching', 'Entropy-based confidence score with agreement bonus'],
    code: `def ml_agent(state):\n  ml_probs = xgb_model.predict_proba(features)\n  nlp_probs = nlp_classify(complaint)\n  fused = 0.65 * ml_probs + 0.35 * nlp_probs\n  confidence = _calculate_confidence(fused, ml_probs, nlp_probs)\n  return {"fused_prediction": fused, "confidence": confidence}`,
  },
  {
    id: 'safety', name: 'Clinical Safety Governance', icon: ShieldAlert, color: '#ef4444',
    summary: 'Enforces 18 hard-coded safety rules with asymmetric loss (20x under-triage penalty) and confidence-based action governance.',
    inputs: ['Fused prediction probabilities', 'Active vital sign flags (tachycardia, hypotension, etc.)', 'NLP semantic alerts (stroke, sepsis, cardiac arrest)'],
    outputs: ['Safety rule overrides (automatic ESI-1 for life threats)', 'Adjusted prediction with asymmetric bias', 'Action type: DECIDE / ESCALATE / RECOMMEND'],
    code: `def safety_agent(state):\n  if any(critical_flags):\n    override_to_esi1()\n  if confidence < 0.70:\n    action = "ESCALATE"  # Require senior review\n  elif esi <= 2:\n    action = "DECIDE"    # Autonomous escalation\n  return {"action_type": action, "overrides": rules_triggered}`,
  },
  {
    id: 'rag', name: 'RAG Clinical Explainer', icon: BookOpen, color: '#06b6d4',
    summary: 'Generates clinical rationale grounded in ESI Handbook v4, AHA, ASA, and Surviving Sepsis Campaign protocols.',
    inputs: ['Assigned ESI level and action type', 'Active protocols and safety overrides', 'Calculated vital narratives and severity markers'],
    outputs: ['Plain-English clinical rationale', 'Protocol-specific action checklist', 'Pediatric/geriatric special considerations'],
    code: `def rag_agent(state):\n  context = retrieve_protocols(esi_level, overrides)\n  rationale = generate_explanation(\n    esi=state["final_esi"],\n    protocols=context,\n    vitals=state["vital_narratives"]\n  )\n  return {"rag_rationale": rationale, "recommendations": actions}`,
  },
  {
    id: 'cockpit', name: 'Decision Cockpit & Audit', icon: MonitorCheck, color: '#22c55e',
    summary: 'Determines hospital routing, computes feature importance via SHAP, and writes immutable audit records.',
    inputs: ['Final ESI assignment', 'ML feature importance matrix', 'Clinician identification and session metadata'],
    outputs: ['Target routing (Resuscitation Bay → Waiting Room)', 'Top-5 SHAP feature attributions', 'Timestamped immutable audit log entry'],
    code: `def cockpit_agent(state):\n  routing = ROUTING_MAP[state["final_esi"]]\n  shap_values = explainer.shap_values(features)\n  audit_entry = create_audit_log(state, nurse_id)\n  return {"routing": routing, "audit": audit_entry}`,
  },
];

export default function PipelinePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = AGENT_SPECS[activeIdx];
  const Icon = active.icon;

  return (
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">
            <span className="gradient-text">LangGraph Multi-Agent</span>{' '}
            <span className="text-white">Pipeline</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            StateGraph architecture with 5 compiled agent nodes processing patient data sequentially
          </p>
        </div>
        <div className="flex items-center gap-2 glass-sm px-3 py-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5 text-accent-400" />
          triage_graph.compile()
        </div>
      </div>

      {/* Stage Selector */}
      <div className="grid grid-cols-5 gap-2">
        {AGENT_SPECS.map((node, i) => {
          const NodeIcon = node.icon;
          const isActive = activeIdx === i;
          return (
            <button
              key={node.id}
              onClick={() => setActiveIdx(i)}
              className={`glass-sm p-3 text-left transition-all border ${
                isActive
                  ? 'border-accent-500/40 shadow-glass bg-accent-500/5'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono text-gray-600">Stage {i + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <NodeIcon className="w-4 h-4" style={{ color: isActive ? node.color : '#4b5563' }} />
                <p className={`text-[11px] font-bold ${isActive ? 'text-accent-300' : 'text-gray-400'}`}>
                  {node.name.split(' & ')[0]}
                </p>
              </div>
              {isActive && <div className="w-full h-0.5 bg-gradient-to-r from-accent-500 to-cyan-500 rounded-full mt-2" />}
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {/* Left — Description + I/O */}
          <GlassCard variant="elevated" className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${active.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: active.color }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{active.name}</h2>
                <span className="text-[9px] font-mono text-gray-600">agents/{active.id}_agent.py</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">{active.summary}</p>

            <div className="space-y-3">
              <div className="p-3 glass-sm space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-accent-400" /> Inputs
                </span>
                <ul className="space-y-1">
                  {active.inputs.map((inp, j) => (
                    <li key={j} className="text-[11px] text-gray-400 flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-accent-400 mt-0.5 shrink-0" />
                      {inp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 glass-sm space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-400" /> Outputs
                </span>
                <ul className="space-y-1">
                  {active.outputs.map((out, j) => (
                    <li key={j} className="text-[11px] text-gray-400 flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-500/40 mt-0.5 shrink-0" />
                      {out}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Right — Code */}
          <GlassCard variant="elevated" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-accent-400" /> Agent Implementation
              </span>
              <span className="text-[9px] font-mono text-gray-600">Python 3.11</span>
            </div>

            <pre className="p-4 bg-black/30 rounded-xl border border-white/[0.04] overflow-x-auto text-[11px] leading-relaxed">
              <code className="text-gray-300 font-mono">{active.code}</code>
            </pre>

            <div className="p-3 glass-sm flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Each agent receives the shared <code className="text-accent-300 bg-accent-500/10 px-1 rounded">TriageState</code> TypedDict and
                returns a partial update that merges into the graph state before the next node executes.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
