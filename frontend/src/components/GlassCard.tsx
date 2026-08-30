'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  hoverEffect?: boolean;
  glowColor?: string;
  onClick?: () => void;
  delay?: number;
}

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  glowColor,
  onClick,
  delay = 0,
  ...props
}: GlassCardProps) {
  const variants = {
    default: 'bg-white border border-slate-200/80 rounded-2xl shadow-card',
    elevated: 'bg-white border border-slate-200 rounded-3xl shadow-card',
    subtle: 'bg-slate-50/80 border border-slate-200/60 rounded-2xl shadow-xs',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hoverEffect || onClick
          ? { y: -2 }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`${variants[variant]} ${hoverEffect || onClick ? 'cursor-pointer transition-all duration-300 hover:shadow-card-hover' : ''} p-5 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
