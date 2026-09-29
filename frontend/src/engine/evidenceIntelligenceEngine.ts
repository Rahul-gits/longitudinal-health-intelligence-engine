import { EvidenceChain } from '../types/health';

export interface ValidatedEvidenceItem {
  id: string;
  sourceTitle: string;
  publication: string;
  year: number;
  evidenceGrade: 'Grade A (Strong RCT/Meta-analysis)' | 'Grade B (Cohort Study)' | 'Grade C (Consensus)';
  relevanceScore: number; // 0..100%
  summary: string;
  applicableToPatientReason: string;
}

export class EvidenceIntelligenceEngine {
  private evidenceDatabase: ValidatedEvidenceItem[] = [
    {
      id: 'ev-kdigo-2024',
      sourceTitle: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease',
      publication: 'Kidney International (Official Journal of ISN)',
      year: 2024,
      evidenceGrade: 'Grade A (Strong RCT/Meta-analysis)',
      relevanceScore: 98,
      summary: 'Recommends avoiding systemic non-steroidal anti-inflammatory drugs (NSAIDs) in patients with eGFR < 60 mL/min/1.73m², particularly when combined with ACE inhibitors or ARBs.',
      applicableToPatientReason: 'Eleanor Vance has Stage 2 CKD with a documented eGFR drop to 52 mL/min and active Lisinopril therapy.'
    },
    {
      id: 'ev-fda-nsaid-blackbox',
      sourceTitle: 'FDA Drug Safety Communication: Avoidance of NSAIDs in Patients with Renal Impairment',
      publication: 'US Food & Drug Administration (FDA)',
      year: 2023,
      evidenceGrade: 'Grade A (Strong RCT/Meta-analysis)',
      relevanceScore: 96,
      summary: 'Warns that NSAID-induced inhibition of renal prostaglandins can precipitate acute decompensated renal failure in patients with underlying CKD or renin-angiotensin system blockade.',
      applicableToPatientReason: 'Patient logged taking self-prescribed OTC Ibuprofen 400mg 3x weekly.'
    },
    {
      id: 'ev-oarsi-topical-lidocaine',
      sourceTitle: 'OARSI Guidelines for the Non-Surgical Management of Knee Osteoarthritis',
      publication: 'Osteoarthritis and Cartilage Journal',
      year: 2024,
      evidenceGrade: 'Grade B (Cohort Study)',
      relevanceScore: 92,
      summary: 'Topical NSAIDs and 5% Lidocaine patches provide targeted analgesia for knee OA with negligible systemic absorption (< 3%) and zero measurable renal clearance impact.',
      applicableToPatientReason: 'Provides an effective non-toxic analgesia substitute preserving Eleanor’s joint mobility.'
    }
  ];

  public getEvidenceForRecommendation(recommendation: string): EvidenceChain {
    const isNsaidStop = recommendation.toLowerCase().includes('discontinue') || recommendation.toLowerCase().includes('ibuprofen');

    return {
      patientReason: 'eGFR dropped 18.7% (64 -> 52 mL/min) following self-prescribed OTC Ibuprofen intake alongside Lisinopril 20mg.',
      patientEvidence: 'Quest Diagnostics Renal Panel (2026-08-10): eGFR 52 mL/min, Serum Creatinine 1.45 mg/dL.',
      guidelineCitation: 'KDIGO 2024 CKD Guidelines & FDA Blackbox Safety Warning on NSAIDs in CKD Stage 2+',
      evidenceStrength: 'High',
      safetyStatus: isNsaidStop ? 'SAFE' : 'BLOCKED',
      uncertaintyLevel: 'LOW',
      missingDataAlerts: [
        'Baseline 2D Echocardiogram within last 12 months missing (needed to rule out cardiac origin of NT-proBNP elevation).'
      ]
    };
  }

  public getEvidenceDatabase(): ValidatedEvidenceItem[] {
    return this.evidenceDatabase;
  }
}

export const evidenceIntelligenceEngine = new EvidenceIntelligenceEngine();
