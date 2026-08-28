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
    step: '01',
    id: 'intake', name: 'Intake & Clinical Scoring', icon: ClipboardList, color: '#6d28d9',
    image: '/medical/ecg_monitor.jpg',
    summary: 'Validates vital signs against age-stratified thresholds (pediatric / adult / geriatric) and calculates derived physiological scores.',
    inputs: ['Heart Rate, Blood Pressure, SpO2, Respiratory Rate, Temperature, Pain Scale', 'Patient demographics (age, sex, arrival mode)'],
    outputs: ['Shock Index (HR/SBP)', 'Modified Early Warning Score (MEWS)', 'Mean Arterial Pressure (MAP)', 'Vital sign anomaly flags per age group'],
    code: `def intake_agent(state: TriageState) -> dict:
    patient = state["patient"]
    vitals = patient["vitals"]
    thresholds = get_thresholds(patient["age"])
    shock_index = vitals["hr"] / max(vitals["sbp"], 1)
    mews = calculate_mews(vitals, thresholds)
    return {
        "derived_scores": {"shock_index": shock_index, "mews": mews},
        "vital_flags": assess_vital_flags(vitals, thresholds)
    }`,
  },
  {
    step: '02',
    id: 'ml_nlp', name: 'ML & NLP Prediction Fusion', icon: Brain, color: '#7c3aed',
    image: '/medical/triage_desk.jpg',
    summary: 'Combines tabular ML (XGBoost on 13 features) with 5-tier NLP text analysis via weighted late fusion for ESI prediction.',
    inputs: ['13 clinical features (vitals + derived scores)', 'Free-text chief complaint', 'Fusion weights: ML=0.65, NLP=0.35'],
    outputs: ['5-class ESI probability distribution', 'NLP urgency classification with keyword matching', 'Entropy-based confidence score with agreement bonus'],
    code: `def ml_agent(state: TriageState) -> dict:
    features = build_feature_vector(state)
    ml_probs = xgb_model.predict_proba(features)
    nlp_result = nlp_extractor.extract(state["patient"]["chief_complaint"])
    fused_probs = 0.65 * ml_probs + 0.35 * nlp_result["probabilities"]
    confidence = calculate_calibrated_confidence(fused_probs, ml_probs)
    return {"ml_score": ml_probs, "nlp_extraction": nlp_result, "fused_prediction": fused_probs}`,
  },
  {
    step: '03',
    id: 'safety', name: 'Clinical Safety Governance', icon: ShieldAlert, color: '#dc2626',
    image: '/medical/surgery_lights.jpg',
    summary: 'Enforces 18 hard-coded safety rules with asymmetric loss (20x under-triage penalty) and confidence-based action governance.',
    inputs: ['Fused prediction probabilities', 'Active vital sign flags (tachycardia, hypotension, etc.)', 'NLP semantic alerts (stroke, sepsis, cardiac arrest)'],
    outputs: ['Safety rule overrides (automatic ESI-1 for life threats)', 'Adjusted prediction with asymmetric bias', 'Action type: DECIDE / ESCALATE / RECOMMEND'],
    code: `def safety_agent(state: TriageState) -> dict:
    overrides = safety_engine.evaluate(
        vitals=state["patient"]["vitals"],
        derived=state["derived_scores"],
        nlp_flags=state["nlp_extraction"]["semantic_flags"]
    )
    if overrides:
        return {"action_type": "DECIDE", "final_esi": min(o["override_esi"] for o in overrides)}
    adjusted = asymmetric_adjuster.apply(state["fused_prediction"])
    return {"action_type": "RECOMMEND", "safety_overrides": overrides, "adjusted": adjusted}`,
  },
  {
    step: '04',
    id: 'rag', name: 'RAG Clinical Explainer', icon: BookOpen, color: '#4f46e5',
    image: '/medical/doctor_tablet.jpg',
    summary: 'Generates clinical rationale grounded in ESI Handbook v4, AHA, ASA, and Surviving Sepsis Campaign protocols.',
    inputs: ['Assigned ESI level and action type', 'Active protocols and safety overrides', 'Calculated vital narratives and severity markers'],
    outputs: ['Plain-English clinical rationale', 'Protocol-specific action checklist', 'Pediatric/geriatric special considerations'],
    code: `def rag_agent(state: TriageState) -> dict:
    guidelines = retrieve_esi_guidelines(state["final_esi"])
    rationale = build_clinical_rationale(
        esi=state["final_esi"],
        patient=state["patient"],
        scores=state["derived_scores"],
        rules=state.get("safety_overrides", [])
    )
    return {"rag_rationale": rationale, "retrieved_guidelines": guidelines}`,
  },
  {
    step: '05',
    id: 'cockpit', name: 'Decision Cockpit & Audit', icon: MonitorCheck, color: '#059669',
    image: '/medical/emergency_bay.jpg',
    summary: 'Determines hospital routing, computes feature importance via SHAP, and writes immutable audit records.',
    inputs: ['Final ESI assignment', 'ML feature importance matrix', 'Clinician identification and session metadata'],
    outputs: ['Target routing (Resuscitation Bay → Waiting Room)', 'Top-5 SHAP feature attributions', 'Timestamped immutable audit log entry'],
    code: `def cockpit_agent(state: TriageState) -> dict:
    routing = ROUTING_MAP.get(state["final_esi"], "Waiting Room")
    audit_entry = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "patient_id": state["patient"]["patient_id"],
        "final_esi": state["final_esi"],
        "routing": routing
    }
    return {"routing": routing, "audit_entry": audit_entry}`,
  },
];

export default function PipelinePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = AGENT_SPECS[activeIdx];
  const Icon = active.icon;

  return (
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Architecture Inspector</span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            LangGraph <span className="text-purple-700">Multi-Agent</span> Pipeline
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            StateGraph architecture with 5 compiled agent nodes processing patient data sequentially with deterministic safety checks.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-2xl text-xs text-purple-900 font-mono font-bold shadow-xs">
          <Cpu className="w-4 h-4 text-purple-700" />
          triage_graph.compile()
        </div>
      </div>

      {/* Stage Selector (01 to 05) with Thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {AGENT_SPECS.map((node, i) => {
          const NodeIcon = node.icon;
          const isActive = activeIdx === i;
          return (
            <button
              key={node.id}
              onClick={() => setActiveIdx(i)}
              className={`p-3.5 rounded-2xl text-left transition-all duration-200 border overflow-hidden relative group ${
                isActive
                  ? 'bg-purple-50/90 border-purple-300 shadow-purple-sm ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200/80 hover:border-purple-200 hover:bg-slate-50 shadow-card'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {node.step}
                </span>
                <NodeIcon className={`w-4 h-4 ${isActive ? 'text-purple-700' : 'text-slate-400'}`} />
              </div>
              <p className={`text-xs font-black truncate ${isActive ? 'text-purple-950' : 'text-slate-800'}`}>
                {node.name.split(' & ')[0]}
              </p>
              <span className="text-[10px] text-slate-400 truncate block mt-0.5">Agent {i + 1}</span>
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
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left — Description + Image + I/O (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-purple-50 border border-purple-200">
                <Icon className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">Stage {active.step}</span>
                  <h2 className="text-lg font-black text-slate-900">{active.name}</h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">backend/agents/{active.id}_agent.py</span>
              </div>
            </div>

            {/* Medical Context Image Banner */}
            <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-slate-200/60 shadow-xs">
              <img
                src={active.image}
                alt={active.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  Clinical Environment: {active.name}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">{active.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-700" /> Inputs
                </span>
                <ul className="space-y-1.5">
                  {active.inputs.map((inp, j) => (
                    <li key={j} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                      <ChevronRight className="w-3.5 h-3.5 text-purple-700 mt-0.5 shrink-0" />
                      {inp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Outputs
                </span>
                <ul className="space-y-1.5">
                  {active.outputs.map((out, j) => (
                    <li key={j} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      {out}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right — Code (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-purple-700" /> Agent Implementation
                </span>
                <span className="text-[10px] font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md font-bold">Python 3.11</span>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed shadow-inner">
                <code>{active.code}</code>
              </pre>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-start gap-2.5 mt-2">
              <Sparkles className="w-4 h-4 text-purple-700 mt-0.5 shrink-0" />
              <p className="text-[11px] text-purple-900 font-medium leading-relaxed">
                State updates are immutably merged into the shared <code className="font-bold text-purple-950 bg-white px-1.5 py-0.5 rounded border border-purple-200">TriageState</code> dictionary before flowing to the next node.
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
