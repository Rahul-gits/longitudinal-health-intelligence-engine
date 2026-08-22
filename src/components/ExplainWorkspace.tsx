import React from 'react';
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
  ArrowRight
} from 'lucide-react';

export const ExplainWorkspace: React.FC = () => {
  const kg = knowledgeGraphEngine.getKnowledgeGraph();
  const evidenceList: ValidatedEvidenceItem[] = evidenceIntelligenceEngine.getEvidenceDatabase();

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Pillar Banner */}
      <div className="p-5 bg-[#3A86FF] text-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>STEP 3: UNDERSTAND WHY</span>
        </div>
        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">
          Why Is This Happening?
        </h2>
        <p className="text-xs font-bold text-white/90 mt-1 max-w-3xl font-mono leading-relaxed">
          Heal Engine explains the root drivers connecting patient conditions, drug-drug interactions, pharmacogenomics, and competing health priorities verified against clinical guidelines.
        </p>
      </div>

      {/* 3 Contributing Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black uppercase text-[#F43F5E]">1. Drug Interaction Collision</span>
            <span className="bg-[#F43F5E] text-white px-1.5 py-0.5 text-[9px] font-black uppercase">HEMODYNAMIC</span>
          </div>
          <p className="text-xs font-sans text-black/90 font-medium leading-relaxed">
            Oral Ibuprofen constricts the renal afferent arteriole (blocking prostaglandin synthesis) while Lisinopril dilates the efferent arteriole, triggering acute intraglomerular pressure collapse.
          </p>
        </div>

        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black uppercase text-[#F59E0B]">2. Delayed Metabolism</span>
            <span className="bg-[#F59E0B] text-black px-1.5 py-0.5 text-[9px] font-black uppercase">GENETIC VARIANT</span>
          </div>
          <p className="text-xs font-sans text-black/90 font-medium leading-relaxed">
            Patient carries the CYP2C9*3 allele. Ibuprofen clearance rate is reduced by ~50%, leading to drug accumulation and prolonged renal tissue exposure.
          </p>
        </div>

        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black uppercase text-[#3A86FF]">3. Competing Priorities</span>
            <span className="bg-[#3A86FF] text-white px-1.5 py-0.5 text-[9px] font-black uppercase">PAIN VS KIDNEY</span>
          </div>
          <p className="text-xs font-sans text-black/90 font-medium leading-relaxed">
            Patient prioritized knee arthritis pain relief for daily mobility, self-medicating with over-the-counter NSAIDs due to lack of an effective localized non-systemic prescription.
          </p>
        </div>
      </div>

      {/* Clinical Evidence Verification Box */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-sm font-black font-display uppercase flex items-center gap-2 text-black">
            <BookOpen className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" /> Evidence Verified (Peer-Reviewed Clinical Guidelines)
          </h3>
          <span className="text-[10px] font-black bg-[#CCFF00] text-black border border-black px-2 py-0.5">3 SOURCES RETRIEVED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
          {evidenceList.map((ev) => (
            <div key={ev.id} className="p-3 bg-[#FAF8F5] border-2 border-black space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black text-[#3A86FF] uppercase truncate max-w-[200px]">{ev.publication} ({ev.year})</span>
                <span className="font-mono text-[9px] font-bold bg-white px-1 border border-black">{ev.evidenceGrade.split(' ')[0]}</span>
              </div>
              <p className="font-bold text-black text-xs">{ev.sourceTitle}</p>
              <p className="text-[11px] text-black/80 font-medium">{ev.summary}</p>
              <p className="font-mono text-[10px] text-[#A855F7] pt-1 border-t border-black/20">Application: {ev.applicableToPatientReason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
