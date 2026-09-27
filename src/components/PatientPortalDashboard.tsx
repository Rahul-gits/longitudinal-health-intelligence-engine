import React from 'react';
import { 
  Heart, 
  AlertCircle, 
  Calendar, 
  Video, 
  FolderOpen, 
  Pill, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  Activity
} from 'lucide-react';
import { PATIENT_INFO } from '../data/mockPatientData';

interface PatientPortalDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onOpenVirtualDoctor: () => void;
}

export const PatientPortalDashboard: React.FC<PatientPortalDashboardProps> = ({
  onNavigateTab,
  onOpenVirtualDoctor
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Greeting */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-2xl p-6 text-white shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium mb-2 border border-blue-400/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Secure Patient Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Good morning, {PATIENT_INFO.name.split(' ')[0]}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Here is your personal health overview and your care team's latest guidance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenVirtualDoctor}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <Video className="w-4 h-4" />
              <span>Talk to Virtual Specialist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Health Overview & Attention Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Your Health Overview</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              2 items need attention
            </span>
          </div>

          <div className="space-y-3">
            {/* Attention Item 1 */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Knee Pain Medication Safety Check
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your recent blood work shows your kidneys are sensitive. Please pause over-the-counter pain pills (like Advil or Ibuprofen) until you discuss a gentler topical option with Dr. Thorne.
                  </p>
                </div>
              </div>
              <button 
                onClick={onOpenVirtualDoctor}
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
              >
                <span>Discuss</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attention Item 2 */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Hydration & Blood Pressure Check
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your morning blood pressure readings are steady at 128/82. Remember to drink 6 to 8 glasses of water daily and take your Lisinopril with breakfast.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onNavigateTab('timeline')}
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
              >
                <span>View Trend</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Summary & Next Check-in */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assigned Care Team</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Dr. Aris Thorne, MD</h3>
            <p className="text-xs text-slate-500">Cardiorenal Care Specialist • St. Jude Health</p>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold block text-slate-800 mb-1">Doctor's latest note:</span>
              "Eleanor is doing very well overall. Let's make sure we protect her kidney filtration by switching pain relief to topical therapy."
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Next Routine Lab: Oct 15</span>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Records Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Core Patient Navigation Hub */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hub Tile 1: Health Timeline */}
        <button
          onClick={() => onNavigateTab('timeline')}
          className="text-left bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600">Health Timeline</h3>
          <p className="text-xs text-slate-500 mt-1">See how your labs and vitals change over weeks.</p>
          <div className="mt-3 flex items-center text-xs font-semibold text-blue-600 gap-1">
            <span>Explore history</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Hub Tile 2: Talk to Virtual Specialist */}
        <button
          onClick={onOpenVirtualDoctor}
          className="text-left bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600">Virtual Specialist</h3>
          <p className="text-xs text-slate-500 mt-1">Have an interactive conversation about your symptoms.</p>
          <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600 gap-1">
            <span>Start dialogue</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Hub Tile 3: My Reports */}
        <button
          onClick={() => onNavigateTab('reports')}
          className="text-left bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FolderOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-emerald-600">My Reports</h3>
          <p className="text-xs text-slate-500 mt-1">Access verified blood work, hospital notes, and scans.</p>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600 gap-1">
            <span>3 records available</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Hub Tile 4: Medications & Follow-Up */}
        <button
          onClick={() => onNavigateTab('recovery')}
          className="text-left bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-purple-600">Medications & Care</h3>
          <p className="text-xs text-slate-500 mt-1">Daily medication schedule and recovery reminders.</p>
          <div className="mt-3 flex items-center text-xs font-semibold text-purple-600 gap-1">
            <span>Review prescriptions</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Safety & Contact Assistance Footer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Need immediate assistance? 24/7 Nurse Triage Line is available at <strong>(800) 555-HEAL</strong>.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Encrypted with TLS 1.3</span>
          <span>•</span>
          <span>Protected Health Record</span>
        </div>
      </div>
    </div>
  );
};
