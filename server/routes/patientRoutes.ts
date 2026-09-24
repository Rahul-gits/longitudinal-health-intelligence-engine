import { Router, Request, Response } from 'express';

const router = Router();

// Primary longitudinal patient state for Eleanor Vance
export const mockPatientProfile = {
  id: 'patient-ev-68',
  name: 'Eleanor Vance',
  age: 68,
  gender: 'Female',
  mrn: 'EV-88492-X',
  status: 'High Alert (Decompensation Risk)',
  primaryCarePhysician: 'Dr. Aris Thorne (Cardiorenal Specialist)',
  conditions: [
    { id: 'c1', name: 'Heart Failure with Preserved Ejection Fraction (HFpEF)', status: 'Active - Worsening NYHA III', icd10: 'I50.32', onsetDate: '2023-04-12' },
    { id: 'c2', name: 'Chronic Kidney Disease (CKD Stage 3b)', status: 'Active - eGFR Decline (38 mL/min)', icd10: 'N18.32', onsetDate: '2022-09-18' },
    { id: 'c3', name: 'Type 2 Diabetes Mellitus with Nephropathy', status: 'Active - HbA1c 7.9%', icd10: 'E11.21', onsetDate: '2019-02-10' },
    { id: 'c4', name: 'Essential Hypertension', status: 'Suboptimally Controlled (148/92 mmHg)', icd10: 'I10', onsetDate: '2018-05-20' },
    { id: 'c5', name: 'Osteoarthritis (Bilateral Knees)', status: 'Intermittent Flare (Avoid NSAIDs)', icd10: 'M17.0', onsetDate: '2021-01-15' }
  ],
  currentMedications: [
    { name: 'Empagliflozin (Jardiance)', dose: '10 mg', route: 'Oral', frequency: 'Daily in morning', category: 'SGLT2i', indication: 'HFpEF & Renal Protection', adherenceRate: 96 },
    { name: 'Sacubitril / Valsartan (Entresto)', dose: '24/26 mg', route: 'Oral', frequency: 'Twice daily', category: 'ARNI', indication: 'HFpEF', adherenceRate: 92 },
    { name: 'Spironolactone', dose: '25 mg', route: 'Oral', frequency: 'Daily', category: 'MRA', indication: 'Aldosterone Antagonist', adherenceRate: 90 },
    { name: 'Furosemide (Lasix)', dose: '40 mg', route: 'Oral', frequency: 'Daily (PRN titration)', category: 'Loop Diuretic', indication: 'Volume Overload Relief', adherenceRate: 98 },
    { name: 'Metformin', dose: '500 mg', route: 'Oral', frequency: 'Twice daily', category: 'Biguanide', indication: 'T2D (Hold if eGFR < 30)', adherenceRate: 94 },
    { name: 'Atorvastatin', dose: '20 mg', route: 'Oral', frequency: 'Nightly', category: 'Statin', indication: 'Cardiovascular Risk Reduction', adherenceRate: 95 }
  ],
  vitalsHistory: [
    { timestamp: '2026-09-20T08:00:00Z', bpSystolic: 134, bpDiastolic: 82, heartRate: 74, spo2: 97, weightKg: 73.2, edemaGrade: '1+' },
    { timestamp: '2026-09-21T08:00:00Z', bpSystolic: 138, bpDiastolic: 85, heartRate: 76, spo2: 96, weightKg: 73.8, edemaGrade: '1+' },
    { timestamp: '2026-09-22T08:00:00Z', bpSystolic: 142, bpDiastolic: 88, heartRate: 80, spo2: 95, weightKg: 74.6, edemaGrade: '2+' },
    { timestamp: '2026-09-23T08:00:00Z', bpSystolic: 146, bpDiastolic: 90, heartRate: 84, spo2: 94, weightKg: 75.5, edemaGrade: '2+' },
    { timestamp: '2026-09-24T08:00:00Z', bpSystolic: 148, bpDiastolic: 92, heartRate: 88, spo2: 93, weightKg: 76.4, edemaGrade: '3+' }
  ],
  labsHistory: [
    { date: '2026-06-15', egfr: 45, creatinine: 1.4, potassium: 4.4, bnp: 280, hba1c: 7.6, uacr: 180 },
    { date: '2026-08-01', egfr: 42, creatinine: 1.5, potassium: 4.7, bnp: 390, hba1c: 7.7, uacr: 210 },
    { date: '2026-09-10', egfr: 39, creatinine: 1.7, potassium: 5.1, bnp: 580, hba1c: 7.8, uacr: 245 },
    { date: '2026-09-23', egfr: 38, creatinine: 1.8, potassium: 5.3, bnp: 840, hba1c: 7.9, uacr: 290 }
  ],
  activeAlerts: [
    {
      id: 'alt-001',
      severity: 'CRITICAL',
      title: 'Rapid Fluid Accumulation & Acute Hyperkalemia Risk',
      description: 'Weight gained +3.2 kg over 4 days with Potassium at 5.3 mEq/L and NT-proBNP elevated to 840 pg/mL. High risk of pulmonary congestion.',
      actionRequired: 'Titrate Loop Diuretic (Furosemide -> 60mg), temporarily hold Spironolactone, check repeat BMP in 48 hours.',
      evidenceScore: 0.96
    },
    {
      id: 'alt-002',
      severity: 'WARNING',
      title: 'eGFR Borderline Threshold for Metformin',
      description: 'Current eGFR 38 mL/min is nearing safety cutoff (< 30 mL/min). Monitor lactic acidosis risk.',
      actionRequired: 'Consider dose halving to 500mg daily if eGFR drops below 35 mL/min.',
      evidenceScore: 0.91
    }
  ]
};

// GET /api/patients
router.get('/', (_req: Request, res: Response) => {
  res.json({
    total: 1,
    patients: [
      {
        id: mockPatientProfile.id,
        name: mockPatientProfile.name,
        age: mockPatientProfile.age,
        gender: mockPatientProfile.gender,
        mrn: mockPatientProfile.mrn,
        status: mockPatientProfile.status,
        activeAlertsCount: mockPatientProfile.activeAlerts.length,
        lastUpdated: new Date().toISOString()
      }
    ]
  });
});

// GET /api/patients/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === 'patient-ev-68' || id === 'current' || id === 'eleanor') {
    return res.json({
      success: true,
      patient: mockPatientProfile,
      meta: {
        engineVersion: 'HEAL-Engine-v2.4.0',
        timestamp: new Date().toISOString()
      }
    });
  }
  return res.status(404).json({ success: false, error: `Patient ID ${id} not found.` });
});

// GET /api/patients/:id/vitals
router.get('/:id/vitals', (_req: Request, res: Response) => {
  res.json({
    success: true,
    patientId: mockPatientProfile.id,
    vitals: mockPatientProfile.vitalsHistory
  });
});

// GET /api/patients/:id/labs
router.get('/:id/labs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    patientId: mockPatientProfile.id,
    labs: mockPatientProfile.labsHistory
  });
});

export default router;
