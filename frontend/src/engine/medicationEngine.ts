import { MEDICATIONS_LIST } from '../data/mockPatientData';
import { MedicationItem } from '../types/health';

export interface InteractionAlert {
  id: string;
  severity: 'high' | 'moderate' | 'low';
  drug1: string;
  drug2: string;
  mechanism: string;
  recommendation: string;
}

export class MedicationEngine {
  public static getMedications(): MedicationItem[] {
    return MEDICATIONS_LIST;
  }

  public static detectInteractions(): InteractionAlert[] {
    return [
      {
        id: 'ia-1',
        severity: 'high',
        drug1: 'Lisinopril 20mg (ACE Inhibitor)',
        drug2: 'OTC Ibuprofen 400mg (NSAID)',
        mechanism: 'Concomitant use of NSAIDs with ACE inhibitors impairs afferent arteriolar vasodilation and efferent arteriolar constriction, significantly lowering glomerular filtration pressure and inducing acute renal dysfunction in CKD Stage 2 patients.',
        recommendation: 'Discontinue OTC Ibuprofen immediately. Use non-nephrotoxic analgesia (e.g., topical Capsaicin/Voltaren gel or Acetaminophen under medical guidance).'
      },
      {
        id: 'ia-2',
        severity: 'moderate',
        drug1: 'Furosemide 20mg (Loop Diuretic)',
        drug2: 'OTC Ibuprofen 400mg (NSAID)',
        mechanism: 'NSAIDs inhibit renal prostaglandin synthesis, blunting the natriuretic and diuretic efficacy of Furosemide.',
        recommendation: 'Avoid NSAIDs to maintain diuretic response and fluid overload control.'
      }
    ];
  }

  public static reconcileMedicationList(newMedName: string, dosage: string, category: 'prescription' | 'otc' | 'supplement'): {
    reconciled: boolean;
    warnings: string[];
    suggestedAction: string;
  } {
    const warnings: string[] = [];
    
    if (/ibuprofen|naproxen|aleve|advil|aspirin/i.test(newMedName)) {
      warnings.push('CRITICAL: NSAID class medication flagged. Interacts dangerously with active Lisinopril prescription and underlying CKD Stage 2.');
    }
    if (/potassium/i.test(newMedName)) {
      warnings.push('WARNING: Potential hyperkalemia risk when combined with Lisinopril.');
    }

    return {
      reconciled: warnings.length === 0,
      warnings,
      suggestedAction: warnings.length > 0 
        ? 'Do not start this medication without explicit approval from Dr. Aris Thorne.'
        : 'Medication reconciled cleanly with active profile.'
    };
  }
}
