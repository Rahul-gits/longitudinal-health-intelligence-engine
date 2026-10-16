import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { Cpu, Shield, Database, Lock, CheckCircle2, GitCommit, FileCode, ArrowRight } from 'lucide-react';

interface TechnologyPageProps {
  onNavigate: (path: string) => void;
  onLaunchApp: () => void;
}

export const TechnologyPage: React.FC<TechnologyPageProps> = ({ onNavigate, onLaunchApp }) => {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#080808] font-sans pb-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Technology & Safety', path: '/technology' }
        ]}
        onNavigate={onNavigate}
      />

      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#FFE45C] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-[#080808] shadow-[2px_2px_0px_#000]">
            <Cpu className="w-3.5 h-3.5" />
            <span>SYSTEM ARCHITECTURE &amp; VERIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#080808]">
            Clinical Safety Engine &amp; Architecture
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            HEAL Engine combines probabilistic multi-agent reasoning with deterministic safety gates,
            ensuring that no clinical recommendation bypasses mathematical and clinical invariant checks.
          </p>
        </header>

        {/* 4 Architectural Layers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Layer 1: Deterministic Hard Invariant Gates */}
          <div className="bg-white border-2 border-[#080808] shadow-[6px_6px_0px_#000] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold bg-[#EF4444] text-white px-2.5 py-0.5 border border-[#080808]">
                SAFETY GATE
              </span>
              <span className="text-xs font-mono text-[#64748B]">Layer 01</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-[#080808]">
              Deterministic Hard Invariant Gates
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Every therapeutic adjustment is evaluated through non-negotiable rule sets before delivery to clinicians:
            </p>
            <ul className="space-y-2 text-xs font-mono text-[#334155] border-t border-[#CBD5E1] pt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Cardiorenal NSAID Interlock: Prohibits NSAIDs in patients with eGFR &lt; 60 or Stage 3+ CKD.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Physiological Boundary Validator: Rejects impossible vitals (e.g., negative blood pressures, heart rates &gt; 300).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Hyperkalemia RAAS Brake: Flags medication regimens that double potassium retention risks.</span>
              </li>
            </ul>
          </div>

          {/* Layer 2: Particle Swarm Optimization (PSO) */}
          <div className="bg-white border-2 border-[#080808] shadow-[6px_6px_0px_#000] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold bg-[#3B82F6] text-white px-2.5 py-0.5 border border-[#080808]">
                CONSENSUS SWARM
              </span>
              <span className="text-xs font-mono text-[#64748B]">Layer 02</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-[#080808]">
              Multi-Agent PSO Swarm Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Multi-specialist consensus is achieved through decentralized particle swarm optimization:
            </p>
            <ul className="space-y-2 text-xs font-mono text-[#334155] border-t border-[#CBD5E1] pt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Specialist Position Vectors: Each agent calculates clinical preference in continuous benefit-risk space.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Velocity Adaptation: Convergence rate balances cardiology urgency against nephrology stability constraints.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Dissent Preservation: Minority dissenting specialist opinions are recorded alongside the consensus score.</span>
              </li>
            </ul>
          </div>

          {/* Layer 3: Evidence Provenance RAG */}
          <div className="bg-white border-2 border-[#080808] shadow-[6px_6px_0px_#000] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold bg-[#10B981] text-white px-2.5 py-0.5 border border-[#080808]">
                RAG PROVENANCE
              </span>
              <span className="text-xs font-mono text-[#64748B]">Layer 03</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-[#080808]">
              Retrieval-Augmented Provenance
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Zero unsourced assertions. Recommendations are grounded in indexed guideline repositories:
            </p>
            <ul className="space-y-2 text-xs font-mono text-[#334155] border-t border-[#CBD5E1] pt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>KDIGO 2024 &amp; ACC/AHA Embeddings: Chunked and vector-indexed in high-performance similarity stores.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Exact Citation Anchors: Clinicians inspect section numbers, evidence grades (A/B/C), and clinical trial references.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Immutable Provenance Modal: Inspect token-level retrieval chains directly inside the clinical UI.</span>
              </li>
            </ul>
          </div>

          {/* Layer 4: Interoperability */}
          <div className="bg-white border-2 border-[#080808] shadow-[6px_6px_0px_#000] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold bg-[#8B5CF6] text-white px-2.5 py-0.5 border border-[#080808]">
                INTEROPERABILITY
              </span>
              <span className="text-xs font-mono text-[#64748B]">Layer 04</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-[#080808]">
              SMART on FHIR R4 Standard Connectors
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Standardized bi-directional electronic health record synchronization:
            </p>
            <ul className="space-y-2 text-xs font-mono text-[#334155] border-t border-[#CBD5E1] pt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>Standard Codings: LOINC for clinical observations; SNOMED CT for condition diagnoses; RxNorm for medications.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>CDS Hooks Support: patient-view, order-select, and medication-prescribe integration hooks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                <span>WORM Audit Chain: SHA-256 cryptographic hash chaining for immutable medical action traceability.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={onLaunchApp}
            className="px-6 py-3.5 bg-[#FFE45C] text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000] hover:bg-white transition-all cursor-pointer"
          >
            Launch Clinical Validation Harness
          </button>
          <button
            onClick={() => onNavigate('/privacy')}
            className="px-6 py-3.5 bg-white text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[3px_3px_0px_#000] hover:bg-[#FAF8F5] transition-all cursor-pointer"
          >
            Review Security &amp; Data Governance Policy
          </button>
        </div>
      </article>
    </div>
  );
};
