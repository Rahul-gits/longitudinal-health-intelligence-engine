import React, { useState } from 'react';
import { knowledgeGraphEngine } from '../engine/knowledgeGraphEngine';
import { evidenceIntelligenceEngine, ValidatedEvidenceItem } from '../engine/evidenceIntelligenceEngine';
import { WhySeeingThisModal, WhySeeingThisData } from './WhySeeingThisModal';
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
  Check,
  Heart,
  Pill,
  FlaskConical,
  Activity,
  Info
} from 'lucide-react';

export const ExplainWorkspace: React.FC = () => {
  const kg = knowledgeGraphEngine.getKnowledgeGraph();
  const evidenceList: ValidatedEvidenceItem[] = evidenceIntelligenceEngine.getEvidenceDatabase();
  const [dataRequested, setDataRequested] = useState<boolean>(false);
  const [selectedCluster, setSelectedCluster] = useState<'heart-kidney' | 'medications' | 'labs'>('heart-kidney');
  const [whyModalData, setWhyModalData] = useState<WhySeeingThisData | null>(null);

  const openWhyModal = () => {
    setWhyModalData({
      title: 'Health Connection: Medication & Kidney Interaction',
      changeSummary: 'Recent decrease in eGFR (64 to 52 mL/min) observed alongside OTC ibuprofen usage and daily Lisinopril.',
      contextSummary: 'Heal Engine connected your laboratory report with your reported knee pain relief medication.',
      relevanceSummary: 'Oral anti-inflammatories constrict kidney inflow while ACE inhibitors relax outflow, which can temporarily lower filtration pressure.',
      sourcesUsed: [
        'Lab Result (eGFR 52 mL/min)',
        'Medication: Lisinopril 20mg',
        'Reported: OTC Ibuprofen 400mg',
        'Genetics: CYP2C9*3'
      ],
      evidenceCount: 3,
      evidenceCitations: [
        'KDIGO 2024 Clinical Practice Guideline for CKD Evaluation',
        'FDA Bulletin: Nonsteroidal Anti-inflammatory Drugs and Renal Function',
        'CPIC Pharmacogenomics Guideline for CYP2C9'
      ],
      uncertaintyNotice: 'Potential contributing factor identified for review. Clinical assessment is required to establish definitive causality.',
      nextSteps: [
        'Discuss non-systemic topical alternatives with your healthcare team',
        'Follow up with repeat metabolic blood panel'
      ]
    });
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Human Health Banner */}
      <div className="p-6 bg-[#3A86FF] text-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>HEALTH INSIGHTS & CONNECTIONS</span>
        </div>
        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">
          Why It Matters (Health Connections)
        </h2>
        <p className="text-xs font-bold text-white/90 mt-1 max-w-3xl font-mono leading-relaxed">
          We found information that may be relevant when your recent records, daily medications, and laboratory trends are considered together.
        </p>
      </div>

      {/* Uncertainty & Medical Context Banner */}
      <div className="p-3.5 bg-[#FFE600] border-3 border-black shadow-[3px_3px_0px_0px_#000] text-black font-bold text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 uppercase font-black font-mono">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          POTENTIAL CONTRIBUTING FACTORS • NEEDS CLINICAL REVIEW
        </span>
        <button
          onClick={openWhyModal}
          className="bg-black text-[#FFE600] hover:bg-white hover:text-black px-2.5 py-1 border border-black font-mono font-black text-[10px] uppercase transition-all cursor-pointer shadow-[1px_1px_0px_0px_#000] flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why am I seeing this?</span>
        </button>
      </div>

      {/* 3 User-Friendly Health Insight Clusters */}
      <div className="space-y-3">
        <span className="text-xs font-black font-display uppercase tracking-wider text-black block">
          YOUR HEALTH CLUSTERS
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          {/* Cluster 1: Heart & Kidney */}
          <div 
            onClick={() => setSelectedCluster('heart-kidney')}
            className={`p-5 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2 cursor-pointer transition-all ${
              selectedCluster === 'heart-kidney' ? 'bg-[#CCFF00]' : 'bg-white hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-black text-sm font-display flex items-center gap-1.5 text-black">
                <Heart className="w-4 h-4 text-[#F43F5E] stroke-[2.5]" /> Heart & Kidney
              </span>
              <span className="bg-black text-[#FFE600] text-[10px] font-black font-mono px-2 py-0.5">
                4 Signals
              </span>
            </div>
            <p className="text-xs text-black/90 font-medium">
              Filtration changes and fluid balance markers connected to blood pressure medication.
            </p>
            <div className="pt-1 text-[11px] font-black font-mono flex items-center gap-1 text-black">
              <span>{selectedCluster === 'heart-kidney' ? '● Currently Exploring' : 'Explore Cluster →'}</span>
            </div>
          </div>

          {/* Cluster 2: Medications */}
          <div 
            onClick={() => setSelectedCluster('medications')}
            className={`p-5 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2 cursor-pointer transition-all ${
              selectedCluster === 'medications' ? 'bg-[#00F5D4]' : 'bg-white hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-black text-sm font-display flex items-center gap-1.5 text-black">
                <Pill className="w-4 h-4 text-black stroke-[2.5]" /> Medications
              </span>
              <span className="bg-black text-[#00F5D4] text-[10px] font-black font-mono px-2 py-0.5">
                2 Items
              </span>
            </div>
            <p className="text-xs text-black/90 font-medium">
              Over-the-counter pain relief and prescription blood pressure interactions.
            </p>
            <div className="pt-1 text-[11px] font-black font-mono flex items-center gap-1 text-black">
              <span>{selectedCluster === 'medications' ? '● Currently Exploring' : 'Explore Cluster →'}</span>
            </div>
          </div>

          {/* Cluster 3: Laboratory Trends */}
          <div 
            onClick={() => setSelectedCluster('labs')}
            className={`p-5 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2 cursor-pointer transition-all ${
              selectedCluster === 'labs' ? 'bg-[#FF70A6]' : 'bg-white hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-black text-sm font-display flex items-center gap-1.5 text-black">
                <FlaskConical className="w-4 h-4 text-black stroke-[2.5]" /> Laboratory Trends
              </span>
              <span className="bg-black text-[#FF70A6] text-[10px] font-black font-mono px-2 py-0.5">
                3 Changes
              </span>
            </div>
            <p className="text-xs text-black/90 font-medium">
              eGFR 18.7% delta, serum creatinine, and NT-proBNP fluid elevation over 3 weeks.
            </p>
            <div className="pt-1 text-[11px] font-black font-mono flex items-center gap-1 text-black">
              <span>{selectedCluster === 'labs' ? '● Currently Exploring' : 'Explore Cluster →'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* HEALTH CONNECTIONS GRAPH (Human Presentation) */}
      <div className="p-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="text-base font-black font-display text-black uppercase">
              Health Connections (How Your Records Relate)
            </h3>
          </div>
          <span className="text-[10px] font-black bg-[#CCFF00] border border-black px-2 py-0.5 font-mono">
            4-POINT CONNECTION
          </span>
        </div>

        {/* Tree-style Health Connections diagram */}
        <div className="p-5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-4 font-sans">
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-[#FF6B35] text-white font-black font-mono text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              💊 Medication: OTC Ibuprofen + Lisinopril
            </div>
            <span className="text-xs font-bold font-mono text-black">─ (Combined Intake)</span>
          </div>

          <div className="pl-6 border-l-3 border-black space-y-4">
            {/* Condition */}
            <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0"></span>
              <div>
                <span className="font-mono text-[10px] font-black uppercase text-black/60 block">Health Condition</span>
                <span className="font-bold text-xs text-black">Baseline Stage 2 Kidney Condition & Knee Joint Discomfort</span>
                <p className="text-[11px] text-black/80 mt-0.5">
                  Pain prompted self-treatment with daily oral ibuprofen over 3 weeks.
                </p>
              </div>
            </div>

            {/* Lab Trend */}
            <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#F43F5E] mt-1.5 shrink-0"></span>
              <div>
                <span className="font-mono text-[10px] font-black uppercase text-[#F43F5E] block">Laboratory Trend</span>
                <span className="font-bold text-xs text-black">eGFR shifted from 64 to 52 mL/min (-18.7% delta)</span>
                <p className="text-[11px] text-black/80 mt-0.5">
                  Consistent with temporary constriction of kidney blood flow while ibuprofen is active.
                </p>
              </div>
            </div>

            {/* Clinical Evidence */}
            <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3A86FF] mt-1.5 shrink-0"></span>
              <div>
                <span className="font-mono text-[10px] font-black uppercase text-[#3A86FF] block">Clinical Evidence</span>
                <span className="font-bold text-xs text-black">KDIGO 2024 & CPIC Pharmacogenomics Evidence</span>
                <p className="text-[11px] text-black/80 mt-0.5">
                  Documented interaction where oral NSAIDs reduce filtration pressure when paired with ACE inhibitors in CYP2C9*3 metabolizers.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={openWhyModal}
              className="px-4 py-2 bg-[#FFE600] hover:bg-[#CCFF00] text-black border-2 border-black font-black font-display text-xs shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
            >
              <Info className="w-4 h-4" />
              <span>Why are these connected? →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Information Completeness Check */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3 font-mono">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="flex items-center space-x-2">
            <FileQuestion className="w-5 h-5 text-[#F59E0B] stroke-[2.5]" />
            <h3 className="text-sm font-black font-display uppercase text-black">
              Data Check: Missing Information Notice
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-[#FFE600] text-black border border-black text-[10px] font-black uppercase">
            NOT ENOUGH INFORMATION FOR CERTAIN TESTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
          <div className="space-y-2 bg-[#FAF8F5] p-3 border-2 border-black">
            <span className="font-mono font-bold text-[11px] text-black block uppercase">Pending Records Needed:</span>
            <ul className="space-y-1 font-mono text-[11px] text-black/90">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <strong>Spot Urine Albumin-to-Creatinine Ratio (UACR)</strong>: &gt;6 months old
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <strong>Baseline 2D Echocardiogram</strong>: Pending renewal
              </li>
            </ul>
          </div>

          <div className="space-y-2 bg-[#FAF8F5] p-3 border-2 border-black flex flex-col justify-between">
            <p className="text-xs text-black/90 font-medium">
              Adding updated lab records allows Heal Engine to refine your kidney timeline and check progress.
            </p>
            <button
              onClick={() => setDataRequested(true)}
              className={`w-full py-2 border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                dataRequested ? 'bg-[#CCFF00] text-black' : 'bg-black text-[#FFE600] hover:bg-[#FFE600] hover:text-black'
              }`}
            >
              {dataRequested ? '✓ Added to Clinician Review Basket' : 'Request Updated Lab Orders'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <WhySeeingThisModal
        data={whyModalData}
        onClose={() => setWhyModalData(null)}
      />
    </div>
  );
};
