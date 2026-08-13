import React, { useState } from 'react';
import { RECOVERY_SYMPTOM_LOGS } from '../data/mockPatientData';
import { SymptomLogEntry } from '../types/health';
import { 
  UserCheck, 
  CheckCircle, 
  Calendar, 
  Plus, 
  Activity, 
  Heart, 
  Moon, 
  Thermometer, 
  FileText,
  Sparkles
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
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" /> Recovery Journey & Patient Symptom Diary
          </h2>
          <p className="text-xs text-slate-400">
            14-day supportive recovery tracking, structured daily guidance, and continuous symptom diary telemetry.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Log Today's Symptoms</span>
        </button>
      </div>

      {/* 14-Day Trajectory Milestone Banner */}
      <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> 14-Day Recovery Pathway Progress
          </span>
          <span className="text-xs font-mono text-cyan-400 font-bold">Day 5 / Day 14 (78% Adherent)</span>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
            <span className="text-[10px] font-bold uppercase block">DAY 0: Assessment</span>
            <p className="text-[11px] text-slate-300">Case Conference complete</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
            <span className="text-[10px] font-bold uppercase block">DAY 1: Initial Plan</span>
            <p className="text-[11px] text-slate-300">Stop OTC Ibuprofen</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 space-y-1 font-bold">
            <span className="text-[10px] font-bold uppercase block">DAY 3: Check Vitals</span>
            <p className="text-[11px] text-slate-200">Track leg edema</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 space-y-1">
            <span className="text-[10px] font-bold uppercase block">DAY 7: Progress</span>
            <p className="text-[11px]">Re-check eGFR panel</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 space-y-1">
            <span className="text-[10px] font-bold uppercase block">DAY 14: Evaluation</span>
            <p className="text-[11px]">Clinician review complete</p>
          </div>
        </div>
      </div>

      {/* Symptom Journal Entries Stream */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" /> Patient Symptom Diary Log History
        </h3>

        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white text-sm">Day {log.dayNumber} ({log.date})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    Sleep: {log.sleepHours}h | Temp: {log.temperature}°F
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{log.notes}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block">FATIGUE</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">{log.fatigueLevel}/10</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block">PAIN</span>
                  <span className="font-bold text-cyan-400 font-mono text-sm">{log.painLevel}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#131B2E] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Log Today's Recovery Symptoms</h3>
            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Fatigue Level (0 = None, 10 = Severe)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newFatigue}
                  onChange={(e) => setNewFatigue(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="text-right text-slate-400 block font-mono">{newFatigue} / 10</span>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Pain Level (0 = None, 10 = Severe)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newPain}
                  onChange={(e) => setNewPain(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="text-right text-slate-400 block font-mono">{newPain} / 10</span>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Notes / How do you feel today?</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Legs feel less swollen, avoided Ibuprofen today..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save Symptom Entry
              </button>
            </form>
            <button
              onClick={() => setShowLogModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
