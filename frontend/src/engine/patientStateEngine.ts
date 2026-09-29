import { PatientClinicalState } from '../types/health';
import { AuthUser, getStoredUser } from '../services/authApi';
import { calculateAgeFromDob, getDynamicPatientProfile } from '../data/mockPatientData';

export class PatientStateEngine {
  private userReportedSymptoms: { value: string; date: string; source: string; confidence: 'High' | 'Moderate' | 'Low' }[] = [];

  public addReportedSymptom(symptomText: string, source: string = 'Virtual Doctor Screening') {
    this.userReportedSymptoms.unshift({
      value: symptomText,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      source,
      confidence: 'High'
    });
  }

  public getPatientState(userOverride?: AuthUser | null): PatientClinicalState {
    const user = userOverride !== undefined ? userOverride : getStoredUser();
    const dynamicProfile = getDynamicPatientProfile(user);

    const conditionsList = dynamicProfile.conditions.map((c, idx) => ({
      value: c,
      date: '2025-03-15',
      source: 'User Health Onboarding & EHR Feeds',
      confidence: 'High' as const,
      validityPeriod: 'Ongoing'
    }));

    const medicationsList = dynamicProfile.medications.map((m, idx) => ({
      id: `med-${idx + 1}`,
      name: m,
      dosage: m.includes('mg') ? '' : 'Standard Dose',
      frequency: 'Daily',
      startDate: '2026-01-10',
      status: (m.toLowerCase().includes('ibuprofen') || m.toLowerCase().includes('nsaid') ? 'otc' : 'active') as 'active' | 'otc',
      purpose: 'Chronic Management & Risk Mitigation',
      potentialInteractions: m.toLowerCase().includes('ibuprofen') ? ['Lisinopril (Acute Kidney Injury Hazard)'] : [],
      knownAllergies: []
    }));

    const allergiesList = dynamicProfile.allergies.map(a => ({
      value: a,
      date: '2024-05-04',
      source: 'Patient Health Setup Record',
      confidence: 'High' as const
    }));

    const defaultSymptoms = [
      { value: 'Exertional Dyspnea (Grade II)', date: '2026-08-10', source: 'Patient Symptom Log', confidence: 'High' as const },
      { value: 'Bilateral Leg Swelling (2+ Pitting Edema)', date: '2026-08-11', source: 'Clinical Exam', confidence: 'High' as const },
      { value: 'Right Knee Joint Pain (6/10)', date: '2026-08-12', source: 'Daily Pain Diary', confidence: 'High' as const }
    ];

    const allSymptoms = [...this.userReportedSymptoms, ...defaultSymptoms];

    return {
      versionId: 'v1.4.2',
      versionTimestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stateDelta: `Longitudinal State verified for ${dynamicProfile.name}: ${conditionsList.length} active conditions, ${medicationsList.length} medications, ${allSymptoms.length} symptom records tracked.`,
      demographics: {
        id: dynamicProfile.id,
        name: dynamicProfile.name,
        age: dynamicProfile.age,
        gender: dynamicProfile.gender,
        bloodType: dynamicProfile.bloodType,
        primaryPhysician: dynamicProfile.primaryPhysician
      },
      conditions: conditionsList,
      symptoms: allSymptoms,
      medications: medicationsList,
      allergies: allergiesList,
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
        { id: 'ev-1', year: 2025, date: '2025-06-14', title: 'Annual Checkup', category: 'consultation', summary: `Baseline recorded for ${dynamicProfile.name}. Stable clinical markers.`, impact: 'stable', relatedClusterIds: ['history', 'reports'] },
        { id: 'ev-2', year: 2026, date: '2026-07-20', title: 'Initiated OTC Analgesics', category: 'medication', summary: 'Patient started taking OTC Ibuprofen 400mg 3x weekly for joint pain.', impact: 'worsened', relatedClusterIds: ['medication', 'risk'] },
        { id: 'ev-3', year: 2026, date: '2026-08-10', title: 'Renal Panel Lab Draw', category: 'lab', summary: 'eGFR dropped 18.7% to 52 mL/min. Creatinine rose to 1.45 mg/dL.', impact: 'worsened', relatedClusterIds: ['reports', 'risk'] }
      ],
      lastUpdated: dynamicProfile.lastUpdated
    };
  }

  public computeTrajectoryDelta(): {
    whatChanged: string[];
    patientStatus: 'improving' | 'deteriorating' | 'stable';
    riskTrajectoryScore: number;
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

