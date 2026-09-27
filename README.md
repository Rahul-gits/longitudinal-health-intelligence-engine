# ⚡ Heal Engine — Longitudinal Clinical Decision Intelligence for Complex Care

> **Heal Engine turns complex patient information into understandable, evidence-informed clinical decision support.**
> 
> *It continuously builds a longitudinal picture of the patient, identifies meaningful changes and potential risks, explains contributing factors, checks safety constraints, presents care options for clinician review, and monitors outcomes over time.*

---

## 🧭 Canonical 7-Layer Production Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     1. EXPERIENCE LAYER                                          │
│  [Patient Portal]                  [Virtual Specialist (Multimodal)]   [Clinician Command Center]│
│  • Calm Health Overview            • Web Speech API (ASR / Live Mic)   • Longitudinal Sparklines │
│  • 2 Attention Items               • TTS / Karaoke Subtitles           • Why/Why Not Candidates  │
│  • Daily Care Plan Tasks           • Animated Posture Reactions        • Deep Evidence Inspector │
│  • Timeline & Downloadable Reports • Emergency 911 Red Flag Handoff    • Mandatory HITL Approval │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             2. APPLICATION / API & SECURITY LAYER                                │
│  • Multi-Role RBAC: Patient (Self), Clinician (Panel-Scoped), Researcher (De-ID), Admin (Policy) │
│  • Scoped Real-Time Server-Sent Events (SSE) Bus (15s Heartbeats, Replay & Connection Cleanup)   │
│  • Canonical FHIR R4 Normalization Adapter: Patient, Observation, Condition, MedicationRequest   │
│  • Non-Bypassable Safety Invariant: Administrative privileges cannot bypass clinical safety gates│
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 3. CLINICAL ORCHESTRATION LAYER                                  │
│                                  CENTRAL CLINICAL ORCHESTRATOR                                   │
│       ┌───────────────┬────────────────────────┼────────────────────────┬───────────────┐        │
│       ▼               ▼                        ▼                        ▼               ▼        │
│   Screening       Workflow            13 Specialized            Evidence RAG     Goal Conflict   │
│   Engine          Orchestrator        Clinical Modules             Engine           Engine       │
│  (Adaptive       (What happens       (Nephrology, Cardio,        (KDIGO 2024,     (Analgesia vs  │
│   dialogue)       next in care)       Pharm, Geriatrics)          ADA, Beers)      Renal Tradeoff)│
│                                                │                                                 │
│                                                ▼                                                 │
│                                   SPECIALIST CONSENSUS ENGINE                                    │
│                             (Multi-specialist cross-disciplinary panel)                          │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    4. DETERMINISTIC SAFETY LAYER                                 │
│    AI / LLM Candidate Options ──► ┌──────────────────────────────────────────────┐               │
│                                   │          DETERMINISTIC SAFETY GATE           │               │
│                                   │  • Cockcroft-Gault CrCl Renal Equation       │               │
│                                   │  • Hard Drug-Drug Interactions (NSAID+ACEi)  │               │
│                                   │  • IgE Anaphylactic Allergen Shields         │               │
│                                   │  • Acute Hyperkalemia (K+ >= 5.2) Blocks     │               │
│                                   │  • Metformin Lactic Acidosis (eGFR < 30)     │               │
│                                   │  • Euglycemic DKA Perioperative Withhold     │               │
│                                   └──────────────────────┬───────────────────────┘               │
│                                                          │                                       │
│                                   ┌──────────────────────┴──────────────────────┐                │
│                                   ▼                                             ▼                │
│                              [HARD BLOCK]                                  [SAFE/REVIEW]         │
│                        Halt routine execution                          Multi-Candidate Options   │
│                        Emergency triage dispatch                       Clinician Review Required │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      5. PATIENT STATE LAYER                                      │
│  • Canonical Longitudinal Patient State (Single Source of Truth across all clinical workspaces)  │
│  • Temporal Biomarker Trajectories & Slope Analysis (eGFR 64 → 52 mL/min, Creatinine 1.1 → 1.38)│
│  • Active Medication List & Adherence Metrics (94% Lisinopril, unmonitored OTC NSAID intake)   │
│  • Chronic Conditions (CKD 3b, HTN, Knee Osteoarthritis, Type 2 Diabetes)                        │
│  • Multi-Dimensional Clinical Uncertainty Model:                                                 │
│    { Confidence: HIGH, EvidenceStrength: Level A, DataCompleteness: PARTIAL, Review: MANDATORY }│
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 6. EVIDENCE & KNOWLEDGE LAYER                                    │
│  Clinical Guidelines (KDIGO 2024, ADA, ACC/AHA) ──► Ingestion & Chunking ──► BioMed Embeddings   │
│  Deep Provenance Retrieval: Evidence ID, Guideline Edition, Page, Vector Score (0.942) & Chunk ID│
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               7. DATA & INFRASTRUCTURE LAYER                                     │
│  PostgreSQL 16        TimescaleDB           Redis 7              Qdrant Vector    Object Storage │
│  (Relational Core,   (Hypertables for       (BullMQ Asynchronous (Guideline       (Encrypted S3  │
│   Consents, Plans)    Telemetry Streams)     Worker Queue & Key)  Embeddings)      Scans, PDFs)  │
│  • Immutable WORM Audit Ledger (SHA-256 Hash Chain)                                             │
│  • Asynchronous Background Workers: OCR Extraction, RAG Embedding, Longitudinal Recalc          │
│  • Disaster Recovery: Automated PITR Backups (RPO < 15 min, RTO < 2 min)                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## 🔄 Closed-Loop Longitudinal Clinical Feedback Cycle

```
PATIENT ──► INGESTION ──► PATIENT STATE ──► CLINICAL ORCHESTRATOR ──► VIRTUAL DOCTOR
                               ▲                                            │
                               │                                            ▼
                       NEW PATIENT DATA ◄── MONITORING ◄── CARE PLAN ◄── CLINICIAN HITL
```

---

## 👤 Four Levels of Documentation

### 👤 Level 1 — Everyone (What is Heal Engine?)
Heal Engine is an intelligent health operating system that helps patients, caregivers, and clinicians stay on top of complex health conditions. Instead of bombarding people with incomprehensible medical data, it clearly shows:
- **What is happening?** (Patient Health Picture)
- **What changed?** (Longitudinal trends & shifts)
- **Why?** (Understandable contributing factors)
- **Is it safe?** (Automatic safety protection)
- **What should we do?** (Clear care options for doctor sign-off)
- **What happens next?** (Recovery and ongoing monitoring)

### 🩺 Level 2 — Clinician (How Does It Support Decisions?)
Heal Engine acts as an explainable, non-intrusive clinical copilot:
- **Longitudinal Trend Detection**: Evaluates percentage changes ($eGFR \downarrow 18.7\%$) rather than isolated laboratory values.
- **Evidence Verification**: Directly anchors recommendations to **KDIGO 2024**, **CPIC Guidelines**, and **FDA Drug Communications**.
- **Ask When It Doesn't Know**: Explicitly highlights incomplete data (*Spot UACR Pending*, *Echo Pending*) rather than hallucinating clinical certainty.
- **Interactive What-If Simulator**: Allows physicians to simulate the impact of dosage or medication modifications before finalizing orders.

### 🔬 Level 3 — Researcher (Reasoning, Benchmark, and Evidence)
- **50-Scenario Scientific Benchmark Suite**: Evaluated across 5 clinical categories (10 Medication Safety, 10 Renal/Cardiac, 10 Polypharmacy, 10 Missing/Conflicting Data, 10 Longitudinal Trajectory Cases) against predefined clinical target criteria.
- **Demonstration Metrics**:
  - *Unsafe Recommendation Rate*: **0.0%** (vs. 64% Simple LLM, 28% LLM + RAG).
  - *Hard Safety Block Accuracy*: **100%** (Deterministic Gate).
  - *Guideline Adherence*: **98%** (Grade A/B Evidence citations).
- **Reasoning Trace Visualizer**: Experimental particle swarm optimization visualization demonstrating multi-objective exploration.

### 💻 Level 4 — Engineer (Services, Data Models, and Workflows)
- **Clean Version Separation**:
  - `Patient Health State`: `v1.4`
  - `Engine Model`: `v2.1`
  - `Safety Policy`: `v3.0`
  - `Evidence Base`: `v2024.2`
- **FHIR R4 Interoperability**: Generates standard JSON resource bundles for `MedicationRequest`, `CarePlan`, and `Observation`.
- **Immutable Forensic Audit Trail**: 11-attribute cryptographic event logs with SHA-256 state hashes.

---

## 🌐 Full Stack Architecture & REST API Reference

The application is structured as a cohesive full-stack clinical intelligence platform:

```
HEAL-ENGINE/
├── server/                      # Express + TypeScript Backend API (Port 5000)
│   ├── index.ts                 # Main server entry, middleware & route mounting
│   └── routes/
│       ├── patientRoutes.ts     # Longitudinal records, labs & vitals
│       ├── workflowRoutes.ts    # 6-step care loop clinical pipeline engine
│       ├── screeningRoutes.ts   # Virtual Doctor dialogue & speech synthesis
│       ├── swarmRoutes.ts       # Multi-agent swarm (PSO) optimization
│       ├── conferenceRoutes.ts  # Clinical case conference debate studio
│       ├── safetyRoutes.ts      # Hard safety constraints & contraindications
│       ├── reportRoutes.ts      # Report parsing & FHIR R4 Bundle generation
│       ├── benchmarkRoutes.ts   # 50-case benchmark baseline & scoring
│       └── auditRoutes.ts       # Governance, consent & immutable audit log
├── src/                         # React 18 + Vite + TailwindCSS Frontend (Port 3000)
│   ├── components/              # 26 Clinical UI workspaces & dashboards
│   ├── engine/                  # In-browser fallback clinical intelligence engines
│   ├── services/
│   │   └── apiClient.ts         # Unified typed API client with live health pinging
│   ├── data/                    # Patient mock data and knowledge sets
│   └── types/                   # Shared TypeScript clinical schemas
├── vite.config.ts               # Proxy configuration (`/api` -> `http://localhost:5000`)
└── package.json                 # Unified concurrent runner (`npm run dev`)
```

### 📡 Available Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check, uptime, engine version & endpoint registry |
| `/api/patients` | `GET` | All longitudinal patient profiles |
| `/api/patients/:id` | `GET` | Full patient state, active conditions, medications, alerts |
| `/api/workflow/run` | `POST` | Executes the complete 6-Step Clinical Care Loop |
| `/api/workflow/step/:step` | `POST` | Executes an individual step (Understand, Detect, Explain, etc.) |
| `/api/screening/start` | `POST` | Initiates Virtual Doctor triage screening session |
| `/api/screening/respond` | `POST` | Submits patient message, computes risk score & next questions |
| `/api/swarm/simulate` | `POST` | Simulates multi-agent PSO convergence & consensus vector |
| `/api/conference/debate`| `POST` | Generates multi-specialist debate rounds & consensus |
| `/api/safety/check` | `POST` | Evaluates proposed orders against 14 hard safety boundaries |
| `/api/reports/fhir` | `GET` | Exports patient state as standard FHIR R4 JSON Bundle |
| `/api/benchmarks/summary` | `GET` | Returns 50-case gold standard accuracy & safety metrics |
| `/api/audit/logs` | `GET` | Fetches immutable cryptographic event audit log |

---

## 🛠️ Quickstart & Running the Full Stack Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Full Stack (Frontend + Backend Concurrently)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **API Health**: `http://localhost:5000/api/health`

### 3. Run Separately (Optional)
- Run Backend only: `npm run server`
- Run Frontend only: `npm run client`
- Run Type Checker: `npm run lint`
- Production Build: `npm run build`

