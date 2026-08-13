import React, { useState } from 'react';
import { MedicationEngine, InteractionAlert } from '../engine/medicationEngine';
import { MEDICATIONS_LIST } from '../data/mockPatientData';
import { MedicationItem } from '../types/health';
import { 
  Pill, 
  ShieldAlert, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Info,
  Sparkles
} from 'lucide-react';

export const MedicationIntelligence: React.FC = () => {
  const [medList, setMedList] = useState<MedicationItem[]>(MEDICATIONS_LIST);
  const [interactions, setInteractions] = useState<InteractionAlert[]>(MedicationEngine.detectInteractions());
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
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-400" /> Medication Intelligence & Pharmacovigilance
          </h2>
          <p className="text-xs text-slate-400">
            Active prescription tracking, automated drug-drug interaction matrix, and OTC medication reconciliation.
          </p>
        </div>

        <button
          onClick={() => setShowReconcileModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Reconcile OTC / Supplement</span>
        </button>
      </div>

      {/* High-Risk Interaction Alert Banner */}
      {interactions.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
            <span>High-Severity Pharmacovigilance Alert ({interactions.length})</span>
          </div>

          <div className="space-y-2">
            {interactions.map(alert => (
              <div key={alert.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    {alert.drug1} ↔ {alert.drug2}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                    SEVERITY: {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{alert.mechanism}</p>
                <div className="pt-1 text-[11px] font-semibold text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Recommendation: {alert.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medList.map(med => (
          <div
            key={med.id}
            className={`p-4 rounded-2xl border transition-all ${
              med.status === 'otc' && med.name.includes('Ibuprofen')
                ? 'bg-rose-500/5 border-rose-500/40'
                : 'bg-[#131B2E] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  {med.name}
                  <span className="text-xs text-slate-400 font-mono">({med.dosage})</span>
                </h3>
                <span className="text-[11px] text-slate-400">{med.frequency}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                med.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {med.status}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1 mt-2">
              <span className="text-[10px] text-slate-500 block uppercase">Indication / Purpose</span>
              <p className="text-slate-200 text-[11px]">{med.purpose}</p>
            </div>

            {med.potentialInteractions.length > 0 && (
              <div className="mt-2 text-[11px] text-amber-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Interactions: {med.potentialInteractions.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reconciliation Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#131B2E] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">OTC / Supplement Reconciliation Wizard</h3>
            <form onSubmit={handleReconcileSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Medication or Supplement Name</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Ibuprofen, Potassium, St. John's Wort..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Dosage / Frequency</label>
                <input
                  type="text"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="e.g. 400mg 2x daily"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
              >
                Run Interaction Check
              </button>
            </form>

            {reconcileResult && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                {reconcileResult.warnings.map((w: string, idx: number) => (
                  <p key={idx} className="text-rose-400 font-semibold">{w}</p>
                ))}
                <p className="text-slate-300 font-medium">{reconcileResult.suggestedAction}</p>
              </div>
            )}

            <button
              onClick={() => { setShowReconcileModal(false); setReconcileResult(null); }}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Close Wizard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
