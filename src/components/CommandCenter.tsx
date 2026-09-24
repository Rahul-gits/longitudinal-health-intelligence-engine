import React, { useState } from 'react';
import { PATIENT_INFO, getDynamicPatientProfile } from '../data/mockPatientData';
import { useAuth } from '../context/AuthContext';
import { clinicalOrchestrator } from '../engine/clinicalOrchestrator';
import { ClinicianReviewWorkflow } from './ClinicianReviewWorkflow';
import { BaselineBenchmarkModal } from './BaselineBenchmarkModal';
import { EngineInspectorModal } from './EngineInspectorModal';
import { WhySeeingThisModal, WhySeeingThisData } from './WhySeeingThisModal';
import { ExplainTermModal } from './ExplainTermModal';
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
  Calendar,
  Video,
  Info,
  ShieldCheck,
  FolderOpen,
  BellRing
} from 'lucide-react';
import { WhatIfSimInput, WhatIfSimResult } from '../types/health';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);
  const orchestratorData = clinicalOrchestrator.runPipeline();
  const [synthesis, setSynthesis] = useState(orchestratorData.synthesisResult);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
  const [showEngineModal, setShowEngineModal] = useState<boolean>(false);
  
  // Modals for Explainability & Medical Term Guidance
  const [whyModalData, setWhyModalData] = useState<WhySeeingThisData | null>(null);
  const [explainTermKey, setExplainTermKey] = useState<string | null>(null);

  // What-If Simulation local state (Advanced)
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

  const openKidneyWhyModal = () => {
    setWhyModalData({
      title: 'Kidney Function Change & NSAID Interaction',
      changeSummary: 'Estimated filtration rate (eGFR) changed from 64 to 52 mL/min over the past 3 weeks.',
      contextSummary: 'A recent laboratory report detected this shift during the same timeframe that daily over-the-counter ibuprofen was used for knee discomfort.',
      relevanceSummary: 'Oral ibuprofen constricts the small blood vessels entering the kidneys. When taken alongside Lisinopril, this may cause a temporary decline in filtration pressure.',
      sourcesUsed: [
        'Lab Panel (eGFR 52 mL/min)',
        'Active Rx: Lisinopril 20mg Daily',
        'Reported OTC Ibuprofen 400mg PRN',
        'Pharmacogenomic Variant: CYP2C9*3'
      ],
      evidenceCount: 3,
      evidenceCitations: [
        'KDIGO 2024 Clinical Practice Guideline for CKD Assessment',
        'FDA Safety Communication on NSAID & Antihypertensive Interactions',
        'CPIC Guideline for CYP2C9 Dosing in Renal Risk'
      ],
      uncertaintyNotice: 'This is an evidence-backed potential contributing factor. It indicates a need for clinical review, not an irreversible diagnosis.',
      nextSteps: [
        'Talk through this change with your Virtual Specialist',
        'Discuss safer joint pain alternatives (e.g. topical Voltaren gel) with your clinician'
      ]
    });
  };

  const openFluidWhyModal = () => {
    setWhyModalData({
      title: 'Fluid Balance Marker Elevation',
      changeSummary: 'NT-proBNP rose from 180 to 480 pg/mL, accompanied by mild lower leg swelling.',
      contextSummary: 'Detected in blood tests alongside reported mild ankle swelling over the past week.',
      relevanceSummary: 'NSAIDs can cause the body to retain extra sodium and fluid, increasing circulating volume and cardiac workload.',
      sourcesUsed: [
        'Cardiac Biomarker Lab (NT-proBNP 480 pg/mL)',
        'Reported Symptoms: 2+ Pitting Ankle Edema',
        'Medication Timeline: Lisinopril & Ibuprofen'
      ],
      evidenceCount: 2,
      evidenceCitations: [
        'AHA 2023 Heart Failure Biomarker Guidelines',
        'Journal of the American College of Cardiology: NSAID Fluid Retention Studies'
      ],
      uncertaintyNotice: 'Possible connection between medication-induced fluid retention and heart biomarker changes. Requires clinician interpretation.',
      nextSteps: [
        'Review sodium intake and leg elevation',
        'Discuss with healthcare provider during routine checkup'
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Human Health Overview Banner */}
      <div className="p-6 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-wider mb-1 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>YOUR HEALTH OVERVIEW</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-black tracking-tight mt-1">
              Welcome back, {currentPatient.name.split(' ')[0]}
            </h1>
            <p className="text-xs font-bold text-black/90 mt-1 max-w-2xl font-mono leading-relaxed">
              Here is what has changed in your health information recently, explained simply and transparently.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('virtual-doctor')}
              className="px-4 py-2 bg-[#00F5D4] text-black font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#00D2B4] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer uppercase tracking-wider"
            >
              <Video className="w-4 h-4 stroke-[2.5]" />
              <span>Talk to Virtual Specialist →</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-3.5 py-2 bg-white text-black font-bold font-mono text-xs flex items-center space-x-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Add Health Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HEALTH AT A GLANCE (3 Metrics Box) */}
      <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
            <Activity className="w-4 h-4 text-black stroke-[2.5]" /> HEALTH AT A GLANCE
          </span>
          <span className="text-[10px] font-black bg-[#CCFF00] border border-black px-1.5 py-0.5 font-mono">
            UPDATED TODAY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#3A86FF] text-white border-2 border-black flex items-center justify-center text-lg font-black shrink-0">
              3
            </div>
            <div>
              <span className="text-[11px] font-bold text-black/60 uppercase block">Monitored Areas</span>
              <span className="text-xs font-black text-black">Kidney, Fluid, Joint Pain</span>
            </div>
          </div>

          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FF70A6] text-black border-2 border-black flex items-center justify-center text-lg font-black shrink-0">
              5
            </div>
            <div>
              <span className="text-[11px] font-bold text-black/60 uppercase block">Recent Observations</span>
              <span className="text-xs font-black text-black">Lab shift, OTC meds, edema</span>
            </div>
          </div>

          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00F5D4] text-black border-2 border-black flex items-center justify-center text-lg font-black shrink-0">
              2
            </div>
            <div>
              <span className="text-[11px] font-bold text-black/60 uppercase block">Follow-Up Items</span>
              <span className="text-xs font-black text-black">AI screening, Clinician note</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THINGS WORTH KNOWING (4-Layer Explainability Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black font-display uppercase tracking-wider text-black flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" /> Things Worth Knowing
          </h2>
          <span className="text-xs font-bold font-mono text-black/60">
            Explainable Health Intelligence
          </span>
        </div>

        {/* Insight Card 1: Kidney Function Change */}
        <div className="p-6 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-[#FF6B35] text-white text-xs font-black uppercase font-mono border border-black">
                Kidney Function
              </span>
              <h3 className="text-base font-black font-display text-black">
                A change was detected in your recent laboratory results
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExplainTermKey('eGFR')}
                className="text-[11px] font-bold font-mono bg-white hover:bg-[#CCFF00] border border-black px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_0px_0px_#000]"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Explain eGFR</span>
              </button>
              <button
                onClick={openKidneyWhyModal}
                className="text-[11px] font-black font-mono bg-[#FFE600] hover:bg-[#CCFF00] border border-black px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_0px_0px_#000]"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why am I seeing this?</span>
              </button>
            </div>
          </div>

          {/* 4-Layer Explainability Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs">
            {/* Layer 1: What Changed? */}
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
              <span className="text-[10px] font-black uppercase font-mono text-[#F43F5E] block">
                1. WHAT CHANGED?
              </span>
              <p className="font-bold text-black">
                Your recent laboratory results differ from your earlier results (eGFR shifted from 64 to 52 mL/min).
              </p>
            </div>

            {/* Layer 2: Why It Matters */}
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
              <span className="text-[10px] font-black uppercase font-mono text-[#FF70A6] block">
                2. WHY IT MATTERS
              </span>
              <p className="font-medium text-black/90 leading-relaxed">
                This change occurred while taking OTC ibuprofen alongside Lisinopril. A genetic variant (CYP2C9*3) also clears ibuprofen slower.
              </p>
            </div>

            {/* Layer 3: What Heal Engine Used */}
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1 font-mono">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                3. WHAT WAS USED?
              </span>
              <ul className="space-y-1 text-[11px]">
                <li className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Recent lab reports</span>
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Medication history</span>
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Clinical evidence</span>
                </li>
              </ul>
            </div>

            {/* Layer 4: What You Can Do Next */}
            <div className="p-3.5 bg-[#CCFF00]/30 border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase font-mono text-black block">
                  4. WHAT'S NEXT?
                </span>
                <p className="font-bold text-black text-[11px] mt-0.5">
                  Explore safe joint pain options with our virtual specialist or clinician.
                </p>
              </div>
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => onNavigateTab('virtual-doctor')}
                  className="w-full py-1.5 bg-[#00F5D4] hover:bg-[#00D2B4] text-black border-2 border-black text-[11px] font-black font-display shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-1 uppercase"
                >
                  <span>Talk to Specialist →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Card 2: Fluid Balance & Heart Biomarker */}
        <div className="p-6 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-[#3A86FF] text-white text-xs font-black uppercase font-mono border border-black">
                Fluid Balance
              </span>
              <h3 className="text-base font-black font-display text-black">
                A mild fluid retention signal was identified alongside reported ankle swelling
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExplainTermKey('NT-proBNP')}
                className="text-[11px] font-bold font-mono bg-white hover:bg-[#CCFF00] border border-black px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_0px_0px_#000]"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Explain NT-proBNP</span>
              </button>
              <button
                onClick={openFluidWhyModal}
                className="text-[11px] font-black font-mono bg-[#FFE600] hover:bg-[#CCFF00] border border-black px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_0px_0px_#000]"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why am I seeing this?</span>
              </button>
            </div>
          </div>

          {/* 4-Layer Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
              <span className="text-[10px] font-black uppercase font-mono text-[#F59E0B] block">
                1. WHAT CHANGED?
              </span>
              <p className="font-bold text-black">
                NT-proBNP rose from 180 to 480 pg/mL, coinciding with reported lower leg swelling.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
              <span className="text-[10px] font-black uppercase font-mono text-[#FF70A6] block">
                2. WHY IT MATTERS
              </span>
              <p className="font-medium text-black/90 leading-relaxed">
                Kidneys temporarily holding extra fluid under NSAID influence can increase circulation pressure and fluid markers.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1 font-mono">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                3. WHAT WAS USED?
              </span>
              <ul className="space-y-1 text-[11px]">
                <li className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Lab Biomarkers</span>
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Reported Symptoms</span>
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Circulation Guidelines</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-[#CCFF00]/30 border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase font-mono text-black block">
                  4. WHAT'S NEXT?
                </span>
                <p className="font-bold text-black text-[11px] mt-0.5">
                  Review fluid intake and mention leg puffiness during your clinician visit.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('recovery')}
                className="w-full py-1.5 bg-[#CCFF00] hover:bg-[#B8E600] text-black border-2 border-black text-[11px] font-black font-display shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-1 uppercase"
              >
                <span>View Follow-Up Plan →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Advanced Technical Forensic Tools (For Clinicians & Researchers) */}
      <div className="p-5 bg-[#FAF8F5] border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-black/20 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-black/80 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Technical & Algorithmic Engines
          </span>
          <span className="text-[10px] font-bold text-black/60">
            For Clinical Decision Support & Forensic Auditing
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('workflow')}
            className="px-3.5 py-2 bg-white hover:bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>13-Phase Clinical Pipeline →</span>
          </button>

          <button
            onClick={() => setShowEngineModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#00F5D4] text-black border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Multi-Agent Swarm Reasoning Trace →</span>
          </button>

          <button
            onClick={() => setShowBenchmarkModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#A855F7] hover:text-white text-black border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>50-Case Benchmark Suite →</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <WhySeeingThisModal
        data={whyModalData}
        onClose={() => setWhyModalData(null)}
        onTalkToSpecialist={() => onNavigateTab('virtual-doctor')}
      />

      <ExplainTermModal
        termKey={explainTermKey}
        onClose={() => setExplainTermKey(null)}
      />

      {showEngineModal && (
        <EngineInspectorModal
          onClose={() => setShowEngineModal(false)}
        />
      )}

      {showBenchmarkModal && (
        <BaselineBenchmarkModal
          onClose={() => setShowBenchmarkModal(false)}
        />
      )}
    </div>
  );
};
