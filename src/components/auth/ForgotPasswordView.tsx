import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { forgotPasswordApi } from '../../services/authApi';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const { setAuthView, setError } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await forgotPasswordApi(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive recovery instructions."
    >
      {sent ? (
        <div className="space-y-5 text-center">
          <div className="w-12 h-12 bg-[#ECFDF5] text-[#2E8B70] rounded-full mx-auto flex items-center justify-center border border-[#A7F3D0]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172033]">Instructions Sent</h3>
            <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
              If an account exists for <strong className="text-[#172033]">{email}</strong>, we have sent password reset instructions to your inbox.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setAuthView('login');
            }}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="forgot-email">
              Account Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending link…</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Send reset instructions</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthView('login');
              }}
              className="text-xs text-[#667085] hover:text-[#172033] font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
