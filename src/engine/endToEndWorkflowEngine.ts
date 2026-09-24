import { PatientClinicalState } from '../types/health';
import { PATIENT_INFO } from '../data/mockPatientData';

export interface WorkflowPhaseInfo {
  phaseNumber: number;
  id: string;
  title: string;
  shortTitle: string;
  category: 'Patient Onboarding' | 'Data & State' | 'Intelligence & Reasoning' | 'Clinical Interaction' | 'Handoff & Monitoring';
  badge: string;
  color: string;
  bgColor: string;
  icon: string;
  patientExperience: string;
  developerImplementation: string;
  keyRule: string;
  status: 'pending' | 'active' | 'completed' | 'flagged';
  dataPayload: Record<string, any>;
}

export interface IngestedDocument {
  id: string;
  title: string;
  date: string;
  type: 'PDF' | 'Lab Record' | 'Prescription' | 'Clinical Note' | 'Wearable Stream';
  size: string;
  status: 'Processed' | 'Validating' | 'Failed';
  extractedEntities: number;
}

export interface ValidationIssue {
  id: string;
  field: string;
  category: 'Missing Value' | 'Duplicate Record' | 'Conflicting Value' | 'Invalid Date' | 'Medication Inconsistency';
  severity: 'Warning' | 'Critical' | 'Info';
  description: string;
  resolution: string;
  status: 'Flagged' | 'Resolved' | 'Gated';
}

export interface ClinicalCluster {
  id: string;
  name: string;
  specialty: string;
  assignedPersona: string;
  riskScore: number;
  biomarkers: string[];
  findings: string[];
  guidelineAnchor: string;
}

export interface RAGEvidenceItem {
  id: string;
  guideline: string;
  organization: string;
  year: number;
  recommendation: string;
  evidenceClass: 'Class I (Level A)' | 'Class I (Level B)' | 'Class IIa';
  patientApplication: string;
}

export interface ExtractedPatientEntity {
  rawText: string;
  intent: string;
  symptom: string;
  duration: string;
  temporalChange: 'New' | 'Worsening' | 'Stable' | 'Resolved';
  severity: 'Mild' | 'Moderate' | 'Severe';
  longitudinalCorrelation: string;
  safetyAction: 'Continue Screening' | 'Clarify Question' | 'Escalate to Clinician';
}

class EndToEndWorkflowEngine {
  private currentPhaseIndex: number = 0;

  // Ingested data store
  public documents: IngestedDocument[] = [
    { id: 'DOC-2026-08', title: 'Metabolic & Renal Comprehensive Panel', date: '2026-08-10', type: 'Lab Record', size: '1.4 MB', status: 'Processed', extractedEntities: 14 },
    { id: 'DOC-2025-06', title: 'Annual Cardiorenal Follow-up Note', date: '2025-06-14', type: 'Clinical Note', size: '820 KB', status: 'Processed', extractedEntities: 8 },
    { id: 'DOC-2026-07', title: 'Pharmacy Dispense History: OTC NSAID', date: '2026-07-20', type: 'Prescription', size: '340 KB', status: 'Processed', extractedEntities: 4 },
    { id: 'DOC-2026-WEAR', title: 'Continuous SBP / DBP Smart Cuff Feed', date: '2026-08-12', type: 'Wearable Stream', size: '5.2 MB', status: 'Processed', extractedEntities: 120 }
  ];

  // Validation issues database
  public validationIssues: ValidationIssue[] = [
    {
      id: 'VAL-001',
      field: 'Medication Reconciliation',
      category: 'Medication Inconsistency',
      severity: 'Critical',
      description: 'Concurrent Lisinopril 20mg (ACE inhibitor) + OTC Ibuprofen 400mg TID creates triple-whammy AKI risk with eGFR decline.',
      resolution: 'Strictly captured in Clinical State; never hallucinated or silently patched by LLM.',
      status: 'Gated'
    },
    {
      id: 'VAL-002',
      field: 'Serum Creatinine 2026 vs 2025',
      category: 'Conflicting Value',
      severity: 'Warning',
      description: 'Rapid elevation from 1.10 mg/dL to 1.38 mg/dL (>25% jump) flagged for nephrology correlation.',
      resolution: 'Cross-referenced against hydrated baseline laboratory records.',
      status: 'Resolved'
    },
    {
      id: 'VAL-003',
      field: 'Missing Post-Void Residual Ultrasound',
      category: 'Missing Value',
      severity: 'Info',
      description: 'Ultrasound record dated 2024 is >18 months old.',
      resolution: 'Added to suggested clinical follow-up orders.',
      status: 'Resolved'
    }
  ];

  // Clinical Problem Clusters
  public clusters: ClinicalCluster[] = [
    {
      id: 'cluster-cardiorenal',
      name: 'Cardiorenal & Hemodynamic Syndrome',
      specialty: 'Cardiorenal Nephrology',
      assignedPersona: 'Dr. Aris Thorne (Cardiorenal)',
      riskScore: 84,
      biomarkers: ['eGFR: 52 mL/min (↓ 18.7%)', 'Creatinine: 1.38 mg/dL', 'Blood Pressure: 142/88 mmHg'],
      findings: ['Accelerated decline from 2025 baseline (64 mL/min)', 'Mild bilateral pitting ankle edema'],
      guidelineAnchor: 'KDIGO 2024 CKD-AKI Management Guidelines'
    },
    {
      id: 'cluster-medication',
      name: 'Pharmacological Interaction Cluster',
      specialty: 'Clinical Pharmacology',
      assignedPersona: 'Dr. Maya Lin (Pharmacology)',
      riskScore: 92,
      biomarkers: ['Lisinopril 20mg daily', 'Ibuprofen 400mg TID PRN', 'Atorvastatin 10mg'],
      findings: ['Drug-drug hemodynamic nephrotoxicity (NSAID afferent constriction + ACEi efferent dilation)'],
      guidelineAnchor: 'FDA MedWatch & Beers Criteria 2023'
    },
    {
      id: 'cluster-metabolic',
      name: 'Metabolic & Vascular Integrity',
      specialty: 'Preventive Medicine',
      assignedPersona: 'Dr. Marcus Vance (Primary Care)',
      riskScore: 42,
      biomarkers: ['HbA1c: 5.6%', 'LDL: 98 mg/dL', 'Serum Potassium: 4.8 mEq/L'],
      findings: ['Glycemic control optimal; potassium approaching upper boundary threshold'],
      guidelineAnchor: 'AHA/ACC 2023 Primary Prevention Standards'
    },
    {
      id: 'cluster-preventive',
      name: 'Preventive Renal Preservation',
      specialty: 'Preventive Nephrology',
      assignedPersona: 'Dr. Sarah Chen (Preventive Nephrology)',
      riskScore: 68,
      biomarkers: ['uACR: 42 mg/g', 'BUN: 24 mg/dL'],
      findings: ['Microalbuminuria progression requires immediate SGLT2i / non-NSAID transition'],
      guidelineAnchor: 'KDIGO 2023 Diabetes & CKD Clinical Practice'
    }
  ];

  // RAG Evidence database
  public evidenceItems: RAGEvidenceItem[] = [
    {
      id: 'EVID-KDIGO-2024',
      guideline: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD',
      organization: 'Kidney Disease: Improving Global Outcomes',
      year: 2024,
      recommendation: 'In patients with CKD Stage 2-3 experiencing acute eGFR reductions >15%, immediately discontinue NSAIDs and re-evaluate ACEi/ARB dosage within 14 days.',
      evidenceClass: 'Class I (Level A)',
      patientApplication: 'Directly applies to Eleanor Vance (eGFR dropped 64 → 52 mL/min after 3 weeks of Ibuprofen usage).'
    },
    {
      id: 'EVID-ACC-2023',
      guideline: '2023 ACC/AHA Prevention and Management of Cardiorenal Syndrome',
      organization: 'American College of Cardiology / AHA',
      year: 2023,
      recommendation: 'Topical NSAIDs or Acetaminophen should substitute oral NSAIDs in geriatric patients on renin-angiotensin inhibitors with mild peripheral edema.',
      evidenceClass: 'Class I (Level A)',
      patientApplication: 'Substitute oral Ibuprofen with Topical Voltaren Gel + Acetaminophen 500mg.'
    },
    {
      id: 'EVID-BEERS-2023',
      guideline: 'AGS Beers Criteria® for Potentially Inappropriate Medication Use in Older Adults',
      organization: 'American Geriatrics Society',
      year: 2023,
      recommendation: 'Avoid chronic oral NSAID use in individuals aged ≥65 due to marked risk of acute kidney injury and gastrointestinal bleeding.',
      evidenceClass: 'Class I (Level B)',
      patientApplication: 'Flags Eleanor (Age 68) for immediate pharmacist consultation.'
    }
  ];

  // Extraction Engine for Patient Live Dialogue
  public analyzePatientResponse(rawText: string): ExtractedPatientEntity {
    const textLower = rawText.toLowerCase();

    let symptom = 'General Discomfort';
    let duration = 'Recent';
    let temporalChange: 'New' | 'Worsening' | 'Stable' | 'Resolved' = 'New';
    let severity: 'Mild' | 'Moderate' | 'Severe' = 'Moderate';
    let safetyAction: 'Continue Screening' | 'Clarify Question' | 'Escalate to Clinician' = 'Continue Screening';
    let intent = 'Symptom Status Report';

    if (textLower.includes('tired') || textLower.includes('fatigue') || textLower.includes('exhausted')) {
      symptom = 'Fatigue & Lethargy';
      duration = textLower.includes('2 weeks') || textLower.includes('two weeks') ? '2 weeks' : '10 days';
      temporalChange = 'New';
      severity = 'Moderate';
      intent = 'Report New Fatigue';
    } else if (textLower.includes('swelling') || textLower.includes('leg') || textLower.includes('ankle') || textLower.includes('puff')) {
      symptom = 'Bilateral Lower Extremity Edema';
      duration = 'Past 2-3 weeks';
      temporalChange = 'Worsening';
      severity = 'Moderate';
      intent = 'Report Peripheral Swelling';
    } else if (textLower.includes('chest pain') || textLower.includes('breath') || textLower.includes('dizzy') || textLower.includes('faint')) {
      symptom = 'Acute Cardiorespiratory Distress';
      duration = 'Acute onset';
      temporalChange = 'Worsening';
      severity = 'Severe';
      safetyAction = 'Escalate to Clinician';
      intent = 'Emergency Symptom Escalation';
    } else if (textLower.includes('ibuprofen') || textLower.includes('pill') || textLower.includes('knee') || textLower.includes('pain')) {
      symptom = 'Knee Osteoarthritis / NSAID Usage';
      duration = '3 weeks PRN';
      temporalChange = 'Stable';
      severity = 'Mild';
      intent = 'Report OTC Analgesic Use';
    }

    const longitudinalCorrelation = `Correlated with: eGFR decline (64 → 52), Lisinopril 20mg active therapy, and Ibuprofen intake. Confirms hemodynamic cardiorenal strain.`;

    if (severity === 'Severe' || textLower.includes('chest') || textLower.includes('can\'t breathe')) {
      safetyAction = 'Escalate to Clinician';
    } else if (textLower.length < 8) {
      safetyAction = 'Clarify Question';
    } else {
      safetyAction = 'Continue Screening';
    }

    return {
      rawText,
      intent,
      symptom,
      duration,
      temporalChange,
      severity,
      longitudinalCorrelation,
      safetyAction
    };
  }

  // Get Phase metadata array
  public getPhases(): WorkflowPhaseInfo[] {
    return [
      {
        phaseNumber: 1,
        id: 'phase-auth-consent',
        title: 'Phase 1: Patient Registration & Consent',
        shortTitle: '1. Registration & Consent',
        category: 'Patient Onboarding',
        badge: 'Gate 0 Compliant',
        color: '#FFE600',
        bgColor: '#FFFBEA',
        icon: 'UserCheck',
        patientExperience: 'Patient logs in securely, confirms identity, reviews HIPAA data-sharing consent, and confirms existing health conditions, allergy records, and medications.',
        developerImplementation: 'Frontend Auth UI → Auth API → User Profile Service → Consent Service (RFC 3881 cryptographic audit timestamp) → Verified Patient Database Record.',
        keyRule: 'Strict Gate: Never allow downstream AI reasoning or clinical inference before required patient consent and identity validation are verified.',
        status: 'completed',
        dataPayload: {
          patientId: PATIENT_INFO.id,
          name: PATIENT_INFO.name,
          age: PATIENT_INFO.age,
          consentState: 'EXPLICIT_ACTIVE',
          consentTimestamp: '2026-08-13T09:00:00Z',
          hipaaVerified: true,
          authenticatedUser: 'eleanor.vance@securehealth.org'
        }
      },
      {
        phaseNumber: 2,
        id: 'phase-data-ingestion',
        title: 'Phase 2: Health Data Collection ("My Health Data")',
        shortTitle: '2. Health Data Ingestion',
        category: 'Patient Onboarding',
        badge: 'Multi-Source OCR',
        color: '#00F5D4',
        bgColor: '#E6FFFA',
        icon: 'UploadCloud',
        patientExperience: 'A unified "My Health Data" hub where the patient uploads PDF laboratory reports, connects hospital EHR records, lists OTC medications, and pairs blood pressure monitors.',
        developerImplementation: 'Patient Ingestion API → Document Processor → PDF/OCR Parser → Structured Clinical JSON Extractor → FHIR R4 Patient Observation Store.',
        keyRule: 'Extract exact clinical units (e.g. mL/min/1.73m², mg/dL) with provenance back to original PDF source pages.',
        status: 'completed',
        dataPayload: {
          totalDocumentsIngested: this.documents.length,
          documents: this.documents,
          activeWearableStreams: ['Continuous SBP/DBP Cuff (Bluetooth LE)'],
          lastSyncTime: '2026-08-13 19:42:00'
        }
      },
      {
        phaseNumber: 3,
        id: 'phase-data-validation',
        title: 'Phase 3: Data Validation & Safety Gate',
        shortTitle: '3. Data Validation & Rules',
        category: 'Data & State',
        badge: 'Zero Silent Hallucination',
        color: '#FF6B35',
        bgColor: '#FFF0EB',
        icon: 'ShieldAlert',
        patientExperience: 'The system validates report integrity in seconds, flagging missing lab panels or medication conflicts before clinical interpretation begins.',
        developerImplementation: 'Raw Clinical Data Ingest → Deterministic Validation Engine (Missing values, Duplicate reports, Inconsistent ranges, Conflicting dates, Drug interactions).',
        keyRule: 'Core Architectural Law: NEVER allow the LLM to silently repair, fabricate, or assume missing clinical values. All ambiguities are strictly flagged or gated.',
        status: 'completed',
        dataPayload: {
          totalRulesEvaluated: 24,
          issuesFound: this.validationIssues.length,
          validationIssues: this.validationIssues,
          hardGatingPassed: true
        }
      },
      {
        phaseNumber: 4,
        id: 'phase-longitudinal-state',
        title: 'Phase 4: Longitudinal Patient State Engine',
        shortTitle: '4. Longitudinal State',
        category: 'Data & State',
        badge: '2023 → 2026 Timeline',
        color: '#3A86FF',
        bgColor: '#EFF6FF',
        icon: 'TrendingDown',
        patientExperience: 'A dynamic view of how health metrics have evolved over 3 years, highlighting significant deltas rather than isolated test results.',
        developerImplementation: 'Longitudinal State Service computes temporal gradients, velocity of biomarker changes (e.g. eGFR: 72 → 64 → 52), and medication timeline overlaps.',
        keyRule: 'Query Paradigm: Enables answering "What changed over time?" rather than merely "What is in this document?".',
        status: 'completed',
        dataPayload: {
          stateVersion: 'v1.4.2',
          biomarkerDeltas: [
            { marker: 'eGFR', 2024: 72, 2025: 64, 2026: 52, deltaPercent: -18.75, alert: 'CRITICAL_DECLINE' },
            { marker: 'Serum Creatinine', 2024: 0.98, 2025: 1.10, 2026: 1.38, deltaPercent: +25.4, alert: 'ABNORMAL_RISE' },
            { marker: 'Systolic BP', 2024: 128, 2025: 132, 2026: 142, deltaPercent: +7.5, alert: 'STAGE_1_HYPERTENSION' }
          ],
          activeDiagnosisCount: 3,
          activeMedicationCount: 3
        }
      },
      {
        phaseNumber: 5,
        id: 'phase-problem-clustering',
        title: 'Phase 5: Clinical Problem Clustering',
        shortTitle: '5. Problem Clustering',
        category: 'Intelligence & Reasoning',
        badge: 'Multi-Disciplinary Clusters',
        color: '#A855F7',
        bgColor: '#FAF5FF',
        icon: 'Layers',
        patientExperience: 'Health concerns are automatically grouped into clear, focused areas (e.g., Kidney & Heart, Medication Safety, Joint & Mobility).',
        developerImplementation: 'Clustering Engine applies semantic affinity and graph topological sorting to partition the patient graph into cardiorenal, metabolic, medication, and preventive clusters.',
        keyRule: 'Each clinical cluster binds specific biomarkers to specialist personas and guideline retrieval queries.',
        status: 'completed',
        dataPayload: {
          totalClusters: this.clusters.length,
          clusters: this.clusters
        }
      },
      {
        phaseNumber: 6,
        id: 'phase-evidence-rag',
        title: 'Phase 6: Evidence & Clinical Intelligence Engine (RAG)',
        shortTitle: '6. Evidence RAG Engine',
        category: 'Intelligence & Reasoning',
        badge: 'KDIGO & ACC/AHA Grounded',
        color: '#CCFF00',
        bgColor: '#F7FEE7',
        icon: 'BookOpen',
        patientExperience: 'All recommendations are backed by top-tier medical guidelines, ensuring trustworthy, scientifically backed decisions.',
        developerImplementation: 'Patient Data + Clinical Problem Cluster → Embedding Retriever → Peer-Reviewed Guideline Store (KDIGO, ACC/AHA, Beers Criteria) → Evidence Validator → Structured Grounded Insights.',
        keyRule: 'Never allow Patient Data → LLM → Free Unvalidated Text. Every insight must contain explicit guideline citations and confidence bounds.',
        status: 'completed',
        dataPayload: {
          retrievedGuidelines: this.evidenceItems,
          confidenceScore: 94.2,
          hallucinationRisk: '0.0% (Deterministic Constraint Gated)'
        }
      },
      {
        phaseNumber: 7,
        id: 'phase-safety-engine',
        title: 'Phase 7: Clinical Safety & Escalation Gate',
        shortTitle: '7. Safety Engine',
        category: 'Intelligence & Reasoning',
        badge: 'Hard Constraints Active',
        color: '#FF0055',
        bgColor: '#FFF1F2',
        icon: 'ShieldCheck',
        patientExperience: 'Real-time safety guardrails immediately detect dangerous symptom combinations and alert medical staff if emergency signs arise.',
        developerImplementation: 'Safety Constraint Engine enforces non-bypassable rules: Hemodynamic AKI trigger, emergency chest pain protocol, red-flag drug contraindication interceptor.',
        keyRule: 'Safety rules execute at the deterministic code layer, overriding any probabilistic LLM suggestion.',
        status: 'completed',
        dataPayload: {
          activeConstraints: [
            'RULE-AKI-01: Discontinue Ibuprofen immediately on eGFR < 60 + ACEi',
            'RULE-EMRG-02: Instant Clinician Escalation on acute dyspnea + chest pain',
            'RULE-MAX-03: Max daily acetaminophen capped at 2000mg for Stage 2 CKD'
          ],
          escalationState: 'NORMAL_SCREENING_ELIGIBLE'
        }
      },
      {
        phaseNumber: 8,
        id: 'phase-persona-engine',
        title: 'Phase 8: Specialist Persona Selection Registry',
        shortTitle: '8. Persona Selection',
        category: 'Clinical Interaction',
        badge: '4 Specialist Roles',
        color: '#FF70A6',
        bgColor: '#FFF0F7',
        icon: 'Users',
        patientExperience: 'Heal Engine selects the exact virtual specialist best suited for the patient\'s primary health situation.',
        developerImplementation: 'Persona Registry selects active specialist (Dr. Maya Lin for pharmacology, Dr. Aris Thorne for cardiorenal) based on cluster priority and clinical risk profile.',
        keyRule: 'Each persona defines exact clinical focus, tone, screening objectives, question templates, and escalation thresholds.',
        status: 'completed',
        dataPayload: {
          activeSpecialist: 'Dr. Aris Thorne, MD (Cardiorenal Nephrology)',
          consultingSpecialist: 'Dr. Maya Lin, PharmD (Clinical Pharmacology)',
          personaTone: 'Empathetic, Precise, Clinically Inquisitive',
          speechPitch: 0.95,
          speechRate: 1.0
        }
      },
      {
        phaseNumber: 9,
        id: 'phase-screening-orchestrator',
        title: 'Phase 9: Screening Plan Generation',
        shortTitle: '9. Screening Plan',
        category: 'Clinical Interaction',
        badge: 'Structured Branching',
        color: '#7000FF',
        bgColor: '#F5F3FF',
        icon: 'FileText',
        patientExperience: 'Before the conversation begins, the doctor prepares a clear, focused roadmap of specific questions.',
        developerImplementation: 'Screening Orchestrator compiles screening objective, priority inquiry queue, expected entity schemas, safety conditions, and dynamic follow-up branches.',
        keyRule: 'Prevents conversational drifting and ensures all high-risk diagnostic questions are asked systematically.',
        status: 'completed',
        dataPayload: {
          screeningObjective: 'Evaluate cardiorenal stability and correlate recent fatigue & leg swelling with Lisinopril + Ibuprofen interaction.',
          plannedQuestions: [
            'Question 1: Baseline functional changes & new fatigue onset over past 2 weeks.',
            'Question 2: Peripheral edema & breathing changes during exertion.',
            'Question 3: Frequency & timing of OTC Ibuprofen intake for knee joint pain.'
          ],
          expectedEntities: ['Symptom Name', 'Duration', 'Exertional Impact', 'Analgesic Dosage']
        }
      },
      {
        phaseNumber: 10,
        id: 'phase-virtual-doctor-ui',
        title: 'Phase 10: Virtual Doctor Video & Voice Screening Session',
        shortTitle: '10. Virtual Doctor UI',
        category: 'Clinical Interaction',
        badge: 'Avatar + TTS + Subtitles',
        color: '#00F5D4',
        bgColor: '#E6FFFA',
        icon: 'Video',
        patientExperience: 'An engaging face-to-face screening call with an animated virtual doctor who speaks clearly with synchronized subtitles and natural posture.',
        developerImplementation: 'Animated SVG Avatar + Web Speech API TTS + Webkit Speech Recognition STT + Real-time Lip-Sync and Posture State Reactor.',
        keyRule: 'Provide full accessibility: voice dialogue, real-time closed captions, and quick clickable response cards for instant interaction.',
        status: 'active',
        dataPayload: {
          doctorName: 'Dr. Aris Thorne',
          activeScript: 'Hello Eleanor, looking at your latest kidney function labs from this week, I noticed a change from your previous results. How have you been feeling over the last two weeks?',
          posture: 'inquisitive',
          avatarState: 'SPEAKING_SYNCHRONIZED'
        }
      },
      {
        phaseNumber: 11,
        id: 'phase-response-adaptive-loop',
        title: 'Phase 11: Patient Response Intelligence & Adaptive Screening Loop',
        shortTitle: '11. Response Intelligence',
        category: 'Clinical Interaction',
        badge: 'Core Intelligence Loop',
        color: '#FFE600',
        bgColor: '#FFFBEA',
        icon: 'Sparkles',
        patientExperience: 'The doctor genuinely understands what the patient says, extracts symptom duration, checks safety, and asks thoughtful follow-ups.',
        developerImplementation: 'Speech/Text → Intent Classifier → Clinical Entity Extractor → Longitudinal Correlation Engine → Safety Decision Matrix [Continue | Clarify | Escalate] → Next Safe Question.',
        keyRule: 'The Central Heal Engine Loop: Question → Understand → Correlate with Labs → Evaluate Safety → Decide Next Safe Action.',
        status: 'active',
        dataPayload: {
          samplePatientInput: 'I\'ve been feeling noticeably more tired for the last two weeks, and noticed some mild puffiness around my ankles.',
          extractedEntity: this.analyzePatientResponse('I\'ve been feeling noticeably more tired for the last two weeks, and noticed some mild puffiness around my ankles.'),
          decisionMatrix: {
            action: 'Continue Screening',
            confidence: 96.5,
            nextSafeQuestion: 'Understood, Eleanor. Let\'s look at your joint pain: how often have you taken Ibuprofen for your knee recently?'
          }
        }
      },
      {
        phaseNumber: 12,
        id: 'phase-clinical-handoff',
        title: 'Phase 12: Structured Clinical Handoff & Clinician Summary',
        shortTitle: '12. Clinical Handoff',
        category: 'Handoff & Monitoring',
        badge: 'EHR Ready Summary',
        color: '#3A86FF',
        bgColor: '#EFF6FF',
        icon: 'Stethoscope',
        patientExperience: 'A comprehensive summary is sent directly to the patient\'s actual physician with findings, evidence, and clear next steps.',
        developerImplementation: 'Clinical Handoff Service generates SOAP summary: Current concern, 3-year lab trajectory, confirmed medication conflict, uncertainty quantification, and recommended orders.',
        keyRule: 'Clinicians see WHY every conclusion was reached with evidence citations, never just a black-box AI output.',
        status: 'pending',
        dataPayload: {
          clinicianRecipient: 'Dr. Aris Thorne, MD (Cardiorenal)',
          chiefConcern: 'Hemodynamic AKI secondary to ACEi + NSAID dual insult; eGFR decreased to 52 mL/min.',
          recommendedOrders: [
            'Discontinue oral OTC Ibuprofen 400mg TID immediately.',
            'Prescribe Topical Diclofenac 1% gel for knee osteoarthritis analgesia.',
            'Repeat basic metabolic renal panel in 14 days to verify eGFR recovery.'
          ],
          uncertaintyScore: '4.2% (Very High Confidence)'
        }
      },
      {
        phaseNumber: 13,
        id: 'phase-monitoring-updates',
        title: 'Phase 13: Continuous Monitoring & Longitudinal State Update',
        shortTitle: '13. Continuous Loop',
        category: 'Handoff & Monitoring',
        badge: 'Care Loop Closed',
        color: '#CCFF00',
        bgColor: '#F7FEE7',
        icon: 'Activity',
        patientExperience: 'Heal Engine updates the patient profile, tracks recovery progress, sets daily medication reminders, and schedules the next check-in.',
        developerImplementation: 'Monitoring Service commits delta to Longitudinal Patient State (v1.4.2 → v1.4.3), adjusts daily goal parameters, and arms event listeners for next lab upload.',
        keyRule: 'Closes the longitudinal loop: Patient State Updated → Monitoring Active → Ready for Next Interaction.',
        status: 'pending',
        dataPayload: {
          updatedStateVersion: 'v1.4.3',
          nextScreeningDate: '2026-08-27 (14 days post-intervention)',
          activeCareReminders: [
            'Take Lisinopril 20mg every morning at 08:00 AM',
            'Apply Topical Gel to right knee 2x daily (No oral NSAIDs)',
            'Daily morning weight & ankle swelling log'
          ],
          loopStatus: 'CYCLE_COMPLETED_MONITORING_ACTIVE'
        }
      }
    ];
  }
}

export const endToEndWorkflowEngine = new EndToEndWorkflowEngine();
