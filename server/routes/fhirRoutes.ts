/**
 * SMART on FHIR & EHR Interoperability Routes (Milestone M3)
 * 
 * Provides:
 * - SMART App Launch v2.0.0 Configuration Discovery (/.well-known/smart-configuration)
 * - OAuth2 Token Exchange & Context Binding (/oauth/token)
 * - FHIR R4 Resource Ingestion & Canonical Normalization (/Patient, /Observation, /Condition, /MedicationRequest, etc.)
 * - SMART CDS Hooks v1.4 Services (/cds-services/medication-prescribe, /cds-services/patient-view)
 * - Cross-Patient Boundary Testing (EHR Patient A -> Heal Patient B FAIL-CLOSED)
 * - Automated M3 Verification Suite (/m3-verification-suite)
 */

import { Router, Request, Response } from 'express';
import { FhirInteroperabilityService } from '../services/fhirInteroperabilityService';
import { fhirCdsHooksService } from '../services/fhirCdsHooksService';

const router = Router();

/**
 * 1. SMART on FHIR Discovery Endpoint
 * GET /.well-known/smart-configuration
 */
router.get('/.well-known/smart-configuration', (req: Request, res: Response) => {
  const host = `${req.protocol}://${req.get('host')}`;
  res.json(FhirInteroperabilityService.getSmartConfiguration(host));
});

/**
 * 2. OAuth2 Token Exchange Endpoint
 * POST /oauth/token
 */
router.post('/oauth/token', (req: Request, res: Response) => {
  const patientId = req.body.patient || 'patient-ev-68';
  const scope = req.body.scope || 'patient/*.read launch/patient';
  const token = FhirInteroperabilityService.issueSmartToken(patientId, scope);
  res.json(token);
});

/**
 * 3. Ingestion of Single FHIR R4 Resource
 * POST /:resourceType
 */
const handleResourceIngest = (req: Request, res: Response) => {
  const targetPatientId = (req.query.patientId as string) || (req.headers['x-patient-id'] as string) || req.body.subject?.reference?.replace('Patient/', '') || 'patient-ev-68';
  const sourceOrigin = (req.headers['x-origin-ehr'] as string) || 'Epic-FHIR-R4-Outpatient';

  const result = FhirInteroperabilityService.ingestAndNormalizeResource(
    req.body,
    targetPatientId,
    sourceOrigin
  );

  if (!result.success) {
    return res.status(result.statusCode).json(result.outcome);
  }

  res.status(200).json({
    success: true,
    message: `Resource '${req.body.resourceType}/${req.body.id || 'new'}' successfully normalized into Canonical Heal Engine Schema.`,
    canonicalFact: result.canonicalFact
  });
};

router.post('/Patient', handleResourceIngest);
router.post('/Observation', handleResourceIngest);
router.post('/Condition', handleResourceIngest);
router.post('/MedicationRequest', handleResourceIngest);
router.post('/MedicationStatement', handleResourceIngest);
router.post('/AllergyIntolerance', handleResourceIngest);
router.post('/DiagnosticReport', handleResourceIngest);
router.post('/CarePlan', handleResourceIngest);
router.post('/Encounter', handleResourceIngest);

/**
 * 4. Get Normalized Canonical Patient State
 * GET /CanonicalPatient/:id
 */
router.get('/CanonicalPatient/:id', (req: Request, res: Response) => {
  const state = FhirInteroperabilityService.getCanonicalPatientState(req.params.id as string);
  if (!state) {
    const outcome = FhirInteroperabilityService.createOperationOutcome(
      'error',
      'not-found',
      `Canonical state for patient '${req.params.id}' not found in active EHR integration cache.`
    );
    return res.status(404).json(outcome);
  }
  res.json({
    success: true,
    canonicalPatientState: state
  });
});

/**
 * 5. SMART-on-FHIR CDS Hooks v1.4 Endpoints
 */
router.get('/cds-services', (_req: Request, res: Response) => {
  res.json({
    services: [
      {
        hook: 'medication-prescribe',
        name: 'Heal Engine Cardiorenal Prescribing Gating Service',
        description: 'Evaluates longitudinal eGFR, potassium, and drug interactions under KDIGO 2024 / AHA 2023 guidelines.',
        id: 'heal-engine-med-prescribe',
        prefetch: {
          patient: 'Patient/{{context.patientId}}',
          medications: 'MedicationRequest?patient={{context.patientId}}&status=active'
        }
      },
      {
        hook: 'patient-view',
        name: 'Heal Engine Longitudinal Patient State Overview Service',
        description: 'Presents summarized attention items, acute biomarker deltas, and evidence citations when patient chart opens.',
        id: 'heal-engine-patient-view',
        prefetch: {
          patient: 'Patient/{{context.patientId}}'
        }
      }
    ]
  });
});

router.post('/cds-services/medication-prescribe', (req: Request, res: Response) => {
  const response = fhirCdsHooksService.handleMedicationPrescribe(req.body);
  res.json(response);
});

router.post('/cds-services/patient-view', (req: Request, res: Response) => {
  const response = fhirCdsHooksService.handlePatientView(req.body);
  res.json(response);
});

/**
 * 6. Critical Security Test: Deliberate Identity Mismatch Injection
 * POST /test-identity-boundary
 */
router.post('/test-identity-boundary', (_req: Request, res: Response) => {
  const boundaryReport = FhirInteroperabilityService.testPatientIdentityBoundary();
  res.json({
    success: true,
    boundaryReport
  });
});

/**
 * 7. Run Full Milestone M3 Automated Verification Suite
 * GET & POST /m3-verification-suite
 */
const executeM3Suite = (_req: Request, res: Response) => {
  const report = FhirInteroperabilityService.runInteroperabilitySuite();
  res.json({
    success: true,
    m3Report: report
  });
};

router.get('/m3-verification-suite', executeM3Suite);
router.post('/m3-verification-suite', executeM3Suite);

export default router;
