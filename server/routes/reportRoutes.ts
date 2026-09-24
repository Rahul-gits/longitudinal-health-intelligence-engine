import { Router, Request, Response } from 'express';

const router = Router();

// FHIR R4 Bundle Generator for Eleanor Vance
export const generateFHIRBundle = () => {
  return {
    resourceType: 'Bundle',
    id: 'heal-engine-bundle-ev-2026',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: 'urn:uuid:patient-eleanor-vance',
        resource: {
          resourceType: 'Patient',
          id: 'patient-ev-68',
          name: [{ use: 'official', family: 'Vance', given: ['Eleanor'] }],
          gender: 'female',
          birthDate: '1958-04-12',
          telecom: [{ system: 'phone', value: '555-019-4829' }]
        }
      },
      {
        fullUrl: 'urn:uuid:condition-hfpef',
        resource: {
          resourceType: 'Condition',
          clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
          code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'I50.32', display: 'Chronic systolic heart failure / HFpEF' }] },
          subject: { reference: 'Patient/patient-ev-68' }
        }
      },
      {
        fullUrl: 'urn:uuid:observation-potassium',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '2823-3', display: 'Potassium [Moles/volume] in Serum or Plasma' }] },
          valueQuantity: { value: 5.3, unit: 'mEq/L', system: 'http://unitsofmeasure.org' },
          interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'High' }] }]
        }
      },
      {
        fullUrl: 'urn:uuid:careplan-decongestion',
        resource: {
          resourceType: 'CarePlan',
          status: 'active',
          intent: 'order',
          title: 'HEAL Engine Acute Cardiorenal Decongestion Plan',
          description: 'Step up oral Furosemide to 60mg daily x 3 days; Hold Spironolactone 25mg; Repeat BMP in 48 hours.',
          subject: { reference: 'Patient/patient-ev-68' }
        }
      }
    ]
  };
};

// POST /api/reports/analyze
router.post('/analyze', (req: Request, res: Response) => {
  const { rawText } = req.body;
  res.json({
    success: true,
    analyzedAt: new Date().toISOString(),
    extractedEntities: {
      conditionsFound: ['Heart Failure with Preserved Ejection Fraction', 'CKD 3b', 'Hyperkalemia Risk'],
      biomarkers: {
        potassium: '5.3 mEq/L (High)',
        egfr: '38 mL/min/1.73m2 (Moderate-Severe reduction)',
        bnp: '840 pg/mL (Elevated)'
      },
      recommendedAction: 'Execute Step 5 Consensus Decongestion Protocol.'
    },
    rawSnippet: rawText ? (rawText.slice(0, 100) + '...') : 'Default Eleanor Vance Clinical Record'
  });
});

// GET /api/reports/fhir
router.get('/fhir', (_req: Request, res: Response) => {
  const fhir = generateFHIRBundle();
  res.json({
    success: true,
    fhirBundle: fhir
  });
});

// GET /api/reports/summary/:patientId
router.get('/summary/:patientId', (req: Request, res: Response) => {
  res.json({
    success: true,
    patientId: req.params.patientId,
    generatedAt: new Date().toISOString(),
    clinicalExecutiveSummary: '68-year-old female with HFpEF and CKD Stage 3b exhibiting rapid +3.2 kg volume expansion and mild hyperkalemia (K+ 5.3 mEq/L). HEAL Engine multi-agent consensus mandates stepped-up Loop Diuretic (Furosemide 60mg) and temporary hold of Spironolactone with a 48h repeat metabolic panel.',
    patientFriendlySummary: 'You have gained extra water weight over the last few days, which is making it harder to breathe lying down. We are slightly increasing your morning water pill for 3 days and having you pause your white Spironolactone pill. You will do a quick blood test in 2 days to make sure your kidneys and potassium levels are safe.'
  });
});

export default router;
