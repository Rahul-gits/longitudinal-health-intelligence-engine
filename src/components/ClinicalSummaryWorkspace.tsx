import React, { useState } from 'react';
import { 
  ClipboardList, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Share2, 
  Download, 
  Sparkles,
  HelpCircle,
  TrendingDown,
  Pill,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDynamicPatientProfile } from '../data/mockPatientData';
import { WhySeeingThisModal, WhySeeingThisData } from './WhySeeingThisModal';

interface ClinicalSummaryWorkspaceProps {
  onNavigateTab?: (tab: string) => void;
}

export const ClinicalSummaryWorkspace: React.FC<ClinicalSummaryWorkspaceProps> = ({
  onNavigateTab
}) => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);
  const [viewMode, setViewMode] = useState<'patient' | 'clinician'>('patient');
  const [whyModalData, setWhyModalData] = useState<WhySeeingThisData | null>(null);

  const openWhyModal = () => {
    setWhyModalData({
      title: 'Screening Summary & Care Recommendations',
      changeSummary: 'Recent decrease in estimated kidney filtration from 64 to 52 mL/min coinciding with OTC ibuprofen use for knee discomfort.',
      contextSummary: 'Combines your recent lab report with self-reported knee pain and daily medication list.',
      relevanceSummary: 'Oral anti-inflammatories temporarily reduce blood flow to the kidneys, especially when taken with Lisinopril.',
      sourcesUsed: [
        'Lab Result (eGFR 52 mL/min)',
        'Active Medication: Lisinopril 20mg',
        'Reported OTC Ibuprofen 400mg',
        'Genetic Panel: CYP2C9*3'
      ],
      evidenceCount: 3,
      evidenceCitations: [
        'KDIGO 2024 Clinical Practice Guideline for CKD',
        'FDA Drug Safety Communication on NSAID-RAAS Blocker Interactions',
        'CPIC Pharmacogenomic Guideline for CYP2C9 and NSAIDs'
      ],
      uncertaintyNotice: 'This is a potential contributing factor identified for review. Do not discontinue prescription blood pressure medications without speaking with your healthcare provider.',
      nextSteps: [
        'Discuss topical non-systemic alternatives with your clinician',
        'Schedule repeat metabolic panel in 2 weeks'
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#00F5D4] border-3 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-wider mb-1 bg-black text-[#00F5D4] px-2.5 py-0.5 w-fit border border-black -rotate-1">
              <ClipboardList className="w-4 h-4 stroke-[2.5]" />
              <span>CLINICAL SCREENING & HANDOFF SUMMARY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-black tracking-tight mt-1">
              {viewMode === 'patient' ? 'YOUR SCREENING SUMMARY' : 'CLINICAL HANDOFF REPORT'}
            </h1>
            <p className="text-xs font-bold text-black/90 mt-1 max-w-2xl font-mono">
              {viewMode === 'patient'
                ? 'A clear, simple summary of what you shared, what Heal Engine noticed, and what to discuss next.'
                : 'Standardized clinical decision support synthesis with structured findings, safety flags, and evidence trace.'}
            </p>
          </div>

          {/* Dual Mode View Switcher */}
          <div className="flex items-center bg-white p-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-bold font-mono">
            <button
              onClick={() => setViewMode('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border transition-all cursor-pointer ${
                viewMode === 'patient'
                  ? 'bg-[#FFE600] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-transparent text-black/70 hover:bg-black/5'
              }`}
            >
              <User className="w-4 h-4 stroke-[2.5]" />
              <span>Patient View</span>
            </button>
            <button
              onClick={() => setViewMode('clinician')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border transition-all cursor-pointer ${
                viewMode === 'clinician'
                  ? 'bg-[#3A86FF] text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-transparent text-black/70 hover:bg-black/5'
              }`}
            >
              <Stethoscope className="w-4 h-4 stroke-[2.5]" />
              <span>Clinician View</span>
            </button>
          </div>
        </div>
      </div>

      {/* PATIENT VIEW (Human Language) */}
      {viewMode === 'patient' && (
        <div className="space-y-6">
          {/* Card 1: What You Told Us */}
          <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
                <FileText className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" /> What You Shared With Us
              </span>
              <span className="text-[10px] font-black bg-[#CCFF00] border border-black px-1.5 py-0.5 font-mono">
                Recent Screening
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] border-2 border-black">
                <span className="font-mono font-bold text-[10px] text-black/60 block uppercase">Reported Discomfort</span>
                <span className="font-extrabold text-black">Bilateral knee joint pain when walking or climbing stairs.</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border-2 border-black">
                <span className="font-mono font-bold text-[10px] text-black/60 block uppercase">Self-Administered Relief</span>
                <span className="font-extrabold text-black">Taking OTC Ibuprofen 400mg ~2 times daily for the past 3 weeks.</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border-2 border-black">
                <span className="font-mono font-bold text-[10px] text-black/60 block uppercase">New Physical Observation</span>
                <span className="font-extrabold text-black">Mild swelling in both lower legs and ankles over the last week.</span>
              </div>
            </div>
          </div>

          {/* Card 2: What Heal Engine Noticed (4-Layer Pattern) */}
          <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
                <Sparkles className="w-4 h-4 text-[#FFE600] stroke-[2.5]" /> What Heal Engine Noticed
              </span>
              <button
                onClick={openWhyModal}
                className="text-[11px] font-black font-mono bg-[#FFE600] hover:bg-[#CCFF00] border border-black px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_0px_0px_#000]"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why am I seeing this?</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Layer 1: What Changed? */}
              <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="font-mono font-black text-[10px] text-[#F43F5E] block uppercase">What Changed?</span>
                <p className="text-black font-bold mt-0.5">
                  Your estimated kidney filtration (eGFR) shifted from 64 to 52 mL/min on your latest lab results.
                </p>
              </div>

              {/* Layer 2: Why It Matters */}
              <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="font-mono font-black text-[10px] text-[#FF70A6] block uppercase">Why It Matters</span>
                <p className="text-black font-medium mt-0.5 leading-relaxed">
                  Oral ibuprofen temporarily constricts blood vessels supplying the kidneys. Because you take Lisinopril and have a genetic variant (CYP2C9*3) that clears ibuprofen slower, this combination may explain the temporary change in lab results.
                </p>
              </div>

              {/* Layer 3: What Did Heal Engine Use? */}
              <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="font-mono font-black text-[10px] text-black/60 block uppercase mb-1.5">What Did Heal Engine Use?</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 bg-white p-2 border border-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>Recent lab report</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 border border-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>Previous lab results</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 border border-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>Medication history</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 border border-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>Clinical guidelines</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Questions to Discuss with Your Clinician */}
          <div className="p-5 bg-[#FFE600]/30 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
            <span className="text-xs font-black font-display uppercase tracking-wider text-black block">
              💬 Questions to Discuss with Your Healthcare Provider
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border-2 border-black font-bold flex items-start gap-2">
                <span className="w-5 h-5 bg-black text-[#FFE600] text-[10px] font-mono flex items-center justify-center shrink-0">1</span>
                <span>"Could my recent knee pain medication (ibuprofen) be contributing to my lower kidney numbers or leg swelling?"</span>
              </div>
              <div className="p-3 bg-white border-2 border-black font-bold flex items-start gap-2">
                <span className="w-5 h-5 bg-black text-[#FFE600] text-[10px] font-mono flex items-center justify-center shrink-0">2</span>
                <span>"Is a topical pain reliever (like Voltaren gel) or acetaminophen safer for my kidneys to relieve knee stiffness?"</span>
              </div>
              <div className="p-3 bg-white border-2 border-black font-bold flex items-start gap-2">
                <span className="w-5 h-5 bg-black text-[#FFE600] text-[10px] font-mono flex items-center justify-center shrink-0">3</span>
                <span>"When should I repeat my routine blood and urine tests to see if kidney function has normalized?"</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="text-xs font-bold text-black font-mono">
              Ready to talk with an AI specialist or review follow-ups?
            </div>
            <div className="flex items-center gap-3">
              {onNavigateTab && (
                <>
                  <button
                    onClick={() => onNavigateTab('virtual-doctor')}
                    className="px-4 py-2 bg-[#00F5D4] text-black border-2 border-black font-black font-display text-xs shadow-[2px_2px_0px_0px_#000] hover:bg-[#00D2B4] transition-all cursor-pointer uppercase"
                  >
                    Talk to Virtual Specialist →
                  </button>
                  <button
                    onClick={() => onNavigateTab('recovery')}
                    className="px-4 py-2 bg-[#CCFF00] text-black border-2 border-black font-black font-display text-xs shadow-[2px_2px_0px_0px_#000] hover:bg-[#B8E600] transition-all cursor-pointer uppercase"
                  >
                    View Follow-Up Plan →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLINICIAN VIEW (Technical Precision) */}
      {viewMode === 'clinician' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Header Card */}
          <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-black">
                <Stethoscope className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" /> PATIENT LONGITUDINAL CONTEXT
              </span>
              <span className="text-[10px] font-black bg-[#3A86FF] text-white border border-black px-1.5 py-0.5">
                FHIR R4 SYNCHRONIZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="text-[10px] text-black/60 uppercase block">Demographics</span>
                <span className="font-extrabold text-black">{currentPatient.name}, {currentPatient.age}yo {currentPatient.gender}</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="text-[10px] text-black/60 uppercase block">Renal Baseline</span>
                <span className="font-extrabold text-[#F43F5E]">eGFR 52 mL/min (-18.7% delta)</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="text-[10px] text-black/60 uppercase block">Hemodynamics</span>
                <span className="font-extrabold text-black">BP 138/86 mmHg • NT-proBNP 480</span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="text-[10px] text-black/60 uppercase block">Pharmacogenomics</span>
                <span className="font-extrabold text-black">CYP2C9*3 Intermediate</span>
              </div>
            </div>
          </div>

          {/* Structured Clinical Findings & Safety Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <span className="text-xs font-black uppercase text-[#F43F5E] block">
                🚨 HARD SAFETY CONSTRAINTS & ESCALATIONS
              </span>
              <ul className="space-y-2">
                <li className="p-2 bg-[#FEE2E2] border border-black flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#991B1B] block">Triple Whammy / Hemodynamic Risk Flag</span>
                    <span className="text-[11px] text-black/80">Oral NSAID + ACEi + Baseline Stage 2 CKD triggered automatic alert.</span>
                  </div>
                </li>
                <li className="p-2 bg-[#FAF8F5] border border-black flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-black block">Safety Gate Validated</span>
                    <span className="text-[11px] text-black/80">All automated suggestions constrained to non-systemic topical therapy.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <span className="text-xs font-black uppercase text-black block">
                📚 EVIDENCE BASE & GUIDELINE CITATIONS
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 bg-[#FAF8F5] border border-black font-bold">
                  • KDIGO 2024 CKD Guideline: Section 4.2 Hemodynamic autoregulation during RAAS blockade.
                </div>
                <div className="p-2 bg-[#FAF8F5] border border-black font-bold">
                  • CPIC Guideline: Recommendation for NSAID dosing in CYP2C9 intermediate/poor metabolizers.
                </div>
                <div className="p-2 bg-[#FAF8F5] border border-black font-bold">
                  • OARSI 2023 Guidelines: Topical NSAIDs strongly recommended over oral NSAIDs in knee OA with renal risk.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Am I Seeing This Modal */}
      <WhySeeingThisModal
        data={whyModalData}
        onClose={() => setWhyModalData(null)}
        onTalkToSpecialist={() => onNavigateTab && onNavigateTab('virtual-doctor')}
      />
    </div>
  );
};
