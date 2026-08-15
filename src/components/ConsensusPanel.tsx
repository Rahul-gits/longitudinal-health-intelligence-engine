import React from 'react';
import { ConsensusState } from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';
import { 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
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
    <div className="flex flex-col h-full bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b-3 border-black bg-[#CCFF00] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black text-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center -rotate-1">
            <Scale className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display text-black uppercase tracking-wider">
              PANEL 3: CONSENSUS & GOVERNANCE
            </h3>
            <p className="text-[10px] font-mono font-bold text-black/90">Synthesized Agreement & Safety</p>
          </div>
        </div>

        {/* Clinician Escalation Status Badge */}
        {consensus.requiresClinicianEscalation ? (
          <span className="px-2 py-1 text-[10px] font-black uppercase bg-[#FF6B35] text-black border border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 stroke-[2.5]" /> Review Needed
          </span>
        ) : (
          <span className="px-2 py-1 text-[10px] font-black uppercase bg-black text-[#CCFF00] border border-black flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Validated
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#FAF8F5]">
        {/* Confidence & Uncertainty Score Card */}
        <div className="p-4 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-black font-black uppercase font-mono block">RECOMMENDATION CONFIDENCE</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-3xl font-black text-black font-mono">
                {consensus.overallConfidence}%
              </span>
              <span className="text-xs text-black font-bold font-mono">
                (Grade: <span className="bg-black text-white px-1 font-black">{consensus.evidenceStrength}</span>)
              </span>
            </div>
          </div>

          <button
            onClick={onOpenExplainabilityModal}
            className="px-3 py-1.5 bg-black text-white hover:bg-black/80 font-black text-[10px] font-mono border border-black shadow-[1px_1px_0px_0px_#000] flex items-center space-x-1 cursor-pointer uppercase"
          >
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Audit</span>
          </button>
        </div>

        {/* Safety Alerts Section */}
        {consensus.safetyAlerts.length > 0 && (
          <div className="p-3 bg-[#FF70A6] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
            <div className="flex items-center space-x-2 text-black text-xs font-black uppercase tracking-wider font-display">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>Safety & Interaction Alerts</span>
            </div>
            {consensus.safetyAlerts.map((alert, idx) => (
              <div key={idx} className="text-xs text-black pl-3 border-l-3 border-black">
                <span className="font-black text-black block">{alert.title}</span>
                <span className="text-black/90 font-semibold text-[11px]">{alert.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Agreed Findings */}
        <div className="space-y-2">
          <h4 className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Findings Agreed Upon ({consensus.agreedFindings.length})</span>
          </h4>
          <div className="space-y-2">
            {consensus.agreedFindings.map(item => (
              <div key={item.id} className="p-3 bg-[#FFFFFF] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black font-display">{item.topic}</span>
                  <div className="flex items-center space-x-1">
                    {item.supportingPersonas.map(pid => {
                      const prof = PERSONA_PROFILES[pid];
                      return (
                        <span
                          key={pid}
                          title={prof?.name}
                          className="w-4 h-4 text-[9px] font-black flex items-center justify-center text-black border border-black"
                          style={{ backgroundColor: prof?.color || '#38BDF8' }}
                        >
                          {prof?.name[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <p className="text-black/90 font-semibold text-[11px]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disputed Findings */}
        {consensus.disputedFindings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Findings Disputed</span>
            </h4>
            <div className="space-y-2">
              {consensus.disputedFindings.map(item => (
                <div key={item.id} className="p-3 bg-[#FF6B35] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs space-y-1">
                  <span className="font-black text-black block font-display">{item.topic}</span>
                  <p className="text-black font-semibold text-[11px]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Information Needed */}
        <div className="p-3 bg-[#FFFFFF] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1.5">
          <h4 className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>Missing Context Needed</span>
          </h4>
          <ul className="space-y-1 text-[11px] font-semibold text-black/90 pl-4 list-disc font-mono">
            {consensus.missingInformation.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        </div>

        {/* Recommended Action Box */}
        <div className="p-4 bg-[#00F5D4] border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-black font-mono block bg-black text-[#00F5D4] px-1.5 py-0.5 w-fit">
            SYNTHESIZED NEXT ACTION PLAN
          </span>
          <p className="text-xs font-black text-black leading-relaxed font-display mt-1">
            {consensus.recommendedNextAction}
          </p>
        </div>
      </div>
    </div>
  );
};
