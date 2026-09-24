import { 
  DataClusterGroup, 
  ClusterNode, 
  ClusterEdge, 
  PersonaProfile, 
  PersonaTurn, 
  ConsensusState, 
  TimelineEvent, 
  LabMarker, 
  MedicationItem, 
  SymptomLogEntry, 
  AuditLogEntry, 
  PatientConsentSetting,
  StaticClinicalCase
} from '../types/health';
import { AuthUser } from '../services/authApi';

export const calculateAgeFromDob = (dob?: string): number => {
  if (!dob) return 64;
  const birthYear = new Date(dob).getFullYear();
  if (isNaN(birthYear)) return 64;
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
};

export const getDynamicPatientProfile = (user?: AuthUser | null) => {
  if (!user || user.email === 'eleanor@example.com' || user.fullName?.toLowerCase().includes('eleanor')) {
    return {
      id: user?.id || 'PT-884920',
      name: user?.fullName || 'Eleanor Vance',
      age: 68,
      gender: 'Female',
      bloodType: 'A+',
      primaryPhysician: 'Dr. Aris Thorne, MD (Cardiology)',
      status: 'Needs Clinician Review',
      statusColor: 'amber',
      overallHealthScore: 74,
      conditions: user?.profile?.conditions && user.profile.conditions.length > 0 ? user.profile.conditions : [
        'Heart Failure with Preserved Ejection Fraction (HFpEF)',
        'Chronic Kidney Disease (Stage 3b)',
        'Type 2 Diabetes Mellitus'
      ],
      medications: user?.profile?.medications && user.profile.medications.length > 0 ? user.profile.medications : [
        'Empagliflozin 10mg',
        'Furosemide 40mg',
        'Spironolactone 25mg'
      ],
      allergies: user?.profile?.allergies || ['Sulfa drugs', 'NSAIDs (Avoid)'],
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Registered User (e.g. Rahul Gunda or New Patient)
  const age = calculateAgeFromDob(user.profile?.dob);
  const conditions = user.profile?.conditions && user.profile.conditions.length > 0
    ? user.profile.conditions
    : ['Essential Hypertension', 'Mild Seasonal Asthma'];
  const medications = user.profile?.medications && user.profile.medications.length > 0
    ? user.profile.medications
    : ['Lisinopril 10mg', 'Albuterol Inhaler (PRN)'];

  return {
    id: user.id || `PT-${Math.floor(100000 + Math.random() * 900000)}`,
    name: user.fullName || user.email.split('@')[0],
    age: age > 0 && age < 120 ? age : 28,
    gender: user.profile?.sex || 'Male',
    bloodType: 'O+',
    primaryPhysician: 'Dr. Sarah Jenkins, MD (Internal Medicine)',
    status: user.profile?.hasUploadedRecords ? 'Active Monitoring' : 'Healthy Baseline',
    statusColor: 'emerald',
    overallHealthScore: 89,
    conditions,
    medications,
    allergies: user.profile?.allergies || ['None Reported'],
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
};

export const PATIENT_INFO = getDynamicPatientProfile();

export const PERSONA_PROFILES: Record<string, PersonaProfile> = {
  triage: {
    id: 'triage',
    name: 'Triage Safety Module',
    roleTitle: 'Acute Urgency & Safety Protocol',
    avatarIcon: 'ShieldAlert',
    color: '#F43F5E', // Rose
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    keyQuestion: 'What is the immediate risk?',
    deepGoals: {
      primaryGoal: 'Minimize acute clinical crisis & prevent decompensation',
      secondaryGoals: ['Rapid risk stratification', 'Continuous vitals threshold monitoring', 'Early warning escalation'],
      constraints: ['Zero tolerance for unacknowledged critical red flags', 'Response latency < 2 seconds'],
      targetMetrics: [
        { id: 'm-triage-1', name: 'Acute Risk Index', unit: '%', current: 32, baseline: 15, target: 10, isLowerBetter: true },
        { id: 'm-triage-2', name: 'Time to Escalation', unit: 'min', current: 4, baseline: 15, target: 5, isLowerBetter: true }
      ],
      utilityWeights: { safety: 0.70, efficacy: 0.15, speed: 0.10, qualityOfLife: 0.05 },
      goalAttainment: 82,
      coalitionId: 'coalition-safety'
    }
  },
  clinical: {
    id: 'clinical',
    name: 'Clinical Diagnostic Module',
    roleTitle: 'Diagnostic Reasoning & Correlation',
    avatarIcon: 'Stethoscope',
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    keyQuestion: 'How do current symptoms correlate with history?',
    deepGoals: {
      primaryGoal: 'Establish high-fidelity differential diagnosis & causal etiology',
      secondaryGoals: ['Correlate multi-system biomarkers', 'Map disease trajectory', 'Rule out mimics'],
      constraints: ['Must cite at least 2 longitudinal telemetry markers per diagnostic hypothesis'],
      targetMetrics: [
        { id: 'm-clin-1', name: 'Diagnostic Accuracy', unit: '%', current: 94, baseline: 75, target: 98, isLowerBetter: false },
        { id: 'm-clin-2', name: 'Causal Network Completeness', unit: '%', current: 88, baseline: 60, target: 95, isLowerBetter: false }
      ],
      utilityWeights: { safety: 0.35, efficacy: 0.45, speed: 0.10, qualityOfLife: 0.10 },
      goalAttainment: 89,
      coalitionId: 'coalition-diagnostic'
    }
  },
  medication: {
    id: 'medication',
    name: 'Medication Safety Module',
    roleTitle: 'Pharmacovigilance & Reconciliation',
    avatarIcon: 'Pill',
    color: '#8B5CF6', // Purple
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    keyQuestion: 'Are there interaction or prescription risks?',
    deepGoals: {
      primaryGoal: 'Eliminate nephrotoxic drug interactions & optimize pharmacotherapy',
      secondaryGoals: ['Deprescribe high-risk OTC NSAIDs', 'Substitute safe topical analgesics', 'Verify organ clearance rates'],
      constraints: ['Zero active nephrotoxic co-prescriptions', 'Strict clearance dosing adjustments'],
      targetMetrics: [
        { id: 'm-med-1', name: 'Nephrotoxic Burden', unit: 'pts', current: 4, baseline: 0, target: 0, isLowerBetter: true },
        { id: 'm-med-2', name: 'Regimen Safety Rating', unit: '%', current: 96, baseline: 70, target: 100, isLowerBetter: false }
      ],
      utilityWeights: { safety: 0.60, efficacy: 0.25, speed: 0.05, qualityOfLife: 0.10 },
      goalAttainment: 91,
      coalitionId: 'coalition-safety'
    }
  },
  evidence: {
    id: 'evidence',
    name: 'Evidence Intelligence Module',
    roleTitle: 'Clinical Guidelines & RAG Verification',
    avatarIcon: 'BookOpen',
    color: '#06B6D4', // Cyan
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    keyQuestion: 'What does authoritative evidence support?',
    deepGoals: {
      primaryGoal: 'Validate clinical recommendations against peer-reviewed KDIGO/ACC/AHA guidelines',
      secondaryGoals: ['Calculate RAG confidence scores', 'Highlight evidence gaps', 'Provide PubMed citations'],
      constraints: ['All treatment proposals must have Level A/B guideline provenance'],
      targetMetrics: [
        { id: 'm-ev-1', name: 'Guideline Alignment Score', unit: '%', current: 96, baseline: 80, target: 98, isLowerBetter: false },
        { id: 'm-ev-2', name: 'Uncertainty Index', unit: '%', current: 12, baseline: 40, target: 10, isLowerBetter: true }
      ],
      utilityWeights: { safety: 0.40, efficacy: 0.45, speed: 0.05, qualityOfLife: 0.10 },
      goalAttainment: 94,
      coalitionId: 'coalition-diagnostic'
    }
  },
  recovery: {
    id: 'recovery',
    name: 'Recovery Pathway Module',
    roleTitle: 'Care Pathway & Longitudinal Monitoring',
    avatarIcon: 'Activity',
    color: '#10B981', // Emerald
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    keyQuestion: 'What can be safely monitored vs. escalated?',
    deepGoals: {
      primaryGoal: 'Guide longitudinal recovery trajectory & prevent 30-day readmissions',
      secondaryGoals: ['Set post-intervention milestones', 'Track 14-day symptom recovery curve', 'Automate patient check-in prompts'],
      constraints: ['Must flag plan deviations exceeding 48 hours'],
      targetMetrics: [
        { id: 'm-rec-1', name: 'Trajectory Attainment', unit: '%', current: 84, baseline: 50, target: 95, isLowerBetter: false },
        { id: 'm-rec-2', name: 'Readmission Risk', unit: '%', current: 14, baseline: 35, target: 8, isLowerBetter: true }
      ],
      utilityWeights: { safety: 0.30, efficacy: 0.30, speed: 0.15, qualityOfLife: 0.25 },
      goalAttainment: 86,
      coalitionId: 'coalition-qol'
    }
  },
  conflict: {
    id: 'conflict',
    name: 'Goal Conflict Engine Module',
    roleTitle: 'Disagreement Resolution Engine',
    avatarIcon: 'Scale',
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    keyQuestion: 'Where do personas disagree?',
    deepGoals: {
      primaryGoal: 'Identify & reconcile friction between competing specialist agent recommendations',
      secondaryGoals: ['Calculate tension scores', 'Formulate compromise proposals', 'Highlight trade-off boundaries'],
      constraints: ['Ensure zero unresolved critical safety conflicts prior to final consensus'],
      targetMetrics: [
        { id: 'm-conf-1', name: 'Swarm Disagreement Index', unit: 'idx', current: 0.18, baseline: 0.65, target: 0.10, isLowerBetter: true },
        { id: 'm-conf-2', name: 'Friction Resolution Rate', unit: '%', current: 92, baseline: 60, target: 98, isLowerBetter: false }
      ],
      utilityWeights: { safety: 0.35, efficacy: 0.35, speed: 0.15, qualityOfLife: 0.15 },
      goalAttainment: 90,
      coalitionId: 'coalition-consensus'
    }
  },
  planner: {
    id: 'planner',
    name: 'Plan Synthesis Module',
    roleTitle: 'Synthesized Consensus Engine',
    avatarIcon: 'CheckCircle2',
    color: '#10B981',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    keyQuestion: 'What is the validated action plan?',
    deepGoals: {
      primaryGoal: 'Synthesize multi-agent swarm outputs into an actionable, prioritized clinical plan',
      secondaryGoals: ['Generate step-by-step order recommendations', 'Format EHR-ready clinical summary', 'Assign clinician task items'],
      constraints: ['Plan must satisfy 100% of hard safety constraints from Nephrology and Medication AI'],
      targetMetrics: [
        { id: 'm-plan-1', name: 'Plan Cohesion Score', unit: '%', current: 95, baseline: 60, target: 98, isLowerBetter: false },
        { id: 'm-plan-2', name: 'Clinician Review Readiness', unit: '%', current: 98, baseline: 50, target: 100, isLowerBetter: false }
      ],
      utilityWeights: { safety: 0.40, efficacy: 0.30, speed: 0.15, qualityOfLife: 0.15 },
      goalAttainment: 95,
      coalitionId: 'coalition-consensus'
    }
  },
  genomic: {
    id: 'genomic',
    name: 'Pharmacogenomics Module',
    roleTitle: 'Pharmacogenomics & Variant Analysis',
    avatarIcon: 'Dna',
    color: '#EC4899', // Pink
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    keyQuestion: 'Do genetic variants affect drug clearance or disease etiology?',
    deepGoals: {
      primaryGoal: 'Personalize drug selection based on CYP enzymatic variants & genetic risk loci',
      secondaryGoals: ['Identify slow metabolizer genotypes (CYP2C9*3)', 'Predict drug half-life extension', 'Screen hereditary cardiorenal variants'],
      constraints: ['Flag any substrate drug prescribed to intermediate/poor metabolizer phenotypes'],
      targetMetrics: [
        { id: 'm-gen-1', name: 'Pharmacogenomic Clearance Alignment', unit: '%', current: 92, baseline: 70, target: 99, isLowerBetter: false },
        { id: 'm-gen-2', name: 'Variant Exposure Index', unit: 'pts', current: 2, baseline: 5, target: 0, isLowerBetter: true }
      ],
      utilityWeights: { safety: 0.50, efficacy: 0.35, speed: 0.05, qualityOfLife: 0.10 },
      goalAttainment: 88,
      coalitionId: 'coalition-safety'
    }
  },
  lifestyle: {
    id: 'lifestyle',
    name: 'Biometrics Telemetry Module',
    roleTitle: 'Wearables, Circadian & Sleep Telemetry',
    avatarIcon: 'HeartPulse',
    color: '#14B8A6', // Teal
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    keyQuestion: 'What are wearable sensors and daily trends revealing?',
    deepGoals: {
      primaryGoal: 'Extract continuous physiological signals from wearable telemetry & daily logs',
      secondaryGoals: ['Monitor step count trends', 'Detect nocturnal resting HR anomalies', 'Analyze sleep fragmentation'],
      constraints: ['Filter sensor noise & artifacts before updating health score'],
      targetMetrics: [
        { id: 'm-life-1', name: 'Daily Activity Recovery', unit: 'steps', current: 4200, baseline: 6500, target: 6000, isLowerBetter: false },
        { id: 'm-life-2', name: 'Resting Heart Rate Delta', unit: 'bpm', current: 4, baseline: 12, target: 2, isLowerBetter: true }
      ],
      utilityWeights: { safety: 0.20, efficacy: 0.30, speed: 0.10, qualityOfLife: 0.40 },
      goalAttainment: 81,
      coalitionId: 'coalition-qol'
    }
  },
  nephrology: {
    id: 'nephrology',
    name: 'Nephrology Specialty Module',
    roleTitle: 'Renal Function & Fluid Homeostasis',
    avatarIcon: 'Activity',
    color: '#3B82F6', // Royal Blue
    badgeBg: 'bg-blue-600/10 text-blue-400 border-blue-600/30',
    keyQuestion: 'Is renal filtration rate (eGFR) driving fluid overload?',
    deepGoals: {
      primaryGoal: 'Halt eGFR decline & maintain glomerular hemodynamic equilibrium',
      secondaryGoals: ['Eliminate renal vasoconstrictors (NSAIDs)', 'Monitor serum creatinine & K+', 'Optimize ACEi/ARB renal protection balance'],
      constraints: ['Immediate alert if eGFR drops > 15% from baseline', 'Discontinue systemic NSAIDs'],
      targetMetrics: [
        { id: 'm-neph-1', name: 'Estimated GFR', unit: 'mL/min', current: 52, baseline: 68, target: 65, isLowerBetter: false },
        { id: 'm-neph-2', name: 'Renal Hemodynamic Risk', unit: '%', current: 28, baseline: 65, target: 10, isLowerBetter: true }
      ],
      utilityWeights: { safety: 0.65, efficacy: 0.25, speed: 0.05, qualityOfLife: 0.05 },
      goalAttainment: 85,
      coalitionId: 'coalition-safety'
    }
  },
  immunology: {
    id: 'immunology',
    name: 'Immunology Cascade Module',
    roleTitle: 'Inflammatory Cascade & Biomarkers',
    avatarIcon: 'Flame',
    color: '#FF6B35', // Warm Orange
    badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    keyQuestion: 'Are systemic inflammatory markers (hs-CRP/IL-6) elevated?',
    deepGoals: {
      primaryGoal: 'Suppress chronic low-grade systemic inflammation & joint tissue destruction',
      secondaryGoals: ['Track hs-CRP & ESR biomarkers', 'Evaluate anti-inflammatory pathways', 'Prevent flare-ups'],
      constraints: ['Prefer non-systemic anti-inflammatory modalities in renal impairment'],
      targetMetrics: [
        { id: 'm-imm-1', name: 'hs-CRP Level', unit: 'mg/L', current: 4.8, baseline: 1.2, target: 2.0, isLowerBetter: true },
        { id: 'm-imm-2', name: 'Inflammatory Index', unit: 'pts', current: 62, baseline: 30, target: 25, isLowerBetter: true }
      ],
      utilityWeights: { safety: 0.40, efficacy: 0.35, speed: 0.05, qualityOfLife: 0.20 },
      goalAttainment: 83,
      coalitionId: 'coalition-diagnostic'
    }
  },
  ethics: {
    id: 'ethics',
    name: 'Bioethics & QoL Module',
    roleTitle: 'Shared Decision & Quality of Life',
    avatarIcon: 'Scale',
    color: '#A855F7', // Violet
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    keyQuestion: 'Does the clinical plan honor patient autonomy & preferences?',
    deepGoals: {
      primaryGoal: 'Maximize patient pain relief, mobility, and shared decision satisfaction',
      secondaryGoals: ['Ensure non-opioid, non-systemic analgesia alternatives', 'Honor patient functional goals (gardening, mobility)', 'Prevent polypharmacy burden'],
      constraints: ['Do not compromise pain management without providing an effective non-toxic alternative'],
      targetMetrics: [
        { id: 'm-eth-1', name: 'Pain Relief Attainment', unit: '%', current: 85, baseline: 40, target: 90, isLowerBetter: false },
        { id: 'm-eth-2', name: 'Patient Autonomy Index', unit: '%', current: 95, baseline: 70, target: 98, isLowerBetter: false }
      ],
      utilityWeights: { safety: 0.20, efficacy: 0.20, speed: 0.10, qualityOfLife: 0.50 },
      goalAttainment: 92,
      coalitionId: 'coalition-qol'
    }
  },
  swarm_orchestrator: {
    id: 'swarm_orchestrator',
    name: 'Orchestration Visualizer Module',
    roleTitle: 'Particle Swarm & Collective Intelligence',
    avatarIcon: 'Cpu',
    color: '#FFE600', // Bright Yellow
    badgeBg: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    keyQuestion: 'Has particle consensus converged across all agent sub-clusters?',
    deepGoals: {
      primaryGoal: 'Orchestrate particle swarm optimization to find global clinical consensus g_best',
      secondaryGoals: ['Balance cognitive vs social weights', 'Monitor swarm cohesion & entropy', 'Inject stress-test perturbations'],
      constraints: ['Maintain particle diversity until cohesion threshold > 80%'],
      targetMetrics: [
        { id: 'm-swarm-1', name: 'Global Best Fitness', unit: 'pts', current: 94.6, baseline: 60, target: 96, isLowerBetter: false },
        { id: 'm-swarm-2', name: 'Swarm Cohesion', unit: '%', current: 88.4, baseline: 30, target: 90, isLowerBetter: false }
      ],
      utilityWeights: { safety: 0.35, efficacy: 0.35, speed: 0.15, qualityOfLife: 0.15 },
      goalAttainment: 96,
      coalitionId: 'coalition-consensus'
    }
  }
};

export const INITIAL_DATA_CLUSTERS: DataClusterGroup[] = [
  {
    id: 'symptoms',
    title: 'Cluster 1 — Symptoms',
    description: 'Current presentation, severity, duration, and patient descriptions',
    iconName: 'Activity',
    color: '#F43F5E',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/5',
    items: [
      { id: 'sym-1', clusterType: 'symptoms', label: 'Exertional Dyspnea', value: 'Moderate (Grade II)', detail: 'Shortness of breath climbing 1 flight of stairs', status: 'abnormal', confidence: 92, provenance: 'Patient Diary' },
      { id: 'sym-2', clusterType: 'symptoms', label: 'Bilateral Leg Swelling', value: '2+ Pitting Edema', detail: 'Noticeable around ankles in evenings', status: 'abnormal', confidence: 88, provenance: 'Patient Consultation' },
      { id: 'sym-3', clusterType: 'symptoms', label: 'Fatigue', value: 'Moderate-High (6/10)', detail: 'Duration: 3 weeks worsening', status: 'warning', confidence: 85, provenance: 'Symptom Journal' },
      { id: 'sym-4', clusterType: 'symptoms', label: 'Orthopnea', value: 'Absent', detail: 'Sleeps with 1 pillow comfortably', status: 'normal', confidence: 90, provenance: 'Patient Diary' }
    ]
  },
  {
    id: 'history',
    title: 'Cluster 2 — Medical History',
    description: 'Diagnoses, previous procedures, family history, chronic conditions',
    iconName: 'History',
    color: '#3B82F6',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/5',
    items: [
      { id: 'hist-1', clusterType: 'history', label: 'Essential Hypertension', value: 'Diagnosed 2021', detail: 'Managed with Lisinopril 20mg daily', status: 'stable', confidence: 98, provenance: 'EHR Record' },
      { id: 'hist-2', clusterType: 'history', label: 'Mild CKD (Stage 2)', value: 'Diagnosed 2024', detail: 'Baseline eGFR ~68 mL/min/1.73m²', status: 'warning', confidence: 95, provenance: 'Nephrology Summary' },
      { id: 'hist-3', clusterType: 'history', label: 'Type 2 Diabetes Mellitus', value: 'Diagnosed 2022', detail: 'HbA1c last 6.8%', status: 'stable', confidence: 96, provenance: 'EHR Record' },
      { id: 'hist-4', clusterType: 'history', label: 'Family Cardiac History', value: 'Maternal CAD', detail: 'Mother had CABG at age 68', status: 'normal', confidence: 90, provenance: 'Patient Intake' }
    ]
  },
  {
    id: 'reports',
    title: 'Cluster 3 — Reports & Labs',
    description: 'Laboratory results, imaging findings, vitals, and objective biomarkers',
    iconName: 'FileText',
    color: '#06B6D4',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/5',
    items: [
      { id: 'rep-1', clusterType: 'reports', label: 'Serum Creatinine', value: '1.45 mg/dL', detail: 'Increased from 1.15 in 2025 (Ref 0.6 - 1.1)', status: 'abnormal', confidence: 99, provenance: 'Quest Diagnostics (2026-08-10)' },
      { id: 'rep-2', clusterType: 'reports', label: 'eGFR', value: '52 mL/min/1.73m²', detail: 'Decreased from 64 in 2025 (Stage 3a shift)', status: 'critical', confidence: 99, provenance: 'Quest Diagnostics (2026-08-10)' },
      { id: 'rep-3', clusterType: 'reports', label: 'NT-proBNP', value: '480 pg/mL', detail: 'Elevated (Ref < 125 pg/mL)', status: 'abnormal', confidence: 97, provenance: 'LabCorp (2026-08-10)' },
      { id: 'rep-4', clusterType: 'reports', label: 'Blood Pressure', value: '138 / 86 mmHg', detail: 'Recent 7-day average', status: 'warning', confidence: 94, provenance: 'Smart BP Cuff Device' }
    ]
  },
  {
    id: 'medication',
    title: 'Cluster 4 — Medication & Interactions',
    description: 'Prescriptions, OTC supplements, dosage schedules, and interaction alerts',
    iconName: 'Pill',
    color: '#8B5CF6',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/5',
    items: [
      { id: 'med-1', clusterType: 'medication', label: 'Lisinopril', value: '20 mg Daily', detail: 'ACE Inhibitor for HTN / Renal Protection', status: 'stable', confidence: 98, provenance: 'Prescription Sync' },
      { id: 'med-2', clusterType: 'medication', label: 'Furosemide', value: '20 mg Daily', detail: 'Loop Diuretic for fluid balance', status: 'stable', confidence: 95, provenance: 'Prescription Sync' },
      { id: 'med-3', clusterType: 'medication', label: 'OTC Ibuprofen', value: '400 mg PRN', detail: 'Started 2 weeks ago for knee soreness (3x/week)', status: 'critical', confidence: 92, provenance: 'Patient Diary Log' },
      { id: 'med-4', clusterType: 'medication', label: 'Metformin', value: '500 mg BID', detail: 'For T2DM glycemic control', status: 'stable', confidence: 97, provenance: 'Prescription Sync' }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Cluster 5 — Lifestyle & Vitals',
    description: 'Wearable data, physical activity, sleep patterns, and daily hydration',
    iconName: 'HeartPulse',
    color: '#10B981',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/5',
    items: [
      { id: 'life-1', clusterType: 'lifestyle', label: 'Daily Step Count', value: '3,100 steps/day', detail: 'Reduced 40% over past 3 weeks due to fatigue', status: 'warning', confidence: 96, provenance: 'Smartwatch Sync' },
      { id: 'life-2', clusterType: 'lifestyle', label: 'Resting Heart Rate', value: '76 bpm', detail: 'Normal sinus rhythm baseline', status: 'normal', confidence: 98, provenance: 'Wearable HR Sensor' },
      { id: 'life-3', clusterType: 'lifestyle', label: 'Sodium Intake', value: 'Moderate (~2.4g/day)', detail: 'Dietary diary entry', status: 'normal', confidence: 80, provenance: 'Self Report' },
      { id: 'life-4', clusterType: 'lifestyle', label: 'Sleep Duration', value: '6.2 hrs/night', detail: 'Frequent awakenings reported', status: 'warning', confidence: 88, provenance: 'Sleep Ring Data' }
    ]
  },
  {
    id: 'risk',
    title: 'Cluster 6 — Risk & Uncertainty',
    description: 'Early warning indicators, drug-lab interactions, and model agreement levels',
    iconName: 'AlertTriangle',
    color: '#F59E0B',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/5',
    items: [
      { id: 'risk-1', clusterType: 'risk', label: 'NSAID + ACEi Renal Toxicity Alert', value: 'High Interaction Concern', detail: 'Ibuprofen combined with Lisinopril causes afferent arteriolar constriction + eGFR decline', status: 'critical', confidence: 96, provenance: 'Medication Safety Engine' },
      { id: 'risk-2', clusterType: 'risk', label: 'Early Fluid Overload Pattern', value: 'Moderate Escalation Risk', detail: 'Elevated BNP + dyspnea + leg edema suggests early mild heart failure exacerbation', status: 'abnormal', confidence: 84, provenance: 'Clinical Reasoning Engine' },
      { id: 'risk-3', clusterType: 'risk', label: 'Evidence Completeness', value: '82% Complete', detail: 'Missing recent Echocardiogram report within last 12 months', status: 'warning', confidence: 82, provenance: 'Uncertainty Engine' }
    ]
  },
  {
    id: 'recovery',
    title: 'Cluster 7 — Recovery & Outcomes',
    description: 'Post-intervention monitoring, daily symptom diary trends, and follow-up plan',
    iconName: 'CheckCircle',
    color: '#6366F1',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-500/5',
    items: [
      { id: 'rec-1', clusterType: 'recovery', label: '14-Day Symptom Trajectory', value: 'Day 5 of Assessment', detail: 'Fatigue 6/10 -> Dyspnea 4/10 -> Leg edema persisting', status: 'warning', confidence: 90, provenance: 'Recovery Journey Engine' },
      { id: 'rec-2', clusterType: 'recovery', label: 'Medication Adherence', value: '98% Adherent', detail: 'Prescribed meds taken reliably on schedule', status: 'normal', confidence: 99, provenance: 'Pill Dispenser Sensor' },
      { id: 'rec-3', clusterType: 'recovery', label: 'Clinician Review Status', value: 'Escalation Pending', detail: 'Requires Dr. Thorne review due to eGFR decline & OTC NSAID interaction', status: 'abnormal', confidence: 95, provenance: 'Triage Governance' }
    ]
  }
];

export const KNOWLEDGE_GRAPH_NODES: ClusterNode[] = [
  { id: 'sym-1', clusterId: 'symptoms', label: 'Exertional Dyspnea', type: 'Symptom', x: 120, y: 100, status: 'abnormal', value: 'Grade II', details: 'Breathlessness climbing stairs', vector: { riskScore: 72, temporalRecency: 90, genomicRelevance: 30, affectedPersonaGoalId: 'clinical' }, affectedPersonaId: 'clinical' },
  { id: 'sym-2', clusterId: 'symptoms', label: 'Leg Edema', type: 'Symptom', x: 140, y: 220, status: 'abnormal', value: '2+ Pitting', details: 'Bilateral ankle edema', vector: { riskScore: 68, temporalRecency: 85, genomicRelevance: 20, affectedPersonaGoalId: 'lifestyle' }, affectedPersonaId: 'lifestyle' },
  { id: 'hist-2', clusterId: 'history', label: 'Stage 2 CKD', type: 'Condition', x: 300, y: 80, status: 'warning', value: 'Baseline eGFR ~68', details: 'Chronic Kidney Disease history', vector: { riskScore: 82, temporalRecency: 40, genomicRelevance: 60, affectedPersonaGoalId: 'nephrology' }, affectedPersonaId: 'nephrology' },
  { id: 'hist-1', clusterId: 'history', label: 'Hypertension', type: 'Condition', x: 320, y: 240, status: 'normal', value: '138/86', details: 'Essential hypertension', vector: { riskScore: 45, temporalRecency: 30, genomicRelevance: 50, affectedPersonaGoalId: 'clinical' }, affectedPersonaId: 'clinical' },
  { id: 'rep-2', clusterId: 'reports', label: 'eGFR Drop (52)', type: 'LabResult', x: 500, y: 90, status: 'critical', value: '52 mL/min', details: 'Down from 64 mL/min in 2025', vector: { riskScore: 95, temporalRecency: 95, genomicRelevance: 85, affectedPersonaGoalId: 'nephrology' }, affectedPersonaId: 'nephrology' },
  { id: 'rep-3', clusterId: 'reports', label: 'NT-proBNP (480)', type: 'LabResult', x: 520, y: 210, status: 'abnormal', value: '480 pg/mL', details: 'Ventricular stretch biomarker', vector: { riskScore: 78, temporalRecency: 88, genomicRelevance: 40, affectedPersonaGoalId: 'immunology' }, affectedPersonaId: 'immunology' },
  { id: 'med-1', clusterId: 'medication', label: 'Lisinopril 20mg', type: 'Medication', x: 700, y: 120, status: 'normal', value: 'Daily', details: 'ACE Inhibitor therapy', vector: { riskScore: 40, temporalRecency: 98, genomicRelevance: 75, affectedPersonaGoalId: 'medication' }, affectedPersonaId: 'medication' },
  { id: 'med-3', clusterId: 'medication', label: 'OTC Ibuprofen', type: 'Medication', x: 720, y: 260, status: 'critical', value: '400mg PRN', details: 'NSAID intake 3x weekly', vector: { riskScore: 98, temporalRecency: 99, genomicRelevance: 90, affectedPersonaGoalId: 'genomic' }, affectedPersonaId: 'genomic' },
  { id: 'risk-1', clusterId: 'risk', label: 'NSAID-ACEi Toxicity', type: 'RiskFactor', x: 420, y: 340, status: 'critical', value: 'High Concern', details: 'Renal hemodynamics impairment', vector: { riskScore: 96, temporalRecency: 95, genomicRelevance: 80, affectedPersonaGoalId: 'triage' }, affectedPersonaId: 'triage' },
  { id: 'rec-3', clusterId: 'recovery', label: 'Clinician Escalation', type: 'ActionItem', x: 260, y: 360, status: 'abnormal', value: 'Pending', details: 'Requires nephrology/cardiology consult', vector: { riskScore: 65, temporalRecency: 90, genomicRelevance: 10, affectedPersonaGoalId: 'ethics' }, affectedPersonaId: 'ethics' }
];

export const KNOWLEDGE_GRAPH_EDGES: ClusterEdge[] = [
  { id: 'e1', source: 'med-3', target: 'rep-2', relationship: 'INDUCMENT / EXACERBATION', isActive: true },
  { id: 'e2', source: 'med-3', target: 'med-1', relationship: 'DRUG INTERACTION', isActive: true },
  { id: 'e3', source: 'med-3', target: 'risk-1', relationship: 'TRIGGERS RISK', isActive: true },
  { id: 'e4', source: 'hist-2', target: 'rep-2', relationship: 'UNDERLYING VULNERABILITY', isActive: true },
  { id: 'e5', source: 'rep-3', target: 'sym-1', relationship: 'PHYSIOLOGICAL CORRELATE', isActive: true },
  { id: 'e6', source: 'rep-3', target: 'sym-2', relationship: 'FLUID RETENTION SIGNAL', isActive: true },
  { id: 'e7', source: 'risk-1', target: 'rec-3', relationship: 'REQUIRES ESCALATION', isActive: true }
];

export const CASE_CONFERENCE_TURNS: PersonaTurn[] = [
  {
    id: 'turn-1',
    personaId: 'triage',
    timestamp: '2026-08-13 19:45:01',
    headline: 'Immediate Risk Assessment',
    speechText: 'What is the immediate risk to Eleanor? She presents with worsening exertional dyspnea, 2+ leg edema, and a recent eGFR drop to 52. While her vitals are stable, this pattern warrants active concern rather than routine monitoring.',
    citedClusterIds: ['symptoms', 'reports', 'risk'],
    citedNodeIds: ['sym-1', 'sym-2', 'rep-2'],
    turnType: 'question',
    uncertaintyScore: 15
  },
  {
    id: 'turn-2',
    personaId: 'clinical',
    timestamp: '2026-08-13 19:45:12',
    headline: 'Historical & Symptom Correlation',
    speechText: 'Connecting current symptoms with historical records: Eleanor has Stage 2 CKD baseline and hypertension. Notice that NT-proBNP rose to 480 pg/mL alongside new leg edema. What triggered this sudden acute shift in her renal and cardiac markers over the last 3 weeks?',
    citedClusterIds: ['symptoms', 'history', 'reports'],
    citedNodeIds: ['sym-1', 'hist-2', 'rep-2', 'rep-3'],
    turnType: 'correlation',
    evidenceCitations: ['KDIGO 2024 Clinical Practice Guideline for CKD Evaluation'],
    uncertaintyScore: 22
  },
  {
    id: 'turn-3',
    personaId: 'medication',
    timestamp: '2026-08-13 19:45:25',
    headline: 'Pharmacovigilance & NSAID Alarm',
    speechText: 'Before assuming disease progression, look closely at Cluster 4! Eleanor logged taking OTC Ibuprofen 400mg 3 times a week for knee pain. Combining an NSAID with Lisinopril in a patient with Stage 2 CKD causes efferent/afferent renal blood flow mismatch, explaining the rapid eGFR drop from 64 to 52!',
    citedClusterIds: ['medication', 'reports', 'risk'],
    citedNodeIds: ['med-1', 'med-3', 'rep-2', 'risk-1'],
    turnType: 'safety_check',
    evidenceCitations: ['FDA Drug Safety Communication: NSAID Avoidance in Chronic Kidney Disease'],
    uncertaintyScore: 10
  },
  {
    id: 'turn-4',
    personaId: 'evidence',
    timestamp: '2026-08-13 19:45:38',
    headline: 'Evidence Strength & Uncertainty Analysis',
    speechText: 'The evidence strongly supports NSAID-induced acute kidney injury on CKD (Evidence Grade A). However, there is moderate uncertainty regarding her NT-proBNP elevation: is it fluid overload from reduced eGFR, or early congestive heart failure? An Echocardiogram is missing from her record.',
    citedClusterIds: ['reports', 'risk', 'history'],
    citedNodeIds: ['rep-3', 'risk-3'],
    turnType: 'evidence_challenge',
    evidenceCitations: ['AHA/ACC 2022 Heart Failure Guidelines (Section 4.2 Biomarkers)'],
    uncertaintyScore: 35
  },
  {
    id: 'turn-5',
    personaId: 'recovery',
    timestamp: '2026-08-13 19:45:50',
    headline: 'Actionable Pathway & Monitoring Strategy',
    speechText: 'Given our agreed findings: 1) Immediately stop OTC Ibuprofen and switch to topical or non-NSAID analgesia under clinician guidance. 2) Re-check renal panel in 7 days. 3) Escalate to Dr. Thorne for clinical evaluation of her fluid status and potential Echocardiogram order.',
    citedClusterIds: ['medication', 'recovery', 'risk'],
    citedNodeIds: ['med-3', 'rec-1', 'rec-3'],
    turnType: 'plan',
    evidenceCitations: ['NICE Clinical Guideline CG182: Acute Kidney Injury Management'],
    uncertaintyScore: 12
  },
  {
    id: 'turn-6',
    personaId: 'conflict',
    timestamp: '2026-08-13 19:46:02',
    headline: 'Conflict Resolution & Uncertainty Check',
    speechText: 'Synthesizing persona dialogue: All personas agree on stopping OTC Ibuprofen. The main point of uncertainty is whether her dyspnea requires immediate ER escalation vs. prompt outpatient cardiology review. Triage agrees outpatient consult within 48h is appropriate unless orthopnea develops.',
    citedClusterIds: ['symptoms', 'risk', 'recovery'],
    citedNodeIds: ['sym-1', 'sym-4', 'rec-3'],
    turnType: 'disagreement',
    uncertaintyScore: 18
  },
  {
    id: 'turn-7',
    personaId: 'planner',
    timestamp: '2026-08-13 19:46:15',
    headline: 'Consensus Decision & Action Plan',
    speechText: 'FINAL CONSENSUS REACHED: High confidence recommendation. Stop OTC Ibuprofen immediately. Schedule prompt clinician consult within 48 hours for renal re-evaluation and heart failure screening. Monitor daily weights and leg edema in the Symptom Diary.',
    citedClusterIds: ['symptoms', 'medication', 'reports', 'risk', 'recovery'],
    citedNodeIds: ['med-3', 'rec-3', 'risk-1'],
    turnType: 'consensus',
    evidenceCitations: ['KDIGO 2024 & AHA/ACC Guidelines Integrated Protocol'],
    uncertaintyScore: 8
  },
  {
    id: 'turn-8',
    personaId: 'nephrology',
    timestamp: '2026-08-13 19:46:28',
    headline: 'Renal Hemodynamics & Electrolyte Clearance',
    speechText: 'Nephrology Evaluation: Eleanor\'s eGFR drop from 64 to 52 represents a 18.7% loss in renal clearance rate. Combined with Lisinopril, NSAID inhibition of prostaglandin-mediated afferent vasodilatation decreases intraglomerular pressure. Serum Potassium must be monitored for hyperkalemia risk!',
    citedClusterIds: ['reports', 'medication', 'history'],
    citedNodeIds: ['rep-1', 'rep-2', 'med-1'],
    turnType: 'safety_check',
    evidenceCitations: ['American Society of Nephrology (ASN) Glomerular Hemodynamics Protocol'],
    uncertaintyScore: 14
  },
  {
    id: 'turn-9',
    personaId: 'genomic',
    timestamp: '2026-08-13 19:46:40',
    headline: 'Pharmacogenomic Clearance Profile',
    speechText: 'Genomic Variant Screening: Patient profile notes CYP2C9 *1/*3 intermediate metabolizer status. Reduced clearance rate of NSAIDs elevates systemic exposure duration by ~40%, markedly amplifying renal vessel constriction compared to normal metabolizers.',
    citedClusterIds: ['medication', 'reports', 'risk'],
    citedNodeIds: ['med-3', 'risk-1'],
    turnType: 'evidence_challenge',
    evidenceCitations: ['CPIC Pharmacogenomic Guideline for NSAIDs and CYP2C9 Variants'],
    uncertaintyScore: 18
  },
  {
    id: 'turn-10',
    personaId: 'lifestyle',
    timestamp: '2026-08-13 19:46:52',
    headline: 'Continuous Sensor Telemetry Analysis',
    speechText: 'Biometric Telemetry: Smartwatch and sleep ring telemetry over the past 14 days confirm a 12% drop in Heart Rate Variability (HRV) and nocturnal pulse elevation (68 -> 76 bpm). Sleep efficiency dropped to 72% with micro-awakenings matching mild orthopnea events.',
    citedClusterIds: ['lifestyle', 'symptoms'],
    citedNodeIds: ['life-1', 'life-4', 'sym-3'],
    turnType: 'correlation',
    evidenceCitations: ['Journal of Medical Internet Research (JMIR) Wearable Biomarker Tracking'],
    uncertaintyScore: 15
  },
  {
    id: 'turn-11',
    personaId: 'immunology',
    timestamp: '2026-08-13 19:47:04',
    headline: 'Systemic Inflammatory Cascade Analysis',
    speechText: 'Immunology Signal: Chronic low-grade inflammation (hs-CRP 3.8 mg/L) detected alongside metabolic syndrome indicators. Inflammatory cytokine activation accelerates vascular endothelial stiffness and renal microvascular fragility.',
    citedClusterIds: ['reports', 'symptoms', 'risk'],
    citedNodeIds: ['rep-1', 'sym-3'],
    turnType: 'correlation',
    evidenceCitations: ['Nature Reviews Nephrology: Inflammation in Diabetic Kidney Disease'],
    uncertaintyScore: 20
  },
  {
    id: 'turn-12',
    personaId: 'ethics',
    timestamp: '2026-08-13 19:47:16',
    headline: 'Patient Preference & Shared Care Ethics',
    speechText: 'Bioethics & Quality of Life Review: Eleanor prioritizes maintaining mobility and managing knee osteoarthritis without heavy opioid analgesics. Our recommendation must substitute safe topical treatments (e.g., topical Capsaicin or Lidocaine patches) to preserve mobility while protecting renal safety.',
    citedClusterIds: ['recovery', 'lifestyle', 'medication'],
    citedNodeIds: ['rec-1', 'med-3'],
    turnType: 'plan',
    evidenceCitations: ['AMA Journal of Ethics: Shared Decision Making in Multimorbid Chronic Care'],
    uncertaintyScore: 10
  },
  {
    id: 'turn-13',
    personaId: 'swarm_orchestrator',
    timestamp: '2026-08-13 19:47:30',
    headline: 'Swarm Intelligence Global Convergence',
    speechText: 'SWARM CONVERGENCE ACHIEVED: 12 persona particle nodes have converged on g_best coordinate (X: 84.5, Y: 92.1) in the clinical outcome space. Swarm Cohesion: 94.8%, Entropy: 0.12. Unified Consensus: Cessation of OTC NSAID, initiate topical analgesic alternative, prompt eGFR & K+ re-check in 7 days, and cardiology echocardiogram referral.',
    citedClusterIds: ['symptoms', 'history', 'reports', 'medication', 'lifestyle', 'risk', 'recovery'],
    citedNodeIds: ['med-3', 'rep-2', 'risk-1', 'rec-3'],
    turnType: 'consensus',
    evidenceCitations: ['Swarm Intelligence Multi-Agent Consensus Algorithm v2.4'],
    uncertaintyScore: 4
  }
];

export const INITIAL_CONSENSUS_STATE: ConsensusState = {
  agreedFindings: [
    {
      id: 'c-1',
      topic: 'NSAID-Induced Renal Impairment',
      status: 'agreed',
      description: 'Recent eGFR decline (64 -> 52) is correlated with OTC Ibuprofen intake interacting with Lisinopril therapy.',
      supportingPersonas: ['triage', 'clinical', 'medication', 'evidence', 'recovery', 'planner'],
      clusterReferences: ['medication', 'reports', 'risk'],
      evidenceRef: 'KDIGO 2024 Guidelines & FDA Drug Safety Alerts'
    },
    {
      id: 'c-2',
      topic: 'Immediate OTC Medication Cessation',
      status: 'agreed',
      description: 'OTC Ibuprofen must be discontinued immediately to protect renal hemodynamics.',
      supportingPersonas: ['medication', 'recovery', 'triage', 'planner'],
      clusterReferences: ['medication', 'recovery']
    },
    {
      id: 'c-3',
      topic: 'Fluid Retention & Elevated BNP Correlation',
      status: 'agreed',
      description: 'NT-proBNP 480 pg/mL correlates with leg edema and exertional dyspnea.',
      supportingPersonas: ['clinical', 'triage', 'evidence'],
      clusterReferences: ['symptoms', 'reports']
    }
  ],
  disputedFindings: [
    {
      id: 'c-4',
      topic: 'Urgency of Cardiac Workup',
      status: 'disputed',
      description: 'Whether elevated BNP represents acute de-compensated heart failure vs. mild volume expansion secondary to reduced renal excretion.',
      supportingPersonas: ['clinical', 'evidence'],
      opposingPersonas: ['triage'],
      clusterReferences: ['reports', 'risk'],
      evidenceRef: 'AHA/ACC 2022 Guidelines (Section 4.2)'
    }
  ],
  missingInformation: [
    'Recent Echocardiogram report within the last 12 months',
    'Spot Urine Protein-to-Creatinine Ratio (uPCR)',
    '7-Day daily weight record to assess rapid fluid accumulation'
  ],
  overallConfidence: 86,
  evidenceStrength: 'Strong',
  safetyAlerts: [
    {
      level: 'high',
      title: 'Drug-Drug-Disease Interaction Flag',
      description: 'Lisinopril + Ibuprofen in Stage 2 CKD patient increases risk of acute kidney injury (AKI).'
    },
    {
      level: 'moderate',
      title: 'Biomarker Elevation Concern',
      description: 'eGFR drop of 12 units in 12 months requires physician review.'
    }
  ],
  recommendedNextAction: 'Discontinue OTC Ibuprofen immediately; notify Dr. Aris Thorne for priority appointment within 48h; log daily weights.',
  requiresClinicianEscalation: true,
  escalationReason: 'eGFR drop >10% with concurrent NSAID use and elevated BNP biomarker.'
};

export const STATIC_CLINICAL_CASES: Record<string, StaticClinicalCase> = {
  case_eleanor_vance: {
    id: 'case_eleanor_vance',
    title: 'Eleanor Vance (68F) — NSAID + ACEi Cardiorenal Collision',
    patientName: 'Eleanor Vance',
    age: 68,
    gender: 'Female',
    domainCategory: 'Medication Safety & Cardiorenal',
    summary: '68yo female with CKD Stage 2 and HTN on Lisinopril + HCTZ, presenting with acute eGFR decline (64 → 52 mL/min) and bilateral pedal edema following 3-week OTC Ibuprofen use.',
    keyBiomarkerChange: 'eGFR: 64 → 52 mL/min (-18.7%), BNP: 480 pg/mL, Serum Creatinine: 1.4 mg/dL',
    primaryRisk: 'Triple-whammy prerenal hemodynamic collapse (ACEi + Diuretic + OTC NSAID)',
    turns: CASE_CONFERENCE_TURNS,
    consensus: INITIAL_CONSENSUS_STATE
  },
  case_arthur_pendelton: {
    id: 'case_arthur_pendelton',
    title: 'Arthur Pendelton (72M) — Warfarin Polypharmacy + CYP2C9 CPIC Alert',
    patientName: 'Arthur Pendelton',
    age: 72,
    gender: 'Male',
    domainCategory: 'Pharmacogenomics & Anticoagulation',
    summary: '72yo male with Non-Valvular Atrial Fibrillation on Warfarin 5mg daily. Recently prescribed Bactrim DS for UTI and Amiodarone for arrhythmia. Genomic profile reveals CYP2C9*1/*3 intermediate metabolizer, causing acute supratherapeutic INR elevation to 3.8 and hematuria.',
    keyBiomarkerChange: 'INR: 2.2 → 3.8 (High Bleed Risk), Hemoglobin: 13.5 → 11.8 g/dL, Platelets: 210 k/uL',
    primaryRisk: 'High-risk intracranial and gastrointestinal hemorrhage due to potent CYP2C9 enzymatic inhibition and protein-binding displacement.',
    turns: [
      {
        id: 'ap-1',
        personaId: 'triage',
        timestamp: '2026-08-20 09:15:00',
        headline: 'Acute Bleeding Risk Alert',
        speechText: 'Critical Coagulation Warning: Arthur\'s INR has surged from baseline 2.2 to 3.8. Urinalysis confirms microscopic hematuria. High vulnerability for major spontaneous hemorrhage.',
        citedClusterIds: ['reports', 'risk', 'symptoms'],
        citedNodeIds: ['rep-1', 'risk-1', 'sym-1'],
        turnType: 'safety_check',
        uncertaintyScore: 5
      },
      {
        id: 'ap-2',
        personaId: 'genomic',
        timestamp: '2026-08-20 09:15:20',
        headline: 'Pharmacogenomic Variant Analysis',
        speechText: 'CYP2C9*1/*3 and VKORC1-1639G>A status verified. S-warfarin clearance is reduced by >45%. Co-administration of Sulfamethoxazole/Trimethoprim blocks residual CYP2C9 metabolic pathway completely.',
        citedClusterIds: ['reports', 'medication'],
        citedNodeIds: ['rep-2', 'med-1'],
        turnType: 'evidence_challenge',
        evidenceCitations: ['CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing (2024 Update)'],
        uncertaintyScore: 8
      },
      {
        id: 'ap-3',
        personaId: 'medication',
        timestamp: '2026-08-20 09:15:40',
        headline: 'Immediate Antimicrobial & Anticoagulant Deprescribing',
        speechText: 'Hold Warfarin dose today. Switch Bactrim DS to Nitrofurantoin or Cefpodoxime to remove CYP2C9 inhibition. Administer oral Vitamin K1 (1-2.5 mg) if mucosal bleeding develops.',
        citedClusterIds: ['medication', 'recovery', 'risk'],
        citedNodeIds: ['med-2', 'rec-1', 'risk-1'],
        turnType: 'plan',
        evidenceCitations: ['Chest Antithrombotic Therapy Guidelines: Management of Supratherapeutic INR'],
        uncertaintyScore: 10
      },
      {
        id: 'ap-4',
        personaId: 'clinical',
        timestamp: '2026-08-20 09:16:00',
        headline: 'Thromboembolic vs Bleeding Tradeoff Evaluation',
        speechText: 'CHA2DS2-VASc score is 4 (High Stroke Risk), HAS-BLED score is 3. Once stabilized and INR normalizes to 2.0-2.5, strongly recommend evaluating switch to Apixaban (DOAC) with renal dosing.',
        citedClusterIds: ['history', 'reports', 'recovery'],
        citedNodeIds: ['hist-1', 'rep-1', 'rec-2'],
        turnType: 'correlation',
        evidenceCitations: ['AHA/ACC/HRS Atrial Fibrillation Anticoagulation Guidelines'],
        uncertaintyScore: 12
      },
      {
        id: 'ap-5',
        personaId: 'planner',
        timestamp: '2026-08-20 09:16:30',
        headline: 'Case Conference Consensus Action Plan',
        speechText: 'UNIFIED ACTION PLAN: 1. Hold Warfarin x 24h. 2. Substitute Nitrofurantoin for Bactrim. 3. Recheck INR in 24 hours. 4. Patient education on bruising/melena screening. 5. DOAC transition scheduled for day 7.',
        citedClusterIds: ['medication', 'recovery', 'reports'],
        citedNodeIds: ['med-1', 'rec-1', 'rep-1'],
        turnType: 'consensus',
        evidenceCitations: ['Anticoagulation Forum Clinical Guidance for Inpatient & Outpatient Safety'],
        uncertaintyScore: 6
      }
    ],
    consensus: {
      agreedFindings: [
        {
          id: 'ap-c1',
          topic: 'Drug-Drug-Gene Supratherapeutic Anticoagulation',
          status: 'agreed',
          description: 'Warfarin interaction with Bactrim in CYP2C9*1/*3 patient caused rapid INR jump to 3.8.',
          supportingPersonas: ['triage', 'genomic', 'medication', 'clinical', 'planner'],
          clusterReferences: ['medication', 'reports', 'risk'],
          evidenceRef: 'CPIC Warfarin Guidelines & FDA Boxed Warnings'
        },
        {
          id: 'ap-c2',
          topic: 'Urgent Antimicrobial Substitution',
          status: 'agreed',
          description: 'Switch Bactrim to non-CYP2C9 inhibiting antibiotic immediately.',
          supportingPersonas: ['medication', 'clinical', 'planner'],
          clusterReferences: ['medication', 'recovery']
        }
      ],
      disputedFindings: [],
      missingInformation: ['Stool occult blood test (FIT)', 'Baseline hepatic function panel (LFT)'],
      overallConfidence: 94,
      evidenceStrength: 'Strong',
      safetyAlerts: [
        {
          level: 'critical',
          title: 'Hemorrhagic Crisis Risk (INR 3.8)',
          description: 'Supratherapeutic INR with active microhematuria requires prompt dose adjustment.'
        }
      ],
      recommendedNextAction: 'Hold Warfarin dose, replace Bactrim with Nitrofurantoin, repeat INR in 24 hours.',
      requiresClinicianEscalation: true,
      escalationReason: 'INR > 3.5 with drug-gene interaction and early bleeding signs.'
    }
  },
  case_marcus_wright: {
    id: 'case_marcus_wright',
    title: 'Marcus Wright (59M) — Heart Failure HFrEF + SGLT2i + Diuretic Shift',
    patientName: 'Marcus Wright',
    age: 59,
    gender: 'Male',
    domainCategory: 'Heart Failure & Electrolyte Balance',
    summary: '59yo male with Heart Failure with reduced Ejection Fraction (EF 32%), recently initiated on Empagliflozin 10mg daily while on Furosemide 40mg BID. Reports lightheadedness upon standing, dry mouth, and fatigue. Serum Potassium dropped to 3.2 mEq/L and Creatinine bumped from 1.1 to 1.5 mg/dL.',
    keyBiomarkerChange: 'Potassium: 4.2 → 3.2 mEq/L (Hypokalemia), S.Cr: 1.1 → 1.5 mg/dL, Systolic BP: 122 → 98 mmHg',
    primaryRisk: 'Ventricular arrhythmia risk secondary to hypokalemia, plus prerenal azotemia from excessive synergistic volume depletion.',
    turns: [
      {
        id: 'mw-1',
        personaId: 'triage',
        timestamp: '2026-08-21 11:00:00',
        headline: 'Orthostatic Hypotension & Hypokalemia Triage',
        speechText: 'Orthostatic vitals show 24 mmHg postural systolic drop (122 → 98 mmHg). Serum Potassium 3.2 mEq/L is below safe cardiac threshold, raising ventricular arrhythmogenic potential.',
        citedClusterIds: ['reports', 'symptoms', 'risk'],
        citedNodeIds: ['rep-1', 'sym-1', 'risk-1'],
        turnType: 'safety_check',
        uncertaintyScore: 6
      },
      {
        id: 'mw-2',
        personaId: 'medication',
        timestamp: '2026-08-21 11:00:25',
        headline: 'Dual Osmotic & Loop Diuresis Interaction',
        speechText: 'Empagliflozin induces osmotic natriuresis and glucosuria. In combination with Furosemide 80mg daily, total urinary volume has expanded by >1.2L/day, washing out potassium and inducing intravascular volume depletion.',
        citedClusterIds: ['medication', 'reports'],
        citedNodeIds: ['med-1', 'rep-2'],
        turnType: 'correlation',
        evidenceCitations: ['EMPEROR-Reduced Clinical Trial Electrolyte Dynamics & FDA Labeling'],
        uncertaintyScore: 8
      },
      {
        id: 'mw-3',
        personaId: 'nephrology',
        timestamp: '2026-08-21 11:00:50',
        headline: 'Prerenal Azotemia vs True AKI Differentiation',
        speechText: 'The BUN/Creatinine ratio of 24:1 and Fractional Excretion of Sodium (FeNa < 1%) indicates hemodynamic prerenal azotemia rather than acute tubular necrosis. Reduce Furosemide by 50% rather than stopping SGLT2i.',
        citedClusterIds: ['reports', 'medication', 'history'],
        citedNodeIds: ['rep-1', 'med-1', 'hist-1'],
        turnType: 'evidence_challenge',
        evidenceCitations: ['KDIGO 2024 & HFSA Guidelines on SGLT2i Management in Cardiorenal Syndrome'],
        uncertaintyScore: 10
      },
      {
        id: 'mw-4',
        personaId: 'recovery',
        timestamp: '2026-08-21 11:01:15',
        headline: 'Oral Potassium Repletion & Hydration Plan',
        speechText: 'Prescribe oral Potassium Chloride 20 mEq daily x 5 days. Instruct patient on logging daily sitting and standing blood pressure and taking morning weights.',
        citedClusterIds: ['recovery', 'medication', 'lifestyle'],
        citedNodeIds: ['rec-1', 'med-2', 'life-1'],
        turnType: 'plan',
        evidenceCitations: ['ACC Expert Consensus Decision Pathway for Heart Failure Management'],
        uncertaintyScore: 8
      },
      {
        id: 'mw-5',
        personaId: 'planner',
        timestamp: '2026-08-21 11:01:45',
        headline: 'Cardiorenal Consensus Synthesis',
        speechText: 'FINAL CONSENSUS: 1. Reduce Furosemide to 20mg BID. 2. Maintain Empagliflozin 10mg daily for long-term cardioprotection. 3. Initiate oral KCl 20 mEq daily. 4. Re-check BMP (Electrolytes + Renal Panel) in 72 hours.',
        citedClusterIds: ['medication', 'reports', 'recovery'],
        citedNodeIds: ['med-1', 'rep-1', 'rec-1'],
        turnType: 'consensus',
        evidenceCitations: ['2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure'],
        uncertaintyScore: 5
      }
    ],
    consensus: {
      agreedFindings: [
        {
          id: 'mw-c1',
          topic: 'Synergistic Diuretic Volume Depletion',
          status: 'agreed',
          description: 'SGLT2i + Loop diuretic co-therapy caused hypovolemia, orthostasis, and hypokalemia (3.2 mEq/L).',
          supportingPersonas: ['triage', 'medication', 'nephrology', 'recovery', 'planner'],
          clusterReferences: ['medication', 'reports', 'risk'],
          evidenceRef: '2022 AHA/ACC/HFSA Heart Failure Guidelines'
        },
        {
          id: 'mw-c2',
          topic: 'Diuretic Dose Down-Titration Strategy',
          status: 'agreed',
          description: 'Halve loop diuretic dose to maintain SGLT2 inhibitor guideline therapy.',
          supportingPersonas: ['medication', 'nephrology', 'planner'],
          clusterReferences: ['medication', 'recovery']
        }
      ],
      disputedFindings: [],
      missingInformation: ['Current 12-lead ECG for QTc measurement', 'Urine Osmolality'],
      overallConfidence: 91,
      evidenceStrength: 'Strong',
      safetyAlerts: [
        {
          level: 'high',
          title: 'Hypokalemia & Arrhythmia Risk (K+ 3.2 mEq/L)',
          description: 'Serum potassium below 3.5 in HFrEF patient requires immediate oral repletion and diuretic adjustment.'
        }
      ],
      recommendedNextAction: 'Reduce Furosemide to 20mg BID, start oral KCl 20 mEq/day, repeat BMP in 3 days.',
      requiresClinicianEscalation: true,
      escalationReason: 'Hypokalemia with symptomatic orthostatic hypotension.'
    }
  },
  case_sarah_jenkins: {
    id: 'case_sarah_jenkins',
    title: 'Sarah Jenkins (65F) — Diabetic Nephropathy + RAAS-i + MRA Hyperkalemia',
    patientName: 'Sarah Jenkins',
    age: 65,
    gender: 'Female',
    domainCategory: 'Diabetic Nephropathy & Endocrine',
    summary: '65yo female with Type 2 Diabetes (HbA1c 8.1%) and CKD Stage 3a (eGFR 44 mL/min). Coprescribed Lisinopril 20mg and Spironolactone 25mg for resistant hypertension and microalbuminuria. Routine follow-up lab shows serum potassium rose from 4.5 to 5.6 mEq/L with mild ECG peaked T waves.',
    keyBiomarkerChange: 'Potassium: 4.5 → 5.6 mEq/L (Critical Alert), eGFR: 48 → 44 mL/min, Serum Creatinine: 1.6 mg/dL',
    primaryRisk: 'Severe cardiotoxicity and lethal cardiac conduction block triggered by dual potassium-sparing RAAS inhibition in impaired renal clearance.',
    turns: [
      {
        id: 'sj-1',
        personaId: 'triage',
        timestamp: '2026-08-22 14:20:00',
        headline: 'Critical Hyperkalemia Red Flag',
        speechText: 'EMERGENCY RED FLAG: Serum Potassium is 5.6 mEq/L. Ambulatory ECG strip indicates tall peaked T waves in precordial leads. Urgent potassium-lowering intervention and medication hold required.',
        citedClusterIds: ['reports', 'risk', 'symptoms'],
        citedNodeIds: ['rep-1', 'risk-1', 'sym-1'],
        turnType: 'safety_check',
        uncertaintyScore: 3
      },
      {
        id: 'sj-2',
        personaId: 'medication',
        timestamp: '2026-08-22 14:20:25',
        headline: 'Dual Potassium-Sparing Pharmacological Collision',
        speechText: 'Lisinopril inhibits aldosterone secretion via ACE blockade while Spironolactone competitively blocks mineralocorticoid receptors in the distal tubule. In CKD Stage 3a (eGFR 44), tubular potassium excretion is severely blunted.',
        citedClusterIds: ['medication', 'reports', 'risk'],
        citedNodeIds: ['med-1', 'med-2', 'risk-1'],
        turnType: 'correlation',
        evidenceCitations: ['FDA Boxed Warning: Hyperkalemia with Potassium-Sparing Diuretics + ACEi'],
        uncertaintyScore: 5
      },
      {
        id: 'sj-3',
        personaId: 'nephrology',
        timestamp: '2026-08-22 14:20:50',
        headline: 'Renal Potassium Clearance & Alternative Antihypertensive',
        speechText: 'Hold Spironolactone immediately. Consider substituting a novel non-steroidal MRA (Finerenone) or adding a potassium binder (Sodium Zirconium Cyclosilicate) if MRA is mandatory for proteinuria control.',
        citedClusterIds: ['medication', 'recovery', 'reports'],
        citedNodeIds: ['med-2', 'rec-1', 'rep-1'],
        turnType: 'plan',
        evidenceCitations: ['KDIGO 2023 Clinical Practice Guideline for Diabetes Management in CKD'],
        uncertaintyScore: 8
      },
      {
        id: 'sj-4',
        personaId: 'evidence',
        timestamp: '2026-08-22 14:21:15',
        headline: 'Clinical Guideline Thresholds for Hyperkalemia',
        speechText: 'FIDELIO-DKD and FIGARO-DKD clinical trial evidence demonstrates non-steroidal MRAs have significantly lower hyperkalemia discontinuation rates while maintaining cardiorenal preservation.',
        citedClusterIds: ['reports', 'recovery'],
        citedNodeIds: ['rep-1', 'rec-2'],
        turnType: 'evidence_challenge',
        evidenceCitations: ['New England Journal of Medicine (NEJM): Cardiovascular & Kidney Outcomes with Finerenone'],
        uncertaintyScore: 7
      },
      {
        id: 'sj-5',
        personaId: 'planner',
        timestamp: '2026-08-22 14:21:45',
        headline: 'Immediate Hyperkalemia Management Protocol',
        speechText: 'CONSENSUS PROTOCOL: 1. Discontinue Spironolactone today. 2. Prescribe low-potassium dietary regimen. 3. Repeat stat serum potassium and 12-lead ECG in 24 hours. 4. Re-evaluate renal clinic visit in 5 days.',
        citedClusterIds: ['medication', 'recovery', 'reports'],
        citedNodeIds: ['med-2', 'rec-1', 'rep-1'],
        turnType: 'consensus',
        evidenceCitations: ['Endocrine Society Clinical Practice Guidelines on Hyperkalemia in Diabetes'],
        uncertaintyScore: 4
      }
    ],
    consensus: {
      agreedFindings: [
        {
          id: 'sj-c1',
          topic: 'Iatrogenic Hyperkalemia (5.6 mEq/L)',
          status: 'agreed',
          description: 'Dual RAAS blockade with ACEi and Spironolactone in CKD Stage 3a caused life-threatening hyperkalemia with peaked T-waves.',
          supportingPersonas: ['triage', 'medication', 'nephrology', 'evidence', 'planner'],
          clusterReferences: ['medication', 'reports', 'risk'],
          evidenceRef: 'KDIGO 2023 CKD & Diabetes Guidelines'
        },
        {
          id: 'sj-c2',
          topic: 'Immediate Spironolactone Cessation',
          status: 'agreed',
          description: 'Discontinue Spironolactone and monitor ECG until K+ normalizes < 5.0 mEq/L.',
          supportingPersonas: ['medication', 'triage', 'planner'],
          clusterReferences: ['medication', 'recovery']
        }
      ],
      disputedFindings: [],
      missingInformation: ['Serum Sodium & Chloride Panel', 'Urinary Albumin-to-Creatinine Ratio (UACR)'],
      overallConfidence: 96,
      evidenceStrength: 'Strong',
      safetyAlerts: [
        {
          level: 'critical',
          title: 'Cardiac Dysrhythmia Risk (K+ 5.6 mEq/L)',
          description: 'Peaked T-waves observed on telemetry with hyperkalemia. Immediate medication hold required.'
        }
      ],
      recommendedNextAction: 'Hold Spironolactone immediately, order low-potassium diet, stat K+ check within 24h.',
      requiresClinicianEscalation: true,
      escalationReason: 'Potassium 5.6 mEq/L with ECG conduction abnormality.'
    }
  }
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-2023-1',
    year: 2023,
    date: '2023-05-14',
    title: 'Routine Health Checkup & Blood Panel',
    category: 'lab',
    summary: 'Blood pressure 132/82. Serum Creatinine 1.05 mg/dL, eGFR 72 mL/min. Normal baseline.',
    impact: 'stable',
    relatedClusterIds: ['reports', 'history']
  },
  {
    id: 'evt-2024-1',
    year: 2024,
    date: '2024-03-20',
    title: 'Mild CKD Stage 2 Diagnosis',
    category: 'consultation',
    summary: 'eGFR noted at 68 mL/min. Lisinopril 20mg initiated for blood pressure & nephroprotection.',
    impact: 'new_finding',
    causalLinkToId: 'evt-2023-1',
    causalDescription: 'Subtle eGFR decline prompted early renal protective ACE inhibitor initiation.',
    relatedClusterIds: ['history', 'medication', 'reports']
  },
  {
    id: 'evt-2025-1',
    year: 2025,
    date: '2025-06-10',
    title: 'Annual Renal & Metabolic Follow-up',
    category: 'lab',
    summary: 'Creatinine 1.15 mg/dL, eGFR 64 mL/min. HbA1c 6.8%. Patient stable on Lisinopril & Metformin.',
    impact: 'stable',
    causalLinkToId: 'evt-2024-1',
    causalDescription: 'Medication regimen maintained kidney function stability for 14 months.',
    relatedClusterIds: ['reports', 'medication']
  },
  {
    id: 'evt-2026-1',
    year: 2026,
    date: '2026-07-28',
    title: 'OTC Ibuprofen Initiated for Knee Pain',
    category: 'medication',
    summary: 'Patient began taking OTC Ibuprofen 400mg 3x weekly without clinician consult.',
    impact: 'worsened',
    relatedClusterIds: ['medication', 'symptoms']
  },
  {
    id: 'evt-2026-2',
    year: 2026,
    date: '2026-08-10',
    title: 'Abnormal Lab Report & Symptom Onset',
    category: 'lab',
    summary: 'Creatinine rose to 1.45 mg/dL, eGFR dropped to 52. NT-proBNP 480. Leg edema onset.',
    impact: 'worsened',
    causalLinkToId: 'evt-2026-1',
    causalDescription: 'NSAID intake compromised renal perfusion, causing eGFR drop & fluid retention.',
    relatedClusterIds: ['reports', 'symptoms', 'risk']
  },
  {
    id: 'evt-2026-3',
    year: 2026,
    date: '2026-08-13',
    title: 'Clinical Case Conference AI Assessment',
    category: 'consultation',
    summary: 'Multi-Agent Case Conference flagged NSAID interaction and synthesized clinician escalation plan.',
    impact: 'improved',
    causalLinkToId: 'evt-2026-2',
    causalDescription: 'System identified root cause and generated clinician handoff summary.',
    relatedClusterIds: ['recovery', 'risk', 'medication']
  }
];

export const LAB_MARKERS: LabMarker[] = [
  {
    id: 'lm-egfr',
    name: 'eGFR (Glomerular Filtration Rate)',
    category: 'Renal Function',
    unit: 'mL/min/1.73m²',
    referenceRange: '> 60 mL/min',
    history: [
      { year: 2024, date: '2024-03-20', value: 68, status: 'normal' },
      { year: 2025, date: '2025-06-10', value: 64, status: 'normal' },
      { year: 2026, date: '2026-08-10', value: 52, status: 'critical' }
    ],
    trend: 'down',
    isAbnormal: true
  },
  {
    id: 'lm-creatinine',
    name: 'Serum Creatinine',
    category: 'Renal Function',
    unit: 'mg/dL',
    referenceRange: '0.60 - 1.10 mg/dL',
    history: [
      { year: 2024, date: '2024-03-20', value: 1.05, status: 'normal' },
      { year: 2025, date: '2025-06-10', value: 1.15, status: 'normal' },
      { year: 2026, date: '2026-08-10', value: 1.45, status: 'high' }
    ],
    trend: 'up',
    isAbnormal: true
  },
  {
    id: 'lm-bnp',
    name: 'NT-proBNP (Cardiac Biomarker)',
    category: 'Cardiovascular',
    unit: 'pg/mL',
    referenceRange: '< 125 pg/mL',
    history: [
      { year: 2024, date: '2024-03-20', value: 95, status: 'normal' },
      { year: 2025, date: '2025-06-10', value: 110, status: 'normal' },
      { year: 2026, date: '2026-08-10', value: 480, status: 'critical' }
    ],
    trend: 'up',
    isAbnormal: true
  },
  {
    id: 'lm-hba1c',
    name: 'Hemoglobin A1c',
    category: 'Endocrine / Diabetes',
    unit: '%',
    referenceRange: '< 5.7% (Normal), < 7.0% (Target)',
    history: [
      { year: 2024, date: '2024-03-20', value: 7.1, status: 'high' },
      { year: 2025, date: '2025-06-10', value: 6.8, status: 'normal' },
      { year: 2026, date: '2026-08-10', value: 6.7, status: 'normal' }
    ],
    trend: 'down',
    isAbnormal: false
  }
];

export const MEDICATIONS_LIST: MedicationItem[] = [
  {
    id: 'm-1',
    name: 'Lisinopril',
    dosage: '20 mg',
    frequency: 'Once Daily (Morning)',
    startDate: '2024-03-22',
    status: 'active',
    prescriber: 'Dr. Aris Thorne',
    purpose: 'Hypertension & Renal Protection in CKD Stage 2',
    potentialInteractions: ['OTC NSAIDs (Ibuprofen, Naproxen)', 'Potassium supplements'],
    knownAllergies: [],
    patientReportedEffects: 'Well tolerated, no cough'
  },
  {
    id: 'm-2',
    name: 'Metformin HCl',
    dosage: '500 mg',
    frequency: 'Twice Daily (With Meals)',
    startDate: '2022-11-05',
    status: 'active',
    prescriber: 'Dr. Sarah Jenkins',
    purpose: 'Type 2 Diabetes Mellitus glycemic control',
    potentialInteractions: ['IV Iodinated Contrast (Hold before CT)'],
    knownAllergies: [],
    patientReportedEffects: 'Occasional mild stomach tightness'
  },
  {
    id: 'm-3',
    name: 'Furosemide',
    dosage: '20 mg',
    frequency: 'Once Daily (Morning)',
    startDate: '2025-08-14',
    status: 'active',
    prescriber: 'Dr. Aris Thorne',
    purpose: 'Mild fluid retention & blood pressure control',
    potentialInteractions: ['NSAIDs (reduces diuretic response)', 'Digoxin'],
    knownAllergies: [],
    patientReportedEffects: 'Increased urination for 4 hours post dose'
  },
  {
    id: 'm-4',
    name: 'Ibuprofen (OTC Advil)',
    dosage: '400 mg',
    frequency: 'As needed (3x weekly)',
    startDate: '2026-07-28',
    status: 'otc',
    purpose: 'Right knee osteoarthritis joint discomfort',
    potentialInteractions: ['ACE Inhibitors (Lisinopril) - Renal Risk', 'Furosemide - Reduced Efficacy'],
    knownAllergies: [],
    patientReportedEffects: 'Helps knee pain but noticed ankle swelling afterward'
  }
];

export const RECOVERY_SYMPTOM_LOGS: SymptomLogEntry[] = [
  { id: 'log-1', date: '2026-08-09', dayNumber: 1, painLevel: 4, fatigueLevel: 7, temperature: 98.4, sleepHours: 6.0, notes: 'Felt tired climbing stairs. Took 400mg Ibuprofen for knee pain.', symptomsLogged: ['Fatigue', 'Dyspnea', 'Knee Pain'] },
  { id: 'log-2', date: '2026-08-10', dayNumber: 2, painLevel: 3, fatigueLevel: 6, temperature: 98.6, sleepHours: 6.5, notes: 'Had lab work done in morning. Ankles swollen by evening.', symptomsLogged: ['Leg Edema', 'Fatigue'] },
  { id: 'log-3', date: '2026-08-11', dayNumber: 3, painLevel: 4, fatigueLevel: 6, temperature: 98.3, sleepHours: 5.8, notes: 'Noticed breathlessness walking to mailbox.', symptomsLogged: ['Dyspnea', 'Leg Edema'] },
  { id: 'log-4', date: '2026-08-12', dayNumber: 4, painLevel: 2, fatigueLevel: 5, temperature: 98.5, sleepHours: 7.0, notes: 'Skipped Ibuprofen today. Leg swelling slightly less.', symptomsLogged: ['Fatigue', 'Leg Edema'] },
  { id: 'log-5', date: '2026-08-13', dayNumber: 5, painLevel: 2, fatigueLevel: 4, temperature: 98.4, sleepHours: 7.2, notes: 'Case Conference AI completed. Stopped Ibuprofen per guidance.', symptomsLogged: ['Mild Fatigue'] }
];

export const SYSTEM_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'aud-1', timestamp: '2026-08-13 19:45:01', action: 'Triage Risk Scan', actor: 'Triage AI', details: 'Scanned symptoms & vitals. No immediate emergency red flag detected.', safetyCheckPassed: true },
  { id: 'aud-2', timestamp: '2026-08-13 19:45:25', action: 'Pharmacovigilance Alert', actor: 'Medication AI', details: 'Identified Lisinopril + OTC Ibuprofen interaction risk in Stage 2 CKD patient.', safetyCheckPassed: true },
  { id: 'aud-3', timestamp: '2026-08-13 19:45:38', action: 'Evidence RAG Verification', actor: 'Evidence AI', details: 'Retrieved KDIGO 2024 & FDA Drug Safety guidelines. Confidence 86%.', safetyCheckPassed: true },
  { id: 'aud-4', timestamp: '2026-08-13 19:46:15', action: 'Consensus Synthesis & Escalation', actor: 'Final Planner', details: 'Synthesized consensus. Recommended clinician review within 48 hours.', safetyCheckPassed: true }
];

export const PATIENT_CONSENT_SETTINGS: PatientConsentSetting[] = [
  { id: 'cs-1', dataType: 'Uploaded Lab Reports & Scans', description: 'OCR extraction, entity normalization, & trend comparison', aiAnalysis: true, doctorAccess: true, caregiverAccess: true, longTermStorage: true },
  { id: 'cs-2', dataType: 'Symptom Diary & Wearable Metrics', description: 'Continuous step count, sleep ring data, & daily notes', aiAnalysis: true, doctorAccess: true, caregiverAccess: true, longTermStorage: true },
  { id: 'cs-3', dataType: 'Multi-Agent Case Conference Analysis', description: 'Simulated persona debate & consensus generation', aiAnalysis: true, doctorAccess: true, caregiverAccess: false, longTermStorage: true },
  { id: 'cs-4', dataType: 'Genomic / Family History Data', description: 'Maternal cardiovascular CAD risk markers', aiAnalysis: true, doctorAccess: true, caregiverAccess: false, longTermStorage: false }
];
