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
import { AIVirtualSpecialistStudio } from './components/AIVirtualSpecialistStudio';
import { EndToEndWorkflowWorkspace } from './components/EndToEndWorkflowWorkspace';
import { ClinicalSummaryWorkspace } from './components/ClinicalSummaryWorkspace';
import { ClinicalConferenceEngine } from './engine/clinicalConferenceEngine';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthGateway } from './components/auth/AuthGateway';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

import { PatientPortalDashboard } from './components/PatientPortalDashboard';
import { CareFollowUpWorkspace } from './components/CareFollowUpWorkspace';
import { EvidenceProvenanceModal } from './components/EvidenceProvenanceModal';
import { NotificationBanner } from './components/NotificationBanner';

import { ClinicalValidationHarnessLaboratory } from './components/ClinicalValidationHarnessLaboratory';
import { EditPatientProfileModal, EditProfileTab } from './components/EditPatientProfileModal';
import { useAuth } from './context/AuthContext';
import { getDynamicPatientProfile } from './data/mockPatientData';

const conferenceEngine = new ClinicalConferenceEngine();

const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);
  const [activeTab, setActiveTab] = useState<string>('command');
  const [activeRole, setActiveRole] = useState<'patient' | 'clinician' | 'research'>('patient');
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editProfileInitialTab, setEditProfileInitialTab] = useState<EditProfileTab>('demographics');


  const handleOpenEditProfile = (initialTab: EditProfileTab = 'demographics') => {
    setEditProfileInitialTab(initialTab);
    setShowEditProfileModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg-paper)', color: 'var(--text-ink)' }}>
      {/* Top Marquee Ticker — editorial ink on yellow */}
      <div className="overflow-hidden whitespace-nowrap text-[11px] font-mono font-semibold tracking-wider flex items-center py-1" style={{ background: '#FFE45C', borderBottom: '2px solid var(--border)', color: '#080808' }}>
        <div className="inline-block animate-marquee space-x-8">
          <span>▸ HEAL ENGINE — CLINICAL INTELLIGENCE OS</span>
          <span>·</span>
          <span>6-STEP CARE LOOP: UNDERSTAND → DETECT → EXPLAIN → CONSULT → PROTECT → FOLLOW UP</span>
          <span>·</span>
          <span>PATIENT: {currentPatient.name.toUpperCase()} · {currentPatient.age}Y · {currentPatient.gender.toUpperCase()}</span>
          <span>·</span>
          <span>▸ HEAL ENGINE — CLINICAL INTELLIGENCE OS</span>
        </div>
      </div>

      {/* Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onTriggerEmergency={() => setShowEmergencyModal(true)}
        onOpenEditProfile={() => handleOpenEditProfile('demographics')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Audience Complexity Banner Notifications */}
        {activeRole === 'patient' && (
          <div className="mb-4 p-3 flex flex-wrap items-center justify-between gap-2 text-xs" style={{ background: '#FFE45C', border: '1.5px solid var(--border)', boxShadow: '4px 4px 0 var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="he-badge" style={{ background: 'var(--text-ink)', color: '#FFE45C' }}>PATIENT VIEW</span>
              <span className="font-display font-semibold text-sm" style={{ color: 'var(--text-ink)' }}>{currentPatient.name}'s Health Picture &amp; Guidance</span>
            </div>
            <span className="font-mono text-[11px]" style={{ background: 'var(--text-ink)', color: '#FFE45C', padding: '2px 8px' }}>
              SIMPLE LANGUAGE · SYMPTOM WATCH · QUESTIONS TO DISCUSS
            </span>
          </div>
        )}

        {activeRole === 'clinician' && (
          <div className="mb-4 p-3 flex flex-wrap items-center justify-between gap-2 text-xs" style={{ background: '#CCFBF1', border: '1.5px solid #0D9488', boxShadow: '4px 4px 0 var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="he-badge" style={{ background: '#0D9488', color: '#ffffff', borderColor: '#0F766E' }}>CLINICIAN VIEW</span>
              <span className="font-display font-semibold text-sm" style={{ color: 'var(--text-ink)' }}>Dr. Aris Thorne — Cardiorenal Decision Support for {currentPatient.name}</span>
            </div>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              FHIR R4 EHR SYNC · HARD SAFETY CHECKS · EVIDENCE CITATIONS
            </span>
          </div>
        )}

        {activeRole === 'research' && (
          <div className="mb-4 p-3 flex flex-wrap items-center justify-between gap-2 text-xs" style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '4px 4px 0 var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="he-badge" style={{ background: 'var(--text-ink)', color: 'var(--bg-surface)' }}>RESEARCH &amp; ENGINEERING</span>
              <span className="font-display font-semibold text-sm" style={{ color: 'var(--text-ink)' }}>Forensic Architecture · Multi-Agent Swarm · Validation Laboratory</span>
            </div>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              KNOWLEDGE GRAPH · PSO SWARM · 11-ATTRIBUTE AUDIT · 50-CASE BENCHMARK
            </span>
          </div>
        )}

        {/* Primary Tab Routing (Human + Clinical) */}
        {activeTab === 'command' && (
          activeRole === 'patient' ? (
            <PatientPortalDashboard
              onNavigateTab={setActiveTab}
              onOpenVirtualDoctor={() => setActiveTab('virtual-doctor')}
              onOpenEditProfile={handleOpenEditProfile}
            />
          ) : (
            <CommandCenter onNavigateTab={setActiveTab} />
          )
        )}
        {activeTab === 'reports' && <ReportIntelligence />}
        {activeTab === 'timeline' && <HealthTimeline />}
        {activeTab === 'insights' && <ExplainWorkspace />}
        {activeTab === 'virtual-doctor' && (
          <AIVirtualSpecialistStudio onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'validation-harness' && <ClinicalValidationHarnessLaboratory />}
        {activeTab === 'recovery' && (
          activeRole === 'patient' ? (
            <CareFollowUpWorkspace onNavigateTab={setActiveTab} />
          ) : (
            <RecoveryJourney onNavigateTab={setActiveTab} />
          )
        )}
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

      {/* Real-Time Live Notification Banner (SSE Driven) */}
      <NotificationBanner />

      {/* Footer — editorial */}
      <footer className="mt-8 py-5" style={{ borderTop: '2px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="he-btn !shadow-brutal-xs !text-xs !px-2 !py-1 cursor-default" style={{ background: '#FFE45C' }}>HEAL ENGINE</span>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Longitudinal Clinical Decision Intelligence</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            <span className="he-badge he-badge-neutral">Human UX</span>
            <span>·</span>
            <span className="he-badge he-badge-neutral">Evidence Engine</span>
            <span>·</span>
            <span className="he-badge he-badge-neutral">Safety Checks</span>
            <span>·</span>
            <span style={{ color: 'var(--rule)' }}>v2.0.0</span>
          </div>
        </div>
      </footer>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyScreen onClose={() => setShowEmergencyModal(false)} />
      )}

      {/* Clinical Evidence & Provenance Inspector Modal */}
      <EvidenceProvenanceModal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
      />

      {/* Edit Patient Profile & Clinical Data Modal */}
      <EditPatientProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        initialTab={editProfileInitialTab}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGateway>
          <MainDashboard />
        </AuthGateway>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
