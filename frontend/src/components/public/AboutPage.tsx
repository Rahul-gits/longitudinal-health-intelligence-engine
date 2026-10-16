import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { Shield, Activity, Users, Database, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
  onLaunchApp: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onLaunchApp }) => {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#080808] font-sans pb-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'About HEAL Engine', path: '/about' }
        ]}
        onNavigate={onNavigate}
      />

      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Page Header */}
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#FFE45C] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-[#080808] shadow-[2px_2px_0px_#000]">
            <span>CLINICAL OS PHILOSOPHY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#080808]">
            About HEAL Engine: Longitudinal Clinical Intelligence
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            HEAL Engine is an operating system designed specifically to overcome clinical fragmentation in chronic, multi-organ diseases through continuous longitudinal reasoning.
          </p>
        </header>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border-2 border-[#080808] shadow-[4px_4px_0px_#000] space-y-3">
            <div className="w-10 h-10 bg-[#FFE45C] flex items-center justify-center font-bold text-lg border border-[#080808]">
              01
            </div>
            <h2 className="text-xl font-display font-bold text-[#080808]">
              The Problem of Isolated Encounters
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Standard electronic health records capture snapshots during acute visits, obscuring gradual multi-year declines in organ function. Cardiorenal diseases require cross-temporal trajectory analysis rather than isolated point-in-time checks.
            </p>
          </div>

          <div className="bg-white p-6 border-2 border-[#080808] shadow-[4px_4px_0px_#000] space-y-3">
            <div className="w-10 h-10 bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold text-lg border border-[#0D9488]">
              02
            </div>
            <h2 className="text-xl font-display font-bold text-[#080808]">
              Deterministic Safety Over Speculation
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Medical reasoning cannot tolerate probabilistic hallucination. HEAL Engine separates clinical discovery from deterministic safety execution, passing every multi-agent synthesis through hard mathematical invariant gates.
            </p>
          </div>

          <div className="bg-white p-6 border-2 border-[#080808] shadow-[4px_4px_0px_#000] space-y-3">
            <div className="w-10 h-10 bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center font-bold text-lg border border-[#4338CA]">
              03
            </div>
            <h2 className="text-xl font-display font-bold text-[#080808]">
              Human-in-the-Loop Governance
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              HEAL Engine acts strictly as a clinical decision support system (CDSS). Attending physicians retain ultimate therapeutic authority, with full provenance logs tracing every recommendation back to authoritative guideline evidence.
            </p>
          </div>
        </div>

        {/* Narrative Section */}
        <section className="bg-white p-8 sm:p-12 border-2 border-[#080808] shadow-[6px_6px_0px_#000] space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#080808]">
            Cardiorenal-Metabolic Continuum Focus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-[#334155] leading-relaxed">
            <div className="space-y-4">
              <p>
                In patients like Eleanor Vance (68, Type 2 Diabetes, Stage 3 CKD, Heart Failure with preserved ejection fraction), physiological organs do not function in isolation. Heart failure impairs renal perfusion, while chronic kidney disease induces sodium retention, worsening cardiac preload.
              </p>
              <p>
                A single specialist adjusting a diuretic or prescribing an NSAID for joint pain without cross-organ coordination can trigger rapid cardiorenal decompensation.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                HEAL Engine unites cardiology, nephrology, endocrinology, and pharmacology into an ongoing digital case conference. Every medication adjustment, biomarker trend, and symptom report is cross-evaluated across all specialty boundaries.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/specialists')}
                  className="font-mono text-xs font-bold text-[#080808] hover:text-[#0D9488] underline flex items-center gap-1.5"
                >
                  <span>Explore the 3D Specialist Personas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation CTAs */}
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={onLaunchApp}
            className="px-6 py-3 bg-[#FFE45C] text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000] hover:bg-white transition-all cursor-pointer"
          >
            Launch Clinical OS
          </button>
          <button
            onClick={() => onNavigate('/technology')}
            className="px-6 py-3 bg-white text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000] hover:bg-[#FAF8F5] transition-all cursor-pointer"
          >
            Review Safety Gate Architecture
          </button>
          <button
            onClick={() => onNavigate('/contact')}
            className="px-6 py-3 bg-white text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000] hover:bg-[#FAF8F5] transition-all cursor-pointer"
          >
            Contact Clinical Team
          </button>
        </div>
      </article>
    </div>
  );
};
