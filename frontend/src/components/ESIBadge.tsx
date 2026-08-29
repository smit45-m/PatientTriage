'use client';
import { motion } from 'framer-motion';
import { ESI_COLORS, ESI_LABELS } from '@/lib/constants';

interface ESIBadgeProps {
  esi?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

const ESI_LIGHT_STYLES: Record<number, { bg: string; text: string; border: string; dot: string }> = {
  1: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-600' },
  2: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-600' },
  3: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-600' },
  4: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  5: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-600' },
};

export default function ESIBadge({
  esi = 3,
  size = 'md',
  showLabel = true,
  pulse = false,
  className = '',
}: ESIBadgeProps) {
  const styles = ESI_LIGHT_STYLES[esi] || ESI_LIGHT_STYLES[3];
  const label = ESI_LABELS[esi] || `Level ${esi}`;

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[10px] gap-1.5 font-bold',
    md: 'px-3 py-1 text-xs gap-2 font-bold',
    lg: 'px-4 py-1.5 text-sm gap-2.5 font-extrabold',
  }[size];

  return (
    <motion.span
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${sizeStyles} ${className} shadow-xs`}
    >
      <span
        className={`w-2 h-2 rounded-full ${styles.dot} ${pulse ? 'animate-ping' : ''}`}
      />
      <span>ESI-{esi}</span>
      {showLabel && (
        <span className="font-medium text-slate-500 border-l border-slate-300/80 pl-2 ml-0.5">
          {label}
        </span>
      )}
    </motion.span>
  );
}
