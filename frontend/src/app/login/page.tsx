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
      router.push('/overview');
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
      router.push('/overview');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col justify-center px-6 py-12 relative overflow-hidden">

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* ── Left Column: Hero & Medical Value Prop ──────────────────── */}
        <div className="lg:col-span-7 space-y-8">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Patient<span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">Triage</span>
                <span className="text-purple-600 font-semibold text-xs ml-1.5 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200">
                  .ai
                </span>
              </span>
              <p className="text-[10px] text-purple-600/80 font-bold tracking-widest uppercase mt-0.5">
                AI-POWERED CLINICAL DECISION SUPPORT
              </p>
            </div>
          </div>

          {/* Heartbeat pulse waveform */}
          <div className="w-36 h-10 text-purple-500">
            <svg viewBox="0 0 120 30" className="w-full h-full stroke-current fill-none stroke-[2.5]">
              <path
                d="M0 15 L25 15 L32 4 L40 26 L48 8 L56 22 L64 15 L120 15"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ecg-line"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 leading-[1.1] tracking-tight">
              Every second <br />
              <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                saves a life.
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-lg font-medium">
              AI stratifies emergency acuity before vital deterioration. From multimodal intake to 5-stage routing — in under 200ms.
            </p>
          </div>

          {/* Feature Bullet Points */}
          <div className="space-y-3.5 pt-2">
            {[
              { text: 'NLP-driven urgency triage in under 200ms', color: 'text-purple-600' },
              { text: '18 Deterministic Red-Flag Overrides with 100% ESI-1 Sensitivity', color: 'text-indigo-600' },
              { text: 'RAG Clinical Explanations grounded in ESI Handbook v4', color: 'text-purple-700' },
              { text: 'HIPAA-compliant immutable governance & physician audit trail', color: 'text-emerald-600' },
            ].map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-600">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  idx === 3 ? 'bg-emerald-50' : 'bg-purple-50'
                }`}>
                  <Check className={`w-3.5 h-3.5 ${bullet.color} shrink-0`} />
                </div>
                <span>{bullet.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom Metrics Bar */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-200">
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">100%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ESI-1 Recall</p>
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">1,200+</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Patient Cohort</p>
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">&lt;208ms</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Latency</p>
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">0.9884</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">AUROC Score</p>
            </div>
          </div>
        </div>

        {/* ── Right Column: Sign In Frosted Glass Card ────────────────── */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={error ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: error ? 0.4 : 0.3 }}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-purple-500/5 space-y-6 relative"
            style={{
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 8px 32px -4px rgba(15, 23, 42, 0.06), 0 4px 16px -4px rgba(109, 40, 217, 0.04)'
            }}
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-purple-500" />
              {mode === 'login' ? 'Welcome back, Clinician' : 'New Clinician Registration'}
            </div>

            {/* Header Text */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">
                {mode === 'login' ? 'Sign in' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {mode === 'login'
                  ? 'Continue your clinical triage session'
                  : 'Register for hospital emergency credentialing'}
              </p>
            </div>

            {/* Quick 1-Click Demo Login Clinicians */}
            {mode === 'login' && demoUsers.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Demo Login (1-Click)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {demoUsers.map((d) => (
                    <button
                      key={d.email}
                      type="button"
                      onClick={() => handleQuickDemo(d)}
                      disabled={loading}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group flex flex-col items-center text-center cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden mb-1 border-2 border-slate-200 group-hover:border-purple-400 transition-colors">
                        <img src={d.avatar} alt={d.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full group-hover:text-purple-700 transition-colors">
                        {d.name.split(',')[0]}
                      </span>
                      <span className="text-[8px] text-slate-400 truncate w-full">{d.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Notice */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Rajesh Gupta, MD"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Clinical Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] transition-all"
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
                <label className="text-xs font-semibold text-slate-600">Email or Staff ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="clinician@hospital.health"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-[0_0_0_3px_rgba(109,40,217,0.08)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white font-bold text-xs shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign in' : 'Create Clinical Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="pt-2 text-center text-xs text-slate-500">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-purple-700 font-bold hover:underline cursor-pointer"
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
                    className="text-purple-700 font-bold hover:underline cursor-pointer"
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
