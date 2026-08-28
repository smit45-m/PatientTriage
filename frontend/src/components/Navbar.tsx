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

        {/* Status */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-700">Multi-Agent Engine</span>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">v2.0 Active</span>
        </div>
      </div>
    </nav>
  );
}
