import React from 'react';
import { 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  BookOpen, 
  Clock, 
  Activity, 
  AlertTriangle,
  HelpCircle,
  Database
} from 'lucide-react';

interface EvidenceProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  biomarkerName?: string;
  baselineValue?: string;
  currentValue?: string;
  percentageChange?: string;
}

export const EvidenceProvenanceModal: React.FC<EvidenceProvenanceModalProps> = ({
  isOpen,
  onClose,
  biomarkerName = 'eGFR (Estimated Glomerular Filtration Rate)',
  baselineValue = '64 mL/min',
  currentValue = '52 mL/min',
  percentageChange = '-18.7% decline'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Clinical Evidence & Provenance Inspector</h2>
              <p className="text-xs text-slate-400">Deep audit trail of medical guidelines, data completeness, and reasoning</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Section 1: WHY THIS WAS FLAGGED */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>WHY THIS WAS FLAGGED</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200/80 text-amber-950">
                Safety Boundary Active
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Biomarker Trajectory</span>
                <span className="text-base font-bold text-slate-900">{biomarkerName}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Decline Detected</span>
                <span className="text-base font-black text-rose-600">{baselineValue} → {currentValue} ({percentageChange})</span>
              </div>
            </div>

            {/* Sparkline Visual Simulation */}
            <div className="bg-white p-3 rounded-lg border border-amber-200/80 font-mono text-xs text-slate-600 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-sans font-medium">
                <span>Longitudinal Trend (Weekly Interval)</span>
                <span>Delta: -12 mL/min in 4 wks</span>
              </div>
              <div className="py-2 flex items-end justify-between h-16 border-b border-slate-200 px-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-700">64</span>
                  <div className="w-3 bg-blue-400 rounded-t h-12"></div>
                  <span className="text-[9px] text-slate-400">Wk 1</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-700">61</span>
                  <div className="w-3 bg-blue-400 rounded-t h-10"></div>
                  <span className="text-[9px] text-slate-400">Wk 2</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-700">56</span>
                  <div className="w-3 bg-amber-400 rounded-t h-8"></div>
                  <span className="text-[9px] text-slate-400">Wk 3</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-rose-600">52</span>
                  <div className="w-3 bg-rose-500 rounded-t h-6 animate-pulse"></div>
                  <span className="text-[9px] text-rose-600 font-bold">Wk 4</span>
                </div>
              </div>
            </div>

            {/* Patient Clinical Contributing Factors */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-900 block">Patient Clinical Context Factors:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-amber-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">CKD Stage 3b</span>
                </div>
                <div className="p-2 bg-white rounded border border-amber-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">ACEi (Lisinopril)</span>
                </div>
                <div className="p-2 bg-white rounded border border-amber-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="font-medium text-slate-800">NSAID Exposure</span>
                </div>
              </div>
            </div>

            {/* Potential Contributing Factors Note */}
            <div className="p-2.5 bg-amber-100/50 rounded-lg text-xs text-amber-900 border border-amber-200/60">
              <span className="font-bold block mb-0.5">Potential contributing factors (Hypothesis, not absolute certainty):</span>
              Transient hemodynamic afferent arteriolar vasoconstriction from systemic Ibuprofen interacting with efferent vasodilation from Lisinopril.
            </div>
          </div>

          {/* Section 2: MULTI-DIMENSIONAL UNCERTAINTY MATRIX */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Confidence</span>
              <span className="text-sm font-bold text-emerald-700">HIGH (94%)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Evidence Strength</span>
              <span className="text-sm font-bold text-blue-700">Level A (KDIGO)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Data Completeness</span>
              <span className="text-sm font-bold text-amber-700">PARTIAL</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Clinician Review</span>
              <span className="text-sm font-bold text-rose-700">MANDATORY</span>
            </div>
          </div>

          {/* Section 3: EXACT GUIDELINE PROVENANCE */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Guideline Source & Semantic Retrieval Provenance</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Chunk ID: kdigo-2024-sec4.2-c03</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Source Organization</span>
                <span className="font-bold text-slate-900">KDIGO (Kidney Disease: Improving Global Outcomes)</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Guideline & Edition</span>
                <span className="font-bold text-slate-900">CKD Clinical Practice Guideline (2024 Update)</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Section & Table</span>
                <span className="font-bold text-slate-900">Section 4.2, Table 12 (Hemodynamic Interactions)</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Vector Semantic Score</span>
                <span className="font-bold text-emerald-700">0.942 Similarity (BioMed Embeddings v2)</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs italic text-slate-600 font-serif leading-relaxed">
              "Recommendation 4.2.1: In patients with CKD Stage 3b or worse (eGFR &lt; 45 mL/min/1.73m²) concurrently receiving renin-angiotensin-aldosterone system (RAAS) inhibitors, systemic nonsteroidal anti-inflammatory drugs (NSAIDs) should be avoided due to the compounded risk of acute drop in intraglomerular hydrostatic pressure and accelerated functional decline. Topical formulations with low systemic bioavailability may be considered for localized joint symptoms under clinical supervision."
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Retrieved: Today from Versioned Guideline Index</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Provenance View
          </button>
        </div>
      </div>
    </div>
  );
};
