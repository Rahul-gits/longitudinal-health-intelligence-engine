import { Router, Request, Response } from 'express';

const router = Router();

interface ScreeningTurn {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  clinicalObservations?: string[];
  suggestedQuickReplies?: string[];
  riskIndicators?: {
    orthopnea: boolean;
    peripheralEdema: boolean;
    chestPain: boolean;
    fatigue: boolean;
  };
}

// Initial dialogue and question tree
export const screeningDialogueState: ScreeningTurn[] = [
  {
    id: 'turn-1',
    sender: 'doctor',
    text: 'Hello Eleanor, I am Dr. Maya, your HEAL Engine Virtual Specialist. I noticed your smart scale showed a 3.2 kg weight gain over the last 4 days. How are you feeling today, especially when you walk or lie down flat?',
    timestamp: '2026-09-24T08:00:00Z',
    clinicalObservations: ['Initiated prompt triage for rapid weight gain anomaly.'],
    suggestedQuickReplies: [
      'I need 2 pillows to sleep flat, and my ankles are puffy.',
      'I am breathing fine, just feeling slightly tired.',
      'I have chest tightness and severe shortness of breath.'
    ]
  }
];

// POST /api/screening/start
router.post('/start', (_req: Request, res: Response) => {
  res.json({
    success: true,
    sessionId: `session-${Date.now()}`,
    patientName: 'Eleanor Vance',
    chiefConcern: 'Rapid weight gain & worsening dyspnea in HFpEF/CKD',
    initialTurn: screeningDialogueState[0],
    vitalSummary: {
      weight: '76.4 kg (+3.2 kg)',
      bp: '148/92 mmHg',
      heartRate: '88 bpm',
      spo2: '93%'
    }
  });
});

// POST /api/screening/respond
router.post('/respond', (req: Request, res: Response) => {
  const { userMessage } = req.body;
  const messageText = (userMessage || '').toLowerCase();

  let doctorResponse = '';
  let riskLevel = 'MODERATE';
  let requiresEmergency = false;
  let detectedSymptoms: string[] = [];
  let nextQuestions: string[] = [];

  if (messageText.includes('chest') || messageText.includes('tightness') || messageText.includes('severe')) {
    doctorResponse = 'Eleanor, chest discomfort and severe shortness of breath are red-flag indicators that require immediate medical attention. Please do not wait. We are activating emergency protocol.';
    riskLevel = 'CRITICAL';
    requiresEmergency = true;
    detectedSymptoms = ['Chest tightness / pain', 'Severe acute dyspnea'];
    nextQuestions = ['Call 911 / Emergency Services', 'Contact On-Call Cardiologist Immediately'];
  } else if (messageText.includes('pillow') || messageText.includes('ankle') || messageText.includes('puffy') || messageText.includes('swell')) {
    doctorResponse = 'Thank you for sharing that, Eleanor. Needing extra pillows to breathe at night (orthopnea) combined with swollen ankles suggests your body is holding onto extra fluid. I am updating Dr. Thorne and our clinical engine recommends adjusting your morning water pill.';
    riskLevel = 'HIGH_SUBACUTE';
    detectedSymptoms = ['Orthopnea (2 pillows)', 'Bilateral lower extremity edema (Grade 2-3+)'];
    nextQuestions = [
      'Have you skipped or missed any doses of your medications this week?',
      'Have you noticed any dizziness when standing up?',
      'Are you able to check your blood pressure right now?'
    ];
  } else {
    doctorResponse = 'I understand. To ensure your heart and kidneys stay safe, I am monitoring your vitals closely. Let us make sure you log your morning weight every day and drink plenty of water while keeping sodium low.';
    riskLevel = 'MODERATE';
    detectedSymptoms = ['General fatigue'];
    nextQuestions = [
      'Have you noticed any shortness of breath when walking to the kitchen?',
      'Have you eaten higher sodium foods over the last 3 days?'
    ];
  }

  const responseTurn: ScreeningTurn = {
    id: `turn-${Date.now()}`,
    sender: 'doctor',
    text: doctorResponse,
    timestamp: new Date().toISOString(),
    clinicalObservations: detectedSymptoms,
    suggestedQuickReplies: nextQuestions,
    riskIndicators: {
      orthopnea: messageText.includes('pillow') || messageText.includes('flat'),
      peripheralEdema: messageText.includes('ankle') || messageText.includes('swell') || messageText.includes('puffy'),
      chestPain: messageText.includes('chest'),
      fatigue: messageText.includes('tired') || messageText.includes('fatigue')
    }
  };

  return res.json({
    success: true,
    riskLevel,
    requiresEmergency,
    detectedSymptoms,
    turn: responseTurn,
    careLoopTrigger: riskLevel !== 'LOW' ? 'STEP_4_PROTECT_TRIGGERED' : 'MONITORING_ACTIVE'
  });
});

// POST /api/screening/synthesize-voice
router.post('/synthesize-voice', (req: Request, res: Response) => {
  const { text, tone } = req.body;
  res.json({
    success: true,
    text: text || 'Hello Eleanor, I am your HEAL Engine Virtual Specialist.',
    tone: tone || 'compassionate_clinical',
    speechConfig: {
      voiceName: 'en-US-ClinicalEmpathetic-F',
      pitch: '+1.5Hz',
      rate: '0.96x',
      emphasisCadence: 'high_clarity'
    },
    audioAvailable: true,
    speechDurationEstimateSeconds: ((text || '').length / 15).toFixed(1)
  });
});

export default router;
