'use client';
import { motion } from 'framer-motion';

export default function ConfidenceGauge({ value }: { value: number }) {
  const percentage = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  const isHigh = percentage >= 80;
  const isMed = percentage >= 60 && percentage < 80;
  const strokeColor = isHigh ? '#7c3aed' : isMed ? '#f59e0b' : '#ef4444';
  const textColor = isHigh ? 'text-purple-900' : isMed ? 'text-amber-700' : 'text-rose-600';
  const label = isHigh ? 'High Confidence' : isMed ? 'Moderate' : 'Low Confidence';

  const radius = 38;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="relative w-36 h-28 flex flex-col items-center justify-end bg-slate-50/80 rounded-2xl p-2 border border-slate-200/70">
      <svg className="w-full h-full" viewBox="0 0 100 55">
        {/* Background arc */}
        <path
          d="M 12 50 A 38 38 0 0 1 88 50"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Animated fill arc */}
        <motion.path
          d="M 12 50 A 38 38 0 0 1 88 50"
          fill="none"
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${strokeColor}4D)` }}
        />
      </svg>

      <div className="absolute bottom-2 flex flex-col items-center">
        <span className={`text-2xl font-black ${textColor} tracking-tight leading-none`}>
          {percentage}%
        </span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}
