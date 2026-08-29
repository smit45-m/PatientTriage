'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Wind, Thermometer, Droplets, Gauge,
  Zap, ShieldAlert, CheckCircle2, AlertTriangle,
  RotateCcw, UserCheck, Stethoscope, Sparkles, BarChart2,
  Clock, ArrowRight, Bed, ShieldCheck, Check
} from 'lucide-react';
import { Patient, TriageResult } from '@/lib/types';
import { runTriage, submitOverride, confirmRoute } from '@/lib/api';
import VitalCard from './VitalCard';
import ESIBadge from './ESIBadge';
import ConfidenceGauge from './ConfidenceGauge';
import PipelineVisualizer from './PipelineVisualizer';
import GlassCard from './GlassCard';

interface TriageCardProps {
  patient: Patient;
  onTriageComplete?: (result: TriageResult) => void;
}

export default function TriageCard({ patient, onTriageComplete }: TriageCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideEsi, setOverrideEsi] = useState<number>(3);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSubmitted, setOverrideSubmitted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [routedSuccess, setRoutedSuccess] = useState<string | null>(null);

  const handleRunTriage = async () => {
    setIsRunning(true);
    setResult(null);
    setCompletedStages([]);
    setCurrentStage(0);

    for (let i = 0; i < 5; i++) {
      setCurrentStage(i);
      await new Promise((r) => setTimeout(r, 260 + Math.random() * 120));
      setCompletedStages((prev) => [...prev, i]);
    }

    try {
      const triageRes = await runTriage(patient.patient_id);
      setResult(triageRes);
      if (onTriageComplete) onTriageComplete(triageRes);
    } catch (e) {
      console.error('Triage error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleOverrideSubmit = async () => {
    if (!overrideReason.trim()) return;
    try {
      await submitOverride({
        patient_id: patient.patient_id,
        original_esi: result?.final_esi || patient.expected_esi || 3,
        new_esi: overrideEsi,
        reason: overrideReason,
        nurse_id: 'RN-Sarah',
      });
      setOverrideSubmitted(true);
      setTimeout(() => {
        setIsOverrideOpen(false);
        setOverrideSubmitted(false);
      }, 1200);
    } catch (e) {
      console.error('Override error:', e);
    }
  };

  const handleConfirmRoute = async () => {
    if (!result) return;
    setIsConfirming(true);
    try {
      await confirmRoute({
        patient_id: patient.patient_id,
        name: patient.name,
        final_esi: result.final_esi,
        target_bay: result.routing,
        nurse_id: 'RN-Sarah',
      });
      setRoutedSuccess(result.routing);
      setTimeout(() => {
        setRoutedSuccess(null);
      }, 4000);
    } catch (e) {
      console.error('Confirm route error:', e);
    } finally {
      setIsConfirming(false);
    }
  };

  const getVitalStatus = (name: string, value: number): 'normal' | 'warning' | 'critical' => {
    if (name === 'hr') return value > 140 || value < 45 ? 'critical' : value > 110 || value < 55 ? 'warning' : 'normal';
    if (name === 'sbp') return value < 85 || value > 190 ? 'critical' : value < 95 || value > 160 ? 'warning' : 'normal';
    if (name === 'spo2') return value < 90 ? 'critical' : value < 94 ? 'warning' : 'normal';
    if (name === 'rr') return value > 32 || value < 8 ? 'critical' : value > 24 || value < 10 ? 'warning' : 'normal';
    if (name === 'temp') return value > 39.5 || value < 35.0 ? 'critical' : value > 38.2 ? 'warning' : 'normal';
    if (name === 'pain') return value >= 8 ? 'critical' : value >= 5 ? 'warning' : 'normal';
    return 'normal';
  };

  // Extract top SHAP factors if present
  const shapEntries = result?.shap_values
    ? Object.entries(result.shap_values)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 5)
    : [];

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Patient Header Card */}
      <GlassCard variant="elevated" className="!p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 font-mono">
                {patient.age}y / {patient.sex}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 font-mono">
                {patient.patient_id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Arrival Mode: <strong className="text-slate-800 capitalize font-bold">{patient.arrival_mode}</strong>
              <span className="mx-2 text-slate-300">•</span>
              Medical Records: <strong className={patient.has_prior_records ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {patient.has_prior_records ? 'Available on EMR' : 'First Emergency Visit'}
              </strong>
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunTriage}
            disabled={isRunning}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white font-bold text-xs shadow-purple-sm hover:shadow-purple-md disabled:opacity-60 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executing 5-Stage Graph...' : 'Run Multi-Agent Triage'}
          </motion.button>
        </div>

        {/* Chief Complaint */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200/80 flex items-center justify-center shrink-0 mt-0.5">
            <Stethoscope className="w-4 h-4 text-purple-700" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-900/70">Clinical Chief Complaint</span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-relaxed">{patient.chief_complaint}</p>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <VitalCard icon={Heart} name="Heart Rate" value={patient.vitals.hr} unit="bpm" status={getVitalStatus('hr', patient.vitals.hr)} />
          <VitalCard icon={Activity} name="Blood Press." value={`${patient.vitals.sbp}/${patient.vitals.dbp}`} unit="mmHg" status={getVitalStatus('sbp', patient.vitals.sbp)} />
          <VitalCard icon={Droplets} name="SpO2 Sat." value={patient.vitals.spo2} unit="%" status={getVitalStatus('spo2', patient.vitals.spo2)} />
          <VitalCard icon={Wind} name="Resp. Rate" value={patient.vitals.rr} unit="/min" status={getVitalStatus('rr', patient.vitals.rr)} />
          <VitalCard icon={Thermometer} name="Body Temp." value={patient.vitals.temp} unit="°C" status={getVitalStatus('temp', patient.vitals.temp)} />
          <VitalCard icon={Gauge} name="Pain Scale" value={patient.vitals.pain} unit="/10" status={getVitalStatus('pain', patient.vitals.pain || 0)} />
        </div>

        {/* Derived Scores pill tags if available */}
        {result?.derived_scores && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Derived Telemetry:</span>
            {result.derived_scores.shock_index !== null && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                (result.derived_scores.shock_index ?? 0) >= 0.9
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                Shock Index: <strong>{result.derived_scores.shock_index?.toFixed(2)}</strong>
                {(result.derived_scores.shock_index ?? 0) >= 0.9 ? ' (Elevated)' : ' (Normal)'}
              </span>
            )}
            {result.derived_scores.mews !== null && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                (result.derived_scores.mews ?? 0) >= 4
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                MEWS Score: <strong>{result.derived_scores.mews}</strong>
                {(result.derived_scores.mews ?? 0) >= 4 ? ' (High Risk)' : ' (Stable)'}
              </span>
            )}
            {result.derived_scores.map !== null && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700">
                MAP: <strong>{result.derived_scores.map?.toFixed(1)} mmHg</strong>
              </span>
            )}
          </div>
        )}
      </GlassCard>

      {/* Pipeline Progress Stream */}
      {(isRunning || result) && (
        <GlassCard className="!p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Execution Stream</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              LangGraph StateGraph
            </span>
          </div>
          <PipelineVisualizer
            isRunning={isRunning}
            currentStage={currentStage}
            completedStages={completedStages}
            hasOverride={Boolean(result?.safety_overrides?.length)}
          />
        </GlassCard>
      )}

      {/* Triage Result Presentation */}
      {result && (
        <GlassCard variant="elevated" className="!p-6 space-y-5">
          {/* Result Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                AI Clinical Triage Determination
              </span>
              <div className="flex items-center gap-3">
                <ESIBadge esi={result.final_esi} size="lg" pulse />
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border ${
                    result.action_type === 'DECIDE'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : result.action_type === 'ESCALATE'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {result.action_type === 'DECIDE'
                    ? '⚡ Autonomous Red-Flag Escalation'
                    : result.action_type === 'ESCALATE'
                    ? '⬆ Senior Clinician Review'
                    : '✓ Verified Recommendation'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <ConfidenceGauge value={result.final_confidence} />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Target Department</span>
                <p className="text-xl font-black text-purple-900 mt-0.5">{result.routing}</p>
              </div>
            </div>
          </div>

          {/* ── Expected vs Predicted Accuracy Comparison ── */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <Gauge className="w-4 h-4 text-purple-700" />
              Prediction Accuracy — Expected vs Predicted ESI
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Expected ESI */}
              <div className="text-center p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Ground Truth (Expected)</span>
                <span className="text-3xl font-black text-slate-900">ESI-{patient.expected_esi || 3}</span>
              </div>

              {/* Arrow + Match status */}
              <div className="text-center flex flex-col items-center gap-1">
                {result.final_esi === (patient.expected_esi || 3) ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ Exact Match
                    </span>
                  </>
                ) : Math.abs(result.final_esi - (patient.expected_esi || 3)) === 1 ? (
                  <>
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      ±1 Level ({result.final_esi < (patient.expected_esi || 3) ? 'Safe Over-Triage' : 'Under-Triage'})
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                    <span className="text-xs font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                      ⚠ {Math.abs(result.final_esi - (patient.expected_esi || 3))}-Level Deviation
                    </span>
                  </>
                )}
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Δ = {result.final_esi - (patient.expected_esi || 3) > 0 ? '+' : ''}{result.final_esi - (patient.expected_esi || 3)}
                </span>
              </div>

              {/* Predicted ESI */}
              <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block mb-1">AI Predicted</span>
                <span className="text-3xl font-black text-purple-800">ESI-{result.final_esi}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
              <span>Confidence: <strong className="text-slate-700">{(result.final_confidence * 100).toFixed(1)}%</strong></span>
              <span className="text-slate-200">|</span>
              <span>Safety Overrides: <strong className="text-slate-700">{result.safety_overrides?.length || 0}</strong></span>
              <span className="text-slate-200">|</span>
              <span>Action: <strong className="text-slate-700">{result.action_type}</strong></span>
            </div>
          </div>

          {/* Safety Overrides Warning */}
          {result.safety_overrides?.length > 0 && (
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 space-y-2 pulse-esi-1">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-black">
                <ShieldAlert className="w-4 h-4" />
                Hard Safety Override Triggered ({result.safety_overrides.length} Rule{result.safety_overrides.length > 1 ? 's' : ''})
              </div>
              {result.safety_overrides.map((rule, idx) => (
                <p key={idx} className="text-xs text-rose-900 font-medium pl-6">
                  <span className="font-mono font-bold text-rose-700">[{rule.rule_id}]</span>{' '}
                  <strong className="font-bold">{rule.rule_name}:</strong> {rule.triggered_by} ➔ Action: {rule.action}
                </p>
              ))}
            </div>
          )}

          {/* Feature Importance Attribution (SHAP) */}
          {shapEntries.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-purple-700" />
                  Key Clinical Features Driving Decision (SHAP Attribution)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Model Feature Weights</span>
              </div>
              <div className="space-y-1.5">
                {shapEntries.map(([feature, weight]) => {
                  const maxAbs = Math.max(...shapEntries.map(([, w]) => Math.abs(w))) || 1;
                  const pct = Math.min((Math.abs(weight) / maxAbs) * 100, 100);
                  const isPositive = weight >= 0;
                  return (
                    <div key={feature} className="flex items-center gap-3 text-xs">
                      <span className="w-24 font-mono font-bold text-slate-600 truncate uppercase">{feature}</span>
                      <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className={`h-full rounded-full ${isPositive ? 'bg-purple-600' : 'bg-indigo-500'}`}
                        />
                      </div>
                      <span className="w-14 text-right font-mono font-bold text-slate-700 text-[11px]">
                        {weight > 0 ? `+${weight.toFixed(2)}` : weight.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RAG Rationale */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              Evidence-Based Clinical Rationale (ESI Handbook v4)
            </span>
            <div className="mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed">
              {result.rag_rationale}
            </div>
          </div>

          {/* Recommendations Checklist */}
          {result.recommendations?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.recommendations.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Actions & Routing */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsOverrideOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Manual Clinical Override
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTriage}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-Triage
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmRoute}
                disabled={isConfirming || Boolean(routedSuccess)}
                className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  routedSuccess
                    ? 'bg-emerald-600'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                {isConfirming
                  ? 'Routing to Bay...'
                  : routedSuccess
                  ? `✓ Routed to ${routedSuccess}`
                  : 'Confirm & Route Patient'}
              </motion.button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Override Modal */}
      <AnimatePresence>
        {isOverrideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200"
            >
              <h3 className="text-lg font-black text-slate-900">Manual Clinical Override</h3>
              <p className="text-xs text-slate-500">Record a doctor-authorized acuity level change with clinical justification into the governance audit trail.</p>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select New ESI Level</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setOverrideEsi(lvl)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        overrideEsi === lvl
                          ? 'bg-purple-700 border-purple-700 text-white shadow-purple-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ESI-{lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Clinical Justification</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State physician rationale for acuity change..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsOverrideOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOverrideSubmit}
                  disabled={overrideSubmitted || !overrideReason.trim()}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-purple-sm disabled:opacity-50 cursor-pointer"
                >
                  {overrideSubmitted ? '✓ Logged to Audit' : 'Confirm Override'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
