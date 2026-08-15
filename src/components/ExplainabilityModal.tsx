import React from 'react';
import { PersonaTurn, ConsensusState } from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';
import { 
  X, 
  BookOpen, 
  Sparkles
} from 'lucide-react';

interface ExplainabilityModalProps {
  turn: PersonaTurn;
  consensus: ConsensusState;
  onClose: () => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  turn,
  consensus,
  onClose
}) => {
  const profile = PERSONA_PROFILES[turn.personaId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border-4 border-black shadow-[10px_10px_0px_0px_#000] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-3 border-black bg-[#FFE600] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center -rotate-2">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-black uppercase tracking-tight">
                EXPLAINABILITY ENGINE — AUDIT TRACE
              </h3>
              <p className="text-xs font-mono font-bold text-black/80">WHAT → WHY → EVIDENCE → UNCERTAINTY → NEXT STEP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-black text-white hover:bg-[#FF70A6] hover:text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-[#FAF8F5]">
          {/* Step 1: WHAT */}
          <div className="p-4 bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
            <div className="flex items-center space-x-2 text-black text-xs font-black font-display uppercase tracking-wider">
              <span className="w-6 h-6 bg-[#00F5D4] text-black border border-black flex items-center justify-center text-xs font-black font-mono">1</span>
              <span>WHAT — Clinical Assessment</span>
            </div>
            <h4 className="text-sm font-extrabold font-display text-black pl-8">{turn.headline}</h4>
            <p className="text-xs font-semibold text-black/90 pl-8 leading-relaxed">{turn.speechText}</p>
          </div>

          {/* Step 2: WHY */}
          <div className="p-4 bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
            <div className="flex items-center space-x-2 text-black text-xs font-black font-display uppercase tracking-wider">
              <span className="w-6 h-6 bg-[#FF70A6] text-black border border-black flex items-center justify-center text-xs font-black font-mono">2</span>
              <span>WHY — Cited Data Clusters & Node Reasoning</span>
            </div>
            <div className="pl-8 pt-1 flex flex-wrap gap-2">
              {turn.citedClusterIds.map(cid => (
                <span key={cid} className="px-2.5 py-1 text-xs font-mono font-black uppercase bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                  {cid} Cluster
                </span>
              ))}
            </div>
            <p className="text-xs font-semibold text-black/80 pl-8 pt-1">
              Evaluated patient history of CKD Stage 2 against recent eGFR drop to 52 mL/min and current OTC Ibuprofen intake.
            </p>
          </div>

          {/* Step 3: EVIDENCE TRACE */}
          <div className="p-4 bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
            <div className="flex items-center space-x-2 text-black text-xs font-black font-display uppercase tracking-wider">
              <span className="w-6 h-6 bg-[#CCFF00] text-black border border-black flex items-center justify-center text-xs font-black font-mono">3</span>
              <span>EVIDENCE — RAG Clinical Guideline Trace</span>
            </div>
            <ul className="pl-8 space-y-1.5 text-xs text-black">
              {turn.evidenceCitations?.map((cit, idx) => (
                <li key={idx} className="flex items-center space-x-2 font-bold font-mono">
                  <BookOpen className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                  <span className="bg-[#CCFF00] px-1 border border-black">{cit}</span>
                </li>
              )) || (
                <li className="flex items-center space-x-2 font-bold font-mono">
                  <BookOpen className="w-4 h-4 stroke-[2.5]" />
                  <span>KDIGO 2024 Clinical Practice Guideline for CKD Evaluation</span>
                </li>
              )}
            </ul>
          </div>

          {/* Step 4: UNCERTAINTY SCORE */}
          <div className="p-4 bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
            <div className="flex items-center space-x-2 text-black text-xs font-black font-display uppercase tracking-wider">
              <span className="w-6 h-6 bg-[#FF6B35] text-white border border-black flex items-center justify-center text-xs font-black font-mono">4</span>
              <span>UNCERTAINTY — Confidence Metrics</span>
            </div>
            <div className="pl-8 flex items-center space-x-4 pt-1 font-mono font-bold">
              <div>
                <span className="text-[10px] text-black/70 block">MODEL UNCERTAINTY</span>
                <span className="text-lg font-black text-black bg-[#FF6B35] px-1.5 border border-black">{turn.uncertaintyScore || 12}%</span>
              </div>
              <div className="h-8 w-0.5 bg-black"></div>
              <div>
                <span className="text-[10px] text-black/70 block">EVIDENCE GRADE</span>
                <span className="text-xs font-black bg-[#CCFF00] px-1.5 border border-black">{consensus.evidenceStrength}</span>
              </div>
            </div>
          </div>

          {/* Step 5: NEXT STEP */}
          <div className="p-4 bg-[#00F5D4] border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-1">
            <div className="flex items-center space-x-2 text-black text-xs font-black font-display uppercase tracking-wider">
              <span className="w-6 h-6 bg-black text-[#00F5D4] flex items-center justify-center text-xs font-black font-mono">5</span>
              <span>NEXT STEP — Clinical Action</span>
            </div>
            <p className="text-xs font-black text-black pl-8 leading-relaxed font-display mt-1">
              {consensus.recommendedNextAction}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FFFFFF] border-t-3 border-black flex items-center justify-between text-xs font-mono font-bold">
          <span>EXPLAINABILITY ID: #EXP-2026-8849</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FFE600] text-black border-2 border-black font-black font-display text-xs shadow-[2px_2px_0px_0px_#000] hover:bg-[#CCFF00] transition-all cursor-pointer uppercase"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
