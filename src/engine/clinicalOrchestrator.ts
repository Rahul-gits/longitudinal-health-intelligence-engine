import { 
  PatientClinicalState, 
  DecisionSynthesisResult, 
  DataIntegrityAlert, 
  SafetyCheckResult, 
  GoalTradeoff, 
  ModuleContract,
  StructuredModuleOutput,
  CandidateAlternative,
  WhyNotAlternative,
  DecisionChangeTrigger,
  WhatIfSimInput,
  WhatIfSimResult
} from '../types/health';
import { dataIntegrityEngine } from './dataIntegrityEngine';
import { patientStateEngine } from './patientStateEngine';
import { clinicalGoalEngine } from './clinicalGoalEngine';
import { goalConflictEngine } from './goalConflictEngine';
import { evidenceIntelligenceEngine } from './evidenceIntelligenceEngine';
import { safetyConstraintEngine } from './safetyConstraintEngine';
import { knowledgeGraphEngine } from './knowledgeGraphEngine';

export class ClinicalOrchestrator {
  private moduleContracts: ModuleContract[] = [
    {
      moduleId: 'triage',
      name: 'Triage AI Module',
      responsibility: 'Acute risk stratification & immediate decompensation warning',
      expectedInput: ['Vitals Telemetry', 'Acute Symptom Logs'],
      outputFormat: 'Risk Alert Index & Escalation Level',
      constraintsEnforced: ['Response latency < 2 sec', 'Zero unacknowledged red flags']
    },
    {
      moduleId: 'data_integrity',
      name: 'Data Integrity & Validation Module',
      responsibility: 'Pre-reasoning data conflict, stale record, and missing timestamp detection',
      expectedInput: ['Raw EHR Data', 'Wearable Telemetry', 'Lab Reports'],
      outputFormat: 'Trusted Patient State & Data Integrity Alerts',
      constraintsEnforced: ['Physiological bound checks', 'Validity period expiration']
    },
    {
      moduleId: 'medication',
      name: 'Medication Safety Module',
      responsibility: 'Pharmacovigilance, drug-drug interaction detection, deprescribing options',
      expectedInput: ['Active Medication List', 'Renal Panel Labs', 'Allergy List'],
      outputFormat: 'Interaction Risk Score & Safe Analgesic Alternatives',
      constraintsEnforced: ['Zero nephrotoxic co-prescriptions', 'CYP2C9 clearance dosing']
    },
    {
      moduleId: 'nephrology',
      name: 'Nephrology Clinical Module',
      responsibility: 'Renal filtration rate tracking & glomerular hemodynamic balance',
      expectedInput: ['Serum Creatinine', 'eGFR Trend', 'ACEi/ARB Prescriptions'],
      outputFormat: 'eGFR Decompensation Risk & Fluid Balance Plan',
      constraintsEnforced: ['Alert if eGFR drops > 15%', 'Discontinue systemic NSAIDs']
    },
    {
      moduleId: 'ethics',
      name: 'Bioethics & Quality of Life Module',
      responsibility: 'Shared decision-making, patient autonomy, and pain management quality of life',
      expectedInput: ['Pain Scale Diary', 'Mobility Step Count', 'Patient Functional Goals'],
      outputFormat: 'Pain Relief Attainment & Non-Toxic Analgesic Proposal',
      constraintsEnforced: ['Do not remove analgesia without safe alternative']
    }
  ];

  /**
   * Closed-Loop Clinical Orchestration Pipeline Execution:
   * Patient State v[N] -> Clinical Goals -> Specialized Modules (Structured) -> Candidate Interventions ->
   * Safety Constraints -> Goal Conflict Analysis -> Evidence Verification -> Decision Synthesis -> Clinician Review
   */
  public runPipeline(): {
    patientState: PatientClinicalState;
    dataIntegrityAlerts: DataIntegrityAlert[];
    structuredModuleOutputs: StructuredModuleOutput[];
    goalConflicts: GoalTradeoff[];
    synthesisResult: DecisionSynthesisResult;
    moduleContracts: ModuleContract[];
  } {
    // 1. Ingest Versioned Patient Clinical State
    const patientState = patientStateEngine.getPatientState();

    // 2. Pre-Reasoning Data Integrity Check
    const integrityResult = dataIntegrityEngine.validatePatientState(patientState);

    // 3. Specialized Clinical Intelligence Modules (Structured Schema)
    const structuredModuleOutputs: StructuredModuleOutput[] = [
      {
        moduleId: 'triage',
        moduleName: 'Acute Triage Module',
        finding: 'Decompensation Warning: eGFR dropped 18.7% to 52 mL/min with NT-proBNP elevation (480 pg/mL).',
        riskLevel: 'HIGH',
        primaryGoal: 'Prevent Acute Kidney Injury progression & fluid overload',
        candidateRecommendation: 'Urgent renal panel draw & cardiac ultrasound',
        evidenceCitation: 'KDIGO 2023 Acute Decompensation Criteria',
        confidenceScore: 94,
        constraintsEnforced: ['Response latency < 2 sec'],
        goalConflictsIdentified: ['Pain Relief vs Renal Preservation']
      },
      {
        moduleId: 'nephrology',
        moduleName: 'Nephrology Clinical Module',
        finding: 'Hemodynamic Prerenal Insufficiency: Lisinopril (efferent) + Ibuprofen (afferent) constrictive collision.',
        riskLevel: 'CRITICAL',
        primaryGoal: 'Halt systemic NSAID exposure immediately',
        candidateRecommendation: 'Cease OTC Ibuprofen; transition to non-systemic topical therapy',
        evidenceCitation: 'KDIGO Clinical Practice Guideline for CKD (Section 4.2)',
        confidenceScore: 98,
        constraintsEnforced: ['Discontinue systemic NSAIDs if eGFR < 60'],
        goalConflictsIdentified: ['Renal Preservation vs Analgesia']
      },
      {
        moduleId: 'medication',
        moduleName: 'Pharmacology Safety Module',
        finding: 'CYP2C9*3 Intermediate Metabolizer status delays Ibuprofen systemic clearance by ~50%.',
        riskLevel: 'HIGH',
        primaryGoal: 'Deprescribe nephrotoxic OTC agents',
        candidateRecommendation: 'Substitute Topical 5% Lidocaine Patch PRN',
        evidenceCitation: 'CPIC Guideline for NSAIDs & CYP2C9 Genotypes',
        confidenceScore: 92,
        constraintsEnforced: ['CYP2C9 clearance dosing constraint'],
        goalConflictsIdentified: ['Medication Benefit vs Toxicity']
      }
    ];

    // 4. Clinical Goal Conflict Analysis (Knowledge Graph Traversal)
    const goalConflicts = goalConflictEngine.getGoalConflicts();

    // 5. Candidate Alternatives Generation ("What could we do?")
    const candidateAlternatives: CandidateAlternative[] = [
      {
        id: 'alt-1',
        title: 'Topical 5% Lidocaine Patch',
        description: 'Apply 1 patch to right knee q12h PRN. Provides targeted sodium channel blockade with <3% systemic absorption.',
        category: 'Topical Analgesic',
        selectionCriteria: 'Recommended for localized osteoarthritic knee pain in patients with Stage 2+ CKD taking ACE Inhibitors.',
        evidenceGrade: 'High (Level A)',
        riskProfile: 'Negligible renal clearance burden; minor localized skin erythema risk.'
      },
      {
        id: 'alt-2',
        title: 'Topical Capsaicin 0.025% Cream',
        description: 'Apply 3-4 times daily to right knee joint. Depletes Substance P in peripheral nociceptive fibers.',
        category: 'Topical Analgesic',
        selectionCriteria: 'Alternative non-systemic option if patient experiences lidocaine adhesive sensitivity.',
        evidenceGrade: 'Moderate (Level B)',
        riskProfile: 'Zero systemic renal toxicity; transient local burning sensation upon initial application.',
        
      },
      {
        id: 'alt-3',
        title: 'Targeted Physical Therapy & Hydrotherapy',
        description: 'Initiate 6-week structured quadriceps strengthening & non-weight-bearing aquatic exercise program.',
        category: 'Physical Therapy',
        selectionCriteria: 'Long-term functional joint stabilization & pain reduction without pharmacotherapy.',
        evidenceGrade: 'High (Level A)',
        riskProfile: 'Zero pharmacological side effects; requires active patient adherence.'
      }
    ];

    // 6. Rejected Alternatives ("Why NOT?")
    const whyNotAlternatives: WhyNotAlternative[] = [
      {
        id: 'whynot-1',
        title: 'Continue OTC Oral Ibuprofen (400mg TID)',
        category: 'Systemic NSAID',
        whyRejectedReason: 'Triggered Hard Safety Constraint: Induces afferent arteriolar constriction. Combined with Lisinopril, causes acute prerenal GFR failure ("Triple Whammy" hazard).',
        safetyRiskLevel: 'CRITICAL',
        competingGoalFriction: 'Directly violates Renal Preservation goal (100% friction score).'
      },
      {
        id: 'whynot-2',
        title: 'Oral Celecoxib (200mg Daily)',
        category: 'COX-2 Selective NSAID',
        whyRejectedReason: 'Rejected due to persistent COX-2 renal medullary expression. COX-2 inhibitors carry equal renal vasoconstriction risks in baseline Stage 2 CKD.',
        safetyRiskLevel: 'HIGH',
        competingGoalFriction: 'Elevates fluid retention & blood pressure (conflicts with Cardiology goal).'
      },
      {
        id: 'whynot-3',
        title: 'Oral Opioids (Tramadol 50mg PRN)',
        category: 'Opioid Analgesic',
        whyRejectedReason: 'Avoided due to fall risk in 68-year-old female, sedation, constipation, and non-alignment with functional mobility goals.',
        safetyRiskLevel: 'MODERATE',
        competingGoalFriction: 'Conflicts with Bioethics & Quality of Life functional goals.'
      }
    ];

    // 7. Decision Change Triggers ("What would change this decision?")
    const decisionChangeTriggers: DecisionChangeTrigger[] = [
      {
        id: 'trig-1',
        metricOrCondition: 'eGFR Recovery',
        currentStatus: '52 mL/min (Decreased)',
        targetThreshold: '> 60 mL/min for 3 consecutive months',
        triggerAction: 'Re-evaluate short-course low-dose oral analgesia under nephrology surveillance.'
      },
      {
        id: 'trig-2',
        metricOrCondition: 'Systolic Blood Pressure',
        currentStatus: '138 mmHg',
        targetThreshold: '< 110 mmHg',
        triggerAction: 'Reassess Lisinopril dosage to prevent hypotensive renal hypoperfusion.'
      },
      {
        id: 'trig-3',
        metricOrCondition: 'Localized Knee Swelling',
        currentStatus: 'Moderate Joint Effusion',
        targetThreshold: 'Worsening pain with effusion',
        triggerAction: 'Consider orthopedic intra-articular corticosteroid or hyaluronic acid injection.'
      }
    ];

    // 8. Deterministic Safety Constraints Engine Check ("What is safe?")
    const candidateRecommendation = 'Discontinue OTC Oral Ibuprofen 400mg; review non-systemic topical candidate alternatives (Topical 5% Lidocaine Patch); order 7-day follow-up renal panel & baseline Echocardiogram.';
    const safetyResult = safetyConstraintEngine.evaluateIntervention(candidateRecommendation, patientState);

    // 9. Evidence Intelligence RAG Verification
    const evidenceChain = evidenceIntelligenceEngine.getEvidenceForRecommendation(candidateRecommendation);

    // 10. Decision Synthesis & Missing Data Identification
    const synthesisResult: DecisionSynthesisResult = {
      overallRiskLevel: 'HIGH',
      primaryRecommendation: candidateRecommendation,
      candidateAlternatives,
      whyNotAlternatives,
      decisionChangeTriggers,
      missingDataAlerts: [
        'Recent Urine Albumin-to-Creatinine Ratio (UACR) lab value pending (>6 months old).',
        '2D Echocardiography left ventricular ejection fraction report pending.'
      ],
      evidenceChain,
      safetyResult,
      clinicianActionStatus: 'PENDING_REVIEW',
      stateVersionId: patientState.versionId,
      timestamp: new Date().toLocaleString()
    };

    return {
      patientState,
      dataIntegrityAlerts: integrityResult.alerts,
      structuredModuleOutputs,
      goalConflicts,
      synthesisResult,
      moduleContracts: this.moduleContracts
    };
  }

  /**
   * Re-run Impact Engine / What-If Simulation
   */
  public runWhatIfSimulation(input: WhatIfSimInput): WhatIfSimResult {
    const baselineEgfr = input.modifiedEgfr !== undefined ? input.modifiedEgfr : 52;
    const isNSAIDActive = input.modifiedDrug ? input.modifiedDrug.toLowerCase().includes('ibuprofen') : false;

    if (baselineEgfr >= 60 && !isNSAIDActive) {
      return {
        simulatedRecommendation: 'eGFR recovered to normal baseline (>60 mL/min). Renal pressure stabilized. Continue current regimen with topical analgesia PRN.',
        simulatedSafetyStatus: 'SAFE',
        deltaRiskLevel: 'DECREASED',
        explanation: 'Hemodynamic arteriolar constriction resolved. Renal filtration rate cleared for standard clinical monitoring.'
      };
    } else if (isNSAIDActive && baselineEgfr < 60) {
      return {
        simulatedRecommendation: 'HARD BLOCK MAINTAINED: Re-introducing oral Ibuprofen at eGFR ' + baselineEgfr + ' mL/min triggers immediate renal decompensation risk.',
        simulatedSafetyStatus: 'BLOCKED',
        deltaRiskLevel: 'ELEVATED',
        explanation: 'ACEi + NSAID co-administration under reduced eGFR maintains active Triple-Whammy hazard.'
      };
    }

    return {
      simulatedRecommendation: 'Modifications result in stable cardiorenal profile. Maintain non-nephrotoxic analgesic candidate alternatives.',
      simulatedSafetyStatus: 'SAFE',
      deltaRiskLevel: 'UNCHANGED',
      explanation: 'Simulated parameters keep patient within safe operating boundaries.'
    };
  }

  public getModuleContracts(): ModuleContract[] {
    return this.moduleContracts;
  }
}

export const clinicalOrchestrator = new ClinicalOrchestrator();
