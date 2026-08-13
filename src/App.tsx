import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { CommandCenter } from './components/CommandCenter';
import { CaseConferenceWorkspace } from './components/CaseConferenceWorkspace';
import { HealthTimeline } from './components/HealthTimeline';
import { ReportIntelligence } from './components/ReportIntelligence';
import { MedicationIntelligence } from './components/MedicationIntelligence';
import { RecoveryJourney } from './components/RecoveryJourney';
import { ClinicianPortal } from './components/ClinicianPortal';
import { ConsentAndAudit } from './components/ConsentAndAudit';
import { EmergencyScreen } from './components/EmergencyScreen';
import { ClinicalConferenceEngine } from './engine/clinicalConferenceEngine';

const conferenceEngine = new ClinicalConferenceEngine();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('command');
  const [activeRole, setActiveRole] = useState<'patient' | 'clinician' | 'caregiver'>('patient');
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onTriggerEmergency={() => setShowEmergencyModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role Banner Notification if Clinician or Caregiver mode */}
        {activeRole === 'clinician' && (
          <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between">
            <span className="font-semibold">Clinician Decision Support Mode Active — Dr. Aris Thorne (Cardiology / Nephrology)</span>
            <span className="text-[10px] font-mono text-blue-400">FHIR API Connected</span>
          </div>
        )}

        {activeRole === 'caregiver' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <span className="font-semibold">Caregiver & Family Persona View — Eleanor's Authorized Caregiver</span>
            <span className="text-[10px] text-emerald-400">Simplified Reminders & Emergency Alerts</span>
          </div>
        )}

        {/* Tab Routing */}
        {activeTab === 'command' && <CommandCenter onNavigateTab={setActiveTab} />}
        {activeTab === 'conference' && <CaseConferenceWorkspace engine={conferenceEngine} />}
        {activeTab === 'timeline' && <HealthTimeline />}
        {activeTab === 'reports' && <ReportIntelligence />}
        {activeTab === 'meds' && <MedicationIntelligence />}
        {activeTab === 'recovery' && <RecoveryJourney />}
        {activeTab === 'clinician' && <ClinicianPortal />}
        {activeTab === 'governance' && <ConsentAndAudit />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-400">HEAL ENGINE</span> — Longitudinal Health Intelligence Operating System
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>7 Connected Data Clusters</span>
            <span>•</span>
            <span>Clinical Case Conference Model</span>
            <span>•</span>
            <span>Evidence RAG & Safety Engine</span>
          </div>
        </div>
      </footer>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyScreen onClose={() => setShowEmergencyModal(false)} />
      )}
    </div>
  );
};

export default App;
