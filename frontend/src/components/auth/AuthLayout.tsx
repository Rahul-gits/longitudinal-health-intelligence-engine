import React from 'react';
import { Activity, ShieldCheck, Lock, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { demoLoginAs } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#172033] flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white">
      {/* Top Bar with Demo Helpers */}
      <header className="max-w-6xl w-full mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-[#2563EB] text-white rounded-lg flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#172033] font-display">
              HEAL ENGINE
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider ml-2 px-1.5 py-0.5 bg-[#E2E8F0] text-[#475569] rounded font-bold">
              Identity Layer v2.4
            </span>
          </div>
        </div>

        {/* Security & Clinical Intelligence Mode Badge */}
        <div className="flex items-center space-x-3">
          <a
            href="/"
            onClick={(e) => {
              if (typeof window !== 'undefined') {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="text-xs font-mono text-[#2563EB] hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            ← Public Site
          </a>
          <span className="text-[11px] font-mono px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CLINICAL OS · STANDALONE READY</span>
          </span>
        </div>

      </header>

      {/* Main Card Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">
          {/* Main Clean Card */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE2E8] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-7 sm:p-9">
            {title && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#172033] tracking-tight font-display">{title}</h2>
                {subtitle && <p className="text-sm text-[#667085] mt-1 font-normal">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>

          {/* Security Assurance Badge */}
          <div className="mt-6 text-center flex items-center justify-center space-x-2 text-xs text-[#667085]">
            <Lock className="w-3.5 h-3.5 text-[#2E8B70]" />
            <span className="font-medium">Your health information is protected & encrypted</span>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#E2E8F0] py-4 bg-white/60 text-center text-xs text-[#667085]">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>© 2026 HEAL Engine. Longitudinal Clinical Decision Intelligence.</span>
          <div className="flex items-center space-x-4">
            <a
              href="/privacy"
              onClick={(e) => {
                if (typeof window !== 'undefined') {
                  e.preventDefault();
                  window.history.pushState({}, '', '/privacy');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="hover:underline cursor-pointer"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms"
              onClick={(e) => {
                if (typeof window !== 'undefined') {
                  e.preventDefault();
                  window.history.pushState({}, '', '/terms');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="hover:underline cursor-pointer"
            >
              Terms of Service
            </a>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#2E8B70] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant Architecture
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
