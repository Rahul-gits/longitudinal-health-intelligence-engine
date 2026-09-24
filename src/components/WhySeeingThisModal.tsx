import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  FileText, 
  BookOpen, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export interface WhySeeingThisData {
  title: string;
  changeSummary: string;
  contextSummary: string;
  relevanceSummary: string;
  sourcesUsed: string[];
  evidenceCount: number;
  evidenceCitations: string[];
  uncertaintyNotice: string;
  nextSteps: string[];
}

interface WhySeeingThisModalProps {
  data: WhySeeingThisData | null;
  onClose: () => void;
  onTalkToSpecialist?: () => void;
}

export const WhySeeingThisModal: React.FC<WhySeeingThisModalProps> = ({
  data,
  onClose,
  onTalkToSpecialist
}) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border-4 border-black shadow-[10px_10px_0px_0px_#000] overflow-hidden">
        {/* Modal Top Banner */}
        <div className="px-6 py-4 border-b-3 border-black bg-[#FFE600] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center -rotate-2">
              <HelpCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-black uppercase tracking-tight">
                WHY AM I SEEING THIS?
              </h3>
              <p className="text-xs font-mono font-bold text-black/80">Transparent Health Intelligence Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-black text-white hover:bg-[#FF70A6] hover:text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-[#FAF8F5] text-xs font-sans">
          {/* Reason Headline */}
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <span className="text-[10px] font-black uppercase font-mono bg-black text-[#FFE600] px-2 py-0.5 inline-block mb-1 border border-black">
              Insight Subject
            </span>
            <h4 className="text-base font-black font-display text-black">{data.title}</h4>
            <p className="text-black/90 font-medium mt-1 leading-relaxed">{data.changeSummary}</p>
          </div>

          {/* 4 Transparent Reasons */}
          <div className="p-4 bg-[#CCFF00]/30 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
            <span className="text-[11px] font-black uppercase font-mono text-black block">
              Heal Engine showed this because:
            </span>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
                <span className="font-semibold text-black">{data.contextSummary}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
                <span className="font-semibold text-black">{data.relevanceSummary}</span>
              </li>
            </ul>
          </div>

          {/* Information Considered Checklist */}
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
            <span className="text-[11px] font-black uppercase font-mono text-black block">
              Information Considered & Checked:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
              {data.sourcesUsed.map((source, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-[#FAF8F5] border border-black">
                  <FileText className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
                  <span className="font-bold text-black text-[11px]">{source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Citations */}
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase font-mono text-black">
                Clinical Evidence Reviewed:
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black font-mono bg-[#00F5D4] text-black border border-black">
                {data.evidenceCount} Sources
              </span>
            </div>
            <ul className="space-y-1 text-black font-mono">
              {data.evidenceCitations.map((cit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[11px] font-bold">
                  <BookOpen className="w-3.5 h-3.5 text-black shrink-0" />
                  <span className="bg-[#FAF8F5] px-1.5 py-0.5 border border-black/50 w-full">{cit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Uncertainty & Safety Callout */}
          <div className="p-3.5 bg-[#FFE600]/40 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
            <div>
              <span className="text-[11px] font-black font-mono uppercase text-black block">
                Clinical Uncertainty Notice:
              </span>
              <p className="text-black font-medium text-[11px] mt-0.5">
                {data.uncertaintyNotice}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t-3 border-black flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF8F5] text-black border-2 border-black font-bold font-mono text-xs hover:bg-black/5 transition-all cursor-pointer"
          >
            Close
          </button>

          {onTalkToSpecialist && (
            <button
              onClick={() => {
                onClose();
                onTalkToSpecialist();
              }}
              className="px-4 py-2 bg-[#00F5D4] text-black border-2 border-black font-black font-display text-xs shadow-[3px_3px_0px_0px_#000] hover:bg-[#00D2B4] transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
            >
              <Stethoscope className="w-4 h-4 stroke-[2.5]" />
              <span>Talk to Virtual Specialist →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
