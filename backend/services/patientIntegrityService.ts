/**
 * Patient Integrity & Multi-Cohort Clinical Service
 * 
 * Provides 5 diverse, clinically challenging patient cohorts and
 * enforces rigorous data integrity validation (missing baseline labs,
 * stale records, duplicate orders, cross-specialist guideline conflicts).
 */

export interface RawClinicalObservation {
  id: string;
  code: string;
  display: string;
  value: number;
  unit: string;
  timestamp: string; // ISO 8601
  sourceEncounter: string;
}

export interface RawMedicationOrder {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedDate: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'SUSPENDED';
  indication: string;
}

export interface PatientCohortData {
  patientId: string;
  cohortLabel: string; // 'Patient A', 'Patient B', etc.
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  clinicalPhenotype: string;
  riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  conditions: Array<{ code: string; name: string; stage?: string; onset: string }>;
  allergies: Array<{ allergen: string; severity: 'MILD' | 'MODERATE' | 'SEVERE'; reaction: string }>;
  medications: RawMedicationOrder[];
  observations: RawClinicalObservation[];
  specialistDirectives: Array<{ specialist: string; specialty: string; directive: string; date: string }>;
  isPregnant?: boolean;
  gestationalWeeks?: number;
}

export interface IntegrityFinding {
  code: 'MISSING_BASELINE_LAB' | 'STALE_RECORD' | 'CONTRADICTORY_TIMESTAMPS' | 'DUPLICATE_PRESCRIPTION' | 'SPECIALIST_CONFLICT' | 'CONTRAINDICATED_RISK';
  severity: 'WARNING' | 'ALERT' | 'CRITICAL_BLOCK';
  message: string;
  affectedEntities: string[];
  clinicalRisk: string;
}

export interface IntegrityValidationReport {
  patientId: string;
  cohortLabel: string;
  timestamp: string;
  passed: boolean;
  totalFindings: number;
  findings: IntegrityFinding[];
  dataCompletenessScore: number; // 0 - 100%
  uncertaintyScore: number; // 0 - 100% (higher means more missing/stale data)
}

// 5 Diverse, Realistic Patient Cohorts
export const COHORT_DATABASE: PatientCohortData[] = [
  // Patient A: Eleanor Vance (68F) - Cardiorenal Metabolic with NSAID Nephrotoxicity
  {
    patientId: 'patient-ev-68',
    cohortLabel: 'Patient A',
    name: 'Eleanor Vance',
    age: 68,
    gender: 'Female',
    clinicalPhenotype: 'Cardiorenal Metabolic with Triple Whammy Nephrotoxicity',
    riskTier: 'HIGH',
    conditions: [
      { code: 'CKD-3B', name: 'Chronic Kidney Disease', stage: 'Stage 3b', onset: '2023-04' },
      { code: 'HTN-1', name: 'Essential Hypertension', stage: 'Stage 1', onset: '2019-11' },
      { code: 'OA-KNEE', name: 'Osteoarthritis', stage: 'Bilateral Knees', onset: '2021-08' },
      { code: 'T2D', name: 'Type 2 Diabetes Mellitus', stage: 'Mild (HbA1c 6.8%)', onset: '2022-01' }
    ],
    allergies: [
      { allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Anaphylaxis / Wheezing' }
    ],
    medications: [
      { id: 'm1', drug: 'Lisinopril', dosage: '20mg', frequency: 'Daily morning', prescribedBy: 'Dr. Thorne (Nephrology)', prescribedDate: '2024-01-10', status: 'ACTIVE', indication: 'Hypertension & Renoprotection' },
      { id: 'm2', drug: 'Empagliflozin', dosage: '10mg', frequency: 'Daily morning', prescribedBy: 'Dr. Thorne (Nephrology)', prescribedDate: '2024-02-15', status: 'ACTIVE', indication: 'Cardiorenal Risk' },
      { id: 'm3', drug: 'Metformin', dosage: '500mg', frequency: 'Daily with dinner', prescribedBy: 'Dr. Gomez (PCP)', prescribedDate: '2023-06-20', status: 'ACTIVE', indication: 'T2D' },
      { id: 'm4', drug: 'Ibuprofen', dosage: '600mg', frequency: 'TID PRN pain', prescribedBy: 'Dr. Vance (Orthopedics)', prescribedDate: '2024-08-01', status: 'ACTIVE', indication: 'Knee Osteoarthritis' }
    ],
    observations: [
      { id: 'o1', code: 'eGFR', display: 'Estimated GFR', value: 38, unit: 'mL/min/1.73m²', timestamp: '2024-09-20T10:00:00Z', sourceEncounter: 'ENC-2024-09' },
      { id: 'o2', code: 'CREAT', display: 'Serum Creatinine', value: 1.42, unit: 'mg/dL', timestamp: '2024-09-20T10:00:00Z', sourceEncounter: 'ENC-2024-09' },
      { id: 'o3', code: 'K+', display: 'Serum Potassium', value: 4.8, unit: 'mEq/L', timestamp: '2024-09-20T10:00:00Z', sourceEncounter: 'ENC-2024-09' },
      { id: 'o4', code: 'SBP', display: 'Systolic Blood Pressure', value: 132, unit: 'mmHg', timestamp: '2024-09-20T09:30:00Z', sourceEncounter: 'ENC-2024-09' }
    ],
    specialistDirectives: [
      { specialist: 'Dr. Thorne', specialty: 'Nephrology', directive: 'Maintain ACE-i; strictly avoid systemic NSAIDs due to stage 3b CKD and risk of hemodynamic AKI.', date: '2024-08-10' },
      { specialist: 'Dr. Vance', specialty: 'Orthopedics', directive: 'Recommend anti-inflammatory therapy for severe knee flare.', date: '2024-08-01' }
    ]
  },

  // Patient B: Marcus Rodriguez (42M) - Severe Asthma vs Acute Coronary Angina (Beta-Blocker Conflict)
  {
    patientId: 'patient-mr-42',
    cohortLabel: 'Patient B',
    name: 'Marcus Rodriguez',
    age: 42,
    gender: 'Male',
    clinicalPhenotype: 'Severe Asthma with Acute Coronary Angina (Cardiopulmonary Conflict)',
    riskTier: 'HIGH',
    conditions: [
      { code: 'ASTHMA-SEV', name: 'Severe Persistent Asthma', stage: 'Step 4', onset: '2015-02' },
      { code: 'CAD-ANGINA', name: 'Coronary Artery Disease', stage: 'Exertional Angina', onset: '2024-07' }
    ],
    allergies: [
      { allergen: 'Aspirin', severity: 'SEVERE', reaction: 'Aspirin-Exacerbated Respiratory Disease (AERD) / Bronchospasm' }
    ],
    medications: [
      { id: 'mb1', drug: 'Fluticasone/Salmeterol', dosage: '250/50mcg', frequency: 'BID', prescribedBy: 'Dr. Chen (Pulmonology)', prescribedDate: '2024-01-12', status: 'ACTIVE', indication: 'Asthma maintenance' },
      { id: 'mb2', drug: 'Albuterol Inhaler', dosage: '90mcg', frequency: '2 puffs Q4H PRN', prescribedBy: 'Dr. Chen (Pulmonology)', prescribedDate: '2024-01-12', status: 'ACTIVE', indication: 'Rescue bronchodilation' },
      { id: 'mb3', drug: 'Carvedilol', dosage: '12.5mg', frequency: 'BID', prescribedBy: 'Dr. Ross (Cardiology)', prescribedDate: '2024-08-25', status: 'ACTIVE', indication: 'Angina rate control & cardioprotection' }
    ],
    observations: [
      { id: 'ob1', code: 'FEV1', display: 'Forced Expiratory Volume in 1s', value: 62, unit: '% predicted', timestamp: '2024-08-01T11:00:00Z', sourceEncounter: 'ENC-PULM-01' },
      { id: 'ob2', code: 'HR', display: 'Heart Rate', value: 88, unit: 'bpm', timestamp: '2024-09-15T08:30:00Z', sourceEncounter: 'ENC-CARD-02' },
      { id: 'ob3', code: 'SBP', display: 'Systolic Blood Pressure', value: 138, unit: 'mmHg', timestamp: '2024-09-15T08:30:00Z', sourceEncounter: 'ENC-CARD-02' }
    ],
    specialistDirectives: [
      { specialist: 'Dr. Chen', specialty: 'Pulmonology', directive: 'Absolute contraindication to non-selective beta-blockers; history of life-threatening bronchospasm.', date: '2024-08-01' },
      { specialist: 'Dr. Ross', specialty: 'Cardiology', directive: 'Initiate beta-blocker for post-ischemic cardioprotection and heart rate target < 70.', date: '2024-08-25' }
    ]
  },

  // Patient C: Arthur Liu (79M) - Geriatric Polypharmacy, CKD 4, Missing Baseline LFTs, Duplicate Meds
  {
    patientId: 'patient-al-79',
    cohortLabel: 'Patient C',
    name: 'Arthur Liu',
    age: 79,
    gender: 'Male',
    clinicalPhenotype: 'Geriatric Polypharmacy (11 Rx) with CKD Stage 4 & Missing Baseline LFTs',
    riskTier: 'CRITICAL',
    conditions: [
      { code: 'CKD-4', name: 'Chronic Kidney Disease', stage: 'Stage 4 (eGFR 22 mL/min)', onset: '2022-09' },
      { code: 'T2D-INS', name: 'Type 2 Diabetes Mellitus', stage: 'Insulin-requiring', onset: '2010-05' },
      { code: 'INSOMNIA', name: 'Chronic Insomnia', stage: 'Severe', onset: '2020-03' },
      { code: 'COGNITIVE', name: 'Mild Cognitive Impairment', stage: 'MoCA 22/30', onset: '2023-11' }
    ],
    allergies: [],
    medications: [
      { id: 'mc1', drug: 'Metformin', dosage: '1000mg', frequency: 'BID', prescribedBy: 'Clinic Downtown', prescribedDate: '2023-10-01', status: 'ACTIVE', indication: 'T2D' },
      { id: 'mc2', drug: 'Metformin', dosage: '500mg', frequency: 'Daily', prescribedBy: 'Suburban Health', prescribedDate: '2024-03-12', status: 'ACTIVE', indication: 'T2D (Duplicate prescription from second provider)' },
      { id: 'mc3', drug: 'Diazepam', dosage: '10mg', frequency: 'QHS PRN insomnia', prescribedBy: 'Urgent Care Center', prescribedDate: '2024-06-15', status: 'ACTIVE', indication: 'Sleep disturbance (Beers Criteria High Risk)' },
      { id: 'mc4', drug: 'Gabapentin', dosage: '600mg', frequency: 'TID', prescribedBy: 'Pain Clinic', prescribedDate: '2024-02-10', status: 'ACTIVE', indication: 'Diabetic Neuropathy' },
      { id: 'mc5', drug: 'Omeprazole', dosage: '40mg', frequency: 'Daily', prescribedBy: 'PCP', prescribedDate: '2022-01-01', status: 'ACTIVE', indication: 'GERD' }
    ],
    observations: [
      { id: 'oc1', code: 'eGFR', display: 'Estimated GFR', value: 22, unit: 'mL/min/1.73m²', timestamp: '2024-09-10T09:00:00Z', sourceEncounter: 'ENC-RENAL-79' },
      { id: 'oc2', code: 'CREAT', display: 'Serum Creatinine', value: 2.85, unit: 'mg/dL', timestamp: '2024-09-10T09:00:00Z', sourceEncounter: 'ENC-RENAL-79' }
      // NOTE: Missing AST, ALT, Total Bilirubin, and Albumin!
    ],
    specialistDirectives: [
      { specialist: 'Dr. Patel', specialty: 'Geriatrics', directive: 'De-prescribe sedatives; review polypharmacy burden using Beers Criteria.', date: '2024-04-10' }
    ]
  },

  // Patient D: Sarah Miller (31F) - 1st Trimester Pregnancy with Acute Pyelonephritis & Severe Penicillin Anaphylaxis
  {
    patientId: 'patient-sm-31',
    cohortLabel: 'Patient D',
    name: 'Sarah Miller',
    age: 31,
    gender: 'Female',
    clinicalPhenotype: 'Pregnancy 1st Trimester + Acute Pyelonephritis + Severe Penicillin/Cephalosporin Allergy',
    riskTier: 'CRITICAL',
    isPregnant: true,
    gestationalWeeks: 10,
    conditions: [
      { code: 'PREG-10W', name: 'Intrauterine Pregnancy', stage: '10 Weeks Gestation (1st Trimester)', onset: '2024-07' },
      { code: 'ACUTE-PYELO', name: 'Acute Pyelonephritis', stage: 'Febrile (38.9°C)', onset: '2024-09-25' }
    ],
    allergies: [
      { allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Anaphylactic shock requiring Epinephrine and ICU admission (2021)' },
      { allergen: 'Cephalexin', severity: 'SEVERE', reaction: 'Angioedema & stridor (2022)' }
    ],
    medications: [
      { id: 'md1', drug: 'Prenatal Multivitamin', dosage: '1 tab', frequency: 'Daily', prescribedBy: 'Dr. Evans (OB/GYN)', prescribedDate: '2024-07-20', status: 'ACTIVE', indication: 'Pregnancy support' }
    ],
    observations: [
      { id: 'od1', code: 'TEMP', display: 'Body Temperature', value: 38.9, unit: '°C', timestamp: '2024-09-26T08:00:00Z', sourceEncounter: 'ENC-ED-31' },
      { id: 'od2', code: 'WBC', display: 'White Blood Cell Count', value: 16.4, unit: 'x10³/µL', timestamp: '2024-09-26T08:15:00Z', sourceEncounter: 'ENC-ED-31' },
      { id: 'od3', code: 'URINE_BACT', display: 'Urine Culture', value: 100000, unit: 'CFU/mL E. coli', timestamp: '2024-09-26T12:00:00Z', sourceEncounter: 'ENC-ED-31' }
    ],
    specialistDirectives: [
      { specialist: 'Dr. Evans', specialty: 'Maternal-Fetal Medicine', directive: 'Strictly avoid fluoroquinolones (cartilage damage) and tetracyclines (teratogenicity/teeth discoloration) in pregnancy.', date: '2024-09-26' }
    ]
  },

  // Patient E: David Jackson (63M) - Decompensated Heart Failure with Severe Hyperkalemia & Stale Outdated Labs
  {
    patientId: 'patient-dj-63',
    cohortLabel: 'Patient E',
    name: 'David Jackson',
    age: 63,
    gender: 'Male',
    clinicalPhenotype: 'Decompensated Heart Failure with Severe Hyperkalemia & Stale Telemetry Records',
    riskTier: 'CRITICAL',
    conditions: [
      { code: 'HFrEF', name: 'Heart Failure with Reduced Ejection Fraction', stage: 'NYHA Class III, EF 28%', onset: '2021-03' },
      { code: 'AFIB', name: 'Atrial Fibrillation', stage: 'Permanent', onset: '2022-04' }
    ],
    allergies: [],
    medications: [
      { id: 'me1', drug: 'Spironolactone', dosage: '25mg', frequency: 'Daily', prescribedBy: 'Dr. Miller (Cardiology)', prescribedDate: '2023-01-10', status: 'ACTIVE', indication: 'MRA Cardioprotection' },
      { id: 'me2', drug: 'Lisinopril', dosage: '40mg', frequency: 'Daily', prescribedBy: 'Dr. Miller (Cardiology)', prescribedDate: '2023-01-10', status: 'ACTIVE', indication: 'HFrEF neurohormonal blockade' },
      { id: 'me3', drug: 'Furosemide', dosage: '40mg', frequency: 'Daily morning', prescribedBy: 'Dr. Miller (Cardiology)', prescribedDate: '2023-01-10', status: 'ACTIVE', indication: 'Volume management' }
    ],
    observations: [
      { id: 'oe1', code: 'K+', display: 'Serum Potassium', value: 5.9, unit: 'mEq/L', timestamp: '2024-09-26T14:00:00Z', sourceEncounter: 'ENC-LAB-FAST' },
      // Stale lab: Creatinine from 420 days ago!
      { id: 'oe2', code: 'CREAT', display: 'Serum Creatinine (STALE)', value: 1.20, unit: 'mg/dL', timestamp: '2023-07-15T09:00:00Z', sourceEncounter: 'ENC-OLD-2023' },
      // Contradictory blood pressure timestamps
      { id: 'oe3', code: 'SBP', display: 'Systolic Blood Pressure (Encounter)', value: 94, unit: 'mmHg', timestamp: '2024-09-26T14:10:00Z', sourceEncounter: 'ENC-CLINIC' },
      { id: 'oe4', code: 'SBP', display: 'Systolic Blood Pressure (Remote)', value: 142, unit: 'mmHg', timestamp: '2024-09-26T14:05:00Z', sourceEncounter: 'ENC-HOME-SCALE' }
    ],
    specialistDirectives: [
      { specialist: 'Dr. Miller', specialty: 'Heart Failure Specialist', directive: 'Hold Spironolactone immediately if K+ > 5.5 mEq/L. Mandate urgent ECG to rule out peaked T-waves.', date: '2024-09-26' }
    ]
  }
];

export class PatientIntegrityService {
  /**
   * Evaluates the clinical data integrity of a patient record.
   * Identifies missing baseline labs, stale records, duplicate therapies, and specialist conflicts.
   */
  public static validateRecordIntegrity(patient: PatientCohortData): IntegrityValidationReport {
    const findings: IntegrityFinding[] = [];
    const now = new Date('2024-09-27T00:00:00Z').getTime();

    // 1. Missing Mandatory Baseline Labs Check
    const requiredLabCodes = ['CREAT', 'eGFR', 'K+'];
    const presentLabCodes = new Set(patient.observations.map(o => o.code));
    
    // Check if liver enzymes are needed (e.g. in polypharmacy or geriatric)
    if (patient.age > 75 || patient.medications.length >= 5) {
      if (!presentLabCodes.has('ALT') && !presentLabCodes.has('AST')) {
        findings.push({
          code: 'MISSING_BASELINE_LAB',
          severity: 'ALERT',
          message: 'Missing baseline Liver Function Tests (ALT/AST) in patient with extensive polypharmacy (>5 medications).',
          affectedEntities: ['Liver Function Panel (ALT/AST)'],
          clinicalRisk: 'Unmonitored hepatic clearance impairment risk for multiple concurrently metabolized agents.'
        });
      }
    }

    for (const reqCode of requiredLabCodes) {
      if (!presentLabCodes.has(reqCode)) {
        findings.push({
          code: 'MISSING_BASELINE_LAB',
          severity: 'ALERT',
          message: `Mandatory baseline renal/electrolyte biomarker '${reqCode}' is unmeasured or absent in the electronic health record.`,
          affectedEntities: [reqCode],
          clinicalRisk: 'Inability to compute accurate GFR or assess acute renal/electrolyte decompensation.'
        });
      }
    }

    // 2. Stale Lab & Clinical Records (> 365 Days)
    for (const obs of patient.observations) {
      const obsTime = new Date(obs.timestamp).getTime();
      const ageInDays = (now - obsTime) / (1000 * 60 * 60 * 24);
      if (ageInDays > 365) {
        findings.push({
          code: 'STALE_RECORD',
          severity: 'WARNING',
          message: `Biomarker observation '${obs.display}' (${obs.value} ${obs.unit}) is ${Math.round(ageInDays)} days old and clinically stale.`,
          affectedEntities: [obs.code, obs.id],
          clinicalRisk: 'Dosage calculations based on outdated renal markers may lead to dangerous drug overdosing.'
        });
      }
    }

    // 3. Contradictory Timestamps or Divergent Telemetry
    const sbpObservations = patient.observations.filter(o => o.code === 'SBP');
    if (sbpObservations.length > 1) {
      const times = sbpObservations.map(o => new Date(o.timestamp).getTime());
      const values = sbpObservations.map(o => o.value);
      const timeDiffMinutes = Math.abs(times[0] - times[1]) / (1000 * 60);
      const valDiff = Math.abs(values[0] - values[1]);

      if (timeDiffMinutes < 60 && valDiff > 35) {
        findings.push({
          code: 'CONTRADICTORY_TIMESTAMPS',
          severity: 'ALERT',
          message: `Discrepancy in simultaneous blood pressure readings: ${values[0]} mmHg vs ${values[1]} mmHg within ${Math.round(timeDiffMinutes)} minutes.`,
          affectedEntities: ['Blood Pressure (SBP)'],
          clinicalRisk: 'High risk of hypotension vs hypertensive urgency misdiagnosis due to uncalibrated remote scale/cuff.'
        });
      }
    }

    // 4. Duplicate Active Medication Orders
    const activeMedNames = patient.medications.filter(m => m.status === 'ACTIVE').map(m => m.drug.toLowerCase());
    const seenMeds = new Map<string, number>();
    for (const med of activeMedNames) {
      seenMeds.set(med, (seenMeds.get(med) || 0) + 1);
    }
    for (const [med, count] of seenMeds.entries()) {
      if (count > 1) {
        findings.push({
          code: 'DUPLICATE_PRESCRIPTION',
          severity: 'CRITICAL_BLOCK',
          message: `Redundant duplicate prescription detected for '${med}' across disparate health encounters (${count} active orders).`,
          affectedEntities: [med],
          clinicalRisk: 'Accidental drug duplication, cumulative dose toxicity (e.g. Metformin-associated lactic acidosis).'
        });
      }
    }

    // 5. Cross-Specialist Clinical Conflicts
    if (patient.specialistDirectives.length >= 2) {
      // Check for Cardiopulmonary conflict (e.g. Beta-Blocker vs Asthma)
      const hasAsthma = patient.conditions.some(c => c.code.includes('ASTHMA'));
      const hasBetaBlocker = patient.medications.some(m => m.drug.toLowerCase().includes('carvedilol') || m.drug.toLowerCase().includes('metoprolol') || m.drug.toLowerCase().includes('propranolol'));
      if (hasAsthma && hasBetaBlocker) {
        findings.push({
          code: 'SPECIALIST_CONFLICT',
          severity: 'CRITICAL_BLOCK',
          message: 'Direct contradiction between Pulmonology directive (Avoid beta-blockers) and Cardiology order (Carvedilol).',
          affectedEntities: ['Carvedilol', 'Asthma Directives'],
          clinicalRisk: 'Non-cardioselective beta-blockade induces bronchoconstriction and fatal status asthmaticus.'
        });
      }

      // Check for Cardiorenal vs Orthopedics conflict (NSAID vs CKD)
      const hasCKD = patient.conditions.some(c => c.code.includes('CKD'));
      const hasNSAID = patient.medications.some(m => ['ibuprofen', 'naproxen', 'meloxicam', 'ketorolac'].includes(m.drug.toLowerCase()));
      if (hasCKD && hasNSAID) {
        findings.push({
          code: 'SPECIALIST_CONFLICT',
          severity: 'CRITICAL_BLOCK',
          message: 'Direct contradiction: Orthopedics prescribed oral NSAID while Nephrology directive strictly mandates NSAID avoidance due to CKD stage 3b.',
          affectedEntities: ['Ibuprofen', 'Nephrology Plan'],
          clinicalRisk: 'Prostaglandin inhibition drives acute hemodynamic renal failure and accelerates progression to ESRD.'
        });
      }
    }

    // 6. Pregnancy Teratogenicity & Physiological Constraints
    if (patient.isPregnant) {
      const hasContraindicatedAntibiotic = patient.medications.some(m => ['ciprofloxacin', 'levofloxacin', 'doxycycline'].includes(m.drug.toLowerCase()));
      if (hasContraindicatedAntibiotic) {
        findings.push({
          code: 'CONTRAINDICATED_RISK',
          severity: 'CRITICAL_BLOCK',
          message: 'Contraindicated teratogenic medication prescribed during active 1st trimester pregnancy.',
          affectedEntities: ['Antibiotic Order'],
          clinicalRisk: 'Fetal cartilage toxicity, neural tube disruption, or maternal-fetal morbidity.'
        });
      }
    }

    // Compute Completeness and Uncertainty Scores
    const baseCompleteness = 100 - (findings.filter(f => f.code === 'MISSING_BASELINE_LAB').length * 20) - (findings.filter(f => f.code === 'STALE_RECORD').length * 15);
    const dataCompletenessScore = Math.max(25, Math.min(100, baseCompleteness));
    const uncertaintyScore = 100 - dataCompletenessScore;

    const criticalCount = findings.filter(f => f.severity === 'CRITICAL_BLOCK').length;
    const passed = criticalCount === 0;

    return {
      patientId: patient.patientId,
      cohortLabel: patient.cohortLabel,
      timestamp: new Date().toISOString(),
      passed,
      totalFindings: findings.length,
      findings,
      dataCompletenessScore,
      uncertaintyScore
    };
  }

  /**
   * Retrieves a cohort patient by ID.
   */
  public static getPatientById(patientId: string): PatientCohortData | undefined {
    return COHORT_DATABASE.find(p => p.patientId === patientId);
  }

  /**
   * Retrieves all 5 cohort patients.
   */
  public static getAllCohorts(): PatientCohortData[] {
    return COHORT_DATABASE;
  }
}
