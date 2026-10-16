
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navigation } from './components/Navigation';
import { CommandCenter } from './components/CommandCenter';
import { UnderstandWorkspace } from './components/UnderstandWorkspace';
import { DetectWorkspace } from './components/DetectWorkspace';
import { ExplainWorkspace } from './components/ExplainWorkspace';
import { ProtectWorkspace } from './components/ProtectWorkspace';
import { DecideWorkspace } from './components/DecideWorkspace';
import { RecoveryJourney } from './components/RecoveryJourney';
import { CaseConferenceWorkspace } from './components/CaseConferenceWorkspace';
import { HealthTimeline } from './components/HealthTimeline';
import { ReportIntelligence } from './components/ReportIntelligence';
import { ClinicianPortal } from './components/ClinicianPortal';
import { ConsentAndAudit } from './components/ConsentAndAudit';
import { EmergencyScreen } from './components/EmergencyScreen';
import { ClinicalSummaryWorkspace } from './components/ClinicalSummaryWorkspace';
import { ClinicalConferenceEngine } from './engine/clinicalConferenceEngine';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthGateway } from './components/auth/AuthGateway';
import { Activity, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

// Public Marketing, Informational & Governance Components
import { PublicHeader } from './components/public/PublicHeader';
import { PublicFooter } from './components/public/PublicFooter';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { SpecialistsPage } from './components/public/SpecialistsPage';
import { TechnologyPage } from './components/public/TechnologyPage';
import { PrivacyPolicyPage } from './components/public/PrivacyPolicyPage';
import { TermsPage } from './components/public/TermsPage';
import { ContactPage } from './components/public/ContactPage';
import { CookieConsentBanner } from './components/public/CookieConsentBanner';
import { applyPageSeoMetadata, PUBLIC_ROUTES_METADATA } from './services/seoMetadata';
import { analyticsService } from './services/analytics';

// Code-split heavy clinical laboratory and 3D consultation workspaces
const AIVirtualSpecialistStudio = lazy(() => import('./components/AIVirtualSpecialistStudio').then(m => ({ default: m.AIVirtualSpecialistStudio })));
const ClinicalValidationHarnessLaboratory = lazy(() => import('./components/ClinicalValidationHarnessLaboratory').then(m => ({ default: m.ClinicalValidationHarnessLaboratory })));
const EndToEndWorkflowWorkspace = lazy(() => import('./components/EndToEndWorkflowWorkspace').then(m => ({ default: m.EndToEndWorkflowWorkspace })));
const SwarmIntelligenceWorkspace = lazy(() => import('./components/SwarmIntelligenceWorkspace').then(m => ({ default: m.SwarmIntelligenceWorkspace })));

import { PatientPortalDashboard } from './components/PatientPortalDashboard';
import { CareFollowUpWorkspace } from './components/CareFollowUpWorkspace';
import { EvidenceProvenanceModal } from './components/EvidenceProvenanceModal';
import { NotificationBanner } from './components/NotificationBanner';
import { EditPatientProfileModal, EditProfileTab } from './components/EditPatientProfileModal';
import { NotFoundRecoveryWorkspace } from './components/NotFoundRecoveryWorkspace';
import { useAuth } from './context/AuthContext';
import { getDynamicPatientProfile } from './data/mockPatientData';

const VALID_TABS = new Set([
  'command', 'reports', 'timeline', 'insights', 'virtual-doctor',
  'validation-harness', 'recovery', 'clinician-summary', 'workflow',
  'safety', 'conference', 'swarm', 'clinician', 'governance',
  'health', 'changes', 'decide'
]);

const conferenceEngine = new ClinicalConferenceEngine();

const MainDashboard: React.FC<{ onNavigatePublic?: (path: string) => void }> = ({ onNavigatePublic }) => {
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
        <Suspense fallback={
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="font-mono text-xs uppercase tracking-wider font-bold">Loading Clinical Workspace Module...</p>
          </div>
        }>
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

          {/* 404 Route / Workspace Fallback */}
          {!VALID_TABS.has(activeTab) && (
            <NotFoundRecoveryWorkspace
              onNavigateTab={setActiveTab}
              onTriggerEmergency={() => setShowEmergencyModal(true)}
              attemptedRoute={activeTab}
            />
          )}
        </Suspense>
      </main>

      {/* Real-Time Live Notification Banner (SSE Driven) */}
      <NotificationBanner />

      {/* Footer — editorial */}
      <footer className="mt-8 py-6" style={{ borderTop: '2px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('command')}
                className="he-btn !shadow-brutal-xs !text-xs !px-2.5 !py-1 cursor-pointer"
                style={{ background: '#FFE45C', color: '#080808' }}
                aria-label="Navigate to dashboard"
              >
                HEAL ENGINE
              </button>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Longitudinal Clinical Decision Intelligence OS</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              <button onClick={() => setActiveTab('safety')} className="hover:underline cursor-pointer">Safety Gates</button>
              <span>·</span>
              <button onClick={() => setActiveTab('governance')} className="hover:underline cursor-pointer">Audit &amp; DPDP</button>
              <span>·</span>
              {onNavigatePublic && (
                <>
                  <button onClick={() => onNavigatePublic('/about')} className="hover:underline cursor-pointer">About</button>
                  <span>·</span>
                  <button onClick={() => onNavigatePublic('/specialists')} className="hover:underline cursor-pointer">Specialists</button>
                  <span>·</span>
                  <button onClick={() => onNavigatePublic('/privacy')} className="hover:underline cursor-pointer">Privacy</button>
                  <span>·</span>
                  <button onClick={() => onNavigatePublic('/contact')} className="hover:underline cursor-pointer">Contact</button>
                  <span>·</span>
                </>
              )}
              <a href="tel:+18005554325" className="hover:underline inline-flex items-center gap-1" style={{ color: '#0D9488' }}>
                Emergency: 1-800-555-HEAL
              </a>
              <span>·</span>
              <a href="mailto:dpo@healengine.hospital.org" className="hover:underline inline-flex items-center gap-1" style={{ color: '#0D9488' }}>
                dpo@healengine.hospital.org
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono border-t pt-3" style={{ borderColor: 'var(--rule)', color: 'var(--text-muted)' }}>
            <div>
              <span>&copy; {new Date().getFullYear()} HEAL Health Systems. All clinical algorithms human-in-the-loop governed.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="he-badge he-badge-neutral">FHIR R4</span>
              <span className="he-badge he-badge-neutral">LOINC</span>
              <span className="he-badge he-badge-neutral">SNOMED CT</span>
              <span style={{ color: 'var(--text-muted)' }}>v2.5.0-governed</span>
            </div>
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

const RootApp: React.FC = () => {
  const { authState } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    let path = window.location.pathname.toLowerCase();
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    if (path === '/home') path = '/';
    return path || '/';
  });

  const navigateTo = (path: string) => {
    let normalized = path.toLowerCase();
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    if (normalized === '/home') normalized = '/';
    if (typeof window !== 'undefined' && window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentRoute(normalized);
    applyPageSeoMetadata(normalized);
    analyticsService.trackPublicPageView(normalized);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let path = window.location.pathname.toLowerCase();
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    if (path === '/home') path = '/';
    setCurrentRoute(path || '/');
    applyPageSeoMetadata(path || '/');
    analyticsService.init();
    analyticsService.trackPublicPageView(path || '/');

    const handlePopState = () => {
      let p = window.location.pathname.toLowerCase();
      if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
      if (p === '/home') p = '/';
      setCurrentRoute(p || '/');
      applyPageSeoMetadata(p || '/');
      analyticsService.trackPublicPageView(p || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isPublicRoute = Object.prototype.hasOwnProperty.call(PUBLIC_ROUTES_METADATA, currentRoute);

  if (isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#080808]">
        <PublicHeader
          currentPath={currentRoute}
          onNavigate={navigateTo}
          isAuthenticated={authState === 'AUTHENTICATED'}
          onLaunchApp={() => navigateTo('/app')}
        />
        <main className="flex-1">
          {currentRoute === '/' && (
            <HomePage
              onNavigate={navigateTo}
              onLaunchApp={() => navigateTo('/app')}
              isAuthenticated={authState === 'AUTHENTICATED'}
            />
          )}
          {currentRoute === '/about' && (
            <AboutPage
              onNavigate={navigateTo}
              onLaunchApp={() => navigateTo('/app')}
            />
          )}
          {currentRoute === '/specialists' && (
            <SpecialistsPage
              onNavigate={navigateTo}
              onLaunchApp={() => navigateTo('/app')}
            />
          )}
          {currentRoute === '/technology' && (
            <TechnologyPage
              onNavigate={navigateTo}
              onLaunchApp={() => navigateTo('/app')}
            />
          )}
          {currentRoute === '/privacy' && (
            <PrivacyPolicyPage onNavigate={navigateTo} />
          )}
          {currentRoute === '/terms' && (
            <TermsPage onNavigate={navigateTo} />
          )}
          {currentRoute === '/contact' && (
            <ContactPage onNavigate={navigateTo} />
          )}
        </main>
        <PublicFooter onNavigate={navigateTo} onLaunchApp={() => navigateTo('/app')} />
        <CookieConsentBanner onNavigate={navigateTo} />
      </div>
    );
  }

  // Otherwise, user is accessing the clinical application workspace
  return (
    <AuthGateway>
      <MainDashboard onNavigatePublic={navigateTo} />
    </AuthGateway>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
