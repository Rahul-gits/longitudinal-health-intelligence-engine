import React, { useState } from 'react';
import { ClinicalConferenceEngine } from '../engine/clinicalConferenceEngine';
import { PersonaDebateStudio } from './PersonaDebateStudio';
import { DataClusterGraph } from './DataClusterGraph';
import { ConsensusPanel } from './ConsensusPanel';
import { ExplainabilityModal } from './ExplainabilityModal';
import { PersonaTurn, ClusterType } from '../types/health';
import { Layers, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Workspace Banner */}
      <div className="p-5 bg-[#00F5D4] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-black tracking-tight flex items-center gap-2 uppercase">
            <Layers className="w-6 h-6 stroke-[2.5]" /> CLINICAL CASE CONFERENCE WORKSPACE
          </h2>
          <p className="text-xs font-bold text-black/90 font-mono mt-1">
            Synchronized 3-Panel Multi-Disciplinary Debate, 7-Cluster Graph Telemetry, & Consensus Engine.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold font-mono">
          <span className="bg-black text-[#00F5D4] px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> 3 PANELS SYNCED
          </span>
          <span className="bg-[#FFE600] text-black px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_#000]">
            CASE #PT-884920
          </span>
        </div>
      </div>

      {/* Synchronized 3-Panel Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[640px]">
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
