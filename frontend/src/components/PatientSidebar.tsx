'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Ambulance, Footprints } from 'lucide-react';
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
    <div className="glass h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Patient Queue</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-300 font-bold">
            {filteredPatients.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent-500/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterEsi('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filterEsi === 'all'
                ? 'bg-accent-500/15 text-accent-300 shadow-glass'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setFilterEsi(level)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filterEsi === level
                  ? 'bg-white/5 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredPatients.map((patient, index) => {
          const isSelected = patient.patient_id === selectedId;

          return (
            <motion.div
              key={patient.patient_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
              onClick={() => onSelect(patient.patient_id)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-accent-500/10 border-accent-500/30 shadow-glass'
                  : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="text-sm font-semibold text-white">{patient.name}</span>
                  <span className="text-[10px] text-gray-500 ml-1.5">
                    {patient.age}y/{patient.sex}
                  </span>
                </div>
                <ESIBadge esi={patient.expected_esi} size="sm" showLabel={false} />
              </div>

              <p className="text-[10px] text-gray-400 line-clamp-1 mb-1.5">
                {patient.chief_complaint}
              </p>

              <div className="flex items-center justify-between text-[9px] text-gray-600">
                <span className="flex items-center gap-1">
                  {patient.arrival_mode === 'ambulance' ? (
                    <>
                      <Ambulance className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">EMS</span>
                    </>
                  ) : (
                    <>
                      <Footprints className="w-3 h-3" />
                      Walk-in
                    </>
                  )}
                </span>
                <span className="font-mono">{patient.patient_id}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
