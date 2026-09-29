import React, { useState, useEffect, useRef } from 'react';
import { SwarmIntelligenceEngine } from '../engine/swarmIntelligenceEngine';
import { 
  SwarmParticle, 
  SwarmGlobalBest, 
  SwarmMetrics, 
  SwarmMessage, 
  PersonaId, 
  CrossExaminationDebate 
} from '../types/health';
import { PERSONA_PROFILES } from '../data/mockPatientData';
import { 
  Cpu, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Activity, 
  Sliders, 
  Plus, 
  Flame, 
  Radio, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Dna, 
  HeartPulse, 
  Scale, 
  Target, 
  Layers, 
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';

interface SwarmIntelligenceWorkspaceProps {
  engine?: SwarmIntelligenceEngine;
}

export const SwarmIntelligenceWorkspace: React.FC<SwarmIntelligenceWorkspaceProps> = ({ engine: initialEngine }) => {
  const engineRef = useRef<SwarmIntelligenceEngine>(initialEngine || new SwarmIntelligenceEngine());
  const [particles, setParticles] = useState<SwarmParticle[]>(engineRef.current.getParticles());
  const [globalBest, setGlobalBest] = useState<SwarmGlobalBest>(engineRef.current.getGlobalBest());
  const [metrics, setMetrics] = useState<SwarmMetrics>(engineRef.current.getMetrics());
  const [messages, setMessages] = useState<SwarmMessage[]>(engineRef.current.getMessages());
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedParticle, setSelectedParticle] = useState<SwarmParticle | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'visualizer' | 'coalitions' | 'crossexam' | 'customizer'>('visualizer');

  // Swarm Parameters
  const [inertia, setInertia] = useState<number>(0.72);
  const [c1, setC1] = useState<number>(1.49);
  const [c2, setC2] = useState<number>(1.49);
  const [mutationRate, setMutationRate] = useState<number>(0.05);

  // Cross Examination State
  const [personaA, setPersonaA] = useState<PersonaId>('nephrology');
  const [personaB, setPersonaB] = useState<PersonaId>('medication');
  const [crossExamTopic, setCrossExamTopic] = useState<string>('NSAID Cessation vs Renal Function & Pain Management');
  const [crossExamResult, setCrossExamResult] = useState<CrossExaminationDebate | null>(null);

  // Custom Persona Form State
  const [customName, setCustomName] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');
  const [customKeyQuestion, setCustomKeyQuestion] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('#EC4899');
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');

  // Live Auto-step simulation timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        const res = engineRef.current.stepIteration();
        setParticles([...res.particles]);
        setGlobalBest({ ...res.globalBest });
        setMetrics({ ...res.metrics });
        setMessages([...engineRef.current.getMessages()]);
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleStepOnce = () => {
    const res = engineRef.current.stepIteration();
    setParticles([...res.particles]);
    setGlobalBest({ ...res.globalBest });
    setMetrics({ ...res.metrics });
    setMessages([...engineRef.current.getMessages()]);
  };

  const handleStressTest = () => {
    engineRef.current.triggerStressTestPerturbation();
    setParticles([...engineRef.current.getParticles()]);
    setMetrics({ ...engineRef.current.getMetrics() });
    setMessages([...engineRef.current.getMessages()]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    engineRef.current.initializeSwarm(customSearchQuery.trim() || undefined);
    setParticles([...engineRef.current.getParticles()]);
    setGlobalBest({ ...engineRef.current.getGlobalBest() });
    setMetrics({ ...engineRef.current.getMetrics() });
    setMessages([...engineRef.current.getMessages()]);
    setSelectedParticle(null);
  };

  const handleParamChange = (newInertia: number, newC1: number, newC2: number, newMut: number) => {
    setInertia(newInertia);
    setC1(newC1);
    setC2(newC2);
    setMutationRate(newMut);
    engineRef.current.setParameters(newInertia, newC1, newC2, newMut);
  };

  const handleRunCrossExam = () => {
    const exam = engineRef.current.generateCrossExamination(personaA, personaB, crossExamTopic);
    setCrossExamResult(exam);
  };

  const handleAddCustomPersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customRole.trim()) return;

    const id = `custom-${customName.toLowerCase().replace(/\s+/g, '-')}`;
    const newPersona = {
      id,
      name: customName.trim(),
      roleTitle: customRole.trim(),
      avatarIcon: 'Sparkles',
      color: customColor,
      badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      keyQuestion: customKeyQuestion.trim() || 'What is the patient impact?'
    };

    PERSONA_PROFILES[id] = newPersona;
    const particle = engineRef.current.addCustomPersona(newPersona);
    setParticles([...engineRef.current.getParticles()]);
    setMetrics({ ...engineRef.current.getMetrics() });
    setMessages([...engineRef.current.getMessages()]);
    setSelectedParticle(particle);

    setCustomName('');
    setCustomRole('');
    setCustomKeyQuestion('');
  };

  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'triage': return ShieldAlert;
      case 'clinical': return Activity;
      case 'medication': return Radio;
      case 'evidence': return BookOpen;
      case 'recovery': return CheckCircle2;
      case 'conflict': return Scale;
      case 'planner': return Target;
      case 'genomic': return Dna;
      case 'lifestyle': return HeartPulse;
      case 'nephrology': return Activity;
      case 'immunology': return Flame;
      case 'ethics': return Scale;
      case 'swarm_orchestrator': return Cpu;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Banner */}
      <div className="p-5 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-black text-[#FFE600] px-2.5 py-0.5 text-xs font-black uppercase font-mono border border-black -rotate-1">
              REASONING TRACE (EXPERIMENTAL)
            </span>
            <h2 className="text-xl font-black font-display text-black uppercase tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 stroke-[2.5]" /> REASONING TRACE VISUALIZER
            </h2>
          </div>
          <p className="text-xs font-bold text-black/90 font-mono mt-1 max-w-2xl">
            Experimental visualization of how candidate solutions move through the multi-objective optimization space. Clinical decisions are derived from validated guidelines, deterministic safety policies, and clinician review.
          </p>
        </div>

        {/* Emergence Telemetry Quick Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
          <div className="bg-white text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
            <span className="text-black/70">Cohesion:</span>
            <span className="font-extrabold text-[#3B82F6]">{metrics.cohesion}%</span>
          </div>
          <div className="bg-white text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
            <span className="text-black/70">Entropy:</span>
            <span className="font-extrabold text-[#F43F5E]">{metrics.entropy}%</span>
          </div>
          <div className="bg-black text-[#FFE600] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase font-black">
            {metrics.convergenceStatus.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTabMode('visualizer')}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-black font-display uppercase border-2 border-black transition-all cursor-pointer ${
              activeTabMode === 'visualizer'
                ? 'bg-[#00F5D4] text-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#FAF8F5] text-black/70 hover:bg-black/5'
            }`}
          >
            <Cpu className="w-4 h-4 stroke-[2.5]" />
            <span>2D Swarm Canvas & Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTabMode('coalitions')}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-black font-display uppercase border-2 border-black transition-all cursor-pointer ${
              activeTabMode === 'coalitions'
                ? 'bg-[#A855F7] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#FAF8F5] text-black/70 hover:bg-black/5'
            }`}
          >
            <Target className="w-4 h-4 stroke-[2.5]" />
            <span>Goal Coalitions & Friction</span>
          </button>
          <button
            onClick={() => setActiveTabMode('crossexam')}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-black font-display uppercase border-2 border-black transition-all cursor-pointer ${
              activeTabMode === 'crossexam'
                ? 'bg-[#FF70A6] text-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#FAF8F5] text-black/70 hover:bg-black/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            <span>Persona Cross-Examination Duel</span>
          </button>
          <button
            onClick={() => setActiveTabMode('customizer')}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-black font-display uppercase border-2 border-black transition-all cursor-pointer ${
              activeTabMode === 'customizer'
                ? 'bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#FAF8F5] text-black/70 hover:bg-black/5'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Agent Customizer & Hyperparams</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={handleStepOnce}
            className="px-3 py-1.5 bg-white hover:bg-[#FFE600] text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer"
            title="Execute 1 PSO Step"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Step</span>
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-1.5 border-2 border-black font-black font-display text-xs flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer uppercase ${
              isPlaying ? 'bg-[#FF6B35] text-white' : 'bg-[#FFE600] text-black hover:bg-[#CCFF00]'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 stroke-[2.5]" /> : <Play className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>{isPlaying ? 'Pause Swarm' : 'Live Simulate'}</span>
          </button>
          <button
            onClick={handleStressTest}
            className="px-3 py-1.5 bg-[#FF5722] hover:bg-[#FF3D00] text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer"
            title="Inject Stress Test Perturbation"
          >
            <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Stress Test</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-white hover:bg-[#00F5D4] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            title="Reset Swarm"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTabMode === 'visualizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: 2D Particle Swarm Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-[#00F5D4] border-b-3 border-black flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xs font-black font-display text-black uppercase tracking-wider">
                  CLINICAL HYPOTHESIS SPACE (2D PSO CANVAS)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 border border-black">
                STEP {metrics.iterationCount} • {particles.length} AGENT NODES
              </span>
            </div>

            {/* Canvas Interactive Simulation Container */}
            <div className="relative flex-1 bg-[#FAF8F5] min-h-[420px] p-4 overflow-hidden border-b-2 border-black flex items-center justify-center">
              {/* Target / Global Best Consensus Ring */}
              <div 
                className="absolute w-24 h-24 rounded-full border-2 border-dashed border-[#3B82F6] bg-[#3B82F6]/10 flex items-center justify-center animate-pulse pointer-events-none transition-all duration-500"
                style={{
                  left: `${globalBest.x}%`,
                  top: `${globalBest.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-6 h-6 rounded-full bg-[#3B82F6] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <Sparkles className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </div>
                <span className="absolute -bottom-6 bg-black text-[#FFE600] text-[9px] font-mono font-black px-1.5 py-0.5 border border-black whitespace-nowrap shadow-[1px_1px_0px_0px_#000]">
                  g_best ({globalBest.x}, {globalBest.y})
                </span>
              </div>

              {/* Render Particle Nodes */}
              {particles.map((p) => {
                const isSelected = selectedParticle?.id === p.id;
                const Icon = getPersonaIcon(p.personaId);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParticle(p)}
                    className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group ${
                      isSelected ? 'z-30 scale-125' : 'z-10 hover:scale-115 hover:z-20'
                    }`}
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`
                    }}
                  >
                    {/* Velocity Trail Vector Line */}
                    <div 
                      className="absolute top-1/2 left-1/2 h-0.5 bg-black/40 origin-left pointer-events-none"
                      style={{
                        width: `${Math.hypot(p.vx, p.vy) * 4}px`,
                        transform: `rotate(${Math.atan2(p.vy, p.vx)}rad)`
                      }}
                    />

                    {/* Particle Dot Node */}
                    <div
                      className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] transition-all ${
                        isSelected ? 'ring-4 ring-[#FFE600]' : ''
                      }`}
                      style={{ backgroundColor: p.color }}
                    >
                      <Icon className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    </div>

                    {/* Label Badge */}
                    <span className="absolute left-1/2 -bottom-5 transform -translate-x-1/2 text-[9px] font-black font-mono bg-white text-black px-1 py-0.2 border border-black shadow-[1px_1px_0px_0px_#000] whitespace-nowrap">
                      {p.name.replace(' AI', '')}
                    </span>
                  </div>
                );
              })}

              {/* Grid Reference Lines */}
              <div className="absolute inset-0 border border-black/10 pointer-events-none grid grid-cols-4 grid-rows-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-black/5" />
                ))}
              </div>
            </div>

            {/* Selected Particle / Consensus Inspector Footer */}
            <div className="p-4 bg-white space-y-2">
              {selectedParticle ? (
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-7 h-7 border-2 border-black flex items-center justify-center"
                      style={{ backgroundColor: selectedParticle.color }}
                    >
                      <Activity className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-extrabold font-display text-black">{selectedParticle.name}</span>
                      <span className="text-[10px] font-mono text-black/70 ml-2">
                        Pos: ({selectedParticle.x.toFixed(1)}, {selectedParticle.y.toFixed(1)}) • Velocity: ({selectedParticle.vx.toFixed(1)}, {selectedParticle.vy.toFixed(1)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 font-mono font-bold text-[11px]">
                    <span className="bg-[#FFE600] px-2 py-0.5 border border-black">
                      Score: {selectedParticle.currentScore.toFixed(1)}
                    </span>
                    <span className="bg-[#00F5D4] px-2 py-0.5 border border-black">
                      Conf: {selectedParticle.confidence}%
                    </span>
                    <button
                      onClick={() => setSelectedParticle(null)}
                      className="px-2 py-0.5 bg-black text-white text-[10px] uppercase font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#FFE600]/20 border-2 border-black text-xs font-bold font-mono text-black flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Global Consensus g_best Hypothesis:</span>
                  </div>
                  <span className="bg-black text-[#FFE600] px-2 py-0.5 text-[10px] uppercase font-black border border-black">
                    {globalBest.confidence}% Confidence
                  </span>
                </div>
              )}

              <p className="text-xs font-semibold text-black/90 font-sans leading-relaxed">
                {selectedParticle ? selectedParticle.hypothesis : globalBest.hypothesis}
              </p>
            </div>
          </div>

          {/* Right Column: Emergence Metrics & Real-time Signal Feed (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Metrics Dashboard Card */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] p-4 space-y-4">
              <div className="pb-2 border-b-2 border-black flex items-center justify-between">
                <h3 className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-black stroke-[2.5]" /> SWARM EMERGENCE METRICS
                </h3>
                <span className="px-2 py-0.5 bg-[#FF70A6] text-black text-[10px] font-black uppercase border border-black">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-[10px] font-mono font-bold text-black/70 uppercase">Swarm Cohesion</span>
                  <div className="text-lg font-black font-display text-[#3B82F6]">{metrics.cohesion}%</div>
                  <div className="w-full bg-gray-200 h-1.5 border border-black mt-1">
                    <div className="bg-[#3B82F6] h-full" style={{ width: `${metrics.cohesion}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-[10px] font-mono font-bold text-black/70 uppercase">Swarm Entropy</span>
                  <div className="text-lg font-black font-display text-[#F43F5E]">{metrics.entropy}%</div>
                  <div className="w-full bg-gray-200 h-1.5 border border-black mt-1">
                    <div className="bg-[#F43F5E] h-full" style={{ width: `${metrics.entropy}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-[10px] font-mono font-bold text-black/70 uppercase">Divergence Index</span>
                  <div className="text-lg font-black font-display text-[#F59E0B]">{metrics.divergenceIndex}</div>
                  <span className="text-[9px] font-mono text-black/70">Standard Deviation of Scores</span>
                </div>

                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-[10px] font-mono font-bold text-black/70 uppercase">Active Agents</span>
                  <div className="text-lg font-black font-display text-[#10B981]">{particles.length} Nodes</div>
                  <span className="text-[9px] font-mono text-black/70">Specialists Participating</span>
                </div>
              </div>
            </div>

            {/* Signal Message Topology Feed */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] p-4 flex flex-col h-[340px]">
              <div className="pb-2 border-b-2 border-black flex items-center justify-between">
                <h3 className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-black stroke-[2.5]" /> SIGNAL PASSING & TOPOLOGY LOG
                </h3>
                <span className="text-[10px] font-mono font-bold text-black/70">
                  {messages.length} signals
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
                {messages.map((m) => (
                  <div key={m.id} className="p-2.5 bg-[#FAF8F5] border border-black shadow-[1px_1px_0px_0px_#000] text-xs font-mono">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-black uppercase">{m.senderName}</span>
                      <span className="text-[9px] text-black/60">{m.timestamp}</span>
                    </div>
                    <p className="text-[11px] font-sans font-semibold text-black/90 leading-tight">
                      {m.signalContent}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 1.5: Persona Coalitions & Goal Friction Matrix */}
      {activeTabMode === 'coalitions' && (
        <div className="space-y-6 font-mono">
          {/* Section Header */}
          <div className="p-4 bg-[#A855F7] text-white border-3 border-black shadow-[5px_5px_0px_0px_#000] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black font-display uppercase tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 stroke-[2.5]" />
                PERSONA GOAL COALITIONS & FRICTION MATRIX
              </h3>
              <p className="text-xs text-white/90">Multi-Agent Vector Goal Clustering & Tension Resolution</p>
            </div>
            <span className="bg-black text-[#FFE600] px-3 py-1 text-xs font-black border border-black shadow-[2px_2px_0px_0px_#000]">
              4 FUNCTIONAL COALITIONS ACTIVE
            </span>
          </div>

          {/* Coalitions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {engineRef.current.getPersonaCoalitions().map(coalition => (
              <div key={coalition.id} className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 border border-black shadow-[1px_1px_0px_0px_#000]" style={{ backgroundColor: coalition.color }}></span>
                    <h4 className="font-black font-display text-sm text-black">{coalition.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-black text-[#FFE600] border border-black">
                    {coalition.consensusScore}% ALIGNED
                  </span>
                </div>

                <p className="text-xs text-black/80 font-sans mb-3">{coalition.description}</p>

                <div className="bg-[#FAF8F5] p-2.5 border border-black mb-3">
                  <span className="text-[10px] font-black uppercase text-black/70 block">SHARED GOAL FOCUS:</span>
                  <span className="text-xs font-extrabold text-black block mt-0.5">"{coalition.sharedGoalFocus}"</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-black/20">
                  <span className="text-[10px] font-black uppercase text-black/60">MEMBER PERSONAS:</span>
                  {coalition.memberIds.map(mId => {
                    const p = PERSONA_PROFILES[mId];
                    return (
                      <span key={mId} className="px-2 py-0.5 text-[10px] font-black uppercase bg-[#FAF8F5] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                        {p?.name || mId}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pairwise Goal Friction Resolution Matrix */}
          <div className="p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000]">
            <div className="flex items-center space-x-2 border-b-2 border-black pb-3 mb-4">
              <Scale className="w-5 h-5 text-[#F59E0B] stroke-[2.5]" />
              <div>
                <h4 className="font-black font-display text-sm text-black uppercase">PAIRWISE PERSONA GOAL FRICTION MATRIX</h4>
                <p className="text-[10px] text-black/70">Quantified goal tension and consensus resolution pathways</p>
              </div>
            </div>

            <div className="space-y-4">
              {engineRef.current.getGoalFrictionMatrix().map((cell, idx) => {
                const pA = PERSONA_PROFILES[cell.personaA];
                const pB = PERSONA_PROFILES[cell.personaB];

                return (
                  <div key={idx} className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/30 pb-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 text-xs font-black uppercase border border-black" style={{ backgroundColor: pA?.color || '#3B82F6', color: '#FFF' }}>
                          {pA?.name || cell.personaA}
                        </span>
                        <span className="font-black font-display text-xs">VS</span>
                        <span className="px-2.5 py-0.5 text-xs font-black uppercase border border-black" style={{ backgroundColor: pB?.color || '#A855F7', color: '#FFF' }}>
                          {pB?.name || cell.personaB}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase">FRICTION SCORE:</span>
                        <span className="bg-[#FF6B35] text-black px-2 py-0.5 font-black border border-black text-xs">
                          {cell.frictionScore} / 100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2.5 border border-black">
                        <span className="text-[10px] font-black uppercase text-[#F43F5E] block mb-1">TENSION REASON:</span>
                        <p className="text-black/90 font-sans">{cell.tensionReason}</p>
                      </div>
                      <div className="bg-[#CCFF00] p-2.5 border border-black">
                        <span className="text-[10px] font-black uppercase text-black block mb-1">SWARM RESOLUTION STRATEGY:</span>
                        <p className="text-black font-bold font-sans">{cell.resolutionStrategy}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Persona Cross-Examination Duel */}
      {activeTabMode === 'crossexam' && (
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] p-5 space-y-5">
          <div className="pb-3 border-b-3 border-black flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black font-display text-black uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-5 h-5 stroke-[2.5] text-[#FF70A6]" /> DIRECT PERSONA CROSS-EXAMINATION DUEL
              </h3>
              <p className="text-xs font-bold text-black/80 font-mono">
                Select 2 specialist AI personas to initiate a direct point-by-point cross-examination debate.
              </p>
            </div>
          </div>

          {/* Duel Setup Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF8F5] p-4 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <div>
              <label className="block text-xs font-extrabold font-display uppercase mb-1">Persona A (Challenger)</label>
              <select
                value={personaA}
                onChange={(e) => setPersonaA(e.target.value as PersonaId)}
                className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000]"
              >
                {Object.values(PERSONA_PROFILES).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.roleTitle})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold font-display uppercase mb-1">Persona B (Defender)</label>
              <select
                value={personaB}
                onChange={(e) => setPersonaB(e.target.value as PersonaId)}
                className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000]"
              >
                {Object.values(PERSONA_PROFILES).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.roleTitle})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold font-display uppercase mb-1">Debate Topic / Parameter</label>
              <input
                type="text"
                value={crossExamTopic}
                onChange={(e) => setCrossExamTopic(e.target.value)}
                className="w-full bg-white border-2 border-black px-3 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
          </div>

          <button
            onClick={handleRunCrossExam}
            className="w-full py-3 bg-[#FF70A6] hover:bg-[#FF4D8D] text-black font-black font-display text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
            <span>Initiate Cross-Examination Duel</span>
          </button>

          {/* Render Cross Exam Exchange Results */}
          {crossExamResult && (
            <div className="space-y-4 pt-4 border-t-3 border-black">
              <div className="p-4 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
                <span className="font-black font-display text-xs uppercase">
                  UNIFIED DUEL VERDICT ({crossExamResult.agreementPercentage}% AGREEMENT REACHED)
                </span>
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold">
                  {crossExamResult.exchanges.length} ARGUMENT TURNS
                </span>
              </div>

              <div className="space-y-3">
                {crossExamResult.exchanges.map((ex, idx) => {
                  const pProfile = PERSONA_PROFILES[ex.personaId];
                  return (
                    <div key={idx} className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-black">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 border border-black flex items-center justify-center font-bold text-xs"
                            style={{ backgroundColor: pProfile?.color || '#FFE600' }}
                          >
                            {ex.personaName[0]}
                          </div>
                          <span className="font-black font-display text-xs text-black">{ex.personaName}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-[#FF5722] text-white px-2 py-0.5 border border-black">
                          Tension: {ex.tensionScore}%
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-black/90 font-sans leading-relaxed">
                        {ex.argument}
                      </p>
                      <div className="mt-2 text-[10px] font-mono font-bold text-black/70 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 stroke-[2.5]" />
                        <span>Evidence: {ex.evidenceRef}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-[#CCFF00] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <h4 className="text-xs font-black font-display uppercase mb-1">Synthesized Resolution:</h4>
                <p className="text-xs font-semibold text-black leading-relaxed font-sans">
                  {crossExamResult.consensusVerdict}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Custom Persona Creator & Hyperparameters */}
      {activeTabMode === 'customizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Custom Persona Injection Form (6 Cols) */}
          <div className="lg:col-span-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 space-y-4">
            <div className="pb-3 border-b-2 border-black flex items-center justify-between">
              <h3 className="text-sm font-black font-display text-black uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 stroke-[2.5] text-[#CCFF00]" /> CREATE & INJECT CUSTOM PERSONA
              </h3>
            </div>

            <form onSubmit={handleAddCustomPersona} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block uppercase mb-1">Persona Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cardio-Oncology Specialist AI"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-black px-3 py-2 text-xs text-black shadow-[2px_2px_0px_0px_#000]"
                  required
                />
              </div>

              <div>
                <label className="block uppercase mb-1">Specialization / Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiotoxicity & Chemotherapy Safety"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-black px-3 py-2 text-xs text-black shadow-[2px_2px_0px_0px_#000]"
                  required
                />
              </div>

              <div>
                <label className="block uppercase mb-1">Key Clinical Question</label>
                <input
                  type="text"
                  placeholder="e.g. Does current therapy risk cardiotoxicity?"
                  value={customKeyQuestion}
                  onChange={(e) => setCustomKeyQuestion(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-black px-3 py-2 text-xs text-black shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="block uppercase mb-1">Theme Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-10 h-9 border-2 border-black cursor-pointer"
                  />
                  <span className="font-mono text-xs">{customColor}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#CCFF00] hover:bg-[#A3E635] text-black font-black font-display text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer uppercase flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Inject Persona into Swarm</span>
              </button>
            </form>
          </div>

          {/* Hyperparameters Slider Drawer (6 Cols) */}
          <div className="lg:col-span-6 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 space-y-4">
            <div className="pb-3 border-b-2 border-black flex items-center justify-between">
              <h3 className="text-sm font-black font-display text-black uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-5 h-5 stroke-[2.5] text-[#3B82F6]" /> PSO SWARM HYPERPARAMETERS
              </h3>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Inertia Weight (w):</span>
                  <span className="text-[#3B82F6]">{inertia}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.99"
                  step="0.01"
                  value={inertia}
                  onChange={(e) => handleParamChange(parseFloat(e.target.value), c1, c2, mutationRate)}
                  className="w-full accent-[#3B82F6] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Cognitive Weight (c1 - Personal Best):</span>
                  <span className="text-[#10B981]">{c1}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={c1}
                  onChange={(e) => handleParamChange(inertia, parseFloat(e.target.value), c2, mutationRate)}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Social Weight (c2 - Consensus Global Best):</span>
                  <span className="text-[#FF70A6]">{c2}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={c2}
                  onChange={(e) => handleParamChange(inertia, c1, parseFloat(e.target.value), mutationRate)}
                  className="w-full accent-[#FF70A6] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Mutation / Perturbation Rate:</span>
                  <span className="text-[#F59E0B]">{mutationRate}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.3"
                  step="0.01"
                  value={mutationRate}
                  onChange={(e) => handleParamChange(inertia, c1, c2, parseFloat(e.target.value))}
                  className="w-full accent-[#F59E0B] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
