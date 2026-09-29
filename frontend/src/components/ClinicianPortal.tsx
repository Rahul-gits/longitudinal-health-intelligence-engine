import React, { useState } from 'react';
import { PATIENT_INFO } from '../data/mockPatientData';
import { 
  Stethoscope, 
  CheckCircle2, 
  Download,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const ClinicianPortal: React.FC = () => {
  const [physicianNotes, setPhysicianNotes] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const handoffSummary = {
    chiefComplaint: 'Worsening exertional dyspnea (Grade II), leg edema (2+), and fatigue over 3 weeks.',
    relevantHistory: 'Essential Hypertension (2021), Mild Stage 2 CKD baseline eGFR ~68 (2024), Type 2 Diabetes.',
    currentMedications: 'Lisinopril 20mg QD, Furosemide 20mg QD, Metformin 500mg BID, OTC Ibuprofen 400mg PRN (Started July 2026).',
    recentLabChanges: 'eGFR dropped from 64 to 52 mL/min (Stage 3a shift). Serum Creatinine 1.45 mg/dL. NT-proBNP 480 pg/mL.',
    aiIdentifiedConcern: 'NSAID-induced acute-on-chronic renal hemodynamics impairment due to Ibuprofen + Lisinopril combination.',
    recommendedClinicianActions: [
      'Discontinue OTC Ibuprofen; prescribe topical non-NSAID analgesia for right knee osteoarthritis.',
      'Re-check BMP / renal panel (Creatinine, Electrolytes, eGFR) in 7 days.',
      'Consider Echocardiogram order to evaluate elevated NT-proBNP (480 pg/mL) and left ventricular ejection fraction.'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Clinician Portal Header */}
      <div className="p-5 bg-[#3A86FF] text-white border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider mb-1 bg-black text-[#FFE600] px-2 py-0.5 w-fit border border-black -rotate-1">
            <Stethoscope className="w-4 h-4 stroke-[2.5]" />
            <span>CLINICAL DECISION SUPPORT PORTAL</span>
          </div>
          <h2 className="text-xl font-black font-display tracking-tight mt-1 text-white">
            CLINICAL HANDOFF: {PATIENT_INFO.name.toUpperCase()}
          </h2>
          <p className="text-xs font-mono font-bold text-white/90">
            Synthesized 30-second executive summary for Dr. Aris Thorne (Cardiology / Nephrology Review).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Clinical Handoff Report exported to EHR (Epic / Cerner FHIR API simulator).')}
            className="px-5 py-2.5 bg-[#FFE600] text-black hover:bg-[#CCFF00] font-black font-display text-xs flex items-center space-x-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer uppercase"
          >
            <Download className="w-4 h-4 text-black stroke-[2.5]" />
            <span>EXPORT FHIR HANDOFF</span>
          </button>
        </div>
      </div>

      {/* 30-Second Clinical Handoff Card */}
      <div className="p-6 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h3 className="text-sm font-black font-display text-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" /> 30-SECOND CLINICAL HANDOFF NOTE
          </h3>
          <span className="text-xs font-mono font-bold bg-[#FFE600] text-black px-2 py-0.5 border border-black">2026-08-13 19:46 IST</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black text-black uppercase block font-mono bg-[#00F5D4] px-1 w-fit border border-black">Chief Complaint & Duration</span>
            <p className="text-black font-semibold mt-1">{handoffSummary.chiefComplaint}</p>
          </div>

          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black text-black uppercase block font-mono bg-[#FF70A6] px-1 w-fit border border-black">Recent Biomarker Shift</span>
            <p className="text-black font-semibold mt-1">{handoffSummary.recentLabChanges}</p>
          </div>

          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black text-black uppercase block font-mono bg-[#FFE600] px-1 w-fit border border-black">Active Medications & OTC Risk</span>
            <p className="text-black font-semibold mt-1">{handoffSummary.currentMedications}</p>
          </div>

          <div className="p-4 bg-[#FF70A6] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black text-black uppercase block font-mono bg-black text-white px-1 w-fit">Root Cause AI Impression</span>
            <p className="text-black font-bold mt-1">{handoffSummary.aiIdentifiedConcern}</p>
          </div>
        </div>

        {/* Recommended Actions List */}
        <div className="p-4 bg-[#00F5D4] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
          <h4 className="text-xs font-black font-display text-black uppercase tracking-wider bg-black text-[#00F5D4] px-1.5 py-0.5 w-fit border border-black">Suggested Physician Orders</h4>
          <ul className="space-y-1.5 text-xs font-bold text-black pl-4 list-disc font-mono">
            {handoffSummary.recommendedClinicianActions.map((act, idx) => (
              <li key={idx}>{act}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Clinician Approval & Sign-Off Workflow */}
      <div className="p-6 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
        <h3 className="text-sm font-black font-display text-black uppercase tracking-wider flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-black stroke-[2.5]" /> PHYSICIAN APPROVAL & EHR ENTRY SIGN-OFF
        </h3>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={physicianNotes}
            onChange={(e) => setPhysicianNotes(e.target.value)}
            placeholder="Add attending physician clinical notes or modifications to care plan..."
            className="w-full bg-[#FAF8F5] border-2 border-black p-3 text-xs font-bold text-black focus:outline-none focus:bg-[#FFE600]/20 shadow-[2px_2px_0px_0px_#000]"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setIsApproved(true)}
              disabled={isApproved}
              className={`px-6 py-3 font-black font-display text-xs flex items-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_#000] uppercase transition-all cursor-pointer ${
                isApproved
                  ? 'bg-[#CCFF00] text-black shadow-[1px_1px_0px_0px_#000]'
                  : 'bg-[#3A86FF] hover:bg-[#2563EB] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isApproved ? 'CARE PLAN APPROVED & SIGNED' : 'APPROVE & SIGN CLINICAL CARE PLAN'}</span>
            </button>

            {isApproved && (
              <span className="text-xs font-mono font-black text-black bg-[#CCFF00] px-3 py-1.5 border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" /> Signed by Dr. Aris Thorne, MD (Timestamp: 2026-08-13)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
