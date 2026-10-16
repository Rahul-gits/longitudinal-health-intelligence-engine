import React from 'react';
import {
  Activity, Shield, Stethoscope, Cpu, Users, ChevronRight, Lock, CheckCircle2,
  Database, AlertTriangle, ArrowRight, GitCommit, FileText, HeartPulse, Sparkles
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onLaunchApp: () => void;
  isAuthenticated: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onLaunchApp, isAuthenticated }) => {
  return (
    <div className="w-full bg-[#F3F0E8] text-[#080808] font-sans">
      {/* 1. Hero Section */}
      <section className="border-b-2 border-[#080808] bg-[#FAF8F5] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#FFE45C] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-[#080808] shadow-[2px_2px_0px_#000]">
              <Activity className="w-3.5 h-3.5" />
              <span>CLINICAL OS · CDSS v2.5</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#080808] leading-[1.08]">
              Longitudinal Clinical Intelligence &amp; 3D Specialist OS
            </h1>

            <p className="text-base sm:text-lg text-[#334155] leading-relaxed max-w-2xl font-sans">
              HEAL Engine bridges complex cardiorenal-metabolic timelines through continuous multi-agent case conferences,
              interactive 3D specialist personas, and deterministic safety interlocks that prevent algorithmic hallucination.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={onLaunchApp}
                className="px-6 py-3.5 bg-[#FFE45C] text-[#080808] font-mono font-bold text-sm tracking-wider uppercase border-2 border-[#080808] shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center space-x-2"
                aria-label="Launch HEAL Engine Clinical Application"
              >
                <span>{isAuthenticated ? 'Enter Clinical Dashboard' : 'Launch Clinical OS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/specialists')}
                className="px-6 py-3.5 bg-white text-[#080808] font-mono font-bold text-sm tracking-wider uppercase border-2 border-[#080808] shadow-[4px_4px_0px_#000] hover:bg-[#FAF8F5] transition-all cursor-pointer flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Meet 3D Specialists</span>
              </button>

              <button
                onClick={() => onNavigate('/technology')}
                className="px-6 py-3.5 bg-transparent text-[#080808] font-mono font-bold text-sm tracking-wider uppercase hover:underline flex items-center space-x-1"
              >
                <span>Safety Architecture</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Key Clinical Badges */}
            <div className="pt-6 border-t border-[#CBD5E1] flex flex-wrap gap-6 text-xs font-mono text-[#475569]">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                <span>Zero-Hallucination Safety Gates</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                <span>SMART on FHIR R4 Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                <span>Human-in-the-Loop Consensus</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card — Explicit width and height for Core Web Vitals LCP optimization */}
          <div className="lg:col-span-5">
            <div className="bg-[#090E17] text-white p-6 border-2 border-[#080808] shadow-[8px_8px_0px_#000] relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#334155] mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-[#EF4444] rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-[#FFE45C] rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-[#10B981] rounded-full inline-block"></span>
                  <span className="text-xs font-mono text-[#94A3B8] ml-2">HEAL_OS // SYSTEM_OVERVIEW</span>
                </div>
                <span className="text-[10px] font-mono bg-[#1E293B] text-[#FFE45C] px-2 py-0.5 border border-[#334155]">
                  ACTIVE TELEMETRY
                </span>
              </div>

              {/* Hero Image Asset — WebP with explicit dimensions & eager loading */}
              <div className="relative overflow-hidden border border-[#334155] bg-[#020617] mb-4">
                <picture>
                  <source srcSet="/og-image.webp" type="image/webp" />
                  <img
                    src="/og-image.png"
                    alt="HEAL Engine Longitudinal Clinical Intelligence Architecture"
                    width="1200"
                    height="630"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-auto object-cover aspect-[1200/630]"
                  />
                </picture>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#0F172A] border border-[#334155] flex justify-between items-center">
                  <span className="text-[#94A3B8]">Primary Clinical Domain</span>
                  <span className="text-[#FFE45C] font-bold">Cardiorenal-Metabolic</span>
                </div>
                <div className="p-3 bg-[#0F172A] border border-[#334155] flex justify-between items-center">
                  <span className="text-[#94A3B8]">Consensus Swarm</span>
                  <span className="text-[#2DD4BF] font-bold">4 Specialist Personas Active</span>
                </div>
                <div className="p-3 bg-[#0F172A] border border-[#334155] flex justify-between items-center">
                  <span className="text-[#94A3B8]">Deterministic Invariants</span>
                  <span className="text-[#10B981] font-bold">100% Interlock Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 6-Step Clinical Care Loop */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-2.5 py-1 border border-[#0D9488]">
            CLINICAL METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#080808]">
            The 6-Step Longitudinal Care Loop
          </h2>
          <p className="text-sm sm:text-base text-[#475569]">
            Continuous care trajectories governed by rigorous clinical checkpoints from record ingestion to personalized follow-up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'Understand',
              desc: 'Synthesizes fragmented longitudinal health records, lab trajectories, and medication logs into a unified clinical knowledge graph.',
              badge: 'KNOWLEDGE GRAPH'
            },
            {
              num: '02',
              title: 'Detect',
              desc: 'Monitors early subtle deviations across eGFR, serum creatinine, cardiac biomarkers, and blood pressure trends.',
              badge: 'ANOMALY RADAR'
            },
            {
              num: '03',
              title: 'Explain',
              desc: 'Generates transparent clinical rationales with citation-backed evidence provenance, grounded in KDIGO and ACC/AHA guidelines.',
              badge: 'PROVENANCE RAG'
            },
            {
              num: '04',
              title: 'Consult',
              desc: 'Enables interactive multi-specialist conferences and 3D digital human consultations with realistic viseme lip-synchronization.',
              badge: '3D SPECIALISTS'
            },
            {
              num: '05',
              title: 'Protect',
              desc: 'Executes hard deterministic safety gates, screening contraindications, dose toxicity, and NSAID cardiorenal hazards.',
              badge: 'HARD INVARIANTS'
            },
            {
              num: '06',
              title: 'Follow Up',
              desc: 'Generates patient-tailored recovery roadmaps, symptom watch criteria, and structured follow-up questions for the primary care team.',
              badge: 'CARE ADAPTATION'
            }
          ].map((step) => (
            <div
              key={step.num}
              className="bg-white p-6 border-2 border-[#080808] shadow-[4px_4px_0px_#000] space-y-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-[#080808] bg-[#FFE45C] px-2 py-0.5 border border-[#080808]">
                  {step.num}
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 border border-[#CBD5E1]">
                  {step.badge}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-[#080808]">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 3D Digital Specialist Personas Preview */}
      <section className="bg-[#090E17] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y-2 border-[#080808]">
        <div className="max-w-[1440px] mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-bold text-[#FFE45C] uppercase tracking-wider bg-[#1E293B] px-2.5 py-1 border border-[#334155]">
                MULTI-AGENT CASE CONFERENCES
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                3D Digital Clinical Specialist Personas
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Multidisciplinary consensus powered by Particle Swarm Optimization (PSO) and deterministic clinical safety constraints.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/specialists')}
              className="self-start md:self-end px-5 py-2.5 bg-[#FFE45C] text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border border-[#080808] shadow-[3px_3px_0px_#FFF] hover:bg-white transition-all cursor-pointer"
            >
              View Full Specialist Profiles →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'doc-thorne',
                name: 'Dr. Aris Thorne',
                role: 'Cardiology & Critical Care',
                desc: 'Specializes in cardiorenal syndrome, heart failure progression, and hemodynamic compensation.',
                avatarWebp: '/avatars/doc-thorne.webp',
                avatarJpg: '/avatars/doc-thorne.jpg',
                badge: 'CARDIOLOGY'
              },
              {
                id: 'doc-vance',
                name: 'Dr. Elena Vance',
                role: 'Endocrinology & Metabolism',
                desc: 'Focuses on diabetic nephropathy, glycemic variability, and metabolic microvascular complications.',
                avatarWebp: '/avatars/doc-vance.webp',
                avatarJpg: '/avatars/doc-vance.jpg',
                badge: 'ENDOCRINOLOGY'
              },
              {
                id: 'doc-chen',
                name: 'Dr. Marcus Chen',
                role: 'Nephrology & Renal Physiology',
                desc: 'Analyzes renal hyperfiltration, proteinuria trajectories, and electrolyte homeostasis.',
                avatarWebp: '/avatars/doc-chen.webp',
                avatarJpg: '/avatars/doc-chen.jpg',
                badge: 'NEPHROLOGY'
              },
              {
                id: 'doc-lin',
                name: 'Dr. Maya Lin',
                role: 'Clinical Pharmacology',
                desc: 'Evaluates drug-drug interactions, CYP450 pharmacogenomics, and renal dosing adjustments.',
                avatarWebp: '/avatars/doc-lin.webp',
                avatarJpg: '/avatars/doc-lin.jpg',
                badge: 'PHARMACOLOGY'
              }
            ].map((spec) => (
              <div
                key={spec.id}
                className="bg-[#0F172A] border-2 border-[#1E293B] p-5 space-y-4 hover:border-[#FFE45C] transition-colors"
              >
                <div className="relative aspect-square overflow-hidden border border-[#334155] bg-[#020617]">
                  <picture>
                    <source srcSet={spec.avatarWebp} type="image/webp" />
                    <img
                      src={spec.avatarJpg}
                      alt={spec.name}
                      width="400"
                      height="400"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                  <span className="absolute bottom-2 left-2 bg-[#080808]/85 text-[#FFE45C] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#334155]">
                    {spec.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    {spec.name}
                  </h3>
                  <p className="text-xs font-mono text-[#2DD4BF] mt-0.5">
                    {spec.role}
                  </p>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {spec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Safety & Governance Callout Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="bg-[#FFE45C] p-8 sm:p-12 border-2 border-[#080808] shadow-[8px_8px_0px_#000] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="bg-[#080808] text-[#FFE45C] px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
              CLINICAL SAFETY GUARANTEE
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-[#080808]">
              Deterministic Hard Invariant Gates
            </h2>
            <p className="text-sm sm:text-base text-[#080808] max-w-2xl leading-relaxed">
              Unlike unconstrained generative AI, every recommendation produced by HEAL Engine passes through
              hard-coded invariant safety gates. Harmful contraindications, impossible vital signs, and overdose hazards
              are intercepted deterministically at the architectural boundary.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/technology"
                onClick={(e) => { e.preventDefault(); onNavigate('/technology'); }}
                className="font-mono text-xs font-bold uppercase underline text-[#080808] hover:text-[#0D9488]"
              >
                Inspect Safety Gate Architecture →
              </a>
              <span className="text-[#080808]">·</span>
              <a
                href="/privacy"
                onClick={(e) => { e.preventDefault(); onNavigate('/privacy'); }}
                className="font-mono text-xs font-bold uppercase underline text-[#080808] hover:text-[#0D9488]"
              >
                Review Data Governance Policy →
              </a>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end space-y-3">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#080808] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0px_#FFF] hover:bg-[#1E293B] transition-all cursor-pointer"
            >
              Enter Clinical Workspace
            </button>
            <a
              href="/contact"
              onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }}
              className="w-full sm:w-auto text-center px-6 py-2.5 bg-white text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000]"
            >
              Request Institutional Deployment
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
