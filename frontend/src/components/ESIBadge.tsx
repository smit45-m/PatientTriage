'use client';
import { motion } from 'framer-motion';
import { ESI_COLORS, ESI_LABELS, ESI_BG_COLORS } from '@/lib/constants';

interface ESIBadgeProps {
  esi: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

export default function ESIBadge({
  esi,
  size = 'md',
  showLabel = true,
  pulse = false,
  className = '',
}: ESIBadgeProps) {
  const color = ESI_COLORS[esi] || '#3b82f6';
  const label = ESI_LABELS[esi] || `Level ${esi}`;
  const bgColor = ESI_BG_COLORS[esi] || 'rgba(59,130,246,0.15)';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
    lg: 'px-4 py-1.5 text-sm gap-2.5',
  }[size];

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full font-bold tracking-wide ${sizeStyles} ${className}`}
      style={{
        backgroundColor: bgColor,
        color: color,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 12px ${color}20`,
      }}
    >
      <span
        className={`w-2 h-2 rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
      />
      ESI-{esi}
      {showLabel && (
        <span className="text-gray-400 font-normal border-l border-white/10 pl-2 ml-0.5">
          {label}
        </span>
      )}
    </motion.span>
  );
}
