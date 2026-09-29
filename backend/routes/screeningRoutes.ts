import { Router, Request, Response, NextFunction } from 'express';
import { validateSession } from './authRoutes';
import { llmGatewayService } from '../services/llmGatewayService';
import { AuthenticatedUser } from '../middleware/securityRbacMiddleware';

const router = Router();

// Middleware to resolve session if provided, but gracefully permit demo/patient consultation
const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const sessionId = (req.headers['x-session-id'] as string) || (authHeader ? authHeader.replace('Bearer ', '') : null);
  if (sessionId) {
    const result = validateSession(sessionId);
    if (result) {
      req.authenticatedUser = {
        userId: result.user.id,
        role: result.user.role,
        fullName: result.user.fullName,
        email: result.user.email,
        allowedPatientIds: result.user.allowedPatientIds,
        tenantId: result.user.tenantId
      };
    }
  }
  next();
};

router.use(optionalAuth);

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

// Initial dialogue turn generator tailored to patient
export const getInitialTurnForPatient = (patientName?: string): ScreeningTurn => {
  const firstName = (patientName || 'Eleanor').split(' ')[0];
  return {
    id: `turn-init-${Date.now()}`,
    sender: 'doctor',
    text: `Hello ${firstName}, I am Dr. Maya, your HEAL Engine Virtual Specialist. I am here to review how you are feeling, check your symptoms, and help with your care plan. How are you feeling today?`,
    timestamp: new Date().toISOString(),
    clinicalObservations: ['Initiated personalized clinical check-in dialogue.'],
    suggestedQuickReplies: [
      "I'm feeling good today",
      "I have a question about my medication",
      "I have some joint/knee pain",
      "I feel a bit of swelling or fatigue"
    ]
  };
};

// POST /api/screening/start
router.post('/start', (req: Request, res: Response) => {
  const patientName = req.body?.patientName || req.authenticatedUser?.fullName || 'Eleanor Vance';
  const initialTurn = getInitialTurnForPatient(patientName);

  res.json({
    success: true,
    sessionId: `session-${Date.now()}`,
    patientName,
    chiefConcern: 'Longitudinal clinical monitoring & symptom check',
    initialTurn,
    vitalSummary: {
      weight: '76.4 kg',
      bp: '138/86 mmHg',
      heartRate: '78 bpm',
      spo2: '97%'
    }
  });
});

/**
 * Core LLM-Powered Virtual Specialist Dialogue Handler
 * Used by POST /api/screening/chat and POST /api/screening/respond and POST /api/screening/patient-check
 */
export async function handleVirtualDoctorChat(req: Request, res: Response) {
  const { message, userMessage, patientId, patientProfile, dialogueHistory } = req.body;
  const inputMessage = (message || userMessage || '').trim();

  if (!inputMessage) {
    return res.status(400).json({
      success: false,
      error: 'Message is required for consultation.'
    });
  }

  const patientName = patientProfile?.name || req.authenticatedUser?.fullName || 'Eleanor Vance';
  const conditions = patientProfile?.conditions || ['Essential Hypertension', 'Chronic Kidney Disease'];
  const medications = patientProfile?.medications || ['Lisinopril 20mg', 'Furosemide 40mg'];
  const allergies = patientProfile?.allergies || ['Sulfa drugs'];
  const primaryPhysician = patientProfile?.primaryPhysician || 'Dr. Aris Thorne, MD';

  try {
    const aiResult = await llmGatewayService.generateVirtualSpecialistResponse({
      patientId: patientId || req.authenticatedUser?.userId || 'patient-ev-68',
      patientName,
      patientAge: patientProfile?.age || 65,
      patientGender: patientProfile?.gender || 'Female',
      conditions,
      medications,
      allergies,
      primaryPhysician,
      recentVitals: patientProfile?.recentVitals,
      userMessage: inputMessage,
      dialogueHistory: dialogueHistory || []
    });

    const responseTurn: ScreeningTurn = {
      id: `turn-${Date.now()}`,
      sender: 'doctor',
      text: aiResult.doctorResponse,
      timestamp: aiResult.timestamp,
      clinicalObservations: aiResult.clinicalObservations,
      suggestedQuickReplies: aiResult.suggestedReplies,
      riskIndicators: {
        orthopnea: inputMessage.toLowerCase().includes('pillow') || inputMessage.toLowerCase().includes('flat'),
        peripheralEdema: inputMessage.toLowerCase().includes('ankle') || inputMessage.toLowerCase().includes('swell') || inputMessage.toLowerCase().includes('puffy'),
        chestPain: inputMessage.toLowerCase().includes('chest'),
        fatigue: inputMessage.toLowerCase().includes('tired') || inputMessage.toLowerCase().includes('fatigue')
      }
    };

    return res.json({
      success: true,
      doctorResponse: aiResult.doctorResponse,
      clinicalObservations: aiResult.clinicalObservations,
      suggestedReplies: aiResult.suggestedReplies,
      suggestedQuickReplies: aiResult.suggestedReplies,
      riskLevel: aiResult.riskLevel,
      requiresEmergency: aiResult.requiresEmergency,
      safetyGateTriggered: aiResult.safetyGateTriggered,
      safetyDetails: aiResult.safetyDetails,
      provider: aiResult.provider,
      model: aiResult.model,
      latencyMs: aiResult.latencyMs,
      timestamp: aiResult.timestamp,
      turn: responseTurn,
      careLoopTrigger: aiResult.riskLevel !== 'LOW' ? 'STEP_4_PROTECT_TRIGGERED' : 'MONITORING_ACTIVE'
    });
  } catch (err: any) {
    console.error('[VIRTUAL-SPECIALIST-CHAT] Processing error:', err);
    return res.status(500).json({
      success: false,
      error: 'CHAT_PROCESSING_ERROR',
      message: 'Unable to process dialogue turn at this moment.'
    });
  }
}

// Mount handler on chat and respond endpoints
router.post('/chat', handleVirtualDoctorChat);
router.post('/respond', handleVirtualDoctorChat);
router.post('/patient-check', handleVirtualDoctorChat);

// POST /api/screening/synthesize-voice
router.post('/synthesize-voice', (req: Request, res: Response) => {
  const { text, tone } = req.body;
  res.json({
    success: true,
    text: text || 'Hello, I am your HEAL Engine Virtual Specialist.',
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
