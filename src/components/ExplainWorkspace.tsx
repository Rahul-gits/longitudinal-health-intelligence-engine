import React, { useState } from 'react';
import { knowledgeGraphEngine } from '../engine/knowledgeGraphEngine';
import { evidenceIntelligenceEngine, ValidatedEvidenceItem } from '../engine/evidenceIntelligenceEngine';
import { 
  Sparkles, 
  BookOpen, 
  GitBranch, 
  Scale, 
  AlertTriangle, 
  CheckCircle2,
  Layers,
  ArrowRight,
  HelpCircle,
  FileQuestion,
  Check
} from 'lucide-react';

export const ExplainWorkspace: React.FC = () => {
  const kg = knowledgeGraphEngine.getKnowledgeGraph();
  const evidenceList: ValidatedEvidenceItem[] = evidenceIntelligenceEngine.getEvidenceDatabase();
  const [dataRequested, setDataRequested] = useState<boolean>(false);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Pillar Banner */}
      <div className="p-5 bg-[#3A86FF] text-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>STEP 3: EXPLAIN</span>
        </div>
        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">
          Why We're Concerned (Potential Contributing Factors)
        </h2>
        <p className="text-xs font-bold text-white/90 mt-1 max-w-3xl font-mono leading-relaxed">
          Heal Engine identifies potential contributing factors for clinical review. Clinical assessment is required to establish definitive causality.
        </p>
      </div>

      {/* Prominent Medical Precision Notice */}
      <div className="p-3.5 bg-[#FFE600] border-3 border-black shadow-[3px_3px_0px_0px_#000] text-black font-bold text-xs flex items-center justify-between">
        <span className="flex items-center gap-2 uppercase font-black">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          CLINICAL ASSESSMENT REQUIRED TO ESTABLISH CAUSALITY
        </span>
        <span className="font-mono text-[10px] bg-black text-[#FFE600] px-2 py-0.5 border border-black">
          EVALUATION SUMMARY
        </span>
      </div>

      {/* 3 Potential Contributing Factors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
        {/* Factor 1 */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono">
            <span className="font-black uppercase text-[#F43F5E]">Factor 1: Medication Exposure Risk</span>
            <span className="bg-[#F43F5E] text-white px-1.5 py-0.5 text-[9px] font-black uppercase">HEMODYNAMIC</span>
          </div>
          <p className="text-xs text-black/90 font-medium leading-relaxed">
            Current NSAID exposure may increase renal risk in the context of Stage 2 CKD and concurrent ACE-inhibitor (Lisinopril) / diuretic therapy.
          </p>
        </div>

        {/* Factor 2 */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono">
            <span className="font-black uppercase text-[#F59E0B]">Factor 2: Pharmacogenomics</span>
            <span className="bg-[#F59E0B] text-black px-1.5 py-0.5 text-[9px] font-black uppercase">GENETIC VARIANT</span>
          </div>
          <div className="text-xs text-black/90 font-medium leading-relaxed space-y-1">
            <p>The patient's pharmacogenomic profile may influence NSAID metabolism, subject to specific evidence and medication involved.</p>
            <div className="bg-[#FAF8F5] p-2 border border-black font-mono text-[10px]">
              <span className="font-bold block text-black">Chain:</span>
              Ibuprofen → CYP2C9*3 → Intermediate Metabolizer → Delayed clearance potential → Applicable to systemic dosing.
            </div>
          </div>
        </div>

        {/* Factor 3 */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono">
            <span className="font-black uppercase text-[#3A86FF]">Factor 3: Symptom Burden</span>
            <span className="bg-[#3A86FF] text-white px-1.5 py-0.5 text-[9px] font-black uppercase">PAIN MANAGEMENT</span>
          </div>
          <p className="text-xs text-black/90 font-medium leading-relaxed">
            The patient's ongoing knee pain may be contributing to continued self-medication due to lack of a targeted, non-systemic prescription alternative.
          </p>
        </div>
      </div>

      {/* First-Class Missing Information & Completeness State */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="flex items-center space-x-2">
            <FileQuestion className="w-5 h-5 text-[#F59E0B] stroke-[2.5]" />
            <h3 className="text-sm font-black font-display uppercase text-black">
              Ask When It Doesn't Know: Information Completeness Check
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-[#FFE600] text-black border border-black font-mono text-[10px] font-black uppercase">
            🟡 INCOMPLETE INFORMATION (PRELIMINARY ASSESSMENT AVAILABLE)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
          <div className="space-y-2 bg-[#FAF8F5] p-3 border-2 border-black">
            <span className="font-mono font-bold text-[11px] text-black block uppercase">Pending Data Points Needed:</span>
            <ul className="space-y-1 font-mono text-[11px] text-black/90">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <strong>Spot Urine Albumin-to-Creatinine Ratio (UACR)</strong>: Pending (&gt;6 months old)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <strong>Baseline 2D Echocardiogram</strong>: Pending within last 12 months
              </li>
            </ul>
            <p className="text-[11px] text-black/70 italic mt-1">
              Why does this matter? These data points could materially affect long-term cardiorenal staging and risk calibration.
            </p>
          </div>

          <div className="space-y-2 bg-[#FAF8F5] p-3 border-2 border-black flex flex-col justify-between">
            <div>
              <span className="font-mono font-bold text-[11px] text-black block uppercase">Suggested Next Step:</span>
              <p className="text-xs text-black/90 mt-1">
                Collect missing diagnostic labs while implementing safe non-nephrotoxic analgesic candidate alternatives.
              </p>
            </div>

            <button
              onClick={() => setDataRequested(true)}
              className={`w-full py-2 border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                dataRequested ? 'bg-[#CCFF00] text-black' : 'bg-black text-[#FFE600] hover:bg-[#FFE600] hover:text-black'
              }`}
            >
              {dataRequested ? '✓ Missing Lab Orders Added to Clinician Basket' : 'Request Missing Diagnostic Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Verification */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-sm font-black font-display uppercase flex items-center gap-2 text-black">
            <BookOpen className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" /> Evidence Checked (3 Sources)
          </h3>
          <span className="text-[10px] font-black bg-[#CCFF00] text-black border border-black px-2 py-0.5">GRADE A / B</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
          {evidenceList.map((ev) => (
            <div key={ev.id} className="p-3 bg-[#FAF8F5] border-2 border-black space-y-1">
              <span className="font-mono text-[10px] font-black text-[#3A86FF] uppercase block">{ev.publication} ({ev.year})</span>
              <p className="font-bold text-black text-xs">{ev.sourceTitle}</p>
              <p className="text-[11px] text-black/80">{ev.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
