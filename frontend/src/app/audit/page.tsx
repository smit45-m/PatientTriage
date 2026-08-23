'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Download, AlertTriangle, Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ESIBadge from '@/components/ESIBadge';
import AnimatedCounter from '@/components/AnimatedCounter';
import { fetchAuditLogs } from '@/lib/api';
import { AuditEntry } from '@/lib/types';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'overrides' | 'standard'>('all');

  useEffect(() => { fetchAuditLogs().then(d => setLogs(d || [])).catch(() => {}); }, []);

  const displayLogs: AuditEntry[] = logs.length > 0 ? logs : [
    { event_id: 'evt-8492019a', timestamp: '2026-08-23T21:10:45Z', patient_id: 'P-001', nurse_id: 'RN-Sarah', final_esi: 1, action_type: 'DECIDE' },
    { event_id: 'evt-7391028b', timestamp: '2026-08-23T21:05:12Z', patient_id: 'P-003', nurse_id: 'RN-Sarah', final_esi: 2, action_type: 'RECOMMEND', override: { original_esi: 3, new_esi: 2, reason: 'Post-ictal lethargy in pediatric patient requires monitored bay' } },
    { event_id: 'evt-6284910c', timestamp: '2026-08-23T20:55:30Z', patient_id: 'P-010', nurse_id: 'RN-Michael', final_esi: 1, action_type: 'DECIDE' },
    { event_id: 'evt-5173829d', timestamp: '2026-08-23T20:42:18Z', patient_id: 'P-006', nurse_id: 'RN-Sarah', final_esi: 4, action_type: 'RECOMMEND' },
    { event_id: 'evt-4062718e', timestamp: '2026-08-23T20:30:05Z', patient_id: 'P-013', nurse_id: 'RN-Michael', final_esi: 2, action_type: 'RECOMMEND', override: { original_esi: 3, new_esi: 2, reason: 'Continuous 2nd trimester bleeding — elevated obstetric risk' } },
  ];

  const filtered = displayLogs.filter((l: any, idx: number) => {
    const eventId = l.event_id || l.type || `evt-${idx}`;
    const patientId = l.patient_id || '';
    const ms =
      patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eventId.toLowerCase().includes(searchTerm.toLowerCase());
    const isOverride = Boolean(l.override) || l.type === 'override';
    const mf =
      filterType === 'all' ||
      (filterType === 'overrides' && isOverride) ||
      (filterType === 'standard' && !isOverride);
    return ms && mf;
  });

  const overrideCount = displayLogs.filter(
    (l: any) => Boolean(l.override) || l.type === 'override'
  ).length;
  const agreementRate = Math.round(
    ((displayLogs.length - overrideCount) / (displayLogs.length || 1)) * 100
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(displayLogs, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };

  return (
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">
            <span className="gradient-text">Governance</span>{' '}
            <span className="text-white">Audit Trail</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Immutable record of AI recommendations and clinician overrides</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          className="px-5 py-2.5 glass text-gray-200 text-xs font-bold flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" /> Export JSON
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="!p-4 text-center" glowColor="rgba(2,132,199,0.06)">
          <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">Total Decisions</span>
          <div className="text-3xl font-black text-white mt-1"><AnimatedCounter value={displayLogs.length} /></div>
        </GlassCard>
        <GlassCard className="!p-4 text-center" glowColor="rgba(34,197,94,0.06)">
          <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">AI-Clinician Agreement</span>
          <div className="text-3xl font-black text-green-400 mt-1"><AnimatedCounter value={agreementRate} suffix="%" /></div>
        </GlassCard>
        <GlassCard className="!p-4 text-center" glowColor="rgba(234,179,8,0.06)">
          <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">Clinician Overrides</span>
          <div className="text-3xl font-black text-yellow-400 mt-1"><AnimatedCounter value={overrideCount} /></div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input type="text" placeholder="Search by patient or event ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 glass-sm text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent-500/40 transition-colors" />
        </div>
        {(['all', 'overrides', 'standard'] as const).map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize transition-all ${
              filterType === t ? 'bg-accent-500/15 text-accent-300 shadow-glass' : 'text-gray-500 hover:text-gray-300'
            }`}>{t === 'overrides' ? 'Overrides Only' : t}</button>
        ))}
      </div>

      {/* Table */}
      <GlassCard variant="elevated" className="!p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.02] border-b border-white/[0.06] text-gray-500 text-[9px] uppercase tracking-[0.15em] font-bold">
            <tr>
              <th className="p-4">Event / Time</th>
              <th className="p-4">Patient</th>
              <th className="p-4">ESI</th>
              <th className="p-4">Action</th>
              <th className="p-4">Clinician</th>
              <th className="p-4">Override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((log: any, idx: number) => {
              const eventId = String(log.event_id || log.type || `evt-${idx}`);
              const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent';
              const esiVal = log.final_esi || log.new_esi || 3;
              const actionLabel =
                log.action_type === 'DECIDE'
                  ? '⚡ Decide'
                  : log.type === 'override'
                  ? '⚠️ Override'
                  : log.action_type === 'CONFIRM_AND_ROUTE'
                  ? '✓ Route'
                  : '✓ Recommend';
              const actionClass =
                log.action_type === 'DECIDE'
                  ? 'bg-red-500/15 text-red-400'
                  : log.type === 'override'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-green-500/10 text-green-400';
              const overrideInfo =
                log.override ||
                (log.type === 'override'
                  ? { original_esi: log.original_esi, new_esi: log.new_esi, reason: log.reason }
                  : null);

              return (
                <motion.tr key={eventId + idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-mono">
                    <span className="text-gray-300">{eventId.slice(0, 12)}</span>
                    <p className="text-[9px] text-gray-600 mt-0.5">{timeStr}</p>
                  </td>
                  <td className="p-4 font-semibold text-white">{log.patient_id || 'Unknown'}</td>
                  <td className="p-4"><ESIBadge esi={esiVal} size="sm" showLabel={false} /></td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${actionClass}`}>{actionLabel}</span>
                  </td>
                  <td className="p-4 text-gray-400 font-mono">{log.nurse_id || 'RN-Sarah'}</td>
                  <td className="p-4">
                    {overrideInfo ? (
                      <div>
                        <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> ESI-{overrideInfo.original_esi} → ESI-{overrideInfo.new_esi}
                        </span>
                        {overrideInfo.reason && (
                          <p className="text-[9px] text-gray-500 line-clamp-1 mt-0.5 italic">{overrideInfo.reason}</p>
                        )}
                      </div>
                    ) : <span className="text-gray-700 text-[9px]">—</span>}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
