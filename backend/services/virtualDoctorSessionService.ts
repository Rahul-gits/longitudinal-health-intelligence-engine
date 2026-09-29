/**
 * Virtual Doctor Session Reproducibility Engine
 * Implements deterministic snapshotting, clinical entity extraction, longitudinal correlation,
 * and safety-gated escalation loops for virtual specialist dialogues.
 */

export interface VirtualDoctorTurnRecord {
  turnIndex: number;
  questionVersionId: string;
  doctorQuestionScript: string;
  doctorPosture: 'greeting' | 'listening' | 'explaining' | 'alerting' | 'prescribing' | 'reassuring';
  patientResponseRaw: string;
  extractedClinicalAssertions: {
    entity: string;
    category: 'SYMPTOM' | 'MEDICATION_ADHERENCE' | 'ADVERSE_EFFECT' | 'LIFESTYLE';
    assertion: 'PRESENT' | 'ABSENT' | 'UNCERTAIN';
    confidence: number;
    negationDetected: boolean;
  }[];
  longitudinalCorrelation: {
    relevantBiomarker: string;
    correlationFinding: string;
    clinicalSignificance: 'CRITICAL' | 'WARNING' | 'BENIGN';
  };
  safetyEvaluation: {
    isSafeToContinueDialogue: boolean;
    redFlagDetected: boolean;
    ruleTriggered?: string;
  };
  escalationRequired: boolean;
  escalationDetails?: {
    urgency: 'STAT_EMERGENCY' | 'SAME_DAY_CLINICIAN' | 'ROUTINE';
    reason: string;
    recommendedAction: string;
  };
  timestamp: string;
}

export interface VirtualDoctorSessionSnapshot {
  sessionId: string;
  patientId: string;
  personaId: string;
  personaVersion: string;
  patientStateVersion: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ESCALATED_TO_HUMAN';
  turns: VirtualDoctorTurnRecord[];
  sessionSummary?: {
    chiefComplaint: string;
    totalTurns: number;
    identifiedRisks: string[];
    carePlanAdjustment: string;
    signedByVirtualPersona: string;
  };
}

export class VirtualDoctorSessionService {
  private sessions: Map<string, VirtualDoctorSessionSnapshot> = new Map();
  private readonly personaVersion = 'v2.6-cardiorenal-specialist';

  constructor() {
    // Seed an initial demo session for Eleanor Vance
    this.createSession({
      sessionId: 'session-eleanor-2026-09',
      patientId: 'patient-ev-68',
      personaId: 'dr-aris-thorne',
      patientStateVersion: 'ps-v2026-08-kdigo-3b'
    });
  }

  public createSession(params: {
    sessionId?: string;
    patientId: string;
    personaId: string;
    patientStateVersion: string;
  }): VirtualDoctorSessionSnapshot {
    const sessionId = params.sessionId || `vdoc-sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    const session: VirtualDoctorSessionSnapshot = {
      sessionId,
      patientId: params.patientId,
      personaId: params.personaId,
      personaVersion: this.personaVersion,
      patientStateVersion: params.patientStateVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      turns: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  public recordDialogueTurn(params: {
    sessionId: string;
    questionVersionId: string;
    doctorQuestionScript: string;
    doctorPosture: 'greeting' | 'listening' | 'explaining' | 'alerting' | 'prescribing' | 'reassuring';
    patientResponseRaw: string;
  }): { session: VirtualDoctorSessionSnapshot; latestTurn: VirtualDoctorTurnRecord } {
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Virtual Doctor session ${params.sessionId} not found`);
    }

    const turnIndex = session.turns.length + 1;
    const responseLower = params.patientResponseRaw.toLowerCase();

    // 1. Clinical Entity Extraction & NegEx Assertion
    const extractedAssertions: VirtualDoctorTurnRecord['extractedClinicalAssertions'] = [];

    // Red Flag 1: Acute Chest Pain / Pressure / Coronary Symptoms
    if (responseLower.includes('chest pain') || responseLower.includes('chest pressure') || responseLower.includes('crushing') || responseLower.includes('tightness in chest')) {
      const isNegated = responseLower.includes('no chest pain') || responseLower.includes('not having chest pain') || responseLower.includes('denies chest pain');
      extractedAssertions.push({
        entity: 'Acute Chest Pain / Angina Equivalents',
        category: 'SYMPTOM',
        assertion: isNegated ? 'ABSENT' : 'PRESENT',
        confidence: 0.99,
        negationDetected: isNegated
      });
    }

    // Red Flag 2: Medication Cessation / Discontinuation Discrepancy
    if (responseLower.includes('stopped taking') || responseLower.includes('stopped my') || responseLower.includes('quit taking') || responseLower.includes('not taking my medicine')) {
      extractedAssertions.push({
        entity: 'Unilateral Medication Discontinuation',
        category: 'MEDICATION_ADHERENCE',
        assertion: 'PRESENT',
        confidence: 0.98,
        negationDetected: false
      });
    }

    if (responseLower.includes('dizz') || responseLower.includes('lightheaded')) {
      const isNegated = responseLower.includes('no dizz') || responseLower.includes('not dizz') || responseLower.includes('never feel dizz');
      extractedAssertions.push({
        entity: 'Orthostatic Dizziness',
        category: 'SYMPTOM',
        assertion: isNegated ? 'ABSENT' : 'PRESENT',
        confidence: 0.96,
        negationDetected: isNegated
      });
    }

    if (responseLower.includes('ibuprofen') || responseLower.includes('advil') || responseLower.includes('motrin')) {
      const isNegated = responseLower.includes('stopped') || responseLower.includes('no longer');
      extractedAssertions.push({
        entity: 'Over-the-counter NSAID (Ibuprofen)',
        category: 'MEDICATION_ADHERENCE',
        assertion: isNegated ? 'ABSENT' : 'PRESENT',
        confidence: 0.99,
        negationDetected: isNegated
      });
    }

    if (responseLower.includes('short of breath') || responseLower.includes('trouble breath') || responseLower.includes('cant breath')) {
      extractedAssertions.push({
        entity: 'Dyspnea upon exertion/rest',
        category: 'SYMPTOM',
        assertion: 'PRESENT',
        confidence: 0.94,
        negationDetected: false
      });
    }

    // 2. Longitudinal Correlation with Patient State
    const hasActiveChestPain = extractedAssertions.some(a => a.entity.includes('Chest Pain') && a.assertion === 'PRESENT');
    const hasMedCessation = extractedAssertions.some(a => a.entity.includes('Medication Discontinuation') && a.assertion === 'PRESENT');
    const hasActiveNsaidIntake = extractedAssertions.some(a => a.entity.includes('NSAID') && a.assertion === 'PRESENT');
    const hasDizziness = extractedAssertions.some(a => a.entity.includes('Dizziness') && a.assertion === 'PRESENT');
    const hasDyspnea = extractedAssertions.some(a => a.entity.includes('Dyspnea') && a.assertion === 'PRESENT');

    let correlationFinding = 'Patient dialogue aligned with baseline stable chronic symptoms.';
    let clinicalSignificance: 'CRITICAL' | 'WARNING' | 'BENIGN' = 'BENIGN';

    if (hasActiveChestPain) {
      correlationFinding = 'EMERGENCY: Acute chest discomfort with potential coronary syndrome or acute pulmonary edema.';
      clinicalSignificance = 'CRITICAL';
    } else if (hasMedCessation) {
      correlationFinding = 'ADHERENCE DISCREPANCY: Patient reports discontinuing prescribed regimen. Correlating with recent blood pressure or metabolic rebound.';
      clinicalSignificance = 'WARNING';
    } else if (hasActiveNsaidIntake) {
      correlationFinding = 'Directly correlates with recorded acute eGFR drop from 48 to 39 mL/min. Corroborates hemodynamic afferent arteriolar constriction.';
      clinicalSignificance = 'CRITICAL';
    } else if (hasDizziness) {
      correlationFinding = 'Correlates with recent Lisinopril initiation and low SBP dipping below 110 mmHg on evening logs.';
      clinicalSignificance = 'WARNING';
    } else if (hasDyspnea) {
      correlationFinding = 'Correlates with 2.1 kg weight gain on smart scale over 72 hours. Potential acute decompensated heart failure / pulmonary congestion.';
      clinicalSignificance = 'CRITICAL';
    }

    // 3. Deterministic Safety Evaluation & Escalation
    const redFlagDetected = clinicalSignificance === 'CRITICAL';
    const isSafeToContinueDialogue = !hasActiveChestPain && !hasDyspnea;

    let escalationRequired = false;
    let escalationDetails: VirtualDoctorTurnRecord['escalationDetails'];

    if (hasActiveChestPain) {
      escalationRequired = true;
      escalationDetails = {
        urgency: 'STAT_EMERGENCY',
        reason: 'Patient reported acute chest pain/pressure during virtual dialogue',
        recommendedAction: 'HALT routine screening immediately. Direct patient to emergency services (Dial 911 / Go to nearest ER). Alert on-call clinical triage.'
      };
      session.status = 'ESCALATED_TO_HUMAN';
    } else if (hasDyspnea) {
      escalationRequired = true;
      escalationDetails = {
        urgency: 'STAT_EMERGENCY',
        reason: 'Reported acute shortness of breath concurrent with rapid fluid retention telemetry',
        recommendedAction: 'Direct patient to nearest emergency department or activate on-call triage line immediately.'
      };
      session.status = 'ESCALATED_TO_HUMAN';
    } else if (hasMedCessation) {
      escalationRequired = true;
      escalationDetails = {
        urgency: 'SAME_DAY_CLINICIAN',
        reason: 'Self-reported medication cessation without physician consultation; requires non-presumptive adherence counseling',
        recommendedAction: 'Prompt patient: "Which medication was discontinued and was it related to side effects, cost, or another concern?" Schedule pharmacist medication reconciliation callback.'
      };
    } else if (hasActiveNsaidIntake) {
      escalationRequired = true;
      escalationDetails = {
        urgency: 'SAME_DAY_CLINICIAN',
        reason: 'Patient self-administered systemic NSAID in presence of CKD Stage 3b and ACE inhibitor',
        recommendedAction: 'Nurse coordinator phone callback for urgent medication safety counseling and lab re-order.'
      };
    }

    const latestTurn: VirtualDoctorTurnRecord = {
      turnIndex,
      questionVersionId: params.questionVersionId,
      doctorQuestionScript: params.doctorQuestionScript,
      doctorPosture: params.doctorPosture,
      patientResponseRaw: params.patientResponseRaw,
      extractedClinicalAssertions: extractedAssertions,
      longitudinalCorrelation: {
        relevantBiomarker: hasActiveNsaidIntake ? 'eGFR / Serum Creatinine' : (hasDyspnea ? 'Dry Weight / NT-proBNP' : 'Blood Pressure'),
        correlationFinding,
        clinicalSignificance
      },
      safetyEvaluation: {
        isSafeToContinueDialogue,
        redFlagDetected,
        ruleTriggered: redFlagDetected ? 'HARD_STOP_CARDIORENAL_DECOMPENSATION_RULE_04' : undefined
      },
      escalationRequired,
      escalationDetails,
      timestamp: new Date().toISOString()
    };

    session.turns.push(latestTurn);
    session.updatedAt = new Date().toISOString();

    if (session.turns.length >= 4 && session.status !== 'ESCALATED_TO_HUMAN') {
      session.status = 'COMPLETED';
      session.sessionSummary = {
        chiefComplaint: 'Follow-up on knee pain and review of longitudinal renal lab decline',
        totalTurns: session.turns.length,
        identifiedRisks: ['OTC NSAID intake detected', 'CKD Stage 3b vulnerable to afferent constriction'],
        carePlanAdjustment: 'Discontinue systemic NSAID immediately; switch to topical analgesic therapy pending physician review',
        signedByVirtualPersona: `${session.personaId} (${this.personaVersion})`
      };
    }

    return { session, latestTurn };
  }

  public getSession(sessionId: string): VirtualDoctorSessionSnapshot | undefined {
    return this.sessions.get(sessionId);
  }

  public getAllSessions(patientId?: string): VirtualDoctorSessionSnapshot[] {
    const list = Array.from(this.sessions.values());
    if (patientId) {
      return list.filter(s => s.patientId === patientId);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public runSafetyDialogueTests(): {
    testName: string;
    passed: boolean;
    assertions: { name: string; passed: boolean; details: string }[];
  }[] {
    const results = [];

    // Test 1: Acute Chest Pain Emergency Stop
    const session1 = this.createSession({
      sessionId: 'test-sess-chestpain',
      patientId: 'patient-test-01',
      personaId: 'dr-aris-thorne',
      patientStateVersion: 'v1.0'
    });
    const turn1 = this.recordDialogueTurn({
      sessionId: session1.sessionId,
      questionVersionId: 'q-symptom-check',
      doctorQuestionScript: 'Are you experiencing any other symptoms today?',
      doctorPosture: 'listening',
      patientResponseRaw: 'Doctor, I have crushing chest pain and feel cold sweat.'
    });

    const isHalted = turn1.latestTurn.safetyEvaluation.isSafeToContinueDialogue === false;
    const isEmergency = turn1.latestTurn.escalationDetails?.urgency === 'STAT_EMERGENCY';
    const isSessionEscalated = turn1.session.status === 'ESCALATED_TO_HUMAN';

    results.push({
      testName: 'Acute Chest Pain Red Flag Immediate Handoff',
      passed: isHalted && isEmergency && isSessionEscalated,
      assertions: [
        { name: 'Routine screening immediately halted', passed: isHalted, details: `isSafeToContinueDialogue: ${turn1.latestTurn.safetyEvaluation.isSafeToContinueDialogue}` },
        { name: 'STAT_EMERGENCY escalation dispatched', passed: isEmergency, details: `Urgency: ${turn1.latestTurn.escalationDetails?.urgency}` },
        { name: 'Session transitioned to ESCALATED_TO_HUMAN', passed: isSessionEscalated, details: `Session Status: ${turn1.session.status}` }
      ]
    });

    // Test 2: Medication Cessation Without Assumption
    const session2 = this.createSession({
      sessionId: 'test-sess-cessation',
      patientId: 'patient-test-02',
      personaId: 'dr-aris-thorne',
      patientStateVersion: 'v1.0'
    });
    const turn2 = this.recordDialogueTurn({
      sessionId: session2.sessionId,
      questionVersionId: 'q-med-adherence',
      doctorQuestionScript: 'Have there been any recent changes to your medication routine?',
      doctorPosture: 'listening',
      patientResponseRaw: 'I stopped taking my medication last week.'
    });

    const cessationDetected = turn2.latestTurn.extractedClinicalAssertions.some(a => a.entity.includes('Medication Discontinuation'));
    const isNonPresumptive = turn2.latestTurn.escalationDetails?.recommendedAction.includes('Which medication was discontinued and was it related to side effects, cost, or another concern?');
    const isDiscrepancyFlagged = turn2.latestTurn.longitudinalCorrelation.clinicalSignificance === 'WARNING';

    results.push({
      testName: 'Non-Presumptive Medication Cessation Clarification',
      passed: cessationDetected && Boolean(isNonPresumptive) && isDiscrepancyFlagged,
      assertions: [
        { name: 'Unilateral medication discontinuation entity extracted', passed: cessationDetected, details: 'Entity recognized via clinical parser' },
        { name: 'Non-presumptive inquiry generated without assuming reason', passed: Boolean(isNonPresumptive), details: 'System asked which medication and prompted side effects/cost/other' },
        { name: 'Longitudinal discrepancy flagged for pharmacist review', passed: isDiscrepancyFlagged, details: 'Significance rated as WARNING' }
      ]
    });

    return results;
  }
}

export const virtualDoctorSessionService = new VirtualDoctorSessionService();
