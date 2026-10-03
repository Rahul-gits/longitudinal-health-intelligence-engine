import React, { useEffect, useState, useRef } from 'react';
import { DoctorPostureMode, VirtualDoctorPersona } from '../types/health';
import { 
  Activity, 
  Stethoscope, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  Mic,
  Heart,
  Eye,
  Zap,
  Radio,
  Sliders,
  Maximize2
} from 'lucide-react';

interface DoctorAnimatedAvatarProps {
  persona: VirtualDoctorPersona;
  posture: DoctorPostureMode;
  isSpeaking: boolean;
  isMuted?: boolean;
  activeWord?: string;
  onSelectPosture?: (posture: DoctorPostureMode) => void;
  onSelectPersona?: (personaId: string) => void;
}

export type VisemeShape = 'SIL' | 'OH' | 'EE' | 'MBP' | 'FV' | 'LDT' | 'REST_TALK';
export type AvatarVisualMode = 'cinematic_3d' | 'holographic' | 'clinical_hd';

const AVATAR_MAP: Record<string, string> = {
  'doc-thorne': '/avatars/doc-thorne.jpg',
  'doc-lin': '/avatars/doc-lin.jpg',
  'doc-vance': '/avatars/doc-vance.jpg',
  'doc-chen': '/avatars/doc-chen.jpg'
};

function computeVisemeFromWord(word: string, tick: number): VisemeShape {
  if (!word || !word.trim()) {
    const osc = Math.sin(tick / 90);
    return osc > 0.25 ? 'REST_TALK' : 'SIL';
  }
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 'REST_TALK';

  if (/^[mbp]/.test(clean) || /(mb|mp|bb|pp)$/.test(clean)) return 'MBP';
  if (/^[fv]/.test(clean) || clean.includes('ph')) return 'FV';
  if (/(oo|ou|ow|aw|au|[ou])/.test(clean)) return 'OH';
  if (/(ee|ea|ai|ay|ey|[ie])/.test(clean)) return 'EE';
  if (/^[ldtnsz]/.test(clean) || clean.includes('th') || clean.includes('ch') || clean.includes('sh')) return 'LDT';

  return 'REST_TALK';
}

export const DoctorAnimatedAvatar: React.FC<DoctorAnimatedAvatarProps> = ({
  persona,
  posture,
  isSpeaking,
  isMuted = false,
  activeWord = '',
  onSelectPosture,
  onSelectPersona
}) => {
  const [blink, setBlink] = useState<boolean>(false);
  const [mouthOpen, setMouthOpen] = useState<number>(0);
  const [currentViseme, setCurrentViseme] = useState<VisemeShape>('SIL');
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [audioMeterLevel, setAudioMeterLevel] = useState<number>(0);
  const [visualMode, setVisualMode] = useState<AvatarVisualMode>('cinematic_3d');
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [heartRate, setHeartRate] = useState<number>(72);
  const containerRef = useRef<HTMLDivElement>(null);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
      if (Math.random() > 0.65) {
        setTimeout(() => {
          setBlink(true);
          setTimeout(() => setBlink(false), 140);
        }, 320);
      }
    }, 3600);

    return () => clearInterval(blinkInterval);
  }, []);

  // Organic rhythmic breathing & subtle head micro-motion
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase(prev => (prev + 1) % 360);
    }, 40);

    return () => clearInterval(breathInterval);
  }, []);

  // Heartbeat micro-pulse
  useEffect(() => {
    const hrInterval = setInterval(() => {
      setHeartRate(prev => 70 + Math.floor(Math.sin(Date.now() / 4000) * 4));
    }, 1200);
    return () => clearInterval(hrInterval);
  }, []);

  // High-Fidelity Viseme & Lip-Sync Modulation
  useEffect(() => {
    if (!isSpeaking || isMuted) {
      setMouthOpen(0);
      setCurrentViseme('SIL');
      setAudioMeterLevel(0);
      return;
    }

    const mouthInterval = setInterval(() => {
      const viseme = computeVisemeFromWord(activeWord, Date.now());
      setCurrentViseme(viseme);

      let targetOpen = 0.5;
      if (viseme === 'MBP') targetOpen = 0.08;
      else if (viseme === 'OH') targetOpen = 0.92;
      else if (viseme === 'EE') targetOpen = 0.45;
      else if (viseme === 'FV') targetOpen = 0.35;
      else if (viseme === 'LDT') targetOpen = 0.65;
      else targetOpen = Math.sin(Date.now() / 85) * 0.35 + 0.55;

      setMouthOpen(targetOpen);
      setAudioMeterLevel(Math.floor(Math.random() * 65) + 35);
    }, 60);

    return () => clearInterval(mouthInterval);
  }, [isSpeaking, isMuted, activeWord]);

  // Interactive 3D cursor tracking for depth parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 10, y: y * 10 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const avatarSrc = AVATAR_MAP[persona.id] || '/avatars/doc-thorne.jpg';

  // Continuous organic breathing and floating physics
  const breathSin = Math.sin((breathPhase * Math.PI) / 180);
  const breathScale = 1 + breathSin * 0.012;
  const breathTranslateY = breathSin * 3;

  // Posture expressions styling
  const getPostureBadge = () => {
    switch (posture) {
      case 'greeting':
        return { label: 'GREETING & WELCOME', color: 'bg-emerald-400 text-black', icon: Sparkles };
      case 'listening':
        return { label: 'ACTIVE TELEMETRY LISTENING', color: 'bg-cyan-400 text-black', icon: Radio };
      case 'explaining':
        return { label: 'CLINICAL EXPLANATION', color: 'bg-amber-400 text-black', icon: Activity };
      case 'alerting':
        return { label: 'CRITICAL SAFETY ALERT', color: 'bg-rose-500 text-white animate-pulse', icon: ShieldAlert };
      case 'reassuring':
        return { label: 'REASSURING CARE PLAN', color: 'bg-violet-400 text-black', icon: CheckCircle2 };
      default:
        return { label: posture.toUpperCase(), color: 'bg-[#FFE600] text-black', icon: Activity };
    }
  };

  const currentBadge = getPostureBadge();
  const BadgeIcon = currentBadge.icon;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full min-h-[220px] md:min-h-[420px] bg-gradient-to-b from-[#0B0F19] via-[#111827] to-[#0A0E17] border-3 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden flex flex-col justify-between p-3 select-none transition-all duration-300"
    >
      {/* 1. TOP TELE-HEALTH STREAM HUD BAR */}
      <div className="w-full flex items-center justify-between z-30 pb-2 border-b border-white/15">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <span>LIVE AI CLINICAL STREAM</span>
              <span className="text-white/40">•</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded text-[9px] border border-emerald-500/40">4K 60FPS</span>
            </span>
            <span className="text-[9px] font-mono text-white/50">HEVC HDR10 • NEURAL STREAM LATENCY: 14ms</span>
          </div>
        </div>

        {/* Visual Mode Selector & Posture Badge */}
        <div className="flex items-center space-x-2">
          {/* Posture Badge */}
          <div className={`flex items-center space-x-1 text-[10px] font-black uppercase font-mono px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${currentBadge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{currentBadge.label}</span>
          </div>

          {/* Audio Speaking Status */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-black/70 px-2.5 py-1 rounded border border-white/20 text-[10px] font-mono text-white shadow-inner">
            {isSpeaking && !isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">SPEAKING</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/70">LISTENING</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN REALISTIC 3D CHARACTER STAGE */}
      <div className="relative w-full flex-1 flex items-center justify-center my-1 overflow-hidden">
        {/* Background Grid & Volumetric Lighting */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        {/* Dynamic Holographic Scanlines in Holographic mode */}
        {visualMode === 'holographic' && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent bg-[length:100%_4px] pointer-events-none z-10 animate-pulse"></div>
        )}

        {/* Alert Pulsing Aura for 'alerting' posture */}
        {posture === 'alerting' && (
          <div className="absolute inset-0 bg-rose-600/15 animate-ping pointer-events-none z-10" />
        )}

        {/* Ambient Specialist Halo Glow */}
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-35 transition-all duration-700 pointer-events-none"
          style={{ 
            backgroundColor: posture === 'alerting' ? '#EF4444' : persona.accentColor,
            transform: `translate(${mouseOffset.x * 2}px, ${mouseOffset.y * 2}px)`
          }}
        />

        {/* 3D Character Viewport with Perspective & Breathing */}
        <div 
          className="relative z-20 flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(1000px) rotateY(${mouseOffset.x * 0.75}deg) rotateX(${-mouseOffset.y * 0.75}deg) translateY(${breathTranslateY}px) scale(${breathScale})`
          }}
        >
          {/* Character Container Card */}
          <div className="relative group w-[310px] h-[310px] sm:w-[340px] sm:h-[340px] rounded-2xl overflow-hidden border-3 border-black shadow-[8px_8px_0px_0px_#000] bg-black">
            {/* The Real-World Stylized 3D Animated Character Image */}
            <img 
              src={avatarSrc}
              alt={persona.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                visualMode === 'holographic' 
                  ? 'hue-rotate-180 brightness-110 contrast-125 saturate-150 filter' 
                  : visualMode === 'clinical_hd' 
                    ? 'contrast-110 saturate-105' 
                    : 'contrast-100'
              } ${posture === 'alerting' ? 'brightness-95 contrast-125' : ''}`}
            />

            {/* Subtle Realistic Blinking Overlay */}
            {blink && (
              <div className="absolute inset-0 bg-black/35 pointer-events-none transition-opacity duration-100" />
            )}

            {/* Speech Wave Resonance Aura (Rings that expand when doctor speaks) */}
            {isSpeaking && !isMuted && (
              <div 
                className="absolute inset-0 rounded-2xl border-4 border-emerald-400/60 pointer-events-none animate-pulse transition-all duration-75"
                style={{
                  boxShadow: `inset 0 0 ${15 + mouthOpen * 30}px ${persona.accentColor}88`
                }}
              />
            )}

            {/* Sub-Surface Holographic Medical Scanner Reticle */}
            <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-black/75 backdrop-blur px-2 py-1 rounded border border-white/20 text-[10px] font-mono text-cyan-300">
              <Zap className="w-3 h-3 text-cyan-400 animate-spin" />
              <span>AI SYNAPSE SYNC: 99.8%</span>
            </div>

            {/* Live Cardiac & Vitals Telemetry Badge */}
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/75 backdrop-blur px-2 py-1 rounded border border-white/20 text-[10px] font-mono text-emerald-400">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-bounce" />
              <span>DOCTOR HR: {heartRate} BPM</span>
            </div>

            {/* Floating Speech Viseme HUD (Appears when doctor speaks) */}
            {isSpeaking && !isMuted && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur border border-emerald-400/60 p-2 rounded shadow-lg flex items-center justify-between text-white z-20">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-emerald-300">
                    LIP-SYNC [{currentViseme}]
                  </span>
                  {activeWord && (
                    <span className="text-[10px] font-mono text-white/90 bg-white/10 px-1.5 py-0.5 rounded border border-white/20 truncate max-w-[120px]">
                      "{activeWord}"
                    </span>
                  )}
                </div>

                {/* Animated Speech Decibel Waveform */}
                <div className="flex items-center space-x-1">
                  {[12, 28, 40, 20, 35, 18, 45, 25].map((val, idx) => (
                    <div 
                      key={idx}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(4, (val * audioMeterLevel) / 45)}px`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Context Panel: Specialist Lens & Focus */}
        <div className="absolute bottom-3 right-3 hidden md:flex flex-col items-end space-y-1 bg-black/80 backdrop-blur border-2 border-black p-2.5 shadow-[3px_3px_0px_0px_#000] text-right z-20">
          <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <Activity className="w-3 h-3" />
            SPECIALIST FOCUS
          </span>
          <span className="font-display font-extrabold text-white text-xs max-w-[200px] leading-tight">
            {persona.clinicalFocus}
          </span>
        </div>
      </div>

      {/* 3. INTERACTIVE CHARACTER BAR & POSTURE QUICK-CONTROLS */}
      <div className="w-full flex flex-col space-y-2 z-30 pt-1">
        {/* Posture Interactive Pill Triggers */}
        {onSelectPosture && (
          <div className="flex items-center justify-between bg-black/60 p-1.5 border border-white/10 rounded overflow-x-auto text-[10px] font-mono gap-1">
            <span className="text-white/50 text-[9px] font-bold px-1 whitespace-nowrap">EXPRESSION:</span>
            {(['greeting', 'listening', 'explaining', 'alerting', 'reassuring'] as DoctorPostureMode[]).map((p) => {
              const active = posture === p;
              return (
                <button
                  key={p}
                  onClick={() => onSelectPosture(p)}
                  className={`px-2 py-0.5 rounded font-bold uppercase transition-all whitespace-nowrap border ${
                    active 
                      ? 'bg-[#FFE600] text-black border-black shadow-[1px_1px_0px_0px_#000] scale-105' 
                      : 'bg-black/40 text-white/70 border-white/15 hover:text-white hover:border-white/30'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Visual Rendering Style Switcher */}
            <div className="flex items-center space-x-1 pl-2 border-l border-white/20">
              <span className="text-white/40 text-[9px]">STYLE:</span>
              <button
                onClick={() => setVisualMode(visualMode === 'cinematic_3d' ? 'holographic' : visualMode === 'holographic' ? 'clinical_hd' : 'cinematic_3d')}
                className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-cyan-300 font-bold uppercase border border-cyan-400/30 text-[9px]"
                title="Toggle Avatar Rendering Style"
              >
                {visualMode === 'cinematic_3d' ? '3D CINEMATIC' : visualMode === 'holographic' ? 'HOLOGRAPHIC' : 'STUDIO HD'}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Video HUD: Doctor Nameplate & Voice Spectrum */}
        <div className="w-full bg-[#111827] border-2 border-black p-2.5 shadow-[3px_3px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2">
          {/* Doctor Info */}
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-black shadow-[1px_1px_0px_0px_#000] flex-shrink-0"
              style={{ backgroundColor: persona.avatarColor }}
            >
              <img src={avatarSrc} alt={persona.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black font-display text-white tracking-wide">{persona.name}</span>
                <span className="text-[9px] font-mono bg-black text-[#FFE600] px-1.5 py-0.2 border border-white/20">
                  {persona.title}
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/70">{persona.credentials}</p>
            </div>
          </div>

          {/* Quick Specialist Switcher Avatar Thumbnails */}
          {onSelectPersona && (
            <div className="flex items-center space-x-1 bg-black/60 p-1 rounded border border-white/10">
              <span className="text-[9px] font-mono text-white/40 mr-1 hidden sm:inline">TEAM:</span>
              {[
                { id: 'doc-thorne', name: 'Dr. Thorne', img: '/avatars/doc-thorne.jpg' },
                { id: 'doc-lin', name: 'Dr. Lin', img: '/avatars/doc-lin.jpg' },
                { id: 'doc-vance', name: 'Dr. Vance', img: '/avatars/doc-vance.jpg' },
                { id: 'doc-chen', name: 'Dr. Chen', img: '/avatars/doc-chen.jpg' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => onSelectPersona(d.id)}
                  title={`Switch to ${d.name}`}
                  className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                    persona.id === d.id 
                      ? 'border-[#FFE600] ring-2 ring-[#FFE600] scale-110' 
                      : 'border-white/30 opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Dynamic Voice Spectrum Visualizer */}
          <div className="flex items-center space-x-1 bg-black/60 px-2 py-1 border border-white/10">
            <span className="text-[9px] font-mono font-bold text-white/60 mr-1">AUDIO</span>
            {[20, 50, 80, 40, 65, 30, 90, 45, 60, 25].map((h, i) => (
              <div 
                key={i} 
                className="w-1 bg-emerald-400 transition-all duration-75"
                style={{
                  height: isSpeaking && !isMuted ? `${Math.max(4, Math.min(20, (h * audioMeterLevel) / 60))}px` : '4px',
                  opacity: isSpeaking && !isMuted ? 1 : 0.3
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
