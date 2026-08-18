import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { CommandCenter } from './components/CommandCenter';
import { CaseConferenceWorkspace } from './components/CaseConferenceWorkspace';
import { SwarmIntelligenceWorkspace } from './components/SwarmIntelligenceWorkspace';
import { HealthTimeline } from './components/HealthTimeline';
import { ReportIntelligence } from './components/ReportIntelligence';
import { MedicationIntelligence } from './components/MedicationIntelligence';
import { RecoveryJourney } from './components/RecoveryJourney';
import { ClinicianPortal } from './components/ClinicianPortal';
import { ConsentAndAudit } from './components/ConsentAndAudit';
import { EmergencyScreen } from './components/EmergencyScreen';
import { ClinicalConferenceEngine } from './engine/clinicalConferenceEngine';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

const conferenceEngine = new ClinicalConferenceEngine();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('command');
  const [activeRole, setActiveRole] = useState<'patient' | 'clinician' | 'caregiver'>('patient');
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Neubrutalist Marquee Ticker */}
      <div className="bg-[#FFE600] border-b-2 border-black py-1 overflow-hidden whitespace-nowrap text-xs font-mono font-bold tracking-wider text-black flex items-center">
        <div className="inline-block animate-marquee space-x-8">
          <span>⚡ HEAL ENGINE ACTIVE</span>
          <span>•</span>
          <span>REAL-TIME DIGITAL TWIN TELEMETRY STREAM</span>
          <span>•</span>
          <span>MULTI-SPECIALIST CASE CONFERENCE ENGINE ONLINE</span>
          <span>•</span>
          <span>SWARM INTELLIGENCE (PSO) CONSENSUS: CONVERGED</span>
          <span>•</span>
          <span>PATIENT ID: ELEANOR VANCE (68Y/F)</span>
          <span>•</span>
          <span>⚡ HEAL ENGINE ACTIVE</span>
        </div>
      </div>

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
          <div className="mb-6 p-4 bg-[#3A86FF] text-white border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2 font-bold text-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[10px] uppercase font-black border border-black -rotate-1">
                CLINICIAN MODE
              </span>
              <span className="font-display text-sm tracking-wide">Dr. Aris Thorne (Cardiology / Nephrology Decision Support)</span>
            </div>
            <span className="text-[11px] font-mono bg-black/30 px-2 py-1 border border-black/40">
              FHIR R4 API CONNECTED • REAL-TIME AUDIT LOGGING
            </span>
          </div>
        )}

        {activeRole === 'caregiver' && (
          <div className="mb-6 p-4 bg-[#CCFF00] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2 font-bold text-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-[#CCFF00] px-2 py-0.5 text-[10px] uppercase font-black border border-black rotate-1">
                CAREGIVER VIEW
              </span>
              <span className="font-display text-sm tracking-wide">Eleanor's Authorized Caregiver & Family Dashboard</span>
            </div>
            <span className="text-[11px] font-mono bg-black text-white px-2 py-1 border border-black">
              SIMPLIFIED REMINDERS • 24/7 EMERGENCY WATCH
            </span>
          </div>
        )}

        {/* Tab Routing */}
        {activeTab === 'command' && <CommandCenter onNavigateTab={setActiveTab} />}
        {activeTab === 'conference' && <CaseConferenceWorkspace engine={conferenceEngine} />}
        {activeTab === 'swarm' && <SwarmIntelligenceWorkspace />}
        {activeTab === 'timeline' && <HealthTimeline />}
        {activeTab === 'reports' && <ReportIntelligence />}
        {activeTab === 'meds' && <MedicationIntelligence />}
        {activeTab === 'recovery' && <RecoveryJourney />}
        {activeTab === 'clinician' && <ClinicianPortal />}
        {activeTab === 'governance' && <ConsentAndAudit />}
      </main>

      {/* Neubrutalist Footer */}
      <footer className="border-t-3 border-black py-6 bg-[#FFFFFF] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center space-x-2">
            <span className="bg-[#FFE600] text-black border-2 border-black px-2 py-1 text-sm font-black font-display shadow-[2px_2px_0px_0px_#000]">
              HEAL ENGINE
            </span>
            <span className="text-black font-mono">Longitudinal Health Intelligence Operating System</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="bg-[#00F5D4] border border-black px-2 py-0.5 text-black font-extrabold shadow-[2px_2px_0px_0px_#000]">7 DATA CLUSTERS</span>
            <span>•</span>
            <span className="bg-[#FF70A6] border border-black px-2 py-0.5 text-black font-extrabold shadow-[2px_2px_0px_0px_#000]">CASE CONFERENCE MODEL</span>
            <span>•</span>
            <span className="bg-[#CCFF00] border border-black px-2 py-0.5 text-black font-extrabold shadow-[2px_2px_0px_0px_#000]">SAFETY & RAG ENGINE</span>
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
