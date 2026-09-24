import { Router, Request, Response } from 'express';

const router = Router();

export interface SafetyCheckItem {
  ruleId: string;
  category: 'DRUG_DRUG' | 'RENAL_CUTOFF' | 'HYPERKALEMIA' | 'CONTRAINDICATION' | 'HEPATIC';
  severity: 'HARD_STOP' | 'HIGH_WARNING' | 'MODERATE_CAUTION' | 'SAFE_PASS';
  title: string;
  details: string;
  actionRequired: string;
  passed: boolean;
}

export const runSafetyAudit = (proposedInterventions?: string[]): { safeToExecute: boolean; hardStopsCount: number; warningsCount: number; checks: SafetyCheckItem[] } => {
  const checks: SafetyCheckItem[] = [
    {
      ruleId: 'RULE-K-MRA-01',
      category: 'HYPERKALEMIA',
      severity: 'HARD_STOP',
      title: 'MRA Hyperkalemia Ceiling Check (Serum K+ > 5.0 mEq/L)',
      details: 'Patient serum potassium is 5.3 mEq/L. Spironolactone up-titration or continuation is unsafe without down-titration or temporary hold.',
      actionRequired: 'Block Spironolactone escalation. Mandate temporary hold.',
      passed: false
    },
    {
      ruleId: 'RULE-RENAL-MET-02',
      category: 'RENAL_CUTOFF',
      severity: 'HIGH_WARNING',
      title: 'Metformin eGFR Safety Boundary (Threshold < 30 mL/min)',
      details: 'Patient eGFR is 38 mL/min (CKD Stage 3b). Safe to continue at 500mg BID, but require monitoring if eGFR decreases below 30 mL/min.',
      actionRequired: 'Maintain 500mg BID, trigger re-check BMP within 48h.',
      passed: true
    },
    {
      ruleId: 'RULE-SGLT2-CKD-03',
      category: 'RENAL_CUTOFF',
      severity: 'SAFE_PASS',
      title: 'SGLT2i Cardiorenal Protection Validation (eGFR >= 20 mL/min)',
      details: 'Empagliflozin 10mg daily is strongly recommended in HFpEF and CKD Stage 3b for long-term cardiorenal event reduction.',
      actionRequired: 'Continue current therapy uninterrupted.',
      passed: true
    },
    {
      ruleId: 'RULE-NSAID-04',
      category: 'CONTRAINDICATION',
      severity: 'HARD_STOP',
      title: 'Absolute Contraindication: Systemic NSAIDs in HFpEF + CKD',
      details: 'NSAID administration will cause acute fluid retention and precipitate acute kidney injury (AKI).',
      actionRequired: 'Hard block any systemic NSAID prescriptions. Recommend topical or acetaminophen.',
      passed: false
    },
    {
      ruleId: 'RULE-DIURETIC-TITRATION-05',
      category: 'DRUG_DRUG',
      severity: 'SAFE_PASS',
      title: 'Loop Diuretic Titration Protocol',
      details: 'Increasing Furosemide to 60mg PO daily is safe given BP 148/92 mmHg and significant peripheral and pulmonary fluid accumulation.',
      actionRequired: 'Approve dose step-up with 48h weight & BMP monitoring.',
      passed: true
    }
  ];

  const hardStopsCount = checks.filter(c => c.severity === 'HARD_STOP' && !c.passed).length;
  const warningsCount = checks.filter(c => c.severity === 'HIGH_WARNING').length;

  return {
    safeToExecute: hardStopsCount === 0,
    hardStopsCount,
    warningsCount,
    checks
  };
};

// POST /api/safety/check
router.post('/check', (req: Request, res: Response) => {
  const { proposedInterventions } = req.body;
  const audit = runSafetyAudit(proposedInterventions);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    audit
  });
});

// GET /api/safety/rules
router.get('/rules', (_req: Request, res: Response) => {
  const audit = runSafetyAudit();
  res.json({
    success: true,
    rules: audit.checks
  });
});

export default router;
