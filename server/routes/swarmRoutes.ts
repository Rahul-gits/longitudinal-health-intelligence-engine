import { Router, Request, Response } from 'express';

const router = Router();

export interface SwarmAgentParticle {
  id: string;
  name: string;
  specialty: string;
  avatarColor: string;
  weight: number; // importance weighting in PSO
  position: {
    diureticIntensity: number; // 0.0 to 1.0 (corresponds to 20mg - 120mg Furosemide)
    mraHoldConfidence: number; // 0.0 to 1.0 (confidence to hold Spironolactone)
    sglt2iContinuation: number; // 0.0 to 1.0 (confidence to maintain Empagliflozin)
    monitoringFrequencyDays: number; // 1 to 7 days for repeat BMP
  };
  fitnessScore: number;
  clinicalRationale: string;
  guidelineAnchor: string;
}

// Simulated PSO Multi-Agent Optimization Engine
export const simulateSwarmConvergence = (iterations: number = 25) => {
  const agents: SwarmAgentParticle[] = [
    {
      id: 'agent-cardiology',
      name: 'Agent Cardio (Heart Failure Specialist)',
      specialty: 'Cardiology',
      avatarColor: '#FF5C00',
      weight: 0.28,
      position: {
        diureticIntensity: 0.75, // Furosemide 60-80mg
        mraHoldConfidence: 0.85,
        sglt2iContinuation: 0.95,
        monitoringFrequencyDays: 2
      },
      fitnessScore: 0.96,
      clinicalRationale: 'Urgent decongestion required to decrease left ventricular filling pressures and prevent acute pulmonary edema.',
      guidelineAnchor: 'ACC/AHA 2023 HFpEF Class I Recommendation'
    },
    {
      id: 'agent-nephrology',
      name: 'Agent Nephro (Renal Preservation Specialist)',
      specialty: 'Nephrology',
      avatarColor: '#3A86FF',
      weight: 0.28,
      position: {
        diureticIntensity: 0.65, // Furosemide 60mg
        mraHoldConfidence: 0.98, // Strong vote to pause Spironolactone due to K+ 5.3 & eGFR 38
        sglt2iContinuation: 0.90,
        monitoringFrequencyDays: 2
      },
      fitnessScore: 0.95,
      clinicalRationale: 'Hyperkalemia hazard (K+ 5.3) in CKD 3b requires immediate Spironolactone hold; keep SGLT2i for long-term nephroprotection.',
      guidelineAnchor: 'KDIGO 2024 CKD Potassium Guardrails'
    },
    {
      id: 'agent-pharmacy',
      name: 'Agent PharmD (Precision Clinical Pharmacologist)',
      specialty: 'Clinical Pharmacology',
      avatarColor: '#00F5D4',
      weight: 0.18,
      position: {
        diureticIntensity: 0.70,
        mraHoldConfidence: 0.92,
        sglt2iContinuation: 0.92,
        monitoringFrequencyDays: 2
      },
      fitnessScore: 0.97,
      clinicalRationale: 'Dose transition to Furosemide 60mg PO has high bioavailability; Metformin requires monitoring against eGFR 30 threshold.',
      guidelineAnchor: 'ASHP Clinical Pharmacokinetics Standards'
    },
    {
      id: 'agent-geriatrics',
      name: 'Agent Gerio (Multimorbidity & Frailty Specialist)',
      specialty: 'Geriatric Medicine',
      avatarColor: '#FF70A6',
      weight: 0.14,
      position: {
        diureticIntensity: 0.60,
        mraHoldConfidence: 0.88,
        sglt2iContinuation: 0.88,
        monitoringFrequencyDays: 2
      },
      fitnessScore: 0.91,
      clinicalRationale: 'Avoid orthostatic hypotension and rapid over-diuresis in 68Y patient; provide clear pill-box instructions.',
      guidelineAnchor: 'Beers Criteria 2023 & AGS Guidelines'
    },
    {
      id: 'agent-patient-advocate',
      name: 'Agent Human Voice (Patient Preference & Adherence)',
      specialty: 'Patient Advocate & Health Literacy',
      avatarColor: '#FFE600',
      weight: 0.12,
      position: {
        diureticIntensity: 0.65,
        mraHoldConfidence: 0.90,
        sglt2iContinuation: 0.90,
        monitoringFrequencyDays: 2
      },
      fitnessScore: 0.93,
      clinicalRationale: 'Ensure Eleanor understands that holding one pill is temporary and knows when to take the extra morning diuretic tablet.',
      guidelineAnchor: 'AHA Health Literacy in Cardiovascular Disease'
    }
  ];

  // Convergence trajectory
  const convergenceTrajectory = [];
  for (let i = 1; i <= iterations; i++) {
    const progress = i / iterations;
    const globalBestFitness = +(0.72 + (0.965 - 0.72) * Math.sin(progress * (Math.PI / 2))).toFixed(4);
    const swarmVariance = +(0.45 * Math.exp(-progress * 3.5)).toFixed(4);
    convergenceTrajectory.push({
      iteration: i,
      globalBestFitness,
      swarmVariance,
      furosemideOptimalDoseMg: Math.round(40 + 20 * (1 - Math.exp(-progress * 2))),
      consensusPercent: +(80 + 16.5 * progress).toFixed(1)
    });
  }

  return {
    timestamp: new Date().toISOString(),
    totalIterations: iterations,
    particlesCount: agents.length,
    agents,
    globalConsensusVector: {
      diureticRecommendation: 'Furosemide 60 mg PO once daily in morning for 3 days',
      spironolactoneAction: 'HOLD Spironolactone 25 mg daily (Potassium cutoff > 5.0 mEq/L)',
      sglt2iAction: 'CONTINUE Empagliflozin 10 mg daily',
      metforminAction: 'CONTINUE Metformin 500 mg BID with strict renal panel in 48h',
      labOrder: 'BMP (Basic Metabolic Panel) + Potassium + eGFR in 48 hours',
      overallConsensusScore: 0.965,
      convergenceConfidence: 'HIGH_CONVERGENCE_ACHIEVED'
    },
    convergenceTrajectory
  };
};

// POST /api/swarm/simulate
router.post('/simulate', (req: Request, res: Response) => {
  const iterations = req.body.iterations || 25;
  const result = simulateSwarmConvergence(iterations);
  res.json({
    success: true,
    simulation: result
  });
});

// GET /api/swarm/agents
router.get('/agents', (_req: Request, res: Response) => {
  const result = simulateSwarmConvergence(5);
  res.json({
    success: true,
    agents: result.agents
  });
});

export default router;
