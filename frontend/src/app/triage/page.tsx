'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2, Users } from 'lucide-react';
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
    <div className="flex-1 flex flex-col px-6 py-5 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-purple-100 border border-purple-200 text-purple-800">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              AI Triage Queue & Clinical Decision Cockpit
            </h1>
            <p className="text-xs text-slate-500 font-medium -mt-0.5">
              Select an emergency patient from the active queue to run the 5-stage multimodal triage pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs font-semibold text-slate-700">
            Active Patients: <strong className="text-purple-800">{patients.length}</strong>
          </span>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-card">
            <Loader2 className="w-8 h-8 text-purple-700 animate-spin" />
            <span className="text-xs font-bold text-slate-600">Loading Clinical Cohort...</span>
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
              <TriageCard
                patient={selectedPatient}
                onNextPatient={() => {
                  const currentIndex = patients.findIndex(p => p.patient_id === selectedId);
                  const nextIndex = (currentIndex + 1) % patients.length;
                  setSelectedId(patients[nextIndex].patient_id);
                }}
                onPatientRouted={(patientId) => {
                  // Future: could remove routed patient from queue
                  console.log(`Patient ${patientId} routed and audit logged.`);
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-card text-slate-400 text-sm font-medium">
                Select a patient from the active queue on the left to begin AI triage.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
