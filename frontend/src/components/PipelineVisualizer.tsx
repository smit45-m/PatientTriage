'use client';
import { motion } from 'framer-motion';
import {
  ClipboardList, Brain, ShieldAlert, BookOpen, MonitorCheck,
  Check, Loader2, ArrowRight
} from 'lucide-react';

const PIPELINE_NODES = [
  { id: 'intake', name: 'Intake & Scoring', icon: ClipboardList, desc: 'Vital sign validation & derived scores', color: '#3b82f6' },
  { id: 'ml_nlp', name: 'ML/NLP Fusion', icon: Brain, desc: 'Dual-stream prediction fusion', color: '#a855f7' },
  { id: 'safety', name: 'Safety Engine', icon: ShieldAlert, desc: '18 hard-coded safety rules', color: '#ef4444' },
  { id: 'rag', name: 'RAG Explainer', icon: BookOpen, desc: 'Evidence-based rationale', color: '#06b6d4' },
  { id: 'cockpit', name: 'Decision Cockpit', icon: MonitorCheck, desc: 'Routing & audit logging', color: '#22c55e' },
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
    <div className="flex items-center gap-1 w-full py-2">
      {PIPELINE_NODES.map((node, index) => {
        const isCurrent = isRunning && currentStage === index;
        const isComplete = completedStages.includes(index);
        const Icon = node.icon;

        return (
          <div key={node.id} className="flex items-center flex-1 gap-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border flex-1 transition-all duration-300 ${
                isCurrent
                  ? 'bg-accent-500/10 border-accent-500/40 shadow-glass'
                  : isComplete
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'glass-sm opacity-50'
              }`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: (isCurrent || isComplete) ? `${node.color}15` : 'rgba(255,255,255,0.03)',
                  boxShadow: isCurrent ? `0 0 15px ${node.color}30` : 'none',
                }}
              >
                {isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: node.color }} />
                ) : isComplete ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-bold truncate ${isCurrent ? 'text-accent-300' : isComplete ? 'text-green-400' : 'text-gray-500'}`}>
                  {node.name}
                </p>
                <p className="text-[9px] text-gray-600 truncate">{node.desc}</p>
              </div>
            </motion.div>

            {index < PIPELINE_NODES.length - 1 && (
              <ArrowRight className={`w-3 h-3 shrink-0 ${isComplete ? 'text-green-500/50' : 'text-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
