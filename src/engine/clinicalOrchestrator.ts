import { 
  PatientClinicalState, 
  DecisionSynthesisResult, 
  DataIntegrityAlert, 
  SafetyCheckResult, 
  GoalTradeoff, 
  ModuleContract 
} from '../types/health';
import { dataIntegrityEngine } from './dataIntegrityEngine';
import { patientStateEngine } from './patientStateEngine';
import { clinicalGoalEngine } from './clinicalGoalEngine';
import { goalConflictEngine } from './goalConflictEngine';
import { evidenceIntelligenceEngine } from './evidenceIntelligenceEngine';
import { safetyConstraintEngine } from './safetyConstraintEngine';

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
   * Linear master pipeline execution:
   * Data Integrity -> Patient Clinical State -> Clinical Goals -> Specialized Modules -> Goal Conflict -> Evidence -> Safety Engine -> Decision Synthesis
   */
  public runPipeline(): {
    patientState: PatientClinicalState;
    dataIntegrityAlerts: DataIntegrityAlert[];
    goalConflicts: GoalTradeoff[];
    synthesisResult: DecisionSynthesisResult;
    moduleContracts: ModuleContract[];
  } {
    // Step 1: Ingest Patient Clinical State
    const patientState = patientStateEngine.getPatientState();

    // Step 2: Run Data Integrity Validation
    const integrityResult = dataIntegrityEngine.validatePatientState(patientState);

    // Step 3: Fetch Clinical Goals & Goal Conflict Analysis
    const goalConflicts = goalConflictEngine.getGoalConflicts();

    // Step 4: Candidate Recommendation Generation
    const candidateRecommendation = 'Discontinue OTC Oral Ibuprofen 400mg; initiate Topical 5% Lidocaine Patch PRN for knee analgesia; order 7-day follow-up renal panel & baseline Echocardiogram.';

    // Step 5: Evidence Intelligence RAG Verification
    const evidenceChain = evidenceIntelligenceEngine.getEvidenceForRecommendation(candidateRecommendation);

    // Step 6: Hard Safety Constraint Engine Check
    const safetyResult = safetyConstraintEngine.evaluateIntervention(candidateRecommendation, patientState);

    // Step 7: Decision Synthesis
    const synthesisResult: DecisionSynthesisResult = {
      overallRiskLevel: 'HIGH',
      primaryRecommendation: candidateRecommendation,
      safeAlternatives: [
        'Topical 5% Lidocaine Patch (apply 1 patch to right knee q12h PRN)',
        'Topical Capsaicin 0.025% Cream',
        'Physical Therapy Consultation for joint stabilization'
      ],
      evidenceChain,
      safetyResult,
      clinicianActionStatus: 'PENDING_REVIEW',
      timestamp: new Date().toLocaleString()
    };

    return {
      patientState,
      dataIntegrityAlerts: integrityResult.alerts,
      goalConflicts,
      synthesisResult,
      moduleContracts: this.moduleContracts
    };
  }

  public getModuleContracts(): ModuleContract[] {
    return this.moduleContracts;
  }
}

export const clinicalOrchestrator = new ClinicalOrchestrator();
