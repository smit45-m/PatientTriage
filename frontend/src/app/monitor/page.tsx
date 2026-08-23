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
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">
            <span className="gradient-text">Waiting Room</span>{' '}
            <span className="text-white">Monitor</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time patient queue with ESI-stratified wait-time thresholds</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleToggleSurge}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            surge.is_surge
              ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-esi-1'
              : 'glass text-gray-300 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          {surge.is_surge ? '⚠ Surge Mode Active' : 'Simulate Surge Mode'}
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="!p-4" glowColor="rgba(161,0,255,0.08)">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">Queue Size</span>
            <Users className="w-4 h-4 text-accent-400" />
          </div>
          <div className="text-3xl font-black text-white"><AnimatedCounter value={displayQueue.length} /></div>
        </GlassCard>
        <GlassCard className="!p-4" glowColor="rgba(239,68,68,0.08)">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">High Acuity (ESI 1-2)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400"><AnimatedCounter value={displayQueue.filter(p => p.esi_level <= 2).length} /></div>
        </GlassCard>
        <GlassCard className="!p-4" glowColor="rgba(234,179,8,0.08)">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">Threshold Breaches</span>
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-black text-yellow-400"><AnimatedCounter value={displayQueue.filter(p => p.wait_minutes > p.threshold_minutes).length} /></div>
        </GlassCard>
        <GlassCard className="!p-4" glowColor="rgba(6,182,212,0.08)">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">Avg Wait Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400"><AnimatedCounter value={Math.round(displayQueue.reduce((a, p) => a + p.wait_minutes, 0) / (displayQueue.length || 1))} suffix="m" /></div>
        </GlassCard>
      </div>

      {/* Patient Queue */}
      <GlassCard variant="elevated" className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white">Active Queue</h3>
          <span className="text-[9px] text-gray-600 font-mono">Thresholds per ESI v4 guidelines</span>
        </div>

        {displayQueue.map((patient, i) => {
          const breached = patient.wait_minutes > patient.threshold_minutes;
          const pct = Math.min((patient.wait_minutes / patient.threshold_minutes) * 100, 100);

          return (
            <motion.div
              key={patient.patient_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                breached
                  ? 'bg-red-500/5 border-red-500/20 shadow-esi-1'
                  : 'glass-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <ESIBadge esi={patient.esi_level} size="sm" showLabel={false} pulse={breached} />
                  <span className="text-sm font-bold text-white">{patient.name}</span>
                  <span className="text-[10px] font-mono text-gray-600">{patient.patient_id}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className={`font-bold ${breached ? 'text-red-400' : 'text-gray-400'}`}>
                    {patient.wait_minutes}m
                  </span>
                  <span className="text-gray-700">/</span>
                  <span className="text-gray-500">{patient.threshold_minutes}m limit</span>
                  {breached && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[9px] font-black animate-pulse">
                      BREACHED
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    breached ? 'bg-gradient-to-r from-red-500 to-red-400' : pct > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-gradient-to-r from-green-500 to-emerald-400'
                  }`}
                  style={{ boxShadow: breached ? '0 0 10px rgba(239,68,68,0.4)' : 'none' }}
                />
              </div>
            </motion.div>
          );
        })}
      </GlassCard>
    </div>
  );
}
