'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Cpu, Monitor, Shield, BarChart3, Stethoscope } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/triage', label: 'Triage Cockpit', icon: Activity },
  { href: '/pipeline', label: 'AI Pipeline', icon: Cpu },
  { href: '/monitor', label: 'Waiting Room', icon: Monitor },
  { href: '/audit', label: 'Audit Trail', icon: Shield },
  { href: '/analytics', label: 'Clinical Benchmarks', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center shadow-purple-sm group-hover:shadow-purple-md transition-all duration-200">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">Patient<span className="text-purple-700">Triage</span><span className="text-indigo-600 font-semibold text-xs ml-0.5 px-1.5 py-0.5 rounded-md bg-purple-50 border border-purple-200/60">.ai</span></span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium tracking-wider uppercase">Clinical Decision Support</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/60">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-purple-800 shadow-sm border border-slate-200/50'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-700' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute -bottom-1 left-3 right-3 h-[2px] bg-purple-700 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Active Clinician Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-xs">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-purple-300 shrink-0">
              <img
                src="/doctors/nurse_sarah.jpg"
                alt="RN-Sarah"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-slate-800 leading-tight">RN-Sarah</span>
              <span className="text-[9px] text-purple-700 font-semibold leading-tight">Triage Charge</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
