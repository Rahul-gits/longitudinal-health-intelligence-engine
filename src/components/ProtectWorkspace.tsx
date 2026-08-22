import React from 'react';
import { safetyConstraintEngine } from '../engine/safetyConstraintEngine';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  Lock, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export const ProtectWorkspace: React.FC = () => {
  const safetyRules = safetyConstraintEngine.getSafetyRules();

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Pillar Banner */}
      <div className="p-5 bg-[#F43F5E] text-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
          <span>STEP 4: PROTECT SAFELY</span>
        </div>
        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">
          Is Anything Potentially Unsafe?
        </h2>
        <p className="text-xs font-bold text-white/90 mt-1 max-w-3xl font-mono leading-relaxed">
          Heal Engine applies deterministic safety constraints that cannot be casually overridden. All candidate actions must satisfy hard organ clearance, allergy, and drug-disease interaction boundaries.
        </p>
      </div>

      {/* Safety Constraint Triggered Notice */}
      <div className="p-5 bg-[#FF70A6]/20 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono">
          <span className="font-black text-sm uppercase text-[#F43F5E] flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 stroke-[2.5]" /> SAFETY CONSTRAINT TRIGGERED: ORAL NSAID BLOCKED
          </span>
          <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[10px] font-black uppercase border border-black">
            HARD SAFETY BLOCK
          </span>
        </div>

        <p className="font-medium text-black leading-relaxed">
          <strong>Flagged Action:</strong> Continuation or dose escalation of oral non-selective NSAIDs (Ibuprofen 400mg) in a patient with baseline Stage 2 CKD ($eGFR = 52$ mL/min) receiving active ACE Inhibitor therapy (Lisinopril 20mg).
        </p>

        <div className="p-3 bg-white border-2 border-black font-mono text-[11px] font-bold text-black flex items-center justify-between">
          <span>Action Required: Discontinue oral NSAID & initiate safe candidate alternative.</span>
          <span className="text-[#3A86FF]">Governance Escalation Protocol Required for Override</span>
        </div>
      </div>

      {/* Deterministic Hard Safety Rules */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-sm font-black font-display uppercase flex items-center gap-2 text-black">
            <ShieldCheck className="w-4 h-4 text-[#00F5D4] stroke-[2.5]" /> Active Deterministic Safety Guardrails
          </h3>
          <span className="text-[10px] font-black bg-[#CCFF00] text-black border border-black px-2 py-0.5">3 ACTIVE CONSTRAINTS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          {safetyRules.map((rule) => (
            <div key={rule.id} className="p-4 bg-[#FAF8F5] border-2 border-black space-y-2">
              <span className="font-mono text-[10px] font-black uppercase text-[#F43F5E] block">{rule.title}</span>
              <p className="text-black/80 font-medium">{rule.description}</p>
              <div className="pt-2 border-t border-black/20 font-mono text-[10px] font-bold text-black">
                Limit: <span className="text-[#3A86FF]">{rule.parameterLimit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
