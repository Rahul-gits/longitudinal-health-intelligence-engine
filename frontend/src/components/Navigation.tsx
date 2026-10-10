import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Clock,
  FileText,
  UserCheck,
  ShieldAlert,
  Lock,
  Stethoscope,
  User,
  Users,
  Sparkles,
  Cpu,
  FlaskConical,
  TrendingDown,
  Video,
  ShieldCheck,
  Target,
  Server,
  LogOut,
  FolderOpen,
  BellRing,
  ClipboardList,
  Home,
  UserCog,
  Sun,
  Moon,
  Search,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { getDynamicPatientProfile } from '../data/mockPatientData';
import { checkBackendHealth, ServerHealthStatus } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: 'patient' | 'clinician' | 'research';
  setActiveRole: (role: 'patient' | 'clinician' | 'research') => void;
  onTriggerEmergency: () => void;
  onOpenEditProfile?: () => void;
}

const PATIENT_TABS = [
  { id: 'command',           label: 'Overview',          icon: Home,          badge: '' },
  { id: 'reports',           label: 'My Records',        icon: FolderOpen,    badge: '' },
  { id: 'timeline',          label: 'Timeline',          icon: Clock,         badge: '' },
  { id: 'insights',          label: 'Health Insights',   icon: Sparkles,      badge: 'New' },
  { id: 'virtual-doctor',    label: 'Virtual Specialist',icon: Video,         badge: 'AI' },
  { id: 'recovery',          label: 'Follow-Up',         icon: BellRing,      badge: '' },
  { id: 'clinician-summary', label: 'Clinical Summary',  icon: ClipboardList, badge: '' },
];

const CLINICIAN_TABS = [
  { id: 'command',            label: 'Dashboard',        icon: Home,        badge: '' },
  { id: 'health',             label: 'Patient State',    icon: Layers,      badge: '' },
  { id: 'changes',            label: 'Detect',           icon: TrendingDown,badge: '' },
  { id: 'insights',           label: 'Explain',          icon: Sparkles,    badge: '' },
  { id: 'safety',             label: 'Safety',           icon: ShieldCheck, badge: '!' },
  { id: 'decide',             label: 'Care Options',     icon: Target,      badge: '' },
  { id: 'conference',         label: 'Conference',       icon: Users,       badge: '' },
  { id: 'reports',            label: 'Reports & Labs',   icon: FileText,    badge: '' },
  { id: 'timeline',           label: 'Timeline',         icon: Clock,       badge: '' },
  { id: 'recovery',           label: 'Monitoring',       icon: Activity,    badge: '' },
  { id: 'validation-harness', label: 'Validation',       icon: FlaskConical,badge: '' },
  { id: 'governance',         label: 'Audit',            icon: Lock,        badge: '' },
];

const RESEARCH_TABS = [
  { id: 'workflow',           label: '13-Phase Pipeline', icon: Sparkles,    badge: '' },
  { id: 'validation-harness', label: 'Harness Lab',       icon: FlaskConical,badge: '' },
  { id: 'swarm',              label: 'Swarm (PSO)',        icon: Cpu,         badge: '' },
  { id: 'conference',         label: 'Debate Studio',     icon: Layers,      badge: '' },
  { id: 'governance',         label: 'Forensic Audit',    icon: Lock,        badge: '' },
  { id: 'health',             label: 'Knowledge Graph',   icon: Target,      badge: '' },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  onTriggerEmergency,
  onOpenEditProfile,
}) => {
  const { user, logout }  = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [serverStatus, setServerStatus] = useState<ServerHealthStatus>({ status: 'CONNECTING' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPatient = getDynamicPatientProfile(user);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      const s = await checkBackendHealth();
      if (mounted) setServerStatus(s);
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const tabs =
    activeRole === 'clinician' ? CLINICIAN_TABS :
    activeRole === 'research'  ? RESEARCH_TABS  : PATIENT_TABS;

  const roleName =
    activeRole === 'clinician' ? 'CLINICIAN'  :
    activeRole === 'research'  ? 'RESEARCH'   : 'PATIENT';

  const serverDot =
    serverStatus.status === 'HEALTHY'    ? 'bg-green-500' :
    serverStatus.status === 'CONNECTING' ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <header className="sticky top-0 z-40" style={{ background: 'var(--bg-surface)', borderBottom: '2px solid var(--border)' }}>
      {/* ── TOP BAR ────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[52px] flex items-center justify-between gap-4">

        {/* Brand */}
        <button
          onClick={() => setActiveTab('command')}
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
          aria-label="Go to dashboard"
        >
          <span
            className="he-btn !py-1 !px-2.5 !text-xs !shadow-[3px_3px_0_var(--border)] !uppercase !tracking-widest"
            aria-hidden="true"
          >
            HE
          </span>
          <span className="font-display font-bold text-sm tracking-tight hidden sm:inline" style={{ color: 'var(--text-ink)' }}>
            HEAL ENGINE
          </span>
        </button>

        {/* Patient ID chip */}
        <div
          className="hidden lg:flex items-center gap-2 px-3 py-1 text-xs font-mono shrink-0"
          style={{ border: '1.5px solid var(--border)', background: 'var(--bg-paper)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 he-keep-round" aria-hidden="true" />
          <span className="font-bold" style={{ color: 'var(--text-ink)' }}>{currentPatient.name}</span>
          <span style={{ color: 'var(--text-muted)' }}>{currentPatient.id}</span>
        </div>

        {/* Centre — search (small desktop+) */}
        <div className="hidden md:flex flex-1 max-w-xs relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search patients, records…"
            className="he-input !py-1.5 !pl-7 !text-xs w-full"
            aria-label="Search patients and records"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Role switcher */}
          <div
            className="flex items-center text-[11px] font-bold font-display"
            style={{ border: '1.5px solid var(--border)', background: 'var(--bg-paper)' }}
            role="group"
            aria-label="Switch role view"
          >
            {(['patient', 'clinician', 'research'] as const).map(role => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  const t = role === 'patient' ? PATIENT_TABS : role === 'clinician' ? CLINICIAN_TABS : RESEARCH_TABS;
                  if (!t.some(x => x.id === activeTab)) setActiveTab(t[0].id);
                }}
                aria-pressed={activeRole === role}
                className="px-2.5 py-1.5 uppercase tracking-wider cursor-pointer transition-colors"
                style={{
                  background: activeRole === role ? '#FFE45C' : 'transparent',
                  color: activeRole === role ? '#080808' : 'var(--text-muted)',
                  borderRight: role !== 'research' ? '1px solid var(--rule)' : undefined,
                }}
              >
                {role === 'patient' ? <User className="w-3 h-3 inline mr-1" aria-hidden="true" /> :
                 role === 'clinician' ? <Stethoscope className="w-3 h-3 inline mr-1" aria-hidden="true" /> :
                 <FlaskConical className="w-3 h-3 inline mr-1" aria-hidden="true" />}
                <span className="hidden sm:inline">{role.charAt(0).toUpperCase() + role.slice(1, 4)}</span>
              </button>
            ))}
          </div>

          {/* Server status */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono"
            style={{ border: '1.5px solid var(--rule)', color: 'var(--text-muted)' }}
            aria-label={`Backend ${serverStatus.status}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full he-keep-round ${serverDot}`} aria-hidden="true" />
            <Server className="w-3 h-3" aria-hidden="true" />
            <span>{serverStatus.status === 'HEALTHY' ? 'LIVE' : serverStatus.status === 'CONNECTING' ? '…' : 'OFFLINE'}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="he-btn-ghost !px-2 !py-2 !shadow-brutal-xs"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" aria-hidden="true" /> : <Sun className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>

          {/* Edit profile */}
          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="he-btn-ghost !px-2 !py-2 !shadow-brutal-xs hidden sm:flex"
              aria-label="Edit patient profile"
              title="Edit patient profile & clinical data"
            >
              <UserCog className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          {/* Notifications placeholder */}
          <button className="he-btn-ghost !px-2 !py-2 !shadow-brutal-xs hidden sm:flex" aria-label="Notifications">
            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={logout}
              className="he-btn-ghost !px-2 !py-2 !shadow-brutal-xs"
              aria-label="Log out"
              title="Log out of Heal Engine"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          {/* Emergency */}
          <button
            onClick={onTriggerEmergency}
            className="he-btn-danger !px-3 !py-1.5 !text-[11px] hidden sm:flex"
            aria-label="Trigger emergency protocol"
          >
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Urgent</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            className="he-btn-ghost !px-2 !py-2 sm:hidden"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── WORKSPACE TAB BAR ──────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--rule)', background: 'var(--bg-paper)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Role identifier */}
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            <span
              className="he-badge !py-1.5 !px-3 mr-3 shrink-0 text-[10px] tracking-widest hidden lg:inline-flex"
              style={{ background: activeRole === 'patient' ? '#FFE45C' : activeRole === 'clinician' ? '#CCFBF1' : 'var(--bg-surface)', color: 'var(--text-ink)' }}
            >
              {roleName}
            </span>

            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`he-sub-tab flex-shrink-0 ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-3 h-3" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className="text-[9px] font-black font-mono px-1 py-0.5"
                      style={{ background: '#FFE45C', color: '#080808', border: '1px solid #080808' }}
                      aria-label={`${tab.badge} indicator`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU PANEL ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 top-[100px] z-50 animate-fade-in"
          style={{ background: 'var(--bg-surface)', borderTop: '2px solid var(--border)', overflowY: 'auto' }}
          role="dialog"
          aria-label="Navigation menu"
        >
          <nav className="p-4 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileOpen(false); }}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-left transition-colors"
                  style={{
                    background: isActive ? '#FFE45C' : 'transparent',
                    color: 'var(--text-ink)',
                    border: isActive ? '1.5px solid var(--border)' : '1.5px solid transparent',
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <hr className="he-rule my-3" />
            <button onClick={onTriggerEmergency} className="he-btn-danger w-full justify-center">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              Emergency / Urgent Care
            </button>
            <button onClick={logout} className="he-btn-ghost w-full justify-center mt-2">
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
