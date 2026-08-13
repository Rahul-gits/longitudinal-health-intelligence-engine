import { CASE_CONFERENCE_TURNS, INITIAL_CONSENSUS_STATE, PERSONA_PROFILES } from '../data/mockPatientData';
import { PersonaTurn, ConsensusState, ClusterType, PersonaId } from '../types/health';

export class ClinicalConferenceEngine {
  private turns: PersonaTurn[] = [...CASE_CONFERENCE_TURNS];
  private currentTurnIndex: number = 0;
  private consensus: ConsensusState = { ...INITIAL_CONSENSUS_STATE };

  public getAllTurns(): PersonaTurn[] {
    return this.turns;
  }

  public getCurrentTurn(): PersonaTurn {
    return this.turns[this.currentTurnIndex];
  }

  public getCurrentIndex(): number {
    return this.currentTurnIndex;
  }

  public setTurnIndex(index: number): PersonaTurn {
    if (index >= 0 && index < this.turns.length) {
      this.currentTurnIndex = index;
    }
    return this.turns[this.currentTurnIndex];
  }

  public nextTurn(): PersonaTurn | null {
    if (this.currentTurnIndex < this.turns.length - 1) {
      this.currentTurnIndex++;
      return this.turns[this.currentTurnIndex];
    }
    return null;
  }

  public previousTurn(): PersonaTurn | null {
    if (this.currentTurnIndex > 0) {
      this.currentTurnIndex--;
      return this.turns[this.currentTurnIndex];
    }
    return null;
  }

  public reset(): void {
    this.currentTurnIndex = 0;
  }

  public getConsensusState(): ConsensusState {
    return this.consensus;
  }

  // Generates a custom case conference debate stream for user-entered patient symptoms or queries
  public generateCustomDebate(userQuery: string): { turns: PersonaTurn[]; consensus: ConsensusState } {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const isEmergency = /chest pain|heart attack|stroke|fainting|anaphylaxis|can't breathe|severe pain/i.test(userQuery);

    if (isEmergency) {
      const emergencyTurns: PersonaTurn[] = [
        {
          id: 'cust-turn-1',
          personaId: 'triage',
          timestamp,
          headline: 'CRITICAL EMERGENCY RED FLAG',
          speechText: `Emergency Triage Protocol Triggered for query: "${userQuery}". Immediate emergency medical attention (911 / ER) is required!`,
          citedClusterIds: ['symptoms', 'risk'],
          citedNodeIds: ['sym-1', 'risk-1'],
          turnType: 'question',
          uncertaintyScore: 0
        }
      ];

      return {
        turns: emergencyTurns,
        consensus: {
          ...INITIAL_CONSENSUS_STATE,
          overallConfidence: 99,
          safetyAlerts: [{ level: 'critical', title: 'Acute Emergency Red Flag', description: 'Immediate emergency services escalation triggered.' }],
          recommendedNextAction: 'Call Emergency Medical Services (911) or proceed immediately to the nearest Emergency Room.',
          requiresClinicianEscalation: true,
          escalationReason: 'Potentially life-threatening symptom pattern detected in real-time screening.'
        }
      };
    }

    const customTurns: PersonaTurn[] = [
      {
        id: 'cust-1',
        personaId: 'triage',
        timestamp,
        headline: 'Initial Triage Screening',
        speechText: `Assessing new patient presentation: "${userQuery}". Determining urgency: No red-flag life-threatening signals detected, but symptoms require structured multi-cluster evaluation.`,
        citedClusterIds: ['symptoms', 'risk'],
        citedNodeIds: ['sym-1'],
        turnType: 'question',
        uncertaintyScore: 20
      },
      {
        id: 'cust-2',
        personaId: 'clinical',
        timestamp,
        headline: 'Clinical Reasoning & History Mapping',
        speechText: `Cross-referencing "${userQuery}" with Eleanor's history (CKD Stage 2 & Hypertension). Symptoms align with fluid balance or metabolic fluctuations.`,
        citedClusterIds: ['symptoms', 'history', 'reports'],
        citedNodeIds: ['hist-2', 'rep-2'],
        turnType: 'correlation',
        evidenceCitations: ['Clinical Medicine Case Analysis Protocol'],
        uncertaintyScore: 25
      },
      {
        id: 'cust-3',
        personaId: 'medication',
        timestamp,
        headline: 'Medication Safety Check',
        speechText: `Checking active prescriptions (Lisinopril, Furosemide, Metformin) and OTC intake. Ensuring no new drug interactions exacerbate "${userQuery}".`,
        citedClusterIds: ['medication', 'risk'],
        citedNodeIds: ['med-1', 'med-3'],
        turnType: 'safety_check',
        uncertaintyScore: 15
      },
      {
        id: 'cust-4',
        personaId: 'evidence',
        timestamp,
        headline: 'Evidence Base & RAG Retrieval',
        speechText: `Retrieving relevant medical literature for "${userQuery}". Evidence level is Moderate (Grade B). Further lab confirmation recommended.`,
        citedClusterIds: ['reports', 'risk'],
        citedNodeIds: ['rep-3'],
        turnType: 'evidence_challenge',
        evidenceCitations: ['UpToDate & Medical Practice Guidelines'],
        uncertaintyScore: 30
      },
      {
        id: 'cust-5',
        personaId: 'recovery',
        timestamp,
        headline: 'Recovery & Monitoring Plan',
        speechText: `Structuring supportive care guidance for "${userQuery}". Monitor daily vitals and log symptoms for 72 hours before clinician reassessment.`,
        citedClusterIds: ['recovery', 'lifestyle'],
        citedNodeIds: ['rec-1'],
        turnType: 'plan',
        uncertaintyScore: 10
      },
      {
        id: 'cust-6',
        personaId: 'planner',
        timestamp,
        headline: 'Synthesized Case Consensus',
        speechText: `Consensus reached on "${userQuery}": Continue supportive monitoring, adhere to prescription schedule, and share structured summary with primary physician if symptoms persist.`,
        citedClusterIds: ['symptoms', 'reports', 'medication', 'recovery'],
        citedNodeIds: ['rec-3'],
        turnType: 'consensus',
        uncertaintyScore: 12
      }
    ];

    return {
      turns: customTurns,
      consensus: {
        ...INITIAL_CONSENSUS_STATE,
        overallConfidence: 84,
        recommendedNextAction: `Follow personalized guidance for "${userQuery}" and track symptoms over 72 hours.`,
        requiresClinicianEscalation: false
      }
    };
  }
}
