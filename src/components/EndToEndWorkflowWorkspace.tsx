import React, { useState, useEffect } from 'react';
import { 
  endToEndWorkflowEngine, 
  WorkflowPhaseInfo, 
  ExtractedPatientEntity 
} from '../engine/endToEndWorkflowEngine';
import { PATIENT_INFO, getDynamicPatientProfile } from '../data/mockPatientData';
import { useAuth } from '../context/AuthContext';
import { executeWorkflowRun } from '../services/apiClient';
import { DoctorAnimatedAvatar } from './DoctorAnimatedAvatar';
import { speechEngine } from '../engine/speechSynthesisEngine';
import { virtualDoctorScreeningEngine } from '../engine/virtualDoctorScreeningEngine';
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
  Send, 
  Check, 
  Clock, 
  Video, 
  Volume2, 
  VolumeX, 
  Zap, 
  Flame, 
  Target 
} from 'lucide-react';

interface EndToEndWorkflowWorkspaceProps {
  onNavigateTab?: (tab: string) => void;
}

export const EndToEndWorkflowWorkspace: React.FC<EndToEndWorkflowWorkspaceProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);
  const phases = endToEndWorkflowEngine.getPhases();
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'patient' | 'developer'>('patient');
  
  // Live Backend Workflow Execution
  const [backendResult, setBackendResult] = useState<any>(null);
  const [isExecutingBackend, setIsExecutingBackend] = useState<boolean>(false);

  const handleExecuteBackendWorkflow = async () => {
    setIsExecutingBackend(true);
    try {
      const data = await executeWorkflowRun();
      setBackendResult(data);
    } finally {
      setIsExecutingBackend(false);
    }
  };
  
  // Interactive Simulation State for Phase 11
  const [patientInputText, setPatientInputText] = useState<string>(
    "I've been feeling noticeably more tired for the last two weeks, and noticed some mild puffiness around my ankles."
  );
  const [extractedResult, setExtractedResult] = useState<ExtractedPatientEntity>(
    endToEndWorkflowEngine.analyzePatientResponse(patientInputText)
  );

  // Auto-play / Pipeline runner state
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [completedPhases, setCompletedPhases] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  // Audio state for Phase 10
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const currentPhase: WorkflowPhaseInfo = phases[activePhaseIndex] || phases[0];

  // Pipeline auto-run effect
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

  const handleTestExtraction = (customText: string) => {
    setPatientInputText(customText);
    const analyzed = endToEndWorkflowEngine.analyzePatientResponse(customText);
    setExtractedResult(analyzed);
  };

  const handleSpeakPhaseScript = (text: string) => {
    if (isPlayingAudio) {
      speechEngine.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speechEngine.speak(
      text,
      { pitch: 0.95, rate: 1.0, voiceName: 'Dr. Aris Thorne' },
      {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false)
      }
    );
  };

  const categories = [
    { name: 'Patient Onboarding', phases: [1, 2], color: '#FFE600' },
    { name: 'Data & State', phases: [3, 4], color: '#3A86FF' },
    { name: 'Intelligence & Reasoning', phases: [5, 6, 7], color: '#A855F7' },
    { name: 'Clinical Interaction', phases: [8, 9, 10, 11], color: '#00F5D4' },
    { name: 'Handoff & Monitoring', phases: [12, 13], color: '#CCFF00' }
  ];

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
            Click any phase to inspect live state & data payload
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

          {/* 🧩 Interactive Phase Deep-Dive Widgets */}
          {activePhaseIndex === 1 && (
            /* Phase 2: Ingestion Hub */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-3">
                <UploadCloud className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                <span>"My Health Data" Ingestion Store (4 Documents Active)</span>
              </h3>
              <div className="space-y-2">
                {endToEndWorkflowEngine.documents.map(doc => (
                  <div key={doc.id} className="p-3 bg-[#FAF8F5] border-2 border-black flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-black">{doc.title}</span>
                      <div className="text-[10px] text-black/60 mt-0.5">
                        {doc.type} • {doc.date} • {doc.size}
                      </div>
                    </div>
                    <span className="bg-[#00F5D4] text-black font-black px-2 py-0.5 border border-black text-[10px]">
                      {doc.extractedEntities} Extracted Entities
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePhaseIndex === 2 && (
            /* Phase 3: Validation Engine */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 stroke-[2.5] text-[#FF5722]" />
                <span>Deterministic Validation Interceptor Log (Zero Hallucination)</span>
              </h3>
              <div className="space-y-2.5">
                {endToEndWorkflowEngine.validationIssues.map(issue => (
                  <div key={issue.id} className="p-3 bg-[#FFF5F5] border-2 border-black text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">{issue.field}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black ${
                        issue.severity === 'Critical' ? 'bg-[#FF0055] text-white' : 'bg-[#FFE600] text-black'
                      }`}>
                        {issue.severity} • {issue.status}
                      </span>
                    </div>
                    <p className="text-black/80 text-[11px] font-sans">{issue.description}</p>
                    <div className="text-[10px] bg-white p-1.5 border border-black/20 text-[#006600] font-mono">
                      ✓ Resolution: {issue.resolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePhaseIndex === 3 && (
            /* Phase 4: Longitudinal State */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                <span>Longitudinal Biomarker Velocities (2024 → 2026)</span>
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-black">
                <thead>
                  <tr className="bg-[#FFE600] border-b-2 border-black font-black">
                    <th className="p-2 border-r border-black">Biomarker</th>
                    <th className="p-2 border-r border-black">2024</th>
                    <th className="p-2 border-r border-black">2025</th>
                    <th className="p-2 border-r border-black">2026</th>
                    <th className="p-2 border-r border-black">Delta</th>
                    <th className="p-2">Alert</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b border-black font-bold">
                    <td className="p-2 border-r border-black">eGFR (mL/min)</td>
                    <td className="p-2 border-r border-black">72</td>
                    <td className="p-2 border-r border-black">64</td>
                    <td className="p-2 border-r border-black bg-[#FFEEEE] text-[#CC0000]">52</td>
                    <td className="p-2 border-r border-black text-[#CC0000]">-18.7%</td>
                    <td className="p-2 bg-[#FF0055] text-white font-black text-[10px]">CRITICAL</td>
                  </tr>
                  <tr className="border-b border-black font-bold">
                    <td className="p-2 border-r border-black">Creatinine (mg/dL)</td>
                    <td className="p-2 border-r border-black">0.98</td>
                    <td className="p-2 border-r border-black">1.10</td>
                    <td className="p-2 border-r border-black bg-[#FFFBEA]">1.38</td>
                    <td className="p-2 border-r border-black text-[#CC0000]">+25.4%</td>
                    <td className="p-2 bg-[#FFE600] text-black font-black text-[10px]">ELEVATED</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="p-2 border-r border-black">Systolic BP (mmHg)</td>
                    <td className="p-2 border-r border-black">128</td>
                    <td className="p-2 border-r border-black">132</td>
                    <td className="p-2 border-r border-black">142</td>
                    <td className="p-2 border-r border-black">+7.5%</td>
                    <td className="p-2 bg-[#FFE600] text-black font-black text-[10px]">STAGE 1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activePhaseIndex === 4 && (
            /* Phase 5: Problem Clustering */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 stroke-[2.5] text-[#A855F7]" />
                <span>4 Clinical Problem Clusters & Specialist Persona Mapping</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {endToEndWorkflowEngine.clusters.map(c => (
                  <div key={c.id} className="p-3 bg-[#FAF8F5] border-2 border-black text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">{c.name}</span>
                      <span className="bg-black text-[#FFE600] px-1.5 py-0.2 text-[9px] font-black">
                        Risk {c.riskScore}%
                      </span>
                    </div>
                    <div className="text-[10px] text-[#7E22CE] font-bold">
                      Persona: {c.assignedPersona}
                    </div>
                    <div className="text-[10px] text-black/70 bg-white p-1.5 border border-black/20">
                      Guideline: {c.guidelineAnchor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePhaseIndex === 5 && (
            /* Phase 6: Evidence RAG */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 stroke-[2.5] text-[#00A86B]" />
                <span>Retrieved Clinical Practice Guidelines (Grounded RAG)</span>
              </h3>
              <div className="space-y-3">
                {endToEndWorkflowEngine.evidenceItems.map(item => (
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

          {activePhaseIndex === 9 && (
            /* Phase 10: Virtual Doctor UI Live Preview */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <Video className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                  <span>Interactive Doctor Session (Dr. Aris Thorne)</span>
                </h3>
                <button
                  onClick={() => handleSpeakPhaseScript(currentPhase.dataPayload.activeScript)}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black cursor-pointer"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Stop Voice' : 'Hear Doctor Speak'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#FAF8F5] p-4 border-2 border-black">
                <div className="md:col-span-4 flex justify-center">
                  <div className="w-36 h-36 bg-black border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000]">
                    <DoctorAnimatedAvatar 
                      persona={virtualDoctorScreeningEngine.getPersonaById('doc-thorne')}
                      posture="explaining"
                      isSpeaking={isPlayingAudio}
                    />
                  </div>
                </div>
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[10px] font-black uppercase bg-[#3A86FF] text-white px-2 py-0.5 border border-black">
                    Spoken Script & Subtitle Stream
                  </span>
                  <p className="text-sm font-sans font-bold text-black bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    "{currentPhase.dataPayload.activeScript}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePhaseIndex === 10 && (
            /* Phase 11: Live Adaptive Screening Loop Simulator */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase flex items-center gap-2 text-black">
                  <Sparkles className="w-4 h-4 stroke-[2.5] text-[#FFE600]" />
                  <span>Patient Response Intelligence & Decision Matrix</span>
                </h3>
                <span className="text-[10px] bg-black text-[#FFE600] px-2 py-0.5 font-black">
                  Live Extraction Test
                </span>
              </div>

              {/* Sample Utterance Quick Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-black/70">Test Sample Patient Responses:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTestExtraction("I've been feeling noticeably more tired for the last two weeks, and noticed some mild puffiness around my ankles.")}
                    className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#FFE600] border border-black text-[11px] font-bold cursor-pointer"
                  >
                    1. Fatigue + Ankle Swelling
                  </button>
                  <button
                    onClick={() => handleTestExtraction("I took 400mg Ibuprofen 3 times this week for knee stiffness, but my chest feels heavy and tight.")}
                    className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#FF0055] hover:text-white border border-black text-[11px] font-bold cursor-pointer"
                  >
                    2. NSAID + Chest Tightness (Escalate)
                  </button>
                  <button
                    onClick={() => handleTestExtraction("Just a little stiff in the mornings.")}
                    className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#3A86FF] hover:text-white border border-black text-[11px] font-bold cursor-pointer"
                  >
                    3. Short vague response (Clarify)
                  </button>
                </div>
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={patientInputText}
                  onChange={(e) => handleTestExtraction(e.target.value)}
                  placeholder="Type any patient symptom response..."
                  className="flex-1 p-2.5 bg-white border-2 border-black text-xs font-mono font-bold focus:outline-none focus:bg-[#FFFBEA]"
                />
              </div>

              {/* Extraction & Decision Result Box */}
              <div className="p-4 bg-[#FAF8F5] border-2 border-black space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 border border-black">
                    <span className="text-[9px] text-black/60 block font-bold">EXTRACTED SYMPTOM</span>
                    <span className="font-black text-black">{extractedResult.symptom}</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-[9px] text-black/60 block font-bold">DURATION</span>
                    <span className="font-black text-black">{extractedResult.duration}</span>
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

                <div className="p-2.5 bg-white border border-black text-[11px] font-sans">
                  <strong className="font-mono text-[10px] text-black/70 block uppercase">Longitudinal Lab Correlation:</strong>
                  {extractedResult.longitudinalCorrelation}
                </div>
              </div>
            </div>
          )}

          {activePhaseIndex === 11 && (
            /* Phase 12: Clinical Handoff */
            <div className="bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 font-mono">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-3">
                <Stethoscope className="w-4 h-4 stroke-[2.5] text-[#3A86FF]" />
                <span>Generated Structured Clinician Handoff (SOAP Summary)</span>
              </h3>
              <div className="p-4 bg-[#EFF6FF] border-2 border-black text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-black">Target Recipient: Dr. Aris Thorne, MD</span>
                  <span className="bg-[#00F5D4] text-black font-black px-2 py-0.5 text-[9px] border border-black">
                    Uncertainty: 4.2% (High Confidence)
                  </span>
                </div>
                <div>
                  <span className="font-bold text-black block text-[11px]">Primary Clinical Finding:</span>
                  <p className="font-sans text-xs text-black/90">
                    Hemodynamic Acute Kidney Injury secondary to ACE-inhibitor (Lisinopril) + NSAID (Ibuprofen) dual insult. eGFR declined 18.7% to 52 mL/min.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-black block text-[11px]">Recommended Action Orders:</span>
                  <ul className="list-disc pl-5 font-sans text-xs space-y-1 text-black/90">
                    <li>Discontinue oral OTC Ibuprofen 400mg TID immediately.</li>
                    <li>Prescribe Topical Diclofenac 1% gel for knee osteoarthritis analgesia.</li>
                    <li>Order repeat metabolic renal panel in 14 days to confirm eGFR normalization.</li>
                  </ul>
                </div>
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
