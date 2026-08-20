import React, { useState } from 'react';
import { PATIENT_INFO } from '../data/mockPatientData';
import { clinicalOrchestrator } from '../engine/clinicalOrchestrator';
import { ClinicianReviewWorkflow } from './ClinicianReviewWorkflow';
import { BaselineBenchmarkModal } from './BaselineBenchmarkModal';
import { 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Pill, 
  Layers, 
  ArrowRight,
  Stethoscope,
  Sparkles,
  Cpu,
  ShieldAlert,
  BarChart3,
  Target,
  BookOpen,
  Scale,
  AlertTriangle
} from 'lucide-react';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigateTab }) => {
  const orchestratorData = clinicalOrchestrator.runPipeline();
  const [synthesis, setSynthesis] = useState(orchestratorData.synthesisResult);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);

  const handleApprove = (notes: string) => {
    setSynthesis(prev => ({
      ...prev,
      clinicianActionStatus: 'APPROVED',
      clinicianNotes: notes
    }));
  };

  const handleModify = (modifiedRec: string, notes: string) => {
    setSynthesis(prev => ({
      ...prev,
      primaryRecommendation: modifiedRec,
      clinicianActionStatus: 'MODIFIED',
      clinicianNotes: notes
    }));
  };

  const handleReject = (reason: string) => {
    setSynthesis(prev => ({
      ...prev,
      clinicianActionStatus: 'REJECTED',
      clinicianNotes: reason
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main OS Command Header */}
      <div className="p-6 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden font-mono">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-wider mb-1 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>CLINICAL INTELLIGENCE COMMAND CENTER</span>
            </div>
            <h1 className="text-3xl font-black font-display text-black tracking-tight mt-1">
              PATIENT: {PATIENT_INFO.name.toUpperCase()} (68Y/F)
            </h1>
            <p className="text-xs font-bold text-black/90 mt-1.5 max-w-2xl font-mono leading-relaxed">
              Unified Patient Clinical State, Deterministic Safety Constraint Verification, Goal Conflict Resolution, and Human-in-the-Loop Decision Support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Risk Badge */}
            <div className="px-4 py-2 bg-[#F43F5E] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-right">
              <span className="text-[10px] font-black uppercase tracking-wider block text-white/90">PATIENT RISK LEVEL</span>
              <span className="text-base font-black flex items-center gap-1.5 justify-end">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-black animate-ping"></span>
                HIGH RISK HAZARD
              </span>
            </div>

            {/* Killer Demo Benchmark Button */}
            <button
              onClick={() => setShowBenchmarkModal(true)}
              className="px-4 py-2.5 bg-[#A855F7] text-white font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#9333EA] transition-all cursor-pointer uppercase tracking-wider"
            >
              <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              <span>Killer Demo Benchmark</span>
            </button>

            <button
              onClick={() => onNavigateTab('conference')}
              className="px-4 py-2.5 bg-[#FF70A6] hover:bg-[#FF4D8D] text-black font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer uppercase tracking-wider"
            >
              <Layers className="w-4 h-4 stroke-[2.5]" />
              <span>View AI Reasoning Trace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simplified High-Level Dashboard Grid (Priority 19) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
        {/* Card 1: Critical Findings */}
        <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <ShieldAlert className="w-4 h-4 text-[#F43F5E] stroke-[2.5]" /> CRITICAL FINDINGS
            </span>
            <span className="text-[10px] font-black bg-[#FF70A6] border border-black px-1.5 py-0.5 text-black">3 ALERTS</span>
          </div>

          <ul className="space-y-2 text-xs font-bold">
            <li className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-black text-[#F43F5E] block">18.7% eGFR DECLINE:</span>
              <span className="text-black/90 font-sans">eGFR dropped from 64 to 52 mL/min over 3 weeks.</span>
            </li>
            <li className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-black text-[#F59E0B] block">TRIPLE WHAMMY HAZARD:</span>
              <span className="text-black/90 font-sans">Self-administered OTC Ibuprofen + active Lisinopril therapy.</span>
            </li>
            <li className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-black text-[#3A86FF] block">BIOMARKER ELEVATION:</span>
              <span className="text-black/90 font-sans">NT-proBNP rose to 480 pg/mL with 2+ pitting leg edema.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Recommended Actions & Safety Block */}
        <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Target className="w-4 h-4 text-[#00F5D4] stroke-[2.5]" /> RECOMMENDED ACTIONS
            </span>
            <span className="text-[10px] font-black bg-[#CCFF00] border border-black px-1.5 py-0.5 text-black">SAFE ALTERNATIVE</span>
          </div>

          <div className="p-3 bg-[#CCFF00]/40 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-black block mb-1">PRIMARY ACTION ITEM:</span>
            <p className="text-xs font-extrabold text-black font-sans">"{synthesis.primaryRecommendation}"</p>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-black uppercase text-black/70 block">BLOCKED UNSAFE ACTION:</span>
            <div className="bg-[#FF70A6] text-black p-2 border border-black font-bold">
              ⛔ {synthesis.safetyResult.blockedAction || 'Oral NSAID continuation in CKD'}
            </div>
          </div>
        </div>

        {/* Card 3: Active Goal Conflicts & Evidence */}
        <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Scale className="w-4 h-4 text-[#A855F7] stroke-[2.5]" /> ACTIVE GOAL CONFLICTS
            </span>
            <span className="text-[10px] font-black bg-[#A855F7] text-white border border-black px-1.5 py-0.5">HIGH FRICTION</span>
          </div>

          <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1.5">
            <div className="flex justify-between text-[11px] font-black">
              <span className="text-[#F43F5E]">PAIN RELIEF</span>
              <span>VS</span>
              <span className="text-[#3A86FF]">RENAL PROTECTION</span>
            </div>
            <p className="text-xs font-sans text-black/90">
              Analgesia demand vs eGFR preservation. Resolved via topical non-systemic 5% Lidocaine patch.
            </p>
          </div>

          <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-black/70 flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3 stroke-[2.5]" /> SUPPORTING EVIDENCE (4 SOURCES):
            </span>
            <span className="text-xs font-bold text-black block truncate">
              {synthesis.evidenceChain.guidelineCitation}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Clinician Review & Human-in-the-Loop Component */}
      <ClinicianReviewWorkflow
        synthesis={synthesis}
        onApprove={handleApprove}
        onModify={handleModify}
        onReject={handleReject}
      />

      {/* Benchmark Comparison Modal */}
      {showBenchmarkModal && (
        <BaselineBenchmarkModal onClose={() => setShowBenchmarkModal(false)} />
      )}
    </div>
  );
};
