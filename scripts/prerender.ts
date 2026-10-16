/**
 * HEAL Engine — Build-Time Static Site Pre-Rendering (SSG) Engine
 * Generates semantic, fully crawlable HTML documents for all public indexable routes.
 * Injects route-specific SEO titles, descriptions, canonical links, OpenGraph tags,
 * Schema.org JSON-LD structured data, and rich accessible markup into dist/.
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BASE_URL = process.env.APP_BASE_URL || 'https://healengine.hospital.org';

interface RouteDefinition {
  route: string;
  outputPath: string;
  title: string;
  description: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  structuredData: Record<string, any>;
  renderBodyHtml: () => string;
}

const ROUTES: RouteDefinition[] = [
  {
    route: '/',
    outputPath: path.resolve(DIST_DIR, 'index.html'),
    title: 'HEAL Engine | Longitudinal Clinical Intelligence & Specialist OS',
    description: 'Clinical-grade longitudinal health intelligence operating system uniting 3D digital specialists, multi-agent clinical consensus, and deterministic safety gates.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'MedicalOrganization',
      'name': 'HEAL Health Systems',
      'alternateName': 'HEAL Engine',
      'url': BASE_URL,
      'logo': `${BASE_URL}/favicon.svg`,
      'description': 'Longitudinal Clinical Decision Intelligence Operating System with multi-agent consensus and deterministic cardiorenal safety interlocks.',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+1-800-555-4325',
        'contactType': 'Clinical Inquiries & Security',
        'email': 'dpo@healengine.hospital.org',
        'availableLanguage': ['English']
      }
    },
    renderBodyHtml: () => `
      <header class="public-ssr-header" style="background:#090E17; color:#FFFFFF; border-bottom:2px solid #1E293B; padding:12px 24px;">
        <nav aria-label="Main Navigation" style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
          <a href="/" style="color:#FFE45C; font-weight:bold; font-size:1.25rem; text-decoration:none;">HEAL ENGINE</a>
          <ul style="display:flex; gap:16px; list-style:none; margin:0; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#FFE45C; text-decoration:none;">Home</a></li>
            <li><a href="/about" style="color:#CBD5E1; text-decoration:none;">About</a></li>
            <li><a href="/specialists" style="color:#CBD5E1; text-decoration:none;">3D Specialists</a></li>
            <li><a href="/technology" style="color:#CBD5E1; text-decoration:none;">Technology &amp; Safety</a></li>
            <li><a href="/contact" style="color:#CBD5E1; text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#CBD5E1; text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/app" style="background:#FFE45C; color:#080808; padding:6px 12px; font-weight:bold; text-decoration:none;">Launch Clinical OS</a></li>
          </ul>
        </nav>
      </header>
      <main style="max-width:1440px; margin:0 auto; padding:48px 24px;">
        <section style="margin-bottom:48px;">
          <span style="background:#FFE45C; color:#080808; padding:4px 8px; font-weight:bold; font-size:0.75rem;">CLINICAL OS · CDSS v2.5</span>
          <h1 style="font-size:3rem; font-weight:800; margin-top:16px; line-height:1.1;">Longitudinal Clinical Intelligence &amp; 3D Specialist OS</h1>
          <p style="font-size:1.25rem; color:#475569; max-width:800px; margin-top:16px;">
            HEAL Engine bridges complex cardiorenal-metabolic timelines through continuous multi-agent case conferences,
            interactive 3D specialist personas, and deterministic safety interlocks that prevent algorithmic hallucination.
          </p>
          <div style="margin-top:24px; display:flex; gap:16px;">
            <a href="/app" style="background:#FFE45C; color:#080808; padding:12px 24px; font-weight:bold; text-decoration:none; border:2px solid #080808;">Launch Clinical OS</a>
            <a href="/specialists" style="background:#FFFFFF; color:#080808; padding:12px 24px; font-weight:bold; text-decoration:none; border:2px solid #080808;">Meet 3D Specialists</a>
            <a href="/technology" style="padding:12px 24px; color:#080808; font-weight:bold; text-decoration:underline;">Safety Architecture &rarr;</a>
          </div>
        </section>
        <section style="margin-top:48px;">
          <h2 style="font-size:2rem; font-weight:700;">The 6-Step Longitudinal Care Loop</h2>
          <p style="color:#475569;">Governed by rigorous clinical checkpoints from record ingestion to personalized follow-up.</p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; margin-top:24px;">
            <article style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h3>01. Understand</h3>
              <p>Synthesizes fragmented longitudinal health records into a unified clinical knowledge graph.</p>
            </article>
            <article style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h3>02. Detect</h3>
              <p>Monitors subtle deviations across eGFR, serum creatinine, and cardiorenal biomarkers.</p>
            </article>
            <article style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h3>03. Explain</h3>
              <p>Generates transparent clinical rationales backed by KDIGO and ACC/AHA guidelines.</p>
            </article>
            <article style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h3>04. Consult</h3>
              <p>Enables multidisciplinary case conferences and 3D digital human consultations.</p>
            </article>
            <article style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h3>05. Protect</h3>
              <p>Executes hard deterministic safety gates, screening contraindications and dosing risks.</p>
            </article>
            <article style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h3>06. Follow Up</h3>
              <p>Adapts personalized patient care pathways and symptom watch criteria.</p>
            </article>
          </div>
        </section>
      </main>
      <footer style="background:#080D1A; color:#FFFFFF; padding:48px 24px; border-top:2px solid #1E293B; margin-top:64px;">
        <div style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; flex-wrap:wrap; gap:24px;">
          <div>
            <h3 style="color:#FFE45C; font-size:1.125rem;">HEAL ENGINE</h3>
            <p style="color:#94A3B8; font-size:0.875rem; max-width:400px;">Longitudinal Clinical Decision Intelligence OS uniting multi-agent specialist consensus and deterministic cardiorenal safety interlocks.</p>
          </div>
          <div>
            <h4>Platform</h4>
            <ul style="list-style:none; padding:0; font-size:0.875rem; color:#CBD5E1;">
              <li><a href="/about" style="color:#CBD5E1;">About</a></li>
              <li><a href="/specialists" style="color:#CBD5E1;">3D Specialists</a></li>
              <li><a href="/technology" style="color:#CBD5E1;">Technology &amp; Safety</a></li>
              <li><a href="/app" style="color:#FFE45C;">Launch Clinical OS</a></li>
            </ul>
          </div>
          <div>
            <h4>Governance &amp; Contact</h4>
            <ul style="list-style:none; padding:0; font-size:0.875rem; color:#CBD5E1;">
              <li><a href="/privacy" style="color:#CBD5E1;">Privacy Policy</a></li>
              <li><a href="/terms" style="color:#CBD5E1;">Terms of Service</a></li>
              <li><a href="/contact" style="color:#CBD5E1;">Contact Clinical Team</a></li>
              <li><a href="tel:+18005554325" style="color:#2DD4BF;">Emergency: 1-800-555-HEAL</a></li>
              <li><a href="mailto:dpo@healengine.hospital.org" style="color:#2DD4BF;">dpo@healengine.hospital.org</a></li>
            </ul>
          </div>
        </div>
      </footer>
    `
  },
  {
    route: '/about',
    outputPath: path.resolve(DIST_DIR, 'about', 'index.html'),
    title: 'About HEAL Engine | Clinical Decision Intelligence Philosophy',
    description: 'Learn how HEAL Engine delivers longitudinal clinical intelligence, human-in-the-loop governance, and verifiable multi-agent care consensus.',
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'About HEAL Engine', url: `${BASE_URL}/about` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'About HEAL Engine',
      'description': 'Clinical Decision Intelligence Philosophy, human-in-the-loop governance, and cardiorenal architecture.'
    },
    renderBodyHtml: () => `
      <header class="public-ssr-header" style="background:#090E17; color:#FFFFFF; border-bottom:2px solid #1E293B; padding:12px 24px;">
        <nav aria-label="Main Navigation" style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
          <a href="/" style="color:#FFE45C; font-weight:bold; font-size:1.25rem; text-decoration:none;">HEAL ENGINE</a>
          <ul style="display:flex; gap:16px; list-style:none; margin:0; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#CBD5E1; text-decoration:none;">Home</a></li>
            <li><a href="/about" style="color:#FFE45C; text-decoration:none;">About</a></li>
            <li><a href="/specialists" style="color:#CBD5E1; text-decoration:none;">3D Specialists</a></li>
            <li><a href="/technology" style="color:#CBD5E1; text-decoration:none;">Technology &amp; Safety</a></li>
            <li><a href="/contact" style="color:#CBD5E1; text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#CBD5E1; text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/app" style="background:#FFE45C; color:#080808; padding:6px 12px; font-weight:bold; text-decoration:none;">Launch Clinical OS</a></li>
          </ul>
        </nav>
      </header>
      <main style="max-width:1440px; margin:0 auto; padding:32px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;">
          <ol style="display:flex; gap:8px; list-style:none; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#64748B;">Home</a> &gt;</li>
            <li aria-current="page"><strong>About HEAL Engine</strong></li>
          </ol>
        </nav>
        <article>
          <span style="background:#FFE45C; color:#080808; padding:4px 8px; font-weight:bold; font-size:0.75rem;">CLINICAL OS PHILOSOPHY</span>
          <h1 style="font-size:2.5rem; font-weight:800; margin-top:16px;">About HEAL Engine: Clinical Decision Intelligence</h1>
          <p style="font-size:1.125rem; color:#475569; max-width:800px; margin-top:12px;">
            Overcoming clinical fragmentation in chronic multi-organ disease through continuous longitudinal reasoning.
          </p>
          <section style="margin-top:32px;">
            <h2>The Need for Cross-Temporal Synthesis</h2>
            <p>Modern electronic medical records capture static snapshots during acute visits, obscuring gradual multi-year declines in organ function. Cardiorenal-metabolic diseases require cross-temporal trajectory analysis rather than isolated point-in-time checks.</p>
          </section>
          <section style="margin-top:24px;">
            <h2>Deterministic Safety Over Speculation</h2>
            <p>Clinical decision making requires absolute mathematical rigor. HEAL Engine separates multi-agent clinical discovery from deterministic safety execution, passing every recommendation through hard invariant gates.</p>
          </section>
        </article>
      </main>
      <footer style="background:#080D1A; color:#FFFFFF; padding:32px 24px; border-top:2px solid #1E293B; margin-top:48px; text-align:center;">
        <p>&copy; 2026 HEAL Health Systems. All clinical workflows human-in-the-loop governed.</p>
      </footer>
    `
  },
  {
    route: '/specialists',
    outputPath: path.resolve(DIST_DIR, 'specialists', 'index.html'),
    title: '3D Digital Clinical Specialists | HEAL Engine',
    description: 'Meet HEAL Engine\'s 3D specialist personas across cardiology, nephrology, endocrinology, and clinical pharmacology for longitudinal case reviews.',
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: '3D Digital Specialists', url: `${BASE_URL}/specialists` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      'name': '3D Digital Clinical Specialists',
      'description': 'Interactive multidisciplinary specialist personas with phoneme-to-viseme lip synchronization.'
    },
    renderBodyHtml: () => `
      <header class="public-ssr-header" style="background:#090E17; color:#FFFFFF; border-bottom:2px solid #1E293B; padding:12px 24px;">
        <nav aria-label="Main Navigation" style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
          <a href="/" style="color:#FFE45C; font-weight:bold; font-size:1.25rem; text-decoration:none;">HEAL ENGINE</a>
          <ul style="display:flex; gap:16px; list-style:none; margin:0; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#CBD5E1; text-decoration:none;">Home</a></li>
            <li><a href="/about" style="color:#CBD5E1; text-decoration:none;">About</a></li>
            <li><a href="/specialists" style="color:#FFE45C; text-decoration:none;">3D Specialists</a></li>
            <li><a href="/technology" style="color:#CBD5E1; text-decoration:none;">Technology &amp; Safety</a></li>
            <li><a href="/contact" style="color:#CBD5E1; text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#CBD5E1; text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/app" style="background:#FFE45C; color:#080808; padding:6px 12px; font-weight:bold; text-decoration:none;">Launch Clinical OS</a></li>
          </ul>
        </nav>
      </header>
      <main style="max-width:1440px; margin:0 auto; padding:32px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;">
          <ol style="display:flex; gap:8px; list-style:none; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#64748B;">Home</a> &gt;</li>
            <li aria-current="page"><strong>3D Digital Specialists</strong></li>
          </ol>
        </nav>
        <article>
          <span style="background:#FFE45C; color:#080808; padding:4px 8px; font-weight:bold; font-size:0.75rem;">CLINICAL PERSONA REGISTRY</span>
          <h1 style="font-size:2.5rem; font-weight:800; margin-top:16px;">3D Digital Clinical Specialist Personas</h1>
          <p style="font-size:1.125rem; color:#475569; max-width:800px; margin-top:12px;">
            Interactive multidisciplinary care personas with realistic phoneme-to-viseme lip synchronization and deterministic safety boundaries.
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; margin-top:32px;">
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>Dr. Aris Thorne, MD, FACC</h2>
              <p><strong>Cardiology &amp; Critical Care</strong></p>
              <p>Focus: Cardiorenal syndrome, heart failure with preserved ejection fraction (HFpEF), and hemodynamic titration.</p>
            </section>
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>Dr. Elena Vance, MD, PhD</h2>
              <p><strong>Endocrinology &amp; Metabolism</strong></p>
              <p>Focus: Diabetic kidney disease, SGLT2 inhibitor nephroprotection, and continuous glucose telemetry.</p>
            </section>
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>Dr. Marcus Chen, MD, FASN</h2>
              <p><strong>Nephrology &amp; Renal Physiology</strong></p>
              <p>Focus: Glomerular filtration trajectories, hyperkalemia management, and RAAS inhibitor titration.</p>
            </section>
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>Dr. Maya Lin, PharmD, BCPS</h2>
              <p><strong>Clinical Pharmacology</strong></p>
              <p>Focus: Adverse drug reactions, CYP450 polypharmacy screening, and NSAID cardiorenal hazard interlocks.</p>
            </section>
          </div>
        </article>
      </main>
      <footer style="background:#080D1A; color:#FFFFFF; padding:32px 24px; border-top:2px solid #1E293B; margin-top:48px; text-align:center;">
        <p>&copy; 2026 HEAL Health Systems. All clinical workflows human-in-the-loop governed.</p>
      </footer>
    `
  },
  {
    route: '/technology',
    outputPath: path.resolve(DIST_DIR, 'technology', 'index.html'),
    title: 'Clinical Safety & Architecture | HEAL Engine OS',
    description: 'Explore HEAL Engine\'s deterministic safety gates, FHIR R4 interoperability, particle swarm optimization, and evidence provenance architecture.',
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Technology & Safety', url: `${BASE_URL}/technology` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'name': 'Clinical Safety & Architecture',
      'description': 'Deterministic invariant safety gates, multi-agent swarm optimization, and SMART on FHIR R4 interoperability.'
    },
    renderBodyHtml: () => `
      <header class="public-ssr-header" style="background:#090E17; color:#FFFFFF; border-bottom:2px solid #1E293B; padding:12px 24px;">
        <nav aria-label="Main Navigation" style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
          <a href="/" style="color:#FFE45C; font-weight:bold; font-size:1.25rem; text-decoration:none;">HEAL ENGINE</a>
          <ul style="display:flex; gap:16px; list-style:none; margin:0; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#CBD5E1; text-decoration:none;">Home</a></li>
            <li><a href="/about" style="color:#CBD5E1; text-decoration:none;">About</a></li>
            <li><a href="/specialists" style="color:#CBD5E1; text-decoration:none;">3D Specialists</a></li>
            <li><a href="/technology" style="color:#FFE45C; text-decoration:none;">Technology &amp; Safety</a></li>
            <li><a href="/contact" style="color:#CBD5E1; text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#CBD5E1; text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/app" style="background:#FFE45C; color:#080808; padding:6px 12px; font-weight:bold; text-decoration:none;">Launch Clinical OS</a></li>
          </ul>
        </nav>
      </header>
      <main style="max-width:1440px; margin:0 auto; padding:32px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;">
          <ol style="display:flex; gap:8px; list-style:none; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#64748B;">Home</a> &gt;</li>
            <li aria-current="page"><strong>Technology &amp; Safety</strong></li>
          </ol>
        </nav>
        <article>
          <span style="background:#FFE45C; color:#080808; padding:4px 8px; font-weight:bold; font-size:0.75rem;">SYSTEM ARCHITECTURE &amp; VERIFICATION</span>
          <h1 style="font-size:2.5rem; font-weight:800; margin-top:16px;">Clinical Safety Engine &amp; Architecture</h1>
          <p style="font-size:1.125rem; color:#475569; max-width:800px; margin-top:12px;">
            HEAL Engine combines probabilistic multi-agent reasoning with deterministic safety gates, ensuring no clinical recommendation bypasses mathematical and clinical invariant checks.
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; margin-top:32px;">
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>Deterministic Hard Invariant Gates</h2>
              <p>Hard mathematical boundaries intercept contraindications, toxic combinations, and NSAID nephrotoxicity deterministically.</p>
            </section>
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>Multi-Agent PSO Swarm</h2>
              <p>Specialist consensus calculated through continuous position vectors with explicit minority dissent preservation.</p>
            </section>
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>Evidence Provenance RAG</h2>
              <p>Zero unsourced assertions; token-level retrieval chains cite KDIGO, ACC/AHA, and ADA guidelines.</p>
            </section>
            <section style="background:#FFFFFF; border:2px solid #080808; padding:20px;">
              <h2>SMART on FHIR R4 Standard Connectors</h2>
              <p>Standard codings via LOINC, SNOMED CT, and RxNorm with immutable WORM audit ledgers.</p>
            </section>
          </div>
        </article>
      </main>
      <footer style="background:#080D1A; color:#FFFFFF; padding:32px 24px; border-top:2px solid #1E293B; margin-top:48px; text-align:center;">
        <p>&copy; 2026 HEAL Health Systems. All clinical workflows human-in-the-loop governed.</p>
      </footer>
    `
  },
  {
    route: '/privacy',
    outputPath: path.resolve(DIST_DIR, 'privacy', 'index.html'),
    title: 'Privacy Policy | HEAL Engine Patient Data Governance',
    description: 'Comprehensive data governance policy detailing DPDP Act 2023 and HIPAA alignment, end-to-end encryption, retention rules, and patient rights.',
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Privacy Policy', url: `${BASE_URL}/privacy` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'HEAL Engine Privacy Policy',
      'description': 'Data governance, DPDP Act 2023, HIPAA alignment, and user rights.'
    },
    renderBodyHtml: () => `
      <header class="public-ssr-header" style="background:#090E17; color:#FFFFFF; border-bottom:2px solid #1E293B; padding:12px 24px;">
        <nav aria-label="Main Navigation" style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
          <a href="/" style="color:#FFE45C; font-weight:bold; font-size:1.25rem; text-decoration:none;">HEAL ENGINE</a>
          <ul style="display:flex; gap:16px; list-style:none; margin:0; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#CBD5E1; text-decoration:none;">Home</a></li>
            <li><a href="/about" style="color:#CBD5E1; text-decoration:none;">About</a></li>
            <li><a href="/specialists" style="color:#CBD5E1; text-decoration:none;">3D Specialists</a></li>
            <li><a href="/technology" style="color:#CBD5E1; text-decoration:none;">Technology &amp; Safety</a></li>
            <li><a href="/contact" style="color:#CBD5E1; text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#FFE45C; text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/app" style="background:#FFE45C; color:#080808; padding:6px 12px; font-weight:bold; text-decoration:none;">Launch Clinical OS</a></li>
          </ul>
        </nav>
      </header>
      <main style="max-width:1440px; margin:0 auto; padding:32px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;">
          <ol style="display:flex; gap:8px; list-style:none; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#64748B;">Home</a> &gt;</li>
            <li aria-current="page"><strong>Privacy Policy</strong></li>
          </ol>
        </nav>
        <article>
          <span style="background:#FFE45C; color:#080808; padding:4px 8px; font-weight:bold; font-size:0.75rem;">DATA GOVERNANCE &amp; CLINICAL PRIVACY</span>
          <h1 style="font-size:2.5rem; font-weight:800; margin-top:16px;">HEAL Engine Privacy Policy</h1>
          <p style="font-size:0.875rem; color:#475569;">Effective Date: October 13, 2026 · Version: 2.5-DRAFT · Governance Status: Subject to Hospital Legal Review</p>
          <div style="background:#FEF3C7; border:2px solid #D97706; color:#92400E; padding:16px; margin-top:24px; font-size:0.875rem;">
            <strong>ORGANIZATIONAL &amp; LEGAL NOTICE:</strong> This draft policy reflects actual system data practices. Deployment in live clinical settings requires review by institutional compliance and legal officers.
          </div>
          <section style="margin-top:32px;">
            <h2>1. Clinical &amp; Personal Data Processed</h2>
            <p>Demographic attributes, biomarkers (eGFR, creatinine, potassium, HbA1c), SNOMED CT diagnoses, pharmacotherapy regimens, and cryptographic audit records.</p>
          </section>
          <section style="margin-top:24px;">
            <h2>2. Purpose of Processing</h2>
            <p>Facilitating clinical decision support, enforcing hard invariant safety gates, and maintaining immutable audit ledgers. Zero sale or secondary monetization of patient data.</p>
          </section>
          <section style="margin-top:24px;">
            <h2>3. Security &amp; Encryption</h2>
            <p>TLS 1.3 in transit and AES-256 KMS-managed encryption at rest across all data tiers.</p>
          </section>
          <section style="margin-top:24px;">
            <h2>4. Data Protection Officer (DPO) Contact</h2>
            <p>Email: <a href="mailto:dpo@healengine.hospital.org">dpo@healengine.hospital.org</a> · Telephone: <a href="tel:+18005554325">+1-800-555-HEAL</a></p>
          </section>
        </article>
      </main>
      <footer style="background:#080D1A; color:#FFFFFF; padding:32px 24px; border-top:2px solid #1E293B; margin-top:48px; text-align:center;">
        <p>&copy; 2026 HEAL Health Systems. All clinical workflows human-in-the-loop governed.</p>
      </footer>
    `
  },
  {
    route: '/terms',
    outputPath: path.resolve(DIST_DIR, 'terms', 'index.html'),
    title: 'Terms of Service & Clinical Governance | HEAL Engine',
    description: 'Terms of service, clinical decision support disclaimers, and human-in-the-loop governance requirements for HEAL Engine.',
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Terms of Service', url: `${BASE_URL}/terms` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'HEAL Engine Terms of Service',
      'description': 'Clinical Decision Support System regulatory terms and disclaimers.'
    },
    renderBodyHtml: () => `
      <header class="public-ssr-header" style="background:#090E17; color:#FFFFFF; border-bottom:2px solid #1E293B; padding:12px 24px;">
        <nav aria-label="Main Navigation" style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
          <a href="/" style="color:#FFE45C; font-weight:bold; font-size:1.25rem; text-decoration:none;">HEAL ENGINE</a>
          <ul style="display:flex; gap:16px; list-style:none; margin:0; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#CBD5E1; text-decoration:none;">Home</a></li>
            <li><a href="/about" style="color:#CBD5E1; text-decoration:none;">About</a></li>
            <li><a href="/specialists" style="color:#CBD5E1; text-decoration:none;">3D Specialists</a></li>
            <li><a href="/technology" style="color:#CBD5E1; text-decoration:none;">Technology &amp; Safety</a></li>
            <li><a href="/contact" style="color:#CBD5E1; text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#CBD5E1; text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/terms" style="color:#FFE45C; text-decoration:none;">Terms</a></li>
            <li><a href="/app" style="background:#FFE45C; color:#080808; padding:6px 12px; font-weight:bold; text-decoration:none;">Launch Clinical OS</a></li>
          </ul>
        </nav>
      </header>
      <main style="max-width:1440px; margin:0 auto; padding:32px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;">
          <ol style="display:flex; gap:8px; list-style:none; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#64748B;">Home</a> &gt;</li>
            <li aria-current="page"><strong>Terms of Service</strong></li>
          </ol>
        </nav>
        <article>
          <span style="background:#FFE45C; color:#080808; padding:4px 8px; font-weight:bold; font-size:0.75rem;">REGULATORY GOVERNANCE</span>
          <h1 style="font-size:2.5rem; font-weight:800; margin-top:16px;">Terms of Service &amp; Clinical Disclaimers</h1>
          <div style="background:#EFF6FF; border:2px solid #2563EB; color:#1E3A8A; padding:16px; margin-top:24px; font-size:0.875rem;">
            <strong>CLINICAL DECISION SUPPORT SYSTEM (CDSS) NOTICE:</strong> HEAL Engine is an investigational decision support system. It does not replace licensed medical judgment. All therapeutic recommendations must be verified by a licensed clinician before enactment.
          </div>
        </article>
      </main>
      <footer style="background:#080D1A; color:#FFFFFF; padding:32px 24px; border-top:2px solid #1E293B; margin-top:48px; text-align:center;">
        <p>&copy; 2026 HEAL Health Systems. All clinical workflows human-in-the-loop governed.</p>
      </footer>
    `
  },
  {
    route: '/contact',
    outputPath: path.resolve(DIST_DIR, 'contact', 'index.html'),
    title: 'Contact & Clinical Inquiries | HEAL Engine',
    description: 'Get in touch with HEAL Engine clinical engineering, institutional deployment teams, and data protection officers.',
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Contact & Support', url: `${BASE_URL}/contact` }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'HEAL Engine Contact',
      'description': 'Direct clinical engineering communication and institutional integration support.'
    },
    renderBodyHtml: () => `
      <header class="public-ssr-header" style="background:#090E17; color:#FFFFFF; border-bottom:2px solid #1E293B; padding:12px 24px;">
        <nav aria-label="Main Navigation" style="max-width:1440px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
          <a href="/" style="color:#FFE45C; font-weight:bold; font-size:1.25rem; text-decoration:none;">HEAL ENGINE</a>
          <ul style="display:flex; gap:16px; list-style:none; margin:0; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#CBD5E1; text-decoration:none;">Home</a></li>
            <li><a href="/about" style="color:#CBD5E1; text-decoration:none;">About</a></li>
            <li><a href="/specialists" style="color:#CBD5E1; text-decoration:none;">3D Specialists</a></li>
            <li><a href="/technology" style="color:#CBD5E1; text-decoration:none;">Technology &amp; Safety</a></li>
            <li><a href="/contact" style="color:#FFE45C; text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#CBD5E1; text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/app" style="background:#FFE45C; color:#080808; padding:6px 12px; font-weight:bold; text-decoration:none;">Launch Clinical OS</a></li>
          </ul>
        </nav>
      </header>
      <main style="max-width:1440px; margin:0 auto; padding:32px 24px;">
        <nav aria-label="Breadcrumb" style="margin-bottom:24px;">
          <ol style="display:flex; gap:8px; list-style:none; padding:0; font-size:0.875rem;">
            <li><a href="/" style="color:#64748B;">Home</a> &gt;</li>
            <li aria-current="page"><strong>Contact &amp; Support</strong></li>
          </ol>
        </nav>
        <article>
          <span style="background:#FFE45C; color:#080808; padding:4px 8px; font-weight:bold; font-size:0.75rem;">CLINICAL COMMUNICATIONS</span>
          <h1 style="font-size:2.5rem; font-weight:800; margin-top:16px;">Contact Clinical Engineering &amp; Support</h1>
          <p style="font-size:1.125rem; color:#475569; max-width:800px; margin-top:12px;">
            Inquiries regarding institutional EHR integration pilots, clinical safety verification, or Data Protection Officer communications.
          </p>
          <section style="margin-top:32px; background:#FFFFFF; border:2px solid #080808; padding:24px;">
            <h2>Direct Clinical Channels</h2>
            <p><strong>Emergency Telehealth Hotline:</strong> <a href="tel:+18005554325">1-800-555-HEAL (+1-800-555-4325)</a></p>
            <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@healengine.hospital.org">dpo@healengine.hospital.org</a></p>
          </section>
        </article>
      </main>
      <footer style="background:#080D1A; color:#FFFFFF; padding:32px 24px; border-top:2px solid #1E293B; margin-top:48px; text-align:center;">
        <p>&copy; 2026 HEAL Health Systems. All clinical workflows human-in-the-loop governed.</p>
      </footer>
    `
  }
];

export async function runPrerender(): Promise<void> {
  console.log('========================================================================');
  console.log('HEAL ENGINE: STATIC SITE PRE-RENDERING (SSG) & SEO BUILD PIPELINE');
  console.log('========================================================================\n');

  const baseHtmlPath = path.resolve(DIST_DIR, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error(`Base build template not found at ${baseHtmlPath}. Ensure "vite build" runs first.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');

  for (const def of ROUTES) {
    const canonicalUrl = `${BASE_URL}${def.route === '/' ? '/' : def.route}`;
    const outputDir = path.dirname(def.outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Build structured data scripts
    const schemas: any[] = [def.structuredData];
    if (def.breadcrumbs && def.breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': def.breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': b.name,
          'item': b.url
        }))
      });
    }

    const structuredDataTag = `\n    <script type="application/ld+json" data-heal-seo="true">${JSON.stringify(
      schemas.length === 1 ? schemas[0] : { '@context': 'https://schema.org', '@graph': schemas }
    )}</script>`;

    // Build SEO tags block
    const seoTags = `
    <title>${def.title}</title>
    <meta name="description" content="${def.description}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="HEAL Engine" />
    <meta property="og:title" content="${def.title}" />
    <meta property="og:description" content="${def.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="${BASE_URL}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="HEAL Engine — Longitudinal Clinical Intelligence OS" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${def.title}" />
    <meta name="twitter:description" content="${def.description}" />
    <meta name="twitter:image" content="${BASE_URL}/og-image.png" />${structuredDataTag}
  `;

    // Inject SEO tags into head and body HTML into #root
    let pageHtml = baseHtml;

    // Replace title
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, '');
    // Replace meta description
    pageHtml = pageHtml.replace(/<meta name="description"[^>]*>/i, '');
    // Replace existing og tags if any
    pageHtml = pageHtml.replace(/<meta property="og:[^>]*>/gi, '');

    // Insert new SEO tags right before </head>
    pageHtml = pageHtml.replace('</head>', `${seoTags}</head>`);

    // Insert meaningful semantic SSR HTML into <div id="root"></div>
    const bodyContent = def.renderBodyHtml();
    pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`);

    fs.writeFileSync(def.outputPath, pageHtml, 'utf8');
    const bytes = fs.statSync(def.outputPath).size;
    console.log(`  ✓ Pre-rendered: ${def.route.padEnd(16)} -> ${path.relative(process.cwd(), def.outputPath)} (${(bytes / 1024).toFixed(1)} KB)`);
  }

  // Also ensure robots.txt and sitemap.xml exist in dist/
  const publicRobots = path.resolve(process.cwd(), 'frontend', 'public', 'robots.txt');
  const distRobots = path.resolve(DIST_DIR, 'robots.txt');
  if (fs.existsSync(publicRobots)) {
    fs.copyFileSync(publicRobots, distRobots);
    console.log(`  ✓ Synced robots.txt -> dist/robots.txt`);
  }

  const publicSitemap = path.resolve(process.cwd(), 'frontend', 'public', 'sitemap.xml');
  const distSitemap = path.resolve(DIST_DIR, 'sitemap.xml');
  if (fs.existsSync(publicSitemap)) {
    fs.copyFileSync(publicSitemap, distSitemap);
    console.log(`  ✓ Synced sitemap.xml -> dist/sitemap.xml`);
  }

  console.log('\n✓ Pre-rendering build completed successfully for all public canonical routes.\n');
}

// Execute if run directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('prerender.ts')) {
  runPrerender().catch((err) => {
    console.error('Pre-render build error:', err);
    process.exit(1);
  });
}
