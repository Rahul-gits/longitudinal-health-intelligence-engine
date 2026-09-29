import React from 'react';
import { X, BookOpen, Sparkles, TrendingUp, Info } from 'lucide-react';

export interface TermDefinition {
  term: string;
  pronunciation?: string;
  simpleDefinition: string;
  whyItMatters: string;
  patientValue?: string;
  normalRange?: string;
  clinicalInterpretation: string;
}

export const MEDICAL_TERMS_DICTIONARY: Record<string, TermDefinition> = {
  'eGFR': {
    term: 'eGFR (Estimated Glomerular Filtration Rate)',
    pronunciation: 'ee-GEE-eff-ar',
    simpleDefinition: 'eGFR is a laboratory-based estimate used by clinicians as one indicator of how efficiently your kidneys are filtering natural waste from your bloodstream.',
    whyItMatters: 'Healthy kidneys filter waste at higher rates (>60 to 90 mL/min). When eGFR drops, it indicates temporary strain or reduced filtration capacity.',
    patientValue: '52 mL/min (Was 64 mL/min 3 weeks ago)',
    normalRange: '> 60 mL/min/1.73m²',
    clinicalInterpretation: 'A sudden drop of 12 points (-18.7%) occurred during recent over-the-counter NSAID use. Your healthcare team can interpret this alongside fluid levels and medication context.'
  },
  'NT-proBNP': {
    term: 'NT-proBNP (Heart & Fluid Biomarker)',
    pronunciation: 'en-tee-pro-bee-en-pee',
    simpleDefinition: 'A protein released into your bloodstream by heart muscle cells when there is increased pressure, fluid retention, or extra pumping workload.',
    whyItMatters: 'It helps determine if leg swelling or shortness of breath is related to fluid accumulation in your circulation.',
    patientValue: '480 pg/mL (Was 180 pg/mL)',
    normalRange: '< 300 pg/mL',
    clinicalInterpretation: 'The elevation suggests mild fluid retention, which commonly occurs when kidneys hold onto extra salt and water during NSAID use.'
  },
  'CYP2C9': {
    term: 'CYP2C9 Gene (Enzyme Metabolism)',
    pronunciation: 'sip-two-see-nine',
    simpleDefinition: 'A liver enzyme responsible for breaking down (metabolizing) various medications, including common anti-inflammatory pain relievers like ibuprofen.',
    whyItMatters: 'Variations in this gene (such as the *3 variant) cause "intermediate metabolism", meaning medications stay in your body approximately twice as long as average.',
    patientValue: '*1/*3 Intermediate Metabolizer',
    normalRange: '*1/*1 (Normal Metabolizer)',
    clinicalInterpretation: 'Because ibuprofen clears slower than usual, standard daily doses can accumulate in the bloodstream and place unintended prolonged strain on your kidneys.'
  },
  'ACE Inhibitor': {
    term: 'ACE Inhibitor (e.g. Lisinopril)',
    pronunciation: 'ace-in-hib-i-tor',
    simpleDefinition: 'A class of blood pressure and kidney-protective medications that work by relaxing your blood vessels.',
    whyItMatters: 'It helps lower blood pressure and preserves long-term kidney health, but requires caution when paired with over-the-counter pain medications.',
    patientValue: 'Lisinopril 20mg Daily',
    normalRange: 'Standard Prescription Regimen',
    clinicalInterpretation: 'Lisinopril relaxes the blood vessel leaving the kidney. When combined with ibuprofen (which constricts the blood vessel entering the kidney), filtration pressure temporarily drops.'
  },
  'NSAID': {
    term: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    pronunciation: 'en-said',
    simpleDefinition: 'Common pain and inflammation medications available over-the-counter (like Ibuprofen, Advil, Motrin, Aleve).',
    whyItMatters: 'While very effective for joint pain, oral NSAIDs reduce blood flow to the kidneys, which can cause kidney strain in individuals with baseline reduced kidney function.',
    patientValue: 'Oral Ibuprofen 400mg PRN (self-administered for knee pain)',
    normalRange: 'Should be used with caution in kidney patients',
    clinicalInterpretation: 'Safer alternatives exist for localized joint pain, such as topical Voltaren gel or acetaminophen, which provide relief without impacting kidney blood flow.'
  }
};

interface ExplainTermModalProps {
  termKey: string | null;
  onClose: () => void;
}

export const ExplainTermModal: React.FC<ExplainTermModalProps> = ({
  termKey,
  onClose
}) => {
  if (!termKey || !MEDICAL_TERMS_DICTIONARY[termKey]) return null;
  const termData = MEDICAL_TERMS_DICTIONARY[termKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-3 border-black bg-[#CCFF00] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-black text-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center -rotate-2">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-black uppercase tracking-tight">
                HEALTH TERM EXPLAINED
              </h3>
              <p className="text-xs font-mono font-bold text-black/80">Clear, Human Understanding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-black text-white hover:bg-[#FF70A6] hover:text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-[#FAF8F5] text-xs font-sans">
          {/* Term Title & Pronunciation */}
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <span className="text-[10px] font-black uppercase font-mono bg-black text-[#CCFF00] px-2 py-0.5 inline-block mb-1 border border-black">
              Medical Term
            </span>
            <h4 className="text-lg font-black font-display text-black">{termData.term}</h4>
            {termData.pronunciation && (
              <p className="text-[11px] font-mono text-black/60 mt-0.5">
                Pronounced: <span className="font-bold text-black">{termData.pronunciation}</span>
              </p>
            )}
          </div>

          {/* Simple Definition */}
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
            <span className="text-[11px] font-black uppercase font-mono text-black block">
              What does this mean?
            </span>
            <p className="text-black/90 font-medium leading-relaxed text-sm">
              {termData.simpleDefinition}
            </p>
          </div>

          {/* Why It Matters */}
          <div className="p-4 bg-[#FFE600]/30 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
            <span className="text-[11px] font-black uppercase font-mono text-black block">
              Why it matters for your health:
            </span>
            <p className="text-black/90 font-medium leading-relaxed">
              {termData.whyItMatters}
            </p>
          </div>

          {/* Patient Value & Clinical Context */}
          {termData.patientValue && (
            <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
              <div className="flex items-center justify-between border-b border-black/20 pb-1.5">
                <div>
                  <span className="text-[10px] font-black font-mono text-black/60 uppercase block">Your Record</span>
                  <span className="font-black text-sm text-[#F43F5E]">{termData.patientValue}</span>
                </div>
                {termData.normalRange && (
                  <div className="text-right">
                    <span className="text-[10px] font-black font-mono text-black/60 uppercase block">Typical Target</span>
                    <span className="font-bold text-xs text-black">{termData.normalRange}</span>
                  </div>
                )}
              </div>
              <p className="text-black/80 font-medium text-[11px] leading-relaxed pt-1">
                {termData.clinicalInterpretation}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t-3 border-black flex items-center justify-between">
          <span className="text-[11px] font-mono text-black/70">Source: KDIGO & Clinical Practice Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#CCFF00] text-black border-2 border-black font-black font-display text-xs shadow-[2px_2px_0px_0px_#000] hover:bg-[#B8E600] transition-all cursor-pointer uppercase"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
