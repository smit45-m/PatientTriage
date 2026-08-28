'use client';
import { motion } from 'framer-motion';
import {
  ClipboardList, Brain, ShieldAlert, BookOpen, MonitorCheck,
  Check, Loader2
} from 'lucide-react';

const PIPELINE_NODES = [
  { step: '01', id: 'intake', name: 'Intake & Scoring', icon: ClipboardList, desc: 'Vitals & MEWS/Shock Index', color: '#6d28d9' },
  { step: '02', id: 'ml_nlp', name: 'ML/NLP Fusion', icon: Brain, desc: 'Dual-stream AI scoring', color: '#7c3aed' },
  { step: '03', id: 'safety', name: 'Safety Engine', icon: ShieldAlert, desc: '18 hard-coded rules', color: '#dc2626' },
  { step: '04', id: 'rag', name: 'RAG Explainer', icon: BookOpen, desc: 'Clinical rationale', color: '#4f46e5' },
  { step: '05', id: 'cockpit', name: 'Decision Cockpit', icon: MonitorCheck, desc: 'Department routing', color: '#059669' },
];

interface PipelineVisualizerProps {
  isRunning: boolean;
  currentStage: number;
  completedStages: number[];
  hasOverride?: boolean;
}

export default function PipelineVisualizer({
  isRunning,
  currentStage,
  completedStages,
}: PipelineVisualizerProps) {
  return (
    <div className="w-full py-3">
      {/* Behance-Style Step Timeline */}
      <div className="grid grid-cols-5 gap-2.5">
        {PIPELINE_NODES.map((node, index) => {
          const isCurrent = isRunning && currentStage === index;
          const isComplete = completedStages.includes(index);
          const Icon = node.icon;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`relative flex flex-col p-3 rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? 'bg-purple-50/90 border-purple-300 shadow-purple-sm ring-2 ring-purple-500/20'
                  : isComplete
                  ? 'bg-white border-emerald-200/90 shadow-card'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-60'
              }`}
            >
              {/* Header Step & Status */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isCurrent
                    ? 'bg-purple-700 text-white'
                    : isComplete
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {node.step}
                </span>

                <div className="w-6 h-6 rounded-full flex items-center justify-center">
                  {isCurrent ? (
                    <Loader2 className="w-4 h-4 text-purple-700 animate-spin" />
                  ) : isComplete ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                    </div>
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </div>

              <p className={`text-xs font-black truncate leading-tight ${
                isCurrent ? 'text-purple-950' : isComplete ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {node.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{node.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
