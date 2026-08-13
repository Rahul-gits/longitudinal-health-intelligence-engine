import React, { useState } from 'react';
import { PATIENT_INFO } from '../data/mockPatientData';
import { 
  Stethoscope, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
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
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Clinical Decision Support System (CDSS) Portal</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            AI-Generated Clinical Handoff: {PATIENT_INFO.name}
          </h2>
          <p className="text-xs text-slate-300">
            Synthesized 30-second executive summary for Dr. Aris Thorne (Cardiology / Nephrology Review).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Clinical Handoff Report exported to EHR (Epic / Cerner FHIR API simulator).')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export FHIR Handoff</span>
          </button>
        </div>
      </div>

      {/* 30-Second Clinical Handoff Card */}
      <div className="p-6 rounded-2xl bg-[#131B2E] border border-blue-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" /> 30-Second Clinical Handoff Note
          </h3>
          <span className="text-xs text-slate-400 font-mono">Generated: 2026-08-13 19:46 IST</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase block">Chief Complaint & Duration</span>
            <p className="text-slate-200">{handoffSummary.chiefComplaint}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase block">Recent Biomarker Shift</span>
            <p className="text-slate-200">{handoffSummary.recentLabChanges}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase block">Active Medications & OTC Risk</span>
            <p className="text-slate-200">{handoffSummary.currentMedications}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
            <span className="text-[10px] font-bold text-rose-300 uppercase block">Root Cause AI Impression</span>
            <p className="text-slate-200">{handoffSummary.aiIdentifiedConcern}</p>
          </div>
        </div>

        {/* Recommended Actions List */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Suggested Physician Orders</h4>
          <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc">
            {handoffSummary.recommendedClinicianActions.map((act, idx) => (
              <li key={idx}>{act}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Clinician Approval & Sign-Off Workflow */}
      <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-400" /> Physician Approval & EHR Entry Sign-Off
        </h3>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={physicianNotes}
            onChange={(e) => setPhysicianNotes(e.target.value)}
            placeholder="Add attending physician clinical notes or modifications to care plan..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsApproved(true)}
              disabled={isApproved}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproved ? 'Care Plan Approved & Signed' : 'Approve & Sign Clinical Care Plan'}</span>
            </button>

            {isApproved && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Signed by Dr. Aris Thorne, MD (Timestamp: 2026-08-13)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
