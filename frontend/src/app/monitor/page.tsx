'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Clock, AlertTriangle, Users, Flame, ShieldAlert, TrendingUp } from 'lucide-react';
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

  return (
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
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
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Flame className={`w-4 h-4 ${surge.is_surge ? 'text-white' : 'text-amber-500'}`} />
          {surge.is_surge ? '⚠ Mass Surge Protocol Active' : 'Simulate Mass Casualty Surge'}
        </motion.button>
      </div>

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
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">
            <AnimatedCounter value={displayQueue.filter(p => p.wait_minutes > p.threshold_minutes).length} />
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">Exceeded safe wait limit</span>
        </GlassCard>

        <GlassCard className="!p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Avg Wait Time</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-900">
            <AnimatedCounter value={Math.round(displayQueue.reduce((a, p) => a + p.wait_minutes, 0) / (displayQueue.length || 1))} suffix="m" />
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
            const breached = patient.wait_minutes > patient.threshold_minutes;
            const pct = Math.min((patient.wait_minutes / patient.threshold_minutes) * 100, 100);

            return (
              <motion.div
                key={patient.patient_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-4 rounded-2xl border transition-all ${
                  breached
                    ? 'bg-rose-50/70 border-rose-300 shadow-sm'
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
                      {patient.wait_minutes} min
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 font-mono">{patient.threshold_minutes}m target</span>
                    {breached && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                        Wait Breached
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      breached
                        ? 'bg-rose-600'
                        : pct > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
