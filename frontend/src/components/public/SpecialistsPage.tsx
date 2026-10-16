import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { Users, Stethoscope, Sparkles, Shield, ArrowRight } from 'lucide-react';

interface SpecialistsPageProps {
  onNavigate: (path: string) => void;
  onLaunchApp: () => void;
}

export const SpecialistsPage: React.FC<SpecialistsPageProps> = ({ onNavigate, onLaunchApp }) => {
  const specialists = [
    {
      id: 'doc-thorne',
      name: 'Dr. Aris Thorne, MD, FACC',
      specialty: 'Cardiology & Cardiovascular Critical Care',
      focus: 'Cardiorenal syndrome, heart failure with preserved ejection fraction (HFpEF), hemodynamic titration, and loop diuretic balance.',
      avatarWebp: '/avatars/doc-thorne.webp',
      avatarJpg: '/avatars/doc-thorne.jpg',
      color: '#1E3A8A',
      guidelines: 'ACC/AHA 2022 Heart Failure Guidelines',
      scrubs: 'Navy Blue (Cardiorenal)',
      visemeRate: 'Naturalistic 60fps phoneme-to-viseme lip synchronization'
    },
    {
      id: 'doc-vance',
      name: 'Dr. Elena Vance, MD, PhD',
      specialty: 'Endocrinology & Metabolic Medicine',
      focus: 'Diabetic kidney disease, SGLT2 inhibitor nephroprotection, continuous glucose telemetry, and microalbuminuria surveillance.',
      avatarWebp: '/avatars/doc-vance.webp',
      avatarJpg: '/avatars/doc-vance.jpg',
      color: '#38BDF8',
      guidelines: 'ADA 2024 Standards of Care in Diabetes',
      scrubs: 'Sky Blue (Metabolism)',
      visemeRate: 'Empathetic posture with conversational pacing'
    },
    {
      id: 'doc-chen',
      name: 'Dr. Marcus Chen, MD, FASN',
      specialty: 'Nephrology & Renal Physiology',
      focus: 'Glomerular filtration trajectories, hyperkalemia management, RAAS inhibitor optimization, and electrolyte buffer stability.',
      avatarWebp: '/avatars/doc-chen.webp',
      avatarJpg: '/avatars/doc-chen.jpg',
      color: '#0284C7',
      guidelines: 'KDIGO 2024 Clinical Practice Guideline for CKD',
      scrubs: 'Cyan (Nephrology)',
      visemeRate: 'Precise lab-metric explanation posture'
    },
    {
      id: 'doc-lin',
      name: 'Dr. Maya Lin, PharmD, BCPS',
      specialty: 'Clinical Pharmacology & Pharmacogenomics',
      focus: 'Adverse drug reactions, CYP450 polypharmacy screening, renal dose adjustments, and NSAID cardiorenal hazard interlocks.',
      avatarWebp: '/avatars/doc-lin.webp',
      avatarJpg: '/avatars/doc-lin.jpg',
      color: '#7C3AED',
      guidelines: 'CPIC Pharmacogenomic Guidelines & Beers Criteria',
      scrubs: 'Purple (Pharmacology)',
      visemeRate: 'Inquisitive check-and-alert posture'
    }
  ];

  return (
    <div className="w-full bg-[#FAF8F5] text-[#080808] font-sans pb-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: '3D Digital Specialists', path: '/specialists' }
        ]}
        onNavigate={onNavigate}
      />

      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#FFE45C] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-[#080808] shadow-[2px_2px_0px_#000]">
            <Users className="w-3.5 h-3.5" />
            <span>CLINICAL PERSONA REGISTRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#080808]">
            3D Digital Clinical Specialist Personas
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            HEAL Engine embodies clinical multidisciplinary care through interactive 3D digital specialist personas,
            featuring realistic phoneme-to-viseme lip synchronization and deterministic safety boundaries.
          </p>
        </header>

        {/* Specialists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {specialists.map((spec) => (
            <div
              key={spec.id}
              className="bg-white border-2 border-[#080808] shadow-[6px_6px_0px_#000] p-6 sm:p-8 flex flex-col justify-between space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-32 h-32 flex-shrink-0 relative border-2 border-[#080808] shadow-[3px_3px_0px_#000] bg-[#020617] overflow-hidden">
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
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-[10px] font-mono font-bold bg-[#FFE45C] text-[#080808] px-2 py-0.5 border border-[#080808]">
                    {spec.scrubs}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
                    {spec.name}
                  </h2>
                  <p className="text-xs font-mono text-[#0D9488] font-semibold">
                    {spec.specialty}
                  </p>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed pt-1">
                    {spec.focus}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#CBD5E1] space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-[#475569]">
                  <span className="font-semibold text-[#080808]">Guideline Base:</span>
                  <span>{spec.guidelines}</span>
                </div>
                <div className="flex justify-between items-center text-[#475569]">
                  <span className="font-semibold text-[#080808]">Speech Engine:</span>
                  <span>{spec.visemeRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Rigging & Technology Callout */}
        <section className="bg-[#090E17] text-white p-8 sm:p-12 border-2 border-[#080808] shadow-[6px_6px_0px_#000] space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Speech Viseme &amp; State Controller Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-[#CBD5E1]">
            <div className="p-4 bg-[#0F172A] border border-[#334155] space-y-2">
              <span className="text-[#FFE45C] font-bold">1. PHONEME CLASSIFIER</span>
              <p className="text-[#94A3B8]">
                Real-time lexical parsing maps syllables to facial morph targets: MBP (bilabial lips), FV (labiodental), OH (rounded), and EE (spread).
              </p>
            </div>
            <div className="p-4 bg-[#0F172A] border border-[#334155] space-y-2">
              <span className="text-[#2DD4BF] font-bold">2. STATE AUTOMATON</span>
              <p className="text-[#94A3B8]">
                Deterministic posture shifts: GREETING → LISTENING → REVIEWING → EXPLAINING → CHECKING → ALERTING based on clinical escalation criteria.
              </p>
            </div>
            <div className="p-4 bg-[#0F172A] border border-[#334155] space-y-2">
              <span className="text-[#EF4444] font-bold">3. HARD ESCALATION</span>
              <p className="text-[#94A3B8]">
                Any patient text expressing emergency symptoms immediately forces the avatar to direct ALERTING state, notifying clinician supervision.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={onLaunchApp}
            className="px-6 py-3.5 bg-[#FFE45C] text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000] hover:bg-white transition-all cursor-pointer flex items-center space-x-2"
          >
            <span>Launch Interactive Specialist Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('/technology')}
            className="px-6 py-3.5 bg-white text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000] hover:bg-[#FAF8F5] transition-all cursor-pointer"
          >
            View Consensus Swarm Architecture
          </button>
        </div>
      </article>
    </div>
  );
};
