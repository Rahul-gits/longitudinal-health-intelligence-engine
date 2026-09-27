import { Router, Request, Response } from 'express';
import { PatientIntegrityService, COHORT_DATABASE } from '../services/patientIntegrityService';
import { KnowledgeGovernanceService } from '../services/knowledgeGovernanceService';
import { ClinicalValidationHarnessService } from '../services/clinicalValidationHarnessService';
import { securityAuditLogs } from '../middleware/securityHardeningMiddleware';

const router = Router();

/**
 * 1. Get all 5 patient cohorts
 */
router.get('/cohorts', (_req: Request, res: Response) => {
  res.json({
    success: true,
    totalCohorts: COHORT_DATABASE.length,
    cohorts: COHORT_DATABASE.map(c => ({
      patientId: c.patientId,
      cohortLabel: c.cohortLabel,
      name: c.name,
      age: c.age,
      gender: c.gender,
      clinicalPhenotype: c.clinicalPhenotype,
      riskTier: c.riskTier,
      conditionsCount: c.conditions.length,
      medicationsCount: c.medications.length,
      allergiesCount: c.allergies.length,
      observationsCount: c.observations.length,
      specialistDirectivesCount: c.specialistDirectives.length,
      isPregnant: c.isPregnant || false
    }))
  });
});

/**
 * 2. Get specific patient cohort details
 */
router.get('/cohort/:patientId', (req: Request, res: Response) => {
  const patient = PatientIntegrityService.getPatientById(req.params.patientId as string);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient cohort not found' });
  }

  const integrityReport = PatientIntegrityService.validateRecordIntegrity(patient);
  const reasoningTrace = KnowledgeGovernanceService.generateReasoningTrace(
    patient.patientId,
    patient.cohortLabel,
    patient.clinicalPhenotype
  );

  res.json({
    success: true,
    patient,
    integrityReport,
    reasoningTrace
  });
});

/**
 * 3. Run Integrity Validation on a cohort
 */
router.get('/integrity/:patientId', (req: Request, res: Response) => {
  const patient = PatientIntegrityService.getPatientById(req.params.patientId as string);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient cohort not found' });
  }

  const report = PatientIntegrityService.validateRecordIntegrity(patient);
  res.json({
    success: true,
    report
  });
});

/**
 * 4. Get Governed Guideline Catalog
 */
router.get('/evidence-catalog', (req: Request, res: Response) => {
  const domain = req.query.domain as string | undefined;
  const query = (req.query.q as string) || '';

  const evidence = query
    ? KnowledgeGovernanceService.queryGovernedEvidence(query, domain)
    : KnowledgeGovernanceService.getGovernedCatalog();

  res.json({
    success: true,
    totalGuidelines: evidence.length,
    catalog: evidence
  });
});

/**
 * 5. Get Clinical Reasoning Trace & Explainability Output
 */
router.get('/reasoning-trace/:patientId', (req: Request, res: Response) => {
  const patient = PatientIntegrityService.getPatientById(req.params.patientId as string);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient cohort not found' });
  }

  const trace = KnowledgeGovernanceService.generateReasoningTrace(
    patient.patientId,
    patient.cohortLabel,
    patient.clinicalPhenotype
  );

  res.json({
    success: true,
    trace
  });
});

/**
 * 6. Run the Full Clinical Validation Harness
 */
const executeHarnessHandler = (_req: Request, res: Response) => {
  const harnessReport = ClinicalValidationHarnessService.runFullHarness();
  res.json({
    success: true,
    harnessReport
  });
};

router.get('/run-harness', executeHarnessHandler);
router.post('/run-harness', executeHarnessHandler);

/**
 * 7. Get Security Audit Logs
 */
router.get('/security-logs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    totalLogs: securityAuditLogs.length,
    logs: securityAuditLogs.slice(-50).reverse()
  });
});

export default router;
