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

export interface NodeVector {
  riskScore: number; // 0..100
  temporalRecency: number; // 0..100
  genomicRelevance: number; // 0..100
  affectedPersonaGoalId?: PersonaId;
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
  vector?: NodeVector;
  affectedPersonaId?: PersonaId;
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

export interface GoalMetric {
  id: string;
  name: string;
  unit: string;
  current: number;
  baseline: number;
  target: number;
  isLowerBetter?: boolean;
}

export interface DeepGoalProfile {
  primaryGoal: string;
  secondaryGoals: string[];
  constraints: string[];
  targetMetrics: GoalMetric[];
  utilityWeights: {
    safety: number; // 0..1
    efficacy: number; // 0..1
    speed: number; // 0..1
    qualityOfLife: number; // 0..1
  };
  goalAttainment: number; // 0..100%
  coalitionId: string;
}

export interface PersonaProfile {
  id: PersonaId;
  name: string;
  roleTitle: string;
  avatarIcon: string;
  color: string;
  badgeBg: string;
  keyQuestion: string;
  deepGoals?: DeepGoalProfile;
}

export interface PersonaCoalition {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: PersonaId[];
  sharedGoalFocus: string;
  consensusScore: number; // 0..100%
}

export type ClusterLensMode = 'domain' | 'goal_alignment' | 'risk_severity' | 'biomarker_correlation';

export interface ClusterAnalytics {
  cohesionIndex: number; // 0..100%
  silhouetteScore: number; // -1 .. +1
  anomalyCount: number;
  clusterCount: number;
  dominantDomain: string;
}

export interface GoalFrictionCell {
  personaA: PersonaId;
  personaB: PersonaId;
  frictionScore: number; // 0..100
  tensionReason: string;
  resolutionStrategy: string;
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

export interface ClinicalFact<T = string> {
  value: T;
  date: string;
  source: string;
  confidence: 'High' | 'Moderate' | 'Low';
  validityPeriod?: string;
  isStale?: boolean;
}

export interface HardSafetyConstraint {
  id: string;
  ruleType: 'allergy' | 'contraindication' | 'interaction' | 'dosage' | 'renal_restriction' | 'red_flag';
  title: string;
  description: string;
  parameterLimit?: string;
}

export interface SafetyCheckResult {
  status: 'SAFE' | 'BLOCKED';
  violatedConstraints: HardSafetyConstraint[];
  rationale: string;
  blockedAction?: string;
  suggestedSafeAlternative?: string;
}

export interface DataIntegrityAlert {
  id: string;
  type: 'conflict' | 'stale' | 'missing' | 'impossible';
  field: string;
  message: string;
  severity: 'low' | 'moderate' | 'high';
  suggestedResolution?: string;
}

export interface ClinicalGoal {
  id: string;
  domain: string;
  objective: string;
  targetValue: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'met' | 'conflict';
}

export interface GoalTradeoff {
  goalA: string;
  goalB: string;
  conflictDescription: string;
  tensionLevel: number; // 0..100
  resolutionOption: string;
}

export interface ModuleContract {
  moduleId: PersonaId;
  name: string;
  responsibility: string;
  expectedInput: string[];
  outputFormat: string;
  constraintsEnforced: string[];
}

export interface PatientClinicalState {
  demographics: {
    id: string;
    name: string;
    age: number;
    gender: string;
    bloodType: string;
    primaryPhysician: string;
  };
  conditions: ClinicalFact<string>[];
  symptoms: ClinicalFact<string>[];
  medications: MedicationItem[];
  allergies: ClinicalFact<string>[];
  labTrends: LabMarker[];
  vitals: ClinicalFact<{ bp: string; hr: number; temp: number; spo2: number }>;
  genetics: ClinicalFact<{ variant: string; gene: string; metabolizerStatus: string }>[];
  lifestyle: ClinicalFact<{ stepCount: number; sleepHours: number }>;
  riskFactors: ClinicalFact<string>[];
  clinicalGoals: ClinicalGoal[];
  treatmentHistory: TimelineEvent[];
  lastUpdated: string;
}

export interface EvidenceChain {
  patientReason: string;
  patientEvidence: string;
  guidelineCitation: string;
  evidenceStrength: 'High' | 'Moderate' | 'Low';
  safetyStatus: 'SAFE' | 'BLOCKED';
  uncertaintyLevel: 'LOW' | 'MODERATE' | 'HIGH';
  missingDataAlerts: string[];
}

export interface DecisionSynthesisResult {
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primaryRecommendation: string;
  safeAlternatives: string[];
  evidenceChain: EvidenceChain;
  safetyResult: SafetyCheckResult;
  clinicianActionStatus: 'PENDING_REVIEW' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  clinicianNotes?: string;
  timestamp: string;
}

export interface BenchmarkComparison {
  scenarioName: string;
  patientCaseSummary: string;
  baselineA_LLM: {
    recommendation: string;
    safetyPassed: boolean;
    contraindicationDetected: boolean;
    guidelineAdherence: number;
  };
  baselineB_RAG: {
    recommendation: string;
    safetyPassed: boolean;
    contraindicationDetected: boolean;
    guidelineAdherence: number;
  };
  healEngine: {
    recommendation: string;
    safetyPassed: boolean;
    contraindicationDetected: boolean;
    guidelineAdherence: number;
    blockedUnsafeAction: string;
    safeAlternative: string;
  };
}
