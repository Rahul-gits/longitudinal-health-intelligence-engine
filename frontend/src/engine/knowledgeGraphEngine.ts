import { KnowledgeGraphData, KGNode, KGEdge } from '../types/health';

export class KnowledgeGraphEngine {
  private graphData: KnowledgeGraphData = {
    nodes: [
      { id: 'cond_ckd2', type: 'condition', label: 'Stage 2 CKD', details: 'eGFR 52 mL/min (18.7% decline over 3w)', status: 'critical' },
      { id: 'cond_htn', type: 'condition', label: 'Essential Hypertension', details: 'Systolic BP 142 mmHg', status: 'warning' },
      { id: 'cond_hf', type: 'condition', label: 'Heart Failure Biomarkers', details: 'NT-proBNP 480 pg/mL + 2+ Leg Edema', status: 'critical' },
      { id: 'cond_oa', type: 'condition', label: 'Knee Osteoarthritis', details: 'Severe joint pain (WOMAC 7.8/10)', status: 'abnormal' },

      { id: 'med_lisinopril', type: 'medication', label: 'Lisinopril 20mg', details: 'ACE Inhibitor (Efferent Vasodilation)', status: 'normal' },
      { id: 'med_ibuprofen', type: 'medication', label: 'OTC Oral Ibuprofen 400mg', details: 'Systemic NSAID (Afferent Arteriolar Constriction)', status: 'critical' },
      { id: 'med_hctz', type: 'medication', label: 'Hydrochlorothiazide 12.5mg', details: 'Thiazide Diuretic (Volume Depletion Risk)', status: 'warning' },

      { id: 'risk_triple_whammy', type: 'risk', label: 'Triple-Whammy Exposure Risk', details: 'ACEi + Diuretic + OTC NSAID → Prerenal Hemodynamic Strain', status: 'critical' },
      { id: 'risk_aki', type: 'risk', label: 'Elevated AKI Decompensation Risk', details: 'eGFR trajectory approaching Stage 3a threshold (<45 mL/min)', status: 'critical' },

      { id: 'goal_pain', type: 'goal', label: 'Goal: Knee Pain Relief', details: 'Target WOMAC < 3.0/10 for daily ambulatory mobility', status: 'warning' },
      { id: 'goal_renal', type: 'goal', label: 'Goal: Renal Preservation', details: 'Target eGFR stability > 60 mL/min & zero nephrotoxins', status: 'critical' },
      { id: 'goal_cardio', type: 'goal', label: 'Goal: Fluid & BP Control', details: 'Target Systolic BP < 130 mmHg & NT-proBNP < 300 pg/mL', status: 'warning' }
    ],
    edges: [
      { id: 'e1', source: 'med_ibuprofen', target: 'risk_triple_whammy', relation: 'increases_risk_of', weight: 0.95 },
      { id: 'e2', source: 'med_lisinopril', target: 'risk_triple_whammy', relation: 'interacts_with', weight: 0.88 },
      { id: 'e3', source: 'med_hctz', target: 'risk_triple_whammy', relation: 'interacts_with', weight: 0.85 },
      { id: 'e4', source: 'risk_triple_whammy', target: 'risk_aki', relation: 'increases_risk_of', weight: 0.92 },
      { id: 'e5', source: 'med_ibuprofen', target: 'cond_ckd2', relation: 'contraindicates', weight: 0.98 },

      { id: 'e6', source: 'goal_pain', target: 'goal_renal', relation: 'competes_with', weight: 0.90 },
      { id: 'e7', source: 'goal_cardio', target: 'goal_renal', relation: 'supported_by', weight: 0.75 }
    ]
  };

  public getKnowledgeGraph(): KnowledgeGraphData {
    return this.graphData;
  }

  public getRiskNeighbors(nodeId: string): { node: KGNode; relation: string }[] {
    const neighbors: { node: KGNode; relation: string }[] = [];
    this.graphData.edges.forEach(edge => {
      if (edge.source === nodeId) {
        const targetNode = this.graphData.nodes.find(n => n.id === edge.target);
        if (targetNode) neighbors.push({ node: targetNode, relation: edge.relation });
      } else if (edge.target === nodeId) {
        const sourceNode = this.graphData.nodes.find(n => n.id === edge.source);
        if (sourceNode) neighbors.push({ node: sourceNode, relation: edge.relation });
      }
    });
    return neighbors;
  }
}

export const knowledgeGraphEngine = new KnowledgeGraphEngine();
