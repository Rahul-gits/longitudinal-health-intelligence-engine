import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { FileText, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#080808] font-sans pb-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' }
        ]}
        onNavigate={onNavigate}
      />

      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#FFE45C] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-[#080808] shadow-[2px_2px_0px_#000]">
            <FileText className="w-3.5 h-3.5" />
            <span>REGULATORY GOVERNANCE &amp; CLINICAL TERMS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#080808]">
            Terms of Service &amp; Clinical Disclaimers
          </h1>
          <p className="text-sm sm:text-base text-[#475569] font-mono">
            Version 2.5 · Clinical Decision Support Regulatory Framework · Effective October 2026
          </p>
        </header>

        {/* Clinical Disclaimer Notice */}
        <div className="p-5 bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1E3A8A] text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase text-sm">
            <AlertCircle className="w-5 h-5 text-[#2563EB]" />
            <span>CLINICAL DECISION SUPPORT SYSTEM (CDSS) REGULATORY NOTICE</span>
          </div>
          <p className="leading-relaxed">
            HEAL Engine is an investigational Clinical Decision Support System designed to assist qualified healthcare professionals.
            It does not autonomously diagnose medical conditions or issue binding pharmaceutical prescriptions.
            All algorithmic outputs, specialist consensus trajectories, and dosage suggestions must be reviewed, confirmed,
            and validated by licensed clinical personnel before any change in patient care is enacted.
          </p>
        </div>

        <div className="bg-white border-2 border-[#080808] shadow-[6px_6px_0px_#000] p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-[#334155]">
          <section className="space-y-2">
            <h2 className="text-xl font-display font-bold text-[#080808]">
              1. Authorized User Roles &amp; Responsibilities
            </h2>
            <p>
              Access to HEAL Engine clinical dashboards is strictly limited to authorized clinicians, credentialed researchers,
              and authenticated patients accessing their own health records. Sharing authentication credentials or session tokens is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-display font-bold text-[#080808]">
              2. Emergency Medical Situations
            </h2>
            <p>
              HEAL Engine is NOT an emergency response dispatch service. If you are experiencing sudden acute symptoms
              such as crushing chest pain, acute dyspnea, sudden weakness, or neurological deficits, immediately dial emergency services (911 / 112 / 108)
              or call the hospital emergency hotline at <a href="tel:+18005554325" className="text-[#0D9488] font-bold underline">1-800-555-HEAL</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-display font-bold text-[#080808]">
              3. Auditability &amp; Cryptographic Logging
            </h2>
            <p>
              To maintain clinical integrity, all recommendations viewed, dismissed, or approved within the system are
              cryptographically chained into immutable audit ledgers. By using the platform, clinical users consent to this forensic logging.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
};
