import { LAB_MARKERS } from '../data/mockPatientData';
import { LabMarker } from '../types/health';

export interface CrossReportComparisonResult {
  improved: { marker: string; from: string; to: string; detail: string }[];
  worsened: { marker: string; from: string; to: string; detail: string }[];
  stable: { marker: string; value: string; detail: string }[];
  newlyAbnormal: { marker: string; value: string; detail: string }[];
  summary: string;
}

export class ReportEngine {
  public static getLabMarkers(): LabMarker[] {
    return LAB_MARKERS;
  }

  public static compareReports(previousYear: number = 2025, currentYear: number = 2026): CrossReportComparisonResult {
    const improved: { marker: string; from: string; to: string; detail: string }[] = [];
    const worsened: { marker: string; from: string; to: string; detail: string }[] = [];
    const stable: { marker: string; value: string; detail: string }[] = [];
    const newlyAbnormal: { marker: string; value: string; detail: string }[] = [];

    for (const marker of LAB_MARKERS) {
      const prevEntry = marker.history.find(h => h.year === previousYear);
      const currEntry = marker.history.find(h => h.year === currentYear);

      if (prevEntry && currEntry) {
        const fromStr = `${prevEntry.value} ${marker.unit}`;
        const toStr = `${currEntry.value} ${marker.unit}`;

        if (marker.name.includes('eGFR')) {
          if (currEntry.value < prevEntry.value) {
            worsened.push({ marker: marker.name, from: fromStr, to: toStr, detail: 'Decline of 12 units (Stage 2 -> Stage 3a shift)' });
            newlyAbnormal.push({ marker: marker.name, value: toStr, detail: 'Dropped below 60 mL/min threshold' });
          } else if (currEntry.value > prevEntry.value) {
            improved.push({ marker: marker.name, from: fromStr, to: toStr, detail: 'Glomerular filtration improvement' });
          } else {
            stable.push({ marker: marker.name, value: toStr, detail: 'Kidney filtration stable' });
          }
        } else if (marker.name.includes('Creatinine')) {
          if (currEntry.value > prevEntry.value) {
            worsened.push({ marker: marker.name, from: fromStr, to: toStr, detail: 'Elevated serum creatinine indicating reduced excretion' });
          } else {
            stable.push({ marker: marker.name, value: toStr, detail: 'Stable serum level' });
          }
        } else if (marker.name.includes('BNP')) {
          if (currEntry.value > prevEntry.value) {
            worsened.push({ marker: marker.name, from: fromStr, to: toStr, detail: 'Significant rise (110 -> 480 pg/mL), indicating cardiac wall stretch' });
            newlyAbnormal.push({ marker: marker.name, value: toStr, detail: 'Exceeds reference upper limit of 125 pg/mL' });
          } else {
            stable.push({ marker: marker.name, value: toStr, detail: 'Normal cardiac biomarker' });
          }
        } else if (marker.name.includes('HbA1c')) {
          if (currEntry.value < prevEntry.value) {
            improved.push({ marker: marker.name, from: fromStr, to: toStr, detail: 'Glycemic control improved under Metformin therapy' });
          } else {
            stable.push({ marker: marker.name, value: toStr, detail: 'Glycemic level controlled' });
          }
        }
      }
    }

    return {
      improved,
      worsened,
      stable,
      newlyAbnormal,
      summary: `Between ${previousYear} and ${currentYear}, 2 biomarkers worsened (eGFR dropped, NT-proBNP rose), 1 improved (HbA1c lowered to 6.7%), and 2 items flagged newly abnormal requiring clinician follow-up.`
    };
  }

  // Simulates OCR processing of a user-uploaded PDF or image report
  public static processUploadedReport(fileName: string): {
    extractedEntities: { name: string; value: string; status: 'normal' | 'abnormal' | 'warning' }[];
    ocrTextSnippet: string;
    confidenceScore: number;
  } {
    return {
      extractedEntities: [
        { name: 'Serum Creatinine', value: '1.45 mg/dL', status: 'abnormal' },
        { name: 'eGFR', value: '52 mL/min/1.73m²', status: 'abnormal' },
        { name: 'Blood Urea Nitrogen (BUN)', value: '28 mg/dL', status: 'warning' },
        { name: 'Serum Potassium', value: '4.6 mEq/L', status: 'normal' },
        { name: 'NT-proBNP', value: '480 pg/mL', status: 'abnormal' }
      ],
      ocrTextSnippet: `QUEST DIAGNOSTICS - CLINICAL LABORATORY REPORT\nPatient: Eleanor Vance | DOB: 1962-03-11 | Order Date: 2026-08-10\nSPECIMEN: Blood\nCREATININE: 1.45 H (Ref: 0.60-1.10 mg/dL)\neGFR: 52 L (Ref: >60 mL/min/1.73m2)\nNT-proBNP: 480 H (Ref: <125 pg/mL)\nValidated by Pathologist Dr. R. Mehta, MD`,
      confidenceScore: 98.4
    };
  }
}
