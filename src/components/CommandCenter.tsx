import React from 'react';
import { PATIENT_INFO, INITIAL_DATA_CLUSTERS } from '../data/mockPatientData';
import { 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Pill, 
  Layers, 
  ArrowRight,
  Stethoscope,
  Sparkles,
  Cpu
} from 'lucide-react';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* Main OS Command Header */}
      <div className="p-6 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-wider mb-1 bg-black text-[#FFE600] px-2 py-0.5 w-fit border border-black -rotate-1">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>DIGITAL TWIN COMMAND CENTER</span>
            </div>
            <h1 className="text-3xl font-black font-display text-black tracking-tight mt-1">
              PATIENT: {PATIENT_INFO.name.toUpperCase()}
            </h1>
            <p className="text-xs font-bold text-black/90 mt-1.5 max-w-2xl font-mono leading-relaxed">
              Continuous longitudinal health monitoring, dynamic 7-cluster telemetry, multi-agent clinical case conference, and safety governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-right">
              <span className="text-[10px] text-black/70 font-black uppercase tracking-wider block">CURRENT STATUS</span>
              <span className="text-sm font-black text-black flex items-center gap-1.5 justify-end">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] border border-black animate-ping"></span>
                {PATIENT_INFO.status.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('conference')}
              className="px-4 py-2.5 bg-[#FF70A6] hover:bg-[#FF4D8D] text-black font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer uppercase tracking-wider"
            >
              <Layers className="w-4 h-4 stroke-[2.5]" />
              <span>CASE CONFERENCE</span>
            </button>

            <button
              onClick={() => onNavigateTab('swarm')}
              className="px-4 py-2.5 bg-[#00F5D4] hover:bg-[#00D8BB] text-black font-black font-display text-xs flex items-center space-x-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer uppercase tracking-wider"
            >
              <Cpu className="w-4 h-4 stroke-[2.5]" />
              <span>SWARM ENGINE (13+)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Health OS Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Widget 1: Biomarker Changes */}
        <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Activity className="w-4 h-4 text-black stroke-[2.5]" /> Biomarker Deltas
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#FFE600] border border-black px-1.5 py-0.5">2025 vs 2026</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-black block">eGFR (Glomerular)</span>
                <span className="text-[10px] font-mono text-black/70">64 → 52 mL/min</span>
              </div>
              <span className="px-2 py-1 font-black bg-[#FF70A6] text-black border border-black text-[10px] flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" /> ↓ 12
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-black block">NT-proBNP (Cardiac)</span>
                <span className="text-[10px] font-mono text-black/70">110 → 480 pg/mL</span>
              </div>
              <span className="px-2 py-1 font-black bg-[#FF6B35] text-white border border-black text-[10px] flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" /> ↑ 370
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-black block">HbA1c (Glycemic)</span>
                <span className="text-[10px] font-mono text-black/70">6.8% → 6.7%</span>
              </div>
              <span className="px-2 py-1 font-black bg-[#CCFF00] text-black border border-black text-[10px] flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" /> OK
              </span>
            </div>
          </div>
        </div>

        {/* Widget 2: Active Care & Med Schedule */}
        <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Pill className="w-4 h-4 text-black stroke-[2.5]" /> Prescriptions
            </span>
            <span className="text-[10px] font-mono font-extrabold bg-[#CCFF00] border border-black px-1.5 py-0.5 text-black">98% ADHERENT</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-black block">Lisinopril 20mg</span>
                <span className="text-[10px] font-mono text-black/70">Daily (Morning)</span>
              </div>
              <span className="px-2 py-0.5 font-extrabold bg-[#CCFF00] text-black border border-black text-[10px]">Active</span>
            </div>

            <div className="p-3 bg-[#FF70A6] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs">
              <div>
                <span className="font-black text-black block">OTC Ibuprofen 400mg</span>
                <span className="text-[10px] font-mono font-bold text-black">NSAID Interaction</span>
              </div>
              <span className="px-2 py-0.5 font-black bg-black text-[#FFE600] border border-black text-[10px] uppercase">STOP</span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-black block">Furosemide 20mg</span>
                <span className="text-[10px] font-mono text-black/70">Daily (Morning)</span>
              </div>
              <span className="px-2 py-0.5 font-extrabold bg-[#CCFF00] text-black border border-black text-[10px]">Active</span>
            </div>
          </div>
        </div>

        {/* Widget 3: 14-Day Recovery Progress */}
        <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black">
              <Clock className="w-4 h-4 text-black stroke-[2.5]" /> Recovery Journey
            </span>
            <span className="text-[10px] font-mono font-extrabold bg-[#00F5D4] border border-black px-1.5 py-0.5">DAY 5 / 14</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-black font-display">Assessment Progress</span>
              <span className="font-mono text-black font-black bg-[#CCFF00] border border-black px-1">78%</span>
            </div>
            <div className="w-full h-4 bg-[#FAF8F5] border-2 border-black overflow-hidden p-0.5">
              <div className="h-full bg-[#3A86FF] border border-black w-[78%]"></div>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-2 border-black text-xs space-y-1">
              <span className="text-[10px] font-black text-black uppercase block font-mono bg-[#FFE600] border border-black px-1 w-fit">Daily Log</span>
              <p className="text-black text-[11px] font-semibold leading-snug">
                Fatigue improved (6/10 → 4/10). OTC NSAID stopped per AI consensus. Leg edema tracked.
              </p>
            </div>
          </div>
        </div>

        {/* Widget 4: Next Action Box */}
        <div className="p-5 bg-[#00F5D4] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-1.5 text-black bg-black text-[#00F5D4] px-2 py-0.5 w-fit border border-black">
              <Stethoscope className="w-4 h-4 stroke-[2.5]" /> NEXT ACTION ITEM
            </span>
            <h4 className="text-sm font-extrabold font-display text-black">Review eGFR & NSAID with Dr. Thorne</h4>
            <p className="text-xs font-semibold text-black/90 leading-relaxed">
              Consensus engine flagged eGFR shift (64 → 52). Discontinue OTC Ibuprofen and request a 48h renal re-check.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('clinician')}
            className="w-full py-2.5 bg-black hover:bg-black/90 text-[#00F5D4] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black font-display uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>CLINICIAN HANDOFF</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 7 Data Clusters Quick Telemetry Cards */}
      <div className="bg-[#FFFFFF] p-5 border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <h3 className="text-sm font-black font-display text-black uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-black stroke-[2.5]" /> 7 DYNAMIC DATA CLUSTER TELEMETRY
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          {INITIAL_DATA_CLUSTERS.map(cluster => (
            <button
              key={cluster.id}
              onClick={() => onNavigateTab('conference')}
              className="p-3.5 bg-[#FAF8F5] hover:bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-black uppercase text-black truncate">
                  {cluster.title.split('—')[1]?.trim()}
                </span>
                <span
                  className="w-3 h-3 border border-black shadow-[1px_1px_0px_0px_#000]"
                  style={{ backgroundColor: cluster.color }}
                ></span>
              </div>
              <div className="text-xl font-black text-black font-mono">
                {cluster.items.length} <span className="text-[10px] font-sans text-black/70 font-bold">items</span>
              </div>
              <span className="text-[10px] font-black text-black group-hover:underline mt-2 block font-mono">
                GRAPH VIEW →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
