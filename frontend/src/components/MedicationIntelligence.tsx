import React, { useState } from 'react';
import { MedicationEngine, InteractionAlert } from '../engine/medicationEngine';
import { MEDICATIONS_LIST } from '../data/mockPatientData';
import { MedicationItem } from '../types/health';
import { 
  Pill, 
  ShieldAlert, 
  Plus, 
  AlertTriangle
} from 'lucide-react';

export const MedicationIntelligence: React.FC = () => {
  const [medList] = useState<MedicationItem[]>(MEDICATIONS_LIST);
  const [interactions] = useState<InteractionAlert[]>(MedicationEngine.detectInteractions());
  const [showReconcileModal, setShowReconcileModal] = useState<boolean>(false);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMedName.trim()) {
      const result = MedicationEngine.reconcileMedicationList(newMedName, newMedDosage, 'otc');
      setReconcileResult(result);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 bg-[#8338EC] text-white border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display tracking-tight flex items-center gap-2 uppercase">
            <Pill className="w-6 h-6 stroke-[2.5]" /> MEDICATION SAFETY & PHARMACOVIGILANCE
          </h2>
          <p className="text-xs font-mono font-bold text-white/90 mt-1">
            Active prescription tracking, automated drug-drug interaction matrix, and OTC medication reconciliation.
          </p>
        </div>

        <button
          onClick={() => setShowReconcileModal(true)}
          className="px-5 py-2.5 bg-[#FFE600] hover:bg-[#CCFF00] text-black font-black font-display text-xs flex items-center space-x-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer uppercase"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>RECONCILE OTC / SUPPLEMENT</span>
        </button>
      </div>

      {/* High-Risk Interaction Alert Banner */}
      {interactions.length > 0 && (
        <div className="p-5 bg-[#FF70A6] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
          <div className="flex items-center space-x-2 text-black text-xs font-black uppercase tracking-wider font-display">
            <ShieldAlert className="w-5 h-5 text-black stroke-[2.5] animate-bounce" />
            <span>High-Severity Pharmacovigilance Alert ({interactions.length})</span>
          </div>

          <div className="space-y-2.5">
            {interactions.map(alert => (
              <div key={alert.id} className="p-4 bg-[#FFFFFF] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black font-display text-black text-sm">
                    {alert.drug1} ↔ {alert.drug2}
                  </span>
                  <span className="px-2 py-0.5 font-mono font-black text-[10px] bg-black text-[#FFE600] uppercase border border-black">
                    SEVERITY: {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-black/90 font-semibold text-[11px] leading-relaxed">{alert.mechanism}</p>
                <div className="pt-1 text-[11px] font-black text-black flex items-center gap-1 bg-[#FFE600] p-1.5 border border-black">
                  <AlertTriangle className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Recommendation: {alert.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {medList.map(med => (
          <div
            key={med.id}
            className={`p-5 border-3 border-black shadow-[5px_5px_0px_0px_#000] transition-all ${
              med.status === 'otc' && med.name.includes('Ibuprofen')
                ? 'bg-[#FF70A6]'
                : 'bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-black font-display text-black text-sm flex items-center gap-2">
                  {med.name}
                  <span className="text-xs font-mono text-black/70 font-bold">({med.dosage})</span>
                </h3>
                <span className="text-[11px] font-mono font-bold text-black/80">{med.frequency}</span>
              </div>
              <span className={`px-3 py-1 font-mono font-black text-[10px] uppercase border border-black shadow-[1px_1px_0px_0px_#000] ${
                med.status === 'active' ? 'bg-[#CCFF00] text-black' : 'bg-black text-[#FFE600]'
              }`}>
                {med.status}
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs space-y-1 mt-3">
              <span className="text-[9px] font-black text-black/70 block uppercase font-mono">INDICATION / PURPOSE</span>
              <p className="text-black font-semibold text-[11px]">{med.purpose}</p>
            </div>

            {med.potentialInteractions.length > 0 && (
              <div className="mt-3 p-2 bg-[#FF6B35] text-white border border-black shadow-[1px_1px_0px_0px_#000] text-[11px] font-black flex items-center space-x-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Interactions: {med.potentialInteractions.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reconciliation Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] border-4 border-black shadow-[10px_10px_0px_0px_#000] p-6 space-y-4">
            <h3 className="text-base font-black font-display text-black uppercase bg-[#FFE600] p-2 border-2 border-black">OTC / Supplement Reconciliation</h3>
            <form onSubmit={handleReconcileSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-black font-black font-display block mb-1">Medication or Supplement Name</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Ibuprofen, Potassium, St. John's Wort..."
                  className="w-full bg-[#FAF8F5] border-2 border-black p-2.5 text-black font-bold focus:outline-none focus:bg-[#FFE600]/20 shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="text-black font-black font-display block mb-1">Dosage / Frequency</label>
                <input
                  type="text"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="e.g. 400mg 2x daily"
                  className="w-full bg-[#FAF8F5] border-2 border-black p-2.5 text-black font-bold focus:outline-none focus:bg-[#FFE600]/20 shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#CCFF00] hover:bg-[#A3E635] text-black border-2 border-black font-black font-display text-xs shadow-[3px_3px_0px_0px_#000] uppercase cursor-pointer"
              >
                Run Interaction Check
              </button>
            </form>

            {reconcileResult && (
              <div className="p-3 bg-[#FF70A6] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2 text-xs">
                {reconcileResult.warnings.map((w: string, idx: number) => (
                  <p key={idx} className="text-black font-black">{w}</p>
                ))}
                <p className="text-black font-bold">{reconcileResult.suggestedAction}</p>
              </div>
            )}

            <button
              onClick={() => { setShowReconcileModal(false); setReconcileResult(null); }}
              className="w-full py-2 bg-[#FAF8F5] text-black border-2 border-black text-xs font-black font-display uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              Close Wizard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
