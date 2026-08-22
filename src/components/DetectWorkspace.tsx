import React from 'react';
import { patientStateEngine } from '../engine/patientStateEngine';
import { 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const DetectWorkspace: React.FC = () => {
  const patientState = patientStateEngine.getPatientState();
  const delta = patientStateEngine.computeTrajectoryDelta();

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Pillar Banner */}
      <div className="p-5 bg-[#FF70A6] border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#FF70A6] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <TrendingDown className="w-4 h-4 text-[#FFE600] stroke-[2.5]" />
          <span>STEP 2: FIND WHAT CHANGED</span>
        </div>
        <h2 className="text-2xl font-black font-display text-black uppercase tracking-tight">
          What Has Changed or Needs Immediate Attention?
        </h2>
        <p className="text-xs font-bold text-black/90 mt-1 max-w-3xl font-mono leading-relaxed">
          Heal Engine compares current telemetry streams against the patient's multi-year baseline trajectory, identifying meaningful clinical deviations rather than isolated lab spikes.
        </p>
      </div>

      {/* Trajectory Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: 18.7% eGFR Decline */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black text-xs">
              <ShieldAlert className="w-4 h-4 text-[#F43F5E] stroke-[2.5]" /> Kidney Function Deviation
            </span>
            <span className="text-[10px] font-black bg-[#F43F5E] text-white border border-black px-1.5 py-0.5">CRITICAL SHIFT</span>
          </div>

          <div className="p-4 bg-[#FAF8F5] border-2 border-black space-y-2">
            <span className="font-extrabold text-sm text-[#F43F5E] block">eGFR Decreased by 18.7% over 3 Weeks</span>
            <div className="flex items-center justify-between font-mono text-xs font-bold py-1 bg-white p-2 border border-black">
              <span>Baseline: <strong>64 mL/min</strong></span>
              <span className="text-base">→</span>
              <span className="text-[#F43F5E]">Current: <strong>52 mL/min</strong></span>
            </div>
            <p className="text-xs text-black/80 font-sans mt-1">
              Approaching Stage 3a Chronic Kidney Disease threshold (&lt;45 mL/min). Creatinine concurrently elevated from 1.18 to 1.45 mg/dL.
            </p>
          </div>
        </div>

        {/* Card 2: Biomarker & Fluid Overload */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black text-xs">
              <Activity className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" /> Ventricular Strain & Edema
            </span>
            <span className="text-[10px] font-black bg-[#3A86FF] text-white border border-black px-1.5 py-0.5">ELEVATED</span>
          </div>

          <div className="p-4 bg-[#FAF8F5] border-2 border-black space-y-2">
            <span className="font-extrabold text-sm text-[#3A86FF] block">NT-proBNP Rose from 180 to 480 pg/mL</span>
            <div className="flex items-center justify-between font-mono text-xs font-bold py-1 bg-white p-2 border border-black">
              <span>Normal Reference: <strong>&lt; 300 pg/mL</strong></span>
              <span className="text-base">→</span>
              <span className="text-[#3A86FF]">Current: <strong>480 pg/mL (+166%)</strong></span>
            </div>
            <p className="text-xs text-black/80 font-sans mt-1">
              Correlated with newly reported bilateral 2+ pitting leg edema and Grade II exertional dyspnea in daily symptom diary.
            </p>
          </div>
        </div>
      </div>

      {/* Longitudinal Trajectory Delta Summary */}
      <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
        <h3 className="text-sm font-black font-display uppercase flex items-center gap-2 text-black">
          <Clock className="w-4 h-4 text-black stroke-[2.5]" /> Longitudinal Trajectory Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
          {delta.whatChanged.map((change, i) => (
            <div key={i} className="p-3 bg-[#FAF8F5] border-2 border-black">
              <span className="font-mono text-[10px] font-bold text-black/60 block uppercase">Signal #{i + 1}:</span>
              <p className="font-bold text-black mt-1">{change}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
