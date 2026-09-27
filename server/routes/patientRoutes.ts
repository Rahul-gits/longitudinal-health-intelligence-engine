import { Router, Request, Response } from 'express';
import { broadcastWorkflowEvent } from './workflowRoutes';

const router = Router();

// Canonical In-Memory Patient State Store (Backed by PostgreSQL & TimescaleDB schema in production)
interface CanonicalPatientState {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  conditions: Array<{ name: string; stage: string; onset: string; status: 'ACTIVE' | 'RESOLVED' }>;
  activeMedications: Array<{ drug: string; dose: string; freq: string; adherence: number; indication: string }>;
  biomarkers: Array<{ marker: string; baseline: number; current: number; unit: string; trend: 'declining' | 'stable' | 'improving' }>;
  allergies: Array<{ allergen: string; severity: string; reaction: string }>;
  vitals: { sbp: number; dbp: number; heartRate: number; weightLbs: number };
}

interface CarePlanTask {
  id: string;
  title: string;
  timeOfDay: string;
  category: 'MEDICATION' | 'TELEMETRY' | 'SYMPTOM_SURVEY' | 'LIFESTYLE';
  completed: boolean;
  dueDate: string;
}

interface FollowUpAppointment {
  id: string;
  title: string;
  specialty: string;
  clinicianName: string;
  scheduledDate: string;
  purpose: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'PENDING_RESULTS';
}

interface ClinicianDecisionRecord {
  decisionId: string;
  clinicianId: string;
  clinicianName: string;
  action: 'APPROVED' | 'MODIFIED' | 'REJECTED';
  candidateChosen: string;
  rationaleNotes: string;
  signedAt: string;
  ledgerTxId: string;
}

const canonicalPatients: Map<string, CanonicalPatientState> = new Map([
  [
    'patient-ev-68',
    {
      patientId: 'patient-ev-68',
      name: 'Eleanor Vance',
      age: 68,
      gender: 'Female',
      dob: '1958-03-14',
      conditions: [
        { name: 'Chronic Kidney Disease', stage: 'Stage 3b (eGFR 39 mL/min)', onset: '2023-04', status: 'ACTIVE' },
        { name: 'Essential Hypertension', stage: 'Stage 1 (Controlled)', onset: '2019-11', status: 'ACTIVE' },
        { name: 'Osteoarthritis', stage: 'Bilateral Knees', onset: '2021-08', status: 'ACTIVE' },
        { name: 'Type 2 Diabetes Mellitus', stage: 'Mild (HbA1c 6.8%)', onset: '2022-01', status: 'ACTIVE' }
      ],
      activeMedications: [
        { drug: 'Lisinopril', dose: '20mg', freq: 'Daily morning', adherence: 94, indication: 'Hypertension & Renoprotection' },
        { drug: 'Empagliflozin', dose: '10mg', freq: 'Daily morning', adherence: 96, indication: 'Cardiorenal Risk Reduction' },
        { drug: 'Metformin', dose: '500mg', freq: 'Daily with dinner', adherence: 92, indication: 'Type 2 Diabetes' },
        { drug: 'Atorvastatin', dose: '20mg', freq: 'Daily bedtime', adherence: 95, indication: 'Lipid Management' }
      ],
      biomarkers: [
        { marker: 'eGFR', baseline: 64, current: 52, unit: 'mL/min/1.73m²', trend: 'declining' },
        { marker: 'Serum Creatinine', baseline: 1.10, current: 1.38, unit: 'mg/dL', trend: 'declining' },
        { marker: 'Serum Potassium', baseline: 4.4, current: 4.8, unit: 'mEq/L', trend: 'stable' },
        { marker: 'Blood Pressure (SBP)', baseline: 128, current: 126, unit: 'mmHg', trend: 'stable' }
      ],
      allergies: [
        { allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Hives & Wheezing' },
        { allergen: 'Sulfa Drugs', severity: 'MODERATE', reaction: 'Rash' }
      ],
      vitals: { sbp: 126, dbp: 82, heartRate: 74, weightLbs: 158.4 }
    }
  ]
]);

// Active Care Plans
const activeCarePlans: Map<string, {
  tasks: CarePlanTask[];
  followUps: FollowUpAppointment[];
  latestDecision?: ClinicianDecisionRecord;
  doctorSummaryNote: string;
}> = new Map([
  [
    'patient-ev-68',
    {
      doctorSummaryNote: 'Discontinue systemic oral NSAIDs (Ibuprofen) due to acute eGFR decline. Transition to topical Diclofenac 1% gel PRN. Repeat renal panel in 7 days.',
      tasks: [
        { id: 'task-1', title: 'Take Lisinopril 20mg with breakfast', timeOfDay: 'Morning', category: 'MEDICATION', completed: true, dueDate: 'Today' },
        { id: 'task-2', title: 'Check morning weight on smart scale', timeOfDay: 'Morning', category: 'TELEMETRY', completed: true, dueDate: 'Today' },
        { id: 'task-3', title: 'Apply Topical Diclofenac 1% gel to right knee (Pause Advil)', timeOfDay: 'Afternoon', category: 'MEDICATION', completed: false, dueDate: 'Today' },
        { id: 'task-4', title: 'Hydration goal: 6 to 8 glasses of water', timeOfDay: 'Evening', category: 'LIFESTYLE', completed: false, dueDate: 'Today' }
      ],
      followUps: [
        {
          id: 'fu-1',
          title: 'Repeat Renal Function Panel (BMP & eGFR)',
          specialty: 'Outpatient Laboratory',
          clinicianName: 'Dr. Aris Thorne',
          scheduledDate: 'August 20, 2026',
          purpose: 'Verify eGFR reversibility after stopping systemic NSAID',
          status: 'SCHEDULED'
        },
        {
          id: 'fu-2',
          title: 'Virtual Cardiorenal Follow-Up Dialogue',
          specialty: 'Virtual Specialist Clinic',
          clinicianName: 'Dr. Aris Thorne',
          scheduledDate: 'August 27, 2026',
          purpose: 'Assess knee comfort and review repeat creatinine lab results',
          status: 'SCHEDULED'
        }
      ]
    }
  ]
]);

// GET /api/patient/:id/state
router.get('/:id/state', (req: Request, res: Response) => {
  const patient = canonicalPatients.get(req.params.id as string) || canonicalPatients.get('patient-ev-68')!;
  return res.json({ success: true, patient });
});

// GET /api/patient/:id/attention
router.get('/:id/attention', (req: Request, res: Response) => {
  const patient = canonicalPatients.get(req.params.id as string) || canonicalPatients.get('patient-ev-68')!;
  const plan = activeCarePlans.get(patient.patientId);

  const attentionItems = [
    {
      id: 'att-1',
      title: 'Knee Pain Medication Safety Check',
      description: 'Your recent blood work shows your kidneys are sensitive. Please pause over-the-counter pain pills (like Advil or Ibuprofen) until you discuss a gentler topical option with Dr. Thorne.',
      severity: 'WARNING',
      actionType: 'TALK_TO_VIRTUAL_SPECIALIST',
      category: 'Medication Safety'
    },
    {
      id: 'att-2',
      title: 'Hydration & Blood Pressure Check',
      description: 'Morning blood pressure readings are steady at 126/82. Remember to drink 6 to 8 glasses of water daily and take your Lisinopril with breakfast.',
      severity: 'INFO',
      actionType: 'VIEW_TIMELINE',
      category: 'Maintenance'
    }
  ];

  return res.json({
    success: true,
    totalItems: attentionItems.length,
    doctorNote: plan?.doctorSummaryNote,
    attentionItems
  });
});

// GET /api/patient/:id/timeline
router.get('/:id/timeline', (req: Request, res: Response) => {
  const timelineEvents = [
    {
      id: 'evt-1',
      date: 'August 13, 2026',
      title: 'Outpatient Comprehensive Metabolic Panel (St. Jude Health)',
      category: 'LAB_RESULT',
      summary: 'Serum Creatinine increased to 1.38 mg/dL; eGFR declined from 64 to 52 mL/min (-18.7%).',
      clinicianBadge: 'Validated by Dr. Thorne',
      tags: ['Renal', 'eGFR', 'Creatinine']
    },
    {
      id: 'evt-2',
      date: 'August 10, 2026',
      title: 'Reported Right Knee Osteoarthritis Flare',
      category: 'PATIENT_REPORT',
      summary: 'Patient logged moderate knee stiffness and initiated over-the-counter Ibuprofen 600mg TID.',
      clinicianBadge: 'Logged via Portal',
      tags: ['Symptom', 'NSAID', 'Joint']
    },
    {
      id: 'evt-3',
      date: 'July 15, 2026',
      title: 'Routine Cardiorenal Clinic Visit',
      category: 'ENCOUNTER',
      summary: 'Stable blood pressure on Lisinopril 20mg. Normal renal baseline eGFR 64 mL/min.',
      clinicianBadge: 'Dr. Aris Thorne',
      tags: ['Visit', 'Baseline', 'Stable']
    }
  ];

  return res.json({ success: true, count: timelineEvents.length, timeline: timelineEvents });
});

// GET /api/patient/:id/care-plan
router.get('/:id/care-plan', (req: Request, res: Response) => {
  const patientId = (req.params.id as string) || 'patient-ev-68';
  const plan = activeCarePlans.get(patientId) || activeCarePlans.get('patient-ev-68')!;
  return res.json({ success: true, carePlan: plan });
});

// POST /api/patient/:id/care-plan/decision (Clinician Human-In-The-Loop Decision)
router.post('/:id/care-plan/decision', (req: Request, res: Response) => {
  const patientId = (req.params.id as string) || 'patient-ev-68';
  const { action, candidateChosen, rationaleNotes, clinicianName } = req.body;

  const plan = activeCarePlans.get(patientId);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Care plan not found' });
  }

  const decisionRecord: ClinicianDecisionRecord = {
    decisionId: `dec-${Date.now().toString(36)}`,
    clinicianId: 'dr-aris-thorne',
    clinicianName: clinicianName || 'Dr. Aris Thorne, MD',
    action: action || 'APPROVED',
    candidateChosen: candidateChosen || 'Topical Diclofenac 1% Gel PRN',
    rationaleNotes: rationaleNotes || 'Approved safe topical alternative; ordered 7-day repeat renal panel.',
    signedAt: new Date().toISOString(),
    ledgerTxId: `tx-worm-hash-${Math.random().toString(36).substring(2, 10)}`
  };

  plan.latestDecision = decisionRecord;
  plan.doctorSummaryNote = `Physician Decision (${decisionRecord.action}): Selected "${decisionRecord.candidateChosen}". ${decisionRecord.rationaleNotes}`;

  // Broadcast real-time SSE event to all connected patient & clinician clients
  broadcastWorkflowEvent(
    'CLINICIAN_DECISION_RECORDED',
    {
      patientId,
      decision: decisionRecord,
      message: `Dr. Thorne has signed your updated care plan: ${decisionRecord.candidateChosen}`
    },
    patientId
  );

  return res.json({
    success: true,
    message: 'Clinician decision successfully recorded in immutable audit ledger.',
    decision: decisionRecord,
    updatedCarePlan: plan
  });
});

// POST /api/patient/:id/care-plan/task/toggle
router.post('/:id/care-plan/task/toggle', (req: Request, res: Response) => {
  const patientId = (req.params.id as string) || 'patient-ev-68';
  const { taskId } = req.body;

  const plan = activeCarePlans.get(patientId);
  if (!plan) return res.status(404).json({ success: false, error: 'Care plan not found' });

  const task = plan.tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

  task.completed = !task.completed;

  broadcastWorkflowEvent('TASK_STATUS_CHANGED', { patientId, taskId, completed: task.completed }, patientId);
  return res.json({ success: true, task });
});

export default router;
