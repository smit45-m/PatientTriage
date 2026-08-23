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
    default: 'glass',
    elevated: 'glass-lg shadow-glass',
    subtle: 'glass-sm',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={
        hoverEffect || onClick
          ? { y: -3, boxShadow: glowColor || '0 8px 32px rgba(161,0,255,0.2)' }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`${variants[variant]} ${hoverEffect || onClick ? 'cursor-pointer transition-all duration-300' : ''} p-5 ${className}`}
      style={glowColor ? { boxShadow: `0 4px 20px ${glowColor}` } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
