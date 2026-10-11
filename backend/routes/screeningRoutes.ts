import { Router, Request, Response, NextFunction } from 'express';
import { validateSession } from './authRoutes';
import { llmGatewayService } from '../services/llmGatewayService';
import { virtualDoctorSessionService } from '../services/virtualDoctorSessionService';
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

export interface SpecialistPersonaMeta {
  id: string;
  name: string;
  title: string;
  specialty: string;
  credentials: string;
  clinicalFocus: string;
  avatarColor: string;
  badgeBg: string;
  accentColor: string;
  preferredVoiceName: string;
  voicePitch: number;
  voiceRate: number;
  greetingScript: string;
  guidelinesCited: string[];
  biomarkersMonitored: string[];
}

export const AI_SPECIALIST_PERSONAS: SpecialistPersonaMeta[] = [
  {
    id: 'doc-thorne',
    name: 'Dr. Aris Thorne, MD',
    title: 'Chief of Cardiorenal Medicine',
    specialty: 'Cardiorenal & Vascular Medicine',
    credentials: 'MD, FACC, FASN • Harvard Medical School',
    clinicalFocus: 'Acute-on-Chronic Renal Perfusion & Fluid Hemodynamics',
    avatarColor: '#3A86FF',
    badgeBg: '#00F5D4',
    accentColor: '#3A86FF',
    preferredVoiceName: 'Daniel',
    voicePitch: 0.95,
    voiceRate: 1.0,
    greetingScript: 'Hello, I am Dr. Aris Thorne from Cardiorenal Medicine. I am closely monitoring your kidney filtration markers, NT-proBNP fluid status, and blood pressure telemetry.',
    guidelinesCited: ['KDIGO 2024 Clinical Practice Guideline', 'ACC/AHA Heart Failure Guidelines'],
    biomarkersMonitored: ['eGFR (Kidney Filtration)', 'NT-proBNP (Cardiac Strain)', 'Serum Creatinine', 'Blood Pressure']
  },
  {
    id: 'doc-lin',
    name: 'Dr. Maya Lin, PharmD',
    title: 'Geriatric Clinical Pharmacologist',
    specialty: 'Precision Pharmacotherapy & Drug Interactions',
    credentials: 'PharmD, BCPS • Johns Hopkins Medicine',
    clinicalFocus: 'Drug-Drug Interactions & CYP2C9 Pharmacogenomics',
    avatarColor: '#FF70A6',
    badgeBg: '#FFE600',
    accentColor: '#FF70A6',
    preferredVoiceName: 'Samantha',
    voicePitch: 1.1,
    voiceRate: 1.02,
    greetingScript: 'Hello, I am Dr. Maya Lin, your clinical pharmacologist. I am here to review your active medications, explain drug-drug interactions like Lisinopril and NSAIDs, and ensure your prescriptions are completely renal-safe.',
    guidelinesCited: ['CPIC Pharmacogenomic Guidelines for CYP2C9', 'AGS Beers Criteria for Potentially Inappropriate Medication Use'],
    biomarkersMonitored: ['CYP2C9*3 Genetic Clearance', 'Lisinopril + NSAID Hemodynamic Pinch', 'Serum Potassium (K+)']
  },
  {
    id: 'doc-vance',
    name: 'Dr. Marcus Vance, MD',
    title: 'Primary Care Physician & Patient Advocate',
    specialty: 'Family Medicine & Chronic Care Management',
    credentials: 'MD, FAAFP • UCSF Medical Center',
    clinicalFocus: 'Holistic Symptom Management & Daily Mobility',
    avatarColor: '#00F5D4',
    badgeBg: '#FF70A6',
    accentColor: '#00F5D4',
    preferredVoiceName: 'Alex',
    voicePitch: 0.9,
    voiceRate: 0.98,
    greetingScript: 'Hi there, I am Dr. Marcus Vance, your primary care physician. My focus is keeping you active, comfortable, and sleeping well while safeguarding your vital organs.',
    guidelinesCited: ['AAFP Chronic Care Management Guidelines', 'ADA Comprehensive Medical Care Guidelines'],
    biomarkersMonitored: ['Joint Pain Severity Score', 'Lower Extremity Peripheral Edema', 'Daily Steps & Sleep Quality']
  },
  {
    id: 'doc-chen',
    name: 'Dr. Sarah Chen, MD',
    title: 'Preventive Nephrology Specialist',
    specialty: 'Renal Function Recovery & Electrolyte Balance',
    credentials: 'MD, PhD • Stanford University School of Medicine',
    clinicalFocus: '7-Day Renal Recovery Trajectory & Hydration Protocol',
    avatarColor: '#CCFF00',
    badgeBg: '#3A86FF',
    accentColor: '#CCFF00',
    preferredVoiceName: 'Karen',
    voicePitch: 1.05,
    voiceRate: 1.0,
    greetingScript: 'Hello, I am Dr. Sarah Chen from Preventive Nephrology. I specialize in restoring kidney filtration rate and guiding your 7-day renal rebound pathway.',
    guidelinesCited: ['KDIGO 2024 Practice Guideline for CKD', 'ADA/KDIGO Consensus on Diabetes & Kidney Disease'],
    biomarkersMonitored: ['eGFR Recovery Curve (>60 mL/min target)', 'Urine Albumin-to-Creatinine Ratio (uACR)', 'Daily Fluid Balance (1.5-2L Target)']
  }
];

export function resolveSpecialistPersona(personaId?: string, personaName?: string): SpecialistPersonaMeta {
  if (personaId) {
    const match = AI_SPECIALIST_PERSONAS.find(p => p.id === personaId);
    if (match) return match;
  }
  if (personaName) {
    const lower = personaName.toLowerCase();
    const match = AI_SPECIALIST_PERSONAS.find(p => lower.includes(p.name.toLowerCase().split(' ')[1]) || lower.includes(p.id.replace('doc-', '')));
    if (match) return match;
  }
  return AI_SPECIALIST_PERSONAS[0]; // Default to Dr. Thorne
}

interface ScreeningTurn {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  personaId?: string;
  personaName?: string;
  clinicalObservations?: string[];
  suggestedQuickReplies?: string[];
  ragEvidenceSummary?: string;
  riskIndicators?: {
    orthopnea: boolean;
    peripheralEdema: boolean;
    chestPain: boolean;
    fatigue: boolean;
  };
}

// Initial dialogue turn generator tailored to patient
export const getInitialTurnForPatient = (patientName?: string, personaId?: string): ScreeningTurn => {
  const firstName = (patientName || 'Eleanor').split(' ')[0];
  const specialist = resolveSpecialistPersona(personaId);

  return {
    id: `turn-init-${Date.now()}`,
    sender: 'doctor',
    text: `Hello ${firstName}, I am ${specialist.name.split(',')[0]}, ${specialist.title}. ${specialist.greetingScript} How are you feeling today?`,
    timestamp: new Date().toISOString(),
    personaId: specialist.id,
    personaName: specialist.name,
    clinicalObservations: [`Initiated personalized 2-way clinical consultation with ${specialist.name}.`],
    suggestedQuickReplies: [
      "I'm feeling good today",
      "I have a question about my medication",
      "I have some joint/knee pain",
      "I feel a bit of swelling or fatigue"
    ]
  };
};

/**
 * GET /api/screening/specialists
 * Returns the roster of all AI Specialist Personas with their clinical credentials and guideline mappings
 */
router.get('/specialists', (_req: Request, res: Response) => {
  res.json({
    success: true,
    specialists: AI_SPECIALIST_PERSONAS,
    count: AI_SPECIALIST_PERSONAS.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/screening/specialist-switch
 * Perform seamless mid-consultation handover between specialist personas
 */
router.post('/specialist-switch', (req: Request, res: Response) => {
  const { previousPersonaId, targetPersonaId, patientName, chiefConcern } = req.body;
  const prev = resolveSpecialistPersona(previousPersonaId);
  const next = resolveSpecialistPersona(targetPersonaId);
  const firstName = (patientName || 'Patient').split(' ')[0];

  const handoverGreeting = `Hello ${firstName}. I am ${next.name.split(',')[0]}, ${next.title}. ${prev.name.split(',')[0]} and I have coordinated your care history. ${next.clinicalFocus ? `I am focusing specifically on your ${next.clinicalFocus.toLowerCase()}.` : ''} How can I assist you right now?`;

  res.json({
    success: true,
    previousPersona: { id: prev.id, name: prev.name },
    activePersona: next,
    handoverMessage: handoverGreeting,
    suggestedQuickReplies: [
      "Tell me about my medications",
      "Review my kidney & heart lab numbers",
      "What should I do for knee joint pain?",
      "I have a question about my recovery plan"
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/screening/start
 */
router.post('/start', (req: Request, res: Response) => {
  const patientName = req.body?.patientName || req.authenticatedUser?.fullName || 'Eleanor Vance';
  const personaId = req.body?.personaId || 'doc-thorne';
  const specialist = resolveSpecialistPersona(personaId);
  const initialTurn = getInitialTurnForPatient(patientName, personaId);

  const sessionId = req.body?.sessionId || `session-${Date.now()}`;

  // Pre-seed session record in virtualDoctorSessionService
  try {
    virtualDoctorSessionService.createSession({
      sessionId,
      patientId: req.body?.patientId || 'patient-ev-68',
      personaId: specialist.id,
      patientStateVersion: 'ps-v2026-kdigo'
    });
  } catch (err) {
    // Session might already exist
  }

  res.json({
    success: true,
    sessionId,
    patientName,
    persona: specialist,
    chiefConcern: 'Longitudinal clinical monitoring & symptom check',
    initialTurn,
    vitalSummary: {
      weight: '76.4 kg',
      bp: '138/86 mmHg',
      heartRate: '78 bpm',
      spo2: '97%',
      egfr: '52 mL/min'
    }
  });
});

/**
 * Core LLM-Powered Virtual Specialist Dialogue Handler
 * Used by POST /api/screening/chat, /respond, /patient-check, and /specialist-consult
 */
export async function handleVirtualDoctorChat(req: Request, res: Response) {
  const { 
    message, 
    userMessage, 
    patientId, 
    patientName: rawPatientName,
    patientAge,
    patientGender,
    conditions: rawConditions,
    medications: rawMeds,
    allergies: rawAllergies,
    primaryPhysician: rawPhysician,
    recentVitals: rawVitals,
    patientProfile, 
    dialogueHistory,
    personaId,
    personaName: rawPersonaName,
    specialty: rawSpecialty,
    clinicalFocus: rawFocus,
    credentials: rawCreds,
    sessionId: rawSessionId
  } = req.body;

  const inputMessage = (message || userMessage || '').trim();

  if (!inputMessage) {
    return res.status(400).json({
      success: false,
      error: 'Message is required for consultation.'
    });
  }

  // Resolve patient clinical context
  const patientName = patientProfile?.name || rawPatientName || req.authenticatedUser?.fullName || 'Eleanor Vance';
  const conditions = patientProfile?.conditions || rawConditions || ['Essential Hypertension', 'Chronic Kidney Disease'];
  const medications = patientProfile?.medications || rawMeds || ['Lisinopril 20mg', 'Furosemide 40mg'];
  const allergies = patientProfile?.allergies || rawAllergies || ['Sulfa drugs'];
  const primaryPhysician = patientProfile?.primaryPhysician || rawPhysician || 'Dr. Aris Thorne, MD';
  const vitals = patientProfile?.recentVitals || rawVitals || { bp: '138/86', heartRate: '78', egfr: 52 };

  // Resolve specialist persona
  const resolvedSpecialist = resolveSpecialistPersona(personaId, rawPersonaName);
  const activePersonaName = rawPersonaName || resolvedSpecialist.name;
  const activeSpecialty = rawSpecialty || resolvedSpecialist.specialty;
  const activeFocus = rawFocus || resolvedSpecialist.clinicalFocus;
  const activeCreds = rawCreds || resolvedSpecialist.credentials;

  const resolvedSessionId = rawSessionId || `session-vdoc-${patientId || 'eleanor'}`;

  try {
    const aiResult = await llmGatewayService.generateVirtualSpecialistResponse({
      patientId: patientId || req.authenticatedUser?.userId || 'patient-ev-68',
      patientName,
      patientAge: patientProfile?.age || patientAge || 65,
      patientGender: patientProfile?.gender || patientGender || 'Female',
      conditions,
      medications,
      allergies,
      primaryPhysician,
      recentVitals: vitals,
      userMessage: inputMessage,
      dialogueHistory: dialogueHistory || [],
      personaId: resolvedSpecialist.id,
      personaName: activePersonaName,
      specialty: activeSpecialty,
      clinicalFocus: activeFocus,
      credentials: activeCreds
    });

    // Record turn in virtualDoctorSessionService for reproducible longitudinal auditing
    try {
      virtualDoctorSessionService.recordDialogueTurn({
        sessionId: resolvedSessionId,
        questionVersionId: `q-${Date.now()}`,
        doctorQuestionScript: aiResult.doctorResponse,
        doctorPosture: aiResult.recommendedPosture || 'explaining',
        patientResponseRaw: inputMessage
      });
    } catch {
      try {
        virtualDoctorSessionService.createSession({
          sessionId: resolvedSessionId,
          patientId: patientId || 'patient-ev-68',
          personaId: resolvedSpecialist.id,
          patientStateVersion: 'ps-v2026-kdigo'
        });
        virtualDoctorSessionService.recordDialogueTurn({
          sessionId: resolvedSessionId,
          questionVersionId: `q-${Date.now()}`,
          doctorQuestionScript: aiResult.doctorResponse,
          doctorPosture: aiResult.recommendedPosture || 'explaining',
          patientResponseRaw: inputMessage
        });
      } catch (sessErr) {
        // Continue even if session tracking fails
      }
    }

    const responseTurn: ScreeningTurn = {
      id: `turn-${Date.now()}`,
      sender: 'doctor',
      text: aiResult.doctorResponse,
      timestamp: aiResult.timestamp,
      personaId: resolvedSpecialist.id,
      personaName: activePersonaName,
      clinicalObservations: aiResult.clinicalObservations,
      suggestedQuickReplies: aiResult.suggestedReplies,
      ragEvidenceSummary: aiResult.ragContextSummary,
      riskIndicators: {
        orthopnea: inputMessage.toLowerCase().includes('pillow') || inputMessage.toLowerCase().includes('flat'),
        peripheralEdema: inputMessage.toLowerCase().includes('ankle') || inputMessage.toLowerCase().includes('swell') || inputMessage.toLowerCase().includes('puffy'),
        chestPain: inputMessage.toLowerCase().includes('chest'),
        fatigue: inputMessage.toLowerCase().includes('tired') || inputMessage.toLowerCase().includes('fatigue')
      }
    };

    return res.json({
      success: true,
      sessionId: resolvedSessionId,
      personaId: resolvedSpecialist.id,
      personaName: activePersonaName,
      specialty: activeSpecialty,
      clinicalFocus: activeFocus,
      doctorResponse: aiResult.doctorResponse,
      clinicalObservations: aiResult.clinicalObservations,
      suggestedReplies: aiResult.suggestedReplies,
      suggestedQuickReplies: aiResult.suggestedReplies,
      riskLevel: aiResult.riskLevel,
      requiresEmergency: aiResult.requiresEmergency,
      safetyGateTriggered: aiResult.safetyGateTriggered,
      safetyDetails: aiResult.safetyDetails,
      recommendedPosture: aiResult.recommendedPosture || 'explaining',
      ragEvidence: aiResult.ragEvidence || [],
      ragContextSummary: aiResult.ragContextSummary || '',
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

// Mount handler on chat, respond, patient-check, and specialist-consult endpoints
router.post('/chat', handleVirtualDoctorChat);
router.post('/respond', handleVirtualDoctorChat);
router.post('/patient-check', handleVirtualDoctorChat);
router.post('/specialist-consult', handleVirtualDoctorChat);

// POST /api/screening/synthesize-voice
router.post('/synthesize-voice', (req: Request, res: Response) => {
  const { text, tone, personaId } = req.body;
  const specialist = resolveSpecialistPersona(personaId);

  res.json({
    success: true,
    text: text || 'Hello, I am your HEAL Engine Virtual Specialist.',
    tone: tone || 'compassionate_clinical',
    personaId: specialist.id,
    personaName: specialist.name,
    speechConfig: {
      voiceName: specialist.preferredVoiceName,
      pitch: `${specialist.voicePitch}x`,
      rate: `${specialist.voiceRate}x`,
      emphasisCadence: 'high_clarity'
    },
    audioAvailable: true,
    speechDurationEstimateSeconds: ((text || '').length / 15).toFixed(1)
  });
});

export default router;
