import React from 'react';
import { PATIENT_INFO } from '../data/mockPatientData';
import { patientStateEngine } from '../engine/patientStateEngine';
import { 
  Heart, 
  User, 
  Pill, 
  Dna, 
  Activity, 
  Sparkles, 
  FileText, 
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const UnderstandWorkspace: React.FC = () => {
  const patientState = patientStateEngine.getPatientState();

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Pillar Banner */}
      <div className="p-5 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center space-x-2 bg-black text-[#FFE600] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
          <Heart className="w-4 h-4 text-[#FF70A6] stroke-[2.5]" />
          <span>STEP 1: UNDERSTAND</span>
        </div>
        <h2 className="text-2xl font-black font-display text-black uppercase tracking-tight">
          What Do We Know About Eleanor Vance?
        </h2>
        <p className="text-xs font-bold text-black/90 mt-1 max-w-3xl font-mono leading-relaxed">
          Heal Engine unifies fragmented EHR records, continuous wearable telemetry, active medications, lab history, and pharmacogenomics into a single trusted Patient Health Picture.
        </p>

        {/* Separated Version Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 bg-white p-3 border-2 border-black text-[10px]">
          <div>
            <span className="font-bold text-black/60 block uppercase">Patient Health State:</span>
            <span className="font-black text-black text-xs">v1.4</span>
          </div>
          <div>
            <span className="font-bold text-black/60 block uppercase">Engine Model:</span>
            <span className="font-black text-[#3A86FF] text-xs">v2.1</span>
          </div>
          <div>
            <span className="font-bold text-black/60 block uppercase">Safety Policy:</span>
            <span className="font-black text-[#F43F5E] text-xs">v3.0</span>
          </div>
          <div>
            <span className="font-bold text-black/60 block uppercase">Evidence Base:</span>
            <span className="font-black text-[#00F5D4] bg-black px-1 text-xs">v2024.2</span>
          </div>
        </div>
      </div>

      {/* Grid of Unified Patient Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Baseline Conditions */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Activity className="w-4 h-4 text-[#F43F5E] stroke-[2.5]" /> Medical History & Conditions
            </span>
            <span className="text-[10px] font-black bg-[#FFE600] border border-black px-1.5 py-0.5">3 ACTIVE</span>
          </div>

          <div className="space-y-2 font-sans">
            {patientState.conditions.map((cond, i) => (
              <div key={i} className="p-2.5 bg-[#FAF8F5] border-2 border-black">
                <span className="font-extrabold text-xs text-black block">{cond.value}</span>
                <span className="font-mono text-[10px] text-black/60">Source: {cond.source} • Verified</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Current Medications */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Pill className="w-4 h-4 text-[#3A86FF] stroke-[2.5]" /> Current Medications
            </span>
            <span className="text-[10px] font-black bg-[#3A86FF] text-white border border-black px-1.5 py-0.5">3 DRUGS</span>
          </div>

          <div className="space-y-2 font-sans">
            {patientState.medications.map((med) => (
              <div key={med.id} className="p-2.5 bg-[#FAF8F5] border-2 border-black space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-black">{med.name} {med.dosage}</span>
                  <span className={`text-[9px] font-mono font-black uppercase px-1 border border-black ${
                    med.status === 'otc' ? 'bg-[#FF70A6] text-black' : 'bg-[#CCFF00] text-black'
                  }`}>
                    {med.status}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-black/70">{med.purpose}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Genetics & Vitals */}
        <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Dna className="w-4 h-4 text-[#A855F7] stroke-[2.5]" /> Genetics & Live Vitals
            </span>
            <span className="text-[10px] font-black bg-[#00F5D4] border border-black px-1.5 py-0.5 text-black">CONTINUOUS</span>
          </div>

          <div className="space-y-2.5 font-sans">
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
              <span className="font-mono font-bold text-[10px] text-[#A855F7] block uppercase">Pharmacogenomics:</span>
              <span className="font-extrabold text-xs text-black">CYP2C9*3 (rs1057910)</span>
              <p className="font-mono text-[10px] text-black/70 mt-0.5">Intermediate / Slow Metabolizer: potential influence on NSAID clearance.</p>
            </div>

            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black">
              <span className="font-mono font-bold text-[10px] text-[#00F5D4] block uppercase">Wearable Vitals Telemetry:</span>
              <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[11px] font-bold text-black">
                <div>BP: <span className="font-black">{patientState.vitals.value.bp}</span></div>
                <div>HR: <span className="font-black">{patientState.vitals.value.hr} bpm</span></div>
                <div>SpO2: <span className="font-black">{patientState.vitals.value.spo2}%</span></div>
                <div>Steps: <span className="font-black">{patientState.lifestyle.value.stepCount}/day</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
