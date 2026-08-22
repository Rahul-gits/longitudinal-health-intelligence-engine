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
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Sliders,
  Check,
  XCircle,
  FileCode
} from 'lucide-react';
import { WhatIfSimInput, WhatIfSimResult } from '../types/health';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigateTab }) => {
  const orchestratorData = clinicalOrchestrator.runPipeline();
  const [synthesis, setSynthesis] = useState(orchestratorData.synthesisResult);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
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
      {/* Main OS Command Header */}
      <div className="p-6 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden font-mono">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-wider mb-1 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>CLOSED-LOOP CLINICAL DECISION INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl font-black font-display text-black tracking-tight mt-1">
              PATIENT: {PATIENT_INFO.name.toUpperCase()} (68Y/F)
            </h1>
            <p className="text-xs font-bold text-black/90 mt-1.5 max-w-2xl font-mono leading-relaxed">
              Longitudinal Clinical Decision Intelligence • State Version <span className="underline">{synthesis.stateVersionId}</span> • Closed-Loop Safety Guardrails & Human-in-the-Loop Review.
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

            {/* Demonstration Benchmark Button */}
            <button
              onClick={() => setShowBenchmarkModal(true)}
              className="px-4 py-2.5 bg-[#A855F7] text-white font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#9333EA] transition-all cursor-pointer uppercase tracking-wider"
            >
              <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              <span>Demo Benchmark (50 Cases)</span>
            </button>

            <button
              onClick={() => onNavigateTab('conference')}
              className="px-4 py-2.5 bg-[#FF70A6] hover:bg-[#FF4D8D] text-black font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer uppercase tracking-wider"
            >
              <Layers className="w-4 h-4 stroke-[2.5]" />
              <span>Reasoning Trace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs inside Command Center */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTabSection('overview')}
          className={`px-3.5 py-1.5 border-2 border-black font-black uppercase transition-all ${
            activeTabSection === 'overview'
              ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black/70 hover:bg-black/5'
          }`}
        >
          ⚡ Overview & Safety
        </button>
        <button
          onClick={() => setActiveTabSection('alternatives')}
          className={`px-3.5 py-1.5 border-2 border-black font-black uppercase transition-all ${
            activeTabSection === 'alternatives'
              ? 'bg-[#00F5D4] text-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black/70 hover:bg-black/5'
          }`}
        >
          🎯 Candidate Alternatives (3)
        </button>
        <button
          onClick={() => setActiveTabSection('whynot')}
          className={`px-3.5 py-1.5 border-2 border-black font-black uppercase transition-all ${
            activeTabSection === 'whynot'
              ? 'bg-[#FF70A6] text-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black/70 hover:bg-black/5'
          }`}
        >
          ❓ Why NOT? (3 Excluded)
        </button>
        <button
          onClick={() => setActiveTabSection('triggers')}
          className={`px-3.5 py-1.5 border-2 border-black font-black uppercase transition-all ${
            activeTabSection === 'triggers'
              ? 'bg-[#A855F7] text-white shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black/70 hover:bg-black/5'
          }`}
        >
          🔄 Re-evaluation Triggers
        </button>
        <button
          onClick={() => setActiveTabSection('whatif')}
          className={`px-3.5 py-1.5 border-2 border-black font-black uppercase transition-all ${
            activeTabSection === 'whatif'
              ? 'bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black/70 hover:bg-black/5'
          }`}
        >
          🧪 What-If Simulator
        </button>
      </div>

      {/* Main Dashboard Grid */}
      {activeTabSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
          {/* Card 1: Medically Precise Critical Findings */}
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
                <span className="font-black text-[#F59E0B] block">TRIPLE-WHAMMY EXPOSURE DETECTED:</span>
                <span className="text-black/90 font-sans">Self-administered OTC Ibuprofen + active Lisinopril → Elevated AKI Risk. Clinical assessment required.</span>
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
                <Target className="w-4 h-4 text-[#00F5D4] stroke-[2.5]" /> PRIMARY RECOMMENDATION
              </span>
              <span className="text-[10px] font-black bg-[#CCFF00] border border-black px-1.5 py-0.5 text-black">REQUIRES REVIEW</span>
            </div>

            <div className="p-3 bg-[#CCFF00]/40 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-black block mb-1">PROPOSED CLINICAL PLAN:</span>
              <p className="text-xs font-extrabold text-black font-sans">"{synthesis.primaryRecommendation}"</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-black/70 block">SAFETY CONSTRAINT STATUS:</span>
              <div className="bg-[#FF70A6] text-black p-2 border border-black font-bold">
                ⛔ SAFETY CONSTRAINT TRIGGERED: {synthesis.safetyResult.blockedAction}
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
                Analgesia demand vs eGFR preservation. Evaluated across 3 safe non-systemic candidate alternatives.
              </p>
            </div>

            <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-black/70 flex items-center gap-1 mb-1">
                <BookOpen className="w-3 h-3 stroke-[2.5]" /> SUPPORTING EVIDENCE (KDIGO/CPIC):
              </span>
              <span className="text-xs font-bold text-black block truncate">
                {synthesis.evidenceChain.guidelineCitation}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Alternatives Tab */}
      {activeTabSection === 'alternatives' && (
        <div className="p-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4 font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-sm font-black uppercase flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00F5D4] stroke-[2.5]" /> Potential Candidate Alternatives Requiring Clinical Review
            </h3>
            <span className="text-[10px] font-black bg-[#00F5D4] border border-black px-2 py-0.5">3 SAFE OPTIONS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            {synthesis.candidateAlternatives.map((alt, index) => (
              <div key={alt.id} className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 relative">
                <span className="absolute top-2 right-2 bg-black text-[#FFE600] px-2 py-0.5 text-[10px] font-black font-mono border border-black">
                  OPTION {index + 1}
                </span>
                <span className="text-[10px] font-mono font-black uppercase text-black/60 block">{alt.category}</span>
                <h4 className="font-extrabold text-sm text-black">{alt.title}</h4>
                <p className="text-black/80 font-medium">{alt.description}</p>
                <div className="pt-2 border-t border-black/20 font-mono text-[11px] space-y-1">
                  <span className="font-bold block text-black">Selection Criteria:</span>
                  <p className="text-black/70">{alt.selectionCriteria}</p>
                  <span className="inline-block mt-1 bg-[#CCFF00] border border-black px-1.5 py-0.5 text-[10px] font-bold">
                    Evidence: {alt.evidenceGrade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why NOT? Tab */}
      {activeTabSection === 'whynot' && (
        <div className="p-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4 font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-sm font-black uppercase flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#FF70A6] stroke-[2.5]" /> Why NOT? Excluded & Rejected Options Rationale
            </h3>
            <span className="text-[10px] font-black bg-[#FF70A6] border border-black px-2 py-0.5 text-black">3 EXCLUDED</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {synthesis.whyNotAlternatives.map((wn) => (
              <div key={wn.id} className="p-4 bg-[#FF70A6]/15 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-wrap md:flex-nowrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="bg-[#FF70A6] text-black border border-black px-2 py-0.5 text-[10px] font-black uppercase">
                      REJECTED
                    </span>
                    <span className="font-bold text-black">{wn.title}</span>
                    <span className="text-[11px] text-black/60">({wn.category})</span>
                  </div>
                  <p className="font-medium text-black/90 pt-1">{wn.whyRejectedReason}</p>
                  <p className="font-mono text-[11px] text-[#F43F5E] font-bold">{wn.competingGoalFriction}</p>
                </div>
                <div className="bg-white border border-black p-2 font-mono text-[10px] whitespace-nowrap">
                  <span className="block font-bold">Risk Level: {wn.safetyRiskLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Re-evaluation Triggers Tab */}
      {activeTabSection === 'triggers' && (
        <div className="p-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4 font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-sm font-black uppercase flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#A855F7] stroke-[2.5]" /> What Would Change This Decision?
            </h3>
            <span className="text-[10px] font-black bg-[#A855F7] text-white border border-black px-2 py-0.5">3 TRIGGERS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            {synthesis.decisionChangeTriggers.map((trig) => (
              <div key={trig.id} className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
                <span className="text-[10px] font-mono font-black uppercase text-[#A855F7] block">{trig.metricOrCondition}</span>
                <div className="font-mono text-[11px] space-y-0.5">
                  <div>Current: <span className="font-bold text-black">{trig.currentStatus}</span></div>
                  <div>Target Threshold: <span className="font-bold text-[#3A86FF]">{trig.targetThreshold}</span></div>
                </div>
                <div className="pt-2 border-t border-black/20 font-medium text-black/90">
                  <span className="font-mono font-bold block text-[10px] uppercase text-black">Triggered Re-Evaluation Action:</span>
                  {trig.triggerAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What-If Simulator Tab */}
      {activeTabSection === 'whatif' && (
        <div className="p-6 bg-[#CCFF00]/20 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4 font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-sm font-black uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-black stroke-[2.5]" /> Closed-Loop What-If Clinical Simulator
            </h3>
            <span className="text-[10px] font-black bg-[#CCFF00] border border-black px-2 py-0.5 text-black">SIMULATION ENGINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4 bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <h4 className="font-extrabold uppercase border-b border-black pb-1">1. Modify Clinical Parameters</h4>
              
              <div className="space-y-1">
                <label className="font-bold block">Simulated eGFR (mL/min/1.73m²):</label>
                <input
                  type="number"
                  value={simEgfr}
                  onChange={(e) => setSimEgfr(Number(e.target.value))}
                  className="w-full p-2 border-2 border-black font-mono font-bold text-sm bg-[#FAF8F5]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Simulated Analgesic Therapy:</label>
                <select
                  value={simDrug}
                  onChange={(e) => setSimDrug(e.target.value)}
                  className="w-full p-2 border-2 border-black font-mono font-bold text-xs bg-[#FAF8F5]"
                >
                  <option value="Discontinued NSAID">Discontinued NSAID (Topical Only)</option>
                  <option value="Oral Ibuprofen 400mg">Re-introduce Oral Ibuprofen 400mg</option>
                </select>
              </div>

              <button
                onClick={handleRunSimulation}
                className="w-full py-2.5 bg-[#FFE600] text-black font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFE600]/80 cursor-pointer"
              >
                Run What-If Simulation
              </button>
            </div>

            <div className="space-y-3 bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <h4 className="font-extrabold uppercase border-b border-black pb-1">2. Simulation Result Impact</h4>

              {simResult ? (
                <div className="space-y-2 font-sans">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                      simResult.simulatedSafetyStatus === 'SAFE' ? 'bg-[#CCFF00] text-black' : 'bg-[#FF70A6] text-black'
                    }`}>
                      {simResult.simulatedSafetyStatus}
                    </span>
                    <span className="font-bold font-mono text-[11px]">Delta Risk: {simResult.deltaRiskLevel}</span>
                  </div>
                  <p className="font-bold text-black text-xs">"{simResult.simulatedRecommendation}"</p>
                  <p className="text-black/80 font-mono text-[11px] bg-[#FAF8F5] p-2 border border-black">
                    {simResult.explanation}
                  </p>
                </div>
              ) : (
                <p className="text-black/60 font-mono italic">
                  Adjust eGFR or drug selection on the left and click "Run What-If Simulation" to calculate closed-loop state impact.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
