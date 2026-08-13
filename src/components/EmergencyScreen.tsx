import React, { useState } from 'react';
import { SafetyEngine, EmergencyCheckResult } from '../engine/safetyEngine';
import { ShieldAlert, PhoneCall, AlertTriangle, X, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#131B2E] border-2 border-rose-500 rounded-3xl shadow-2xl overflow-hidden space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
          <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-bounce" />
            <span>Deterministic Emergency Safety Engine</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Symptom Test Inputs */}
        <div className="space-y-2 text-xs">
          <label className="text-slate-300 font-bold block">Select or Enter Acute Symptoms to Screen:</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleEvaluate('Chest pain radiating to left arm with shortness of breath')}
              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px]"
            >
              Chest Pain & Dyspnea
            </button>
            <button
              onClick={() => handleEvaluate('Facial drooping and sudden speech slurring')}
              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px]"
            >
              Stroke (FAST)
            </button>
            <button
              onClick={() => handleEvaluate('Mild fatigue after walking 10 minutes')}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]"
            >
              Mild Fatigue (Non-Emergency)
            </button>
          </div>
        </div>

        {/* Screen Result Box */}
        {result.isEmergency ? (
          <div className="p-5 rounded-2xl bg-rose-600/20 border-2 border-rose-500 space-y-3 text-rose-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-base">{result.protocolTitle}</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-600 text-white animate-pulse">
                CRITICAL RED FLAG
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-white font-bold text-sm text-center">
              {result.immediateAction}
            </div>

            <div className="space-y-1">
              <span className="font-bold text-white block uppercase">Emergency Response Instructions:</span>
              <ul className="space-y-1 list-disc pl-4 text-[11px] text-rose-100">
                {result.guidelines.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <a
                href="tel:911"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call Emergency Services (911 / 112) Now</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs text-slate-200">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>No Life-Threatening Red Flag Signals Detected</span>
            </div>
            <p className="text-slate-300">
              Symptom input ("{symptomText}") does not trigger immediate acute emergency protocols. Proceed with routine Clinical Case Conference.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
