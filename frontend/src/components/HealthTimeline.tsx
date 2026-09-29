import React, { useState } from 'react';
import { TIMELINE_EVENTS } from '../data/mockPatientData';
import { 
  Clock, 
  FileText, 
  Pill, 
  Stethoscope, 
  Activity, 
  Link, 
  Sparkles
} from 'lucide-react';

export const HealthTimeline: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory] = useState<string>('all');

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
      <div className="p-5 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-black tracking-tight flex items-center gap-2 uppercase">
            <Clock className="w-6 h-6 stroke-[2.5]" /> LONGITUDINAL HEALTH TIMELINE
          </h2>
          <p className="text-xs font-bold text-black/90 font-mono mt-1">
            Chronological event progression (2023–2026) & AI causal dependency graph.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {/* Year Filter */}
          <div className="flex items-center bg-[#FFFFFF] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black font-mono">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1 border transition-all cursor-pointer ${
                selectedYear === 'all' ? 'bg-black text-[#FFE600] border-black' : 'border-transparent text-black hover:bg-[#FFE600]'
              }`}
            >
              All
            </button>
            {[2023, 2024, 2025, 2026].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 border transition-all cursor-pointer ${
                  selectedYear === yr ? 'bg-black text-[#FFE600] border-black' : 'border-transparent text-black hover:bg-[#FFE600]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Causal Progression Example Banner */}
      <div className="p-4 bg-[#FF70A6] border-3 border-black shadow-[5px_5px_0px_0px_#000] text-xs space-y-2">
        <div className="flex items-center space-x-2 text-black font-black uppercase tracking-wider font-display">
          <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Longitudinal Causal Chain Identified by AI Engine</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-black">
          <span className="px-2.5 py-1 bg-white border border-black shadow-[1px_1px_0px_0px_#000]">2024: Stage 2 CKD</span>
          <span className="font-black">→</span>
          <span className="px-2.5 py-1 bg-[#FFE600] border border-black shadow-[1px_1px_0px_0px_#000]">Jul 2026: OTC Ibuprofen Started</span>
          <span className="font-black">→</span>
          <span className="px-2.5 py-1 bg-[#FF6B35] text-white border border-black shadow-[1px_1px_0px_0px_#000]">Aug 2026: eGFR Drops (64 → 52)</span>
          <span className="font-black">→</span>
          <span className="px-2.5 py-1 bg-[#CCFF00] text-black border border-black shadow-[1px_1px_0px_0px_#000]">AI Decision: Discontinue NSAID</span>
        </div>
      </div>

      {/* Chronological Timeline Stream */}
      <div className="relative border-l-4 border-black ml-4 space-y-6 pl-6 py-2">
        {filteredEvents.map((evt, idx) => {
          const Icon = getCategoryIcon(evt.category);
          const rotation = idx % 2 === 0 ? '-rotate-0.5' : 'rotate-0.5';

          return (
            <div key={evt.id} className="relative group">
              {/* Node Bullet */}
              <div className={`absolute -left-[35px] top-2 w-5 h-5 border-2 border-black flex items-center justify-center ${
                evt.impact === 'worsened' ? 'bg-[#FF6B35]' :
                evt.impact === 'improved' ? 'bg-[#CCFF00]' :
                evt.impact === 'new_finding' ? 'bg-[#FFE600]' : 'bg-[#00F5D4]'
              }`}>
                <div className="w-1.5 h-1.5 bg-black"></div>
              </div>

              {/* Event Card */}
              <div className={`p-5 bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] hover:shadow-[7px_7px_0px_0px_#000] hover:-translate-y-0.5 transition-all space-y-2 ${rotation}`}>
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-[#FAF8F5] border border-black flex items-center justify-center">
                      <Icon className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <span className="font-black font-display text-black text-sm">{evt.title}</span>
                  </div>
                  <span className="text-xs font-mono font-black bg-[#FFE600] px-2 py-0.5 border border-black">{evt.date}</span>
                </div>

                <p className="text-xs font-semibold text-black/90 leading-relaxed font-sans">{evt.summary}</p>

                {/* Causal Link Description */}
                {evt.causalDescription && (
                  <div className="mt-3 p-3 bg-[#00F5D4] border-2 border-black flex items-start space-x-2 text-xs">
                    <Link className="w-4 h-4 text-black stroke-[2.5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase text-black font-mono block bg-black text-[#00F5D4] px-1 w-fit">CAUSAL DEPENDENCY</span>
                      <span className="text-black font-bold text-[11px] mt-0.5 block">{evt.causalDescription}</span>
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
