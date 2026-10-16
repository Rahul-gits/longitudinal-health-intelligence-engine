import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Mail, Lock, KeyRound, RefreshCw, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, requestOtp, verifyOtpCode, signInWithGoogle, error, isLoading, setAuthView, setError, demoLoginAs } = useAuth();
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  // OTP Login state
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [activeDemoOtp, setActiveDemoOtp] = useState<string | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }
    await login(email.trim(), password);
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await requestOtp(email.trim(), 'login');
      setOtpSent(true);
      setResendTimer(res.cooldownSeconds || 60);
      if (res.demoOtp) {
        setActiveDemoOtp(res.demoOtp);
      }
    } catch {
      // Error state managed by AuthContext
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 filled
    if (val && index === 5) {
      const full = newDigits.join('');
      if (full.length === 6) {
        verifyOtpCode(email.trim(), full, 'login');
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      setOtpDigits(paste.split(''));
      otpInputRefs.current[5]?.focus();
      verifyOtpCode(email.trim(), paste, 'login');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    await verifyOtpCode(email.trim(), fullOtp, 'login');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Access your HEAL Engine clinical intelligence workspace."
    >
      {/* Error Alert Box */}
      {error && (
        <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-xl text-xs flex items-start space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Primary Google Sign-In Button */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full py-2.5 px-4 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm font-semibold text-[#1E293B] flex items-center justify-center space-x-3 transition-all cursor-pointer shadow-xs hover:border-[#94A3B8]"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-[#94A3B8] font-medium">Or continue with</span>
        </div>
      </div>

      {/* Authentication Mode Tabs */}
      <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoginMode('password');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
            loginMode === 'password' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Password</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoginMode('otp');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
            loginMode === 'otp' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Code (OTP)</span>
        </button>
      </div>

      {loginMode === 'password' ? (
        /* Password Sign-In Form */
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clinician@hospital.org"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#172033]" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setAuthView('forgot_password')}
                className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="remember-device"
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] border-[#CBD5E1] rounded focus:ring-[#2563EB] cursor-pointer"
            />
            <label htmlFor="remember-device" className="text-xs text-[#667085] cursor-pointer select-none">
              Remember this device
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing you in…</span>
              </>
            ) : (
              <>
                <span>Sign In with Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Email OTP Form (Resend Delivery) */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="otp-email">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                id="otp-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                }}
                placeholder="you@example.com"
                required
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
              <button
                type="button"
                onClick={() => handleRequestOtp()}
                disabled={isLoading || resendTimer > 0}
                className="px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] font-semibold text-xs rounded-xl disabled:opacity-50 cursor-pointer transition-colors"
              >
                {resendTimer > 0 ? `${resendTimer}s` : otpSent ? 'Resend' : 'Send Code'}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              We will send a 6-digit transactional code to your inbox via Resend.
            </p>
          </div>

          {activeDemoOtp && (
            <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E40AF] flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Verification code: <strong>{activeDemoOtp}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtpDigits(activeDemoOtp.split(''))}
                className="text-[11px] font-bold text-[#2563EB] hover:underline"
              >
                Auto-fill
              </button>
            </div>
          )}

          {otpSent && (
            <form onSubmit={handleOtpSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-2 text-center">
                  Enter the 6-Digit Code
                </label>
                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-bold font-mono bg-white border-2 border-[#DCE2E8] rounded-xl text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                    />
                  ))}
                </div>
              </div>

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
                    <span>Verify Code & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Instant Guest Patient Access */}
      <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => demoLoginAs('guest')}
          className="w-full py-2.5 px-4 bg-white hover:bg-[#F8FAFC] border border-[#DCE2E8] rounded-xl text-xs font-semibold text-[#334155] flex items-center justify-center space-x-2.5 transition-colors cursor-pointer shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Quick Demo Access (Guest Clinical Persona)</span>
        </button>
      </div>

      {/* Switch to Create Account */}
      <div className="mt-5 text-center text-xs text-[#667085]">
        <span>New to HEAL Engine? </span>
        <button
          onClick={() => {
            setError(null);
            setAuthView('register');
          }}
          className="text-[#2563EB] hover:text-[#1D4ED8] font-bold hover:underline cursor-pointer"
        >
          Create account
        </button>
      </div>
    </AuthLayout>
  );
};
