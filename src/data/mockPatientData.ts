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
  PatientConsentSetting 
} from '../types/health';

export const PATIENT_INFO = {
  id: 'PT-884920',
  name: 'Eleanor Vance',
  age: 64,
  gender: 'Female',
  bloodType: 'A+',
  primaryPhysician: 'Dr. Aris Thorne, MD (Cardiology)',
  status: 'Needs Clinician Review',
  statusColor: 'amber',
  overallHealthScore: 74,
  lastUpdated: '2026-08-13 19:45 IST'
};

export const PERSONA_PROFILES: Record<string, PersonaProfile> = {
  triage: {
    id: 'triage',
    name: 'Triage AI',
    roleTitle: 'Acute Urgency & Safety Protocol',
    avatarIcon: 'ShieldAlert',
    color: '#F43F5E', // Rose
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    keyQuestion: 'What is the immediate risk?'
  },
  clinical: {
    id: 'clinical',
    name: 'Clinical AI',
    roleTitle: 'Diagnostic Reasoning & Correlation',
    avatarIcon: 'Stethoscope',
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    keyQuestion: 'How do current symptoms correlate with history?'
  },
  medication: {
    id: 'medication',
    name: 'Medication AI',
    roleTitle: 'Pharmacovigilance & Reconciliation',
    avatarIcon: 'Pill',
    color: '#8B5CF6', // Purple
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    keyQuestion: 'Are there interaction or prescription risks?'
  },
  evidence: {
    id: 'evidence',
    name: 'Evidence AI',
    roleTitle: 'Clinical Guidelines & RAG Verification',
    avatarIcon: 'BookOpen',
    color: '#06B6D4', // Cyan
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    keyQuestion: 'What does authoritative evidence support?'
  },
  recovery: {
    id: 'recovery',
    name: 'Recovery AI',
    roleTitle: 'Care Pathway & Longitudinal Monitoring',
    avatarIcon: 'Activity',
    color: '#10B981', // Emerald
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    keyQuestion: 'What can be safely monitored vs. escalated?'
  },
  conflict: {
    id: 'conflict',
    name: 'Conflict Checker',
    roleTitle: 'Disagreement Resolution Engine',
    avatarIcon: 'Scale',
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    keyQuestion: 'Where do personas disagree?'
  },
  planner: {
    id: 'planner',
    name: 'Final Planner',
    roleTitle: 'Synthesized Consensus Engine',
    avatarIcon: 'CheckCircle2',
    color: '#10B981',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    keyQuestion: 'What is the validated action plan?'
  },
  genomic: {
    id: 'genomic',
    name: 'Genomics AI',
    roleTitle: 'Pharmacogenomics & Variant Analysis',
    avatarIcon: 'Dna',
    color: '#EC4899', // Pink
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    keyQuestion: 'Do genetic variants affect drug clearance or disease etiology?'
  },
  lifestyle: {
    id: 'lifestyle',
    name: 'Biometrics AI',
    roleTitle: 'Wearables, Circadian & Sleep Telemetry',
    avatarIcon: 'HeartPulse',
    color: '#14B8A6', // Teal
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    keyQuestion: 'What are wearable sensors and daily trends revealing?'
  },
  nephrology: {
    id: 'nephrology',
    name: 'Nephrology AI',
    roleTitle: 'Renal Function & Fluid Homeostasis',
    avatarIcon: 'Activity',
    color: '#3B82F6', // Royal Blue
    badgeBg: 'bg-blue-600/10 text-blue-400 border-blue-600/30',
    keyQuestion: 'Is renal filtration rate (eGFR) driving fluid overload?'
  },
  immunology: {
    id: 'immunology',
    name: 'Immunology AI',
    roleTitle: 'Inflammatory Cascade & Biomarkers',
    avatarIcon: 'Flame',
    color: '#FF6B35', // Warm Orange
    badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    keyQuestion: 'Are systemic inflammatory markers (hs-CRP/IL-6) elevated?'
  },
  ethics: {
    id: 'ethics',
    name: 'Bioethics AI',
    roleTitle: 'Shared Decision & Quality of Life',
    avatarIcon: 'Scale',
    color: '#A855F7', // Violet
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    keyQuestion: 'Does the clinical plan honor patient autonomy & preferences?'
  },
  swarm_orchestrator: {
    id: 'swarm_orchestrator',
    name: 'Swarm Coordinator',
    roleTitle: 'Particle Swarm & Collective Intelligence',
    avatarIcon: 'Cpu',
    color: '#FFE600', // Bright Yellow
    badgeBg: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    keyQuestion: 'Has particle consensus converged across all agent sub-clusters?'
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
  { id: 'sym-1', clusterId: 'symptoms', label: 'Exertional Dyspnea', type: 'Symptom', x: 120, y: 100, status: 'abnormal', value: 'Grade II', details: 'Breathlessness climbing stairs' },
  { id: 'sym-2', clusterId: 'symptoms', label: 'Leg Edema', type: 'Symptom', x: 140, y: 220, status: 'abnormal', value: '2+ Pitting', details: 'Bilateral ankle edema' },
  { id: 'hist-2', clusterId: 'history', label: 'Stage 2 CKD', type: 'Condition', x: 300, y: 80, status: 'warning', value: 'Baseline eGFR ~68', details: 'Chronic Kidney Disease history' },
  { id: 'hist-1', clusterId: 'history', label: 'Hypertension', type: 'Condition', x: 320, y: 240, status: 'normal', value: '138/86', details: 'Essential hypertension' },
  { id: 'rep-2', clusterId: 'reports', label: 'eGFR Drop (52)', type: 'LabResult', x: 500, y: 90, status: 'critical', value: '52 mL/min', details: 'Down from 64 mL/min in 2025' },
  { id: 'rep-3', clusterId: 'reports', label: 'NT-proBNP (480)', type: 'LabResult', x: 520, y: 210, status: 'abnormal', value: '480 pg/mL', details: 'Ventricular stretch biomarker' },
  { id: 'med-1', clusterId: 'medication', label: 'Lisinopril 20mg', type: 'Medication', x: 700, y: 120, status: 'normal', value: 'Daily', details: 'ACE Inhibitor therapy' },
  { id: 'med-3', clusterId: 'medication', label: 'OTC Ibuprofen', type: 'Medication', x: 720, y: 260, status: 'critical', value: '400mg PRN', details: 'NSAID intake 3x weekly' },
  { id: 'risk-1', clusterId: 'risk', label: 'NSAID-ACEi Toxicity', type: 'RiskFactor', x: 420, y: 340, status: 'critical', value: 'High Concern', details: 'Renal hemodynamics impairment' },
  { id: 'rec-3', clusterId: 'recovery', label: 'Clinician Escalation', type: 'ActionItem', x: 260, y: 360, status: 'abnormal', value: 'Pending', details: 'Requires nephrology/cardiology consult' }
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
