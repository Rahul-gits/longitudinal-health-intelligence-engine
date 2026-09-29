import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';
import { OTPVerifyView } from './OTPVerifyView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { ConsentView } from './ConsentView';
import { ProfileSetupView } from './ProfileSetupView';
import { Activity, Loader2, Lock } from 'lucide-react';

export const AuthGateway: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, authView } = useAuth();

  if (authState === 'AUTH_LOADING') {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-[#DCE2E8] shadow-lg text-center max-w-sm w-full mx-4 space-y-4">
          <div className="w-12 h-12 bg-[#2563EB] text-white rounded-xl mx-auto flex items-center justify-center shadow-md animate-pulse">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#172033] text-lg font-display">HEAL ENGINE</h3>
            <p className="text-xs text-[#667085] mt-1">Verifying secure clinical session…</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[#2563EB] font-semibold pt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Establishing Identity Layer…</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated -> Login / Register / Forgot Password
  if (authState === 'UNAUTHENTICATED') {
    if (authView === 'register') return <RegisterView />;
    if (authView === 'forgot_password') return <ForgotPasswordView />;
    return <LoginView />;
  }

  // 2. Email verification required
  if (authState === 'EMAIL_UNVERIFIED') {
    return <OTPVerifyView />;
  }

  // 3. Consent required
  if (authState === 'CONSENT_REQUIRED') {
    return <ConsentView />;
  }

  // 4. Profile incomplete
  if (authState === 'PROFILE_INCOMPLETE') {
    return <ProfileSetupView />;
  }

  // 5. Authenticated -> Render full protected HEAL Engine workspace
  return <>{children}</>;
};
