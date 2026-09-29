import React from 'react';
import { safetyConstraintEngine } from '../engine/safetyConstraintEngine';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  Lock, 
  AlertTriangle,
  FileCheck,
  Stethoscope,
  Info
} from 'lucide-react';

export const ProtectWorkspace: React.FC = () => {
  const safetyRules = safetyConstraintEngine.getSafetyRules();

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Human Health Banner */}
      <div className="p-6 bg-[#F43F5E] text-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          <span>SAFETY CHECK</span>
        </div>
        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">
          Safety & Medication Review
        </h2>
        <p className="text-xs font-bold text-white/90 mt-1 max-w-3xl font-mono leading-relaxed">
          Before displaying care options, Heal Engine automatically validates all health data against evidence-based safety rules to protect kidney function and avoid harmful drug interactions.
        </p>
      </div>

      {/* Human Safety Check Status Card */}
      <div className="p-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3 font-mono">
          <span className="font-black text-sm uppercase text-black flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00F5D4] stroke-[2.5]" /> SAFETY CHECK OVERVIEW
          </span>
          <span className="bg-[#FFE600] text-black px-2 py-0.5 text-[10px] font-black uppercase border border-black">
            ATTENTION REQUIRED
          </span>
        </div>

        <p className="font-medium text-black text-xs font-sans leading-relaxed">
          Before continuing, Heal Engine checked your information against its configured safety rules:
        </p>

        {/* 4-Point Safety Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
          <div className="p-3.5 bg-[#FAF8F5] border-2 border-black flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <span className="font-bold text-black block">Patient information checked</span>
              <span className="text-[11px] text-black/70">Stage 2 kidney history and genetic profile verified.</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] border-2 border-black flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <span className="font-bold text-black block">Relevant medication context checked</span>
              <span className="text-[11px] text-black/70">Prescription Lisinopril and OTC Ibuprofen cross-referenced.</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FFE600]/30 border-2 border-black flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <span className="font-bold text-black block">Potential safety concern identified</span>
              <span className="text-[11px] text-black/80">Oral NSAID use during ACE-inhibitor therapy may strain kidneys.</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#00F5D4]/20 border-2 border-black flex items-start gap-2.5">
            <Stethoscope className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <span className="font-bold text-black block">Further review recommended</span>
              <span className="text-[11px] text-black/80">Non-systemic pain alternatives suggested for doctor discussion.</span>
            </div>
          </div>
        </div>

        {/* Clinical Reminder Callout */}
        <div className="p-3 bg-[#FAF8F5] border-2 border-black font-mono text-[11px] font-bold text-black flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-black" />
            <span>This safety check provides decision support and does not replace a clinician's evaluation.</span>
          </span>
          <span className="text-black bg-[#CCFF00] px-2 py-0.5 border border-black text-[10px]">VERIFIED</span>
        </div>
      </div>

      {/* Safety Policy Rules (Progressive Disclosure) */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-sm font-black font-display uppercase flex items-center gap-2 text-black">
            <Lock className="w-4 h-4 text-black stroke-[2.5]" /> Configured Safety Guardrails (3 Active)
          </h3>
          <span className="text-[10px] font-black bg-[#CCFF00] text-black border border-black px-2 py-0.5">DETERMINISTIC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          {safetyRules.map((rule) => (
            <div key={rule.id} className="p-4 bg-[#FAF8F5] border-2 border-black space-y-2">
              <span className="font-mono text-[10px] font-black uppercase text-[#F43F5E] block">{rule.title}</span>
              <p className="text-black/80 font-medium">{rule.description}</p>
              <div className="pt-2 border-t border-black/20 font-mono text-[10px] font-bold text-black">
                Safety Boundary: <span className="text-[#3A86FF]">{rule.parameterLimit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
