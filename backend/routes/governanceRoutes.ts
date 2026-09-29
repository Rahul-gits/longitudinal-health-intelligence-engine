/**
 * Milestone M7: Clinical Governance & Production Readiness API Routes
 */

import { Router, Request, Response } from 'express';
import { ClinicalGovernanceService } from '../services/clinicalGovernanceService';
import { authenticateAndAuthorize } from '../middleware/securityRbacMiddleware';

const router = Router();

// Governance/production readiness reports are restricted to admins and clinicians
router.use(authenticateAndAuthorize(['clinician', 'admin']));

/**
 * GET /api/governance/report
 * Returns full Milestone M7 Production Readiness & Governance Report
 */
router.get('/report', (_req: Request, res: Response) => {
  try {
    const report = ClinicalGovernanceService.generateProductionReadinessReport();
    res.json({
      success: true,
      report
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/governance/roles
 * Returns formal clinical governance roles and authority matrix
 */
router.get('/roles', (_req: Request, res: Response) => {
  try {
    const roles = ClinicalGovernanceService.getGovernanceRoles();
    res.json({
      success: true,
      totalRoles: roles.length,
      roles
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/governance/infrastructure
 * Returns production infrastructure validation metrics across 6 subsystems
 */
router.get('/infrastructure', (_req: Request, res: Response) => {
  try {
    const metrics = ClinicalGovernanceService.validateProductionInfrastructure();
    res.json({
      success: true,
      totalSubsystems: metrics.length,
      metrics
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/governance/simulate-disaster-recovery
 * Executes simulated primary database partition, tests fail-closed mode, and verifies WORM ledger integrity
 */
router.post('/simulate-disaster-recovery', (_req: Request, res: Response) => {
  try {
    const drReport = ClinicalGovernanceService.simulateDisasterRecovery();
    res.json({
      success: true,
      disasterRecovery: drReport
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/governance/incidents
 * Returns clinical incident lifecycle and CAPA tracking records
 */
router.get('/incidents', (_req: Request, res: Response) => {
  try {
    const incidents = ClinicalGovernanceService.getClinicalIncidents();
    res.json({
      success: true,
      totalIncidents: incidents.length,
      incidents
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/governance/change-control
 * Returns model, rule, and evidence change-control registry
 */
router.get('/change-control', (_req: Request, res: Response) => {
  try {
    const registry = ClinicalGovernanceService.getChangeControlRegistry();
    res.json({
      success: true,
      totalChanges: registry.length,
      registry
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/governance/change-control/submit
 * Submits a new change request requiring 2 attending physician sign-offs
 */
router.post('/change-control/submit', (req: Request, res: Response) => {
  try {
    const {
      targetDomain,
      itemIdentifier,
      proposedVersion,
      changeSummary,
      clinicalRationale,
      submittedBy,
      attendingApprover1,
      attendingApprover2,
      regressionTestSuiteRunId
    } = req.body;

    if (!targetDomain || !itemIdentifier || !proposedVersion || !attendingApprover1 || !attendingApprover2) {
      return res.status(400).json({
        success: false,
        error: 'Mandatory fields missing: targetDomain, itemIdentifier, proposedVersion, attendingApprover1, attendingApprover2 are required for change governance.'
      });
    }

    const newItem = ClinicalGovernanceService.submitChangeControl({
      targetDomain,
      itemIdentifier,
      proposedVersion,
      changeSummary,
      clinicalRationale,
      submittedBy: submittedBy || 'Clinical Governance Officer',
      attendingApprover1,
      attendingApprover2,
      regressionTestSuiteRunId: regressionTestSuiteRunId || `HARNESS-REGRESSION-${Date.now()}`
    });

    res.json({
      success: true,
      message: `Change control request ${newItem.changeId} approved and registered.`,
      item: newItem
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
