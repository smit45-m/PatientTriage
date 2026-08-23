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
      glow: 'rgba(34,197,94,0.15)',
      border: 'border-green-500/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      valueColor: 'text-green-400',
    },
    warning: {
      glow: 'rgba(234,179,8,0.15)',
      border: 'border-yellow-500/20',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      valueColor: 'text-yellow-400',
    },
    critical: {
      glow: 'rgba(239,68,68,0.2)',
      border: 'border-red-500/30',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      valueColor: 'text-red-400',
    },
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-sm p-3 border ${statusConfig.border}`}
      style={{ boxShadow: `0 0 20px ${statusConfig.glow}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{name}</span>
        <div className={`p-1.5 rounded-lg ${statusConfig.iconBg}`}>
          <Icon className={`w-3 h-3 ${statusConfig.iconColor}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        {value === null || value === undefined ? (
          <span className="text-lg font-bold text-gray-500">N/A</span>
        ) : typeof value === 'number' ? (
          <AnimatedCounter
            value={value}
            decimals={value % 1 !== 0 ? 1 : 0}
            className={`text-xl font-black ${statusConfig.valueColor}`}
          />
        ) : (
          <span className={`text-xl font-black ${statusConfig.valueColor}`}>{value}</span>
        )}
        <span className="text-[10px] text-gray-600">{unit}</span>
      </div>

      {status === 'critical' && (
        <div className="mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-red-400 font-medium">Alert</span>
        </div>
      )}
    </motion.div>
  );
}
