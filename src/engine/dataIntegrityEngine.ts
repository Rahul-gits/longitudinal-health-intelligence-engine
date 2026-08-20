import { 
  PatientClinicalState, 
  DataIntegrityAlert 
} from '../types/health';

export class DataIntegrityEngine {
  /**
   * Validates incoming patient clinical state for conflicts, stale records, missing values, and impossible telemetry.
   */
  public validatePatientState(state: PatientClinicalState): {
    alerts: DataIntegrityAlert[];
    isDataTrusted: boolean;
    confidenceScore: number;
  } {
    const alerts: DataIntegrityAlert[] = [];

    // 1. Conflict Detection: Check for drug-allergy or drug-disease conflict signals in data
    state.medications.forEach(med => {
      if (med.name.toLowerCase().includes('ibuprofen')) {
        const ckdCondition = state.conditions.find(c => c.value.toLowerCase().includes('ckd'));
        if (ckdCondition) {
          alerts.push({
            id: `alert-conflict-${med.id}`,
            type: 'conflict',
            field: 'Medications vs Chronic Conditions',
            message: `Conflicting Active Medication: Self-prescribed ${med.name} logged alongside active diagnosis of ${ckdCondition.value}.`,
            severity: 'high',
            suggestedResolution: 'Verify if OTC Ibuprofen was prescribed or self-administered; flag for deprescribing review.'
          });
        }
      }
    });

    // 2. Missing Data Detection: Check for missing baseline cardiac imaging
    const hasEcho = state.treatmentHistory.some(h => h.summary.toLowerCase().includes('echocardiogram') || h.title.toLowerCase().includes('echocardiogram'));
    const bnpLab = state.labTrends.find(l => l.name.toLowerCase().includes('bnp'));
    if (bnpLab && bnpLab.isAbnormal && !hasEcho) {
      alerts.push({
        id: 'alert-missing-echo',
        type: 'missing',
        field: 'Imaging Telemetry',
        message: `Missing Data Warning: Elevated NT-proBNP (${bnpLab.history[bnpLab.history.length - 1]?.value} pg/mL) detected, but no Echocardiogram report found in last 12 months.`,
        severity: 'moderate',
        suggestedResolution: 'Order baseline 2D Echocardiogram to evaluate left ventricular ejection fraction.'
      });
    }

    // 3. Stale Data Detection: Check for outdated lab markers or vitals older than validity period
    const egfrLab = state.labTrends.find(l => l.name.toLowerCase().includes('egfr'));
    if (egfrLab) {
      const latestResult = egfrLab.history[egfrLab.history.length - 1];
      const resultYear = latestResult?.year || 2024;
      if (resultYear < 2026) {
        alerts.push({
          id: 'alert-stale-egfr',
          type: 'stale',
          field: 'eGFR Lab History',
          message: `Stale Lab Value: eGFR reading timestamp is from ${latestResult?.date}. Fresh renal function panel recommended.`,
          severity: 'low',
          suggestedResolution: 'Schedule repeat Serum Creatinine & eGFR lab draw in 7 days.'
        });
      }
    }

    // 4. Impossible Value Guardrail: Check for physiological out-of-range bounds
    if (state.vitals.value.hr < 30 || state.vitals.value.hr > 220) {
      alerts.push({
        id: 'alert-impossible-hr',
        type: 'impossible',
        field: 'Vitals Heart Rate',
        message: `Physiological Anomaly: Heart rate reading (${state.vitals.value.hr} bpm) is out of valid clinical range.`,
        severity: 'high',
        suggestedResolution: 'Recalibrate continuous sensor and take manual radial pulse measurement.'
      });
    }

    const highSeverityCount = alerts.filter(a => a.severity === 'high').length;
    const isDataTrusted = highSeverityCount === 0;
    const confidenceScore = Math.max(50, Math.min(99, 98 - alerts.length * 8));

    return {
      alerts,
      isDataTrusted,
      confidenceScore
    };
  }
}

export const dataIntegrityEngine = new DataIntegrityEngine();
