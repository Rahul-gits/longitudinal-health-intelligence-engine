# 🏛️ Heal Engine — Canonical Production Architecture

> **Target Profile:** Longitudinal Health Intelligence & Clinical Decision Support System (CDSS)  
> **Core Architectural Paradigm:** Deterministic Safety Gating • Multi-Dimensional Uncertainty • Evidence-Informed Clinical Orchestration • Closed-Loop Longitudinal Feedback

---

## 1. Master 7-Layer System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     1. EXPERIENCE LAYER                                          │
│                                                                                                  │
│  [PATIENT PORTAL]                  [VIRTUAL SPECIALIST]           [CLINICIAN COMMAND CENTER]     │
│  • Calm Health Overview            • Multimodal ASR / Voice       • Longitudinal Sparkline Vitals│
│  • 2 Attention Items               • TTS / Karaoke Subtitles      • Why/Why Not Alternatives     │
│  • Interactive Care Plan Tasks     • Animated Posture Reactions   • Deep Evidence Provenance UI  │
│  • Health Timeline & Reports       • Emergency 911 Handoff        • HITL Decision (Sign/Modify)  │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             2. APPLICATION / API & SECURITY LAYER                                │
│                                                                                                  │
│  • Multi-Role RBAC: Patient (Self), Clinician (Panel Scoped), Researcher (De-ID), Admin (Policy) │
│  • Scoped Real-Time Server-Sent Events (SSE) Bus (15s Heartbeats, Connection Cleanup, Backpressure)│
│  • RESTful Clinical Endpoints: /patient/:id, /workflow, /screening, /care-plan, /audit           │
│  • FHIR R4 Normalization Adapter: Patient, Observation, Condition, MedicationRequest, Report    │
│  • Non-Bypassable Invariant: Administrative privileges cannot bypass deterministic safety gates │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 3. CLINICAL ORCHESTRATION LAYER                                  │
│                                                                                                  │
│                                  CENTRAL CLINICAL ORCHESTRATOR                                   │
│                                                │                                                 │
│       ┌───────────────┬────────────────────────┼────────────────────────┬───────────────┐        │
│       ▼               ▼                        ▼                        ▼               ▼        │
│   Screening       Workflow            13 Specialized            Evidence RAG     Goal Conflict   │
│   Engine          Orchestrator        Clinical Modules             Engine           Engine       │
│  (Adaptive       (What happens       (Nephrology, Cardio,        (KDIGO 2024,     (Analgesia vs  │
│   dialogue)       next in care)       Pharm, Geriatrics)          ADA, Beers)      Renal Tradeoff)│
│                                                │                                                 │
│                                                ▼                                                 │
│                                   SPECIALIST CONSENSUS ENGINE                                    │
│                          (Multi-disciplinary cross-specialty agreement)                          │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    4. DETERMINISTIC SAFETY LAYER                                 │
│                                                                                                  │
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
│                                                                                                  │
│  • Canonical Longitudinal Patient State (Single Source of Truth across all clinical portals)     │
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
│                                                                                                  │
│  Clinical Guidelines (KDIGO 2024, ADA, ACC/AHA) ──► Ingestion & Chunking ──► BioMed Embeddings   │
│                                                                                     │            │
│  Deep Provenance Retrieval:                                                         ▼            │
│  • Evidence ID & Chunk ID (kdigo-2024-sec4.2-c03)                          Vector Store (Qdrant) │
│  • Source Organization, Guideline Edition, Page & Section                           │            │
│  • Vector Similarity Score (0.942) & Exact Quoted Text                              ▼            │
│  • Ingestion Lineage & Audit Version Hash                                  Reranker & Provenance │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               7. DATA & INFRASTRUCTURE LAYER                                     │
│                                                                                                  │
│  PostgreSQL 16        TimescaleDB           Redis 7              Qdrant Vector    Object Storage │
│  (Relational Core,   (Hypertables for       (BullMQ Asynchronous (Guideline       (Encrypted S3  │
│   Consents, Plans)    Telemetry Streams)     Worker Queue & Key)  Embeddings)      Scans, PDFs)  │
│                                                                                                  │
│  • Immutable WORM Audit Ledger (SHA-256 Hash Chain)                                             │
│  • Asynchronous Background Workers: OCR Extraction, RAG Embedding, Longitudinal Recalculation   │
│  • Disaster Recovery: Automated PITR Backups (RPO < 15 min, RTO < 2 min)                         │
│  • Production Hardening: Multi-stage Dockerfile (Non-root user), Docker Compose, TLS 1.3        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Closed-Loop Longitudinal Clinical Feedback Cycle

Heal Engine is explicitly designed around a closed-loop care cycle. Decisions are never dead ends; every intervention updates patient state and monitors for ongoing outcomes:

```
                            ┌────────────────────────┐
                            │    PATIENT INTAKE      │
                            │ (EHR, Labs, Telemetry) │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │  PATIENT STATE ENGINE  │
                            │ (Longitudinal Baseline)│
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │ CLINICAL ORCHESTRATOR  │
                            │  (Delta & Risk Detect) │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │   VIRTUAL SPECIALIST   │
                            │ (Multimodal Screening) │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │   CLINICIAN DECISION   │
                            │ (HITL Sign / Modify)   │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │   CARE & FOLLOW-UP     │
                            │ (Daily Tasks, Rx Plan) │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │   OUTCOME MONITORING   │
                            │  (IoT Scales, BP Cuff) │
                            └───────────┬────────────┘
                                        │
                                        ▼
                                NEW PATIENT DATA
                                        │
                                        └───────────────────► [RE-EVALUATE STATE v1.5]
```

---

## 3. Multimodal Virtual Doctor & Adaptive Intelligence Loop

The Virtual Doctor is not a generic conversational chatbot. It is a safety-gated specialist screening system:

```
                                VIRTUAL DOCTOR SESSION
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            VOICE / TEXT INPUT                        TTS / ANIMATED AVATAR
         (Web Speech API / ASR)                     (SpeechSynthesis / Posture)
                     │
                     ▼
          CLINICAL ENTITY EXTRACTION
         (NegEx Assertion Classifier)
                     │
                     ▼
         LONGITUDINAL CORRELATION
        (Cross-reference eGFR drop)
                     │
                     ▼
        DETERMINISTIC SAFETY GATE
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[EMERGENCY RED FLAG]      [ADHERENCE DISCREPANCY]
• Chest pain / dyspnea    • "Stopped taking meds"
• HALT routine screening  • Do NOT assume reason
• Dispatch STAT_EMERGENCY • Ask clarifying question
• Posture: ALERTING       • Posture: EXPLAINING
```

---

## 4. Evidence RAG Ingestion & Deep Provenance Pipeline

```
Official Guidelines (KDIGO, ADA, ACC/AHA)
                   │
                   ▼
          Document Acquisition
                   │
                   ▼
          Version & Hash Detection
                   │
                   ▼
          Integrity & Bound Checks
                   │
                   ▼
     Medical Section & Table Parsing
                   │
                   ▼
         Deterministic Chunking
                   │
                   ▼
        BioMed Vector Embedding
                   │
                   ▼
      Qdrant Vector DB (1536-dim)
                   │
                   ▼
         Cross-Encoder Reranker
                   │
                   ▼
  Deep Provenance Evidence Package
  ├── Evidence ID & Chunk ID
  ├── Guideline Version & Publication Date
  ├── Section, Page & Table Location
  ├── Exact Quoted Guidance Text
  └── Relevance Similarity Score
```

---

## 5. Research & Experimental Plane (Isolated)

To prevent clinical confusion, all stochastic simulation components are segregated from the primary clinical care loop:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   RESEARCH & EXPERIMENTAL PLANE (LEVEL 3)               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [SWARM SIMULATION]                 [PERSONA DEBATE STUDIO]           │
│   • Particle Swarm Optimization      • Multi-Specialist Case Debate    │
│   • Multi-Objective Exploration      • Consensus Convergence Visualizer│
│   • Synthetic Patient Cohorts        • 50-Scenario Benchmark Suite     │
│                                                                        │
│   ⚠️ ISOLATION GUARANTEE: Stochastic swarm outputs never bypass the     │
│   Deterministic Safety Gate or directly prescribe patient orders.      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Enterprise Governance & Regulatory Traceability

- **Legally Defensible Phrasing:** The platform implements an *immutable, hash-chained audit trail designed to support clinical governance, traceability, and future regulatory evaluation* (rather than premature claims of turnkey SaMD / HIPAA compliance).
- **Audit Ledger:** Every clinician decision, override, and background calculation records an 11-attribute WORM entry with previous hash linking.
- **AI Versioning:** Explicit tracking of `modelVersion`, `promptVersion`, `retrievalVersion`, `knowledgeVersion`, and `clinicalRulesVersion`.
- **Automated Regression Suite:** 12 executable clinical scenarios covering hyperkalemia, euglycemic DKA, cirrhosis, fatal CYP2C9 interactions, allergy gating, hemolyzed samples, and contradictory PROMs.
