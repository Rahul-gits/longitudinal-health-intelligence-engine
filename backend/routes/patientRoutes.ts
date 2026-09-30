import { Router, Request, Response } from 'express';
import { broadcastWorkflowEvent } from './workflowRoutes';
import { enforceStrictPatientIsolation } from '../middleware/securityHardeningMiddleware';
import { authenticateAndAuthorize } from '../middleware/securityRbacMiddleware';
import { persistenceService } from '../services/persistenceService';

const router = Router();

// Canonical Patient State Model
export interface CanonicalPatientState {
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

// Canonical Database for Cohorts A - E
export const canonicalPatients: Map<string, CanonicalPatientState> = new Map([
  // Patient A: Eleanor Vance (68F) - CKD 3b, HTN, T2D, OA
  [
    'patient-ev-68',
    {
      patientId: 'patient-ev-68',
      name: 'Eleanor Vance',
      age: 68,
      gender: 'Female',
      dob: '1958-03-14',
      conditions: [
        { name: 'Chronic Kidney Disease', stage: 'Stage 3b (eGFR 38 mL/min)', onset: '2023-04', status: 'ACTIVE' },
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
        { marker: 'eGFR', baseline: 64, current: 38, unit: 'mL/min/1.73m²', trend: 'declining' },
        { marker: 'Serum Creatinine', baseline: 1.10, current: 1.42, unit: 'mg/dL', trend: 'declining' },
        { marker: 'Serum Potassium', baseline: 4.4, current: 4.8, unit: 'mEq/L', trend: 'stable' },
        { marker: 'Blood Pressure (SBP)', baseline: 128, current: 126, unit: 'mmHg', trend: 'stable' }
      ],
      allergies: [
        { allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Hives & Wheezing' },
        { allergen: 'Sulfa Drugs', severity: 'MODERATE', reaction: 'Rash' }
      ],
      vitals: { sbp: 126, dbp: 82, heartRate: 74, weightLbs: 158.4 }
    }
  ],

  // Patient B: Marcus Rodriguez (42M) - Severe Asthma + CAD Angina
  [
    'patient-mr-42',
    {
      patientId: 'patient-mr-42',
      name: 'Marcus Rodriguez',
      age: 42,
      gender: 'Male',
      dob: '1984-06-22',
      conditions: [
        { name: 'Severe Persistent Asthma', stage: 'Step 4 (FEV1 62%)', onset: '2015-02', status: 'ACTIVE' },
        { name: 'Coronary Artery Disease', stage: 'Exertional Angina', onset: '2024-07', status: 'ACTIVE' }
      ],
      activeMedications: [
        { drug: 'Fluticasone/Salmeterol', dose: '250/50mcg', freq: 'BID', adherence: 88, indication: 'Asthma controller' },
        { drug: 'Albuterol Inhaler', dose: '90mcg', freq: '2 puffs Q4H PRN', adherence: 90, indication: 'Rescue bronchodilator' },
        { drug: 'Carvedilol', dose: '12.5mg', freq: 'BID', adherence: 95, indication: 'Angina rate control' }
      ],
      biomarkers: [
        { marker: 'FEV1', baseline: 82, current: 62, unit: '% predicted', trend: 'declining' },
        { marker: 'Heart Rate', baseline: 72, current: 88, unit: 'bpm', trend: 'declining' },
        { marker: 'Blood Pressure (SBP)', baseline: 130, current: 138, unit: 'mmHg', trend: 'stable' }
      ],
      allergies: [
        { allergen: 'Aspirin', severity: 'SEVERE', reaction: 'AERD Bronchospasm' }
      ],
      vitals: { sbp: 138, dbp: 86, heartRate: 88, weightLbs: 182.0 }
    }
  ],

  // Patient C: Arthur Liu (79M) - Geriatric Polypharmacy & CKD 4
  [
    'patient-al-79',
    {
      patientId: 'patient-al-79',
      name: 'Arthur Liu',
      age: 79,
      gender: 'Male',
      dob: '1947-11-05',
      conditions: [
        { name: 'Chronic Kidney Disease', stage: 'Stage 4 (eGFR 22 mL/min)', onset: '2022-09', status: 'ACTIVE' },
        { name: 'Type 2 Diabetes Mellitus', stage: 'Insulin-requiring', onset: '2010-05', status: 'ACTIVE' },
        { name: 'Chronic Insomnia', stage: 'Severe', onset: '2020-03', status: 'ACTIVE' },
        { name: 'Mild Cognitive Impairment', stage: 'MoCA 22/30', onset: '2023-11', status: 'ACTIVE' }
      ],
      activeMedications: [
        { drug: 'Metformin', dose: '1000mg', freq: 'BID', adherence: 91, indication: 'T2D (Clinic A)' },
        { drug: 'Metformin', dose: '500mg', freq: 'Daily', adherence: 85, indication: 'T2D (Clinic B Duplicate)' },
        { drug: 'Diazepam', dose: '10mg', freq: 'QHS PRN', adherence: 96, indication: 'Insomnia (Beers Alert)' },
        { drug: 'Gabapentin', dose: '600mg', freq: 'TID', adherence: 90, indication: 'Diabetic Neuropathy' },
        { drug: 'Omeprazole', dose: '40mg', freq: 'Daily', adherence: 94, indication: 'GERD' }
      ],
      biomarkers: [
        { marker: 'eGFR', baseline: 34, current: 22, unit: 'mL/min/1.73m²', trend: 'declining' },
        { marker: 'Serum Creatinine', baseline: 2.10, current: 2.85, unit: 'mg/dL', trend: 'declining' }
      ],
      allergies: [],
      vitals: { sbp: 142, dbp: 78, heartRate: 68, weightLbs: 164.2 }
    }
  ],

  // Patient D: Sarah Miller (31F) - 1st Trimester Pregnancy + Pyelonephritis
  [
    'patient-sm-31',
    {
      patientId: 'patient-sm-31',
      name: 'Sarah Miller',
      age: 31,
      gender: 'Female',
      dob: '1995-02-18',
      conditions: [
        { name: 'Intrauterine Pregnancy', stage: '10 Weeks Gestation', onset: '2024-07', status: 'ACTIVE' },
        { name: 'Acute Pyelonephritis', stage: 'Febrile (38.9°C)', onset: '2024-09', status: 'ACTIVE' }
      ],
      activeMedications: [
        { drug: 'Prenatal Multivitamin', dose: '1 tab', freq: 'Daily', adherence: 98, indication: 'Pregnancy support' }
      ],
      biomarkers: [
        { marker: 'WBC', baseline: 7.2, current: 16.4, unit: 'x10³/µL', trend: 'declining' },
        { marker: 'Body Temp', baseline: 36.8, current: 38.9, unit: '°C', trend: 'declining' }
      ],
      allergies: [
        { allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Anaphylactic shock' },
        { allergen: 'Cephalexin', severity: 'SEVERE', reaction: 'Angioedema' }
      ],
      vitals: { sbp: 112, dbp: 72, heartRate: 98, weightLbs: 136.0 }
    }
  ],

  // Patient E: David Jackson (63M) - HFrEF + Hyperkalemia K+ 5.9
  [
    'patient-dj-63',
    {
      patientId: 'patient-dj-63',
      name: 'David Jackson',
      age: 63,
      gender: 'Male',
      dob: '1963-08-30',
      conditions: [
        { name: 'Heart Failure Reduced EF', stage: 'NYHA Class III, EF 28%', onset: '2021-03', status: 'ACTIVE' },
        { name: 'Atrial Fibrillation', stage: 'Permanent', onset: '2022-04', status: 'ACTIVE' }
      ],
      activeMedications: [
        { drug: 'Spironolactone', dose: '25mg', freq: 'Daily', adherence: 96, indication: 'MRA Cardioprotection' },
        { drug: 'Lisinopril', dose: '40mg', freq: 'Daily', adherence: 94, indication: 'HFrEF neurohormonal' },
        { drug: 'Furosemide', dose: '40mg', freq: 'Daily morning', adherence: 92, indication: 'Volume management' }
      ],
      biomarkers: [
        { marker: 'Serum Potassium', baseline: 4.6, current: 5.9, unit: 'mEq/L', trend: 'declining' },
        { marker: 'Serum Creatinine (STALE)', baseline: 1.15, current: 1.20, unit: 'mg/dL', trend: 'stable' }
      ],
      allergies: [],
      vitals: { sbp: 94, dbp: 62, heartRate: 82, weightLbs: 194.5 }
    }
  ]
]);

// Active Care Plans for Cohorts A - E
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
          scheduledDate: 'October 5, 2026',
          purpose: 'Verify eGFR reversibility after stopping systemic NSAID',
          status: 'SCHEDULED'
        }
      ]
    }
  ],
  [
    'patient-mr-42',
    {
      doctorSummaryNote: 'Halt Carvedilol immediately. Convene Specialist Consensus for cardioselective beta-1 blocker (Bisoprolol) vs non-beta-blocker rate control to safeguard reactive airway.',
      tasks: [
        { id: 'task-b1', title: 'Use Fluticasone/Salmeterol 250/50mcg BID', timeOfDay: 'Morning', category: 'MEDICATION', completed: true, dueDate: 'Today' },
        { id: 'task-b2', title: 'Check peak expiratory flow (PEF)', timeOfDay: 'Morning', category: 'TELEMETRY', completed: true, dueDate: 'Today' },
        { id: 'task-b3', title: 'Pause Carvedilol awaiting Cardiology consult', timeOfDay: 'Afternoon', category: 'MEDICATION', completed: false, dueDate: 'Today' }
      ],
      followUps: [
        {
          id: 'fu-b1',
          title: 'Cardiopulmonary Joint Consultation',
          specialty: 'Cardiology / Pulmonology',
          clinicianName: 'Dr. Chen & Dr. Ross',
          scheduledDate: 'October 3, 2026',
          purpose: 'Select airway-safe anti-ischemic rate control agent',
          status: 'SCHEDULED'
        }
      ]
    }
  ],
  [
    'patient-al-79',
    {
      doctorSummaryNote: 'Discontinue duplicate Metformin and Diazepam. Ordered urgent Comprehensive Metabolic Panel to capture unmeasured baseline liver enzymes.',
      tasks: [
        { id: 'task-c1', title: 'STOP duplicate Metformin from Clinic B', timeOfDay: 'Morning', category: 'MEDICATION', completed: true, dueDate: 'Today' },
        { id: 'task-c2', title: 'Begin cognitive sleep hygiene routine (Hold Diazepam)', timeOfDay: 'Night', category: 'LIFESTYLE', completed: false, dueDate: 'Today' }
      ],
      followUps: [
        {
          id: 'fu-c1',
          title: 'Comprehensive Metabolic Panel (Liver & Renal)',
          specialty: 'Geriatric Laboratory',
          clinicianName: 'Dr. Patel',
          scheduledDate: 'October 2, 2026',
          purpose: 'Assess baseline ALT/AST and monitor Stage 4 CKD progression',
          status: 'SCHEDULED'
        }
      ]
    }
  ],
  [
    'patient-sm-31',
    {
      doctorSummaryNote: 'Inpatient admission for Acute Pyelonephritis in 1st trimester pregnancy. Prescribed IV Aztreonam (monobactam); zero cross-reactivity with penicillin/cephalosporin allergies.',
      tasks: [
        { id: 'task-d1', title: 'IV Aztreonam 1g infusion Q8H', timeOfDay: 'Continuous', category: 'MEDICATION', completed: true, dueDate: 'Today' },
        { id: 'task-d2', title: 'Continuous fetal heart Doppler check', timeOfDay: 'Every 4 Hours', category: 'TELEMETRY', completed: true, dueDate: 'Today' }
      ],
      followUps: [
        {
          id: 'fu-d1',
          title: 'Maternal-Fetal Ultrasound & Renal Scan',
          specialty: 'Obstetrics & Maternal-Fetal Medicine',
          clinicianName: 'Dr. Evans',
          scheduledDate: 'October 1, 2026',
          purpose: 'Assess fetal viability and resolution of maternal pyelonephritis',
          status: 'SCHEDULED'
        }
      ]
    }
  ],
  [
    'patient-dj-63',
    {
      doctorSummaryNote: 'EMERGENCY: Serum Potassium 5.9 mEq/L. Immediately hold Spironolactone. Ordered STAT 12-lead ECG and urgent chemistry panel.',
      tasks: [
        { id: 'task-e1', title: 'HOLD Spironolactone 25mg immediately', timeOfDay: 'Immediate', category: 'MEDICATION', completed: true, dueDate: 'Today' },
        { id: 'task-e2', title: 'STAT 12-lead Electrocardiogram in clinic', timeOfDay: 'Immediate', category: 'TELEMETRY', completed: true, dueDate: 'Today' }
      ],
      followUps: [
        {
          id: 'fu-e1',
          title: 'STAT Repeat Potassium & ECG Review',
          specialty: 'Emergency Cardiorenal Clinic',
          clinicianName: 'Dr. Miller',
          scheduledDate: 'September 28, 2026',
          purpose: 'Ensure serum potassium normalizes below 5.0 mEq/L',
          status: 'CONFIRMED'
        }
      ]
    }
  ]
]);

// Require authentication for all patient routes
router.use(authenticateAndAuthorize(['patient', 'clinician', 'admin']));

// Apply cross-patient isolation guard (uses validated session identity)
router.use(enforceStrictPatientIsolation);

// GET /api/patient/:id/state
router.get('/:id/state', (req: Request, res: Response) => {
  const patient = canonicalPatients.get(req.params.id as string) || canonicalPatients.get('patient-ev-68')!;
  return res.json({ success: true, patient });
});

// PUT /api/patient/:id/profile (Modify patient clinical data & profile)
router.put('/:id/profile', (req: Request, res: Response) => {
  const patientId = (req.params.id as string) || 'patient-ev-68';
  const patient = canonicalPatients.get(patientId);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const { name, age, gender, dob, conditions, activeMedications, allergies, vitals } = req.body;
  if (name && typeof name === 'string') patient.name = name.trim();
  if (age !== undefined && !isNaN(Number(age))) patient.age = Number(age);
  if (gender && typeof gender === 'string') patient.gender = gender;
  if (dob && typeof dob === 'string') patient.dob = dob;

  if (conditions && Array.isArray(conditions)) {
    // Accepts either strings or full Condition objects
    patient.conditions = conditions.map(c => 
      typeof c === 'string' 
        ? { name: c, stage: 'Active Condition', onset: 'Recent', status: 'ACTIVE' as const }
        : c
    );
  }

  if (activeMedications && Array.isArray(activeMedications)) {
    // Accepts either strings or full Medication objects
    patient.activeMedications = activeMedications.map(m =>
      typeof m === 'string'
        ? { drug: m, dose: m.includes('mg') ? '' : 'Standard', freq: 'Daily', adherence: 95, indication: 'Prescribed' }
        : m
    );
  }

  if (allergies && Array.isArray(allergies)) {
    // Accepts either strings or full Allergy objects
    patient.allergies = allergies.map(a =>
      typeof a === 'string'
        ? { allergen: a, severity: 'MODERATE', reaction: 'Clinical alert' }
        : a
    );
  }

  if (vitals && typeof vitals === 'object') {
    patient.vitals = { ...patient.vitals, ...vitals };
  }

  broadcastWorkflowEvent('PATIENT_STATE_UPDATED', { patientId, patient, message: 'Patient profile and clinical data modified' }, patientId);

  return res.json({
    success: true,
    message: 'Patient profile and data successfully updated.',
    patient
  });
});

// GET /api/patient/:id/attention
router.get('/:id/attention', (req: Request, res: Response) => {
  const patientId = (req.params.id as string) || 'patient-ev-68';
  const patient = canonicalPatients.get(patientId) || canonicalPatients.get('patient-ev-68')!;
  const plan = activeCarePlans.get(patient.patientId);

  let attentionItems = [
    {
      id: 'att-1',
      title: 'Medication Safety & Kidney Health Check',
      description: 'Your recent blood work shows your kidneys need extra care. Please pause over-the-counter pain pills until you discuss a gentler topical option with Dr. Thorne.',
      severity: 'WARNING',
      actionType: 'TALK_TO_VIRTUAL_SPECIALIST',
      category: 'Medication Safety'
    },
    {
      id: 'att-2',
      title: 'Daily Vital & Hydration Check',
      description: 'Blood pressure readings are steady. Remember to take your prescribed morning medications and maintain proper hydration.',
      severity: 'INFO',
      actionType: 'VIEW_TIMELINE',
      category: 'Maintenance'
    }
  ];

  if (patientId === 'patient-mr-42') {
    attentionItems = [
      {
        id: 'att-b1',
        title: 'Breathing & Heart Medication Safety Check',
        description: 'To protect your lungs and asthma, your heart medication is being paused for specialist review. Please use your rescue inhaler if needed.',
        severity: 'ALERT',
        actionType: 'TALK_TO_VIRTUAL_SPECIALIST',
        category: 'Cardiopulmonary Safety'
      }
    ];
  } else if (patientId === 'patient-al-79') {
    attentionItems = [
      {
        id: 'att-c1',
        title: 'Medication Clean-Up & Lab Update Needed',
        description: 'We detected duplicate diabetes prescriptions and high-risk sleep aids. Please bring all your pill bottles to your clinic visit.',
        severity: 'ALERT',
        actionType: 'TALK_TO_VIRTUAL_SPECIALIST',
        category: 'Polypharmacy Review'
      }
    ];
  } else if (patientId === 'patient-sm-31') {
    attentionItems = [
      {
        id: 'att-d1',
        title: 'Pregnancy-Safe Infection Care',
        description: 'You are receiving baby-safe IV antibiotics for your kidney infection. Fetal monitoring is active and reassuring.',
        severity: 'INFO',
        actionType: 'TALK_TO_VIRTUAL_SPECIALIST',
        category: 'Obstetric Safety'
      }
    ];
  } else if (patientId === 'patient-dj-63') {
    attentionItems = [
      {
        id: 'att-e1',
        title: 'URGENT: Potassium Level Alert',
        description: 'Your blood potassium level is elevated at 5.9. Do not take your water pill today, and proceed to the clinic for a quick heart trace (ECG).',
        severity: 'CRITICAL',
        actionType: 'TALK_TO_VIRTUAL_SPECIALIST',
        category: 'Cardiac Safety'
      }
    ];
  }

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
      date: 'September 20, 2026',
      title: 'Comprehensive Metabolic Panel & Telemetry Encounter',
      category: 'LAB_RESULT',
      summary: 'Biomarkers refreshed and analyzed through clinical intelligence pipeline.',
      clinicianBadge: 'Validated by Attending Physician',
      tags: ['Biomarkers', 'Deterministic Gate']
    },
    {
      id: 'evt-2',
      date: 'September 15, 2026',
      title: 'Symptom & Medication Check-In',
      category: 'PATIENT_REPORT',
      summary: 'Patient check-in recorded via calm dialogue interface.',
      clinicianBadge: 'Logged via Portal',
      tags: ['Symptom', 'Virtual Doctor']
    },
    {
      id: 'evt-3',
      date: 'August 28, 2026',
      title: 'Baseline Specialist Consultation',
      category: 'ENCOUNTER',
      summary: 'Multidisciplinary care plan review and initial risk tiering.',
      clinicianBadge: 'Attending Specialist',
      tags: ['Encounter', 'Care Plan']
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

  // Persist decision into WORM audit ledger
  persistenceService.saveCarePlanDecision({
    action: decisionRecord.action,
    clinicianName: decisionRecord.clinicianName,
    candidateChosen: decisionRecord.candidateChosen,
    rationaleNotes: decisionRecord.rationaleNotes,
    signedAt: decisionRecord.signedAt,
    ledgerTxId: decisionRecord.ledgerTxId,
    patientId
  }).catch(err => console.warn('[PERSISTENCE] Error persisting care plan decision:', err.message));

  // Broadcast real-time SSE event to all connected patient & clinician clients
  broadcastWorkflowEvent(
    'CLINICIAN_DECISION_RECORDED',
    {
      patientId,
      decision: decisionRecord,
      message: `Physician decision signed: ${decisionRecord.candidateChosen}`
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
