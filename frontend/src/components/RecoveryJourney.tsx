import React, { useState } from 'react';
import { RECOVERY_SYMPTOM_LOGS } from '../data/mockPatientData';
import { SymptomLogEntry } from '../types/health';
import { 
  BellRing, 
  Calendar, 
  Plus, 
  FileText,
  CheckCircle2,
  Clock,
  Video,
  Stethoscope,
  Sparkles,
  ArrowRight,
  FolderOpen
} from 'lucide-react';

interface RecoveryJourneyProps {
  onNavigateTab?: (tab: string) => void;
}

export const RecoveryJourney: React.FC<RecoveryJourneyProps> = ({ onNavigateTab }) => {
  const [logs, setLogs] = useState<SymptomLogEntry[]>(RECOVERY_SYMPTOM_LOGS);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [newPain, setNewPain] = useState<number>(3);
  const [newFatigue, setNewFatigue] = useState<number>(4);
  const [newNotes, setNewNotes] = useState<string>('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: SymptomLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      dayNumber: logs.length + 1,
      painLevel: newPain,
      fatigueLevel: newFatigue,
      temperature: 98.4,
      sleepHours: 7.5,
      notes: newNotes || 'Routine symptom log entry.',
      symptomsLogged: ['Joint relief check']
    };
    setLogs([newEntry, ...logs]);
    setShowLogModal(false);
    setNewNotes('');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Human Health Banner */}
      <div className="p-6 bg-[#CCFF00] text-black border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 bg-black text-[#CCFF00] px-2.5 py-0.5 w-fit border border-black -rotate-1 text-xs font-black uppercase mb-1">
            <BellRing className="w-4 h-4 stroke-[2.5]" />
            <span>CARE & FOLLOW-UP</span>
          </div>
          <h2 className="text-2xl font-black font-display text-black uppercase tracking-tight">
            Your Follow-Up & Action Plan
          </h2>
          <p className="text-xs font-bold text-black/90 mt-1 max-w-2xl font-mono leading-relaxed">
            Keep your health timeline current. Track symptoms daily, review upcoming appointments, and see when clinical review is scheduled.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-2.5 bg-[#FFE600] hover:bg-white text-black font-black font-display text-xs flex items-center space-x-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer uppercase"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Today's Symptoms</span>
        </button>
      </div>

      {/* Action-Oriented Follow-Up Checklist (Requirement #13) */}
      <div className="p-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-2 text-black">
            <Calendar className="w-4 h-4 text-black stroke-[2.5]" /> Your Follow-Up Timeline
          </span>
          <span className="text-xs font-mono bg-[#00F5D4] text-black px-2 py-0.5 border border-black font-black">
            2 ITEMS PENDING
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
          {/* Today */}
          <div className="p-4 bg-[#FAF8F5] border-2 border-black space-y-3">
            <span className="text-[10px] font-black uppercase font-mono bg-black text-[#CCFF00] px-2 py-0.5 inline-block border border-black">
              TODAY
            </span>
            <div className="space-y-2">
              <div className="p-3 bg-white border border-black flex items-start gap-2.5 shadow-[1px_1px_0px_0px_#000]">
                <CheckCircle2 className="w-4 h-4 text-[#00F5D4] shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <span className="font-bold text-black block">Review latest health report</span>
                  <span className="text-[11px] text-black/70">Lab panel analyzed (eGFR 52 mL/min recorded).</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-black flex items-start gap-2.5 shadow-[1px_1px_0px_0px_#000]">
                <CheckCircle2 className="w-4 h-4 text-[#00F5D4] shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <span className="font-bold text-black block">Pause oral NSAID (Ibuprofen)</span>
                  <span className="text-[11px] text-black/70">Protect kidney blood flow while discussing alternatives.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Up */}
          <div className="p-4 bg-[#FAF8F5] border-2 border-black space-y-3">
            <span className="text-[10px] font-black uppercase font-mono bg-black text-[#FFE600] px-2 py-0.5 inline-block border border-black">
              COMING UP
            </span>
            <div className="space-y-2">
              <div className="p-3 bg-white border border-black flex items-start justify-between gap-2 shadow-[1px_1px_0px_0px_#000]">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 stroke-[2.5]" />
                  <div>
                    <span className="font-bold text-black block">Virtual Specialist Screening</span>
                    <span className="text-[11px] text-black/70">Scheduled with Dr. Sarah Chen (Preventive Nephrology)</span>
                  </div>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('virtual-doctor')}
                    className="px-2 py-1 bg-[#00F5D4] text-black font-black text-[10px] font-mono border border-black cursor-pointer hover:bg-[#00D2B4]"
                  >
                    Start →
                  </button>
                )}
              </div>

              <div className="p-3 bg-white border border-black flex items-start gap-2.5 shadow-[1px_1px_0px_0px_#000]">
                <Clock className="w-4 h-4 text-[#3A86FF] shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <span className="font-bold text-black block">Clinician Review & Lab Recheck</span>
                  <span className="text-[11px] text-black/70">Repeat metabolic blood panel recommended in 14 days.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keep information updated banner */}
        <div className="p-4 bg-[#FFE600]/30 border-2 border-black flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-black shrink-0" />
            <div>
              <span className="font-black font-display text-xs text-black uppercase block">Keep your information updated</span>
              <p className="text-[11px] text-black/80 font-sans">
                Adding new reports helps Heal Engine keep your health timeline current and detect positive recovery trends.
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-3 py-1.5 bg-white hover:bg-black hover:text-white text-black font-bold text-xs border border-black font-mono shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
            >
              + Upload New Report
            </button>
          )}
        </div>
      </div>

      {/* Symptom Journal Entries Stream */}
      <div className="space-y-3">
        <h3 className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-2 bg-[#FF70A6] text-black px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_#000] w-fit">
          <FileText className="w-4 h-4 stroke-[2.5]" /> RECENT SYMPTOM LOG ENTRIES
        </h3>

        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="p-4 bg-[#FFFFFF] border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-black font-display text-black text-sm">Day {log.dayNumber} ({log.date})</span>
                  <span className="px-2 py-0.5 bg-[#FFE600] text-black border border-black font-mono font-bold text-[10px]">
                    Sleep: {log.sleepHours}h | Temp: {log.temperature}°F
                  </span>
                </div>
                <p className="text-black/90 font-semibold text-[11px] mt-1">{log.notes}</p>
              </div>

              <div className="flex items-center space-x-4 font-mono">
                <div className="text-center bg-[#FAF8F5] p-2 border border-black shadow-[1px_1px_0px_0px_#000]">
                  <span className="text-[9px] font-black text-black/70 block uppercase">FATIGUE</span>
                  <span className="font-black text-black text-sm bg-[#FFE600] px-1 border border-black">{log.fatigueLevel}/10</span>
                </div>
                <div className="text-center bg-[#FAF8F5] p-2 border border-black shadow-[1px_1px_0px_0px_#000]">
                  <span className="text-[9px] font-black text-black/70 block uppercase">PAIN</span>
                  <span className="font-black text-black text-sm bg-[#00F5D4] px-1 border border-black">{log.painLevel}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] border-4 border-black shadow-[10px_10px_0px_0px_#000] p-6 space-y-4">
            <h3 className="text-base font-black font-display text-black uppercase bg-[#CCFF00] p-2 border-2 border-black">Log Today's Symptoms</h3>
            <form onSubmit={handleAddLog} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-black font-display block mb-1">Fatigue Level (0 = None, 10 = Severe)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newFatigue}
                  onChange={(e) => setNewFatigue(Number(e.target.value))}
                  className="w-full accent-black"
                />
                <span className="text-right text-black font-mono block">{newFatigue} / 10</span>
              </div>

              <div>
                <label className="text-black font-display block mb-1">Pain Level (0 = None, 10 = Severe)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newPain}
                  onChange={(e) => setNewPain(Number(e.target.value))}
                  className="w-full accent-black"
                />
                <span className="text-right text-black font-mono block">{newPain} / 10</span>
              </div>

              <div>
                <label className="text-black font-display block mb-1">Notes / How do you feel today?</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Legs feel less swollen, avoided Ibuprofen today..."
                  className="w-full bg-[#FAF8F5] border-2 border-black p-2.5 text-black font-semibold focus:outline-none focus:bg-[#FFE600]/20 shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#CCFF00] hover:bg-[#A3E635] text-black border-2 border-black font-black font-display text-xs shadow-[3px_3px_0px_0px_#000] uppercase cursor-pointer"
              >
                Save Symptom Entry
              </button>
            </form>
            <button
              onClick={() => setShowLogModal(false)}
              className="w-full py-2 bg-[#FAF8F5] text-black border-2 border-black text-xs font-black font-display uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
