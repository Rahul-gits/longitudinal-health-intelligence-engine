import React, { useState } from 'react';
import { PATIENT_CONSENT_SETTINGS, SYSTEM_AUDIT_LOGS } from '../data/mockPatientData';
import { PatientConsentSetting } from '../types/health';
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  FileText, 
  CheckCircle, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const ConsentAndAudit: React.FC = () => {
  const [consentList, setConsentList] = useState<PatientConsentSetting[]>(PATIENT_CONSENT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'consent' | 'audit'>('consent');

  const toggleConsent = (id: string, field: 'aiAnalysis' | 'doctorAccess' | 'caregiverAccess' | 'longTermStorage') => {
    setConsentList(consentList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: !item[field] };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" /> Patient Consent & AI Audit Governance Engine
          </h2>
          <p className="text-xs text-slate-400">
            Granular patient-controlled consent matrix and immutable AI reasoning audit trail.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('consent')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'consent' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
          >
            Patient Consent Matrix
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'audit' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
          >
            AI Audit Log
          </button>
        </div>
      </div>

      {/* View 1: Patient Consent Matrix */}
      {activeTab === 'consent' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block">Patient Control Guarantee</span>
            <p>
              You own your health data. Choose exactly who can view your lab reports, symptoms, and case conference analyses, and for what purpose.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                  <th className="py-3 px-4">Health Data Category</th>
                  <th className="py-3 px-4 text-center">AI Analysis</th>
                  <th className="py-3 px-4 text-center">Doctor Access</th>
                  <th className="py-3 px-4 text-center">Caregiver Access</th>
                  <th className="py-3 px-4 text-center">Long-Term Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {consentList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-all">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{item.dataType}</span>
                      <span className="text-[11px] text-slate-400">{item.description}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'aiAnalysis')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          item.aiAnalysis ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.aiAnalysis ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'doctorAccess')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          item.doctorAccess ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.doctorAccess ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'caregiverAccess')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          item.caregiverAccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.caregiverAccess ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'longTermStorage')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          item.longTermStorage ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.longTermStorage ? 'STORED' : 'EPHEMERAL'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: AI Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block">Auditable Decision Logs</span>
            <p>Every query evaluation, RAG retrieval step, persona debate turn, and safety check is recorded with timestamp and proof.</p>
          </div>

          <div className="space-y-2">
            {SYSTEM_AUDIT_LOGS.map(log => (
              <div key={log.id} className="p-3.5 rounded-xl bg-[#131B2E] border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] bg-slate-800 text-cyan-300 font-mono">Actor: {log.actor}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{log.details}</p>
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Deterministic Safety Rules Checked
                  </span>
                  <span className="text-slate-500 font-mono">Audit ID: #{log.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
