'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Wind, Thermometer, Droplets, Gauge,
  Zap, ShieldAlert, CheckCircle2, AlertTriangle,
  RotateCcw, UserCheck, Stethoscope, Sparkles
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
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
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
        original_esi: result?.final_esi || patient.expected_esi,
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
        routing: result.routing,
        nurse_id: 'RN-Sarah',
      });
      setRoutedSuccess(result.routing);
      setTimeout(() => {
        setRoutedSuccess(null);
      }, 3500);
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

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Patient Header */}
      <GlassCard variant="elevated">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white">{patient.name}</h2>
              <span className="px-2 py-0.5 glass-sm text-[10px] font-mono text-gray-400">
                {patient.age}y / {patient.sex}
              </span>
              <span className="px-2 py-0.5 glass-sm text-[10px] font-mono text-gray-400">
                {patient.patient_id}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Arrival: <strong className="text-gray-300 capitalize">{patient.arrival_mode}</strong>
              <span className="mx-2 text-gray-700">•</span>
              Prior Records: <strong className={patient.has_prior_records ? 'text-green-400' : 'text-yellow-400'}>
                {patient.has_prior_records ? 'Available' : 'First Visit'}
              </strong>
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRunTriage}
            disabled={isRunning}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 text-white font-bold text-sm shadow-glow disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            <Zap className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Pipeline...' : 'Run AI Triage'}
          </motion.button>
        </div>

        {/* Chief Complaint */}
        <div className="mt-4 p-3 glass-sm flex items-start gap-3">
          <Stethoscope className="w-4 h-4 text-accent-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">Chief Complaint</span>
            <p className="text-sm text-white mt-0.5">{patient.chief_complaint}</p>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
          <VitalCard icon={Heart} name="HR" value={patient.vitals.hr} unit="bpm" status={getVitalStatus('hr', patient.vitals.hr)} />
          <VitalCard icon={Activity} name="BP" value={`${patient.vitals.sbp}/${patient.vitals.dbp}`} unit="mmHg" status={getVitalStatus('sbp', patient.vitals.sbp)} />
          <VitalCard icon={Droplets} name="SpO2" value={patient.vitals.spo2} unit="%" status={getVitalStatus('spo2', patient.vitals.spo2)} />
          <VitalCard icon={Wind} name="RR" value={patient.vitals.rr} unit="/min" status={getVitalStatus('rr', patient.vitals.rr)} />
          <VitalCard icon={Thermometer} name="Temp" value={patient.vitals.temp} unit="°C" status={getVitalStatus('temp', patient.vitals.temp)} />
          <VitalCard icon={Gauge} name="Pain" value={patient.vitals.pain} unit="/10" status={getVitalStatus('pain', patient.vitals.pain || 0)} />
        </div>
      </GlassCard>

      {/* Pipeline Progress */}
      {(isRunning || result) && (
        <GlassCard className="!p-3">
          <PipelineVisualizer
            isRunning={isRunning}
            currentStage={currentStage}
            completedStages={completedStages}
            hasOverride={Boolean(result?.safety_overrides?.length)}
          />
        </GlassCard>
      )}

      {/* Triage Result */}
      {result && (
        <GlassCard variant="elevated" className="space-y-5">
          {/* Result Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                AI Triage Assessment
              </span>
              <div className="flex items-center gap-3">
                <ESIBadge esi={result.final_esi} size="lg" pulse />
                <span
                  className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wide border ${
                    result.action_type === 'DECIDE'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : result.action_type === 'ESCALATE'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}
                >
                  {result.action_type === 'DECIDE'
                    ? '⚡ Autonomous Escalation'
                    : result.action_type === 'ESCALATE'
                    ? '⬆ Senior Review'
                    : '✓ Recommendation'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <ConfidenceGauge value={result.final_confidence} />
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Routing</span>
                <p className="text-lg font-black gradient-text">{result.routing}</p>
              </div>
            </div>
          </div>

          {/* Safety Overrides */}
          {result.safety_overrides?.length > 0 && (
            <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
              <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                <ShieldAlert className="w-4 h-4" />
                Safety Override ({result.safety_overrides.length} rule{result.safety_overrides.length > 1 ? 's' : ''} triggered)
              </div>
              {result.safety_overrides.map((rule, idx) => (
                <p key={idx} className="text-[11px] text-red-300/80 pl-6">
                  <span className="font-mono text-red-400">[{rule.rule_id}]</span>{' '}
                  {rule.rule_name}: {rule.triggered_by}
                </p>
              ))}
            </div>
          )}

          {/* RAG Rationale */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              AI Clinical Rationale
            </span>
            <div className="mt-2 p-4 glass-sm text-sm text-gray-300 leading-relaxed">
              {result.rag_rationale}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.recommendations.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 glass-sm text-[11px] text-gray-300">
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => setIsOverrideOpen(true)}
              className="px-4 py-2 glass-sm hover:bg-yellow-500/10 text-yellow-400 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Clinical Override
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTriage}
                className="px-4 py-2 glass-sm text-gray-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-Triage
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmRoute}
                disabled={isConfirming || Boolean(routedSuccess)}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all ${
                  routedSuccess
                    ? 'bg-emerald-600 shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                {isConfirming
                  ? 'Routing...'
                  : routedSuccess
                  ? `✓ Routed to ${routedSuccess}`
                  : 'Confirm & Route'}
              </motion.button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Override Modal */}
      <AnimatePresence>
        {isOverrideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-lg p-6 max-w-md w-full space-y-4 shadow-glow-lg"
            >
              <h3 className="text-lg font-bold gradient-text">Clinical Override</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">New ESI Level</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setOverrideEsi(lvl)}
                      className={`p-2.5 glass-sm text-xs font-bold transition-all ${
                        overrideEsi === lvl
                          ? 'bg-accent-500/15 border-accent-500/40 text-accent-300 shadow-glass'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ESI-{lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Clinical Justification</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State clinical rationale..."
                  className="w-full p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent-500/40 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOverrideOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOverrideSubmit}
                  disabled={overrideSubmitted || !overrideReason.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 text-white text-xs font-bold shadow-glow disabled:opacity-50"
                >
                  {overrideSubmitted ? '✓ Submitted' : 'Submit Override'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
