import React, { useState } from 'react';
import { PATIENT_INFO } from '../data/mockPatientData';
import { clinicalOrchestrator } from '../engine/clinicalOrchestrator';
import { ClinicianReviewWorkflow } from './ClinicianReviewWorkflow';
import { BaselineBenchmarkModal } from './BaselineBenchmarkModal';
import { EngineInspectorModal } from './EngineInspectorModal';
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
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Sliders,
  Check,
  XCircle,
  FileCode,
  Heart,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { WhatIfSimInput, WhatIfSimResult } from '../types/health';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigateTab }) => {
  const orchestratorData = clinicalOrchestrator.runPipeline();
  const [synthesis, setSynthesis] = useState(orchestratorData.synthesisResult);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
  const [showEngineModal, setShowEngineModal] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'overview' | 'alternatives' | 'whynot' | 'triggers' | 'whatif'>('overview');

  // What-If Simulation local state
  const [simEgfr, setSimEgfr] = useState<number>(52);
  const [simDrug, setSimDrug] = useState<string>('Discontinued NSAID');
  const [simResult, setSimResult] = useState<WhatIfSimResult | null>(null);

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

  const handleRunSimulation = () => {
    const res = clinicalOrchestrator.runWhatIfSimulation({
      modifiedEgfr: simEgfr,
      modifiedDrug: simDrug
    });
    setSimResult(res);
  };

  return (
    <div className="space-y-6">
      {/* 🧠 Human Concept Header Banner */}
      <div className="p-6 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden font-mono">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-wider mb-1 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>CARE INTELLIGENCE COCKPIT</span>
            </div>
            <h1 className="text-3xl font-black font-display text-black tracking-tight mt-1">
              PATIENT: {PATIENT_INFO.name.toUpperCase()} (68Y/F)
            </h1>
            <p className="text-xs font-bold text-black/90 mt-1.5 max-w-2xl font-mono leading-relaxed">
              Understand → Detect Changes → Explain Causes → Protect Safely → Monitor Recovery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Badge */}
            <div className="px-4 py-2 bg-[#F43F5E] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-right">
              <span className="text-[10px] font-black uppercase tracking-wider block text-white/90">CURRENT STATUS</span>
              <span className="text-sm font-black flex items-center gap-1.5 justify-end">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-black animate-ping"></span>
                NEEDS CLINICAL ATTENTION
              </span>
            </div>

            {/* Progressive Disclosure: Forensic Engine Button */}
            <button
              onClick={() => setShowEngineModal(true)}
              className="px-4 py-2.5 bg-[#3A86FF] text-white font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#2670E8] transition-all cursor-pointer uppercase tracking-wider"
            >
              <Cpu className="w-4 h-4 stroke-[2.5]" />
              <span>Show How Heal Engine Reached This Conclusion →</span>
            </button>

            {/* Demonstration Benchmark Suite Button */}
            <button
              onClick={() => setShowBenchmarkModal(true)}
              className="px-4 py-2.5 bg-[#A855F7] text-white font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#9333EA] transition-all cursor-pointer uppercase tracking-wider"
            >
              <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              <span>Benchmark Suite (50 Cases)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🧭 The 5 Human Pillars Main Flow */}
      <div className="space-y-5">
        {/* Pillar 1 & 2: Understand Me & Find What Changed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pillar 1: Understand Me */}
          <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3 font-mono">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
                <Heart className="w-4 h-4 text-[#F43F5E] stroke-[2.5]" /> 1. UNDERSTAND ME (PATIENT HEALTH PICTURE)
              </span>
              <span className="text-[10px] font-black bg-[#FFE600] border border-black px-1.5 py-0.5 text-black">STATE v1.4.2</span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="font-mono font-bold text-[10px] text-black/60 block uppercase">Active Conditions:</span>
                <span className="font-extrabold text-black">Stage 2 CKD baseline • Essential Hypertension • Knee Osteoarthritis</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="font-mono font-bold text-[10px] text-black/60 block uppercase">Current Medications:</span>
                <span className="font-extrabold text-black">Lisinopril 20mg daily • HCTZ 12.5mg • OTC Oral Ibuprofen 400mg PRN</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="font-mono font-bold text-[10px] text-black/60 block uppercase">Genetic Profile:</span>
                <span className="font-extrabold text-black">CYP2C9*3 Intermediate Metabolizer (Delayed NSAID Clearance)</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Find What Changed */}
          <div className="p-5 bg-[#FAF8F5] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3 font-mono">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
                <TrendingDown className="w-4 h-4 text-[#F43F5E] stroke-[2.5]" /> 2. FIND WHAT CHANGED (LONGITUDINAL DELTA)
              </span>
              <span className="text-[10px] font-black bg-[#FF70A6] border border-black px-1.5 py-0.5 text-black">3-WEEK SHIFT</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="font-black text-[#F43F5E] block text-sm">⚠️ KIDNEY FUNCTION HAS DECLINED:</span>
                <div className="flex items-center justify-between mt-1 text-xs font-bold font-sans">
                  <span>3 Weeks Ago: <strong>64 mL/min</strong></span>
                  <span className="text-base font-black">→</span>
                  <span className="text-[#F43F5E]">Today: <strong>52 mL/min (-18.7%)</strong></span>
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="font-black text-[#F59E0B] block text-sm">⚠️ FLUID MARKER ELEVATION:</span>
                <p className="text-black/90 font-sans mt-0.5">
                  NT-proBNP rose from 180 to <strong>480 pg/mL</strong> accompanied by new bilateral 2+ pitting leg swelling.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Understand Why */}
        <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3 font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Sparkles className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" /> 3. UNDERSTAND WHY (3 CONTRIBUTING FACTORS)
            </span>
            <span className="text-[10px] font-black bg-[#00F5D4] border border-black px-1.5 py-0.5 text-black">EVIDENCE CHECKED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
              <span className="font-mono font-black text-[10px] text-[#F43F5E] block uppercase">Factor 1: NSAID + ACEi Collision</span>
              <p className="text-black/90 font-medium">
                Self-administered OTC Ibuprofen constricts kidney inflow (afferent arteriole) while Lisinopril dilates outflow (efferent arteriole), crashing filtration pressure.
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
              <span className="font-mono font-black text-[10px] text-[#F59E0B] block uppercase">Factor 2: Genetic Slow Clearance</span>
              <p className="text-black/90 font-medium">
                CYP2C9*3 genetic variant delays Ibuprofen metabolism by ~50%, prolonging kidney exposure and tissue toxicity.
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
              <span className="font-mono font-black text-[10px] text-[#3A86FF] block uppercase">Factor 3: Competing Priorities</span>
              <p className="text-black/90 font-medium">
                Patient required knee pain relief for daily mobility, resorting to over-the-counter NSAIDs due to lack of a safe non-systemic prescription alternative.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 4: Decide Safely */}
        <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4 font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <ShieldAlert className="w-4 h-4 text-[#F43F5E] stroke-[2.5]" /> 4. DECIDE SAFELY (SAFETY CHECK & CARE OPTIONS)
            </span>
            <span className="text-[10px] font-black bg-[#CCFF00] border border-black px-1.5 py-0.5 text-black">SAFE ALTERNATIVES READY</span>
          </div>

          {/* Safety Check Notice */}
          <div className="p-3.5 bg-[#FF70A6]/20 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between gap-4 font-sans text-xs">
            <div>
              <span className="font-mono font-black uppercase text-[#F43F5E] block text-[11px]">
                ⛔ SAFETY CONSTRAINT TRIGGERED: CURRENT ORAL NSAID FLAGGED
              </span>
              <p className="font-medium text-black mt-0.5">
                Oral Ibuprofen cannot be safely continued in Stage 2 CKD (eGFR 52 mL/min) under active Lisinopril therapy. Discontinuation recommended.
              </p>
            </div>
            <span className="shrink-0 font-mono text-[10px] font-black bg-black text-[#FFE600] px-2 py-1 border border-black">
              HARD BLOCK ACTIVE
            </span>
          </div>

          {/* Care Options (A, B, C) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            {synthesis.candidateAlternatives.map((alt, index) => (
              <div key={alt.id} className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 relative">
                <span className="absolute top-2 right-2 bg-black text-[#FFE600] px-2 py-0.5 text-[10px] font-black font-mono border border-black">
                  OPTION {index + 1}
                </span>
                <span className="text-[10px] font-mono font-black uppercase text-black/60 block">{alt.category}</span>
                <h4 className="font-extrabold text-sm text-black">{alt.title}</h4>
                <p className="text-black/80 font-medium">{alt.description}</p>
                <div className="pt-2 border-t border-black/20 font-mono text-[10px] space-y-1">
                  <span className="font-bold text-black block">Why This Works:</span>
                  <p className="text-black/70">{alt.selectionCriteria}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Clinician Review Workflow */}
          <ClinicianReviewWorkflow
            synthesis={synthesis}
            onApprove={handleApprove}
            onModify={handleModify}
            onReject={handleReject}
          />
        </div>

        {/* Pillar 5: Follow What Happens Next */}
        <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3 font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Calendar className="w-4 h-4 text-[#A855F7] stroke-[2.5]" /> 5. FOLLOW WHAT HAPPENS NEXT (14-DAY RECOVERY MONITORING)
            </span>
            <span className="text-[10px] font-black bg-[#A855F7] text-white border border-black px-1.5 py-0.5">CLOSED-LOOP MONITOR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-sans text-xs">
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-mono font-black text-[10px] text-black/70 block uppercase">Day 1 - 3</span>
              <p className="font-bold text-black mt-1">Initiate Topical Lidocaine 5% patch; confirm oral Ibuprofen cessation.</p>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-mono font-black text-[10px] text-black/70 block uppercase">Day 4 - 7</span>
              <p className="font-bold text-black mt-1">Order 7-day follow-up renal blood draw (Serum Creatinine & eGFR check).</p>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-mono font-black text-[10px] text-black/70 block uppercase">Day 8 - 11</span>
              <p className="font-bold text-black mt-1">Daily knee WOMAC mobility check-in & 2+ leg edema evaluation.</p>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-mono font-black text-[10px] text-black/70 block uppercase">Day 14</span>
              <p className="font-bold text-black mt-1">Review 2D Echocardiogram results & update Patient State to v1.5.0.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive Disclosure Forensic Modals */}
      {showEngineModal && (
        <EngineInspectorModal onClose={() => setShowEngineModal(false)} />
      )}

      {showBenchmarkModal && (
        <BaselineBenchmarkModal onClose={() => setShowBenchmarkModal(false)} />
      )}
    </div>
  );
};
