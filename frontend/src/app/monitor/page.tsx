'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Clock, AlertTriangle, Users, Flame, ShieldAlert, TrendingUp, AlertCircle, HeartPulse } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ESIBadge from '@/components/ESIBadge';
import AnimatedCounter from '@/components/AnimatedCounter';
import { fetchWaitingRoom, fetchAlerts, fetchSurgeStatus, toggleSurge } from '@/lib/api';
import { WaitingPatient, SurgeStatus } from '@/lib/types';

export default function MonitorPage() {
  const [queue, setQueue] = useState<WaitingPatient[]>([]);
  const [surge, setSurge] = useState<SurgeStatus>({ is_surge: false, current_rate_per_hour: 12, baseline_rate: 15, threshold: 45 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [wr, sg] = await Promise.all([fetchWaitingRoom(), fetchSurgeStatus()]);
      setQueue(wr.queue || []);
      setSurge(sg);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); const i = setInterval(loadData, 5000); return () => clearInterval(i); }, []);

  const handleToggleSurge = async () => {
    try { await toggleSurge(); await loadData(); } catch (e) { console.error(e); }
  };

  const displayQueue: WaitingPatient[] = queue.length > 0 ? queue : [
    { patient_id: 'P-003', name: 'Alice Johnson', esi_level: 2, arrival_time: '10 mins ago', wait_minutes: 12, threshold_minutes: 10 },
    { patient_id: 'P-005', name: 'David Lee', esi_level: 2, arrival_time: '6 mins ago', wait_minutes: 6, threshold_minutes: 10 },
    { patient_id: 'P-002', name: 'Bob Smith', esi_level: 3, arrival_time: '24 mins ago', wait_minutes: 24, threshold_minutes: 30 },
    { patient_id: 'P-011', name: 'James Wilson', esi_level: 3, arrival_time: '18 mins ago', wait_minutes: 18, threshold_minutes: 30 },
    { patient_id: 'P-006', name: 'Emma Davis', esi_level: 4, arrival_time: '35 mins ago', wait_minutes: 35, threshold_minutes: 60 },
    { patient_id: 'P-009', name: 'Olivia Martin', esi_level: 5, arrival_time: '42 mins ago', wait_minutes: 42, threshold_minutes: 120 },
  ];

  const breachedPatients = displayQueue.filter(p => (p.wait_minutes ?? 0) > (p.threshold_minutes ?? 999));
  const hasBreach = breachedPatients.length > 0;

  return (
    <div className={`flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-8 ${surge.is_surge ? 'surge-active-bg' : ''}`}>
      {/* Deterioration Alert Banner */}
      <AnimatePresence>
        {hasBreach && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-rose-50 to-orange-50 p-4 flex items-center gap-4 shadow-sm pulse-esi-1"
          >
            <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-rose-800">⚠ Deterioration Alert — {breachedPatients.length} Patient{breachedPatients.length > 1 ? 's' : ''} Exceeding Safe Wait Time</h4>
              <p className="text-xs text-rose-600 font-medium mt-0.5">
                {breachedPatients.map(p => `${p.name} (ESI-${p.esi_level}: ${p.wait_minutes}m / ${p.threshold_minutes}m)`).join(' • ')}
              </p>
            </div>
            <div className="shrink-0">
              <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Emergency Department Oversight</span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Waiting Room <span className="text-purple-700">Monitor</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time patient queue with dynamic ESI wait-time threshold tracking and automated deterioration alerts.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleSurge}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
            surge.is_surge
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 pulse-esi-1'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Flame className={`w-4 h-4 ${surge.is_surge ? 'text-white animate-pulse' : 'text-amber-500'}`} />
          {surge.is_surge ? '⚠ Mass Surge Protocol Active' : 'Simulate Mass Casualty Surge'}
        </motion.button>
      </div>

      {/* Surge Active Banner */}
      <AnimatePresence>
        {surge.is_surge && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-rose-600 via-rose-700 to-orange-600 p-5 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Flame className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black">🚨 MASS CASUALTY SURGE — PROTOCOL ACTIVE</h3>
                  <p className="text-xs text-rose-100 font-medium mt-0.5">
                    All ESI wait thresholds compressed. Priority re-triage of ESI-3/4 patients recommended. Surge rate: {surge.current_rate_per_hour}/hr (baseline: {surge.baseline_rate}/hr)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{Math.round((surge.current_rate_per_hour / surge.baseline_rate) * 100)}%</div>
                <div className="text-[10px] text-rose-200 font-bold uppercase">Capacity Load</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="!p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Waiting</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900"><AnimatedCounter value={displayQueue.length} /></div>
          <span className="text-[10px] text-slate-400 font-medium">Patients enqueued</span>
        </GlassCard>

        <GlassCard className="!p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">High Acuity (ESI 1-2)</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">
            <AnimatedCounter value={displayQueue.filter(p => p.esi_level <= 2).length} />
          </div>
          <span className="text-[10px] text-rose-500 font-bold">Immediate attention required</span>
        </GlassCard>

        <GlassCard className="!p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Threshold Breaches</span>
            <div className={`p-2 rounded-xl ${hasBreach ? 'bg-rose-50 text-rose-600 pulse-esi-1' : 'bg-amber-50 text-amber-600'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-black ${hasBreach ? 'text-rose-600' : 'text-amber-600'}`}>
            <AnimatedCounter value={breachedPatients.length} />
          </div>
          <span className={`text-[10px] font-semibold ${hasBreach ? 'text-rose-600' : 'text-amber-700'}`}>
            {hasBreach ? '⚠ Patients at risk!' : 'All within safe limits'}
          </span>
        </GlassCard>

        <GlassCard className="!p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Avg Wait Time</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-900">
            <AnimatedCounter value={Math.round(displayQueue.reduce((a, p) => a + (p.wait_minutes ?? 0), 0) / (displayQueue.length || 1))} suffix="m" />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Department throughput</span>
        </GlassCard>
      </div>

      {/* Patient Queue */}
      <GlassCard variant="elevated" className="!p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900">Live Waiting Queue</h3>
          <span className="text-[10px] text-slate-400 font-medium">Wait thresholds grounded in ESI Handbook v4 guidelines</span>
        </div>

        <div className="space-y-2.5">
          {displayQueue.map((patient, i) => {
            const waitMins = patient.wait_minutes ?? 0;
            const threshMins = patient.threshold_minutes ?? 120;
            const breached = waitMins > threshMins;
            const pct = Math.min((waitMins / threshMins) * 100, 100);
            const barClass = breached ? 'wait-bar-danger' : pct > 70 ? 'wait-bar-warning' : 'wait-bar-safe';

            return (
              <motion.div
                key={patient.patient_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-4 rounded-2xl border transition-all ${
                  breached
                    ? 'bg-rose-50/70 border-rose-300 shadow-sm pulse-esi-1'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ESIBadge esi={patient.esi_level} size="sm" showLabel={false} pulse={breached} />
                    <span className="text-sm font-bold text-slate-900">{patient.name}</span>
                    <span className="text-xs font-mono text-slate-400">{patient.patient_id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className={`font-mono font-bold ${breached ? 'text-rose-700 font-black' : 'text-slate-700'}`}>
                      {waitMins} min
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 font-mono">{threshMins}m target</span>
                    {breached && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                        Wait Breached
                      </span>
                    )}
                  </div>
                </div>

                {/* Animated progress bar with gradient color transitions */}
                <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barClass} transition-colors duration-500`}
                  />
                </div>

                {/* Time breakdown labels */}
                <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-medium">
                  <span>0m</span>
                  <span className={`font-bold ${pct > 70 ? (breached ? 'text-rose-500' : 'text-amber-500') : 'text-emerald-500'}`}>
                    {Math.round(pct)}% of threshold
                  </span>
                  <span>{threshMins}m</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
