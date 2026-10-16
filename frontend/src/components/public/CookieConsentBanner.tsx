import React, { useState, useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { analyticsService } from '../../services/analytics';

export const CookieConsentBanner: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('heal_analytics_consent');
      if (!consent) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAccept = () => {
    analyticsService.setConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    analyticsService.setConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy & Cookie Preferences"
      className="fixed bottom-0 inset-x-0 z-50 bg-[#090E17] text-white border-t-2 border-[#FFE45C] p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.5)] font-mono text-xs"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#FFE45C] flex-shrink-0 mt-0.5" />
          <p className="text-[#CBD5E1] leading-relaxed">
            HEAL Engine respects your clinical privacy. We use strictly anonymized metrics for public informational page optimization.
            Zero patient health information is tracked.{' '}
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/privacy');
              }}
              className="text-[#FFE45C] underline hover:text-white"
            >
              Learn about our Privacy Policy
            </a>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] border border-[#475569] transition-colors cursor-pointer text-xs uppercase"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 bg-[#FFE45C] hover:bg-white text-[#080808] font-bold border border-[#080808] transition-colors cursor-pointer text-xs uppercase"
          >
            Accept Metrics
          </button>
        </div>
      </div>
    </div>
  );
};
