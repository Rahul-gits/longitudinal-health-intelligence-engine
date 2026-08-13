import React, { useState } from 'react';
import { TIMELINE_EVENTS } from '../data/mockPatientData';
import { TimelineEvent } from '../types/health';
import { 
  Clock, 
  FileText, 
  Pill, 
  Stethoscope, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Link, 
  Sparkles,
  Filter
} from 'lucide-react';

export const HealthTimeline: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEvents = TIMELINE_EVENTS.filter(evt => {
    if (selectedYear !== 'all' && evt.year !== selectedYear) return false;
    if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lab': return FileText;
      case 'medication': return Pill;
      case 'consultation': return Stethoscope;
      case 'symptom': return Activity;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" /> Longitudinal Health Timeline Engine
          </h2>
          <p className="text-xs text-slate-400">
            Chronological reasoning tracking event progression (2023–2026) and causal relationships over time.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {/* Year Filter */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-lg ${selectedYear === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              All Years
            </button>
            {[2023, 2024, 2025, 2026].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-lg ${selectedYear === yr ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Causal Progression Example Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Longitudinal Causal Chain Identified by AI Engine</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-slate-200">
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono">2024: Stage 2 CKD</span>
          <span className="text-cyan-400 font-bold">→</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono">July 2026: OTC Ibuprofen Started</span>
          <span className="text-rose-400 font-bold">→</span>
          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">Aug 2026: eGFR Drops (64 → 52)</span>
          <span className="text-emerald-400 font-bold">→</span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">AI Case Conference: Stop NSAID</span>
        </div>
      </div>

      {/* Chronological Timeline Stream */}
      <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6 py-2">
        {filteredEvents.map(evt => {
          const Icon = getCategoryIcon(evt.category);
          return (
            <div key={evt.id} className="relative group">
              {/* Node Bullet */}
              <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center ${
                evt.impact === 'worsened' ? 'border-rose-500 bg-rose-500/20' :
                evt.impact === 'improved' ? 'border-emerald-400 bg-emerald-500/20' :
                evt.impact === 'new_finding' ? 'border-amber-400 bg-amber-500/20' : 'border-cyan-500 bg-cyan-500/20'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">{evt.title}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{evt.date}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{evt.summary}</p>

                {/* Causal Link Description */}
                {evt.causalDescription && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2 text-xs">
                    <Link className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase block">Causal Event Connection</span>
                      <span className="text-slate-300 text-[11px]">{evt.causalDescription}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
