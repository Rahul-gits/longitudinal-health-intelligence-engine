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
  Video,
  ShieldCheck,
  Target,
  Server,
  LogOut,
  FolderOpen,
  BellRing,
  ClipboardList,
  Home,
  Sliders
} from 'lucide-react';
import { PATIENT_INFO, getDynamicPatientProfile } from '../data/mockPatientData';
import { checkBackendHealth, ServerHealthStatus } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

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
  const { user, logout } = useAuth();
  const [showAdvancedMenu, setShowAdvancedMenu] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<ServerHealthStatus>({ status: 'CONNECTING' });

  React.useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      const status = await checkBackendHealth();
      if (isMounted) setServerStatus(status);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Primary Human Navigation Tabs (Aligned to the 6 UX Pillars)
  const healthTabs = [
    { id: 'command', label: 'Overview', sub: 'Health at a glance', icon: Home, badge: 'Daily' },
    { id: 'reports', label: 'My Health Data', sub: 'Reports & records', icon: FolderOpen, badge: '3' },
    { id: 'timeline', label: 'Health Timeline', sub: 'Changes over time', icon: Clock },
    { id: 'insights', label: 'Health Insights', sub: 'What data shows', icon: Sparkles, badge: 'New' }
  ];

  const careTabs = [
    { id: 'virtual-doctor', label: 'Virtual Specialist', sub: 'Talk through health', icon: Video, badge: 'Live AI' },
    { id: 'recovery', label: 'Follow-Up', sub: 'What needs attention', icon: BellRing, badge: '2 items' },
    { id: 'clinician-summary', label: 'Clinical Summary', sub: 'Screening results', icon: ClipboardList }
  ];

  // Advanced Technical Workspaces for Deep Research & Clinicians
  const advancedTabs = [
    { id: 'workflow', label: '13-Phase Clinical Pipeline', icon: Sparkles, badge: 'Engine' },
    { id: 'conference', label: 'Multi-Specialist Debate', icon: Layers },
    { id: 'swarm', label: 'Reasoning Trace (Swarm PSO)', icon: Cpu },
    { id: 'safety', label: 'Safety Check Rules Matrix', icon: ShieldCheck },
    { id: 'clinician', label: 'Clinician EHR Portal (FHIR R4)', icon: Stethoscope },
    { id: 'governance', label: 'Activity & Review History (Audit)', icon: Lock }
  ];

  // Dynamically compute patient details for the authenticated user
  const currentPatient = getDynamicPatientProfile(user);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-3 border-black shadow-[0_4px_0_0_#000]">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Human Tagline */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => setActiveTab('command')}
            className="w-11 h-11 bg-[#FFE600] border-3 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center -rotate-2 hover:rotate-0 transition-transform cursor-pointer"
          >
            <Activity className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 
                onClick={() => setActiveTab('command')}
                className="text-xl font-extrabold font-display tracking-tight text-black cursor-pointer hover:underline"
              >
                HEAL ENGINE
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#FF70A6] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 -rotate-1">
                <Sparkles className="w-3 h-3 text-black" /> SIMPLE CARE INTELLIGENCE
              </span>
            </div>
            <p className="text-xs font-semibold text-black/80 font-mono">Understand your health in one connected place</p>
          </div>
        </div>

        {/* Patient Status & Complexity Level Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Quick Info Card */}
          <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 bg-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold">
            <div className="w-3 h-3 rounded-full bg-[#FF6B35] border border-black animate-ping"></div>
            <div>
              <span className="text-black font-extrabold font-display">{currentPatient.name}</span>
              <span className="text-black/80 ml-1 font-mono">({currentPatient.age}y / {currentPatient.gender})</span>
            </div>
            <span className="px-2 py-0.5 bg-black text-[#FFE600] text-[10px] font-black uppercase border border-black">
              {currentPatient.status}
            </span>
          </div>

          {/* 3 Audience Complexity Levels (Progressive Disclosure) */}
          <div className="flex items-center bg-[#FAF8F5] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold font-mono">
            <button
              onClick={() => setActiveRole('patient')}
              title="Simple human language for patients and families"
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
              title="Clinical decision support & medical precision"
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
              title="Full multi-agent swarm architecture & algorithmic audit"
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

          {/* Live Full Stack Backend Status Badge */}
          <div className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
            serverStatus.status === 'HEALTHY'
              ? 'bg-[#00F5D4] text-black'
              : serverStatus.status === 'CONNECTING'
              ? 'bg-[#FFE600] text-black'
              : 'bg-black text-[#FF70A6]'
          }`}>
            <span className={`w-2 h-2 rounded-full border border-black ${
              serverStatus.status === 'HEALTHY' ? 'bg-black animate-pulse' : 'bg-[#FF5722]'
            }`}></span>
            <Server className="w-3.5 h-3.5" />
            <span>{serverStatus.status === 'HEALTHY' ? 'CONNECTED' : 'LOCAL MODE'}</span>
          </div>

          {/* Logged in User Account & Logout */}
          {user && (
            <div className="flex items-center space-x-1.5 pl-1 border-l-2 border-black/20">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-black font-display leading-tight">{user.fullName || user.email}</span>
                <span className="text-[10px] text-black/60 font-mono">My Workspace</span>
              </div>
              <button
                onClick={logout}
                title="Log out from Heal Engine"
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-[#FEE2E2] text-[#991B1B] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

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

      {/* Main Humanized Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-black bg-[#FAF8F5]">
        <nav className="flex space-x-4 overflow-x-auto py-2.5 scrollbar-none items-center justify-between">
          
          {/* Section 1: YOUR HEALTH */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="hidden xl:inline-block text-[10px] font-black uppercase tracking-wider text-black/50 font-mono pr-1">
              YOUR HEALTH:
            </span>
            {healthTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowAdvancedMenu(false);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black font-display whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
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
          </div>

          <div className="h-5 w-0.5 bg-black/20 shrink-0 hidden sm:block"></div>

          {/* Section 2: YOUR CARE */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="hidden xl:inline-block text-[10px] font-black uppercase tracking-wider text-black/50 font-mono pr-1">
              YOUR CARE:
            </span>
            {careTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowAdvancedMenu(false);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black font-display whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                    isActive
                      ? 'bg-[#00F5D4] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-[#FFFFFF] text-black/80 hover:bg-[#00F5D4]/30 hover:text-black'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 stroke-[2.5] ${isActive ? 'text-black' : 'text-black/70'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Advanced / Engine Dropdown Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-black font-mono whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                advancedTabs.some(t => t.id === activeTab) || showAdvancedMenu
                  ? 'bg-[#A855F7] text-white shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white text-black/80 hover:bg-black/5'
              }`}
            >
              <span>🔬 Engine & Deep Views</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] z-50 py-2 font-mono text-xs animate-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-black/60 border-b border-black/20">
                  Clinical & Forensic Engine Views
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
                      className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-[#FFE600] transition-all cursor-pointer ${
                        isActive ? 'bg-[#FFE600] text-black font-black' : 'text-black'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 stroke-[2.5]" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="text-[9px] px-1 bg-black text-[#FFE600] font-black uppercase">
                          {tab.badge}
                        </span>
                      )}
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
