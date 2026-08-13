import React, { useState, useEffect } from 'react';
import { PersonaTurn, PersonaId, ClusterType } from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  ShieldAlert, 
  Stethoscope, 
  Pill, 
  BookOpen, 
  Activity, 
  Scale, 
  CheckCircle2, 
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PersonaDebateStudioProps {
  turns: PersonaTurn[];
  currentTurnIndex: number;
  onTurnSelect: (index: number) => void;
  onNextTurn: () => void;
  onPrevTurn: () => void;
  onReset: () => void;
  onCustomQuerySubmit: (query: string) => void;
  onOpenExplainabilityModal: (turn: PersonaTurn) => void;
}

export const PersonaDebateStudio: React.FC<PersonaDebateStudioProps> = ({
  turns,
  currentTurnIndex,
  onTurnSelect,
  onNextTurn,
  onPrevTurn,
  onReset,
  onCustomQuerySubmit,
  onOpenExplainabilityModal
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');

  // Auto-play timer for live case conference simulation
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentTurnIndex < turns.length - 1) {
          onNextTurn();
        } else {
          setIsPlaying(false);
        }
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTurnIndex, turns.length, onNextTurn]);

  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'triage': return ShieldAlert;
      case 'clinical': return Stethoscope;
      case 'medication': return Pill;
      case 'evidence': return BookOpen;
      case 'recovery': return Activity;
      case 'conflict': return Scale;
      case 'planner': return CheckCircle2;
      default: return MessageSquare;
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onCustomQuerySubmit(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131B2E]/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Panel Header & Controls Bar */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Panel 1: Persona Debate Studio
            </h3>
            <p className="text-[11px] text-slate-400">Clinical Case Conference Multi-Agent Dialogue</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={onPrevTurn}
            disabled={currentTurnIndex === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            title="Previous Turn"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-lg text-white font-semibold transition-all ${
              isPlaying ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
            title={isPlaying ? 'Pause Debate' : 'Play Live Conference'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onNextTurn}
            disabled={currentTurnIndex === turns.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            title="Next Turn"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsPlaying(false); onReset(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Restart Case Conference"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono text-cyan-400 font-semibold">
          Turn {currentTurnIndex + 1} of {turns.length}
        </span>
        <div className="flex items-center space-x-1 flex-1 mx-4 max-w-xs">
          {turns.map((_, idx) => (
            <div
              key={idx}
              onClick={() => onTurnSelect(idx)}
              className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
                idx === currentTurnIndex
                  ? 'bg-cyan-400 ring-2 ring-cyan-500/40 scale-y-125'
                  : idx < currentTurnIndex
                  ? 'bg-slate-600'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <span className="text-slate-400">
          {PERSONA_PROFILES[turns[currentTurnIndex]?.personaId]?.name}
        </span>
      </div>

      {/* Dialogue Scroll Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[380px]">
        {turns.slice(0, currentTurnIndex + 1).map((turn, index) => {
          const profile = PERSONA_PROFILES[turn.personaId];
          const Icon = getPersonaIcon(turn.personaId);
          const isLatest = index === currentTurnIndex;

          return (
            <div
              key={turn.id}
              onClick={() => onTurnSelect(index)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isLatest
                  ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-90'
              }`}
            >
              {/* Persona Header Bar */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm"
                    style={{ backgroundColor: `${profile.color}15`, borderColor: `${profile.color}40` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: profile.color }} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{profile.name}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-medium border ${profile.badgeBg}`}>
                        {profile.roleTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{turn.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onOpenExplainabilityModal(turn); }}
                  className="flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all"
                  title="View Evidence & Reasoning Trace"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Explain</span>
                </button>
              </div>

              {/* Persona Headline & Speech Text */}
              <h4 className="text-xs font-bold text-slate-200 mb-1">{turn.headline}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{turn.speechText}</p>

              {/* Cited Clusters & Evidence Tags */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                {/* Cluster Citations */}
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="text-slate-500 font-medium">Citing Data Clusters:</span>
                  {turn.citedClusterIds.map(clusterId => (
                    <span
                      key={clusterId}
                      className="px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {clusterId}
                    </span>
                  ))}
                </div>

                {/* Evidence RAG Badges */}
                {turn.evidenceCitations && turn.evidenceCitations.length > 0 && (
                  <div className="flex items-center space-x-1 text-cyan-400">
                    <BookOpen className="w-3 h-3" />
                    <span className="truncate max-w-[180px]">{turn.evidenceCitations[0]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Case Input Bar */}
      <form onSubmit={handleCustomSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Askpersonas to evaluate a new symptom or drug question..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center space-x-1 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Discuss</span>
        </button>
      </form>
    </div>
  );
};
