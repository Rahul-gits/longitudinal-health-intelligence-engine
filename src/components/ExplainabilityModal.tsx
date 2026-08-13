import React from 'react';
import { PersonaTurn, ConsensusState } from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  ArrowRight
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#131B2E] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Explainability Engine — Recommendation Audit Trace
              </h3>
              <p className="text-xs text-slate-400">WHAT → WHY → EVIDENCE → UNCERTAINTY → NEXT STEP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Step 1: WHAT */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px]">1</span>
              <span>WHAT — Clinical Persona Assessment</span>
            </div>
            <h4 className="text-sm font-bold text-white pl-7">{turn.headline}</h4>
            <p className="text-xs text-slate-300 pl-7 leading-relaxed">{turn.speechText}</p>
          </div>

          {/* Step 2: WHY */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[11px]">2</span>
              <span>WHY — Cited Data Clusters & Node Reasoning</span>
            </div>
            <div className="pl-7 pt-1 flex flex-wrap gap-2">
              {turn.citedClusterIds.map(cid => (
                <span key={cid} className="px-2.5 py-1 rounded text-xs font-mono uppercase bg-slate-800 text-purple-300 border border-purple-500/30">
                  {cid} Cluster
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 pl-7 pt-1">
              Evaluated patient history of CKD Stage 2 against recent eGFR drop to 52 mL/min and current OTC Ibuprofen intake.
            </p>
          </div>

          {/* Step 3: EVIDENCE TRACE */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px]">3</span>
              <span>EVIDENCE — Clinical Guidelines & Literature (RAG Trace)</span>
            </div>
            <ul className="pl-7 space-y-1.5 text-xs text-slate-200">
              {turn.evidenceCitations?.map((cit, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-medium text-emerald-300">{cit}</span>
                </li>
              )) || (
                <li className="flex items-center space-x-2 text-slate-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>KDIGO 2024 Clinical Practice Guideline for CKD Evaluation & Management</span>
                </li>
              )}
            </ul>
          </div>

          {/* Step 4: UNCERTAINTY SCORE */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px]">4</span>
              <span>UNCERTAINTY — Confidence & Evidence Completeness</span>
            </div>
            <div className="pl-7 flex items-center space-x-4 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">MODEL UNCERTAINTY INDEX</span>
                <span className="text-lg font-bold font-mono text-amber-400">{turn.uncertaintyScore || 12}%</span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-400 block">EVIDENCE STRENGTH</span>
                <span className="text-xs font-bold text-emerald-400">{consensus.evidenceStrength}</span>
              </div>
            </div>
          </div>

          {/* Step 5: NEXT STEP */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 space-y-1">
            <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-cyan-500/30 text-white flex items-center justify-center text-[11px]">5</span>
              <span>NEXT STEP — Actionable Clinical Guidance</span>
            </div>
            <p className="text-xs font-semibold text-white pl-7 leading-relaxed">
              {consensus.recommendedNextAction}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Explainability Protocol ID: #EXP-2026-8849</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
};
