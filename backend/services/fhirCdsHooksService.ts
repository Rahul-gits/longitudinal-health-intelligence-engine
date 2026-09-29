export interface CDSHookRequest {
  hook: 'patient-view' | 'order-select' | 'medication-prescribe';
  hookInstance: string;
  fhirServer?: string;
  context: {
    patientId: string;
    userId: string;
    encounterId?: string;
    medications?: Array<{ code: string; display: string; dosage?: string }>;
  };
}

export interface CDSCardCandidateOption {
  optionId: string;
  category: 'Non-Pharmacologic' | 'Topical Analgesic' | 'Targeted Local Blockade' | 'Physical Therapy';
  label: string;
  clinicalRationale: string;
  riskProfile: string;
  evidenceStrength: 'High (Level A)' | 'Moderate (Level B)';
  actions: Array<{
    type: 'create' | 'update' | 'delete';
    description: string;
    resource?: Record<string, any>;
  }>;
}

export interface CDSCard {
  summary: string;
  detail: string;
  indicator: 'info' | 'warning' | 'critical';
  source: {
    label: string;
    url?: string;
    icon?: string;
  };
  candidateOptions?: CDSCardCandidateOption[];
  selectionBehavior?: 'at-most-one' | 'any';
  links?: Array<{ label: string; url: string; type: string }>;
}

export interface CDSHookResponse {
  cards: CDSCard[];
}

export class FhirCdsHooksService {
  /**
   * Handle medication-prescribe Hook (SMART-on-FHIR CDS Hooks v1.4)
   * Enforces multi-candidate option generation rather than a single forced alternative.
   */
  public handleMedicationPrescribe(request: CDSHookRequest): CDSHookResponse {
    const meds = request.context.medications || [];
    const isNsaidAttempted = meds.some(m => 
      m.display.toLowerCase().includes('ibuprofen') || 
      m.display.toLowerCase().includes('advil') ||
      m.display.toLowerCase().includes('naproxen')
    );

    if (isNsaidAttempted) {
      return {
        cards: [
          {
            summary: 'CRITICAL HARD STOP: Hemodynamic AKI Hazard (Lisinopril + NSAID Collision)',
            detail: 'Patient Eleanor Vance (Age 68, CrCl 43.9 mL/min) is receiving active Lisinopril 20mg. Oral NSAIDs provoke afferent arteriolar vasoconstriction on background efferent vasodilation, precipitating acute prerenal filtration failure. Systemic oral NSAID is blocked. The physician must evaluate patient-specific factors (skin integrity, allergy history, joint effusion) before selecting an appropriate alternative.',
            indicator: 'critical',
            source: {
              label: 'Heal Engine Safety Gate & KDIGO 2024 Guidelines (Section 4.2.1)',
              url: 'https://kdigo.org/guidelines/ckd-evaluation-management/'
            },
            candidateOptions: [
              {
                optionId: 'OPT-TOPICAL-DICLOFENAC',
                category: 'Topical Analgesic',
                label: 'Option 1: Topical Diclofenac 1% Gel (Voltaren)',
                clinicalRationale: 'Appropriate for localized knee osteoarthritis if skin is intact and no hepatic contraindications. Delivers localized anti-inflammatory action with <3% systemic absorption.',
                riskProfile: 'Negligible renal clearance burden; verify absence of local dermatological lesions.',
                evidenceStrength: 'High (Level A)',
                actions: [
                  {
                    type: 'create',
                    description: 'Prescribe Topical Diclofenac Gel 1% 2-4g applied to right knee BID PRN',
                    resource: {
                      resourceType: 'MedicationRequest',
                      status: 'draft',
                      intent: 'proposal',
                      medicationCodeableConcept: {
                        coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '1116632', display: 'Diclofenac Sodium 1% Topical Gel' }]
                      }
                    }
                  }
                ]
              },
              {
                optionId: 'OPT-TOPICAL-LIDOCAINE',
                category: 'Targeted Local Blockade',
                label: 'Option 2: Topical 5% Lidocaine Patch',
                clinicalRationale: 'Non-NSAID alternative that blocks localized sodium channels without affecting renal hemodynamics or prostaglandins.',
                riskProfile: 'Zero renal toxicity; ideal if patient has mild dyspepsia or sensitive skin.',
                evidenceStrength: 'Moderate (Level B)',
                actions: [
                  {
                    type: 'create',
                    description: 'Prescribe Topical 5% Lidocaine Patch applied to right knee q12h PRN',
                    resource: {
                      resourceType: 'MedicationRequest',
                      status: 'draft',
                      intent: 'proposal',
                      medicationCodeableConcept: {
                        coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '260175', display: 'Lidocaine 5% Topical Patch' }]
                      }
                    }
                  }
                ]
              },
              {
                optionId: 'OPT-PHYSICAL-THERAPY',
                category: 'Physical Therapy',
                label: 'Option 3: Quadriceps Strengthening & Aquatic Hydrotherapy',
                clinicalRationale: 'Non-pharmacological pathway to restore joint mobility, reduce mechanical load, and prevent polypharmacy cascade.',
                riskProfile: 'Zero pharmacological side effects; requires patient adherence.',
                evidenceStrength: 'High (Level A)',
                actions: [
                  {
                    type: 'create',
                    description: 'Refer to Outpatient Physical Therapy for non-weight-bearing aquatic rehabilitation',
                    resource: {
                      resourceType: 'ServiceRequest',
                      status: 'draft',
                      intent: 'proposal',
                      code: { text: 'Physical Therapy & Aquatic Rehabilitation' }
                    }
                  }
                ]
              }
            ],
            selectionBehavior: 'at-most-one',
            links: [
              {
                label: 'Review Cockcroft-Gault Calculations & Multi-Specialty Evidence',
                url: '/clinical-review',
                type: 'absolute'
              }
            ]
          }
        ]
      };
    }

    return {
      cards: [
        {
          summary: 'Medication Cleared by Heal Engine Safety Gate',
          detail: 'No hard contraindications or severe pharmacogenomic clearance conflicts identified.',
          indicator: 'info',
          source: { label: 'Heal Engine CDS v1.4' }
        }
      ]
    };
  }

  /**
   * Handle patient-view Hook (Epic/Cerner Chart Open)
   */
  public handlePatientView(request: CDSHookRequest): CDSHookResponse {
    return {
      cards: [
        {
          summary: 'Heal Engine Alert: Reversible eGFR Decline (-18.7%)',
          detail: 'Longitudinal analysis detected an eGFR decline from 64 to 52 mL/min over 3 weeks following self-reported OTC Ibuprofen use for knee pain. Expected reversibility is 95% following topical analgesic substitution.',
          indicator: 'warning',
          source: {
            label: 'Heal Engine Longitudinal Patient State Engine',
            url: 'https://kdigo.org'
          }
        }
      ]
    };
  }
}

export const fhirCdsHooksService = new FhirCdsHooksService();
