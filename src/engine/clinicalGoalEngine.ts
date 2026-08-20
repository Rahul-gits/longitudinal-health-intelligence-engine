import { ClinicalGoal } from '../types/health';

export class ClinicalGoalEngine {
  private goals: ClinicalGoal[] = [
    {
      id: 'goal-renal',
      domain: 'Renal Function',
      objective: 'Halt eGFR decline & maintain glomerular filtration rate > 60 mL/min',
      targetValue: 'eGFR > 60 mL/min, Creatinine < 1.2 mg/dL',
      priority: 'high',
      status: 'conflict'
    },
    {
      id: 'goal-pain',
      domain: 'Pain Management',
      objective: 'Provide effective analgesia for knee arthritis without systemic organ toxicity',
      targetValue: 'Pain Scale < 3/10, Step count > 6000 steps/day',
      priority: 'high',
      status: 'conflict'
    },
    {
      id: 'goal-meds',
      domain: 'Pharmacovigilance',
      objective: 'Eliminate nephrotoxic co-prescriptions & optimize renal clearance dosing',
      targetValue: 'Zero active NSAID + ACEi co-administration',
      priority: 'high',
      status: 'active'
    },
    {
      id: 'goal-cardio',
      domain: 'Cardiovascular',
      objective: 'Control blood pressure and reduce ventricular stretch / fluid overload',
      targetValue: 'BP < 130/80 mmHg, NT-proBNP < 300 pg/mL',
      priority: 'medium',
      status: 'active'
    }
  ];

  public getGoals(): ClinicalGoal[] {
    return this.goals;
  }
}

export const clinicalGoalEngine = new ClinicalGoalEngine();
