'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Loader2 } from 'lucide-react';
import PatientSidebar from '@/components/PatientSidebar';
import TriageCard from '@/components/TriageCard';
import { Patient } from '@/lib/types';
import { fetchPatients } from '@/lib/api';

export default function TriagePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients()
      .then((data) => {
        setPatients(data);
        if (data.length > 0) setSelectedId(data[0].patient_id);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selectedPatient = patients.find((p) => p.patient_id === selectedId);

  return (
    <div className="flex-1 flex flex-col px-6 py-4 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] overflow-hidden">
      {/* Top breadcrumb & stats header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-500/15 text-accent-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              AI Triage Queue & Clinical Cockpit
            </h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">
              Select a patient from the queue to run the 5-stage multimodal AI triage pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-gray-300">
            Total Patients: <strong className="text-white">{patients.length}</strong>
          </span>
        </div>
      </div>

      {/* Main 2-column workspace */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
            <span className="text-xs font-mono text-gray-400">Loading Clinical Cohort...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 overflow-hidden">
          {/* Left Column: Patient Queue (4 cols) */}
          <div className="lg:col-span-4 h-full overflow-hidden">
            <PatientSidebar
              patients={patients}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Right Column: Triage Detail & Execution Cockpit (8 cols) */}
          <div className="lg:col-span-8 h-full overflow-hidden">
            {selectedPatient ? (
              <TriageCard patient={selectedPatient} />
            ) : (
              <div className="h-full flex items-center justify-center glass text-gray-500 text-sm">
                Select a patient from the left queue to begin AI triage.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
