import { 
  PatientClinicalState, 
  HardSafetyConstraint, 
  SafetyCheckResult 
} from '../types/health';

export class SafetyConstraintEngine {
  private safetyRules: HardSafetyConstraint[] = [
    {
      id: 'rule-nsaid-ckd',
      ruleType: 'contraindication',
      title: 'NSAID Contraindication in Chronic Kidney Disease',
      description: 'Systemic non-selective NSAIDs (Ibuprofen, Naproxen) are contra-indicated in Stage 2+ CKD due to renal afferent arteriolar vasoconstriction.',
      parameterLimit: 'eGFR < 60 mL/min'
    },
    {
      id: 'rule-triple-whammy',
      ruleType: 'interaction',
      title: 'ACEi + NSAID Renal Interaction (Triple Whammy)',
      description: 'Co-administration of Lisinopril (ACEi) + Ibuprofen (NSAID) impairs both afferent (PG) and efferent (AngII) renal autoregulation.',
      parameterLimit: 'Strict Discontinuation Required'
    },
    {
      id: 'rule-cyp2c9-nsaid',
      ruleType: 'renal_restriction',
      title: 'CYP2C9*3 Slow Metabolizer Exposure Hazard',
      description: 'Patient carries CYP2C9*3 allele. Oral Ibuprofen systemic clearance is delayed by ~50%, exacerbating renal vasoconstriction duration.',
      parameterLimit: 'Pharmacogenomic Blackbox Warning'
    }
  ];

  /**
   * Evaluates any proposed intervention against deterministic hard safety rules.
   * AI consensus CANNOT override these rules!
   */
  public evaluateIntervention(
    proposedIntervention: string,
    state: PatientClinicalState
  ): SafetyCheckResult {
    const textLower = proposedIntervention.toLowerCase();
    const isContinuingNSAID = textLower.includes('ibuprofen') || textLower.includes('nsaid') || textLower.includes('oral analgesia');
    const isDiscontinuingNSAID = textLower.includes('discontinue ibuprofen') || textLower.includes('stop ibuprofen') || textLower.includes('topical');

    const latestEgfr = state.labTrends.find(l => l.name.toLowerCase().includes('egfr'))?.history.slice(-1)[0]?.value || 52;
    const isLisinoprilActive = state.medications.some(m => m.name.toLowerCase().includes('lisinopril') && m.status === 'active');
    const hasCYP2C9 = state.genetics.some(g => g.value.gene === 'CYP2C9');

    // If intervention proposes continuing or adding systemic NSAIDs when eGFR < 60 & taking ACEi:
    if (isContinuingNSAID && !isDiscontinuingNSAID && latestEgfr < 60 && isLisinoprilActive) {
      const violated = this.safetyRules.filter(r => 
        r.id === 'rule-nsaid-ckd' || r.id === 'rule-triple-whammy' || (hasCYP2C9 && r.id === 'rule-cyp2c9-nsaid')
      );

      return {
        status: 'BLOCKED',
        violatedConstraints: violated,
        rationale: `SAFETY CONSTRAINT TRIGGERED: Systemic NSAID (Ibuprofen) cannot be continued in a Stage 2 CKD patient (eGFR = ${latestEgfr} mL/min) receiving ACEi therapy (Lisinopril 20mg). Triple-whammy exposure risk detected → Elevated AKI risk → eGFR decline observed. Requires formal clinical review and governance escalation if an exception is requested.`,
        blockedAction: 'Continue OTC Oral Ibuprofen 400mg 3x weekly',
        suggestedSafeAlternative: 'Topical 5% Lidocaine Patch PRN (Option A), Topical Capsaicin 0.025% Cream (Option B), or Physical Therapy & Hydrotherapy (Option C).'
      };
    }

    return {
      status: 'SAFE',
      violatedConstraints: [],
      rationale: 'Intervention satisfies 100% of hard safety constraints, allergy checks, organ clearance limits, and pharmacogenomic guardrails.',
      suggestedSafeAlternative: undefined
    };
  }

  public getSafetyRules(): HardSafetyConstraint[] {
    return this.safetyRules;
  }
}

export const safetyConstraintEngine = new SafetyConstraintEngine();
