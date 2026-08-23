'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity, Cpu, Monitor, Shield, BarChart3, ArrowRight,
  Heart, Users, Clock, CheckCircle2, ChevronRight, Zap, Sparkles
} from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import GlassCard from '@/components/GlassCard';

export default function DashboardHome() {
  return (
    <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full space-y-12">
      {/* Hero */}
      <section className="text-center space-y-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 glass-sm text-[10px] font-bold text-accent-300 tracking-widest uppercase"
        >
          <Sparkles className="w-3 h-3" />
          Accenture Innovation Challenge 2026 — Problem Statement 2
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]"
        >
          <span className="gradient-text">AI-Powered</span>{' '}
          <span className="text-white">Emergency</span>
          <br />
          <span className="text-white">Triage System</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          A LangGraph multi-agent pipeline combining clinical scoring, ML/NLP fusion,
          18-rule safety governance, RAG-based clinical rationale, and intelligent routing
          for emergency department triage decisions.
        </motion.p>

        {/* KPI Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4"
        >
          {[
            { value: 93.2, suffix: '%', label: '5-Class AUROC', color: 'text-accent-400' },
            { value: 100, suffix: '%', label: 'ESI-1 Recall', color: 'text-green-400' },
            { value: 208, suffix: 'ms', label: 'Avg Latency', color: 'text-cyan-400' },
            { value: 1200, suffix: '+', label: 'Patients Validated', color: 'text-gray-200' },
          ].map((stat, i) => (
            <GlassCard key={i} delay={0.3 + i * 0.05} className="text-center !p-4">
              <div className={`text-3xl font-black ${stat.color}`}>
                <AnimatedCounter value={stat.value} decimals={stat.value % 1 !== 0 ? 1 : 0} suffix={stat.suffix} />
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-1 font-bold">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-4 pt-2"
        >
          <Link href="/triage">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 text-white font-bold text-sm shadow-glow flex items-center gap-2"
            >
              Open Triage Workspace <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
          <Link href="/pipeline">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="px-6 py-3 glass text-gray-200 font-semibold text-sm flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-accent-400" /> View Pipeline
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Module Cards */}
      <section className="space-y-5">
        <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Platform Core Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              href: '/triage', icon: Activity, color: 'text-accent-400', glow: 'rgba(161,0,255,0.1)',
              title: 'AI Triage Cockpit',
              desc: 'Patient intake, vital sign analysis, and ML-assisted severity classification with real-time clinician override capability.',
            },
            {
              href: '/pipeline', icon: Cpu, color: 'text-violet-400', glow: 'rgba(139,92,246,0.1)',
              title: 'LangGraph Agent Inspector',
              desc: 'Interactive 5-agent pipeline visualization with input/output specifications, compiled StateGraph architecture, and code inspection.',
            },
            {
              href: '/monitor', icon: Monitor, color: 'text-green-400', glow: 'rgba(34,197,94,0.1)',
              title: 'Waiting Room Monitor',
              desc: 'Real-time patient queue tracking with ESI-stratified wait-time thresholds, deterioration alerts, and mass casualty surge mode.',
            },
            {
              href: '/audit', icon: Shield, color: 'text-red-400', glow: 'rgba(239,68,68,0.1)',
              title: 'Governance & Audit',
              desc: 'Immutable audit trail of all AI recommendations and clinician overrides with JSON export for regulatory compliance.',
            },
            {
              href: '/analytics', icon: BarChart3, color: 'text-cyan-400', glow: 'rgba(6,182,212,0.1)',
              title: 'Performance Analytics',
              desc: 'Head-to-head RAG vs LLM benchmarks, 5-class confusion matrix, and clinical impact analysis across 1,200 patients.',
            },
            {
              href: '/triage', icon: Heart, color: 'text-pink-400', glow: 'rgba(236,72,153,0.1)',
              title: 'Safety Architecture',
              desc: '18 hard-coded clinical safety rules with asymmetric loss (20x under-triage penalty) and confidence-based action governance.',
            },
          ].map((item, i) => (
            <Link key={item.title} href={item.href} className="block group">
              <GlassCard hoverEffect delay={i * 0.06} glowColor={item.glow} className="h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                  <h3 className="text-sm font-bold text-white group-hover:text-accent-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-4 flex items-center text-[10px] text-accent-400 font-bold uppercase tracking-widest">
                  Open Module <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
