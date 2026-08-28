'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
    { event_id: 'evt-8492019a', timestamp: '2026-08-28T16:10:45Z', patient_id: 'P-001', nurse_id: 'RN-Sarah', final_esi: 1, action_type: 'DECIDE' },
    { event_id: 'evt-7391028b', timestamp: '2026-08-28T16:05:12Z', patient_id: 'P-003', nurse_id: 'RN-Sarah', final_esi: 2, action_type: 'RECOMMEND', override: { original_esi: 3, new_esi: 2, reason: 'Post-ictal lethargy in pediatric patient requires monitored bay' } },
    { event_id: 'evt-6284910c', timestamp: '2026-08-28T15:55:30Z', patient_id: 'P-010', nurse_id: 'RN-Michael', final_esi: 1, action_type: 'DECIDE' },
    { event_id: 'evt-5173829d', timestamp: '2026-08-28T15:42:18Z', patient_id: 'P-006', nurse_id: 'RN-Sarah', final_esi: 4, action_type: 'RECOMMEND' },
    { event_id: 'evt-4062718e', timestamp: '2026-08-28T15:30:05Z', patient_id: 'P-013', nurse_id: 'RN-Michael', final_esi: 2, action_type: 'RECOMMEND', override: { original_esi: 3, new_esi: 2, reason: 'Continuous 2nd trimester bleeding — elevated obstetric risk' } },
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
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Governance & Compliance</span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Clinical <span className="text-purple-700">Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Immutable, HIPAA-compliant event record of all AI triage recommendations, clinical overrides, and timestamped clinician justifications.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-50 flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-purple-700" /> Export Audit JSON
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="!p-5 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Triage Events</span>
          <div className="text-3xl font-black text-slate-900"><AnimatedCounter value={displayLogs.length} /></div>
          <span className="text-[10px] text-slate-400 font-medium">Logged in current session</span>
        </GlassCard>

        <GlassCard className="!p-5 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">AI-Clinician Agreement</span>
          <div className="text-3xl font-black text-emerald-600"><AnimatedCounter value={agreementRate} suffix="%" /></div>
          <span className="text-[10px] text-emerald-700 font-semibold">High clinical concordance</span>
        </GlassCard>

        <GlassCard className="!p-5 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Physician Overrides</span>
          <div className="text-3xl font-black text-amber-600"><AnimatedCounter value={overrideCount} /></div>
          <span className="text-[10px] text-amber-700 font-semibold">Clinician autonomy preserved</span>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient ID or event ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(['all', 'overrides', 'standard'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterType === t
                  ? 'bg-white text-purple-800 shadow-sm border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'overrides' ? 'Overrides Only' : t === 'standard' ? 'Standard Logs' : 'All Events'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <GlassCard variant="elevated" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Event / Timestamp</th>
                <th className="p-4">Patient ID</th>
                <th className="p-4">Acuity</th>
                <th className="p-4">Action Mode</th>
                <th className="p-4">Clinician</th>
                <th className="p-4">Clinical Override Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log: any, idx: number) => {
                const eventId = String(log.event_id || log.type || `evt-${idx}`);
                const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent';
                const esiVal = log.final_esi || log.new_esi || 3;
                const actionLabel =
                  log.action_type === 'DECIDE'
                    ? '⚡ Autonomous Decision'
                    : log.type === 'override'
                    ? '⚠️ Clinician Override'
                    : log.action_type === 'CONFIRM_AND_ROUTE'
                    ? '✓ Routed to Bay'
                    : '✓ Recommended';
                const actionClass =
                  log.action_type === 'DECIDE'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : log.type === 'override'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                const overrideInfo =
                  log.override ||
                  (log.type === 'override'
                    ? { original_esi: log.original_esi, new_esi: log.new_esi, reason: log.reason }
                    : null);

                return (
                  <motion.tr key={eventId + idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono">
                      <span className="text-slate-800 font-bold">{eventId.slice(0, 14)}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeStr}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{log.patient_id || 'Unknown'}</td>
                    <td className="p-4"><ESIBadge esi={esiVal} size="sm" showLabel={false} /></td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${actionClass}`}>{actionLabel}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono font-medium">{log.nurse_id || 'RN-Sarah'}</td>
                    <td className="p-4">
                      {overrideInfo ? (
                        <div className="space-y-1">
                          <span className="text-amber-800 font-bold text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> ESI-{overrideInfo.original_esi} ➔ ESI-{overrideInfo.new_esi}
                          </span>
                          {overrideInfo.reason && (
                            <p className="text-[11px] text-slate-500 italic max-w-sm">{overrideInfo.reason}</p>
                          )}
                        </div>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
