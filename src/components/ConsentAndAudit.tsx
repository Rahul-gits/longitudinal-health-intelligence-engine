import React, { useState } from 'react';
import { PATIENT_CONSENT_SETTINGS, SYSTEM_AUDIT_LOGS } from '../data/mockPatientData';
import { PatientConsentSetting } from '../types/health';
import { 
  Lock, 
  CheckCircle
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
      <div className="p-5 bg-[#00F5D4] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-black tracking-tight flex items-center gap-2 uppercase">
            <Lock className="w-6 h-6 stroke-[2.5]" /> PATIENT CONSENT & AI AUDIT GOVERNANCE
          </h2>
          <p className="text-xs font-mono font-bold text-black/90 mt-1">
            Granular patient-controlled consent matrix and immutable AI reasoning audit trail.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#FFFFFF] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black font-mono">
          <button
            onClick={() => setActiveTab('consent')}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer uppercase ${activeTab === 'consent' ? 'bg-black text-[#FFE600] border-black' : 'border-transparent text-black hover:bg-[#FFE600]'}`}
          >
            Consent Matrix
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer uppercase ${activeTab === 'audit' ? 'bg-black text-[#FFE600] border-black' : 'border-transparent text-black hover:bg-[#FFE600]'}`}
          >
            AI Audit Log
          </button>
        </div>
      </div>

      {/* View 1: Patient Consent Matrix */}
      {activeTab === 'consent' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFE600] border-3 border-black shadow-[5px_5px_0px_0px_#000] text-xs text-black font-bold space-y-1">
            <span className="font-black font-display uppercase tracking-wider block bg-black text-[#FFE600] px-1.5 py-0.5 w-fit">PATIENT CONTROL GUARANTEE</span>
            <p className="mt-1 leading-relaxed">
              You own your health data. Choose exactly who can view your lab reports, symptoms, and case conference analyses, and for what purpose.
            </p>
          </div>

          <div className="p-4 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-3 border-black bg-[#FAF8F5] text-black uppercase text-[10px] font-mono font-black">
                  <th className="py-3 px-4">Health Data Category</th>
                  <th className="py-3 px-4 text-center">AI Analysis</th>
                  <th className="py-3 px-4 text-center">Doctor Access</th>
                  <th className="py-3 px-4 text-center">Caregiver Access</th>
                  <th className="py-3 px-4 text-center">Long-Term Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black font-bold">
                {consentList.map(item => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-all">
                    <td className="py-3.5 px-4">
                      <span className="font-black font-display text-black block text-sm">{item.dataType}</span>
                      <span className="text-[11px] font-mono text-black/70">{item.description}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'aiAnalysis')}
                        className={`px-3 py-1 border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                          item.aiAnalysis ? 'bg-[#CCFF00] text-black' : 'bg-black text-white'
                        }`}
                      >
                        {item.aiAnalysis ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'doctorAccess')}
                        className={`px-3 py-1 border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                          item.doctorAccess ? 'bg-[#3A86FF] text-white' : 'bg-black text-white'
                        }`}
                      >
                        {item.doctorAccess ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'caregiverAccess')}
                        className={`px-3 py-1 border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                          item.caregiverAccess ? 'bg-[#FF70A6] text-black' : 'bg-black text-white'
                        }`}
                      >
                        {item.caregiverAccess ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleConsent(item.id, 'longTermStorage')}
                        className={`px-3 py-1 border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                          item.longTermStorage ? 'bg-[#FFE600] text-black' : 'bg-black text-white'
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
        <div className="space-y-4">
          <div className="p-4 bg-[#FFE600] border-3 border-black shadow-[5px_5px_0px_0px_#000] text-xs text-black font-bold space-y-1">
            <span className="font-black font-display uppercase tracking-wider block bg-black text-[#FFE600] px-1.5 py-0.5 w-fit">AUDITABLE DECISION LOGS</span>
            <p className="mt-1 leading-relaxed">Every query evaluation, RAG retrieval step, persona debate turn, and safety check is recorded with timestamp and cryptographic hash proof.</p>
          </div>

          <div className="space-y-3">
            {SYSTEM_AUDIT_LOGS.map(log => (
              <div key={log.id} className="p-4 bg-[#FFFFFF] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-xs space-y-1.5">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-black font-display text-black text-sm">{log.action}</span>
                    <span className="px-2 py-0.5 bg-[#00F5D4] text-black border border-black font-mono font-black text-[10px]">Actor: {log.actor}</span>
                  </div>
                  <span className="text-[10px] text-black font-mono font-black bg-[#FFE600] px-2 py-0.5 border border-black">{log.timestamp}</span>
                </div>
                <p className="text-black font-semibold text-[11px] mt-1">{log.details}</p>
                <div className="pt-2 border-t-2 border-black flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="bg-[#CCFF00] text-black px-2 py-0.5 border border-black flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" /> DETERMINISTIC SAFETY VALIDATED
                  </span>
                  <span className="text-black font-black">AUDIT ID: #{log.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
