import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { ShieldCheck, Check, AlertTriangle, ArrowRight, Loader2, FileText } from 'lucide-react';

export const ConsentView: React.FC = () => {
  const { submitConsent, error, isLoading } = useAuth();
  const [understandsDisclaimer, setUnderstandsDisclaimer] = useState<boolean>(true);
  const [agreesToTerms, setAgreesToTerms] = useState<boolean>(true);
  const [showFullPolicy, setShowFullPolicy] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!understandsDisclaimer || !agreesToTerms) return;
    await submitConsent(agreesToTerms, understandsDisclaimer);
  };

  return (
    <AuthLayout
      title="Before we begin"
      subtitle="Your privacy, rights, and informed health consent."
    >
      <div className="space-y-4 text-xs text-[#172033]">
        <p className="text-[#475569] leading-relaxed">
          Heal Engine uses the information you provide to organize your longitudinal health information and support interactive screening. You maintain complete control over what information is shared.
        </p>

        {/* DATA USED Card */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
          <div className="font-bold text-[#1E293B] uppercase tracking-wider text-[10px]">
            DATA USED
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#334155]">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#2E8B70] flex items-center justify-center font-bold text-[10px]">✓</span>
              <span>Health records</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#2E8B70] flex items-center justify-center font-bold text-[10px]">✓</span>
              <span>Laboratory reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#2E8B70] flex items-center justify-center font-bold text-[10px]">✓</span>
              <span>Medication information</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#2E8B70] flex items-center justify-center font-bold text-[10px]">✓</span>
              <span>Symptoms & screening responses</span>
            </div>
          </div>
        </div>

        {/* IMPORTANT Medical Advisory */}
        <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[#92400E] space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-[11px]">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>IMPORTANT CLINICAL NOTICE</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Heal Engine provides AI-assisted clinical information and does not replace the diagnosis, prognosis, or direct care of a licensed healthcare professional.
          </p>
        </div>

        {/* Policy Details Accordion */}
        {showFullPolicy && (
          <div className="p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[11px] text-[#475569] space-y-1.5 max-h-36 overflow-y-auto">
            <p className="font-semibold text-[#1E293B]">Data Handling & HIPAA Compliance:</p>
            <p>All clinical data points are encrypted in transit (TLS 1.3) and at rest (AES-256). Cryptographic provenance hashes trace each decision step without exposing raw identifiable details to third parties.</p>
          </div>
        )}

        {/* Checkboxes */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={understandsDisclaimer}
              onChange={(e) => setUnderstandsDisclaimer(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] border-[#CBD5E1] rounded focus:ring-[#2563EB] mt-0.5 cursor-pointer"
            />
            <span className="font-medium text-[#1E293B]">I understand that HEAL Engine is an AI clinical support tool and not a doctor.</span>
          </label>

          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreesToTerms}
              onChange={(e) => setAgreesToTerms(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] border-[#CBD5E1] rounded focus:ring-[#2563EB] mt-0.5 cursor-pointer"
            />
            <span className="font-medium text-[#1E293B]">I agree to the data-use and health privacy terms.</span>
          </label>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowFullPolicy(!showFullPolicy)}
              className="text-[#2563EB] hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              {showFullPolicy ? 'Hide privacy policy' : 'View full privacy policy'}
            </button>
          </div>

          <button
            type="submit"
            disabled={!understandsDisclaimer || !agreesToTerms || isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording consent…</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};
