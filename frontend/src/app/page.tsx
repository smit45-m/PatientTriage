'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Activity, Cpu, Monitor, Shield, BarChart3, ArrowRight,
  Sparkles, CheckCircle2, ChevronRight, Stethoscope, Clock, Zap, HeartPulse,
  UserCheck, Award, Star
} from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import GlassCard from '@/components/GlassCard';

const DOCTORS = [
  {
    name: 'Dr. Rohit Sharma, MD',
    role: 'Lead Emergency Physician',
    hospital: 'Metro Trauma Center',
    specialty: 'Resuscitation & Critical Care',
    image: '/doctors/dr_rohit_sharma.jpg',
    badge: 'Senior Attending',
  },
  {
    name: 'Dr. Priya Nair, MD, FACS',
    role: 'Chief of Emergency Medicine',
    hospital: 'Apollo Medical Institute',
    specialty: 'Clinical Governance & ESI Triage',
    image: '/doctors/dr_priya_nair.jpg',
    badge: 'Clinical Lead',
  },
  {
    name: 'Dr. Ananya Patel, MD',
    role: 'Emergency AI Fellow',
    hospital: 'All India Institute of Medical Sciences',
    specialty: 'Multimodal Clinical Decision Support',
    image: '/doctors/dr_ananya_patel.jpg',
    badge: 'AI Research',
  },
  {
    name: 'Dr. Marcus Vance, DO',
    role: 'Trauma Surgery Director',
    hospital: 'Valley Trauma Hospital',
    specialty: 'Mass Casualty & Hemorrhage Protocol',
    image: '/doctors/dr_marcus_vance.jpg',
    badge: 'Trauma Specialist',
  },
];

export default function DashboardHome() {
  return (
    <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full space-y-16">
      {/* ── Section 1: Behance Main Business Objective ────────────────── */}
      <section className="space-y-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Title & Heading */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Main Clinical Objective
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black text-slate-900 leading-[1.15] tracking-tight">
              Structuring complex <br />
              <span className="text-purple-700">Emergency data</span> into a clean, <br />
              intuitive triage journey.
            </h1>
          </div>

          {/* Right Supporting Description */}
          <div className="lg:col-span-5 lg:pt-8">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              To achieve critical hospital throughput goals, we focused on optimizing the clinical intake structure, eliminating diagnostic clutter, and building a 5-stage safety funnel that guides emergency clinicians from intake to department routing with 100% ESI-1 sensitivity.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link href="/triage">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white font-bold text-xs shadow-purple-sm hover:shadow-purple-md flex items-center gap-2 cursor-pointer"
                >
                  Open Triage Cockpit <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link href="/pipeline">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-purple-700" /> Inspect 5-Agent Graph
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Objective Pillar Cards (01, 02, 03) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Card 01 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card flex flex-col items-center text-center space-y-4 hover:shadow-card-hover hover:border-purple-200 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-600">
              01
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">Cleaned</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                the intake stream of transcription noise, missing fields, and clinical vital sign ambiguity.
              </p>
            </div>
          </motion.div>

          {/* Card 02 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card flex flex-col items-center text-center space-y-4 hover:shadow-card-hover hover:border-purple-200 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-600">
              02
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">Restructured</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                complex multimodal patient data into clear, physiological risk blocks with MEWS & Shock Index.
              </p>
            </div>
          </motion.div>

          {/* Card 03 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card flex flex-col items-center text-center space-y-4 hover:shadow-card-hover hover:border-purple-200 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-600">
              03
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">Created</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                a streamlined 5-stage AI decision funnel for sub-second ESI validation & automated department routing.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: Behance Timeline / Stages of Work ───────────────── */}
      <section className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/80 shadow-card space-y-8">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Stages of AI Architecture
          </span>
          <h2 className="text-3xl font-black text-slate-900">
            Triage <span className="text-purple-700">Timeline</span>
          </h2>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 overflow-x-auto">
          {/* Start Circle */}
          <div className="flex flex-col items-center space-y-2 shrink-0">
            <div className="w-20 h-20 rounded-full bg-purple-900 text-white flex items-center justify-center font-black text-sm shadow-purple-md ring-4 ring-purple-100">
              Start
            </div>
            <span className="text-[11px] font-bold text-slate-600">Patient Intake</span>
          </div>

          {/* Stage 01 */}
          <div className="flex flex-col items-center space-y-2 shrink-0 max-w-[130px] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-300 bg-purple-50/50 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-purple-800">01</span>
            </div>
            <span className="text-xs font-bold text-slate-900">Intake & Scoring</span>
            <span className="text-[10px] text-slate-400">MEWS, Shock Index</span>
          </div>

          {/* Connector */}
          <div className="hidden lg:block w-8 h-[2px] bg-slate-200 border-t border-dashed border-slate-300" />

          {/* Stage 02 */}
          <div className="flex flex-col items-center space-y-2 shrink-0 max-w-[130px] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-300 bg-purple-50/50 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-purple-800">02</span>
            </div>
            <span className="text-xs font-bold text-slate-900">ML & NLP Fusion</span>
            <span className="text-[10px] text-slate-400">Dual-Stream AI</span>
          </div>

          {/* Connector */}
          <div className="hidden lg:block w-8 h-[2px] bg-slate-200 border-t border-dashed border-slate-300" />

          {/* Stage 03 */}
          <div className="flex flex-col items-center space-y-2 shrink-0 max-w-[130px] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-rose-300 bg-rose-50/50 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-rose-800">03</span>
            </div>
            <span className="text-xs font-bold text-slate-900">18 Safety Rules</span>
            <span className="text-[10px] text-slate-400">Red-Flag Overrides</span>
          </div>

          {/* Connector */}
          <div className="hidden lg:block w-8 h-[2px] bg-slate-200 border-t border-dashed border-slate-300" />

          {/* Stage 04 */}
          <div className="flex flex-col items-center space-y-2 shrink-0 max-w-[130px] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50/50 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-indigo-800">04</span>
            </div>
            <span className="text-xs font-bold text-slate-900">RAG Explainer</span>
            <span className="text-[10px] text-slate-400">ESI Handbook v4</span>
          </div>

          {/* Connector */}
          <div className="hidden lg:block w-8 h-[2px] bg-slate-200 border-t border-dashed border-slate-300" />

          {/* Stage 05 */}
          <div className="flex flex-col items-center space-y-2 shrink-0 max-w-[130px] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-emerald-800">05</span>
            </div>
            <span className="text-xs font-bold text-slate-900">Decision Cockpit</span>
            <span className="text-[10px] text-slate-400">Routing & Audit</span>
          </div>

          {/* End 3D Sphere */}
          <div className="flex flex-col items-center space-y-2 shrink-0">
            <div className="w-20 h-20 rounded-full sphere-3d-purple text-white flex items-center justify-center font-black text-sm">
              End
            </div>
            <span className="text-[11px] font-bold text-purple-900">Target Bay</span>
          </div>
        </div>

        {/* Doctor & Clinical Showcase Card (Behance Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          {/* Left Clinical Mockup Showcase Card */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-50 p-6 border border-slate-200/80 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-1 rounded-full border border-purple-200">
                Live Clinical Decision Validation
              </span>
              <span className="text-xs text-slate-400 font-mono">1,200 Patient Cohort</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900">
                Benchmarked on Real-World Emergency Data
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Evaluated against traditional emergency triage workflows. The multi-agent pipeline guarantees zero missed critical presentations through 18 deterministic red-flag safety overrides and asymmetric under-triage penalties.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                <span className="text-2xl font-black text-purple-800">100%</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">ESI-1 Recall</p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                <span className="text-2xl font-black text-emerald-700">0.9884</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Critical AUROC</p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                <span className="text-2xl font-black text-indigo-700">208ms</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Avg Latency</p>
              </div>
            </div>
          </div>

          {/* Right Doctor Portrait Card (Behance Style with Real Doctor Photo) */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 p-6 text-white flex flex-col justify-between shadow-purple-md space-y-4 relative overflow-hidden">
            {/* Ambient circle glow */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-md shrink-0">
                <img
                  src="/doctors/dr_rohit_sharma.jpg"
                  alt="Dr. Rohit Sharma"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white">Dr. Rohit Sharma, MD</span>
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <p className="text-xs text-purple-200 font-semibold">Lead Emergency Physician</p>
                <span className="text-[10px] text-purple-300/80 font-mono">Metro Level I Trauma Center</span>
              </div>
            </div>

            <p className="text-xs text-purple-200/90 leading-relaxed font-medium">
              &ldquo;PatientTriage.ai provides sub-second acuity stratification while giving our clinical staff complete autonomy with verified ESI Handbook v4 rationales.&rdquo;
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-purple-100 font-semibold">
                <span>Accenture Hackathon PS-2</span>
                <span className="text-emerald-300 font-bold">100% ESI-1 Sensitivity</span>
              </div>
              <Link href="/triage">
                <div className="w-full py-2.5 rounded-xl bg-white text-purple-950 font-bold text-xs text-center shadow-sm hover:bg-purple-50 transition-colors cursor-pointer">
                  Launch Clinical Workspace ➔
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Clinical Expert Panel (Doctor Photos Grid) ─────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Clinical Validation Panel
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Emergency Physicians & <span className="text-purple-700">Triage Experts</span>
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-full">
            18 Hard-Coded Safety Rules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DOCTORS.map((doc, idx) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card flex flex-col items-center text-center space-y-3 hover:shadow-card-hover hover:border-purple-200 transition-all group"
            >
              {/* Doctor Avatar with subtle ring */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-100 group-hover:border-purple-300 shadow-sm transition-all duration-200">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 uppercase tracking-wider">
                  {doc.badge}
                </span>
                <h4 className="text-sm font-black text-slate-900 pt-1 group-hover:text-purple-700 transition-colors">
                  {doc.name}
                </h4>
                <p className="text-xs font-semibold text-slate-600">{doc.role}</p>
                <p className="text-[11px] text-slate-400 font-medium">{doc.hospital}</p>
              </div>

              <div className="w-full pt-2 border-t border-slate-100 text-[10px] text-purple-900 font-bold">
                {doc.specialty}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Core Module Cards ──────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Platform Modules
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Emergency Department <span className="text-purple-700">Capabilities</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              href: '/triage', icon: Activity,
              title: 'AI Triage Cockpit',
              desc: 'Select active queue patients, execute multi-agent scoring, review ESI recommendations, and submit clinical overrides with 1-click confirm & route.',
              badge: 'Core Workspace',
            },
            {
              href: '/pipeline', icon: Cpu,
              title: 'LangGraph Agent Inspector',
              desc: 'Deep-dive into the 5 compiled agent nodes: Intake, Dual-Stream Fusion, 18 Safety Rules Engine, RAG Explainer, and Decision Cockpit.',
              badge: 'Architecture',
            },
            {
              href: '/monitor', icon: Monitor,
              title: 'Waiting Room Monitor',
              desc: 'Live emergency queue management with ESI wait-time threshold tracking, deterioration alert banners, and mass casualty surge mode.',
              badge: 'Real-Time',
            },
            {
              href: '/audit', icon: Shield,
              title: 'Governance Audit Trail',
              desc: 'Immutable clinical decision logs, physician override capture, AI-clinician agreement rate metrics, and HIPAA-compliant JSON export.',
              badge: 'Compliance',
            },
            {
              href: '/analytics', icon: BarChart3,
              title: 'Clinical Benchmarks',
              desc: 'Comprehensive validation across 1,200 patients: 5-class confusion matrix, RAG vs generic LLM hallucination analysis, and AUROC curves.',
              badge: 'Validation',
            },
            {
              href: '/triage', icon: HeartPulse,
              title: 'Safety Rules Engine',
              desc: '18 hard-coded physiological safety triggers with 20x asymmetric loss penalty to ensure zero missed critical life threats.',
              badge: 'Safety First',
            },
          ].map((item, i) => (
            <Link key={item.title} href={item.href} className="block group">
              <GlassCard hoverEffect delay={i * 0.05} className="h-full flex flex-col justify-between space-y-4 !p-6 cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center group-hover:bg-purple-700 transition-colors duration-200">
                      <item.icon className="w-5 h-5 text-purple-700 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>

                <div className="pt-2 flex items-center text-xs text-purple-700 font-bold">
                  Open Module <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
