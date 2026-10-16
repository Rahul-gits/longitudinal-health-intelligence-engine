import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { Shield, Lock, FileText, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#080808] font-sans pb-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' }
        ]}
        onNavigate={onNavigate}
      />

      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#FFE45C] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-[#080808] shadow-[2px_2px_0px_#000]">
            <Shield className="w-3.5 h-3.5" />
            <span>DATA GOVERNANCE &amp; CLINICAL PRIVACY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#080808]">
            HEAL Engine Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-[#475569] font-mono">
            Effective Date: October 13, 2026 · Version: 2.5-DRAFT · Governance Status: Subject to Hospital Legal Review
          </p>
        </header>

        {/* Legal Disclaimer Box */}
        <div className="p-4 bg-[#FEF3C7] border-2 border-[#D97706] text-[#92400E] text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>ORGANIZATIONAL &amp; LEGAL NOTICE</span>
          </div>
          <p>
            This document outlines the actual data practices and architectural safeguards implemented within HEAL Engine.
            It serves as a preliminary governance draft requiring formal institutional review by partner hospital legal
            counsel, HIPAA compliance officers, and Data Protection Officers prior to full hospital deployment.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white border-2 border-[#080808] shadow-[6px_6px_0px_#000] p-6 sm:p-10 space-y-10 text-sm leading-relaxed text-[#334155]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
              1. Categories of Clinical &amp; Personal Data Collected
            </h2>
            <p>
              HEAL Engine processes longitudinal health data exclusively to facilitate clinical decision support,
              trajectory visualization, and multi-specialist consensus. Data categories include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs font-mono">
              <li><strong>Patient Demographics:</strong> Name, date of birth, biological sex, preferred communication channels.</li>
              <li><strong>Biomarkers &amp; Laboratory Observations:</strong> Serum creatinine, eGFR, potassium, HbA1c, NT-proBNP, microalbuminuria, lipid panels.</li>
              <li><strong>Clinical Diagnoses:</strong> SNOMED CT coded condition records (e.g., Type 2 Diabetes, Stage 3 CKD, Heart Failure with preserved ejection fraction).</li>
              <li><strong>Pharmacotherapy &amp; Regimens:</strong> Prescriptions, dosing frequencies, start/stop dates, drug-allergy flags.</li>
              <li><strong>System Audit Telemetry:</strong> Immutable cryptographic session IDs, role permissions, timestamped decision confirmations.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
              2. Purposes of Processing
            </h2>
            <p>Data ingested into HEAL Engine is strictly processed for the following validated purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs font-mono">
              <li>Facilitating multidisciplinary cardiorenal-metabolic case review across specialist personas.</li>
              <li>Triggering deterministic hard invariant safety gates to intercept contraindicated medications (e.g., NSAID nephrotoxicity).</li>
              <li>Generating patient-accessible health summaries and structured clinician discussion checklists.</li>
              <li>Maintaining immutable WORM (Write Once, Read Many) audit logs for medical malpractice and forensic safety compliance.</li>
            </ul>
            <p className="text-xs italic text-[#64748B]">
              HEAL Engine does not sell, broker, or monetize patient information under any circumstances, nor is patient data used to train third-party public commercial foundational models.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
              3. Data Storage, Encryption &amp; Retention
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] space-y-1.5">
                <span className="font-bold text-[#080808]">ENCRYPTION IN TRANSIT</span>
                <p>All communication is enforced using TLS 1.3 with strict Forward Secrecy and HSTS enabled across all endpoints.</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] space-y-1.5">
                <span className="font-bold text-[#080808]">ENCRYPTION AT REST</span>
                <p>Data persisted in PostgreSQL/TimescaleDB and Qdrant vector storage is encrypted with AES-256 via hardware KMS keys.</p>
              </div>
            </div>
            <p className="text-xs pt-2">
              <strong>Retention Schedule:</strong> Longitudinal clinical records are retained in compliance with hospital medical record retention statutes (typically 7 to 10 years). Temporary consultation session states expire automatically after 30 days of inactivity.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
              4. External Processors &amp; Infrastructure
            </h2>
            <p>
              In production deployments, data processing occurs either entirely on hospital on-premises infrastructure or within dedicated HIPAA-compliant VPC environments (e.g. AWS GovCloud / Azure Healthcare APIs).
            </p>
            <p className="text-xs font-mono">
              Third-party connectors are strictly bound by Business Associate Agreements (BAAs) and Data Protection Agreements (DPAs).
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
              5. Analytics &amp; Consent Practices
            </h2>
            <p>
              Public marketing pages utilize privacy-preserving, consent-aware analytics (Google Analytics 4 with IP anonymization).
              Analytics tracking is strictly restricted to non-authenticated public routes. No patient IDs, health measurements, or consultation transcripts are ever transmitted to external analytics providers.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
              6. Patient &amp; User Rights (DPDP Act 2023 &amp; HIPAA)
            </h2>
            <p>Under applicable health privacy regulations (including India's Digital Personal Data Protection Act 2023 and US HIPAA Privacy Rules), individuals possess:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs font-mono">
              <li><strong>Right to Access:</strong> Inspect all structured FHIR data and longitudinal trajectories held in the engine.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate vitals, allergy records, or demographic details.</li>
              <li><strong>Right to Consent Revocation &amp; Deletion:</strong> Withdraw consent for non-statutory health telemetry processing.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#080808]">
              7. Data Protection Officer (DPO) Contact
            </h2>
            <p>
              For privacy inquiries, audit ledger inspection, or regulatory compliance verification, contact:
            </p>
            <div className="p-4 bg-[#F1F5F9] border border-[#CBD5E1] space-y-1 text-xs font-mono">
              <p><strong>Office of the Data Protection Officer &amp; Clinical Information Security</strong></p>
              <p>HEAL Health Systems — Clinical Governance Board</p>
              <p>Email: <a href="mailto:dpo@healengine.hospital.org" className="text-[#0D9488] underline">dpo@healengine.hospital.org</a></p>
              <p>Telephone: <a href="tel:+18005554325" className="text-[#0D9488] underline">+1-800-555-HEAL</a></p>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};
