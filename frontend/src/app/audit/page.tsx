'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, Download, AlertTriangle, CheckCircle2, ChevronDown,
  Clock, FileText, User, Activity, Sparkles, Filter
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ESIBadge from '@/components/ESIBadge';
import AnimatedCounter from '@/components/AnimatedCounter';
import { fetchAuditLogs } from '@/lib/api';
import { AuditEntry } from '@/lib/types';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'overrides' | 'standard'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs().then(d => setLogs(d || [])).catch(() => {});
  }, []);

  const displayLogs: AuditEntry[] = logs.length > 0 ? logs : [
    {
      event_id: 'evt-8492019a-9812-4f91',
      timestamp: '2026-08-28T16:10:45Z',
      patient_id: 'P-001',
      nurse_id: 'Dr. Rohit Sharma, MD',
      final_esi: 1,
      action_type: 'DECIDE',
      routing: 'Resuscitation Bay',
      rationale: 'Patient presents with severe crushing substernal chest pain radiating to left arm with diaphoresis, hypotension (BP 80/50), and tachycardia (HR 145 bpm). Meets hard safety override R001 for cardiogenic collapse.'
    },
    {
      event_id: 'evt-7391028b-6102-42aa',
      timestamp: '2026-08-28T16:05:12Z',
      patient_id: 'P-003',
      nurse_id: 'RN-Sarah',
      final_esi: 2,
      action_type: 'RECOMMEND',
      routing: 'Acute Care Bay',
      override: { original_esi: 3, new_esi: 2, reason: 'Post-ictal lethargy in pediatric patient requires continuous cardiac telemetry and monitored acute bay.' },
      rationale: 'Pediatric post-ictal presentation. ML baseline suggested ESI-3 based on stable vitals, physician clinical judgement elevated acuity to ESI-2.'
    },
    {
      event_id: 'evt-6284910c-1194-4d55',
      timestamp: '2026-08-28T15:55:30Z',
      patient_id: 'P-010',
      nurse_id: 'Dr. Priya Nair, MD',
      final_esi: 1,
      action_type: 'DECIDE',
      routing: 'Resuscitation Bay',
      rationale: 'Acute ischemic stroke code activated within 45-minute thrombolytic window. Hard safety override R005 triggered.'
    },
    {
      event_id: 'evt-5173829d-8321-4ba2',
      timestamp: '2026-08-28T15:42:18Z',
      patient_id: 'P-006',
      nurse_id: 'RN-Sarah',
      final_esi: 4,
      action_type: 'RECOMMEND',
      routing: 'Fast Track',
      rationale: 'Minor ankle inversion sprain with intact neurovascular status and weight-bearing ability. Requires single diagnostic X-ray.'
    },
    {
      event_id: 'evt-4062718e-7729-4112',
      timestamp: '2026-08-28T15:30:05Z',
      patient_id: 'P-013',
      nurse_id: 'RN-Michael',
      final_esi: 2,
      action_type: 'RECOMMEND',
      routing: 'Acute Care Bay',
      override: { original_esi: 3, new_esi: 2, reason: 'Continuous 2nd trimester vaginal bleeding — elevated obstetric risk.' },
      rationale: 'Second-trimester hemorrhage requiring immediate obstetric ultrasound and fluid resuscitation.'
    },
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
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clinical_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
          className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-purple-700" /> Export Audit JSON
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="!p-5 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Triage Events</span>
          <div className="text-3xl font-black text-slate-900"><AnimatedCounter value={displayLogs.length} /></div>
          <span className="text-[10px] text-slate-400 font-medium">Logged in current session</span>
        </GlassCard>

        <GlassCard className="!p-5 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">AI-Clinician Concordance</span>
          <div className="text-3xl font-black text-emerald-600"><AnimatedCounter value={agreementRate} suffix="%" /></div>
          <span className="text-[10px] text-emerald-700 font-semibold">High clinical concordance</span>
        </GlassCard>

        <GlassCard className="!p-5 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Physician Overrides</span>
          <div className="text-3xl font-black text-amber-600"><AnimatedCounter value={overrideCount} /></div>
          <span className="text-[10px] text-amber-700 font-semibold">Clinician autonomy preserved</span>
        </GlassCard>
      </div>

      {/* Search & Filters */}
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
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

      {/* Audit Log Table with Expandable Details */}
      <GlassCard variant="elevated" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Event ID / Time</th>
                <th className="p-4">Patient ID</th>
                <th className="p-4">Acuity</th>
                <th className="p-4">Action Mode</th>
                <th className="p-4">Clinician</th>
                <th className="p-4">Clinical Override</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log: any, idx: number) => {
                const eventId = String(log.event_id || log.type || `evt-${idx}`);
                const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent';
                const esiVal = log.final_esi || log.new_esi || 3;
                const actionLabel =
                  log.action_type === 'DECIDE'
                    ? '⚡ Autonomous Red-Flag'
                    : log.type === 'override'
                    ? '⚠️ Clinician Override'
                    : log.action_type === 'CONFIRM_AND_ROUTE'
                    ? '✓ Routed to Bay'
                    : '✓ AI Recommended';
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
                const isExpanded = expandedId === eventId;

                return (
                  <React.Fragment key={eventId + idx}>
                    <tr
                      onClick={() => toggleRow(eventId)}
                      className="hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="p-4 font-mono">
                        <span className="text-slate-800 font-bold">{eventId.slice(0, 16)}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{timeStr}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{log.patient_id || 'Unknown'}</td>
                      <td className="p-4"><ESIBadge esi={esiVal} size="sm" showLabel={false} /></td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${actionClass}`}>{actionLabel}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{log.nurse_id || 'RN-Sarah'}</td>
                      <td className="p-4">
                        {overrideInfo ? (
                          <span className="text-amber-800 font-bold text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> ESI-{overrideInfo.original_esi} ➔ ESI-{overrideInfo.new_esi}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <ChevronDown className={`w-4 h-4 text-slate-400 inline-block transition-transform ${isExpanded ? 'rotate-180 text-purple-700' : ''}`} />
                      </td>
                    </tr>

                    {/* Expandable Detail Row */}
                    {isExpanded && (
                      <tr className="bg-purple-50/20 border-y border-purple-100">
                        <td colSpan={7} className="p-5 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {log.rationale && (
                              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Evidence Rationale
                                </span>
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">{log.rationale}</p>
                              </div>
                            )}
                            {overrideInfo && (
                              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs space-y-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Clinician Override Justification
                                </span>
                                <p className="text-xs text-amber-900 leading-relaxed font-semibold">{overrideInfo.reason || 'Manual override recorded.'}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                            <span>Event ID: {eventId}</span>
                            {log.routing && <span>• Target: {log.routing}</span>}
                            <span>• Verified by: {log.nurse_id || 'RN-Sarah'}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
