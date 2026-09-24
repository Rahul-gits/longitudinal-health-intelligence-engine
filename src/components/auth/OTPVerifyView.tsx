import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { AlertCircle, Loader2, KeyRound, RefreshCw, Sparkles } from 'lucide-react';

export const OTPVerifyView: React.FC = () => {
  const { verifyOtp, activeEmail, demoOtp, error, isLoading, setError, setAuthView } = useAuth();
  const [digits, setDigits] = useState<string[]>(['4', '2', '8', '1', '9', '3']);
  const [resendTimer, setResendTimer] = useState<number>(42);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      setDigits(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = digits.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    await verifyOtp(fullOtp);
  };

  const maskEmail = (email: string) => {
    if (!email) return 'your email';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.length > 2 ? `${name[0]}${'•'.repeat(name.length - 2)}${name[name.length - 1]}` : name;
    return `${maskedName}@${domain}`;
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit verification code to ${maskEmail(activeEmail || 'user@example.com')}`}
    >
      {error && (
        <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-xl text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Demo Code Helper Banner */}
      <div className="mb-6 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E40AF] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <span>Demo Verification Code: <strong>{demoOtp || '428193'}</strong></span>
        </div>
        <button
          type="button"
          onClick={() => setDigits((demoOtp || '428193').split(''))}
          className="text-[11px] font-bold text-[#2563EB] hover:underline"
        >
          Auto-fill
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6-Digit Boxes */}
        <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-bold font-mono bg-white border-2 border-[#DCE2E8] rounded-xl text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all shadow-xs"
            />
          ))}
        </div>

        {/* Resend Code Section */}
        <div className="text-center text-xs text-[#667085]">
          {resendTimer > 0 ? (
            <p>Didn't receive it? Resend code in <span className="font-semibold text-[#172033]">{resendTimer}s</span></p>
          ) : (
            <button
              type="button"
              onClick={() => setResendTimer(45)}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Resend verification code
            </button>
          )}
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying code…</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Verify</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[#667085]">
        <button
          onClick={() => setAuthView('login')}
          className="text-[#667085] hover:text-[#172033] hover:underline cursor-pointer font-medium"
        >
          ← Return to Login
        </button>
      </div>
    </AuthLayout>
  );
};
