import React from 'react';
import { ConsensusState } from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  ShieldAlert, 
  BookOpen, 
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  Info,
  Scale
} from 'lucide-react';

interface ConsensusPanelProps {
  consensus: ConsensusState;
  onOpenExplainabilityModal?: () => void;
}

export const ConsensusPanel: React.FC<ConsensusPanelProps> = ({
  consensus,
  onOpenExplainabilityModal
}) => {
  return (
    <div className="flex flex-col h-full bg-[#131B2E]/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Panel 3: Consensus & Governance Panel
            </h3>
            <p className="text-[11px] text-slate-400">Synthesized Agreement, Disputes, & Safety Governance</p>
          </div>
        </div>

        {/* Clinician Escalation Status Badge */}
        {consensus.requiresClinicianEscalation ? (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
            <Stethoscope className="w-3.5 h-3.5" /> Clinician Review Needed
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Care Plan Validated
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Confidence & Uncertainty Score Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">RECOMMENDATION CONFIDENCE</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                {consensus.overallConfidence}%
              </span>
              <span className="text-xs text-slate-300 font-medium">
                (Evidence Grade: <span className="text-emerald-400 font-bold">{consensus.evidenceStrength}</span>)
              </span>
            </div>
          </div>

          <button
            onClick={onOpenExplainabilityModal}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Audit Evidence</span>
          </button>
        </div>

        {/* Safety Alerts Section */}
        {consensus.safetyAlerts.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Safety & Interaction Alerts</span>
            </div>
            {consensus.safetyAlerts.map((alert, idx) => (
              <div key={idx} className="text-xs text-slate-200 pl-6 border-l-2 border-rose-500/40">
                <span className="font-bold text-white block">{alert.title}</span>
                <span className="text-slate-300 text-[11px]">{alert.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Agreed Findings */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Findings Agreed Upon ({consensus.agreedFindings.length})</span>
          </h4>
          <div className="space-y-2">
            {consensus.agreedFindings.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{item.topic}</span>
                  <div className="flex items-center space-x-1">
                    {item.supportingPersonas.map(pid => {
                      const prof = PERSONA_PROFILES[pid];
                      return (
                        <span
                          key={pid}
                          title={prof?.name}
                          className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                          style={{ backgroundColor: prof?.color || '#38BDF8' }}
                        >
                          {prof?.name[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <p className="text-slate-300 text-[11px]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disputed Findings */}
        {consensus.disputedFindings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Findings Disputed / Under Resolution</span>
            </h4>
            <div className="space-y-2">
              {consensus.disputedFindings.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/30 text-xs space-y-1">
                  <span className="font-bold text-white block">{item.topic}</span>
                  <p className="text-slate-300 text-[11px]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Information Needed */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Missing Context Needed for 100% Certainty</span>
          </h4>
          <ul className="space-y-1 text-[11px] text-slate-300 pl-4 list-disc">
            {consensus.missingInformation.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        </div>

        {/* Recommended Action Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
            Synthesized Next Action Plan
          </span>
          <p className="text-xs font-medium text-white leading-relaxed">
            {consensus.recommendedNextAction}
          </p>
        </div>
      </div>
    </div>
  );
};
