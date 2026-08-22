# ⚡ Heal Engine — Longitudinal Clinical Decision Intelligence for Complex Care

> **Heal Engine turns complex patient information into understandable, evidence-informed clinical decision support.**
> 
> *It continuously builds a longitudinal picture of the patient, identifies meaningful changes and potential risks, explains contributing factors, checks safety constraints, presents care options for clinician review, and monitors outcomes over time.*

---

## 🧭 Diagram 1: Human Experience Architecture

```
                 ┌────────────────────────────────┐
                 │          1. UNDERSTAND         │ (Patient Health Picture)
                 │  "What do we know about her?"  │
                 └───────────────┬────────────────┘
                                 ↓
                 ┌────────────────────────────────┐
                 │           2. DETECT            │ (⚠️ eGFR: 64 → 52 mL/min)
                 │ "What changed/needs attention?"│
                 └───────────────┬────────────────┘
                                 ↓
                 ┌────────────────────────────────┐
                 │           3. EXPLAIN           │ (Potential Contributing Factors)
                 │     "Why is this happening?"   │
                 └───────────────┬────────────────┘
                                 ↓
                 ┌────────────────────────────────┐
                 │           4. PROTECT           │ (🛡️ High-Risk Pattern Flagged)
                 │   "Is anything unsafe/risky?"  │
                 └───────────────┬────────────────┘
                                 ↓
                 ┌────────────────────────────────┐
                 │           5. DECIDE            │ (Evidence-Informed Care Options)
                 │      "What should we do?"      │
                 └───────────────┬────────────────┘
                                 ↓
                 ┌────────────────────────────────┐
                 │           6. MONITOR           │ (14-Day Recovery Feedback)
                 │ "What happened after decision?"│
                 └───────────────┬────────────────┘
                                 │
                                 └──────────→ Updated Patient Health State v1.5
```

---

## ⚙️ Diagram 2: Internal Technical Architecture

```
                           DATA INGESTION
             (EHR Records, Telemetry Streams, Lab Panels)
                                  ↓
                        DATA INTEGRITY LAYER
             (Schema Verification, Time-Decay Weights)
                                  ↓
                      PATIENT HEALTH STATE (v1.4)
             (Longitudinal Baseline, Active Meds, Genetics)
                                  ↓
                      CLINICAL ORCHESTRATOR
             (State Delta Evaluation, Trigger Detection)
                                  ↓
                   13 SPECIALIZED CLINICAL MODULES
             (Nephrology, Cardiology, Pharmacogenomics, etc.)
                                  ↓
                   KNOWLEDGE GRAPH & EVIDENCE RAG
             (KDIGO 2024, CPIC, FDA Blackbox, Semantic Graph)
                                  ↓
                     GOAL CONFLICT ENGINE
             (Analgesia vs Renal Preservation Tradeoffs)
                                  ↓
                 DETERMINISTIC SAFETY POLICIES (v3.0)
             (Hard Contraindication Gate: Action Blocked)
                                  ↓
                     DECISION SYNTHESIS ENGINE
             (Care Options, Why NOT? Forensics, What-If Simulator)
                                  ↓
                 MANDATORY CLINICIAN REVIEW (HITL)
             (Approve / Modify / Reject with Clinical Notes)
                                  ↓
                   11-ATTRIBUTE AUDIT LOGGING
             (Cryptographic Hash, FHIR R4 Order Bundles)
                                  ↓
                     OUTCOME MONITORING LOOP
             (14-Day Trajectory Feedback → State v1.5)
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

## 🛠️ Quickstart & Local Setup

```bash
git clone https://github.com/Rahul-gits/longitudinal-health-intelligence-engine.git
cd longitudinal-health-intelligence-engine
npm install
npm run dev
```
Open [`http://localhost:3000/`](http://localhost:3000/) in your browser.
