'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight,
  CheckCircle2, Sparkles, Shield, Activity, User, HeartPulse,
  Award, AlertCircle, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchDemoUsers } from '@/lib/api';
import { DemoUser } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, quickLogin, user, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Emergency Clinician');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  useEffect(() => {
    fetchDemoUsers().then((res) => {
      if (res?.demo_users) {
        setDemoUsers(res.demo_users);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, name, role });
      }
      router.push('/triage');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoUser: DemoUser) => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(demoUser);
      router.push('/triage');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#070913] text-slate-100 flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* ── Left Column: Hero & Medical Value Prop ──────────────────── */}
        <div className="lg:col-span-7 space-y-8">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Patient<span className="text-purple-400">Triage</span>
                <span className="text-rose-400 font-semibold text-xs ml-1 px-1.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/60">
                  .ai
                </span>
              </span>
              <p className="text-[10px] text-rose-400/90 font-bold tracking-widest uppercase mt-0.5">
                AI-POWERED CLINICAL DECISION SUPPORT
              </p>
            </div>
          </div>

          {/* Heartbeat pulse waveform */}
          <div className="w-24 h-8 text-rose-500/80">
            <svg viewBox="0 0 100 30" className="w-full h-full stroke-current fill-none stroke-2">
              <path d="M0 15 L20 15 L28 5 L36 25 L44 8 L52 20 L60 15 L100 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-black text-white leading-[1.1] tracking-tight">
              Every second <br />
              <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                saves a life.
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-lg font-medium">
              AI stratifies emergency acuity before vital deterioration. From multimodal intake to 5-stage routing — in under 200ms.
            </p>
          </div>

          {/* Feature Bullet Points */}
          <div className="space-y-3.5 pt-2">
            {[
              { text: 'NLP-driven urgency triage in under 200ms', color: 'text-rose-400' },
              { text: '18 Deterministic Red-Flag Overrides with 100% ESI-1 Sensitivity', color: 'text-purple-400' },
              { text: 'RAG Clinical Explanations grounded in ESI Handbook v4', color: 'text-indigo-400' },
              { text: 'HIPAA-compliant immutable governance & physician audit trail', color: 'text-emerald-400' },
            ].map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-300">
                <Check className={`w-4 h-4 ${bullet.color} shrink-0`} />
                <span>{bullet.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom Metrics Bar */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <span className="text-2xl font-black text-white">100%</span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">ESI-1 Recall</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white">1,200+</span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Patient Cohort</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white">&lt;208ms</span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Latency</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white">0.9884</span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">AUROC Score</p>
            </div>
          </div>
        </div>

        {/* ── Right Column: Sign In Frosted Glass Card ────────────────── */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#101222]/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-bold">
              <span className="text-rose-400">♡</span>
              {mode === 'login' ? 'Welcome back' : 'New Clinician Registration'}
            </div>

            {/* Header Text */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">
                {mode === 'login' ? 'Sign in' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {mode === 'login'
                  ? 'Continue your clinical triage session'
                  : 'Register for hospital emergency credentialing'}
              </p>
            </div>

            {/* Quick 1-Click Demo Login Clinicians */}
            {mode === 'login' && demoUsers.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Demo Login (1-Click)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {demoUsers.map((d) => (
                    <button
                      key={d.email}
                      type="button"
                      onClick={() => handleQuickDemo(d)}
                      disabled={loading}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 hover:bg-purple-950/30 transition-all text-left group flex flex-col items-center text-center"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden mb-1 border border-slate-700 group-hover:border-purple-400">
                        <img src={d.avatar} alt={d.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 truncate w-full group-hover:text-purple-300">
                        {d.name.split(',')[0]}
                      </span>
                      <span className="text-[8px] text-slate-500 truncate w-full">{d.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Notice */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Rajesh Gupta, MD"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090b16] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Clinical Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b16] border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="Lead Emergency Physician">Lead Emergency Physician</option>
                      <option value="Triage Charge Nurse">Triage Charge Nurse</option>
                      <option value="Chief of Emergency Medicine">Chief of Emergency Medicine</option>
                      <option value="Trauma Surgery Specialist">Trauma Surgery Specialist</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email or Staff ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="clinician@hospital.health"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090b16] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090b16] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign in' : 'Create Clinical Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="pt-2 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-purple-400 font-bold hover:underline"
                  >
                    Create one free
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-purple-400 font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
