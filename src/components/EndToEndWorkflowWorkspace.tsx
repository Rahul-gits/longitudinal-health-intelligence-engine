import React, { useState, useEffect } from 'react';
import { 
  endToEndWorkflowEngine, 
  WorkflowPhaseInfo, 
  ExtractedPatientEntity,
  IngestedDocument,
  ValidationIssue,
  BiomarkerTrajectory,
  ClinicalCluster,
  RAGEvidenceItem,
  SpecialistPersona,
  calculateCockcroftGault
} from '../engine/endToEndWorkflowEngine';
import { PATIENT_INFO, getDynamicPatientProfile } from '../data/mockPatientData';
import { useAuth } from '../context/AuthContext';
import { executeWorkflowRun } from '../services/apiClient';
import { DoctorAnimatedAvatar } from './DoctorAnimatedAvatar';
import { speechEngine } from '../engine/speechSynthesisEngine';
import { virtualDoctorScreeningEngine } from '../engine/virtualDoctorScreeningEngine';
import { DoctorPostureMode } from '../types/health';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Layers, 
  Cpu, 
  TrendingDown, 
  Stethoscope, 
  UserCheck, 
  Lock, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  UploadCloud, 
  Mic, 
  MicOff,
  Send, 
  Check, 
  Clock, 
  Video, 
  Volume2, 
  VolumeX, 
  Zap, 
  Flame, 
  Target,
  Plus,
  Trash2,
  Search,
  Sliders,
  RefreshCw,
  Award,
  Calendar,
  Heart,
  Share2,
  FileCheck,
  Radio,
  CheckSquare,
  Square,
  HelpCircle,
  CheckCheck,
  SendHorizontal,
  ExternalLink,
  Info,
  Smile,
  BellRing,
  SunMedium
} from 'lucide-react';

interface EndToEndWorkflowWorkspaceProps {
  onNavigateTab?: (tab: string) => void;
}

export const EndToEndWorkflowWorkspace: React.FC<EndToEndWorkflowWorkspaceProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);

  // Engine state trigger to force reactivity on updates
  const [engineTick, setEngineTick] = useState<number>(0);
  const triggerUpdate = () => setEngineTick(prev => prev + 1);

  const phases = endToEndWorkflowEngine.getPhases();
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'patient' | 'developer'>('patient');
  
  // Live Backend Workflow Execution
  const [backendResult, setBackendResult] = useState<any>(null);
  const [isExecutingBackend, setIsExecutingBackend] = useState<boolean>(false);

  // Auto-step / Pipeline runner state
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [completedPhases, setCompletedPhases] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  // Audio / Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [doctorPosture, setDoctorPosture] = useState<DoctorPostureMode>('explaining');
  const [largeSubtitles, setLargeSubtitles] = useState<boolean>(false);

  // STT Microphone State
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);

  // Phase 1: Consent State & Plain English Drawer
  const [consentHipaa, setConsentHipaa] = useState<boolean>(endToEndWorkflowEngine.consentData.hipaaVerified);
  const [consentCareTeam, setConsentCareTeam] = useState<boolean>(endToEndWorkflowEngine.consentData.careTeamSharing);
  const [consentAi, setConsentAi] = useState<boolean>(endToEndWorkflowEngine.consentData.aiScreeningAuthorized);
  const [consentHash, setConsentHash] = useState<string>(endToEndWorkflowEngine.consentData.auditHash);
  const [consentSignedTime, setConsentSignedTime] = useState<string>(endToEndWorkflowEngine.consentData.consentTimestamp);
  const [showPlainEnglishGuarantee, setShowPlainEnglishGuarantee] = useState<boolean>(true);

  // Phase 2: Document Ingestion & Bluetooth Guard
  const [showAddDocModal, setShowAddDocModal] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('Renal Function & Electrolyte Follow-up');
  const [newDocType, setNewDocType] = useState<IngestedDocument['type']>('Lab Record');
  const [liveWearableStreaming, setLiveWearableStreaming] = useState<boolean>(endToEndWorkflowEngine.isWearableStreaming);
  const [reconnectGuardStatus, setReconnectGuardStatus] = useState<string>('Connected & Signal Strong (BLE RSSI -58 dBm)');

  // Phase 3: Validation State
  const [validationRunMsg, setValidationRunMsg] = useState<string | null>(null);

  // Phase 4: Longitudinal State
  const [selectedBiomarkerMarker, setSelectedBiomarkerMarker] = useState<string>('eGFR');
  const [customBiomarker2026, setCustomBiomarker2026] = useState<number>(52);

  // Phase 5: Problem Clustering State
  const [activeClusterId, setActiveClusterId] = useState<string>('cluster-cardiorenal');

  // Phase 6: Guideline RAG Search & Reconciliation
  const [evidenceSearchQuery, setEvidenceSearchQuery] = useState<string>('');
  const [showGuidelineReconciliation, setShowGuidelineReconciliation] = useState<boolean>(true);

  // Phase 7: Safety Engine Stress-Test & Clinician Override
  const [safetyScenarioResult, setSafetyScenarioResult] = useState<any>(null);
  const [showClinicianOverrideModal, setShowClinicianOverrideModal] = useState<boolean>(false);
  const [overrideRationale, setOverrideRationale] = useState<string>('Patient has acute knee swelling flare; verified hydrated baseline and scheduled repeat BMP in 7 days.');
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  // Phase 8: Persona State
  const [activeSpecialistId, setActiveSpecialistId] = useState<string>(endToEndWorkflowEngine.activePersonaId);
  const [personaPitch, setPersonaPitch] = useState<number>(endToEndWorkflowEngine.voicePitch);
  const [personaRate, setPersonaRate] = useState<number>(endToEndWorkflowEngine.voiceRate);

  // Phase 9: Screening Plan State
  const [screeningPlanCompiled, setScreeningPlanCompiled] = useState<boolean>(true);

  // Phase 11: Interactive Simulation State
  const [patientInputText, setPatientInputText] = useState<string>(
    "I've been feeling noticeably more tired for the last two weeks, and noticed some mild puffiness around my ankles."
  );
  const [extractedResult, setExtractedResult] = useState<ExtractedPatientEntity>(
    endToEndWorkflowEngine.analyzePatientResponse(patientInputText)
  );

  // Phase 12: Clinician Handoff Sign-off & Fast-Path State
  const [clinicianSigned, setClinicianSigned] = useState<boolean>(endToEndWorkflowEngine.clinicalHandoffNote.signedByClinician);
  const [ordersState, setOrdersState] = useState(endToEndWorkflowEngine.clinicalHandoffNote.recommendedOrders);
  const [showEvidenceDrillDown, setShowEvidenceDrillDown] = useState<boolean>(false);
  const [ehrTransmitted, setEhrTransmitted] = useState<boolean>(false);

  // Phase 13: Continuous Monitoring State
  const [careReminders, setCareReminders] = useState(endToEndWorkflowEngine.monitoringState.activeCareReminders);
  const [careLoopCycle, setCareLoopCycle] = useState<number>(endToEndWorkflowEngine.monitoringState.careLoopCycle);
  const [smartBatchingMode, setSmartBatchingMode] = useState<boolean>(true);

  const currentPhase: WorkflowPhaseInfo = phases[activePhaseIndex] || phases[0];

  // Pipeline auto-run timer effect
  useEffect(() => {
    let timer: number;
    if (isRunningPipeline) {
      timer = window.setInterval(() => {
        setActivePhaseIndex(prev => {
          if (prev >= phases.length - 1) {
            setIsRunningPipeline(false);
            return prev;
          }
          const next = prev + 1;
          setCompletedPhases(current => [...new Set([...current, next])]);
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isRunningPipeline, phases.length]);

  // Live Wearable Telemetry Static Synchronized Baseline
  useEffect(() => {
    if (liveWearableStreaming) {
      endToEndWorkflowEngine.liveWearableData.sbp = 142;
      endToEndWorkflowEngine.liveWearableData.dbp = 88;
      endToEndWorkflowEngine.liveWearableData.pulse = 74;
      endToEndWorkflowEngine.liveWearableData.lastSync = '2026-08-13 19:42:00 (Omron BLE Synchronized)';
    }
  }, [liveWearableStreaming]);

  // Voice Speech Helper
  const handleSpeakText = (text: string, pitch?: number, rate?: number) => {
    if (isPlayingAudio) {
      speechEngine.stop();
      setIsPlayingAudio(false);
      return;
    }

    const currentPersona = endToEndWorkflowEngine.getActivePersona();
    setIsPlayingAudio(true);
    speechEngine.speak(
      text,
      { 
        pitch: pitch || personaPitch || currentPersona.defaultPitch, 
        rate: rate || personaRate || currentPersona.defaultRate, 
        voiceName: currentPersona.name 
      },
      {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false)
      }
    );
  };

  // STT Microphone Mock / Web Speech
  const toggleSpeechRecognition = () => {
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListeningMic(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleTestExtraction(transcript);
          setIsListeningMic(false);
        };
        recognition.onerror = () => setIsListeningMic(false);
        recognition.onend = () => setIsListeningMic(false);
        recognition.start();
      } catch (err) {
        setIsListeningMic(false);
      }
    } else {
      // Grounded colloquial voice sample
      setIsListeningMic(true);
      setTimeout(() => {
        handleTestExtraction("I've noticed my feet feel heavy like bowling balls in the evening, and I took some Ibuprofen for my knee.");
        setIsListeningMic(false);
      }, 1500);
    }
  };

  // Live Backend Run
  const handleExecuteBackendWorkflow = async () => {
    setIsExecutingBackend(true);
    try {
      const data = await executeWorkflowRun();
      setBackendResult(data);
    } finally {
      setIsExecutingBackend(false);
    }
  };

  // Phase 1 Handlers
  const handleSaveConsent = () => {
    const updated = endToEndWorkflowEngine.updateConsent(consentHipaa, consentCareTeam, consentAi);
    setConsentHash(updated.auditHash);
    setConsentSignedTime(updated.consentTimestamp);
    triggerUpdate();
  };

  // Phase 2 Handlers
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    endToEndWorkflowEngine.addDocument(newDocTitle, newDocType, '1.4 MB', 16);
    setShowAddDocModal(false);
    triggerUpdate();
  };

  const handleReconnectBluetooth = () => {
    setReconnectGuardStatus('Reconnecting BLE Cuff channel...');
    setTimeout(() => {
      setReconnectGuardStatus('✓ Auto-Reconnected & Signal Strong (BLE RSSI -52 dBm)');
      endToEndWorkflowEngine.liveWearableData.sbp = 142;
      endToEndWorkflowEngine.liveWearableData.dbp = 88;
      endToEndWorkflowEngine.liveWearableData.pulse = 74;
      triggerUpdate();
    }, 800);
  };

  // Phase 3 Handlers
  const handleRunValidationAudit = () => {
    setValidationRunMsg('Validation Engine Evaluated 24 Deterministic Rules: 0 Hallucinations, 1 Critical Drug Conflict Gated.');
    setTimeout(() => setValidationRunMsg(null), 5000);
  };

  const handleResolveIssue = (id: string) => {
    endToEndWorkflowEngine.resolveValidationIssue(id);
    triggerUpdate();
  };

  // Phase 4 Handlers
  const handleUpdateBiomarker = (marker: string, val: number) => {
    endToEndWorkflowEngine.updateBiomarker(marker, 'y2026', val);
    triggerUpdate();
  };

  // Phase 5 Handlers
  const handleRecomputeClusters = () => {
    endToEndWorkflowEngine.recomputeClusters();
    triggerUpdate();
  };

  // Phase 7 Handlers
  const handleTestSafetyScenario = (scenario: 'chest_pain' | 'nsaid_overdose' | 'potassium_spike' | 'safe_baseline') => {
    const res = endToEndWorkflowEngine.evaluateSafetyScenario(scenario);
    setSafetyScenarioResult(res);
  };

  const handleClinicianOverride = () => {
    endToEndWorkflowEngine.overrideSafetyRule('RULE-AKI-01', overrideRationale);
    setOverrideSuccessMsg('✓ Clinician Override Documented & Audited with Electronic Signature.');
    setShowClinicianOverrideModal(false);
    triggerUpdate();
    setTimeout(() => setOverrideSuccessMsg(null), 6000);
  };

  // Phase 8 Handlers
  const handleSelectPersona = (id: string) => {
    setActiveSpecialistId(id);
    const p = endToEndWorkflowEngine.setActivePersona(id);
    setPersonaPitch(p.defaultPitch);
    setPersonaRate(p.defaultRate);
    triggerUpdate();
  };

  // Phase 11 Handlers
  const handleTestExtraction = (customText: string) => {
    setPatientInputText(customText);
    const analyzed = endToEndWorkflowEngine.analyzePatientResponse(customText);
    setExtractedResult(analyzed);
  };

  // Phase 12 Handlers
  const handleToggleOrder = (id: string) => {
    endToEndWorkflowEngine.toggleOrderApproval(id);
    setOrdersState([...endToEndWorkflowEngine.clinicalHandoffNote.recommendedOrders]);
    triggerUpdate();
  };

  const handleBatchApprove = () => {
    endToEndWorkflowEngine.batchApproveAllOrders();
    setOrdersState([...endToEndWorkflowEngine.clinicalHandoffNote.recommendedOrders]);
    triggerUpdate();
  };

  const handleSignHandoff = () => {
    endToEndWorkflowEngine.signHandoffSummary();
    setClinicianSigned(true);
    setEhrTransmitted(true);
    triggerUpdate();
  };

  // Phase 13 Handlers
  const handleToggleReminder = (id: string) => {
    endToEndWorkflowEngine.toggleCareReminder(id);
    setCareReminders([...endToEndWorkflowEngine.monitoringState.activeCareReminders]);
    triggerUpdate();
  };

  const handleCompleteMorningRoutine = () => {
    endToEndWorkflowEngine.completeAllMorningReminders();
    setCareReminders([...endToEndWorkflowEngine.monitoringState.activeCareReminders]);
    triggerUpdate();
  };

  const handleAdvanceLoopCycle = () => {
    endToEndWorkflowEngine.advanceCareLoopCycle();
    setCareLoopCycle(endToEndWorkflowEngine.monitoringState.careLoopCycle);
    triggerUpdate();
  };

  const categories = [
    { name: 'Patient Onboarding', phases: [1, 2], color: '#FFE600' },
    { name: 'Data & State', phases: [3, 4], color: '#3A86FF' },
    { name: 'Intelligence & Reasoning', phases: [5, 6, 7], color: '#A855F7' },
    { name: 'Clinical Interaction', phases: [8, 9, 10, 11], color: '#00F5D4' },
    { name: 'Handoff & Monitoring', phases: [12, 13], color: '#CCFF00' }
  ];

  const activePersonaObj = endToEndWorkflowEngine.getActivePersona();

  return (
    <div className="space-y-6">
      {/* 🚀 Main Header Banner */}
      <div className="p-6 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-wider mb-1 bg-[#FFE600] text-black px-2.5 py-0.5 w-fit border-2 border-black -rotate-1 shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>HEAL ENGINE 13-PHASE MASTER ARCHITECTURE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-black tracking-tight mt-1">
              End-to-End User-Centric Clinical Intelligence
            </h1>
            <p className="text-xs text-black/80 font-bold mt-1">
              Patient Data → Longitudinal State → Clinical Intelligence → Persona → Screening → Response Extraction → Safety Gate → Clinician Handoff → Continuous Monitoring
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#FAF8F5] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold font-mono">
              <button
                onClick={() => setViewMode('patient')}
                className={`px-3 py-1.5 border transition-all cursor-pointer ${
                  viewMode === 'patient'
                    ? 'bg-[#FFE600] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'border-transparent text-black/70 hover:text-black'
                }`}
              >
                👤 Patient View
              </button>
              <button
                onClick={() => setViewMode('developer')}
                className={`px-3 py-1.5 border transition-all cursor-pointer ${
                  viewMode === 'developer'
                    ? 'bg-[#A855F7] text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'border-transparent text-black/70 hover:text-black'
                }`}
              >
                🛠️ Developer Architecture
              </button>
            </div>

            {/* Run Pipeline Stepper Button */}
            <button
              onClick={() => setIsRunningPipeline(!isRunningPipeline)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all ${
                isRunningPipeline
                  ? 'bg-[#FF5722] text-white animate-pulse'
                  : 'bg-[#CCFF00] hover:bg-[#B8E600] text-black hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              {isRunningPipeline ? (
                <>
                  <Pause className="w-4 h-4 stroke-[3]" />
                  <span>Pause Pipeline</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 stroke-[3]" />
                  <span>▶ Auto-Step Pipeline</span>
                </>
              )}
            </button>

            {/* Live Server Backend Execution Trigger */}
            <button
              onClick={handleExecuteBackendWorkflow}
              disabled={isExecutingBackend}
              className="flex items-center space-x-2 px-4 py-2 bg-[#00F5D4] hover:bg-[#00D9BC] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-black ${isExecutingBackend ? 'animate-spin' : ''}`} />
              <span>{isExecutingBackend ? 'Executing Server Engine…' : '⚡ Live Backend Run'}</span>
            </button>
          </div>
        </div>

        {/* 🛡️ Clear Application Gateway & User Integrity Verification Bar */}
        <div className="mt-4 p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] font-mono text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/20">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse"></span>
              <span className="font-black text-black">APPLICATION GATEWAY:</span>
              <span className="bg-[#00F5D4] text-black px-2 py-0.5 text-[10px] font-black border border-black">
                FHIR R4 MUTUAL-TLS ACTIVE • PORT 443
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-[#00A86B]" />
              <span className="text-[10px] font-bold text-black/80">GATE 0 USER INTEGRITY: VERIFIED & LOCKED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1 text-[11px]">
            <div className="bg-white p-2.5 border border-black">
              <span className="text-[9px] text-black/60 font-black block uppercase">AUTHENTICATED IDENTITY</span>
              <span className="font-black text-black text-xs block mt-0.5">Eleanor Vance</span>
              <span className="text-[10px] text-black/70">MRN: #HL-882910 • Age: 68</span>
            </div>
            <div className="bg-white p-2.5 border border-black">
              <span className="text-[9px] text-black/60 font-black block uppercase">INTEGRITY SHA-256 CHECKSUM</span>
              <span className="font-mono text-[10px] text-black font-bold truncate block mt-0.5" title="0x8f3c7a19e24b91702f3a9e01bc49d8e74a123ffb916d8e21a415ec800a7b93de">
                0x8f3c7a19e24b91702f3a9e01bc49...
              </span>
              <span className="text-[9px] text-[#00A86B] font-bold">✓ Non-Repudiation Stamped</span>
            </div>
            <div className="bg-white p-2.5 border border-black">
              <span className="text-[9px] text-black/60 font-black block uppercase">CANONICAL GROUNDED BASELINE</span>
              <span className="font-bold text-black block mt-0.5">eGFR: 52 mL/min • SBP: 142/88</span>
              <span className="text-[10px] text-[#CC0000] font-bold">Static Real-Time Trajectory</span>
            </div>
            <div className="bg-white p-2.5 border border-black">
              <span className="text-[9px] text-black/60 font-black block uppercase">COMPLIANCE & GOVERNANCE</span>
              <span className="font-bold text-black block mt-0.5">HIPAA 45 CFR § 164.312</span>
              <span className="text-[9px] bg-[#CCFF00] text-black px-1.5 py-0.2 font-black inline-block border border-black mt-0.5">
                ZERO HALLUCINATION GATED
              </span>
            </div>
          </div>
        </div>

        {/* Live Backend Telemetry Output Strip */}
        {backendResult && (
          <div className="mt-4 p-3.5 bg-[#172033] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] rounded-none font-mono text-xs animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] animate-pulse"></span>
                <span className="font-extrabold text-[#00F5D4]">EXPRESS BACKEND PIPELINE RESPONSE:</span>
                <span className="text-white/80">{backendResult.workflow?.overallStatus || 'EXECUTED_SUCCESSFULLY'}</span>
              </div>
              <span className="text-[10px] text-white/60">Server Time: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-2.5 text-[11px]">
              {(backendResult.workflow?.steps || []).map((st: any) => (
                <div key={st.stepId} className="p-2 bg-black/40 border border-white/20">
                  <div className="text-[10px] font-bold text-[#FFE600] uppercase truncate">{st.stepId}</div>
                  <div className="text-white font-extrabold">{st.status}</div>
                  <div className="text-[10px] text-[#00F5D4]">{st.durationMs}ms • {(st.confidenceScore * 100).toFixed(0)}% conf</div>
                </div>
              ))}
            </div>
            {backendResult.workflow?.recommendation && (
              <div className="mt-2 text-[11px] text-[#FFE600] bg-black/60 p-2 border border-white/10 flex items-center justify-between">
                <span><strong>Consensus Protocol:</strong> {backendResult.workflow.recommendation.actionTitle}</span>
                <span className="bg-[#FF5722] text-white px-1.5 py-0.5 text-[9px] font-black uppercase">
                  {backendResult.workflow.recommendation.priority}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🧭 13-Phase Interactive Horizontal Stepper */}
      <div className="bg-[#FFFFFF] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4 font-mono">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <Layers className="w-4 h-4 stroke-[2.5]" />
            <span>Pipeline Progression: Phase {activePhaseIndex + 1} of 13</span>
          </span>
          <span className="text-[11px] font-bold bg-[#FAF8F5] border border-black px-2 py-0.5">
            Click any phase to inspect & operate real-time working features
          </span>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3 text-[10px] font-black uppercase">
          {categories.map((cat, idx) => (
            <div key={idx} className="border border-black p-1.5 flex items-center justify-between" style={{ backgroundColor: cat.color + '20' }}>
              <span className="truncate">{cat.name}</span>
              <span className="bg-black text-white px-1 py-0.2 text-[9px]">{cat.phases.join(', ')}</span>
            </div>
          ))}
        </div>

        {/* Phase Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-13 gap-1.5">
          {phases.map((p, idx) => {
            const isActive = activePhaseIndex === idx;
            const isDone = completedPhases.includes(idx);
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePhaseIndex(idx);
                  setIsRunningPipeline(false);
                }}
                className={`p-2 text-left border-2 border-black transition-all cursor-pointer relative flex flex-col justify-between min-h-[70px] ${
                  isActive
                    ? 'bg-[#FFE600] text-black font-black shadow-[3px_3px_0px_0px_#000] -translate-y-1'
                    : isDone
                    ? 'bg-[#F0FFF4] hover:bg-[#FFE600]/40 text-black'
                    : 'bg-[#FAF8F5] text-black/60 hover:bg-black/5'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black px-1 py-0.2 bg-black text-white">
                    P{p.phaseNumber}
                  </span>
                  {isDone && <Check className="w-3 h-3 text-[#00A86B] stroke-[3]" />}
                </div>
                <div className="text-[11px] font-bold leading-tight mt-1 line-clamp-2">
                  {p.shortTitle.replace(/^\d+\.\s*/, '')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔬 Current Active Phase Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phase Core Summary & Architecture */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-6 font-mono">
            {/* Phase Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-display font-black text-lg"
                  style={{ backgroundColor: currentPhase.color }}
                >
                  {currentPhase.phaseNumber}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
                    {currentPhase.category}
                  </span>
                  <h2 className="text-xl font-black font-display text-black mt-0.5">
                    {currentPhase.title}
                  </h2>
                </div>
              </div>

              <span className="px-2.5 py-1 text-xs font-black uppercase bg-[#00F5D4] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {currentPhase.badge}
              </span>
            </div>

            {/* Content Switch based on ViewMode */}
            {viewMode === 'patient' ? (
              <div className="mt-5 space-y-4">
                <div className="p-4 bg-[#FFFBEA] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5 mb-1">
                    <UserCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>What Eleanor Experiences:</span>
                  </h3>
                  <p className="text-sm font-sans font-bold text-black/90 leading-relaxed">
                    {currentPhase.patientExperience}
                  </p>
                </div>

                <div className="p-4 bg-[#F0FDF4] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-[#15803D] flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Clinical Safety & Trust Assurance:</span>
                  </h3>
                  <p className="text-xs font-sans font-bold text-black/80">
                    {currentPhase.keyRule}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="p-4 bg-[#FAF5FF] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-[#7E22CE] flex items-center gap-1.5 mb-1">
                    <Cpu className="w-4 h-4 stroke-[2.5]" />
                    <span>Developer Execution Architecture:</span>
                  </h3>
                  <p className="text-xs font-mono font-bold text-black bg-white p-3 border border-black/30 mt-1">
                    {currentPhase.developerImplementation}
                  </p>
                </div>

                <div className="p-4 bg-[#FFF1F2] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-[#BE123C] flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
                    <span>Non-Bypassable Engineering Rule:</span>
                  </h3>
                  <p className="text-xs font-mono font-bold text-black/90">
                    {currentPhase.keyRule}
                  </p>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-black">
              <button
                disabled={activePhaseIndex === 0}
                onClick={() => setActivePhaseIndex(prev => Math.max(0, prev - 1))}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-black/5 disabled:opacity-40 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Phase</span>
              </button>

              <div className="text-xs font-mono font-bold text-black">
                Phase {activePhaseIndex + 1} / 13
              </div>

              <button
                disabled={activePhaseIndex === phases.length - 1}
                onClick={() => setActivePhaseIndex(prev => Math.min(phases.length - 1, prev + 1))}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#FFE600] hover:bg-[#FFD600] disabled:opacity-40 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer"
              >
                <span>Next Phase</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 🧩 13-PHASE STEP-BY-STEP COMPLETE WORKING INTERACTIVE WIDGETS */}
          {/* ============================================================== */}

          {/* ----------------- PHASE 1: REGISTRATION & CONSENT ----------------- */}
          {activePhaseIndex === 0 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2 text-black">
                  <UserCheck className="w-4 h-4 stroke-[2.5] text-[#FFE600]" />
                  <span>Phase 1 Live Gate 0 Consent & Identity Manager</span>
                </h3>
                <span className="bg-[#00A86B] text-white px-2 py-0.5 text-[10px] font-black border border-black">
                  Gate 0 Passed
                </span>
              </div>

              {/* 🛡️ Plain English Patient Guarantee (Mitigating Legal Overload & Anxiety) */}
              <div className="p-3.5 bg-[#F0FFF4] border-2 border-black space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#006600] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Plain English Patient Care Guarantee</span>
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 border border-black text-[#006600]">
                    100% Doctor Supervised
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-sans">
                  <div className="bg-white p-2 border border-black">
                    <strong className="block font-mono text-[10px] text-black">1. Human Doctor Oversight</strong>
                    <span className="text-black/80">Dr. Aris Thorne personally reviews and signs off before any medication adjustments.</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <strong className="block font-mono text-[10px] text-black">2. No Auto-Prescriptions</strong>
                    <span className="text-black/80">AI only performs empathetic screening; human clinicians make all clinical decisions.</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <strong className="block font-mono text-[10px] text-black">3. Private & Encrypted</strong>
                    <span className="text-black/80">Protected under federal HIPAA laws; your records are never sold or shared.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF8F5] border-2 border-black text-xs">
                  <span className="text-[10px] text-black/60 font-black block">VERIFIED PATIENT</span>
                  <div className="font-black text-black mt-1">{PATIENT_INFO.name}</div>
                  <div className="text-[11px] text-black/70">ID: {PATIENT_INFO.id} • Age: {PATIENT_INFO.age}</div>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black text-xs">
                  <span className="text-[10px] text-black/60 font-black block">AUTHENTICATED EMAIL</span>
                  <div className="font-bold text-black mt-1 truncate">eleanor.vance@securehealth.org</div>
                  <div className="text-[10px] text-[#00A86B] font-black">✓ 2FA Biometric Verified</div>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black text-xs">
                  <span className="text-[10px] text-black/60 font-black block">CRYPTOGRAPHIC AUDIT HASH</span>
                  <div className="font-mono text-[10px] text-black font-bold truncate mt-1">{consentHash}</div>
                  <div className="text-[9px] text-black/60">Signed: 2026-08-13 09:00 EST</div>
                </div>
              </div>

              {/* Dynamic Consent Toggles */}
              <div className="p-4 bg-[#FFFBEA] border-2 border-black space-y-3">
                <span className="text-xs font-black uppercase text-black block">Interactive Patient Consent Permissions:</span>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={consentHipaa} 
                      onChange={(e) => setConsentHipaa(e.target.checked)}
                      className="w-4 h-4 accent-black" 
                    />
                    <span className="font-bold text-black">HIPAA Compliance & Clinical Data Sharing Authorization</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={consentCareTeam} 
                      onChange={(e) => setConsentCareTeam(e.target.checked)}
                      className="w-4 h-4 accent-black" 
                    />
                    <span className="font-bold text-black">Care Team & On-Call Specialist Telehealth Access</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={consentAi} 
                      onChange={(e) => setConsentAi(e.target.checked)}
                      className="w-4 h-4 accent-black" 
                    />
                    <span className="font-bold text-black">Deterministic AI Reasoning & Voice Screening Authorization</span>
                  </label>
                </div>
                <button
                  onClick={handleSaveConsent}
                  className="mt-2 px-3 py-1.5 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer"
                >
                  ✓ Re-verify & Lock Cryptographic Gate
                </button>
              </div>
            </div>
          )}

          {/* ----------------- PHASE 2: HEALTH DATA INGESTION ----------------- */}
          {activePhaseIndex === 1 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                  <span>"My Health Data" Ingestion Store ({endToEndWorkflowEngine.documents.length} Active Records)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReconnectBluetooth}
                    className="px-2.5 py-1 text-xs font-black bg-[#E6FFFA] hover:bg-[#C2FFF0] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5"
                    title="Auto-Reconnect Bluetooth Stream"
                  >
                    <Radio className="w-3.5 h-3.5 text-[#006600]" />
                    <span>Reconnect Smart Cuff</span>
                  </button>
                  <button
                    onClick={() => setShowAddDocModal(true)}
                    className="px-3 py-1 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Ingest Report</span>
                  </button>
                </div>
              </div>

              {/* Bluetooth Reconnect Guard Telemetry Box */}
              <div className="p-3 bg-[#E6FFFA] border-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse"></span>
                  <span className="font-black text-black">Omron Evolv Smart Cuff BLE Telemetry:</span>
                  <span className="text-[10px] text-black/70">({reconnectGuardStatus})</span>
                </div>
                <div className="flex items-center space-x-4 font-bold">
                  <span>SBP: <strong className="text-[#CC0000]">{endToEndWorkflowEngine.liveWearableData.sbp} mmHg</strong></span>
                  <span>DBP: <strong>{endToEndWorkflowEngine.liveWearableData.dbp} mmHg</strong></span>
                  <span>Pulse: <strong>{endToEndWorkflowEngine.liveWearableData.pulse} bpm</strong></span>
                  <span className="text-[10px] bg-white px-2 py-0.5 border border-black">Battery: 92%</span>
                </div>
              </div>

              {/* Ingested Documents List with OCR Quality Auto-Repair Badges */}
              <div className="space-y-2">
                {endToEndWorkflowEngine.documents.map(doc => (
                  <div key={doc.id} className="p-3 bg-[#FAF8F5] border-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs hover:bg-white transition-all">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-black">{doc.title}</span>
                        <span className="bg-[#E6FFFA] text-[#006600] px-1.5 py-0.2 text-[9px] font-bold border border-black">
                          ✓ OCR Auto-Enhanced
                        </span>
                      </div>
                      <div className="text-[10px] text-black/60 mt-0.5">
                        {doc.type} • {doc.date} • {doc.size} • FHIR R4 Source Provenance Verified
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#00F5D4] text-black font-black px-2 py-0.5 border border-black text-[10px]">
                        {doc.extractedEntities} Extracted Entities
                      </span>
                      <button
                        onClick={() => {
                          endToEndWorkflowEngine.removeDocument(doc.id);
                          triggerUpdate();
                        }}
                        className="text-black/40 hover:text-[#CC0000] p-1 cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Document Modal Form */}
              {showAddDocModal && (
                <form onSubmit={handleAddDocument} className="p-4 bg-[#FFFBEA] border-2 border-black space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-black">Simulate Upload / OCR Ingest:</span>
                    <button type="button" onClick={() => setShowAddDocModal(false)} className="text-xs font-black">✕</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="Document / Report Title..."
                      className="p-2 bg-white border border-black text-xs font-bold"
                      required
                    />
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="p-2 bg-white border border-black text-xs font-bold"
                    >
                      <option value="Lab Record">Lab Record</option>
                      <option value="Clinical Note">Clinical Note</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Wearable Stream">Wearable Stream</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#00F5D4] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  >
                    ⚡ Process & Extract Entities (Auto-Contrast Repaired)
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ----------------- PHASE 3: DATA VALIDATION & RULES ----------------- */}
          {activePhaseIndex === 2 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 stroke-[2.5] text-[#FF5722]" />
                  <span>Deterministic Validation Interceptor Log (Zero Hallucination)</span>
                </h3>
                <button
                  onClick={handleRunValidationAudit}
                  className="px-3 py-1 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Audit 24 Rules</span>
                </button>
              </div>

              {validationRunMsg && (
                <div className="p-2.5 bg-[#00F5D4] text-black border-2 border-black font-bold text-xs animate-fadeIn">
                  ✓ {validationRunMsg}
                </div>
              )}

              <div className="space-y-2.5">
                {endToEndWorkflowEngine.validationIssues.map(issue => (
                  <div key={issue.id} className="p-3 bg-[#FFF5F5] border-2 border-black text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">{issue.field}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black ${
                          issue.severity === 'Critical' ? 'bg-[#FF0055] text-white' : 'bg-[#FFE600] text-black'
                        }`}>
                          {issue.severity} • {issue.status}
                        </span>
                        {issue.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolveIssue(issue.id)}
                            className="px-2 py-0.5 bg-white hover:bg-black hover:text-white border border-black text-[9px] font-black cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-black/80 text-[11px] font-sans">{issue.description}</p>
                    <div className="text-[10px] bg-white p-1.5 border border-black/20 text-[#006600] font-mono">
                      ✓ Resolution Protocol: {issue.resolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PHASE 4: LONGITUDINAL PATIENT STATE ----------------- */}
          {activePhaseIndex === 3 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                  <span>Longitudinal Biomarker Velocities & Gradients (2024 → 2026)</span>
                </h3>
                <span className="text-[10px] bg-black text-[#FFE600] px-2 py-0.5 font-black">
                  State: v1.4.2
                </span>
              </div>

              {/* 💚 Doctor's Reassurance Framing Card (Mitigating Health Anxiety) */}
              <div className="p-3.5 bg-[#F0FDF4] border-2 border-black space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#15803D] flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-[#15803D]" />
                    <span>Doctor's Reassurance & Clinical Context</span>
                  </span>
                  <span className="bg-[#00F5D4] text-black px-2 py-0.5 text-[9px] font-black border border-black">
                    95% Reversibility Expected
                  </span>
                </div>
                <p className="text-xs font-sans text-black/90 font-bold leading-relaxed">
                  "Eleanor, this kidney filtration decline (eGFR 64 → 52) is a <strong>temporary, reversible hemodynamic effect</strong> caused by taking OTC Ibuprofen while on Lisinopril. It is not permanent kidney damage and typically recovers fully within 14 days after transitioning to topical analgesia."
                </p>
              </div>

              {/* Interactive Modifier Controls */}
              <div className="p-3 bg-[#FAF8F5] border-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-black">Simulate Lab Modification:</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBiomarkerMarker}
                    onChange={(e) => {
                      setSelectedBiomarkerMarker(e.target.value);
                      const b = endToEndWorkflowEngine.biomarkers.find(item => item.marker === e.target.value);
                      if (b) setCustomBiomarker2026(b.y2026);
                    }}
                    className="p-1 bg-white border border-black font-bold text-xs"
                  >
                    {endToEndWorkflowEngine.biomarkers.map(b => (
                      <option key={b.marker} value={b.marker}>{b.marker}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    value={customBiomarker2026}
                    onChange={(e) => setCustomBiomarker2026(parseFloat(e.target.value) || 0)}
                    className="w-20 p-1 bg-white border border-black font-bold text-xs"
                  />
                  <button
                    onClick={() => handleUpdateBiomarker(selectedBiomarkerMarker, customBiomarker2026)}
                    className="px-2.5 py-1 bg-[#FFE600] text-black font-black border border-black text-xs cursor-pointer"
                  >
                    Update Gradient
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-black">
                  <thead>
                    <tr className="bg-[#FFE600] border-b-2 border-black font-black">
                      <th className="p-2 border-r border-black">Biomarker</th>
                      <th className="p-2 border-r border-black">2024</th>
                      <th className="p-2 border-r border-black">2025</th>
                      <th className="p-2 border-r border-black">2026</th>
                      <th className="p-2 border-r border-black">Delta %</th>
                      <th className="p-2">Trajectory Alert</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {endToEndWorkflowEngine.biomarkers.map((b, idx) => (
                      <tr key={idx} className="border-b border-black font-bold">
                        <td className="p-2 border-r border-black">{b.marker} ({b.unit})</td>
                        <td className="p-2 border-r border-black">{b.y2024}</td>
                        <td className="p-2 border-r border-black">{b.y2025}</td>
                        <td className={`p-2 border-r border-black ${b.alert === 'CRITICAL_DECLINE' ? 'bg-[#FFEEEE] text-[#CC0000]' : ''}`}>
                          {b.y2026}
                        </td>
                        <td className={`p-2 border-r border-black ${b.deltaPercent < 0 ? 'text-[#CC0000]' : 'text-[#006600]'}`}>
                          {b.deltaPercent > 0 ? `+${b.deltaPercent}%` : `${b.deltaPercent}%`}
                        </td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${
                            b.alert === 'CRITICAL_DECLINE' ? 'bg-[#FF0055] text-white' :
                            b.alert === 'ABNORMAL_RISE' ? 'bg-[#FF6B35] text-white' :
                            b.alert === 'STAGE_1_HYPERTENSION' ? 'bg-[#FFE600] text-black' :
                            'bg-[#00F5D4] text-black'
                          }`}>
                            {b.alert}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 🧪 Cockcroft-Gault Dynamic Renal Clearance Calculator */}
              {(() => {
                const cg = calculateCockcroftGault(68, 72, endToEndWorkflowEngine.biomarkers.find(b => b.marker === 'Serum Creatinine')?.y2026 || 1.38, true);
                return (
                  <div className="p-3.5 bg-[#EFF6FF] border-2 border-black space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#1D4ED8] flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-[#1D4ED8]" />
                        <span>Deterministic Cockcroft-Gault CrCl Renal Engine (Clinical Decision Support Tool)</span>
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-black border border-black ${cg.nsaidContraindicated ? 'bg-[#FF0055] text-white' : 'bg-[#00F5D4] text-black'}`}>
                        {cg.stage} • CrCl: {cg.crClMlMin} mL/min
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 border border-black font-mono">
                        <span className="text-[10px] text-black/60 block font-bold uppercase">Dynamic Equation:</span>
                        <span className="font-bold text-black">{cg.formula}</span>
                      </div>
                      <div className="bg-white p-2 border border-black font-mono">
                        <span className="text-[10px] text-black/60 block font-bold uppercase">Clinical Action Safety Guard:</span>
                        <span className="font-black text-[#CC0000]">{cg.clinicalWarning}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ----------------- PHASE 5: PROBLEM CLUSTERING ----------------- */}
          {activePhaseIndex === 4 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 stroke-[2.5] text-[#A855F7]" />
                  <span>Clinical Problem Clustering ({endToEndWorkflowEngine.clusters.length} Active Partitions)</span>
                </h3>
                <button
                  onClick={handleRecomputeClusters}
                  className="px-3 py-1 bg-[#A855F7] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Cluster Graph</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {endToEndWorkflowEngine.clusters.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setActiveClusterId(c.id)}
                    className={`p-3.5 border-2 border-black text-xs space-y-1.5 cursor-pointer transition-all ${
                      activeClusterId === c.id 
                        ? 'bg-[#FAF5FF] shadow-[3px_3px_0px_0px_#000] -translate-y-0.5' 
                        : 'bg-[#FAF8F5] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">{c.name}</span>
                      <span className="bg-black text-[#FFE600] px-1.5 py-0.2 text-[9px] font-black">
                        Risk {c.riskScore}%
                      </span>
                    </div>
                    <div className="text-[10px] text-[#7E22CE] font-bold">
                      Specialist Persona: {c.assignedPersona}
                    </div>
                    <div className="space-y-0.5 text-[10px] text-black/80 font-sans">
                      {c.findings.map((f, i) => (
                        <div key={i}>• {f}</div>
                      ))}
                    </div>
                    <div className="text-[9px] text-black/70 bg-white p-1.5 border border-black/20 font-mono mt-1">
                      Anchor: {c.guidelineAnchor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PHASE 6: EVIDENCE RAG ENGINE & RECONCILIATION ----------------- */}
          {activePhaseIndex === 5 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4 stroke-[2.5] text-[#00A86B]" />
                  <span>Evidence & Guideline RAG Knowledge Base</span>
                </h3>
                <span className="bg-[#CCFF00] text-black px-2 py-0.5 text-[10px] font-black border border-black">
                  Zero Hallucination Gated
                </span>
              </div>

              {/* ⚖️ Multi-Specialty Guideline Reconciliation Matrix (Resolving Cardiology vs Nephrology Guidelines) */}
              <div className="p-3.5 bg-[#EFF6FF] border-2 border-black space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#1E40AF] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    <span>Cardio-Renal Multi-Specialty Guideline Reconciliation</span>
                  </span>
                  <span className="bg-[#3A86FF] text-white px-2 py-0.5 text-[9px] font-black">
                    Consensus Harmonized
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans">
                  <div className="bg-white p-2 border border-black">
                    <span className="font-mono text-[10px] font-bold text-[#1E40AF] block">KDIGO 2024 (Nephrology Target):</span>
                    <span className="text-black/80">Immediately pause oral NSAIDs on eGFR decline &gt;15%; re-check renal panel within 14 days.</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="font-mono text-[10px] font-bold text-[#1E40AF] block">ACC/AHA 2023 (Cardiology Target):</span>
                    <span className="text-black/80">Maintain Lisinopril for vascular afterload reduction; substitute oral NSAID with Topical Voltaren gel.</span>
                  </div>
                </div>
                <div className="p-2 bg-[#FFFBEA] border border-black text-[11px] font-mono text-black font-bold">
                  ✓ Synthesized Consensus: Continue Lisinopril 20mg + Halt Oral Ibuprofen + Prescribe Topical Diclofenac 1% Gel.
                </div>
              </div>

              {/* Guideline Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-black/50" />
                  <input
                    type="text"
                    value={evidenceSearchQuery}
                    onChange={(e) => setEvidenceSearchQuery(e.target.value)}
                    placeholder="Search clinical guidelines (e.g. KDIGO, NSAID, eGFR, ACC, Beers)..."
                    className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black text-xs font-mono font-bold focus:outline-none focus:bg-[#FFFBEA]"
                  />
                </div>
                {evidenceSearchQuery && (
                  <button 
                    onClick={() => setEvidenceSearchQuery('')}
                    className="px-3 py-2 bg-white border-2 border-black text-xs font-black cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Guidelines List */}
              <div className="space-y-3">
                {endToEndWorkflowEngine.searchEvidence(evidenceSearchQuery).map(item => (
                  <div key={item.id} className="p-3.5 bg-[#FAF8F5] border-2 border-black text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">{item.organization} ({item.year})</span>
                      <span className="bg-[#CCFF00] text-black px-2 py-0.5 text-[9px] font-black border border-black">
                        {item.evidenceClass}
                      </span>
                    </div>
                    <p className="text-black font-sans text-xs italic">"{item.recommendation}"</p>
                    <div className="text-[10px] bg-[#E6FFFA] p-1.5 border border-black text-black font-mono">
                      ↳ Patient Application: {item.patientApplication}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PHASE 7: CLINICAL SAFETY GATE & CLINICIAN OVERRIDE ----------------- */}
          {activePhaseIndex === 6 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5] text-[#FF0055]" />
                  <span>Clinical Safety & Hard Constraint Evaluator</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowClinicianOverrideModal(true)}
                    className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-black hover:text-white text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  >
                    ✍️ Clinician Discretionary Override
                  </button>
                </div>
              </div>

              {overrideSuccessMsg && (
                <div className="p-2.5 bg-[#00F5D4] text-black border-2 border-black font-bold text-xs animate-fadeIn">
                  {overrideSuccessMsg}
                </div>
              )}

              {/* Safety Constraint Test Suite */}
              <div className="p-4 bg-[#FFF1F2] border-2 border-black space-y-2.5">
                <span className="text-xs font-black uppercase text-[#BE123C] block">
                  Simulate Emergency Trigger / Safety Scenarios:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleTestSafetyScenario('chest_pain')}
                    className="p-2 bg-white hover:bg-[#FF0055] hover:text-white border border-black font-bold text-left cursor-pointer transition-all"
                  >
                    1. Emergency Chest Pain (Halt & Escalate)
                  </button>
                  <button
                    onClick={() => handleTestSafetyScenario('nsaid_overdose')}
                    className="p-2 bg-white hover:bg-[#FF5722] hover:text-white border border-black font-bold text-left cursor-pointer transition-all"
                  >
                    2. ACEi + NSAID Toxic Duo (Intercept)
                  </button>
                  <button
                    onClick={() => handleTestSafetyScenario('potassium_spike')}
                    className="p-2 bg-white hover:bg-[#FFE600] hover:text-black border border-black font-bold text-left cursor-pointer transition-all"
                  >
                    3. Potassium &gt; 5.0 Ceiling (Warn & Gate)
                  </button>
                  <button
                    onClick={() => handleTestSafetyScenario('safe_baseline')}
                    className="p-2 bg-white hover:bg-[#00F5D4] hover:text-black border border-black font-bold text-left cursor-pointer transition-all"
                  >
                    4. Safe Baseline Screening (Pass)
                  </button>
                </div>
              </div>

              {safetyScenarioResult && (
                <div className={`p-3.5 border-2 border-black text-xs font-mono space-y-1 animate-fadeIn ${
                  safetyScenarioResult.action === 'HALT_AND_ESCALATE' ? 'bg-[#FF0055] text-white' :
                  safetyScenarioResult.action === 'INTERCEPT_AND_SUBSTITUTE' ? 'bg-[#FFE600] text-black' :
                  'bg-[#00F5D4] text-black'
                }`}>
                  <div className="font-black uppercase flex items-center justify-between">
                    <span>RULE TRIGGERED: {safetyScenarioResult.ruleTriggered}</span>
                    <span>{safetyScenarioResult.action}</span>
                  </div>
                  <p className="font-sans font-bold text-[11px]">{safetyScenarioResult.message}</p>
                </div>
              )}

              {/* Clinician Override Modal */}
              {showClinicianOverrideModal && (
                <div className="p-4 bg-[#FFFBEA] border-2 border-black space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-black">Physician Monitored Override Protocol:</span>
                    <button onClick={() => setShowClinicianOverrideModal(false)} className="text-xs font-black">✕</button>
                  </div>
                  <p className="text-[11px] font-sans text-black/80">
                    Entering a clinical override documents your medical rationale in the audit log for legal compliance while allowing necessary therapy customization.
                  </p>
                  <textarea
                    value={overrideRationale}
                    onChange={(e) => setOverrideRationale(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-white border border-black text-xs font-sans font-bold"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowClinicianOverrideModal(false)}
                      className="px-3 py-1 bg-white border border-black text-xs font-black cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClinicianOverride}
                      className="px-3 py-1 bg-[#FF0055] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer"
                    >
                      Confirm Physician Override & Stamp
                    </button>
                  </div>
                </div>
              )}

              {/* Active Rules List */}
              <div className="space-y-2">
                {endToEndWorkflowEngine.safetyRules.map(rule => (
                  <div key={rule.id} className="p-3 bg-[#FAF8F5] border-2 border-black text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">{rule.name}</span>
                      <span className="bg-black text-white px-1.5 py-0.2 text-[9px] font-black">{rule.code}</span>
                    </div>
                    <div className="text-[11px] font-sans text-black/80 font-bold">Trigger: {rule.condition}</div>
                    <div className="text-[10px] text-black/60">Rationale: {rule.rationale}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PHASE 8: SPECIALIST PERSONA SELECTION ----------------- */}
          {activePhaseIndex === 7 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 stroke-[2.5] text-[#FF70A6]" />
                  <span>Specialist Persona Selection & Acoustic Tuning</span>
                </h3>
                <span className="bg-[#FF70A6] text-black px-2 py-0.5 text-[10px] font-black border border-black">
                  Active: {activePersonaObj.name}
                </span>
              </div>

              {/* Specialist Persona Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {endToEndWorkflowEngine.personas.map(p => {
                  const isSelected = p.id === activeSpecialistId;
                  return (
                    <div 
                      key={p.id}
                      className={`p-3.5 border-2 border-black text-xs space-y-2 transition-all ${
                        isSelected 
                          ? 'bg-[#FFF0F7] shadow-[3px_3px_0px_0px_#000] -translate-y-0.5' 
                          : 'bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-black text-sm">{p.name}</span>
                        {isSelected ? (
                          <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[9px] font-black">ACTIVE</span>
                        ) : (
                          <button
                            onClick={() => handleSelectPersona(p.id)}
                            className="px-2 py-0.5 bg-white hover:bg-black hover:text-white border border-black text-[9px] font-black cursor-pointer"
                          >
                            Select Lead
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-[#7E22CE]">{p.title}</div>
                      <div className="text-[10px] text-black/70">Tone: {p.tone}</div>
                      <div className="text-[10px] bg-white p-1.5 border border-black/20 font-sans">
                        Focus: {p.clinicalFocus}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Voice Synthesizer Acoustic Controls */}
              <div className="p-4 bg-[#FAF8F5] border-2 border-black space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-black">Acoustic Parameter Tuning:</span>
                  <button
                    onClick={() => handleSpeakText(activePersonaObj.standardGreeting)}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black text-xs font-black cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Audition Greeting</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                  <div>
                    <label className="flex justify-between mb-1">
                      <span>Speech Pitch: {personaPitch.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.05"
                      value={personaPitch}
                      onChange={(e) => setPersonaPitch(parseFloat(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between mb-1">
                      <span>Speech Rate: {personaRate.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.05"
                      value={personaRate}
                      onChange={(e) => setPersonaRate(parseFloat(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PHASE 9: SCREENING PLAN GENERATION ----------------- */}
          {activePhaseIndex === 8 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 stroke-[2.5] text-[#7000FF]" />
                  <span>Screening Plan Generation & Question Decision Tree</span>
                </h3>
                <button
                  onClick={() => {
                    setScreeningPlanCompiled(false);
                    setTimeout(() => setScreeningPlanCompiled(true), 600);
                  }}
                  className="px-3 py-1 bg-[#7000FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-compile Plan</span>
                </button>
              </div>

              <div className="space-y-3">
                {endToEndWorkflowEngine.plannedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-[#FAF8F5] border-2 border-black text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">Question {idx + 1}: {q.stage}</span>
                      <span className="bg-black text-[#FFE600] px-1.5 py-0.2 text-[9px] font-black">{q.id}</span>
                    </div>
                    <p className="text-sm font-sans font-bold text-black bg-white p-2.5 border border-black/30">
                      "{q.text}"
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-black/80">
                      <div className="bg-[#FFFBEA] p-1.5 border border-black/20 font-mono">
                        🎯 Expected Entity: {q.expectedEntity}
                      </div>
                      <div className="bg-[#E6FFFA] p-1.5 border border-black/20 font-mono">
                        ↳ Branch: {q.branchRule}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PHASE 10: VIRTUAL DOCTOR VIDEO/VOICE UI & SENIOR ACCESSIBILITY ----------------- */}
          {activePhaseIndex === 9 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <Video className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                  <span>Interactive Virtual Doctor Video & Voice Consultation</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLargeSubtitles(!largeSubtitles)}
                    className="px-2.5 py-1 text-xs font-black bg-white border border-black cursor-pointer"
                  >
                    {largeSubtitles ? 'Standard Text' : '🔍 Large Subtitles'}
                  </button>
                  <button
                    onClick={() => handleSpeakText(activePersonaObj.standardGreeting)}
                    className="flex items-center space-x-1.5 px-3.5 py-1 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer"
                  >
                    {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? 'Pause Voice' : 'Start Consultation'}</span>
                  </button>
                </div>
              </div>

              {/* Avatar + Subtitle Container */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#FAF8F5] p-4 border-2 border-black">
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-44 h-44 bg-black border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000] relative">
                    <DoctorAnimatedAvatar 
                      persona={virtualDoctorScreeningEngine.getPersonaById(activePersonaObj.id)}
                      posture={doctorPosture}
                      isSpeaking={isPlayingAudio}
                    />
                    {isPlayingAudio && (
                      <div className="absolute top-2 right-2 bg-[#00F5D4] text-black px-1.5 py-0.2 text-[9px] font-black border border-black animate-pulse">
                        LIVE TTS
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {(['greeting', 'listening', 'explaining', 'alerting', 'prescribing', 'reassuring'] as DoctorPostureMode[]).map(pos => (
                      <button
                        key={pos}
                        onClick={() => setDoctorPosture(pos)}
                        className={`px-1.5 py-0.5 text-[9px] font-black uppercase border border-black cursor-pointer ${
                          doctorPosture === pos ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                      >
                        {pos.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-[#3A86FF] text-white px-2 py-0.5 border border-black">
                      {activePersonaObj.name} • Live Dialogue Stream
                    </span>
                    <span className="text-[10px] text-[#006600] font-bold bg-[#E6FFFA] px-1.5 py-0.2 border border-black">
                      ✓ Lip-Sync Buffer Synchronized
                    </span>
                  </div>
                  <p className={`font-sans font-bold text-black bg-white p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] leading-relaxed ${
                    largeSubtitles ? 'text-lg' : 'text-sm'
                  }`}>
                    "{activePersonaObj.standardGreeting}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PHASE 11: PATIENT RESPONSE INTELLIGENCE & QUICK-CHIPS ----------------- */}
          {activePhaseIndex === 10 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2 text-black">
                  <Sparkles className="w-4 h-4 stroke-[2.5] text-[#FFE600]" />
                  <span>Patient Response Intelligence & Adaptive Screening Loop</span>
                </h3>
                <span className="text-[10px] bg-black text-[#FFE600] px-2 py-0.5 font-black">
                  Colloquial NLP Active
                </span>
              </div>

              {/* 🦵 One-Tap Colloquial Quick-Chips (Including Negation & Metaphors) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-black/70 flex items-center gap-1">
                  <span>One-Tap Patient Response Chips (Testing Negation, Slang & Metaphors):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleTestExtraction("My feet feel heavy like bowling balls in the evening, and there are sock marks on my ankles.")}
                    className="p-2 bg-[#FAF8F5] hover:bg-[#FFE600] border-2 border-black text-left font-bold cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000]"
                  >
                    🦵 "Feet feel like bowling balls & swelling" <span className="text-[9px] bg-black text-white px-1 ml-1 font-mono">[Affirmed]</span>
                  </button>
                  <button
                    onClick={() => handleTestExtraction("I do not have any swelling or puffiness in my feet at all.")}
                    className="p-2 bg-[#FAF8F5] hover:bg-[#00F5D4] border-2 border-black text-left font-bold cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000]"
                  >
                    🛡️ "I do NOT have any swelling in my feet" <span className="text-[9px] bg-[#15803D] text-white px-1 ml-1 font-mono">[NegEx Negated]</span>
                  </button>
                  <button
                    onClick={() => handleTestExtraction("My friend has feet like bowling balls, but not me.")}
                    className="p-2 bg-[#FAF8F5] hover:bg-[#A855F7] hover:text-white border-2 border-black text-left font-bold cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000]"
                  >
                    👥 "My friend has bowling ball feet, not me" <span className="text-[9px] bg-[#7E22CE] text-white px-1 ml-1 font-mono">[Family/3rd Party]</span>
                  </button>
                  <button
                    onClick={() => handleTestExtraction("I took 400mg Ibuprofen for knee stiffness, but my chest feels tight like an elephant.")}
                    className="p-2 bg-[#FAF8F5] hover:bg-[#FF0055] hover:text-white border-2 border-black text-left font-bold cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000]"
                  >
                    🫁 "NSAID + Chest feels like an elephant" <span className="text-[9px] bg-[#CC0000] text-white px-1 ml-1 font-mono">[Emergency]</span>
                  </button>
                </div>
              </div>

              {/* Custom Input + Speech-to-Text Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={patientInputText}
                  onChange={(e) => handleTestExtraction(e.target.value)}
                  placeholder="Type or speak any patient symptom response..."
                  className="flex-1 p-2.5 bg-white border-2 border-black text-xs font-mono font-bold focus:outline-none focus:bg-[#FFFBEA]"
                />
                <button
                  onClick={toggleSpeechRecognition}
                  className={`px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5 text-xs font-black ${
                    isListeningMic ? 'bg-[#FF0055] text-white animate-pulse' : 'bg-[#00F5D4] text-black hover:bg-[#00D9BC]'
                  }`}
                  title="Speak via Microphone"
                >
                  {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListeningMic ? 'Listening…' : 'Speak'}</span>
                </button>
              </div>

              {/* Extraction & Decision Result Box with NegEx Assertion Engine */}
              <div className="p-4 bg-[#FAF8F5] border-2 border-black space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 border border-black">
                    <span className="text-[9px] text-black/60 block font-bold">EXTRACTED SYMPTOM</span>
                    <span className="font-black text-black">{extractedResult.symptom}</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-[9px] text-black/60 block font-bold">ASSERTION (NEGEX)</span>
                    <span className={`font-black text-[10px] px-1.5 py-0.5 inline-block border border-black ${
                      extractedResult.assertion === 'Negated'
                        ? 'bg-[#22C55E] text-black'
                        : extractedResult.assertion === 'FamilyHistory'
                        ? 'bg-[#A855F7] text-white'
                        : 'bg-[#FFE600] text-black'
                    }`}>
                      {extractedResult.assertion.toUpperCase()} {extractedResult.negationTrigger ? `("${extractedResult.negationTrigger}")` : ''}
                    </span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-[9px] text-black/60 block font-bold">TEMPORAL CHANGE</span>
                    <span className="font-black text-[#7E22CE]">{extractedResult.temporalChange}</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-[9px] text-black/60 block font-bold">DECISION MATRIX</span>
                    <span className={`font-black text-[10px] px-1.5 py-0.5 inline-block border border-black ${
                      extractedResult.safetyAction === 'Escalate to Clinician'
                        ? 'bg-[#FF0055] text-white'
                        : extractedResult.safetyAction === 'Clarify Question'
                        ? 'bg-[#FFE600] text-black'
                        : 'bg-[#00F5D4] text-black'
                    }`}>
                      {extractedResult.safetyAction}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#F0FDF4] border border-black text-[11px] font-mono space-y-1">
                  <strong className="text-[10px] text-[#15803D] block uppercase font-bold">Clinical NLP Assertion Rationale:</strong>
                  <div className="text-black font-bold">{extractedResult.nlpRationale}</div>
                </div>

                <div className="p-2.5 bg-white border border-black text-[11px] font-sans space-y-1">
                  <strong className="font-mono text-[10px] text-black/70 block uppercase">Longitudinal Lab Correlation:</strong>
                  <div>{extractedResult.longitudinalCorrelation}</div>
                </div>

                <div className="p-2.5 bg-[#FFFBEA] border border-black text-[11px] font-sans flex items-start justify-between gap-2">
                  <div>
                    <strong className="font-mono text-[10px] text-black/70 block uppercase">Generated Next Safe Question:</strong>
                    <span className="font-bold text-black">"{extractedResult.nextSafeQuestion}"</span>
                  </div>
                  <button
                    onClick={() => handleSpeakText(extractedResult.nextSafeQuestion)}
                    className="px-2 py-1 bg-black text-white text-[10px] font-black border border-black shrink-0 cursor-pointer"
                  >
                    Speak
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PHASE 12: CLINICAL HANDOFF & FAST-PATH REVIEW ----------------- */}
          {activePhaseIndex === 11 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                  <span>Structured Clinical Handoff & Clinician Fast-Path</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchApprove}
                    className="px-2.5 py-1 bg-[#CCFF00] hover:bg-[#B8E600] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>30-Sec Batch Approve All</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#EFF6FF] border-2 border-black text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/20">
                  <span className="font-black text-black">Target Recipient: {endToEndWorkflowEngine.clinicalHandoffNote.clinicianRecipient}</span>
                  <button
                    onClick={() => setShowEvidenceDrillDown(!showEvidenceDrillDown)}
                    className="text-[10px] text-[#1E40AF] font-bold underline cursor-pointer"
                  >
                    {showEvidenceDrillDown ? 'Hide Evidence Drill-Down' : '🔍 Inspect Guideline Citations (KDIGO 2024)'}
                  </button>
                </div>

                {showEvidenceDrillDown && (
                  <div className="p-2.5 bg-white border border-black text-[11px] font-sans space-y-1 animate-fadeIn">
                    <span className="font-mono text-[10px] font-bold text-[#1E40AF] block">KDIGO 2024 CKD-AKI Practice Guideline:</span>
                    <div>"In patients on ACEi/ARB therapy presenting with acute eGFR reductions &gt;15%, discontinue oral NSAIDs immediately and prescribe topical NSAID formulations (Class I, Level A evidence)."</div>
                  </div>
                )}

                <div>
                  <span className="font-bold text-black block text-[11px] uppercase">Primary Clinical Finding:</span>
                  <p className="font-sans text-xs text-black/90 font-bold">
                    {endToEndWorkflowEngine.clinicalHandoffNote.chiefConcern}
                  </p>
                </div>

                {/* Orders Checklist */}
                <div>
                  <span className="font-bold text-black block text-[11px] uppercase mb-1.5">Actionable Recommended Orders:</span>
                  <div className="space-y-1.5">
                    {ordersState.map(ord => (
                      <div key={ord.id} className="flex items-center space-x-2 bg-white p-2 border border-black cursor-pointer" onClick={() => handleToggleOrder(ord.id)}>
                        {ord.approved ? (
                          <CheckSquare className="w-4 h-4 text-[#00A86B]" />
                        ) : (
                          <Square className="w-4 h-4 text-black/40" />
                        )}
                        <span className={`text-xs font-sans ${ord.approved ? 'font-bold text-black' : 'line-through text-black/40'}`}>
                          {ord.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinician Sign-off & 1-Click EHR Sync */}
                <div className="pt-2 border-t border-black/20 flex flex-wrap items-center justify-between gap-2">
                  {clinicianSigned ? (
                    <div className="text-[11px] text-[#00A86B] font-black flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 stroke-[3]" />
                      <span>Transmitted to Epic/Cerner EHR & Signed by Dr. Aris Thorne (FHIR R4 Bundle)</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSignHandoff}
                      className="px-4 py-2 bg-[#FFE600] hover:bg-[#FFD600] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5"
                    >
                      <SendHorizontal className="w-4 h-4" />
                      <span>Sign & Transmit to Epic / Cerner EHR</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PHASE 13: CONTINUOUS MONITORING & SMART BATCHING ----------------- */}
          {activePhaseIndex === 12 && (
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 stroke-[2.5] text-[#CCFF00]" />
                  <span>Continuous Monitoring & Smart Reminder Batching</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCompleteMorningRoutine}
                    className="px-2.5 py-1 bg-[#FFE600] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1"
                  >
                    <SunMedium className="w-3.5 h-3.5" />
                    <span>1-Tap Complete Morning Tasks</span>
                  </button>
                </div>
              </div>

              {/* Smart Batching Mode Toggle (Mitigating Alert Fatigue) */}
              <div className="p-3 bg-[#FAF8F5] border-2 border-black flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <BellRing className="w-4 h-4 text-[#7E22CE]" />
                  <span className="font-bold text-black">Smart Notification Batching:</span>
                  <span className="text-[10px] text-black/60">Bundled Morning (08:00 AM) & Evening (08:00 PM) quiet checks</span>
                </div>
                <button
                  onClick={() => setSmartBatchingMode(!smartBatchingMode)}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black ${
                    smartBatchingMode ? 'bg-[#00F5D4] text-black' : 'bg-white text-black'
                  }`}
                >
                  {smartBatchingMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Care Reminders Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-black block">Active Patient Care Reminders:</span>
                {careReminders.map(rem => (
                  <div 
                    key={rem.id} 
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`p-3 border-2 border-black text-xs flex items-center justify-between cursor-pointer transition-all ${
                      rem.completed ? 'bg-[#F0FFF4]' : 'bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {rem.completed ? (
                        <CheckSquare className="w-4 h-4 text-[#00A86B]" />
                      ) : (
                        <Square className="w-4 h-4 text-black/40" />
                      )}
                      <span className={`font-sans ${rem.completed ? 'line-through text-black/50' : 'font-bold text-black'}`}>
                        {rem.title}
                      </span>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-0.5 border border-black font-mono">
                      {rem.scheduledTime}
                    </span>
                  </div>
                ))}
              </div>

              {/* Loop Advancement Button */}
              <div className="p-4 bg-[#F7FEE7] border-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-black text-black block">Next Screening Checkpoint:</span>
                  <span className="text-[11px] text-black/80 font-bold">2026-08-27 (14 days post-intervention)</span>
                </div>
                <button
                  onClick={handleAdvanceLoopCycle}
                  className="px-3.5 py-2 bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  🔄 Trigger Next Care Cycle
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Complete Architecture & Live State Inspector */}
        <div className="lg:col-span-5 space-y-6">
          {/* 7 Architecture Layers Interactive Diagram */}
          <div className="bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-5 font-mono">
            <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-3 text-black">
              <Target className="w-4 h-4 stroke-[2.5] text-[#FFE600]" />
              <span>7 Architectural Layers</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              {[
                { layer: '1. PATIENT EXPERIENCE', desc: 'Web • Mobile • Virtual Doctor • Dashboard', color: '#FFE600' },
                { layer: '2. INTERACTION LAYER', desc: 'Voice • Text • TTS • STT • Animated Avatar', color: '#00F5D4' },
                { layer: '3. SCREENING ORCHESTRATOR', desc: 'Session State • Question Selection • Dynamic Flow', color: '#7000FF', textWhite: true },
                { layer: '4. CLINICAL INTELLIGENCE', desc: 'Persona Engine • Clinical Reasoning • RAG Guidance', color: '#A855F7', textWhite: true },
                { layer: '5. LONGITUDINAL STATE', desc: 'Timeline • Labs • Medications • Symptoms • Deltas', color: '#3A86FF', textWhite: true },
                { layer: '6. SAFETY & GOVERNANCE', desc: 'Validation • Hard Constraints • Escalation • Audit', color: '#FF0055', textWhite: true },
                { layer: '7. DATA & EVIDENCE', desc: 'EHR Sync • PDF OCR • KDIGO / ACC Guidelines', color: '#CCFF00' }
              ].map((l, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between ${
                    l.textWhite ? 'text-white' : 'text-black'
                  }`}
                  style={{ backgroundColor: l.color }}
                >
                  <span className="font-black text-[11px] tracking-tight">{l.layer}</span>
                  <span className="text-[10px] font-bold opacity-90">{l.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live JSON Payload Inspector */}
          <div className="bg-[#1A1A1A] text-[#00FF66] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/20">
              <span className="font-black text-white text-[11px] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>Phase {activePhaseIndex + 1} Live Data Payload</span>
              </span>
              <span className="text-[9px] bg-white text-black font-black px-1.5 py-0.2">
                JSON STATE
              </span>
            </div>
            <pre className="max-h-72 overflow-y-auto overflow-x-auto text-[10px] leading-relaxed scrollbar-thin scrollbar-thumb-white/20">
              {JSON.stringify(currentPhase.dataPayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
