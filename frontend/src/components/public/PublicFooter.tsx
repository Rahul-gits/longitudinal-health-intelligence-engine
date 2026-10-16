import React from 'react';
import { Shield, Phone, Mail, FileText, ExternalLink, Activity } from 'lucide-react';

interface PublicFooterProps {
  onNavigate: (path: string) => void;
  onLaunchApp: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate, onLaunchApp }) => {
  const currentYear = new Date().getFullYear();

  const handleLink = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="w-full bg-[#080D1A] text-white border-t-2 border-[#1E293B] font-sans pt-12 pb-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand & Clinical OS Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-[#FFE45C] text-[#080808] flex items-center justify-center font-display font-black text-lg shadow-[2px_2px_0px_#000] border-2 border-[#080808]">
                H
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-wider text-white">
                  HEAL ENGINE
                </span>
                <span className="block text-[10px] font-mono text-[#94A3B8]">
                  CLINICAL INTELLIGENCE OPERATING SYSTEM
                </span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
              Longitudinal Clinical Decision Intelligence OS uniting multi-agent specialist consensus,
              3D digital specialist consultations, deterministic cardiorenal safety interlocks, and SMART on FHIR R4 interoperability.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[#1E293B] text-[#FFE45C] text-[10px] font-mono px-2 py-0.5 border border-[#334155]">
                FHIR R4
              </span>
              <span className="bg-[#1E293B] text-[#FFE45C] text-[10px] font-mono px-2 py-0.5 border border-[#334155]">
                LOINC &amp; SNOMED CT
              </span>
              <span className="bg-[#1E293B] text-[#2DD4BF] text-[10px] font-mono px-2 py-0.5 border border-[#0D9488]">
                HARD SAFETY INVARIANTS
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFE45C]">
              Platform &amp; System
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#CBD5E1]">
              <li>
                <a href="/" onClick={(e) => handleLink('/', e)} className="hover:text-white hover:underline">
                  Overview &amp; Home
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => handleLink('/about', e)} className="hover:text-white hover:underline">
                  Clinical Philosophy
                </a>
              </li>
              <li>
                <a href="/specialists" onClick={(e) => handleLink('/specialists', e)} className="hover:text-white hover:underline">
                  3D Digital Specialists
                </a>
              </li>
              <li>
                <a href="/technology" onClick={(e) => handleLink('/technology', e)} className="hover:text-white hover:underline">
                  Safety Architecture
                </a>
              </li>
              <li>
                <button
                  onClick={onLaunchApp}
                  className="text-[#FFE45C] hover:underline font-bold text-left cursor-pointer"
                >
                  ▸ Launch Clinical Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFE45C]">
              Governance &amp; Trust
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#CBD5E1]">
              <li>
                <a href="/privacy" onClick={(e) => handleLink('/privacy', e)} className="hover:text-white hover:underline">
                  Privacy Policy (DPDP / HIPAA)
                </a>
              </li>
              <li>
                <a href="/terms" onClick={(e) => handleLink('/terms', e)} className="hover:text-white hover:underline">
                  Terms &amp; Clinical Disclaimers
                </a>
              </li>
              <li>
                <span className="text-[#94A3B8]">Immutable WORM Audit Chain</span>
              </li>
              <li>
                <span className="text-[#94A3B8]">Zero PHI Public Indexing</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Clinical Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFE45C]">
              Clinical Communications
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#CBD5E1]">
              <li>
                <a href="/contact" onClick={(e) => handleLink('/contact', e)} className="hover:text-white hover:underline">
                  Contact Clinical Engineering
                </a>
              </li>
              <li>
                <a href="tel:+18005554325" className="hover:text-[#2DD4BF] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>1-800-555-HEAL</span>
                </a>
              </li>
              <li>
                <a href="mailto:dpo@healengine.hospital.org" className="hover:text-[#2DD4BF] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>dpo@healengine.hospital.org</span>
                </a>
              </li>
              <li className="pt-2 text-[11px] text-[#94A3B8]">
                Hospital Emergency Hotline: Available 24/7 for inpatient critical care telemetry.
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Notice & Bottom Bar */}
        <div className="border-t border-[#1E293B] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#64748B]">
          <div className="text-center md:text-left space-y-1">
            <p>
              &copy; {currentYear} HEAL Health Systems. All clinical decision workflows governed with human-in-the-loop oversight.
            </p>
            <p className="text-[11px]">
              Regulatory Notice: HEAL Engine is an investigational clinical decision support system (CDSS). Not a substitute for licensed medical judgment.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <a href="/privacy" onClick={(e) => handleLink('/privacy', e)} className="hover:text-white hover:underline">
              Privacy
            </a>
            <span>·</span>
            <a href="/terms" onClick={(e) => handleLink('/terms', e)} className="hover:text-white hover:underline">
              Terms
            </a>
            <span>·</span>
            <a href="/contact" onClick={(e) => handleLink('/contact', e)} className="hover:text-white hover:underline">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
