import React, { useState, useEffect } from 'react';
import { PersonaTurn, PersonaId } from '../types/health';
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
  Dna,
  HeartPulse,
  Flame,
  Cpu
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
      case 'genomic': return Dna;
      case 'lifestyle': return HeartPulse;
      case 'nephrology': return Activity;
      case 'immunology': return Flame;
      case 'ethics': return Scale;
      case 'swarm_orchestrator': return Cpu;
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
    <div className="flex flex-col h-full bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] overflow-hidden">
      {/* Panel Header & Controls Bar */}
      <div className="px-4 py-3 border-b-3 border-black bg-[#FF70A6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black text-[#FF70A6] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center -rotate-2">
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display text-black uppercase tracking-wider">
              PANEL 1: DEBATE STUDIO
            </h3>
            <p className="text-[10px] font-mono font-bold text-black/90">Multi-Agent Case Conference</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1.5 bg-[#FAF8F5] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <button
            onClick={onPrevTurn}
            disabled={currentTurnIndex === 0}
            className="p-1.5 border border-black bg-white text-black hover:bg-[#FFE600] disabled:opacity-30 cursor-pointer"
            title="Previous Turn"
          >
            <SkipBack className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 border border-black font-bold transition-all cursor-pointer ${
              isPlaying ? 'bg-[#FF6B35] text-white' : 'bg-[#FFE600] text-black hover:bg-[#CCFF00]'
            }`}
            title={isPlaying ? 'Pause Debate' : 'Play Live Conference'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 stroke-[2.5]" /> : <Play className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
          <button
            onClick={onNextTurn}
            disabled={currentTurnIndex === turns.length - 1}
            className="p-1.5 border border-black bg-white text-black hover:bg-[#FFE600] disabled:opacity-30 cursor-pointer"
            title="Next Turn"
          >
            <SkipForward className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => { setIsPlaying(false); onReset(); }}
            className="p-1.5 border border-black bg-white text-black hover:bg-[#00F5D4] cursor-pointer"
            title="Restart Case Conference"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="px-4 py-2 bg-[#FAF8F5] border-b-2 border-black flex items-center justify-between text-[11px] font-mono font-bold">
        <span className="bg-black text-[#FFE600] px-2 py-0.5 border border-black text-[10px]">
          TURN {currentTurnIndex + 1} / {turns.length}
        </span>
        <div className="flex items-center space-x-1 flex-1 mx-3 max-w-xs">
          {turns.map((_, idx) => (
            <div
              key={idx}
              onClick={() => onTurnSelect(idx)}
              className={`h-2 flex-1 border border-black cursor-pointer transition-all ${
                idx === currentTurnIndex
                  ? 'bg-[#FFE600] shadow-[1px_1px_0px_0px_#000]'
                  : idx < currentTurnIndex
                  ? 'bg-[#00F5D4]'
                  : 'bg-[#FFFFFF]'
              }`}
            />
          ))}
        </div>
        <span className="text-black font-extrabold truncate max-w-[100px]">
          {PERSONA_PROFILES[turns[currentTurnIndex]?.personaId]?.name}
        </span>
      </div>

      {/* Dialogue Scroll Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[380px] bg-[#FAF8F5]">
        {turns.slice(0, currentTurnIndex + 1).map((turn, index) => {
          const profile = PERSONA_PROFILES[turn.personaId];
          const Icon = getPersonaIcon(turn.personaId);
          const isLatest = index === currentTurnIndex;

          return (
            <div
              key={turn.id}
              onClick={() => onTurnSelect(index)}
              className={`p-4 border-3 border-black transition-all cursor-pointer ${
                isLatest
                  ? 'bg-[#FFFFFF] shadow-[5px_5px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-[#FAF8F5] shadow-[2px_2px_0px_0px_#000] opacity-90 hover:opacity-100'
              }`}
            >
              {/* Persona Header Bar */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-black">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-8 h-8 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center"
                    style={{ backgroundColor: profile.color }}
                  >
                    <Icon className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black font-display text-black text-xs">{profile.name}</span>
                      <span className="px-2 py-0.2 text-[9px] font-black uppercase tracking-wider bg-black text-white border border-black">
                        {profile.roleTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-black/70 font-mono font-bold">{turn.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onOpenExplainabilityModal(turn); }}
                  className="flex items-center space-x-1 px-2 py-1 bg-[#FFE600] text-black font-black text-[10px] border border-black shadow-[1px_1px_0px_0px_#000] hover:bg-[#CCFF00] transition-all cursor-pointer uppercase"
                  title="View Evidence & Reasoning Trace"
                >
                  <Sparkles className="w-3 h-3 text-black stroke-[2.5]" />
                  <span>Trace</span>
                </button>
              </div>

              {/* Persona Headline & Speech Text */}
              <h4 className="text-xs font-black font-display text-black mb-1">{turn.headline}</h4>
              <p className="text-xs font-semibold text-black/90 leading-relaxed font-sans">{turn.speechText}</p>

              {/* Cited Clusters & Evidence Tags */}
              <div className="mt-3 pt-2.5 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono font-bold">
                {/* Cluster Citations */}
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="text-black/80 font-black">Clusters:</span>
                  {turn.citedClusterIds.map(clusterId => (
                    <span
                      key={clusterId}
                      className="px-2 py-0.5 uppercase bg-[#00F5D4] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                    >
                      {clusterId}
                    </span>
                  ))}
                </div>

                {/* Evidence RAG Badges */}
                {turn.evidenceCitations && turn.evidenceCitations.length > 0 && (
                  <div className="flex items-center space-x-1 bg-[#FF70A6] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                    <BookOpen className="w-3 h-3 stroke-[2.5]" />
                    <span className="truncate max-w-[160px] font-black">{turn.evidenceCitations[0]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Case Input Bar */}
      <form onSubmit={handleCustomSubmit} className="p-3 bg-[#FFFFFF] border-t-3 border-black flex items-center space-x-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ask personas to evaluate a new symptom or drug..."
          className="flex-1 bg-[#FAF8F5] border-2 border-black px-3 py-2 text-xs font-bold text-black placeholder-black/60 focus:outline-none focus:bg-[#FFE600]/20 shadow-[2px_2px_0px_0px_#000]"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-4 py-2 bg-[#CCFF00] hover:bg-[#A3E635] disabled:opacity-40 text-black border-2 border-black font-black font-display text-xs flex items-center space-x-1 shadow-[2px_2px_0px_0px_#000] cursor-pointer uppercase"
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Discuss</span>
        </button>
      </form>
    </div>
  );
};
