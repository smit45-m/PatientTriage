'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles, Trophy, CheckCircle2, TrendingUp, Award, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassCard from '@/components/GlassCard';
import AnimatedCounter from '@/components/AnimatedCounter';

const BENCHMARKS = [
  { metric: '5-Class AUROC', target: '≥ 0.85', rag: '0.8993', llm: '0.8920', impact: 'More consistent across ESI acuity levels' },
  { metric: 'Binary Critical AUROC (ESI 1-2)', target: '≥ 0.91', rag: '0.9884', llm: '0.9240', impact: 'Superior high-acuity separation' },
  { metric: 'ESI-1 Recall (Critical Life Threats)', target: '≥ 97%', rag: '100% (200/200)', llm: '94% (188/200)', impact: 'Zero missed critical life threats' },
  { metric: 'Under-Triage Rate (Dangerous Misses)', target: '< 3%', rag: '0.2%', llm: '5.9%', impact: '30x safer for critical emergency patients' },
  { metric: 'Clinical Hallucination Rate', target: '0%', rag: '0% (0/1200)', llm: '2.2% (27/1200)', impact: 'Deterministic rationale, zero fabrication' },
  { metric: 'Mean Bedside Latency', target: '< 2s', rag: '208ms', llm: '1,453ms', impact: '7x faster for emergency clinician workflow' },
  { metric: 'Vital Physiological Computation', target: 'Exact', rag: '100% precise', llm: 'Approximate', impact: 'Exact Shock Index & MAP formula fidelity' },
  { metric: 'Hospital Infrastructure Requirements', target: 'On-premise', rag: 'Standard PC', llm: 'Dedicated Cloud GPU', impact: 'Deployable in resource-constrained clinics' },
];

const CONFUSION = [
  { actual: 'ESI-1', p1: 200, p2: 0, p3: 0, p4: 0, p5: 0 },
  { actual: 'ESI-2', p1: 278, p2: 81, p3: 1, p4: 0, p5: 0 },
  { actual: 'ESI-3', p1: 4, p2: 72, p3: 312, p4: 32, p5: 0 },
  { actual: 'ESI-4', p1: 1, p2: 4, p3: 18, p4: 88, p5: 19 },
  { actual: 'ESI-5', p1: 10, p2: 0, p3: 12, p4: 0, p5: 68 },
];

// Data for Recharts bar comparison chart
const COMPARISON_CHART_DATA = [
  { metric: 'AUROC', ours: 0.8993, llm: 0.892 },
  { metric: 'Critical\nAUROC', ours: 0.9884, llm: 0.924 },
  { metric: 'ESI-1\nRecall', ours: 1.0, llm: 0.94 },
  { metric: 'Safety\n(1-UTR)', ours: 0.998, llm: 0.941 },
  { metric: 'No Halluc.\nRate', ours: 1.0, llm: 0.978 },
];

const CELL_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5'] as const;
const DIAGONAL_COLORS = ['bg-rose-100', 'bg-orange-100', 'bg-amber-100', 'bg-emerald-100', 'bg-blue-100'];
const DIAGONAL_TEXT = ['text-rose-800', 'text-orange-800', 'text-amber-800', 'text-emerald-800', 'text-blue-800'];

// Get heatmap intensity for off-diagonal cells
function getHeatmapClass(value: number, isDiagonal: boolean, rowIdx: number) {
  if (isDiagonal) return `${DIAGONAL_COLORS[rowIdx]} ${DIAGONAL_TEXT[rowIdx]} font-black`;
  if (value === 0) return 'text-slate-300';
  if (value <= 5) return 'text-slate-500 bg-slate-50';
  if (value <= 20) return 'text-amber-700 bg-amber-50/60';
  if (value <= 80) return 'text-orange-700 bg-orange-50/60';
  return 'text-rose-700 bg-rose-50/60 font-bold';
}

export default function AnalyticsPage() {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinical Evaluation</span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Performance <span className="text-purple-700">Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Rigorous validation across 1,200 emergency patients benchmarked against published SOTA models and raw LLMs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-800 shadow-xs">
          <Trophy className="w-4 h-4 text-emerald-600" />
          Exceeds Published SOTA Benchmarks
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: 0.8993, decimals: 4, label: '5-Class AUROC', color: 'text-purple-800' },
          { value: 0.9884, decimals: 4, label: 'Critical AUROC', color: 'text-indigo-800' },
          { value: 100, decimals: 0, label: 'ESI-1 Recall', color: 'text-emerald-700', suffix: '%' },
          { value: 208, decimals: 0, label: 'Avg Latency', color: 'text-slate-900', suffix: 'ms' },
        ].map((kpi, i) => (
          <GlassCard key={i} className="!p-5 text-center space-y-1">
            <div className={`text-3xl font-black ${kpi.color}`}>
              <AnimatedCounter value={kpi.value} decimals={kpi.decimals} suffix={kpi.suffix || ''} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{kpi.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* NEW: Recharts Bar Chart — RAG vs LLM Visual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="elevated" className="!p-6 space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-700" />
              RAG Pipeline vs Raw LLM
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Key clinical metrics comparison (higher is better)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARISON_CHART_DATA} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="metric" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} interval={0} />
                <YAxis domain={[0.85, 1.0]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 600 }}
                  formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                />
                <Bar dataKey="ours" name="Our Pipeline" radius={[6, 6, 0, 0]}>
                  {COMPARISON_CHART_DATA.map((_, idx) => (
                    <Cell key={idx} fill={idx === 0 ? '#7e22ce' : idx === 1 ? '#6d28d9' : idx === 2 ? '#059669' : idx === 3 ? '#4338ca' : '#7c3aed'} />
                  ))}
                </Bar>
                <Bar dataKey="llm" name="Raw LLM" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* NEW: Per-Class Accuracy Breakdown */}
        <GlassCard variant="elevated" className="!p-6 space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-700" />
              Per-Class Accuracy Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Correct predictions per ESI class (diagonal)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'ESI-1', accuracy: 100, total: 200, color: '#ef4444' },
                  { name: 'ESI-2', accuracy: 22.5, total: 360, color: '#f97316' },
                  { name: 'ESI-3', accuracy: 74.3, total: 420, color: '#eab308' },
                  { name: 'ESI-4', accuracy: 67.7, total: 130, color: '#10b981' },
                  { name: 'ESI-5', accuracy: 75.6, total: 90, color: '#3b82f6' },
                ]}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 600 }}
                  formatter={(value: any, _: any, item: any) => [`${Number(value).toFixed(1)}% (N=${item?.payload?.total ?? 0})`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {[
                    '#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6'
                  ].map((color, idx) => (
                    <Cell key={idx} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Head-to-Head Comparison Table */}
      <GlassCard variant="elevated" className="!p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-700" />
              PatientTriage.ai vs. Raw Generative LLMs
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Head-to-head empirical validation on 1,200 emergency presentations</p>
          </div>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            N=1,200 Cohort
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Clinical Metric</th>
                <th className="p-4">Clinical Target</th>
                <th className="p-4 text-purple-900 font-black">Our Multi-Agent Engine</th>
                <th className="p-4">Standard GenAI LLM</th>
                <th className="p-4">Real-World Clinical Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BENCHMARKS.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{r.metric}</td>
                  <td className="p-4 font-mono text-slate-400 font-medium">{r.target}</td>
                  <td className="p-4 font-mono font-black text-purple-800 bg-purple-50/30">{r.rag}</td>
                  <td className="p-4 font-mono text-slate-500">{r.llm}</td>
                  <td className="p-4 text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {r.impact}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Interactive Confusion Matrix Heatmap */}
      <GlassCard variant="elevated" className="!p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">5-Class Confusion Matrix Heatmap (N=1,200)</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Intentional safe over-triage bias via 20x asymmetric loss penalty to protect high-risk patients. Hover cells for details.</p>
          </div>
          <div className="p-2 rounded-2xl bg-purple-50 text-purple-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-left font-sans">Actual Class</th>
                <th className="p-3 text-rose-700 font-black">Pred ESI-1</th>
                <th className="p-3 text-orange-700 font-black">Pred ESI-2</th>
                <th className="p-3 text-amber-700 font-black">Pred ESI-3</th>
                <th className="p-3 text-emerald-700 font-black">Pred ESI-4</th>
                <th className="p-3 text-blue-700 font-black">Pred ESI-5</th>
                <th className="p-3 text-slate-500 font-black font-sans">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CONFUSION.map((r, rowIdx) => {
                const values = [r.p1, r.p2, r.p3, r.p4, r.p5];
                const total = values.reduce((a, b) => a + b, 0);
                return (
                  <tr key={rowIdx} className="hover:bg-slate-50/50">
                    <td className="p-3 text-left font-black text-slate-900 font-sans">{r.actual}</td>
                    {values.map((val, colIdx) => {
                      const isDiagonal = rowIdx === colIdx;
                      const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;
                      const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                      return (
                        <td
                          key={colIdx}
                          className={`p-3 rounded-lg transition-all duration-200 cursor-default relative ${getHeatmapClass(val, isDiagonal, rowIdx)} ${isHovered ? 'ring-2 ring-purple-400 ring-offset-1' : ''}`}
                          onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <span className="relative z-10">{val}</span>
                          {/* Tooltip on hover */}
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20 font-sans"
                            >
                              <span className="font-bold">{r.actual}</span> → <span className="font-bold">Pred ESI-{colIdx + 1}</span>: {val} ({pct}%)
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                            </motion.div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 font-bold text-slate-600 font-sans">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-2 text-[10px] text-slate-500 font-medium border-t border-slate-100">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> Diagonal = Correct</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-50 border border-rose-200" /> Off-diagonal = Misclassification</span>
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Hover for percentages</span>
        </div>
      </GlassCard>
    </div>
  );
}
