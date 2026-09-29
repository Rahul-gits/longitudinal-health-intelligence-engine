import React, { useState } from 'react';
import { clinicalOrchestrator } from '../engine/clinicalOrchestrator';
import { ClinicianReviewWorkflow } from './ClinicianReviewWorkflow';
import { 
  Stethoscope, 
  Target, 
  HelpCircle, 
  RefreshCw, 
  Sliders, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { WhatIfSimResult } from '../types/health';

export const DecideWorkspace: React.FC = () => {
  const orchestratorData = clinicalOrchestrator.runPipeline();
  const [synthesis, setSynthesis] = useState(orchestratorData.synthesisResult);
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
    <div className="space-y-6 font-mono text-xs">
      {/* Pillar Banner */}
      <div className="p-5 bg-[#00F5D4] text-black border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#00F5D4] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <Stethoscope className="w-4 h-4 stroke-[2.5]" />
          <span>STEP 5: DECIDE</span>
        </div>
        <h2 className="text-2xl font-black font-display text-black uppercase tracking-tight">
          What Should We Do? (Evidence-Informed Decision Support)
        </h2>
        <p className="text-xs font-bold text-black/90 mt-1 max-w-3xl font-mono leading-relaxed">
          Heal Engine provides evidence-informed Care Options, "Why NOT?" rejection forensics, and "What-If" simulations for mandatory clinician review.
        </p>
      </div>

      {/* 3 Care Options */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-sm font-black font-display uppercase flex items-center gap-2 text-black">
            <Target className="w-4 h-4 text-[#00F5D4] stroke-[2.5]" /> Evidence-Informed Care Options for Clinician Review
          </h3>
          <span className="text-[10px] font-black bg-[#CCFF00] text-black border border-black px-2 py-0.5">3 CANDIDATE OPTIONS</span>
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
              <div className="pt-2 border-t border-black/20 font-mono text-[10px] space-y-1">
                <span className="font-bold text-black block">Applicability Criteria:</span>
                <p className="text-black/70">{alt.selectionCriteria}</p>
                <span className="inline-block bg-[#00F5D4] border border-black px-1.5 py-0.2 text-[9px] font-bold">
                  {alt.evidenceGrade}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why NOT? & What-If Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Why NOT? Panel */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <HelpCircle className="w-4 h-4 text-[#FF70A6] stroke-[2.5]" /> Why NOT? Excluded Candidates
            </span>
            <span className="text-[10px] font-black bg-[#FF70A6] text-black border border-black px-1.5 py-0.5">3 EXCLUDED</span>
          </div>

          <div className="space-y-2 font-sans text-xs">
            {synthesis.whyNotAlternatives.map((wn) => (
              <div key={wn.id} className="p-3 bg-[#FF70A6]/15 border-2 border-black space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-black text-[#F43F5E] uppercase">❌ {wn.title}</span>
                  <span className="font-bold text-black">{wn.safetyRiskLevel}</span>
                </div>
                <p className="text-black/90 font-medium text-[11px]">{wn.whyRejectedReason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What-If Simulator Panel */}
        <div className="p-5 bg-[#CCFF00]/20 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Sliders className="w-4 h-4 text-black stroke-[2.5]" /> What If? Clinical Simulator
            </span>
            <span className="text-[10px] font-black bg-[#CCFF00] text-black border border-black px-1.5 py-0.5">INTERACTIVE</span>
          </div>

          <div className="space-y-3 bg-white p-3 border-2 border-black font-sans text-xs">
            <div className="space-y-1">
              <label className="font-mono font-bold text-[10px] uppercase block">Test Different eGFR (mL/min):</label>
              <input
                type="number"
                value={simEgfr}
                onChange={(e) => setSimEgfr(Number(e.target.value))}
                className="w-full p-2 border-2 border-black font-mono font-bold text-xs bg-[#FAF8F5]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono font-bold text-[10px] uppercase block">Test Analgesic Selection:</label>
              <select
                value={simDrug}
                onChange={(e) => setSimDrug(e.target.value)}
                className="w-full p-2 border-2 border-black font-mono font-bold text-xs bg-[#FAF8F5]"
              >
                <option value="Discontinued NSAID">Discontinued NSAID (Topical 5% Patch Only)</option>
                <option value="Oral Ibuprofen 400mg">Re-introduce Oral Ibuprofen 400mg</option>
              </select>
            </div>

            <button
              onClick={handleRunSimulation}
              className="w-full py-2 bg-[#FFE600] text-black font-black font-mono uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#FFE600]/80"
            >
              Calculate State Impact
            </button>

            {simResult && (
              <div className="p-2.5 bg-[#FAF8F5] border border-black space-y-1 font-mono text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>Simulated Status: <strong className={simResult.simulatedSafetyStatus === 'SAFE' ? 'text-[#00F5D4]' : 'text-[#F43F5E]'}>{simResult.simulatedSafetyStatus}</strong></span>
                  <span>Delta Risk: {simResult.deltaRiskLevel}</span>
                </div>
                <p className="font-sans text-[11px] text-black/80">{simResult.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinician Review Workflow */}
      <ClinicianReviewWorkflow
        synthesis={synthesis}
        onApprove={handleApprove}
        onModify={handleModify}
        onReject={handleReject}
      />
    </div>
  );
};
