import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { CommandCenter } from './components/CommandCenter';
import { UnderstandWorkspace } from './components/UnderstandWorkspace';
import { DetectWorkspace } from './components/DetectWorkspace';
import { ExplainWorkspace } from './components/ExplainWorkspace';
import { ProtectWorkspace } from './components/ProtectWorkspace';
import { DecideWorkspace } from './components/DecideWorkspace';
import { RecoveryJourney } from './components/RecoveryJourney';
import { CaseConferenceWorkspace } from './components/CaseConferenceWorkspace';
import { SwarmIntelligenceWorkspace } from './components/SwarmIntelligenceWorkspace';
import { HealthTimeline } from './components/HealthTimeline';
import { ReportIntelligence } from './components/ReportIntelligence';
import { ClinicianPortal } from './components/ClinicianPortal';
import { ConsentAndAudit } from './components/ConsentAndAudit';
import { EmergencyScreen } from './components/EmergencyScreen';
import { VirtualDoctorScreeningWorkspace } from './components/VirtualDoctorScreeningWorkspace';
import { EndToEndWorkflowWorkspace } from './components/EndToEndWorkflowWorkspace';
import { ClinicalSummaryWorkspace } from './components/ClinicalSummaryWorkspace';
import { ClinicalConferenceEngine } from './engine/clinicalConferenceEngine';
import { AuthProvider } from './context/AuthContext';
import { AuthGateway } from './components/auth/AuthGateway';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

import { useAuth } from './context/AuthContext';
import { getDynamicPatientProfile } from './data/mockPatientData';

const conferenceEngine = new ClinicalConferenceEngine();

const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);
  const [activeTab, setActiveTab] = useState<string>('command');
  const [activeRole, setActiveRole] = useState<'patient' | 'clinician' | 'research'>('patient');
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Neubrutalist Marquee Ticker */}
      <div className="bg-[#FFE600] border-b-2 border-black py-1 overflow-hidden whitespace-nowrap text-xs font-mono font-bold tracking-wider text-black flex items-center">
        <div className="inline-block animate-marquee space-x-8">
          <span>⚡ HEAL ENGINE ACTIVE</span>
          <span>•</span>
          <span>6-STEP CARE LOOP: MY HEALTH → WHAT CHANGED? → WHY IT MATTERS → TALK TO SPECIALIST → SAFETY CHECK → FOLLOW-UP</span>
          <span>•</span>
          <span>PATIENT: {currentPatient.name.toUpperCase()} ({currentPatient.age}Y/{currentPatient.gender[0]})</span>
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
        {/* Audience Complexity Banner Notifications */}
        {activeRole === 'patient' && (
          <div className="mb-6 p-4 bg-[#FFE600] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2 font-bold text-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[10px] uppercase font-black border border-black -rotate-1">
                PATIENT VIEW (LEVEL 1)
              </span>
              <span className="font-display text-sm tracking-wide">{currentPatient.name}'s Health Picture & Guidance</span>
            </div>
            <span className="text-[11px] font-mono bg-black text-white px-2 py-1 border border-black">
              SIMPLE HUMAN LANGUAGE • SYMPTOM WATCH • QUESTIONS TO DISCUSS
            </span>
          </div>
        )}

        {activeRole === 'clinician' && (
          <div className="mb-6 p-4 bg-[#3A86FF] text-white border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2 font-bold text-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[10px] uppercase font-black border border-black -rotate-1">
                CLINICIAN VIEW (LEVEL 2)
              </span>
              <span className="font-display text-sm tracking-wide">Dr. Aris Thorne (Cardiorenal Decision Support for {currentPatient.name})</span>
            </div>
            <span className="text-[11px] font-mono bg-black/30 px-2 py-1 border border-black/40">
              FHIR R4 EHR SYNC • HARD SAFETY CHECKS • EVIDENCE CITATIONS
            </span>
          </div>
        )}

        {activeRole === 'research' && (
          <div className="mb-6 p-4 bg-[#A855F7] text-white border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2 font-bold text-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-[#CCFF00] px-2 py-0.5 text-[10px] uppercase font-black border border-black rotate-1">
                RESEARCH & ENGINEERING (LEVEL 3)
              </span>
              <span className="font-display text-sm tracking-wide">Full Forensic Architecture & Multi-Agent Swarm Visualization</span>
            </div>
            <span className="text-[11px] font-mono bg-black text-white px-2 py-1 border border-black">
              KNOWLEDGE GRAPH • PSO SWARM • 11-ATTRIBUTE AUDIT • 50-CASE BENCHMARK
            </span>
          </div>
        )}

        {/* Primary Tab Routing (Human + Clinical) */}
        {activeTab === 'command' && <CommandCenter onNavigateTab={setActiveTab} />}
        {activeTab === 'reports' && <ReportIntelligence />}
        {activeTab === 'timeline' && <HealthTimeline />}
        {activeTab === 'insights' && <ExplainWorkspace />}
        {activeTab === 'virtual-doctor' && <VirtualDoctorScreeningWorkspace />}
        {activeTab === 'recovery' && <RecoveryJourney onNavigateTab={setActiveTab} />}
        {activeTab === 'clinician-summary' && <ClinicalSummaryWorkspace onNavigateTab={setActiveTab} />}

        {/* Advanced & Forensic Engine Workspaces */}
        {activeTab === 'workflow' && <EndToEndWorkflowWorkspace onNavigateTab={setActiveTab} />}
        {activeTab === 'safety' && <ProtectWorkspace />}
        {activeTab === 'conference' && <CaseConferenceWorkspace engine={conferenceEngine} />}
        {activeTab === 'swarm' && <SwarmIntelligenceWorkspace />}
        {activeTab === 'clinician' && <ClinicianPortal />}
        {activeTab === 'governance' && <ConsentAndAudit />}

        {/* Legacy Routing Aliases */}
        {activeTab === 'health' && <UnderstandWorkspace />}
        {activeTab === 'changes' && <DetectWorkspace />}
        {activeTab === 'decide' && <DecideWorkspace />}
      </main>

      {/* Neubrutalist Footer */}
      <footer className="border-t-3 border-black py-6 bg-[#FFFFFF] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center space-x-2">
            <span className="bg-[#FFE600] text-black border-2 border-black px-2 py-1 text-sm font-black font-display shadow-[2px_2px_0px_0px_#000]">
              HEAL ENGINE
            </span>
            <span className="text-black font-mono">Longitudinal Clinical Decision Intelligence for Complex Care</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="bg-[#00F5D4] border border-black px-2 py-0.5 text-black font-extrabold shadow-[2px_2px_0px_0px_#000]">6-QUESTION HUMAN UX</span>
            <span>•</span>
            <span className="bg-[#FF70A6] border border-black px-2 py-0.5 text-black font-extrabold shadow-[2px_2px_0px_0px_#000]">HEALTH CONNECTIONS</span>
            <span>•</span>
            <span className="bg-[#CCFF00] border border-black px-2 py-0.5 text-black font-extrabold shadow-[2px_2px_0px_0px_#000]">SAFETY & EVIDENCE ENGINE</span>
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthGateway>
        <MainDashboard />
      </AuthGateway>
    </AuthProvider>
  );
};

export default App;
