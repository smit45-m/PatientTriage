'use client';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Users, LayoutDashboard, History } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (v: string) => void;
  isSurge: boolean;
  toggleSurge: () => void;
}

export default function Header({ currentView, setCurrentView, isSurge, toggleSurge }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card m-4 px-6 py-3 flex items-center justify-between sticky top-4 z-50 rounded-2xl"
    >
      <div className="flex items-center space-x-3">
        <Activity className="text-accent-400" size={28} />
        <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(161,0,255,0.5)]">
          PatientTriage<span className="text-accent-400">.ai</span>
        </h1>
      </div>
      
      <div className="flex items-center space-x-8">
        <div className="flex space-x-2 bg-surface-darker p-1 rounded-xl border border-gray-800">
          <button onClick={() => setCurrentView('queue')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${currentView === 'queue' ? 'bg-accent-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <LayoutDashboard size={16} /> <span>Queue</span>
          </button>
          <button onClick={() => setCurrentView('monitor')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${currentView === 'monitor' ? 'bg-accent-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <Users size={16} /> <span>Monitor</span>
          </button>
          <button onClick={() => setCurrentView('audit')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${currentView === 'audit' ? 'bg-accent-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <History size={16} /> <span>Audit</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Surge Mode</span>
            <button
              onClick={toggleSurge}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex ${isSurge ? 'bg-red-500 justify-end' : 'bg-gray-700 justify-start'}`}
            >
              <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>
          <div className="flex items-center space-x-2 bg-surface-darker px-3 py-1.5 rounded-lg border border-gray-800">
            <ShieldAlert size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-300">RN-4492</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
