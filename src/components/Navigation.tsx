import React from 'react';
import { 
  Activity, 
  Layers, 
  Clock, 
  FileText, 
  Pill, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Stethoscope, 
  User, 
  Users,
  Sparkles
} from 'lucide-react';
import { PATIENT_INFO } from '../data/mockPatientData';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: 'patient' | 'clinician' | 'caregiver';
  setActiveRole: (role: 'patient' | 'clinician' | 'caregiver') => void;
  onTriggerEmergency: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  onTriggerEmergency
}) => {
  const tabs = [
    { id: 'command', label: 'Command Center', icon: Activity },
    { id: 'conference', label: 'Case Conference (3-Panel)', icon: Layers, badge: 'Live AI' },
    { id: 'timeline', label: 'Health Timeline', icon: Clock },
    { id: 'reports', label: 'Report Intelligence', icon: FileText },
    { id: 'meds', label: 'Medication Safety', icon: Pill },
    { id: 'recovery', label: 'Recovery & Diary', icon: UserCheck },
    { id: 'clinician', label: 'Clinician Portal', icon: Stethoscope },
    { id: 'governance', label: 'Consent & Audit', icon: Lock }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">HEAL ENGINE</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Digital Twin Operating System
              </span>
            </div>
            <p className="text-xs text-slate-400">Longitudinal Patient Health Intelligence Platform</p>
          </div>
        </div>

        {/* Patient Status & Role Switcher */}
        <div className="flex items-center space-x-4">
          {/* Patient Quick Info Card */}
          <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <div>
              <span className="font-semibold text-slate-200">{PATIENT_INFO.name}</span>
              <span className="text-slate-400 ml-1.5">({PATIENT_INFO.age}y / {PATIENT_INFO.gender})</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {PATIENT_INFO.status}
            </span>
          </div>

          {/* Role Switcher Pills */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveRole('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                activeRole === 'patient'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient View</span>
            </button>
            <button
              onClick={() => setActiveRole('clinician')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                activeRole === 'clinician'
                  ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinician View</span>
            </button>
            <button
              onClick={() => setActiveRole('caregiver')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                activeRole === 'caregiver'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Caregiver View</span>
            </button>
          </div>

          {/* Red Flag Emergency Override Button */}
          <button
            onClick={onTriggerEmergency}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all shadow-sm hover:shadow-rose-500/10"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
            <span className="hidden sm:inline">Emergency Screening</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-gradient-to-r from-purple-500 to-cyan-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
