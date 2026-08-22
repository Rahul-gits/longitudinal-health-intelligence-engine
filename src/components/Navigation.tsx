import React from 'react';
import { 
  Activity, 
  Layers, 
  Clock, 
  FileText, 
  Pill, 
  UserCheck, 
  ShieldAlert, 
  Lock, 
  Stethoscope, 
  User, 
  Users,
  Sparkles,
  Cpu
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
    { id: 'swarm', label: 'Swarm Engine', icon: Cpu, badge: 'PSO 13+' },
    { id: 'timeline', label: 'Health Timeline', icon: Clock },
    { id: 'reports', label: 'Report Intelligence', icon: FileText },
    { id: 'meds', label: 'Medication Safety', icon: Pill },
    { id: 'recovery', label: 'Recovery & Diary', icon: UserCheck },
    { id: 'clinician', label: 'Clinician Portal', icon: Stethoscope },
    { id: 'governance', label: 'Consent & Audit', icon: Lock }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-3 border-black shadow-[0_4px_0_0_#000]">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-[#FFE600] border-3 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center -rotate-2 hover:rotate-0 transition-transform cursor-pointer">
            <Activity className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold font-display tracking-tight text-black">HEAL ENGINE</h1>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#FF70A6] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 -rotate-1">
                <Sparkles className="w-3 h-3 text-black" /> CLOSED-LOOP DECISION INTEL
              </span>
            </div>
            <p className="text-xs font-semibold text-black/80 font-mono">Longitudinal Clinical Decision Intelligence for Complex Care</p>
          </div>
        </div>

        {/* Patient Status & Role Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Quick Info Card */}
          <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 bg-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold">
            <div className="w-3 h-3 rounded-full bg-[#FF6B35] border border-black animate-ping"></div>
            <div>
              <span className="text-black font-extrabold font-display">{PATIENT_INFO.name}</span>
              <span className="text-black/80 ml-1 font-mono">({PATIENT_INFO.age}y / {PATIENT_INFO.gender})</span>
            </div>
            <span className="px-2 py-0.5 bg-black text-[#FFE600] text-[10px] font-black uppercase border border-black">
              {PATIENT_INFO.status}
            </span>
          </div>

          {/* Role Switcher Buttons */}
          <div className="flex items-center bg-[#FAF8F5] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold">
            <button
              onClick={() => setActiveRole('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1 border transition-all ${
                activeRole === 'patient'
                  ? 'bg-[#FFE600] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-transparent text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              <User className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Patient</span>
            </button>
            <button
              onClick={() => setActiveRole('clinician')}
              className={`flex items-center space-x-1.5 px-3 py-1 border transition-all ${
                activeRole === 'clinician'
                  ? 'bg-[#3A86FF] text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-transparent text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Clinician</span>
            </button>
            <button
              onClick={() => setActiveRole('caregiver')}
              className={`flex items-center space-x-1.5 px-3 py-1 border transition-all ${
                activeRole === 'caregiver'
                  ? 'bg-[#CCFF00] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-transparent text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Caregiver</span>
            </button>
          </div>

          {/* Emergency Screening Button */}
          <button
            onClick={onTriggerEmergency}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#FF3D00] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] text-xs font-black transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-white stroke-[2.5] animate-bounce" />
            <span className="hidden sm:inline font-display uppercase tracking-wider">Emergency</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-black bg-[#FAF8F5]">
        <nav className="flex space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-black font-display whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                  isActive
                    ? 'bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-[#FFFFFF] text-black/80 hover:bg-[#FFE600]/30 hover:text-black hover:shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[2.5] ${isActive ? 'text-black' : 'text-black/70'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-[#FF70A6] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
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
