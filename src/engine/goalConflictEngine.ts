import { GoalTradeoff } from '../types/health';

export class GoalConflictEngine {
  private conflicts: GoalTradeoff[] = [
    {
      goalA: 'Pain Management Goal (Knee Osteoarthritis Analgesia)',
      goalB: 'Renal Function Goal (Preserve Glomerular eGFR > 60 mL/min)',
      conflictDescription: 'Patient uses oral NSAIDs (Ibuprofen) for knee pain relief. Systemic NSAIDs inhibit COX-2 in renal tissue, inducing afferent arteriolar constriction and dropping eGFR from 64 to 52 mL/min.',
      tensionLevel: 88,
      resolutionOption: 'Discontinue oral NSAIDs; initiate Topical 5% Lidocaine / Capsaicin patch for localized knee relief without systemic renal clearance burden.'
    },
    {
      goalA: 'Pharmacovigilance Goal (Deprescribe High-Risk Meds)',
      goalB: 'Patient Quality of Life & Adherence Goal (Maintain Mobility & Daily Steps)',
      conflictDescription: 'Abruptly stopping analgesia without a non-toxic substitute leads to patient distress, joint stiffness, and a 40% drop in daily physical steps.',
      tensionLevel: 62,
      resolutionOption: 'Pair NSAID cessation with physical therapy consultation, topical analgesia, and structured 14-day mobility tracking.'
    },
    {
      goalA: 'Cardiology Fluid Overload Goal (Control NT-proBNP & Edema)',
      goalB: 'Diagnostic Certainty Goal (Differentiate CHF vs eGFR Fluid Retention)',
      conflictDescription: 'Elevated NT-proBNP (480 pg/mL) + leg edema could represent early CHF decompensation or fluid retention secondary to eGFR drop.',
      tensionLevel: 45,
      resolutionOption: 'Order baseline 2D Echocardiogram to evaluate left ventricular ejection fraction while monitoring fluid status.'
    }
  ];

  public getGoalConflicts(): GoalTradeoff[] {
    return this.conflicts;
  }
}

export const goalConflictEngine = new GoalConflictEngine();
