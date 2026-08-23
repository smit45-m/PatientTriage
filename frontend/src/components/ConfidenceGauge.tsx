'use client';
import { motion } from 'framer-motion';

export default function ConfidenceGauge({ value }: { value: number }) {
  const percentage = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  const isHigh = percentage >= 80;
  const isMed = percentage >= 60 && percentage < 80;
  const strokeColor = isHigh ? '#22c55e' : isMed ? '#eab308' : '#ef4444';
  const glowColor = isHigh ? 'rgba(34,197,94,0.3)' : isMed ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.3)';
  const label = isHigh ? 'High' : isMed ? 'Moderate' : 'Low';

  const radius = 40;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="relative w-32 h-24 flex flex-col items-center justify-end">
      <svg className="w-full h-full" viewBox="0 0 100 55">
        <defs>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Animated fill arc */}
        <motion.path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#gauge-glow)"
        />
      </svg>

      <div className="absolute bottom-1 flex flex-col items-center">
        <span
          className="text-2xl font-black"
          style={{ color: strokeColor, textShadow: `0 0 20px ${glowColor}` }}
        >
          {percentage}%
        </span>
        <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
          {label} Confidence
        </span>
      </div>
    </div>
  );
}
