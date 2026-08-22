import React, { useState } from 'react';
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
  Cpu,
  FlaskConical,
  Heart,
  TrendingDown,
  ChevronDown,
  ShieldCheck,
  Target
} from 'lucide-react';
import { PATIENT_INFO } from '../data/mockPatientData';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: 'patient' | 'clinician' | 'research';
  setActiveRole: (role: 'patient' | 'clinician' | 'research') => void;
  onTriggerEmergency: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  onTriggerEmergency
}) => {
  const [showAdvancedMenu, setShowAdvancedMenu] = useState<boolean>(false);

  // The 6 Primary Human Pillars
  const primaryTabs = [
    { id: 'command', label: '⚡ Cockpit', icon: Activity },
    { id: 'health', label: '🧠 1. Health', icon: Heart, badge: 'Understand' },
    { id: 'changes', label: '🔎 2. Changes', icon: TrendingDown, badge: 'Detect' },
    { id: 'insights', label: '💡 3. Insights', icon: Sparkles, badge: 'Explain' },
    { id: 'safety', label: '🛡️ 4. Safety', icon: ShieldCheck, badge: 'Protect' },
    { id: 'decide', label: '👨‍⚕️ 5. Care Plan', icon: Target, badge: 'Decide' },
    { id: 'recovery', label: '📈 6. Progress', icon: UserCheck, badge: 'Monitor' }
  ];

  // Advanced Technical Workspaces
  const advancedTabs = [
    { id: 'conference', label: 'Specialist Debates', icon: Layers },
    { id: 'swarm', label: 'Reasoning Trace (PSO)', icon: Cpu },
    { id: 'timeline', label: 'Care Timeline', icon: Clock },
    { id: 'reports', label: 'Diagnostic Findings', icon: FileText },
    { id: 'clinician', label: 'Clinician EHR Portal', icon: Stethoscope },
    { id: 'governance', label: 'Consent & 11-Attr Audit', icon: Lock }
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
                <Sparkles className="w-3 h-3 text-black" /> 6-STEP CARE LOOP
              </span>
            </div>
            <p className="text-xs font-semibold text-black/80 font-mono">Longitudinal Clinical Decision Intelligence for Complex Care</p>
          </div>
        </div>

        {/* Patient Status & Complexity Level Switcher */}
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

          {/* 3 Audience Complexity Levels */}
          <div className="flex items-center bg-[#FAF8F5] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold font-mono">
            <button
              onClick={() => setActiveRole('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1 border transition-all cursor-pointer ${
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
              className={`flex items-center space-x-1.5 px-3 py-1 border transition-all cursor-pointer ${
                activeRole === 'clinician'
                  ? 'bg-[#3A86FF] text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-transparent text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Clinician</span>
            </button>
            <button
              onClick={() => setActiveRole('research')}
              className={`flex items-center space-x-1.5 px-3 py-1 border transition-all cursor-pointer ${
                activeRole === 'research'
                  ? 'bg-[#A855F7] text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-transparent text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Research / Eng</span>
            </button>
          </div>

          {/* Emergency Button */}
          <button
            onClick={onTriggerEmergency}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#FF3D00] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] text-xs font-black transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-white stroke-[2.5] animate-bounce" />
            <span className="hidden sm:inline font-display uppercase tracking-wider">Emergency</span>
          </button>
        </div>
      </div>

      {/* Main 6-Step Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-black bg-[#FAF8F5]">
        <nav className="flex space-x-2 overflow-x-auto py-2.5 scrollbar-none items-center">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAdvancedMenu(false);
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-black font-display whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                  isActive
                    ? 'bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-[#FFFFFF] text-black/80 hover:bg-[#FFE600]/30 hover:text-black'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 stroke-[2.5] ${isActive ? 'text-black' : 'text-black/70'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider bg-[#FF70A6] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Advanced Explorer Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
              className={`flex items-center space-x-1 px-3 py-2 text-xs font-black font-mono whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                advancedTabs.some(t => t.id === activeTab) || showAdvancedMenu
                  ? 'bg-[#A855F7] text-white shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white text-black/80 hover:bg-black/5'
              }`}
            >
              <span>🔬 Advanced / Deep Views</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] z-50 py-2 font-mono text-xs animate-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-black/60 border-b border-black/20">
                  Technical Reasoning Workspaces
                </div>
                {advancedTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowAdvancedMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center space-x-2 font-bold hover:bg-[#FFE600] transition-all cursor-pointer ${
                        isActive ? 'bg-[#FFE600] text-black font-black' : 'text-black'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
