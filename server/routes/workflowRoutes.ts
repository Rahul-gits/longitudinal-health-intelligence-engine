import { Router, Request, Response } from 'express';

const router = Router();

// 6-step care loop clinical pipeline simulation
export interface WorkflowStepResult {
  stepIndex: number;
  stepId: string;
  stepName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'ALERT';
  durationMs: number;
  confidenceScore: number;
  summary: string;
  keyFindings: string[];
  clinicalArtifacts: Record<string, any>;
  guidelineReferences: string[];
}

export const runFullClinicalWorkflow = (): { timestamp: string; patientId: string; overallStatus: string; steps: WorkflowStepResult[]; recommendation: any } => {
  const steps: WorkflowStepResult[] = [
    {
      stepIndex: 1,
      stepId: 'understand',
      stepName: 'Step 1: Understand (Longitudinal Ingestion & Entity Graph)',
      status: 'COMPLETED',
      durationMs: 42,
      confidenceScore: 0.98,
      summary: 'Ingested 48 clinical data points across EHR FHIR R4 feeds, home IoT scale, automated blood pressure cuff, and outpatient lab reports.',
      keyFindings: [
        'Extracted 5 active chronic conditions with cardiorenal overlap.',
        'Synchronized 6 active medication regimens with 94.2% mean adherence.',
        'Knowledge graph constructed: 24 active nodes, 38 causal edges relating Potassium -> eGFR -> Diuretic response.'
      ],
      clinicalArtifacts: {
        graphNodesCount: 24,
        graphEdgesCount: 38,
        dataFreshnessMinutes: 12
      },
      guidelineReferences: ['AHA/ACC/HFSA 2023 Heart Failure Guidelines', 'KDIGO 2024 Clinical Practice Guideline for Diabetes Management in CKD']
    },
    {
      stepIndex: 2,
      stepId: 'detect',
      stepName: 'Step 2: Detect (Anomaly & Decompensation Detection)',
      status: 'ALERT',
      durationMs: 65,
      confidenceScore: 0.96,
      summary: 'Detected acute sub-clinical volume overload and hyperkalemia hazard via longitudinal trajectory slope analysis.',
      keyFindings: [
        'Weight velocity: +3.2 kg over 96 hours (Threshold: > 1.5 kg in 48h).',
        'Serum Potassium trajectory: +0.6 mEq/L rise reaching 5.3 mEq/L (Critical threshold: >= 5.2 mEq/L with MRA therapy).',
        'NT-proBNP biomarker doubled to 840 pg/mL, signaling increasing left ventricular filling pressure.'
      ],
      clinicalArtifacts: {
        trajectorySlope: '+0.8 kg/day',
        riskLevel: 'HIGH_ACUTE_DECOMPENSATION',
        anomalyScore: 0.89
      },
      guidelineReferences: ['ESC 2023 Guidelines for Acute & Chronic Heart Failure']
    },
    {
      stepIndex: 3,
      stepId: 'explain',
      stepName: 'Step 3: Explain (Causal Attribution & SHAP Deconstruction)',
      status: 'COMPLETED',
      durationMs: 51,
      confidenceScore: 0.94,
      summary: 'Causal engine identifies dual driver: diminished renal clearance from CKD Stage 3b interacting with spironolactone retention and inadequate baseline diuretic dose.',
      keyFindings: [
        'SHAP Feature Importance: Weight slope (42%), Serum Potassium (28%), eGFR slope (18%), SBP (12%).',
        'Counterfactual analysis: Maintaining current Spironolactone + Furosemide 40mg projects 78% probability of emergency hospital presentation within 5 days.',
        'Patient-centric translation generated in simple non-medical terms.'
      ],
      clinicalArtifacts: {
        topCausalDriver: 'MRA-induced potassium retention under reduced eGFR (38 mL/min)',
        counterfactualRiskReduction: '-64% hospital risk if diuretic stepped up and MRA paused'
      },
      guidelineReferences: ['Nature Medicine 2024 Causal Clinical Decision Support Frameworks']
    },
    {
      stepIndex: 4,
      stepId: 'protect',
      stepName: 'Step 4: Protect (Hard Safety Boundaries & Constraint Shield)',
      status: 'COMPLETED',
      durationMs: 38,
      confidenceScore: 0.99,
      summary: 'Safety shield evaluated 4 prospective interventions against 14 hard clinical rules, preventing 2 unsafe drug escalations.',
      keyFindings: [
        'HARD STOP APPLIED: Blocked Spironolactone up-titration due to Potassium = 5.3 mEq/L and eGFR = 38 mL/min.',
        'SAFETY WARNING: Flagged Metformin use — close monitoring mandated as eGFR approaches 30 mL/min.',
        'NSAID BLOCK ACTIVE: Prevented inadvertent prescription of Ibuprofen for knee pain flare.'
      ],
      clinicalArtifacts: {
        hardStopsTriggered: 1,
        warningsTriggered: 1,
        safeInterventionValidated: true
      },
      guidelineReferences: ['Beers Criteria for Potentially Inappropriate Medication Use in Older Adults (2023)']
    },
    {
      stepIndex: 5,
      stepId: 'decide',
      stepName: 'Step 5: Decide (Multi-Agent Swarm Consensus & Prescriptive Action)',
      status: 'COMPLETED',
      durationMs: 88,
      confidenceScore: 0.95,
      summary: '5-agent clinical swarm reached high consensus (94.6%) on a balanced cardiorenal decongestion protocol.',
      keyFindings: [
        'Increase Furosemide to 60 mg PO daily for 3 consecutive days, then re-assess morning dry weight.',
        'Temporarily HOLD Spironolactone 25 mg until Potassium drops below 5.0 mEq/L.',
        'Continue Empagliflozin 10 mg (provides persistent renal and cardiovascular outcome benefit).',
        'Order stat repeat Basic Metabolic Panel (BMP) + electrolytes within 48 hours.'
      ],
      clinicalArtifacts: {
        consensusScore: 0.946,
        specialistAgreements: { cardiology: 0.98, nephrology: 0.95, pharmacy: 0.96, geriatrics: 0.92, patientAdvocate: 0.93 }
      },
      guidelineReferences: ['AHA/ACC 2022 Guidelines on SGLT2i & Diuretic Management']
    },
    {
      stepIndex: 6,
      stepId: 'monitor',
      stepName: 'Step 6: Monitor (Closed-Loop Telemetry & Safety Guardrails)',
      status: 'COMPLETED',
      durationMs: 30,
      confidenceScore: 0.97,
      summary: 'Activated high-frequency IoT scale & symptom polling callback loop with strict red-flag auto-escalation triggers.',
      keyFindings: [
        'Daily morning weight trigger: Alert clinician if weight does not drop >= 0.8 kg within 48 hours.',
        'Symptom survey dispatched: Orthopnea, PND, peripheral edema score check twice daily.',
        'Emergency 911 / On-Call escalation rule enabled for resting dyspnea or chest discomfort.'
      ],
      clinicalArtifacts: {
        callbackSchedule: 'Every 12 hours',
        telemetrySync: 'ACTIVE_BLUETOOTH_CELLULAR',
        escalationContact: 'Dr. Aris Thorne On-Call Cardiorenal Triage'
      },
      guidelineReferences: ['ATA Telehealth & Remote Patient Monitoring Clinical Standards']
    }
  ];

  return {
    timestamp: new Date().toISOString(),
    patientId: 'patient-ev-68',
    overallStatus: 'ACTION_REQUIRED_SAFE_PLAN_GENERATED',
    steps,
    recommendation: {
      actionTitle: 'Acute Cardiorenal Decongestion Protocol (Step 5 Consensus Plan)',
      actionSummary: 'Step up oral Furosemide to 60mg daily x 3 days, pause Spironolactone pending repeat BMP in 48 hours, maintain Empagliflozin.',
      priority: 'URGENT',
      physicianReviewRequired: true,
      patientActionSummary: 'Take 1.5 tablets of water pill (Furosemide 60mg) in morning. Hold the small white pill (Spironolactone) for 2 days. Weigh yourself every morning before breakfast.'
    }
  };
};

// POST /api/workflow/run
router.post('/run', (_req: Request, res: Response) => {
  const result = runFullClinicalWorkflow();
  res.json({
    success: true,
    workflow: result
  });
});

// GET /api/workflow/status/:patientId
router.get('/status/:patientId', (req: Request, res: Response) => {
  const result = runFullClinicalWorkflow();
  res.json({
    success: true,
    patientId: req.params.patientId,
    workflow: result
  });
});

// POST /api/workflow/step/:stepName
router.post('/step/:stepName', (req: Request, res: Response) => {
  const stepName = Array.isArray(req.params.stepName) ? req.params.stepName[0] : (req.params.stepName || '');
  const full = runFullClinicalWorkflow();
  const step = full.steps.find(s => s.stepId.toLowerCase() === String(stepName).toLowerCase());
  
  if (!step) {
    return res.status(404).json({ success: false, error: `Step '${stepName}' not found in 6-step care loop.` });
  }

  return res.json({
    success: true,
    step,
    executedAt: new Date().toISOString()
  });
});

export default router;
