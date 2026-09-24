import { Router, Request, Response } from 'express';

const router = Router();

export interface ConferenceDebateTurn {
  speakerId: string;
  speakerName: string;
  role: string;
  stance: 'AGREE' | 'CHALLENGE' | 'SYNTHESIZE' | 'WARN';
  avatarColor: string;
  statement: string;
  evidenceCitation: string;
  confidence: number;
}

export const generateDebateRounds = (): { topic: string; consensusScore: number; turns: ConferenceDebateTurn[]; resolution: string } => {
  return {
    topic: 'Case Conference: Acute Hyperkalemia (5.3 mEq/L) vs Congestion Escalation in Eleanor Vance (HFpEF + CKD 3b)',
    consensusScore: 0.94,
    turns: [
      {
        speakerId: 'dr-thorne-cardio',
        speakerName: 'Dr. Aris Thorne (Cardiologist)',
        role: 'Cardiology Lead',
        stance: 'CHALLENGE',
        avatarColor: '#FF5C00',
        statement: 'Eleanor is showing early signs of pulmonary and peripheral volume overload (weight +3.2 kg, NT-proBNP 840 pg/mL). We must increase Furosemide to 60 mg immediately to avert an emergency admission.',
        evidenceCitation: 'ACC/AHA 2023 Heart Failure Management Guidelines Section 7.3.2',
        confidence: 0.97
      },
      {
        speakerId: 'dr-chen-nephro',
        speakerName: 'Dr. Evelyn Chen (Nephrologist)',
        role: 'Nephrology Lead',
        stance: 'WARN',
        avatarColor: '#3A86FF',
        statement: 'I agree with diuretic stepping, but we must protect her renal baseline. With eGFR 38 mL/min and Potassium at 5.3 mEq/L, continuing Spironolactone 25mg is hazardous. We must temporarily hold Spironolactone.',
        evidenceCitation: 'KDIGO 2024 Clinical Practice Guideline for CKD, Chapter 3.1: Potassium Guardrails',
        confidence: 0.98
      },
      {
        speakerId: 'dr-alvarez-pharm',
        speakerName: 'Dr. Marcus Alvarez (PharmD)',
        role: 'Clinical Pharmacologist',
        stance: 'SYNTHESIZE',
        avatarColor: '#00F5D4',
        statement: 'From a pharmacokinetic perspective, holding Spironolactone will allow Potassium clearance within 36-48 hours while Furosemide 60mg induces adequate natriuresis without acute tubular injury.',
        evidenceCitation: 'ASHP Therapeutic Guidelines on Diuretic & Aldosterone Antagonist Titration',
        confidence: 0.95
      },
      {
        speakerId: 'dr-patel-gerio',
        speakerName: 'Dr. Maya Patel (Geriatrician)',
        role: 'Geriatric Specialist',
        stance: 'AGREE',
        avatarColor: '#FF70A6',
        statement: 'Agreed. For Eleanor, we also need to prevent orthostatic dizziness. We should instruct her to take the extra diuretic with breakfast and check sitting vs standing BP.',
        evidenceCitation: 'AGS Beers Criteria 2023 for Frail Multimorbid Older Adults',
        confidence: 0.92
      },
      {
        speakerId: 'advocate-sarah',
        speakerName: 'Sarah Jenkins (Patient Care Coordinator)',
        role: 'Patient Advocate',
        stance: 'SYNTHESIZE',
        avatarColor: '#FFE600',
        statement: 'I will ensure Eleanor receives clear color-coded instructions on her mobile dashboard: take the morning water pill, skip the white tablet for 2 days, and attend the lab draw on Friday.',
        evidenceCitation: 'AHA Health Literacy & Adherence Best Practices 2022',
        confidence: 0.96
      }
    ],
    resolution: 'Consensus reached: 1) Increase Furosemide to 60mg daily x 3 days. 2) Hold Spironolactone 25mg pending repeat BMP in 48h. 3) Retain SGLT2i & Metformin. 4) Schedule 48h repeat serum K+ and eGFR.'
  };
};

// POST /api/conference/debate
router.post('/debate', (_req: Request, res: Response) => {
  const debate = generateDebateRounds();
  res.json({
    success: true,
    debate
  });
});

// GET /api/conference/latest
router.get('/latest', (_req: Request, res: Response) => {
  const debate = generateDebateRounds();
  res.json({
    success: true,
    debate
  });
});

export default router;
