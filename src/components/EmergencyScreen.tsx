import React, { useState } from 'react';
import { SafetyEngine, EmergencyCheckResult } from '../engine/safetyEngine';
import { ShieldAlert, PhoneCall, X, CheckCircle } from 'lucide-react';

interface EmergencyScreenProps {
  onClose: () => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ onClose }) => {
  const [symptomText, setSymptomText] = useState<string>('Chest pain radiating to left arm with shortness of breath');
  const [result, setResult] = useState<EmergencyCheckResult>(SafetyEngine.evaluateText(symptomText));

  const handleEvaluate = (text: string) => {
    setSymptomText(text);
    setResult(SafetyEngine.evaluateText(text));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-3">
          <div className="flex items-center space-x-2 text-black font-black font-display text-base uppercase tracking-wider bg-[#FF5722] text-white px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_#000] -rotate-1">
            <ShieldAlert className="w-6 h-6 stroke-[2.5] animate-bounce text-white" />
            <span>EMERGENCY SAFETY ENGINE</span>
          </div>
          <button onClick={onClose} className="p-1 bg-black text-white hover:bg-[#FFE600] hover:text-black border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000]">
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Symptom Test Inputs */}
        <div className="space-y-2 text-xs font-bold">
          <label className="text-black font-black font-display block uppercase">Screen Acute Symptoms:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleEvaluate('Chest pain radiating to left arm with shortness of breath')}
              className="px-3 py-1.5 bg-[#FF5722] text-white border-2 border-black font-mono font-black text-[11px] shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              Chest Pain & Dyspnea
            </button>
            <button
              onClick={() => handleEvaluate('Facial drooping and sudden speech slurring')}
              className="px-3 py-1.5 bg-[#FF70A6] text-black border-2 border-black font-mono font-black text-[11px] shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              Stroke (FAST)
            </button>
            <button
              onClick={() => handleEvaluate('Mild fatigue after walking 10 minutes')}
              className="px-3 py-1.5 bg-[#CCFF00] text-black border-2 border-black font-mono font-black text-[11px] shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              Mild Fatigue (Non-Emergency)
            </button>
          </div>
        </div>

        {/* Screen Result Box */}
        {result.isEmergency ? (
          <div className="p-5 bg-[#FF5722] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-3 text-white text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black font-display text-white text-base uppercase">{result.protocolTitle}</span>
              <span className="px-3 py-1 text-xs font-black uppercase bg-black text-[#FFE600] border border-black shadow-[2px_2px_0px_0px_#000] animate-pulse">
                CRITICAL RED FLAG
              </span>
            </div>

            <div className="p-3.5 bg-black text-[#FFE600] border-2 border-black font-black text-sm font-display text-center uppercase tracking-wide">
              {result.immediateAction}
            </div>

            <div className="space-y-1 bg-white text-black p-3 border-2 border-black font-bold">
              <span className="font-black font-display text-black block uppercase">EMERGENCY RESPONSE INSTRUCTIONS:</span>
              <ul className="space-y-1 list-disc pl-4 text-[11px] font-mono">
                {result.guidelines.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <a
                href="tel:911"
                className="w-full py-3 bg-black hover:bg-black/90 text-[#FFE600] font-black font-display text-sm border-2 border-black flex items-center justify-center space-x-2 shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 stroke-[2.5]" />
                <span>CALL EMERGENCY SERVICES (911 / 112) NOW</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-[#CCFF00] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2 text-xs text-black">
            <div className="flex items-center space-x-2 text-black font-black font-display uppercase text-sm">
              <CheckCircle className="w-5 h-5 stroke-[2.5]" />
              <span>No Life-Threatening Red Flags Detected</span>
            </div>
            <p className="font-semibold text-black/90 mt-1 leading-relaxed">
              Symptom input ("{symptomText}") does not trigger immediate acute emergency protocols. Proceed with routine Clinical Case Conference.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
