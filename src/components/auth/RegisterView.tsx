import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { ArrowRight, AlertCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export const RegisterView: React.FC = () => {
  const { register, error, isLoading, setAuthView, setError } = useAuth();
  const [fullName, setFullName] = useState<string>('Rahul Gunda');
  const [email, setEmail] = useState<string>('rahul@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [confirmPassword, setConfirmPassword] = useState<string>('password123');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }
    await register(fullName, email, password);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your longitudinal health intelligence workspace."
    >
      {error && (
        <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-xl text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="reg-name">
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Rahul Gunda"
            required
            className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul@example.com"
            required
            className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="reg-password">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
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
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="reg-confirm">
            Confirm password
          </label>
          <input
            id="reg-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          />
        </div>

        <div className="flex items-start space-x-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 text-[#2563EB] border-[#CBD5E1] rounded focus:ring-[#2563EB] mt-0.5 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-[#667085] leading-snug cursor-pointer select-none">
            I agree to the <span className="text-[#2563EB] hover:underline">Terms of Service</span> and{' '}
            <span className="text-[#2563EB] hover:underline">Privacy Policy</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[#667085]">
        <span>Already have an account? </span>
        <button
          onClick={() => {
            setError(null);
            setAuthView('login');
          }}
          className="text-[#2563EB] hover:text-[#1D4ED8] font-bold hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </AuthLayout>
  );
};
