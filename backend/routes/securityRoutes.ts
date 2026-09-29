import { Router, Request, Response } from 'express';
import { SecurityAssessmentService } from '../services/securityAssessmentService';
import { authenticateAndAuthorize } from '../middleware/securityRbacMiddleware';

const router = Router();

// Security assessment reports are admin-only (prevents attack surface disclosure)
router.use(authenticateAndAuthorize(['admin']));

/**
 * GET /api/security/m4-assessment-report
 * Returns the full Milestone M4 34-vector security assessment report.
 */
router.get('/m4-assessment-report', (_req: Request, res: Response) => {
  const report = SecurityAssessmentService.runSecurityAssessment();
  res.json({
    success: true,
    securityReport: report
  });
});

/**
 * POST /api/security/run-assessment
 * Re-executes the adversarial attack suite and returns the report.
 */
router.post('/run-assessment', (_req: Request, res: Response) => {
  const report = SecurityAssessmentService.runSecurityAssessment();
  res.json({
    success: true,
    securityReport: report
  });
});

/**
 * GET /api/security/vectors
 * Returns the list of all 34 attack vectors with metadata.
 */
router.get('/vectors', (_req: Request, res: Response) => {
  const report = SecurityAssessmentService.runSecurityAssessment();
  res.json({
    success: true,
    totalVectors: report.totalAttackVectors,
    vectors: report.results
  });
});

/**
 * GET /api/security/vector/:vectorId
 * Returns a specific attack vector by ID.
 */
router.get('/vector/:vectorId', (req: Request, res: Response) => {
  const report = SecurityAssessmentService.runSecurityAssessment();
  const vector = report.results.find(v => v.vectorId === req.params.vectorId);
  if (!vector) {
    return res.status(404).json({ success: false, error: 'Security attack vector not found' });
  }
  res.json({
    success: true,
    vector
  });
});

export default router;
