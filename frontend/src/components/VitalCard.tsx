'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface VitalCardProps {
  icon: LucideIcon;
  name: string;
  value: number | string | null;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  thresholdText?: string;
}

export default function VitalCard({
  icon: Icon,
  name,
  value,
  unit,
  status,
  thresholdText,
}: VitalCardProps) {
  const statusConfig = {
    normal: {
      bg: 'bg-white',
      border: 'border-slate-200/80 border-l-[3px] border-l-emerald-500',
      iconBg: 'bg-emerald-50 border border-emerald-200/60',
      iconColor: 'text-emerald-700',
      valueColor: 'text-slate-900',
      tagBg: 'bg-emerald-50 text-emerald-700',
      label: 'Normal',
    },
    warning: {
      bg: 'bg-amber-50/40',
      border: 'border-amber-200 border-l-[3px] border-l-amber-500',
      iconBg: 'bg-amber-100/70 border border-amber-300/60',
      iconColor: 'text-amber-800',
      valueColor: 'text-amber-950',
      tagBg: 'bg-amber-100 text-amber-800',
      label: 'Elevated',
    },
    critical: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-300 border-l-[3px] border-l-rose-500',
      iconBg: 'bg-rose-100 border border-rose-300/80',
      iconColor: 'text-rose-700',
      valueColor: 'text-rose-950',
      tagBg: 'bg-rose-100 text-rose-800 font-bold',
      label: 'Critical Alert',
    },
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-4 border ${statusConfig.bg} ${statusConfig.border} shadow-card transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{name}</span>
        <div className={`p-2 rounded-xl ${statusConfig.iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        {value === null || value === undefined ? (
          <span className="text-2xl font-black text-slate-400">N/A</span>
        ) : typeof value === 'number' ? (
          <AnimatedCounter
            value={value}
            decimals={value % 1 !== 0 ? 1 : 0}
            className={`text-2xl font-black ${statusConfig.valueColor} tracking-tight`}
          />
        ) : (
          <span className={`text-2xl font-black ${statusConfig.valueColor} tracking-tight`}>{value}</span>
        )}
        <span className="text-xs font-semibold text-slate-500">{unit}</span>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusConfig.tagBg}`}>
          {statusConfig.label}
        </span>
        {thresholdText && (
          <span className="text-[10px] text-slate-400 font-medium">{thresholdText}</span>
        )}
      </div>
    </motion.div>
  );
}
