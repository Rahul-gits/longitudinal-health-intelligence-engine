import React, { useState } from 'react';
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
  Activity,
  X,
  MessageSquare,
  UserCheck,
  Tag,
  ShieldAlert,
  UserCog,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDynamicPatientProfile } from '../data/mockPatientData';

interface PatientPortalDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onOpenVirtualDoctor: () => void;
  onOpenEditProfile?: (initialTab?: 'demographics' | 'conditions' | 'medications' | 'allergies' | 'preferences') => void;
}

export const PatientPortalDashboard: React.FC<PatientPortalDashboardProps> = ({
  onNavigateTab,
  onOpenVirtualDoctor,
  onOpenEditProfile
}) => {
  const { user } = useAuth();
  const currentPatient = getDynamicPatientProfile(user);
  const [showExplainModal, setShowExplainModal] = useState<boolean>(false);

  // Determine if this is a cardiorenal profile or customized user profile
  const isCardiorenalCase = currentPatient.name.toLowerCase().includes('eleanor') ||
    currentPatient.conditions.some(c => c.toLowerCase().includes('heart') || c.toLowerCase().includes('kidney'));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Greeting & Profile Sync Badge */}
      <div
        className="p-6 transition-colors"
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          boxShadow: '4px 4px 0 var(--border)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider font-semibold"
                style={{
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-ink)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 he-keep-round animate-pulse"></span>
                Secure Patient Portal
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold"
                style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  border: '1px solid #15803D',
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Synced: {user?.fullName || currentPatient.name} ({user?.email || 'Active Account'})</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight" style={{ color: 'var(--text-ink)' }}>
              Good morning, {currentPatient.name.split(' ')[0]}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Here is your personal health overview, live clinical profile, and care team guidance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenEditProfile?.('demographics')}
              className="he-btn-ghost cursor-pointer"
              title="Modify demographics, conditions, medications & clinical profile"
            >
              <UserCog className="w-4 h-4" />
              <span>Edit Profile & Data</span>
            </button>
            <button
              onClick={onOpenVirtualDoctor}
              className="he-btn cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Talk to Virtual Specialist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized User Clinical Profile Card */}
      <div
        className="p-5 transition-colors"
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          boxShadow: '3px 3px 0 var(--border)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4" style={{ borderBottom: '1px solid var(--rule)' }}>
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 flex items-center justify-center font-bold text-sm font-display"
              style={{ background: '#FFE45C', color: '#080808', border: '1.5px solid var(--border)' }}
            >
              {currentPatient.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-display" style={{ color: 'var(--text-ink)' }}>{currentPatient.name}</h3>
                <span
                  className="text-[11px] font-mono px-2 py-0.5 font-medium"
                  style={{ background: 'var(--bg-paper)', color: 'var(--text-muted)', border: '1px solid var(--rule)' }}
                >
                  {currentPatient.id}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {currentPatient.age} years old • {currentPatient.gender} • Blood Type: {currentPatient.bloodType} • Baseline: {currentPatient.status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="text-xs font-mono font-bold px-3 py-1 flex items-center gap-1.5 uppercase"
              style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #15803D' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 he-keep-round"></span>
              Health Score: {currentPatient.overallHealthScore}/100
            </span>
            <button
              onClick={() => onOpenEditProfile?.('demographics')}
              className="he-btn-ghost !py-1 !text-xs cursor-pointer"
              title="Edit patient profile and health data"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Clinical Profile Chips: Diagnoses, Medications, Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          {/* Active Conditions */}
          <div
            className="p-3 space-y-2"
            style={{ background: 'var(--bg-paper)', border: '1px solid var(--rule)' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-ink)' }}>
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                Active Conditions ({currentPatient.conditions.length})
              </span>
              <button
                onClick={() => onOpenEditProfile?.('conditions')}
                className="text-[11px] font-mono font-bold hover:underline cursor-pointer flex items-center gap-1"
                style={{ color: 'var(--text-ink)' }}
                title="Modify conditions"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentPatient.conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 font-medium text-[11px]"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-ink)' }}
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>

          {/* Current Medications */}
          <div
            className="p-3 space-y-2"
            style={{ background: 'var(--bg-paper)', border: '1px solid var(--rule)' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-ink)' }}>
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                Active Prescriptions ({currentPatient.medications.length})
              </span>
              <button
                onClick={() => onOpenEditProfile?.('medications')}
                className="text-[11px] font-mono font-bold hover:underline cursor-pointer flex items-center gap-1"
                style={{ color: 'var(--text-ink)' }}
                title="Modify medications"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentPatient.medications.map((med, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 font-medium text-[11px]"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-ink)' }}
                >
                  {med}
                </span>
              ))}
            </div>
          </div>

          {/* Allergies & Primary Care */}
          <div
            className="p-3 space-y-2"
            style={{ background: 'var(--bg-paper)', border: '1px solid var(--rule)' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-ink)' }}>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Allergies & Primary Care
              </span>
              <button
                onClick={() => onOpenEditProfile?.('allergies')}
                className="text-[11px] font-mono font-bold hover:underline cursor-pointer flex items-center gap-1"
                style={{ color: 'var(--text-ink)' }}
                title="Modify allergies"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                {currentPatient.allergies.map((all, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 font-semibold text-[10px]"
                    style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #DC2626' }}
                  >
                    {all}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-medium pt-1" style={{ color: 'var(--text-muted)' }}>
                Primary: <strong style={{ color: 'var(--text-ink)' }}>{currentPatient.primaryPhysician.split(' (')[0]}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Overview & Attention Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          className="md:col-span-2 p-6 space-y-4"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '3px 3px 0 var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2" style={{ color: 'var(--text-ink)' }}>
              <Activity className="w-5 h-5 text-teal-600" />
              <span>Your Health Overview</span>
            </h2>
            <span
              className="px-3 py-0.5 text-xs font-mono font-bold uppercase tracking-wider"
              style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}
            >
              {isCardiorenalCase ? '2 items need attention' : '1 item under review'}
            </span>
          </div>

          <div className="space-y-3">
            {/* Attention Item 1 - Medication Check */}
            <div
              className="p-4 flex items-start justify-between gap-3"
              style={{ background: '#FEF3C7', border: '1.5px solid #F59E0B', borderLeft: '4px solid #F59E0B' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FDE68A', color: '#B45309' }}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Medication safety check
                  </h3>
                  <p className="text-xs text-slate-700 mt-0.5">
                    {isCardiorenalCase
                      ? 'Your recent kidney filtration results changed with concurrent anti-inflammatory therapy.'
                      : `Active monitoring established for ${currentPatient.medications[0] || 'daily medication schedule'}.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplainModal(true)}
                className="he-btn-ghost !py-1 !text-xs shrink-0 cursor-pointer"
                id="understand-why-btn"
              >
                <span>Understand why</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attention Item 2 - Blood Pressure & Hydration */}
            <div
              className="p-4 flex items-start justify-between gap-3"
              style={{ background: 'var(--bg-paper)', border: '1.5px solid var(--border)', borderLeft: '4px solid var(--teal)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--teal)' }}>
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-ink)' }}>
                    Vitals & longitudinal trend stability
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {isCardiorenalCase
                      ? 'Blood pressure and renal biomarkers are being tracked continuously.'
                      : `Vitals trend baseline verified stable for ${currentPatient.conditions[0] || 'wellness'}.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="he-btn-ghost !py-1 !text-xs shrink-0 cursor-pointer"
                id="view-details-btn"
              >
                <span>View details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Summary & Next Check-in */}
        <div
          className="p-6 flex flex-col justify-between space-y-4"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '3px 3px 0 var(--border)',
          }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assigned Care Team</span>
            </div>
            <h3 className="text-base font-bold font-display" style={{ color: 'var(--text-ink)' }}>
              {currentPatient.primaryPhysician.split(' (')[0]}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {currentPatient.primaryPhysician.includes('(')
                ? currentPatient.primaryPhysician.split('(')[1].replace(')', '')
                : 'Primary Care Specialist'} • Verified Network Provider
            </p>
            <div
              className="mt-3 p-3 text-xs"
              style={{ background: 'var(--bg-paper)', border: '1px solid var(--rule)', color: 'var(--text-ink)' }}
            >
              <span className="font-semibold block mb-1" style={{ color: 'var(--text-ink)' }}>Doctor's latest note:</span>
              {isCardiorenalCase
                ? `"${currentPatient.name.split(' ')[0]} is doing well overall. Let's make sure we protect her kidney filtration by switching pain relief to topical therapy."`
                : `"${currentPatient.name.split(' ')[0]} has a verified clinical record. Continuing longitudinal tracking for ${currentPatient.conditions[0] || 'health baseline'}. Please log any daily symptoms or medication adjustments."`}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--rule)', color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Next Check-in: In 14 Days</span>
            </span>
            <span className="font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
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
          className="text-left p-5 transition-all group cursor-pointer"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '3px 3px 0 var(--border)',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-paper)', border: '1px solid var(--border)', color: 'var(--text-ink)' }}
          >
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-display" style={{ color: 'var(--text-ink)' }}>Health Timeline</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>See how your labs and vitals change over weeks.</p>
          <div className="mt-3 flex items-center text-xs font-mono font-bold gap-1" style={{ color: 'var(--text-ink)' }}>
            <span>Explore history</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Hub Tile 2: Talk to Virtual Specialist */}
        <button
          onClick={onOpenVirtualDoctor}
          className="text-left p-5 transition-all group cursor-pointer"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '3px 3px 0 var(--border)',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center mb-3"
            style={{ background: '#FFE45C', border: '1px solid var(--border)', color: '#080808' }}
          >
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-display" style={{ color: 'var(--text-ink)' }}>Virtual Specialist</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Have an interactive conversation about your symptoms.</p>
          <div className="mt-3 flex items-center text-xs font-mono font-bold gap-1" style={{ color: 'var(--text-ink)' }}>
            <span>Start dialogue</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Hub Tile 3: My Reports */}
        <button
          onClick={() => onNavigateTab('reports')}
          className="text-left p-5 transition-all group cursor-pointer"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '3px 3px 0 var(--border)',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-paper)', border: '1px solid var(--border)', color: 'var(--text-ink)' }}
          >
            <FolderOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-display" style={{ color: 'var(--text-ink)' }}>My Reports</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Access verified blood work, hospital notes, and scans.</p>
          <div className="mt-3 flex items-center text-xs font-mono font-bold gap-1" style={{ color: 'var(--text-ink)' }}>
            <span>3 records available</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Hub Tile 4: Medications & Follow-Up */}
        <button
          onClick={() => onNavigateTab('recovery')}
          className="text-left p-5 transition-all group cursor-pointer"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '3px 3px 0 var(--border)',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-paper)', border: '1px solid var(--border)', color: 'var(--text-ink)' }}
          >
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-display" style={{ color: 'var(--text-ink)' }}>Medications & Care</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Daily medication schedule and recovery reminders.</p>
          <div className="mt-3 flex items-center text-xs font-mono font-bold gap-1" style={{ color: 'var(--text-ink)' }}>
            <span>Review prescriptions</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Safety & Contact Assistance Footer */}
      <div
        className="p-4 text-xs flex flex-col md:flex-row items-center justify-between gap-3"
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Need immediate assistance? 24/7 Nurse Triage Line is available at <strong style={{ color: 'var(--text-ink)' }}>(800) 555-HEAL</strong>.</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span>Encrypted with TLS 1.3</span>
          <span>•</span>
          <span>Protected Health Record</span>
        </div>
      </div>

      {/* Screen 2 — Explain Modal (Zero Clinical Jargon, Pure Plain Language) */}
      {showExplainModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explain-modal-title"
        >
          <div
            className="w-full max-w-lg overflow-hidden transform transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--border)',
              boxShadow: '6px 6px 0 var(--border)',
            }}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: '#FFE45C', color: '#080808', borderBottom: '2px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center font-bold" style={{ background: '#080808', color: '#FFE45C' }}>
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="explain-modal-title" className="text-base font-bold font-display uppercase tracking-tight text-black">
                    Understanding Your Health Check
                  </h3>
                  <p className="text-xs text-black/80 font-mono">
                    Plain-language guide prepared for {currentPatient.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="w-7 h-7 flex items-center justify-center text-black hover:bg-black/10 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 4 Clear Questions */}
            <div className="p-6 space-y-4 text-sm" style={{ background: 'var(--bg-surface)' }}>
              {/* Question 1: What changed? */}
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-ink)' }}>What changed?</span>
                <p
                  className="font-medium p-3 text-xs"
                  style={{ background: 'var(--bg-paper)', border: '1px solid var(--rule)', color: 'var(--text-ink)' }}
                >
                  {isCardiorenalCase
                    ? 'Your kidney function has changed compared with your previous results.'
                    : `Active health and vital monitoring is underway for ${currentPatient.conditions.join(', ')}.`}
                </p>
              </div>

              {/* Question 2: Why does it matter? */}
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-ink)' }}>Why does it matter?</span>
                <p
                  className="p-3 text-xs"
                  style={{ background: 'var(--bg-paper)', border: '1px solid var(--rule)', color: 'var(--text-ink)' }}
                >
                  {isCardiorenalCase
                    ? 'Some medicines can affect kidney function when combined with certain health conditions.'
                    : `Keeping track of prescribed medications helps ${currentPatient.primaryPhysician.split(' (')[0]} ensure optimal therapeutic efficacy and safety.`}
                </p>
              </div>

              {/* Question 3: What should I do? */}
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-ink)' }}>What should I do?</span>
                <p
                  className="p-3 text-xs"
                  style={{ background: 'var(--bg-paper)', border: '1px solid var(--rule)', color: 'var(--text-ink)' }}
                >
                  {isCardiorenalCase
                    ? `Your care team has recommended reviewing your medication and pausing over-the-counter pain pills (like Advil or Ibuprofen) until you discuss a gentler topical option with ${currentPatient.primaryPhysician.split(',')[0]}.`
                    : `Take your scheduled medications (${currentPatient.medications.join(', ')}) as instructed, log your vitals regularly, and reach out to your clinical team with any questions.`}
                </p>
              </div>

              {/* Question 4: When should I seek immediate help? */}
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--danger)' }}>When should I seek immediate help?</span>
                <p
                  className="p-3 text-xs leading-relaxed"
                  style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#991B1B' }}
                >
                  If you experience sudden shortness of breath, severe chest pressure, or rapid swelling in your legs, call 911 or visit Urgent Care immediately.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              className="px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3"
              style={{ background: 'var(--bg-paper)', borderTop: '1.5px solid var(--border)' }}
            >
              <button
                onClick={() => setShowExplainModal(false)}
                className="he-btn-ghost !text-xs cursor-pointer w-full sm:w-auto"
              >
                Done reading
              </button>
              <button
                onClick={() => {
                  setShowExplainModal(false);
                  onOpenVirtualDoctor();
                }}
                className="he-btn !text-xs cursor-pointer w-full sm:w-auto"
                id="talk-to-care-team-btn"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Talk to my care team</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
