import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, error, isLoading, setAuthView, setError } = useAuth();
  const [email, setEmail] = useState<string>('eleanor@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }
    await login(email, password);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Access your health intelligence workspace."
    >
      {/* Error Alert Box */}
      {error && (
        <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-xl text-xs flex items-start space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          />
        </div>

        {/* Password Field */}
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

        {/* Remember this device */}
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

        {/* Submit Sign In Button */}
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
              <span>SIGN IN</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-[#94A3B8] font-medium">OR</span>
        </div>
      </div>

      {/* Google OAuth Simulation */}
      <button
        type="button"
        onClick={() => login('rahul@example.com', 'password123')}
        className="w-full py-2.5 px-4 bg-white hover:bg-[#F8FAFC] border border-[#DCE2E8] rounded-xl text-sm font-semibold text-[#334155] flex items-center justify-center space-x-2.5 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Switch to Create Account */}
      <div className="mt-6 text-center text-xs text-[#667085]">
        <span>New to Heal Engine? </span>
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
