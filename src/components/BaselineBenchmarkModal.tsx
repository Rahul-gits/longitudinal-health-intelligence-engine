import { useState } from 'react';
import { baselineBenchmarkEngine } from '../engine/baselineBenchmarkEngine';
import { 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  X, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BaselineBenchmarkModalProps {
  onClose: () => void;
}

export const BaselineBenchmarkModal: React.FC<BaselineBenchmarkModalProps> = ({ onClose }) => {
  const benchmark = baselineBenchmarkEngine.getBenchmark();
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison'>('comparison');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-4 border-black shadow-[10px_10px_0px_0px_#000] w-full max-w-4xl max-h-[92vh] flex flex-col font-mono text-xs overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 bg-[#FFE600] border-b-3 border-black flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-black">
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black font-display uppercase tracking-wider text-black">
                KILLER DEMO BENCHMARK: LLM VS HEAL ENGINE
              </h3>
              <p className="text-[10px] font-bold text-black/90">Comparative Safety & Clinical Adherence Validation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-black cursor-pointer hover:bg-[#FF5722] hover:text-white transition-all"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Patient Case Summary Banner */}
        <div className="p-4 bg-[#FAF8F5] border-b-2 border-black flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-[#F43F5E] stroke-[2.5] shrink-0 mt-0.5" />
          <div>
            <span className="font-black font-display text-black block text-sm">{benchmark.scenarioName}</span>
            <p className="text-black/80 font-sans mt-0.5 leading-relaxed">{benchmark.patientCaseSummary}</p>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#FAF8F5]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Baseline A: Simple LLM */}
            <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
              <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                <span className="font-black font-display text-xs uppercase bg-[#FF5722] text-white px-2 py-0.5 border border-black">
                  BASELINE A: SIMPLE LLM
                </span>
                <XCircle className="w-4 h-4 text-[#FF5722] stroke-[2.5]" />
              </div>

              <div className="bg-[#FF5722]/10 p-2.5 border border-[#FF5722]/40 min-h-[90px]">
                <span className="text-[10px] font-black uppercase text-black/70 block">RECOMMENDATION:</span>
                <p className="text-xs font-bold text-black font-sans mt-1">{benchmark.baselineA_LLM.recommendation}</p>
              </div>

              <div className="space-y-1.5 text-[11px] font-black">
                <div className="flex justify-between border-b border-black/20 pb-1">
                  <span>CLINICAL SAFETY:</span>
                  <span className="text-[#FF5722]">FAILED (UNSAFE)</span>
                </div>
                <div className="flex justify-between border-b border-black/20 pb-1">
                  <span>CONTRAINDICATION:</span>
                  <span className="text-[#FF5722]">MISSED</span>
                </div>
                <div className="flex justify-between">
                  <span>GUIDELINE ADHERENCE:</span>
                  <span className="text-black">{benchmark.baselineA_LLM.guidelineAdherence}%</span>
                </div>
              </div>
            </div>

            {/* Baseline B: LLM + RAG */}
            <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
              <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                <span className="font-black font-display text-xs uppercase bg-[#F59E0B] text-black px-2 py-0.5 border border-black">
                  BASELINE B: LLM + RAG
                </span>
                <XCircle className="w-4 h-4 text-[#F59E0B] stroke-[2.5]" />
              </div>

              <div className="bg-[#F59E0B]/10 p-2.5 border border-[#F59E0B]/40 min-h-[90px]">
                <span className="text-[10px] font-black uppercase text-black/70 block">RECOMMENDATION:</span>
                <p className="text-xs font-bold text-black font-sans mt-1">{benchmark.baselineB_RAG.recommendation}</p>
              </div>

              <div className="space-y-1.5 text-[11px] font-black">
                <div className="flex justify-between border-b border-black/20 pb-1">
                  <span>CLINICAL SAFETY:</span>
                  <span className="text-[#F59E0B]">WARNING ONLY</span>
                </div>
                <div className="flex justify-between border-b border-black/20 pb-1">
                  <span>CONTRAINDICATION:</span>
                  <span className="text-[#3A86FF]">DETECTED (NO BLOCK)</span>
                </div>
                <div className="flex justify-between">
                  <span>GUIDELINE ADHERENCE:</span>
                  <span className="text-black">{benchmark.baselineB_RAG.guidelineAdherence}%</span>
                </div>
              </div>
            </div>

            {/* Heal Engine Architecture */}
            <div className="p-4 bg-[#CCFF00] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3 transform -translate-y-1">
              <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                <span className="font-black font-display text-xs uppercase bg-black text-[#CCFF00] px-2 py-0.5 border border-black">
                  HEAL ENGINE (FULL ARCH)
                </span>
                <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
              </div>

              <div className="bg-white p-2.5 border-2 border-black min-h-[90px]">
                <span className="text-[10px] font-black uppercase text-[#F43F5E] block">RECOMMENDATION & BLOCK:</span>
                <p className="text-xs font-extrabold text-black font-sans mt-1">{benchmark.healEngine.recommendation}</p>
              </div>

              <div className="space-y-1.5 text-[11px] font-black text-black">
                <div className="flex justify-between border-b border-black/30 pb-1">
                  <span>SAFETY CONSTRAINT:</span>
                  <span className="bg-black text-[#CCFF00] px-1 border border-black">PASSED (HARD BLOCK)</span>
                </div>
                <div className="flex justify-between border-b border-black/30 pb-1">
                  <span>SAFE ALTERNATIVE:</span>
                  <span className="text-black">TOPICAL LIDOCAINE</span>
                </div>
                <div className="flex justify-between">
                  <span>GUIDELINE ADHERENCE:</span>
                  <span className="text-black text-sm">{benchmark.healEngine.guidelineAdherence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Architectural Advantage Callout */}
          <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] font-sans">
            <h4 className="font-black font-display text-xs text-black uppercase mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" />
              WHY HEAL ENGINE PREVENTS CLINICAL FAILURE
            </h4>
            <p className="text-xs text-black/90 leading-relaxed font-semibold">
              Standard LLMs evaluate prompts in isolation, often recommending symptomatic relief (increasing Ibuprofen dosage) while missing underlying organ contraindications. Heal Engine’s <strong className="text-black bg-[#FFE600] px-1">SafetyConstraintEngine</strong> and <strong className="text-black bg-[#00F5D4] px-1">DataIntegrityEngine</strong> hard-block candidate interventions when eGFR &lt; 60 mL/min and ACEi therapy are active, substituting a safe non-systemic topical alternative.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#FAF8F5] border-t-2 border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-[#FFE600] font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#FFE600] hover:text-black uppercase"
          >
            Close Benchmark Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
