import React from 'react';
import { 
  Cpu, 
  X, 
  ArrowDown, 
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  GitBranch, 
  Layers, 
  BookOpen, 
  Scale, 
  Lock, 
  Sparkles,
  AlertOctagon,
  FileCode
} from 'lucide-react';

interface EngineInspectorModalProps {
  onClose: () => void;
}

export const EngineInspectorModal: React.FC<EngineInspectorModalProps> = ({ onClose }) => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Data Ingestion & Integrity Validation',
      technicalModule: 'DataIntegrityEngine',
      status: 'PASSED',
      description: 'Ingested raw telemetry from continuous wearable streams, EHR lab draws, and daily symptom logs. Validated timestamp recency and absence of physiological boundary contradictions.',
      outputSummary: 'Trusted Patient State Model initialized with 0 data conflict red flags.'
    },
    {
      stepNumber: '02',
      title: 'Longitudinal Patient State & Temporal Delta',
      technicalModule: 'PatientStateEngine (v1.4.2)',
      status: 'DEVIATION DETECTED',
      description: 'Compared current renal biomarkers with 3-week baseline. Identified an acute 18.7% decline in eGFR (64 → 52 mL/min) and simultaneous elevation in NT-proBNP (180 → 480 pg/mL).',
      outputSummary: 'Flagged rapid cardiorenal trajectory shift (Risk Score: 78/100).'
    },
    {
      stepNumber: '03',
      title: 'Specialized Clinical Intelligence Analysis',
      technicalModule: '13 Specialized Modules (Nephrology, Triage, Pharmacology)',
      status: 'STRUCTURED REASONING',
      description: 'Specialist modules operated under input/constraint contracts. Nephrology identified afferent arteriolar constriction; Pharmacology flagged CYP2C9*3 intermediate metabolizer variant delaying clearance.',
      outputSummary: 'Candidate recommendation generated to halt systemic NSAID exposure.'
    },
    {
      stepNumber: '04',
      title: 'Knowledge Graph Traversal & Risk Mapping',
      technicalModule: 'KnowledgeGraphEngine',
      status: 'GRAPH CONNECTED',
      description: 'Traversed semantic risk relationships: OTC Ibuprofen → interacts_with → Lisinopril + HCTZ → increases_risk_of → Triple-Whammy Prerenal Hemodynamic Collapse.',
      outputSummary: 'Identified high graph edge weight (0.95) connecting NSAID to acute renal strain.'
    },
    {
      stepNumber: '05',
      title: 'Deterministic Safety Constraint Enforcement',
      technicalModule: 'SafetyConstraintEngine',
      status: 'SAFETY CONSTRAINT TRIGGERED',
      description: 'Evaluated candidate options against hard rules. Hard-blocked continuation of oral Ibuprofen in Stage 2 CKD (eGFR < 60) taking ACEi. Generated 3 non-nephrotoxic candidate alternatives.',
      outputSummary: '⛔ Oral NSAID Blocked • Substituted Safe Non-Systemic Alternatives'
    },
    {
      stepNumber: '06',
      title: 'Competing Health Priorities Resolution',
      technicalModule: 'GoalConflictEngine (Tension Matrix)',
      status: 'CONFLICT RESOLVED',
      description: 'Quantified tension between Knee Pain Relief (WOMAC < 3.0) and Renal Protection (eGFR stability). Resolved tension by selecting localized topical analgesia with <3% systemic absorption.',
      outputSummary: 'Tension score reduced from 90/100 to 12/100 via non-systemic delivery.'
    },
    {
      stepNumber: '07',
      title: 'Evidence Verification & RAG Retrieval',
      technicalModule: 'EvidenceIntelligenceEngine',
      status: 'EVIDENCE VERIFIED',
      description: 'Retrieved Level-A guideline citations from KDIGO 2023 Clinical Practice Guidelines and CPIC pharmacogenomic guidance for CYP2C9 dosing.',
      outputSummary: 'Evidence strength: HIGH • 4 Peer-reviewed clinical guideline citations attached.'
    },
    {
      stepNumber: '08',
      title: 'Care Options Synthesis & Forensic Audit Logging',
      technicalModule: 'ClinicalOrchestrator & ConsentAndAudit',
      status: 'READY FOR REVIEW',
      description: 'Synthesized 3 prioritized care options, "Why NOT?" rejection forensics, and re-evaluation triggers. Recorded 11-attribute cryptographic SHA-256 audit entry.',
      outputSummary: 'Status: PENDING_REVIEW • Waiting for human-in-the-loop clinician decision.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-4xl max-h-[92vh] flex flex-col font-mono text-xs overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#FFE600] border-b-3 border-black flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-black">
              <Cpu className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black font-display uppercase tracking-wider text-black">
                  HOW HEAL ENGINE REACHED THIS CONCLUSION
                </h3>
                <span className="bg-[#FF70A6] text-black border border-black px-2 py-0.2 text-[9px] font-black uppercase">
                  FORENSIC TRACE
                </span>
              </div>
              <p className="text-[10px] font-bold text-black/90">
                End-to-End Execution Pipeline: Ingestion → State Delta → Modules → Knowledge Graph → Safety Block → Evidence → Synthesis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-black cursor-pointer hover:bg-[#FF5722] hover:text-white transition-all"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Pipeline Steps List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FAF8F5]">
          <div className="p-3 bg-[#CCFF00]/40 border-2 border-black text-xs font-bold text-black flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-display uppercase">
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
              CLOSED-LOOP CLINICAL PIPELINE TRACE (8 VERIFIED STAGES)
            </span>
            <span className="text-[10px] font-mono bg-black text-[#CCFF00] px-2 py-0.5 border border-black">
              STATE v1.4.2
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((s, idx) => (
              <div key={s.stepNumber} className="relative">
                <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-black text-[#FFE600] font-black text-xs flex items-center justify-center border border-black">
                        {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-sm text-black font-display">{s.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-[#FAF8F5] border border-black px-2 py-0.5 font-mono text-black/70">
                        {s.technicalModule}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                        s.status === 'SAFETY CONSTRAINT TRIGGERED' ? 'bg-[#FF70A6] text-black' : 'bg-[#00F5D4] text-black'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-sans text-black/90 leading-relaxed font-medium">
                    {s.description}
                  </p>

                  <div className="pt-2 border-t border-black/20 font-mono text-[11px] font-bold text-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3A86FF] stroke-[2.5]" />
                    <span>Output: {s.outputSummary}</span>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-black stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF8F5] border-t-2 border-black flex justify-between items-center text-[11px]">
          <span className="font-bold text-black/70">Deterministic Safety Engine • Verified Against KDIGO 2023 Guidelines</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-[#FFE600] font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#FFE600] hover:text-black uppercase"
          >
            Close Forensic Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
