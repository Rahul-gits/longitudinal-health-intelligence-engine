import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Activity, 
  Pill, 
  Stethoscope, 
  ChevronRight, 
  FileText, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PATIENT_INFO } from '../data/mockPatientData';

interface CareTask {
  id: string;
  title: string;
  timeOfDay: string;
  category: 'MEDICATION' | 'TELEMETRY' | 'SYMPTOM_SURVEY' | 'LIFESTYLE';
  completed: boolean;
  dueDate: string;
}

interface FollowUpItem {
  id: string;
  title: string;
  specialty: string;
  clinicianName: string;
  scheduledDate: string;
  purpose: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'PENDING_RESULTS';
}

interface CareFollowUpWorkspaceProps {
  onNavigateTab?: (tab: string) => void;
}

export const CareFollowUpWorkspace: React.FC<CareFollowUpWorkspaceProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CareTask[]>([
    { id: 'task-1', title: 'Take Lisinopril 20mg with breakfast', timeOfDay: 'Morning', category: 'MEDICATION', completed: true, dueDate: 'Today' },
    { id: 'task-2', title: 'Check morning weight on smart scale', timeOfDay: 'Morning', category: 'TELEMETRY', completed: true, dueDate: 'Today' },
    { id: 'task-3', title: 'Apply Topical Diclofenac 1% gel to right knee (Pause Advil)', timeOfDay: 'Afternoon', category: 'MEDICATION', completed: false, dueDate: 'Today' },
    { id: 'task-4', title: 'Hydration goal: 6 to 8 glasses of water', timeOfDay: 'Evening', category: 'LIFESTYLE', completed: false, dueDate: 'Today' }
  ]);

  const [followUps, setFollowUps] = useState<FollowUpItem[]>([
    {
      id: 'fu-1',
      title: 'Repeat Renal Function Panel (BMP & eGFR)',
      specialty: 'Outpatient Laboratory',
      clinicianName: 'Dr. Aris Thorne',
      scheduledDate: 'August 20, 2026',
      purpose: 'Verify eGFR reversibility after stopping systemic NSAID',
      status: 'SCHEDULED'
    },
    {
      id: 'fu-2',
      title: 'Virtual Cardiorenal Follow-Up Dialogue',
      specialty: 'Virtual Specialist Clinic',
      clinicianName: 'Dr. Aris Thorne',
      scheduledDate: 'August 27, 2026',
      purpose: 'Assess knee comfort and review repeat creatinine lab results',
      status: 'SCHEDULED'
    }
  ]);

  const [doctorNote, setDoctorNote] = useState<string>(
    'Discontinue systemic oral NSAIDs (Ibuprofen) due to acute eGFR decline. Transition to topical Diclofenac 1% gel PRN. Repeat renal panel in 7 days.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('Live Connected to Patient State Engine');

  // Fetch live care plan from server
  const fetchCarePlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/patient/patient-ev-68/care-plan');
      if (res.ok) {
        const data = await res.json();
        if (data.carePlan) {
          if (data.carePlan.tasks) setTasks(data.carePlan.tasks);
          if (data.carePlan.followUps) setFollowUps(data.carePlan.followUps);
          if (data.carePlan.doctorSummaryNote) setDoctorNote(data.carePlan.doctorSummaryNote);
        }
      }
    } catch (err) {
      console.warn('Care plan fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlan();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));

    try {
      await fetch('/api/patient/patient-ev-68/care-plan/task/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
    } catch (err) {
      console.warn('Task toggle error:', err);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{syncStatus}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Your Care & Follow-Up Plan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Personalized daily tasks, monitoring schedules, and clinician instructions for {PATIENT_INFO.name}.
          </p>
        </div>

        <button
          onClick={fetchCarePlan}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Plan</span>
        </button>
      </div>

      {/* Clinician's Direct Signed Instructions */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/60 rounded-2xl p-6 border border-blue-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attending Physician Instructions</h2>
              <span className="text-xs text-slate-500">Dr. Aris Thorne, MD • Cardiorenal Specialist</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Physician Signed</span>
          </span>
        </div>

        <div className="p-4 bg-white/90 rounded-xl border border-blue-200/60 text-sm font-medium text-slate-800 leading-relaxed">
          "{doctorNote}"
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Target goal: Restore baseline eGFR &gt; 60 mL/min</span>
          <button 
            onClick={() => onNavigateTab?.('virtual-doctor')}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Discuss with Dr. Thorne</span>
          </button>
        </div>
      </div>

      {/* Grid: Daily Tasks vs Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Monitoring Tasks (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Today's Daily Monitoring Tasks</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {completedCount} of {tasks.length} tasks completed today
              </p>
            </div>
            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2.5">
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-600'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-emerald-600 shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div>
                    <span className={`text-sm font-semibold block ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {task.timeOfDay} • {task.category}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-400 shrink-0">
                  {task.completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Clinical Follow-Ups (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Upcoming Follow-Ups</span>
            </h2>

            <div className="space-y-3">
              {followUps.map(fu => (
                <div key={fu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{fu.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                      {fu.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{fu.purpose}</p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-blue-700 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{fu.scheduledDate}</span>
                    </span>
                    <span>{fu.clinicianName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav Card to Timeline */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Want to inspect past visits?</span>
              <span className="text-sm font-bold">Explore Health Timeline</span>
            </div>
            <button
              onClick={() => onNavigateTab?.('timeline')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
