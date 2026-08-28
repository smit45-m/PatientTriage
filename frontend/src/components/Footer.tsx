'use client';
import Link from 'next/link';
import {
  Stethoscope, Shield, HeartPulse, Cpu, Activity, Github,
  Award, CheckCircle2, Globe, ExternalLink, Sparkles
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0F19] text-slate-300 border-t border-slate-800/80 relative z-20 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 lg:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center shadow-purple-sm text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white">
                  Patient<span className="text-purple-400">Triage</span>
                  <span className="text-indigo-400 font-semibold text-xs ml-1 px-1.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/60">
                    .ai
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Clinical Decision Support Engine
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              Structuring complex emergency data into a clean, intuitive triage journey. Powered by a 5-stage LangGraph multi-agent architecture with 18 deterministic red-flag safety overrides and 100% critical ESI-1 recall.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-700/50 text-[11px] font-bold text-purple-300">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Accenture Innovation Challenge 2026
              </span>
            </div>
          </div>

          {/* Col 1: Platform Modules (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/triage" className="text-slate-400 hover:text-purple-300 transition-colors">
                  AI Triage Cockpit
                </Link>
              </li>
              <li>
                <Link href="/pipeline" className="text-slate-400 hover:text-purple-300 transition-colors">
                  LangGraph Agent Graph
                </Link>
              </li>
              <li>
                <Link href="/monitor" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Waiting Room Monitor
                </Link>
              </li>
              <li>
                <Link href="/audit" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Governance Audit Trail
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Clinical Benchmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Clinical Standards (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Clinical Protocols
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li className="hover:text-purple-300 transition-colors cursor-default">
                ESI Handbook v4
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                AHA Resuscitation
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                Surviving Sepsis
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                MEWS Scoring Engine
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                Shock Index Telemetry
              </li>
            </ul>
          </div>

          {/* Col 3: Safety & Governance (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Safety Architecture
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li className="hover:text-purple-300 transition-colors cursor-default">
                18 Red-Flag Rules
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                20x Asymmetric Penalty
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                100% ESI-1 Sensitivity
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                Physician Override Log
              </li>
              <li className="hover:text-purple-300 transition-colors cursor-default">
                Zero Missed Life Threats
              </li>
            </ul>
          </div>

          {/* Col 4: Project & Cohort (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Project & Validation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a
                  href="https://github.com/smit45-m/PatientTriage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub Repository
                </a>
              </li>
              <li className="text-slate-400 hover:text-purple-300 transition-colors cursor-default">
                1,200 Patient Cohort
              </li>
              <li className="text-slate-400 hover:text-purple-300 transition-colors cursor-default">
                Problem Statement 2
              </li>
              <li className="text-slate-400 hover:text-purple-300 transition-colors cursor-default">
                FastAPI + Next.js 14
              </li>
              <li className="text-slate-400 hover:text-purple-300 transition-colors cursor-default">
                AIIMS / Apollo Rules
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar — Copyright & Legal Links */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">
              © 2026 <strong className="text-slate-200">PatientTriage.ai</strong> — Accenture Innovation Challenge 2026. All clinical decision rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1 text-slate-400 hover:text-slate-200 cursor-pointer">
              <Globe className="w-3.5 h-3.5" /> English (IN / US)
            </span>
            <span className="hover:text-slate-200 cursor-pointer">HIPAA Compliance</span>
            <span className="hover:text-slate-200 cursor-pointer">Clinical Governance</span>
            <span className="hover:text-slate-200 cursor-pointer">Data Privacy</span>
            <span className="hover:text-slate-200 cursor-pointer">Emergency Terms</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
