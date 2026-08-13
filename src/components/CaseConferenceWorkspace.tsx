import React, { useState } from 'react';
import { ClinicalConferenceEngine } from '../engine/clinicalConferenceEngine';
import { PersonaDebateStudio } from './PersonaDebateStudio';
import { DataClusterGraph } from './DataClusterGraph';
import { ConsensusPanel } from './ConsensusPanel';
import { ExplainabilityModal } from './ExplainabilityModal';
import { PersonaTurn, ClusterType } from '../types/health';

interface CaseConferenceWorkspaceProps {
  engine: ClinicalConferenceEngine;
}

export const CaseConferenceWorkspace: React.FC<CaseConferenceWorkspaceProps> = ({ engine }) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(engine.getCurrentIndex());
  const [turns, setTurns] = useState<PersonaTurn[]>(engine.getAllTurns());
  const [consensus, setConsensus] = useState(engine.getConsensusState());
  const [explainModalTurn, setExplainModalTurn] = useState<PersonaTurn | null>(null);

  const activeTurn = turns[currentTurnIndex] || turns[0];
  const activeCitedClusters: ClusterType[] = activeTurn?.citedClusterIds || [];
  const activeCitedNodeIds: string[] = activeTurn?.citedNodeIds || [];

  const handleTurnSelect = (idx: number) => {
    engine.setTurnIndex(idx);
    setCurrentTurnIndex(idx);
  };

  const handleNextTurn = () => {
    const next = engine.nextTurn();
    if (next) {
      setCurrentTurnIndex(engine.getCurrentIndex());
    }
  };

  const handlePrevTurn = () => {
    const prev = engine.previousTurn();
    if (prev) {
      setCurrentTurnIndex(engine.getCurrentIndex());
    }
  };

  const handleReset = () => {
    engine.reset();
    setCurrentTurnIndex(0);
  };

  const handleCustomQuerySubmit = (query: string) => {
    const customResult = engine.generateCustomDebate(query);
    setTurns(customResult.turns);
    setConsensus(customResult.consensus);
    setCurrentTurnIndex(0);
  };

  return (
    <div className="space-y-4">
      {/* Workspace Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            Clinical Case Conference & Data Clustering Engine
          </h2>
          <p className="text-xs text-slate-300">
            Visually simulating multi-disciplinary persona debate, dynamic data clustering, and clinical consensus.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> 3 Panels Synced</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-cyan-300">Case ID: #PT-884920</span>
        </div>
      </div>

      {/* Synchronized 3-Panel Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[640px]">
        {/* Panel 1: Persona Debate Studio (4 Cols on LG) */}
        <div className="lg:col-span-4 h-full">
          <PersonaDebateStudio
            turns={turns}
            currentTurnIndex={currentTurnIndex}
            onTurnSelect={handleTurnSelect}
            onNextTurn={handleNextTurn}
            onPrevTurn={handlePrevTurn}
            onReset={handleReset}
            onCustomQuerySubmit={handleCustomQuerySubmit}
            onOpenExplainabilityModal={(turn) => setExplainModalTurn(turn)}
          />
        </div>

        {/* Panel 2: Patient Data Cluster Graph (5 Cols on LG) */}
        <div className="lg:col-span-5 h-full">
          <DataClusterGraph
            activeCitedClusters={activeCitedClusters}
            activeCitedNodeIds={activeCitedNodeIds}
          />
        </div>

        {/* Panel 3: Consensus & Governance Panel (3 Cols on LG) */}
        <div className="lg:col-span-3 h-full">
          <ConsensusPanel
            consensus={consensus}
            onOpenExplainabilityModal={() => setExplainModalTurn(activeTurn)}
          />
        </div>
      </div>

      {/* Explainability Trace Modal */}
      {explainModalTurn && (
        <ExplainabilityModal
          turn={explainModalTurn}
          consensus={consensus}
          onClose={() => setExplainModalTurn(null)}
        />
      )}
    </div>
  );
};
