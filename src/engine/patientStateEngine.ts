import { PatientClinicalState } from '../types/health';

export class PatientStateEngine {
  private currentState: PatientClinicalState = {
    versionId: 'v1.4.2',
    versionTimestamp: '2026-08-13 19:45:00 IST',
    stateDelta: 'Delta vs v1.4.1: Laboratory renal panel update attached; eGFR decreased by 18.7% (64 → 52 mL/min).',
    demographics: {
      id: 'PT-884920',
      name: 'Eleanor Vance',
      age: 68,
      gender: 'Female',
      bloodType: 'A+',
      primaryPhysician: 'Dr. Aris Thorne, MD (Cardiology/Nephrology)'
    },
    conditions: [
      { value: 'Stage 2 Chronic Kidney Disease (CKD)', date: '2025-03-15', source: 'Nephrology Consultation', confidence: 'High', validityPeriod: 'Ongoing' },
      { value: 'Essential Hypertension', date: '2018-06-10', source: 'Primary Care EHR', confidence: 'High', validityPeriod: 'Ongoing' },
      { value: 'Knee Osteoarthritis', date: '2022-11-04', source: 'Orthopedic EHR', confidence: 'High', validityPeriod: 'Ongoing' }
    ],
    symptoms: [
      { value: 'Exertional Dyspnea (Grade II)', date: '2026-08-10', source: 'Patient Symptom Log', confidence: 'High' },
      { value: 'Bilateral Leg Swelling (2+ Pitting Edema)', date: '2026-08-11', source: 'Clinical Exam', confidence: 'High' },
      { value: 'Right Knee Joint Pain (6/10)', date: '2026-08-12', source: 'Daily Pain Diary', confidence: 'High' }
    ],
    medications: [
      {
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '20 mg',
        frequency: 'Daily',
        startDate: '2018-06-15',
        status: 'active',
        purpose: 'Blood Pressure Control & Renal Arteriolar Protection',
        potentialInteractions: ['NSAIDs (Ibuprofen)', 'Potassium Supplements'],
        knownAllergies: []
      },
      {
        id: 'med-2',
        name: 'Atorvastatin',
        dosage: '10 mg',
        frequency: 'Daily',
        startDate: '2020-01-10',
        status: 'active',
        purpose: 'Hyperlipidemia Management',
        potentialInteractions: [],
        knownAllergies: []
      },
      {
        id: 'med-3',
        name: 'OTC Ibuprofen',
        dosage: '400 mg',
        frequency: '3x weekly PRN',
        startDate: '2026-07-20',
        status: 'otc',
        purpose: 'Self-Prescribed Knee Arthritis Analgesia',
        potentialInteractions: ['Lisinopril (Acute Kidney Injury Hazard)'],
        knownAllergies: [],
        patientReportedEffects: 'Helps knee stiffness but causing gastric tightness'
      }
    ],
    allergies: [
      { value: 'Penicillin (Severe Rash)', date: '2012-05-04', source: 'Patient Allergy Record', confidence: 'High' }
    ],
    labTrends: [
      {
        id: 'lab-egfr',
        name: 'eGFR (Glomerular Filtration Rate)',
        category: 'Renal Panel',
        unit: 'mL/min/1.73m²',
        referenceRange: '> 60',
        history: [
          { year: 2024, date: '2024-05-10', value: 72, status: 'normal' },
          { year: 2025, date: '2025-06-14', value: 64, status: 'normal' },
          { year: 2026, date: '2026-08-10', value: 52, status: 'critical' }
        ],
        trend: 'down',
        isAbnormal: true
      },
      {
        id: 'lab-creatinine',
        name: 'Serum Creatinine',
        category: 'Renal Panel',
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.1',
        history: [
          { year: 2024, date: '2024-05-10', value: 1.05, status: 'normal' },
          { year: 2025, date: '2025-06-14', value: 1.18, status: 'normal' },
          { year: 2026, date: '2026-08-10', value: 1.45, status: 'high' }
        ],
        trend: 'up',
        isAbnormal: true
      },
      {
        id: 'lab-bnp',
        name: 'NT-proBNP',
        category: 'Cardiac Biomarker',
        unit: 'pg/mL',
        referenceRange: '< 300',
        history: [
          { year: 2025, date: '2025-06-14', value: 180, status: 'normal' },
          { year: 2026, date: '2026-08-10', value: 480, status: 'high' }
        ],
        trend: 'up',
        isAbnormal: true
      }
    ],
    vitals: {
      value: { bp: '138/86 mmHg', hr: 74, temp: 98.4, spo2: 97 },
      date: '2026-08-13 19:30',
      source: 'Continuous Wearable Telemetry',
      confidence: 'High'
    },
    genetics: [
      {
        value: { variant: 'CYP2C9*3 (rs1057910)', gene: 'CYP2C9', metabolizerStatus: 'Intermediate/Slow Metabolizer' },
        date: '2024-02-18',
        source: 'Pharmacogenomic Panel',
        confidence: 'High'
      }
    ],
    lifestyle: {
      value: { stepCount: 3840, sleepHours: 6.2 },
      date: '2026-08-13',
      source: 'Apple Health Watch Telemetry',
      confidence: 'High'
    },
    riskFactors: [
      { value: 'NSAID + ACEi Triple Whammy Nephrotoxicity', date: '2026-08-10', source: 'Heal Engine Risk Engine', confidence: 'High' },
      { value: 'Fluid Overload Decompensation Risk', date: '2026-08-11', source: 'Cardiorenal Modeling', confidence: 'Moderate' }
    ],
    clinicalGoals: [
      { id: 'goal-1', domain: 'Renal', objective: 'Halt eGFR decline and maintain renal filtration rate > 60 mL/min', targetValue: 'eGFR > 60 mL/min', priority: 'high', status: 'conflict' },
      { id: 'goal-2', domain: 'Pain Management', objective: 'Provide right knee arthritis pain relief while avoiding nephrotoxic drugs', targetValue: 'Pain < 3/10', priority: 'high', status: 'conflict' },
      { id: 'goal-3', domain: 'Cardiology', objective: 'Control blood pressure and reduce ventricular strain', targetValue: 'BP < 130/80, NT-proBNP < 300', priority: 'medium', status: 'active' }
    ],
    treatmentHistory: [
      { id: 'ev-1', year: 2025, date: '2025-06-14', title: 'Annual Checkup', category: 'consultation', summary: 'Baseline eGFR recorded at 64 mL/min. Stable Stage 2 CKD.', impact: 'stable', relatedClusterIds: ['history', 'reports'] },
      { id: 'ev-2', year: 2026, date: '2026-07-20', title: 'Initiated OTC Ibuprofen', category: 'medication', summary: 'Patient started taking OTC Ibuprofen 400mg 3x weekly for knee pain.', impact: 'worsened', relatedClusterIds: ['medication', 'risk'] },
      { id: 'ev-3', year: 2026, date: '2026-08-10', title: 'Renal Panel Lab Draw', category: 'lab', summary: 'eGFR dropped 18.7% to 52 mL/min. Creatinine rose to 1.45 mg/dL.', impact: 'worsened', relatedClusterIds: ['reports', 'risk'] }
    ],
    lastUpdated: '2026-08-13 19:45 IST'
  };

  public getPatientState(): PatientClinicalState {
    return this.currentState;
  }

  public computeTrajectoryDelta(): {
    whatChanged: string[];
    patientStatus: 'improving' | 'deteriorating' | 'stable';
    riskTrajectoryScore: number; // 0..100
    primaryDriver: string;
  } {
    return {
      whatChanged: [
        'eGFR dropped 18.7% (64 -> 52 mL/min) over last 3 weeks.',
        'NT-proBNP elevated from 180 to 480 pg/mL with new 2+ leg edema.',
        'Patient initiated self-administered OTC Ibuprofen 400mg 3x weekly while taking Lisinopril 20mg.'
      ],
      patientStatus: 'deteriorating',
      riskTrajectoryScore: 78,
      primaryDriver: 'NSAID-induced renal afferent arteriolar constriction in Stage 2 CKD baseline (Lisinopril + Ibuprofen interaction)'
    };
  }
}

export const patientStateEngine = new PatientStateEngine();
