'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Ambulance, Footprints } from 'lucide-react';
import { Patient } from '@/lib/types';
import ESIBadge from './ESIBadge';

interface PatientSidebarProps {
  patients: Patient[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PatientSidebar({ patients, selectedId, onSelect }: PatientSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEsi, setFilterEsi] = useState<number | 'all'>('all');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patient_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEsi === 'all' || p.expected_esi === filterEsi;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">Active Queue</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
              {filteredPatients.length} Patients
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">ED Live Stream</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:shadow-input-focus transition-all"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterEsi('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filterEsi === 'all'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setFilterEsi(level)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filterEsi === level
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              ESI-{level}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filteredPatients.map((patient, index) => {
          const isSelected = patient.patient_id === selectedId;

          return (
            <motion.div
              key={patient.patient_id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.2) }}
              onClick={() => onSelect(patient.patient_id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-purple-50/90 border-purple-300 border-l-[3px] border-l-purple-500 shadow-sm ring-1 ring-purple-400/30'
                  : 'bg-white border-slate-200/70 hover:border-purple-200 hover:bg-slate-50/70 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className={`text-sm font-bold ${isSelected ? 'text-purple-950' : 'text-slate-900'}`}>{patient.name}</span>
                  <span className="text-[10px] font-semibold text-slate-400 ml-1.5">
                    {patient.age}y / {patient.sex}
                  </span>
                </div>
                <ESIBadge esi={patient.expected_esi || 3} size="sm" showLabel={false} />
              </div>

              <p className="text-[11px] text-slate-600 line-clamp-1 mb-2 font-medium">
                {patient.chief_complaint}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  {patient.arrival_mode === 'ambulance' ? (
                    <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/60">
                      <Ambulance className="w-3 h-3" /> EMS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      <Footprints className="w-3 h-3 text-slate-400" /> Walk-in
                    </span>
                  )}
                </span>
                <span className="font-mono text-slate-400">{patient.patient_id}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
