export type ClusterType = 
  | 'symptoms' 
  | 'history' 
  | 'reports' 
  | 'medication' 
  | 'lifestyle' 
  | 'risk' 
  | 'recovery';

export interface DataClusterItem {
  id: string;
  clusterType: ClusterType;
  label: string;
  value: string;
  detail?: string;
  timestamp?: string;
  status?: 'normal' | 'abnormal' | 'warning' | 'critical' | 'stable';
  confidence?: number; // 0 - 100%
  provenance?: string;
}

export interface DataClusterGroup {
  id: ClusterType;
  title: string;
  description: string;
  iconName: string;
  color: string;
  borderColor: string;
  bgColor: string;
  items: DataClusterItem[];
}

export interface ClusterNode {
  id: string;
  clusterId: ClusterType;
  label: string;
  type: string;
  x: number;
  y: number;
  status: 'normal' | 'abnormal' | 'warning' | 'critical';
  details: string;
  value: string;
}

export interface ClusterEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  isActive?: boolean;
}

export type PersonaId = 
  | 'triage'
  | 'clinical'
  | 'medication'
  | 'evidence'
  | 'recovery'
  | 'conflict'
  | 'planner'
  | 'genomic'
  | 'lifestyle'
  | 'nephrology'
  | 'immunology'
  | 'ethics'
  | 'swarm_orchestrator'
  | (string & {});

export interface PersonaProfile {
  id: PersonaId;
  name: string;
  roleTitle: string;
  avatarIcon: string;
  color: string;
  badgeBg: string;
  keyQuestion: string;
}

export interface PersonaTurn {
  id: string;
  personaId: PersonaId;
  timestamp: string;
  headline: string;
  speechText: string;
  citedClusterIds: ClusterType[];
  citedNodeIds: string[];
  turnType: 'question' | 'correlation' | 'safety_check' | 'evidence_challenge' | 'plan' | 'disagreement' | 'consensus';
  evidenceCitations?: string[];
  uncertaintyScore?: number; // 0-100%
}

export interface ConsensusItem {
  id: string;
  topic: string;
  status: 'agreed' | 'disputed' | 'investigating';
  description: string;
  supportingPersonas: PersonaId[];
  opposingPersonas?: PersonaId[];
  clusterReferences: ClusterType[];
  evidenceRef?: string;
}

export interface ConsensusState {
  agreedFindings: ConsensusItem[];
  disputedFindings: ConsensusItem[];
  missingInformation: string[];
  overallConfidence: number; // e.g. 78%
  evidenceStrength: 'Strong' | 'Moderate' | 'Low';
  safetyAlerts: {
    level: 'low' | 'moderate' | 'high' | 'critical';
    title: string;
    description: string;
  }[];
  recommendedNextAction: string;
  requiresClinicianEscalation: boolean;
  escalationReason?: string;
}

export interface TimelineEvent {
  id: string;
  year: number;
  date: string;
  title: string;
  category: 'lab' | 'symptom' | 'medication' | 'consultation' | 'procedure';
  summary: string;
  impact: 'improved' | 'worsened' | 'stable' | 'new_finding';
  causalLinkToId?: string;
  causalDescription?: string;
  relatedClusterIds: ClusterType[];
}

export interface LabMarker {
  id: string;
  name: string;
  category: string;
  unit: string;
  referenceRange: string;
  history: {
    year: number;
    date: string;
    value: number;
    status: 'normal' | 'high' | 'low' | 'critical';
  }[];
  trend: 'up' | 'down' | 'stable';
  isAbnormal: boolean;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  status: 'active' | 'discontinued' | 'otc' | 'supplement';
  prescriber?: string;
  purpose: string;
  potentialInteractions: string[];
  knownAllergies: string[];
  patientReportedEffects?: string;
}

export interface SymptomLogEntry {
  id: string;
  date: string;
  dayNumber: number;
  painLevel: number; // 0-10
  fatigueLevel: number; // 0-10
  temperature: number; // deg F
  sleepHours: number;
  notes: string;
  symptomsLogged: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  evidenceUsed?: string;
  safetyCheckPassed: boolean;
}

export interface PatientConsentSetting {
  id: string;
  dataType: string;
  description: string;
  aiAnalysis: boolean;
  doctorAccess: boolean;
  caregiverAccess: boolean;
  longTermStorage: boolean;
}

export interface SwarmParticle {
  id: string;
  personaId: PersonaId;
  name: string;
  x: number; // 0..100
  y: number; // 0..100
  vx: number;
  vy: number;
  pBestX: number;
  pBestY: number;
  pBestScore: number;
  currentScore: number;
  hypothesis: string;
  beliefWeight: number;
  confidence: number;
  color: string;
  specialization: string;
}

export interface SwarmGlobalBest {
  x: number;
  y: number;
  fitness: number;
  hypothesis: string;
  confidence: number;
  dominantPersonas: PersonaId[];
}

export interface SwarmMetrics {
  cohesion: number; // 0..100%
  entropy: number; // 0..100%
  divergenceIndex: number; // 0..1
  iterationCount: number;
  convergenceStatus: 'exploring' | 'converging' | 'hyper_converged' | 'disputed';
  activeParticlesCount: number;
}

export interface SwarmMessage {
  id: string;
  senderId: PersonaId;
  senderName: string;
  receiverId: PersonaId | 'all';
  timestamp: string;
  topic: string;
  signalContent: string;
  weight: number;
  type: 'proposal' | 'critique' | 'validation' | 'consensus_signal';
}

export interface CrossExamExchange {
  personaId: PersonaId;
  personaName: string;
  argument: string;
  evidenceRef: string;
  tensionScore: number; // 0..100
  counterToId?: string;
}

export interface CrossExaminationDebate {
  id: string;
  topic: string;
  personaA: PersonaId;
  personaB: PersonaId;
  exchanges: CrossExamExchange[];
  consensusVerdict: string;
  agreementPercentage: number;
}
