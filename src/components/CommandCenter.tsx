import React from 'react';
import { PATIENT_INFO, INITIAL_DATA_CLUSTERS, LAB_MARKERS, MEDICATIONS_LIST } from '../data/mockPatientData';
import { 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Pill, 
  FileText, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  Stethoscope,
  Sparkles
} from 'lucide-react';

interface CommandCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* Main OS Command Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Health Operating System Command Center</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Patient Digital Twin: {PATIENT_INFO.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Continuous longitudinal health monitoring, dynamic 7-cluster telemetry, multi-agent clinical case conference, and safety governance.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-amber-500/40 text-right">
              <span className="text-[10px] text-slate-400 font-medium block">CURRENT STATUS</span>
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                {PATIENT_INFO.status}
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('conference')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Launch Case Conference</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Health OS Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Biomarker Changes */}
        <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> Recent Biomarker Deltas
            </span>
            <span className="text-[10px] text-slate-500">2025 vs 2026</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-rose-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">eGFR (Glomerular Rate)</span>
                <span className="text-[10px] text-slate-400">64 → 52 mL/min</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> ↓ 12 units
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">NT-proBNP (Cardiac)</span>
                <span className="text-[10px] text-slate-400">110 → 480 pg/mL</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ↑ 370 units
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">HbA1c (Glycemic)</span>
                <span className="text-[10px] text-slate-400">6.8% → 6.7%</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Improved
              </span>
            </div>
          </div>
        </div>

        {/* Widget 2: Active Care & Med Schedule */}
        <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-purple-400" /> Active Prescriptions
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">98% Adherent</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Lisinopril 20mg</span>
                <span className="text-[10px] text-slate-400">Once Daily (Morning)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300">Active</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-rose-500/40 bg-rose-500/5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-rose-300 block">OTC Ibuprofen 400mg</span>
                <span className="text-[10px] text-rose-400 font-medium">NSAID Interaction Flag</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">STOP</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Furosemide 20mg</span>
                <span className="text-[10px] text-slate-400">Once Daily (Morning)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300">Active</span>
            </div>
          </div>
        </div>

        {/* Widget 3: 14-Day Recovery Progress */}
        <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> Recovery Journey
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Day 5 of 14</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Assessment Progress</span>
              <span className="font-bold font-mono text-emerald-400">78%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full w-[78%]"></div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 block uppercase">Daily Symptom Journal</span>
              <p className="text-slate-300 text-[11px]">
                Fatigue improved (6/10 → 4/10). OTC NSAID stopped per AI consensus. Leg edema being tracked.
              </p>
            </div>
          </div>
        </div>

        {/* Widget 4: Next Action Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-slate-900 border border-cyan-500/30 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-400" /> Next Action Item
            </span>
            <h4 className="text-sm font-bold text-white">Review eGFR & NSAID with Dr. Thorne</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consensus engine flagged eGFR shift (64 → 52). Discontinue OTC Ibuprofen and request a 48h renal re-check.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('clinician')}
            className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
          >
            <span>Open Clinician Handoff</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 Data Clusters Quick Telemetry Cards */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" /> 7 Dynamic Data Cluster Telemetry
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {INITIAL_DATA_CLUSTERS.map(cluster => (
            <button
              key={cluster.id}
              onClick={() => onNavigateTab('conference')}
              className="p-3 rounded-xl bg-[#131B2E] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 truncate">
                  {cluster.title.split('—')[1]?.trim()}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cluster.color }}
                ></span>
              </div>
              <div className="text-lg font-extrabold text-white font-mono">
                {cluster.items.length} <span className="text-xs font-sans text-slate-400 font-normal">items</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-medium group-hover:underline mt-1 block">
                View in Graph →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
