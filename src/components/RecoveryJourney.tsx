import React, { useState } from 'react';
import { RECOVERY_SYMPTOM_LOGS } from '../data/mockPatientData';
import { SymptomLogEntry } from '../types/health';
import { 
  UserCheck, 
  Calendar, 
  Plus, 
  FileText
} from 'lucide-react';

export const RecoveryJourney: React.FC = () => {
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
      notes: newNotes || 'Routine recovery log entry.',
      symptomsLogged: ['Mild Fatigue']
    };
    setLogs([...logs, newEntry]);
    setShowLogModal(false);
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 bg-[#CCFF00] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-black tracking-tight flex items-center gap-2 uppercase">
            <UserCheck className="w-6 h-6 stroke-[2.5]" /> RECOVERY JOURNEY & SYMPTOM DIARY
          </h2>
          <p className="text-xs font-mono font-bold text-black/90 mt-1">
            14-day supportive recovery tracking, structured daily guidance, and symptom diary telemetry.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-2.5 bg-[#FFE600] hover:bg-[#FAF8F5] text-black font-black font-display text-xs flex items-center space-x-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer uppercase"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>LOG TODAY'S SYMPTOMS</span>
        </button>
      </div>

      {/* 14-Day Trajectory Milestone Banner */}
      <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <span className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-2 text-black">
            <Calendar className="w-4 h-4 text-black stroke-[2.5]" /> 14-DAY RECOVERY PATHWAY PROGRESS
          </span>
          <span className="text-xs font-mono bg-[#00F5D4] text-black px-2 py-0.5 border border-black font-black">DAY 5 / 14 (78% ADHERENT)</span>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black uppercase font-mono block bg-black text-[#CCFF00] px-1 w-fit">DAY 0</span>
            <p className="text-[11px] font-bold text-black mt-1">Case Conference Complete</p>
          </div>
          <div className="p-3 bg-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black uppercase font-mono block bg-black text-[#CCFF00] px-1 w-fit">DAY 1</span>
            <p className="text-[11px] font-bold text-black mt-1">Discontinue OTC NSAID</p>
          </div>
          <div className="p-3 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black uppercase font-mono block bg-black text-[#FFE600] px-1 w-fit">DAY 3 (ACTIVE)</span>
            <p className="text-[11px] font-black text-black mt-1">Track Vitals & Edema</p>
          </div>
          <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black uppercase font-mono block bg-black text-white px-1 w-fit">DAY 7</span>
            <p className="text-[11px] font-semibold text-black/80 mt-1">Re-check eGFR Panel</p>
          </div>
          <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
            <span className="text-[10px] font-black uppercase font-mono block bg-black text-white px-1 w-fit">DAY 14</span>
            <p className="text-[11px] font-semibold text-black/80 mt-1">Clinician Evaluation</p>
          </div>
        </div>
      </div>

      {/* Symptom Journal Entries Stream */}
      <div className="space-y-3">
        <h3 className="text-xs font-black font-display uppercase tracking-wider flex items-center gap-2 bg-[#FF70A6] text-black px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#000] w-fit">
          <FileText className="w-4 h-4 stroke-[2.5]" /> PATIENT SYMPTOM DIARY LOG HISTORY
        </h3>

        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="p-4 bg-[#FFFFFF] border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-black font-display text-black text-sm">Day {log.dayNumber} ({log.date})</span>
                  <span className="px-2 py-0.5 bg-[#FFE600] text-black border border-black font-mono font-bold text-[10px]">
                    Sleep: {log.sleepHours}h | Temp: {log.temperature}°F
                  </span>
                </div>
                <p className="text-black/90 font-semibold text-[11px] mt-1">{log.notes}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center bg-[#FAF8F5] p-2 border border-black shadow-[1px_1px_0px_0px_#000]">
                  <span className="text-[9px] font-black text-black/70 block uppercase font-mono">FATIGUE</span>
                  <span className="font-black text-black font-mono text-sm bg-[#FFE600] px-1 border border-black">{log.fatigueLevel}/10</span>
                </div>
                <div className="text-center bg-[#FAF8F5] p-2 border border-black shadow-[1px_1px_0px_0px_#000]">
                  <span className="text-[9px] font-black text-black/70 block uppercase font-mono">PAIN</span>
                  <span className="font-black text-black font-mono text-sm bg-[#00F5D4] px-1 border border-black">{log.painLevel}/10</span>
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
