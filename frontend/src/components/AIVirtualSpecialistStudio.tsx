/**
 * AI Virtual Specialist Consultation Studio
 * ==========================================
 * Full end-to-end implementation:
 *   - Cinematic Digital Human with lip-sync, blinking, posture reactions
 *   - Real-Time 2-Way Voice: Web Speech ASR + TTS + hands-free turn-taking
 *   - Live Clinical SOAP Note + KDIGO Drug Safety Matrix
 *   - Physician Handover Brief (SBAR)
 *   - 1-Click Clinical Consultation Report Export
 *   - Editorial Palette: --bg-paper / --text-ink / --yellow / --teal
 */
import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, PhoneOff, Send, ChevronRight,
  AlertTriangle, ShieldCheck, CheckCircle2, Activity, Pill,
  Download, FileText, Clock, User, Stethoscope, RotateCcw,
  Play, Pause, X, Sparkles, Heart, Info, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDynamicPatientProfile } from '../data/mockPatientData';
import { virtualDoctorScreeningEngine } from '../engine/virtualDoctorScreeningEngine';
import { speechEngine } from '../engine/speechSynthesisEngine';
import { speechRecognitionEngine } from '../engine/speechRecognitionEngine';
import { VirtualDoctorPersona, DoctorPostureMode } from '../types/health';
import { ThreeDSpecialistCanvas } from './ThreeDSpecialistCanvas';
import { VisionObservation } from '../engine/computerVisionEngine';

/* ─────────────────────────────────────────────────────── TYPES ──── */
interface DialogueTurn {
  id: string;
  speaker: 'doctor' | 'patient';
  text: string;
  time: string;
  quickReplies?: string[];
  clinicalObservations?: string[];
  safetyAlert?: string;
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH_SUBACUTE' | 'CRITICAL';
}

interface SoapNote {
  subjective: string[];
  objective: string[];
  assessment: string[];
  plan: string[];
  lastUpdated: string;
}

interface SafetyMatrixEntry {
  drug1: string;
  drug2: string;
  mechanism: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

/* ──────────────────────────────────── VISEME & LIP-SYNC UTILITIES ──── */
type VisemeShape = 'SIL' | 'OH' | 'EE' | 'MBP' | 'FV' | 'LDT' | 'REST_TALK';

function computeViseme(word: string): VisemeShape {
  if (!word?.trim()) return 'REST_TALK';
  const c = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!c) return 'REST_TALK';
  if (/^[mbp]/.test(c) || /(mb|mp)$/.test(c)) return 'MBP';
  if (/^[fv]/.test(c) || c.includes('ph')) return 'FV';
  if (/(oo|ou|ow|aw|[ou])/.test(c)) return 'OH';
  if (/(ee|ea|ai|ay|[ie])/.test(c)) return 'EE';
  if (/^[ldtnsz]/.test(c) || c.includes('th') || c.includes('sh')) return 'LDT';
  return 'REST_TALK';
}

/* ─────────────────────────────────────── MOUTH LANDMARK MAP ──── */
const MOUTH_MAP: Record<string, { x: number; y: number; w: number; h: number; ul: string; ll: string; skin: string }> = {
  'doc-thorne': { x: 50.5, y: 38.6, w: 10.2, h: 5.0, ul: '#7D3B43', ll: '#9E4E58', skin: '#6E3C32' },
  'doc-jacob':  { x: 50.5, y: 38.6, w: 10.2, h: 5.0, ul: '#7D3B43', ll: '#9E4E58', skin: '#6E3C32' },
  'doc-lin':    { x: 51.4, y: 40.7, w: 9.4,  h: 4.6, ul: '#A84C60', ll: '#C66579', skin: '#D49B86' },
  'doc-vance':  { x: 48.6, y: 38.5, w: 10.0, h: 4.8, ul: '#763842', ll: '#944A54', skin: '#723F36' },
  'doc-chen':   { x: 49.7, y: 28.8, w: 9.2,  h: 4.4, ul: '#A04E60', ll: '#BE6576', skin: '#C89380' },
};

const PHOTO_MAP: Record<string, string> = {
  'doc-thorne': '/avatars/doc-jacob.jpg',
  'doc-jacob':  '/avatars/doc-jacob.jpg',
  'doc-lin':    '/avatars/doc-lin.jpg',
  'doc-vance':  '/avatars/doc-vance.jpg',
  'doc-chen':   '/avatars/doc-chen.jpg',
};

/* ───────────────────────────────────────────── HELPER FUNCTIONS ──── */
function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function ts() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ════════════════════════════════════════════════════════════════
   DIGITAL HUMAN VIDEO PANEL
   ════════════════════════════════════════════════════════════════ */
interface DigitalHumanPanelProps {
  persona: VirtualDoctorPersona;
  posture: DoctorPostureMode;
  isSpeaking: boolean;
  isMuted: boolean;
  activeWord: string;
  transcriptText: string;
  patientTranscript: string;
  showCaptions: boolean;
  isRecording: boolean;
  patientName: string;
  callDuration: number;
  isCallActive: boolean;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleRecording: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  isPlaying: boolean;
  speechRate: number;
  onSpeechRate: (r: number) => void;
  onToggleCaptions: () => void;
  aiModel: string;
  onVisionObservation?: (obs: VisionObservation) => void;
}

const DigitalHumanPanel: React.FC<DigitalHumanPanelProps> = ({
  persona, posture, isSpeaking, isMuted, activeWord, transcriptText,
  patientTranscript, showCaptions, isRecording, patientName, callDuration,
  isCallActive, onEndCall, onToggleMute, onToggleRecording, onPlay, onPause,
  onReplay, isPlaying, speechRate, onSpeechRate, onToggleCaptions, aiModel,
  onVisionObservation
}) => {
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef  = useRef<HTMLDivElement>(null);
  const [blink, setBlink] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [nodPhase, setNodPhase] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [mouthSpread, setMouthSpread] = useState(1.0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [viewportDims, setViewportDims] = useState({ w: 640, h: 520 });
  const [wavePhase, setWavePhase] = useState(0);

  if (is3DMode) {
    return (
      <ThreeDSpecialistCanvas
        persona={persona}
        posture={posture}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        activeWord={activeWord}
        transcriptText={transcriptText}
        patientTranscript={patientTranscript}
        isRecording={isRecording}
        showCaptions={showCaptions}
        aiModel={aiModel}
        callDuration={callDuration}
        isCallActive={isCallActive}
        onPlay={onPlay}
        onPause={onPause}
        onReplay={onReplay}
        onToggleMute={onToggleMute}
        isPlaying={isPlaying}
        speechRate={speechRate}
        onSpeechRate={onSpeechRate}
        onToggleCaptions={onToggleCaptions}
        onToggleRecording={onToggleRecording}
        onEndCall={onEndCall}
        onToggle2DMode={() => setIs3DMode(false)}
        is2DMode={false}
        onVisionObservation={onVisionObservation}
      />
    );
  }

  /* Blinking */
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      if (Math.random() > 0.6) setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 120); }, 300);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  /* Breathing */
  useEffect(() => {
    const t = setInterval(() => setBreathPhase(p => (p + 1) % 360), 40);
    return () => clearInterval(t);
  }, []);

  /* Nodding when listening */
  useEffect(() => {
    if (posture === 'listening') {
      const t = setInterval(() => setNodPhase(n => (n + 1) % 360), 50);
      return () => clearInterval(t);
    } else setNodPhase(0);
  }, [posture]);

  /* Audio waveform animation */
  useEffect(() => {
    if (isSpeaking || isRecording) {
      const t = setInterval(() => setWavePhase(p => (p + 1) % 360), 30);
      return () => clearInterval(t);
    }
  }, [isSpeaking, isRecording]);

  /* Lip-sync */
  useEffect(() => {
    if (!isSpeaking || isMuted) { setMouthOpen(0); setMouthSpread(1.0); return; }
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const e = now - start;
      const s1 = Math.sin((e / 1000) * Math.PI * 8.4);
      const s2 = Math.sin((e / 1000) * Math.PI * 13.8);
      const wave = Math.max(0, s1 * 0.72 + s2 * 0.28);
      const v = computeViseme(activeWord);
      let vOpen = 0.55, vSpread = 1.0;
      if (v === 'MBP') { vOpen = 0.02; vSpread = 0.96; }
      else if (v === 'OH') { vOpen = 0.88; vSpread = 0.84; }
      else if (v === 'EE') { vOpen = 0.42; vSpread = 1.24; }
      else if (v === 'FV') { vOpen = 0.26; vSpread = 1.04; }
      else if (v === 'LDT') { vOpen = 0.54; vSpread = 1.1; }
      else { vOpen = 0.6; vSpread = 1.02; }
      setMouthOpen(Math.min(1, Math.max(0.04, vOpen * (0.3 + 0.7 * wave))));
      setMouthSpread(vSpread);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isSpeaking, isMuted, activeWord]);

  /* Viewport resize observer */
  useEffect(() => {
    if (!viewportRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) if (e.contentRect)
        setViewportDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(viewportRef.current);
    return () => obs.disconnect();
  }, []);

  const mouthBox = useMemo(() => {
    const d = MOUTH_MAP[persona.id] || MOUTH_MAP['doc-thorne'];
    const { w: W, h: H } = viewportDims;
    if (!W || !H) return { left: `${d.x}%`, top: `${d.y}%`, width: 76, height: 38, data: d };
    let imgW = W, imgH = H, offX = 0, offY = 0;
    if (W > H) { imgW = W; imgH = W; offY = -(W - H) / 2; }
    else { imgH = H; imgW = H; offX = -(H - W) / 2; }
    return {
      left: `${offX + (d.x / 100) * imgW}px`,
      top:  `${offY + (d.y / 100) * imgH}px`,
      width: Math.max(56, (d.w / 100) * imgW),
      height: Math.max(28, (d.h / 100) * imgH),
      data: d
    };
  }, [persona.id, viewportDims]);

  const gazeTransform = () => {
    const breathOffset = Math.sin((breathPhase * Math.PI) / 180) * 1.8;
    const nodOffset    = posture === 'listening' ? Math.sin((nodPhase * Math.PI) / 180) * 2.5 : 0;
    let scale = 1.0, rotX = -mouseTilt.y * 0.45, rotY = mouseTilt.x * 0.45;
    let tY = breathOffset + nodOffset, tX = 0;
    if (posture === 'listening')   { scale = 1.02; tY += 1.5; }
    if (posture === 'alerting')    { scale = 1.035; tY += 2; }
    if (posture === 'reassuring')  { rotY -= 1.0; }
    if (posture === 'reviewing')   { tY += 4.5; tX += 2.5; rotX += 1.5; }
    return { transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${tY}px) translateX(${tX}px) scale(${scale})` };
  };

  const statusLabel = () => {
    if (isSpeaking && !isMuted) return { text: `${persona.name.split(',')[0]} is speaking`, dot: 'bg-emerald-400 animate-pulse' };
    if (isRecording)             return { text: 'Listening to you…', dot: 'bg-teal-400 animate-pulse' };
    switch (posture) {
      case 'greeting':   return { text: `${persona.name.split(',')[0]} is greeting you`, dot: 'bg-emerald-400' };
      case 'listening':  return { text: `${persona.name.split(',')[0]} is listening carefully`, dot: 'bg-teal-400 animate-pulse' };
      case 'explaining': return { text: `${persona.name.split(',')[0]} is explaining findings`, dot: 'bg-emerald-400' };
      case 'alerting':   return { text: 'Clinical safety advisory active', dot: 'bg-rose-400 animate-pulse' };
      case 'reassuring': return { text: `${persona.name.split(',')[0]} is reassuring you`, dot: 'bg-emerald-400' };
      default:           return { text: 'Secure consultation connected', dot: 'bg-emerald-400' };
    }
  };
  const status = statusLabel();
  const photoSrc = PHOTO_MAP[persona.id] || '/avatars/doc-jacob.jpg';

  /* Audio waveform bars */
  const waveBars = Array.from({ length: 28 }, (_, i) => {
    const active = isSpeaking || isRecording;
    const h = active
      ? Math.max(4, Math.abs(Math.sin(((wavePhase + i * 22) * Math.PI) / 180) * 28 + Math.sin(((wavePhase * 1.3 + i * 15) * Math.PI) / 180) * 14))
      : 4;
    return h;
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden"
      style={{ background: '#080808', border: '2px solid var(--border)' }}
      onMouseMove={e => {
        if (!containerRef.current) return;
        const r = containerRef.current.getBoundingClientRect();
        setMouseTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 6, y: ((e.clientY - r.top) / r.height - 0.5) * 6 });
      }}
      onMouseLeave={() => setMouseTilt({ x: 0, y: 0 })}
    >
      {/* ── TOP STATUS BAR ── */}
      <div className="absolute top-0 inset-x-0 z-30 p-3 flex items-center justify-between pointer-events-auto"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)' }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFE45C' }}>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            HEAL ENGINE · SECURE
          </div>
          {isCallActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold text-white"
              style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse he-keep-round" />
              REC {fmt(callDuration)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono text-white"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="w-1.5 h-1.5 rounded-full he-keep-round" style={{ background: persona.avatarColor || '#FFE45C' }} />
            <span className="font-bold">{persona.name.split(',')[0]}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>· {persona.specialty.split('&')[0].trim()}</span>
          </div>
          <button
            onClick={() => setIs3DMode(true)}
            className="px-2.5 py-1 text-[10px] font-mono font-bold cursor-pointer"
            style={{ background: '#FFE45C', color: '#080808', border: '1px solid #FFE45C' }}
            title="Switch back to 3D Digital Human Specialist"
          >
            3D SPECIALIST
          </button>
        </div>
      </div>

      {/* ── DOCTOR VIDEO STREAM ── */}
      <div ref={viewportRef} className="relative w-full overflow-hidden" style={{ height: '480px' }}>
        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
          style={gazeTransform()}>
          <img src={photoSrc} alt={persona.name}
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(1.04) contrast(1.03)' }}
          />
          {/* Eyelid blink overlay */}
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-100"
            style={{ background: 'rgba(15,20,35,0.42)', opacity: blink ? 0.85 : 0 }} />

          {/* Lip-Sync SVG overlay */}
          {isSpeaking && !isMuted && mouthOpen > 0.04 && (
            <div className="absolute pointer-events-none"
              style={{
                left: mouthBox.left, top: mouthBox.top,
                transform: `translate(-50%, -50%) scaleX(${mouthSpread}) scaleY(${1 + mouthOpen * 0.15})`,
                width: `${mouthBox.width}px`, height: `${mouthBox.height}px`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                transition: 'transform 75ms ease-out'
              }}>
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                <defs>
                  <filter id="lip-feather"><feGaussianBlur stdDeviation="0.7" /></filter>
                  <radialGradient id="oral-cav" cx="50%" cy="40%" r="55%">
                    <stop offset="0%"   stopColor="#120406" />
                    <stop offset="60%"  stopColor="#28090E" />
                    <stop offset="100%" stopColor="#3D1016" />
                  </radialGradient>
                  <linearGradient id="teeth-g" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stopColor="#FFFFFF" />
                    <stop offset="70%"  stopColor="#F5EFE6" />
                    <stop offset="100%" stopColor="#D5CBBF" />
                  </linearGradient>
                  <linearGradient id="ul-g" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stopColor={mouthBox.data.skin} stopOpacity="0.3" />
                    <stop offset="50%"  stopColor={mouthBox.data.ul}   stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#4A161C" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="ll-g" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stopColor="#4A161C" stopOpacity="0.9" />
                    <stop offset="40%"  stopColor={mouthBox.data.ll}   stopOpacity="0.95" />
                    <stop offset="100%" stopColor={mouthBox.data.skin} stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <ellipse cx="50" cy="25" rx={34 * mouthSpread} ry={Math.max(2, 16 * mouthOpen)} fill="url(#oral-cav)" />
                {mouthOpen > 0.1 && (
                  <path d={`M${50 - 24 * Math.min(1.1, mouthSpread)} 22 Q50 ${20 + mouthOpen * 2} ${50 + 24 * Math.min(1.1, mouthSpread)} 22 L${50 + 22 * Math.min(1.1, mouthSpread)} ${23 + Math.min(6, mouthOpen * 7)} Q50 ${24 + Math.min(7, mouthOpen * 8)} ${50 - 22 * Math.min(1.1, mouthSpread)} ${23 + Math.min(6, mouthOpen * 7)} Z`}
                    fill="url(#teeth-g)" opacity={Math.min(1, mouthOpen * 2.2)} />
                )}
                {mouthOpen > 0.42 && (
                  <path d={`M${50 - 18 * mouthSpread} ${25 + mouthOpen * 10} Q50 ${23 + mouthOpen * 8} ${50 + 18 * mouthSpread} ${25 + mouthOpen * 10} Q50 ${27 + mouthOpen * 11} ${50 - 18 * mouthSpread} ${25 + mouthOpen * 10} Z`}
                    fill="#8A3440" opacity={0.85} />
                )}
                <path d="M12 25 Q32 17 44 20 Q50 22 56 20 Q68 17 88 25 Q68 21 50 23 Q32 21 12 25 Z" fill="url(#ul-g)" filter="url(#lip-feather)" />
                <path d={`M14 25 Q50 ${23 + mouthOpen * 18} 86 25 Q50 ${30 + mouthOpen * 19} 14 25 Z`} fill="url(#ll-g)" filter="url(#lip-feather)" />
                <ellipse cx="50" cy={27 + mouthOpen * 16} rx="18" ry="2.2" fill="white" opacity="0.2" />
              </svg>
            </div>
          )}
        </div>

        {/* ── LIVE AUDIO WAVEFORM ── */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-end gap-[2px] z-20 pointer-events-none">
          {waveBars.map((h, i) => (
            <div key={i}
              style={{
                width: 3, height: `${h}px`,
                background: isRecording
                  ? `hsl(175, 80%, ${40 + i % 5 * 6}%)`
                  : (isSpeaking ? '#FFE45C' : 'rgba(255,255,255,0.2)'),
                borderRadius: 2,
                transition: 'height 80ms ease-out'
              }} />
          ))}
        </div>

        {/* ── STATUS PILL + CAPTIONS ── */}
        <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-2 pointer-events-none z-20 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono text-white"
            style={{ background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}>
            <span className={`w-2 h-2 rounded-full he-keep-round ${status.dot}`} />
            {status.text}
          </div>
          {showCaptions && transcriptText && (
            <div className="max-w-lg px-4 py-2 text-xs text-center text-white leading-relaxed"
              style={{ background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              "{transcriptText}"
            </div>
          )}
          {isRecording && patientTranscript && (
            <div className="max-w-md px-3 py-1 text-xs text-center font-mono animate-pulse"
              style={{ background: 'rgba(13,148,136,0.85)', color: '#CCFBF1', border: '1px solid rgba(13,148,136,0.5)' }}>
              <span className="font-bold">YOU: </span>{patientTranscript}
            </div>
          )}
        </div>

        {/* ── AI MODEL BADGE ── */}
        <div className="absolute top-14 right-3 z-20 text-[9px] font-mono px-2 py-0.5 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#FFE45C', border: '1px solid rgba(255,228,92,0.3)' }}>
          AI: {aiModel}
        </div>
      </div>

      {/* ── CONTROLS BAR ── */}
      <div className="relative z-30 p-3 flex flex-wrap items-center justify-between gap-2"
        style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Left: TTS controls */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button onClick={onPlay} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold cursor-pointer transition-all"
              style={{ background: '#FFE45C', color: '#080808', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              <Play className="w-3.5 h-3.5 fill-current" /> SPEAK
            </button>
          ) : (
            <button onClick={onPause} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold cursor-pointer"
              style={{ background: 'rgba(255,228,92,0.15)', color: '#FFE45C', border: '1.5px solid #FFE45C' }}>
              <Pause className="w-3.5 h-3.5" /> PAUSE
            </button>
          )}
          <button onClick={onReplay} title="Replay" className="p-2 cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToggleMute} title={isMuted ? 'Unmute' : 'Mute'} className="p-2 cursor-pointer"
            style={{ background: isMuted ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isMuted ? '#DC2626' : 'rgba(255,255,255,0.1)'}`, color: isMuted ? '#F87171' : 'rgba(255,255,255,0.7)' }}>
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          {/* Speed */}
          <div className="flex items-center text-[10px] font-mono"
            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
            {[0.8, 1.0, 1.25].map(r => (
              <button key={r} onClick={() => onSpeechRate(r)} className="px-2 py-1 cursor-pointer transition-colors"
                style={{ background: speechRate === r ? '#FFE45C' : 'transparent', color: speechRate === r ? '#080808' : 'rgba(255,255,255,0.6)', fontWeight: speechRate === r ? 'bold' : 'normal' }}>
                {r}x
              </button>
            ))}
          </div>
          <button onClick={onToggleCaptions} className="px-2.5 py-1.5 text-[10px] font-mono font-bold cursor-pointer"
            style={{ background: showCaptions ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.06)', color: showCaptions ? '#10B981' : 'rgba(255,255,255,0.5)', border: `1px solid ${showCaptions ? '#10B981' : 'rgba(255,255,255,0.1)'}` }}>
            CC {showCaptions ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Right: Mic + End Call */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleRecording}
            className="flex items-center gap-1.5 px-4 py-2 font-mono font-bold text-[11px] cursor-pointer transition-all"
            style={{
              background: isRecording ? 'rgba(220,38,38,0.9)' : 'rgba(13,148,136,0.2)',
              color: isRecording ? '#ffffff' : '#10B981',
              border: `1.5px solid ${isRecording ? '#DC2626' : '#10B981'}`,
              animation: isRecording ? 'pulse 1.5s infinite' : 'none'
            }}>
            {isRecording ? <><MicOff className="w-4 h-4" /> STOP</> : <><Mic className="w-4 h-4" /> SPEAK</>}
          </button>
          <button onClick={onEndCall} title="End consultation" className="p-2.5 cursor-pointer"
            style={{ background: '#DC2626', color: 'white', border: '1.5px solid #B91C1C', boxShadow: '0 0 12px rgba(220,38,38,0.4)' }}>
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   SOAP NOTE CARD
   ════════════════════════════════════════════════════════════════ */
const SoapNoteCard: React.FC<{ soap: SoapNote; patientName: string; specialistName: string }> = ({ soap, patientName, specialistName }) => {
  const sections: { key: 'subjective' | 'objective' | 'assessment' | 'plan'; label: string; color: string; icon: React.ReactNode }[] = [
    { key: 'subjective', label: 'S — Subjective', color: 'var(--teal)', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'objective',  label: 'O — Objective',  color: 'var(--amber)', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'assessment', label: 'A — Assessment', color: 'var(--danger)', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { key: 'plan',       label: 'P — Plan',       color: 'var(--success)', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '3px 3px 0 var(--border)' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--bg-paper)' }}>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: 'var(--text-ink)' }} />
          <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-ink)' }}>LIVE SOAP NOTE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 he-keep-round animate-pulse" />
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Auto-updating · {soap.lastUpdated}</span>
        </div>
      </div>
      <div className="p-4 space-y-3 text-xs">
        {sections.map(s => (
          <div key={s.key}>
            <div className="flex items-center gap-1.5 mb-1.5 font-mono font-bold uppercase text-[10px] tracking-wider" style={{ color: s.color }}>
              {s.icon}{s.label}
            </div>
            <ul className="space-y-1 pl-2">
              {soap[s.key].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5" style={{ color: 'var(--text-ink)' }}>
                  <span style={{ color: s.color, marginTop: 2 }}>▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 text-[10px] font-mono flex items-center gap-1.5" style={{ borderTop: '1px solid var(--rule)', color: 'var(--text-muted)' }}>
        <Stethoscope className="w-3 h-3" />
        Synthesized by {specialistName} · Reviewing {patientName}'s longitudinal record
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   SAFETY MATRIX CARD
   ════════════════════════════════════════════════════════════════ */
const SafetyMatrixCard: React.FC<{ entries: SafetyMatrixEntry[] }> = ({ entries }) => {
  const riskColor = (r: string) => {
    if (r === 'CRITICAL') return { bg: '#FEE2E2', text: '#991B1B', border: '#DC2626' };
    if (r === 'HIGH')     return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
    if (r === 'MODERATE') return { bg: '#FEF9C3', text: '#713F12', border: '#CA8A04' };
    return { bg: 'var(--bg-paper)', text: 'var(--text-muted)', border: 'var(--rule)' };
  };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '3px 3px 0 var(--border)' }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--bg-paper)' }}>
        <ShieldCheck className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-ink)' }}>KDIGO DRUG SAFETY MATRIX</span>
      </div>
      <div className="p-4 space-y-3 text-xs">
        {entries.map((e, i) => {
          const c = riskColor(e.risk);
          return (
            <div key={i} className="p-3 space-y-2" style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderLeft: `4px solid ${c.border}` }}>
              <div className="flex items-center justify-between">
                <div className="font-mono font-bold" style={{ color: c.text }}>
                  {e.drug1} <span className="opacity-60">+</span> {e.drug2}
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold" style={{ background: c.border, color: e.risk === 'CRITICAL' || e.risk === 'HIGH' ? '#fff' : '#080808' }}>
                  {e.risk}
                </span>
              </div>
              <p style={{ color: c.text, opacity: 0.9 }}>{e.mechanism}</p>
              <div className="flex items-start gap-1.5 pt-1" style={{ borderTop: `1px solid ${c.border}`, color: c.text, opacity: 0.8 }}>
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{e.recommendation}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   PHYSICIAN HANDOVER BRIEF (SBAR)
   ════════════════════════════════════════════════════════════════ */
const SbarCard: React.FC<{ patientName: string; physician: string; specialist: string; riskLevel: string; keyFindings: string[]; recommendations: string[] }> = ({
  patientName, physician, specialist, riskLevel, keyFindings, recommendations
}) => (
  <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '3px 3px 0 var(--border)' }}>
    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1.5px solid var(--border)', background: '#FFE45C' }}>
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-black" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-black">PHYSICIAN HANDOVER (SBAR)</span>
      </div>
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black text-yellow-300">{riskLevel}</span>
    </div>
    <div className="p-4 space-y-3 text-xs">
      <div className="font-mono text-[10px] space-y-0.5" style={{ color: 'var(--text-muted)' }}>
        <div>TO: <strong style={{ color: 'var(--text-ink)' }}>{physician}</strong></div>
        <div>FROM: <strong style={{ color: 'var(--text-ink)' }}>{specialist} (Virtual Consultation)</strong></div>
        <div>RE: <strong style={{ color: 'var(--text-ink)' }}>{patientName}</strong></div>
        <div>DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div>
        <div className="font-mono font-bold text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-ink)' }}>KEY FINDINGS</div>
        <ul className="space-y-1 pl-2">
          {keyFindings.map((f, i) => <li key={i} className="flex items-start gap-1.5" style={{ color: 'var(--text-ink)' }}><span style={{ color: 'var(--teal)' }}>▸</span>{f}</li>)}
        </ul>
      </div>
      <div>
        <div className="font-mono font-bold text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-ink)' }}>RECOMMENDED ACTIONS</div>
        <ol className="space-y-1 pl-2">
          {recommendations.map((r, i) => <li key={i} className="flex items-start gap-1.5" style={{ color: 'var(--text-ink)' }}><span className="font-mono font-bold text-[10px] shrink-0" style={{ color: 'var(--amber)', minWidth: 16 }}>{i + 1}.</span>{r}</li>)}
        </ol>
      </div>
    </div>
    <div className="px-4 py-2 text-[10px] font-mono" style={{ borderTop: '1px solid var(--rule)', color: 'var(--text-muted)' }}>
      Digitally composed by HEAL Engine AI · Clinical Intelligence OS v2.5
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   MAIN STUDIO COMPONENT
   ════════════════════════════════════════════════════════════════ */
interface AIVirtualSpecialistStudioProps {
  onNavigateTab?: (tab: string) => void;
}

export const AIVirtualSpecialistStudio: React.FC<AIVirtualSpecialistStudioProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const patient = getDynamicPatientProfile(user);
  const personas = virtualDoctorScreeningEngine.getPersonas(user);

  /* ── State ── */
  const [activePersonaId, setActivePersonaId] = useState(personas[0].id);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueTurn[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeWord, setActiveWord] = useState('');
  const [speakingText, setSpeakingText] = useState('');
  const [showCaptions, setShowCaptions] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [posture, setPosture] = useState<DoctorPostureMode>('greeting');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const [aiModel, setAiModel] = useState('LLM Clinical');
  const [activeTab, setActiveTab] = useState<'chat' | 'soap' | 'safety' | 'sbar' | 'report'>('chat');
  const [exportDone, setExportDone] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [visionNotes, setVisionNotes] = useState<string[]>([]);

  const handleVisionObservation = useCallback((obs: VisionObservation) => {
    if (obs.gesture === 'chest_touch' || obs.affect === 'pain_grimace') {
      setPosture('alerting');
      setVisionNotes(prev => {
        const note = `Vision Telemetry: ${obs.clinicalNote}`;
        return prev.includes(note) ? prev : [...prev, note];
      });
    } else if (obs.gesture === 'hand_raise_stop') {
      setPosture('listening');
    }
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const activePersona: VirtualDoctorPersona = useMemo(
    () => virtualDoctorScreeningEngine.getPersonaById(activePersonaId, user),
    [activePersonaId, user]
  );

  /* ── Dynamic SOAP note from dialogue ── */
  const soap: SoapNote = useMemo(() => {
    const patientTurns = dialogueHistory.filter(d => d.speaker === 'patient').map(d => d.text);
    const doctorObs    = dialogueHistory.flatMap(d => d.clinicalObservations || []);
    const patientFirst = patient.name.split(' ')[0];
    return {
      subjective: patientTurns.length > 0
        ? patientTurns.map((t, i) => `[${i + 1}] ${t}`)
        : [`No patient input received yet for ${patientFirst}`],
      objective: [
        `Blood Pressure: 138/86 mmHg (elevated baseline)`,
        `Heart Rate: 78 bpm (regular)`,
        `SpO₂: 97% (room air)`,
        `eGFR: 52 mL/min (↓ from baseline 64 — 18.7% drop)`,
        `NT-proBNP: 480 pg/mL (↑ from 180 pg/mL)`,
        `Medications: ${patient.medications.join(', ')}`,
        ...(visionNotes.length > 0 ? visionNotes : ['Vision Inspection: Patient seated upright, stable focused eye contact']),
      ],
      assessment: doctorObs.length > 0
        ? doctorObs
        : [
            `Risk Level: ${dialogueHistory.find(d => d.riskLevel)?.riskLevel || 'MODERATE'}`,
            `Active Conditions: ${patient.conditions.join(', ')}`,
            `Potential NSAID + ACEi nephrotoxic interaction flagged`,
          ],
      plan: [
        `Pause all oral NSAIDs immediately (Ibuprofen, Advil, Motrin)`,
        `Initiate topical Diclofenac 1% gel (knee analgesia — renal-safe)`,
        `Recheck eGFR, serum creatinine, and BMP in 7 days`,
        `Monitor daily AM weight; escalate if > 3 lb gain / 48 hours`,
        `Follow up with ${patient.primaryPhysician.split(' (')[0]} within 14 days`,
      ],
      lastUpdated: ts(),
    };
  }, [dialogueHistory, patient]);

  /* ── Safety Matrix ── */
  const safetyMatrix: SafetyMatrixEntry[] = useMemo(() => {
    const hasLisinopril = patient.medications.some(m => m.toLowerCase().includes('lisinopril'));
    const hasFurosemide = patient.medications.some(m => m.toLowerCase().includes('furosemide'));
    const entries: SafetyMatrixEntry[] = [];
    if (hasLisinopril) entries.push({
      drug1: 'Lisinopril (ACEi)',
      drug2: 'Ibuprofen / NSAIDs',
      mechanism: 'KDIGO Alert: NSAIDs constrict afferent arterioles while ACEi dilates efferent arterioles — creating a hemodynamic pinch (AKI risk).',
      risk: 'HIGH',
      recommendation: 'Substitute oral NSAIDs with topical Diclofenac 1% gel or Acetaminophen (paracetamol). Monitor eGFR.',
    });
    if (hasFurosemide) entries.push({
      drug1: 'Furosemide (Loop Diuretic)',
      drug2: 'NSAIDs / High Na⁺ Diet',
      mechanism: 'NSAIDs blunt the natriuretic effect of furosemide, reducing diuretic efficacy and causing fluid retention.',
      risk: 'MODERATE',
      recommendation: 'Restrict dietary sodium. Avoid concurrent NSAIDs. Reassess fluid status at 48-hour follow-up.',
    });
    entries.push({
      drug1: 'Empagliflozin (SGLT2i)',
      drug2: 'Volume depletion / Furosemide',
      mechanism: 'Additive volume depletion risk. SGLT2i increases glucosuria and promotes osmotic diuresis.',
      risk: 'LOW',
      recommendation: 'Monitor hydration status and renal function. Hold if eGFR drops below 45 mL/min.',
    });
    return entries;
  }, [patient.medications]);

  /* ── Call Timer ── */
  useEffect(() => {
    if (!isCallActive) return;
    const id = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [isCallActive]);

  /* ── Auto-scroll dialogue ── */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [dialogueHistory, isProcessing]);

  /* ── Send greeting on mount ── */
  useEffect(() => {
    const greeting = `Hello ${patient.name.split(' ')[0]}. I'm ${activePersona.name.split(',')[0]}, your HEAL Engine Virtual Specialist. I'm reviewing your health record alongside ${patient.primaryPhysician.split(' (')[0]}. How are you feeling today?`;
    const turn: DialogueTurn = {
      id: `d0`, speaker: 'doctor', text: greeting, time: ts(),
      quickReplies: ["I'm feeling okay today", "I have some joint or knee pain", "I have a question about my medications", "I feel some swelling or fatigue"],
    };
    setDialogueHistory([turn]);
    setSpeakingText(greeting);
    setTimeout(() => {
      setPosture('greeting');
      handlePlayText(greeting);
    }, 600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => { speechEngine.stop(); speechRecognitionEngine.stop(); }, []);

  /* ── Play TTS text ── */
  const handlePlayText = useCallback((text: string) => {
    if (isMuted) return;
    speechEngine.stop();
    setIsPlaying(true);
    setSpeakingText(text);
    speechEngine.speak(text, { pitch: activePersona.voicePitch, rate: speechRate, voiceName: activePersona.preferredVoiceName }, {
      onStart: () => setIsPlaying(true),
      onEnd:   () => { setIsPlaying(false); setActiveWord(''); },
      onWordBoundary: (_ci, _l, w) => setActiveWord(w),
      onError: () => setIsPlaying(false),
    });
  }, [activePersona, isMuted, speechRate]);

  /* ── Submit patient message to LLM ── */
  const handleSubmit = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || isProcessing) return;

    const patTurn: DialogueTurn = { id: `p${Date.now()}`, speaker: 'patient', text: msg, time: ts() };
    setDialogueHistory(prev => [...prev, patTurn]);
    setInputText('');
    setLiveTranscript('');
    setIsProcessing(true);
    speechEngine.stop();
    setPosture('listening');

    try {
      const token = localStorage.getItem('heal_token') || sessionStorage.getItem('heal_token');
      const res = await fetch('/api/screening/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          patientId: patient.id || 'patient-ev-68',
          message: msg,
          patientProfile: {
            name: patient.name, age: patient.age, gender: patient.gender,
            conditions: patient.conditions, medications: patient.medications,
            allergies: patient.allergies, primaryPhysician: patient.primaryPhysician,
          },
          personaId: activePersona.id, personaName: activePersona.name,
          specialty: activePersona.specialty,
          dialogueHistory: dialogueHistory.slice(-8).map(d => ({ speaker: d.speaker, text: d.text })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.provider) setAiModel(`${data.provider} (${data.model || 'v2'})`);

        const newPosture = data.requiresEmergency ? 'alerting'
          : data.safetyGateTriggered ? 'alerting'
          : data.riskLevel === 'HIGH_SUBACUTE' ? 'alerting'
          : data.riskLevel === 'MODERATE' ? 'explaining'
          : 'reassuring';
        setPosture(newPosture as DoctorPostureMode);

        if (data.requiresEmergency || data.riskLevel === 'CRITICAL') {
          setEmergencyAlert('🚨 EMERGENCY DETECTED — Please call 911 or go to your nearest emergency room immediately.');
        }

        const docTurn: DialogueTurn = {
          id: `dr${Date.now()}`, speaker: 'doctor', text: data.doctorResponse, time: ts(),
          quickReplies: data.suggestedReplies || data.suggestedQuickReplies,
          clinicalObservations: data.clinicalObservations,
          riskLevel: data.riskLevel,
          safetyAlert: data.safetyGateTriggered ? (data.safetyDetails || 'Clinical safety boundary triggered.') : undefined,
        };
        setDialogueHistory(prev => [...prev, docTurn]);
        setSpeakingText(data.doctorResponse);
        handlePlayText(data.doctorResponse);
      } else {
        throw new Error(`${res.status}`);
      }
    } catch {
      const lower = msg.toLowerCase();
      const isCritical = lower.includes('chest pain') || lower.includes('crushing');
      const isPain = lower.includes('pain') || lower.includes('knee') || lower.includes('ache');
      const isSwelling = lower.includes('swelling') || lower.includes('puffy') || lower.includes('ankle');
      const isMeds = lower.includes('medication') || lower.includes('pill') || lower.includes('advil');

      let reply = `Thank you for that, ${patient.name.split(' ')[0]}. I've noted this carefully in your health record. Please continue your prescribed medications as directed and contact your care team if symptoms change.`;
      let fPosture: DoctorPostureMode = 'reassuring';

      if (isCritical) {
        reply = `This is urgent. Please stop and call 911 or go to your nearest emergency room immediately. Chest pain needs immediate evaluation.`;
        fPosture = 'alerting';
        setEmergencyAlert('🚨 EMERGENCY — Please call 911 immediately.');
      } else if (isPain) {
        const hasCKD = patient.conditions.some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('ckd'));
        if (hasCKD)
          reply = `I hear you, ${patient.name.split(' ')[0]}. Joint pain can be very uncomfortable. However, because of your kidney condition and ${patient.medications[0] || 'blood pressure medication'}, oral pain relievers like Advil or Ibuprofen are not safe for you right now. A topical Diclofenac 1% gel delivers relief directly to the joint without affecting your kidneys. Would you like to explore that option?`;
        fPosture = 'explaining';
      } else if (isSwelling) {
        reply = `Ankle swelling or puffiness can be an important signal. I'm flagging this for immediate review by ${patient.primaryPhysician.split(' (')[0]}. Have you taken your morning medications today, especially your water pill?`;
        fPosture = 'alerting';
      } else if (isMeds) {
        reply = `I can help clarify your medications, ${patient.name.split(' ')[0]}. You are currently on ${patient.medications.join(', ')}. These work together to protect your heart and kidneys. Is there a specific one you have questions about?`;
        fPosture = 'explaining';
      }

      const fallback: DialogueTurn = {
        id: `fb${Date.now()}`, speaker: 'doctor', text: reply, time: ts(),
        quickReplies: isCritical
          ? ['Calling 911 now', 'Going to emergency room']
          : ['Tell me more', 'Can you explain further?', 'Thank you, noted'],
        clinicalObservations: ['Response synthesized via clinical rules engine (offline fallback)'],
        safetyAlert: isPain ? 'KDIGO Safety: Oral NSAIDs contraindicated with ACEi + CKD.' : undefined,
        riskLevel: isCritical ? 'CRITICAL' : isPain ? 'MODERATE' : 'LOW',
      };
      setPosture(fPosture);
      setDialogueHistory(prev => [...prev, fallback]);
      setSpeakingText(reply);
      handlePlayText(reply);
    } finally {
      setIsProcessing(false);
    }
  }, [activePersona, dialogueHistory, handlePlayText, isProcessing, patient]);

  /* ── Voice recording toggle ── */
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      speechRecognitionEngine.stop();
      setIsRecording(false);
      if (liveTranscript.trim()) handleSubmit(liveTranscript);
    } else {
      if (!speechRecognitionEngine.isSupported()) {
        alert('Voice recognition is not supported in this browser. Please type your message.');
        return;
      }
      speechEngine.stop();
      setIsPlaying(false);
      setIsRecording(true);
      setPosture('listening');
      setLiveTranscript('');
      speechRecognitionEngine.start({
        onStart: () => setIsRecording(true),
        onResult: (t, isFinal) => {
          setLiveTranscript(t);
          if (isFinal) { setIsRecording(false); handleSubmit(t); }
        },
        onError: () => setIsRecording(false),
        onEnd:   () => setIsRecording(false),
      });
    }
  }, [isRecording, liveTranscript, handleSubmit]);

  /* ── Persona change ── */
  const handlePersonaChange = (id: string) => {
    speechEngine.stop();
    setIsPlaying(false);
    setActivePersonaId(id);
    const greeting = `Hello ${patient.name.split(' ')[0]}. This is ${virtualDoctorScreeningEngine.getPersonaById(id, user).name.split(',')[0]}, switching to your consultation now. How can I help?`;
    const t: DialogueTurn = { id: `sw${Date.now()}`, speaker: 'doctor', text: greeting, time: ts(), quickReplies: ["Tell me about my medications", "My symptoms today", "I have a question"] };
    setDialogueHistory(prev => [...prev, t]);
    setPosture('greeting');
    setSpeakingText(greeting);
    setTimeout(() => handlePlayText(greeting), 300);
  };

  /* ── Export report ── */
  const handleExport = () => {
    const report = `
======================================================
HEAL ENGINE — AI VIRTUAL SPECIALIST CONSULTATION REPORT
======================================================
DATE: ${new Date().toLocaleString()}
PATIENT: ${patient.name} (${patient.age}Y / ${patient.gender})
CONSULTING SPECIALIST: ${activePersona.name} (${activePersona.specialty})
PRIMARY PHYSICIAN: ${patient.primaryPhysician.split(' (')[0]}
CALL DURATION: ${fmt(callDuration)}
AI ENGINE: ${aiModel}

SUBJECTIVE (Patient Reports):
${soap.subjective.map(s => `  · ${s}`).join('\n')}

OBJECTIVE (Baseline Data):
${soap.objective.map(s => `  · ${s}`).join('\n')}

ASSESSMENT:
${soap.assessment.map(s => `  · ${s}`).join('\n')}

PLAN:
${soap.plan.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

DRUG SAFETY MATRIX (KDIGO):
${safetyMatrix.map(e => `  ⚠ ${e.drug1} + ${e.drug2}: ${e.risk}\n     → ${e.recommendation}`).join('\n')}

PHYSICIAN HANDOVER (SBAR):
  Key Findings:
    · Acute eGFR decline: 64 → 52 mL/min (18.7%)
    · NT-proBNP elevation: 180 → 480 pg/mL
    · NSAID + ACEi interaction (HIGH RISK)
  Recommendations:
    1. Stop oral NSAIDs immediately
    2. Prescribe topical Diclofenac 1% gel
    3. Recheck renal panel (BMP/Creatinine/eGFR) in 7 days
    4. Monitor weight daily; escalate if >3 lb gain / 48 hours
    5. Schedule follow-up with ${patient.primaryPhysician.split(' (')[0]} within 14 days

SIGNATURE: HEAL Engine Clinical Intelligence OS v2.5
DISCLAIMER: This is an AI-assisted summary. Not a substitute for physician review.
======================================================
`;
    if (navigator.clipboard) navigator.clipboard.writeText(report);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 4000);
  };

  if (callEnded) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 mx-auto flex items-center justify-center"
          style={{ background: '#DCFCE7', border: '1.5px solid #15803D' }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text-ink)' }}>Consultation Complete</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Your session with {activePersona.name.split(',')[0]} has ended. Your notes have been added to your health timeline.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={handleExport} className="he-btn cursor-pointer">
            <Download className="w-4 h-4" /> EXPORT REPORT
          </button>
          {onNavigateTab && (
            <button onClick={() => onNavigateTab('timeline')} className="he-btn-ghost cursor-pointer">
              <Clock className="w-4 h-4" /> VIEW TIMELINE
            </button>
          )}
          <button onClick={() => { setCallEnded(false); setCallDuration(0); setIsCallActive(true); setDialogueHistory([]); }} className="he-btn-ghost cursor-pointer">
            <RotateCcw className="w-4 h-4" /> NEW SESSION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── PAGE HEADER ── */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '4px 4px 0 var(--border)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="he-badge" style={{ background: 'var(--text-ink)', color: 'var(--bg-surface)' }}>AI SPECIALIST</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 he-keep-round animate-pulse" />
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>LIVE · ENCRYPTED · HIPAA-SAFE</span>
          </div>
          <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-ink)' }}>
            AI Virtual Specialist — {patient.name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Personalized by longitudinal data · Real-time voice + LLM · Clinical SOAP synthesis
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExport} className="he-btn-ghost !py-1.5 !text-xs cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
          {onNavigateTab && (
            <button onClick={() => onNavigateTab('recovery')} className="he-btn-ghost !py-1.5 !text-xs cursor-pointer">
              <ArrowRight className="w-3.5 h-3.5" /> Care Plan
            </button>
          )}
        </div>
      </div>

      {/* ── EXPORT SUCCESS BANNER ── */}
      {exportDone && (
        <div className="p-3 flex items-center gap-2 text-xs font-mono font-bold"
          style={{ background: '#DCFCE7', border: '1.5px solid #15803D', color: '#166534' }}>
          <CheckCircle2 className="w-4 h-4" />
          Consultation report copied to clipboard and ready for clinical records.
        </div>
      )}

      {/* ── EMERGENCY ALERT ── */}
      {emergencyAlert && (
        <div className="p-4 flex items-center justify-between gap-3"
          style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderLeft: '6px solid #DC2626' }}>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#991B1B' }}>
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            {emergencyAlert}
          </div>
          <button onClick={() => setEmergencyAlert(null)} className="text-red-400 hover:text-red-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── SPECIALIST SWITCHER ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {personas.map(p => {
          const active = p.id === activePersonaId;
          return (
            <button key={p.id} onClick={() => handlePersonaChange(p.id)}
              className="p-3 text-left cursor-pointer transition-all"
              style={{
                background: active ? '#FFE45C' : 'var(--bg-surface)',
                border: `1.5px solid ${active ? 'var(--border)' : 'var(--rule)'}`,
                boxShadow: active ? '3px 3px 0 var(--border)' : 'none',
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-3 h-3 rounded-full he-keep-round shrink-0" style={{ background: p.avatarColor }} />
                <span className="text-[11px] font-bold font-display line-clamp-1" style={{ color: active ? '#080808' : 'var(--text-ink)' }}>{p.name.split(',')[0]}</span>
              </div>
              <div className="text-[10px] font-mono line-clamp-1" style={{ color: active ? '#080808' : 'var(--text-muted)' }}>{p.title}</div>
              <div className="text-[9px] font-mono mt-0.5 line-clamp-1" style={{ color: active ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)' }}>⚡ {p.clinicalFocus}</div>
            </button>
          );
        })}
      </div>

      {/* ── MAIN GRID: VIDEO + DOSSIER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ── LEFT: Digital Human Studio ── */}
        <div className="lg:col-span-7 space-y-3">
          <DigitalHumanPanel
            persona={activePersona}
            posture={posture}
            isSpeaking={isPlaying}
            isMuted={isMuted}
            activeWord={activeWord}
            transcriptText={speakingText}
            patientTranscript={liveTranscript}
            showCaptions={showCaptions}
            isRecording={isRecording}
            patientName={patient.name}
            callDuration={callDuration}
            isCallActive={isCallActive}
            isPlaying={isPlaying}
            speechRate={speechRate}
            aiModel={aiModel}
            onEndCall={() => { speechEngine.stop(); setIsCallActive(false); setCallEnded(true); }}
            onToggleMute={() => { if (!isMuted) { speechEngine.stop(); setIsPlaying(false); } setIsMuted(v => !v); }}
            onToggleRecording={handleToggleRecording}
            onPlay={() => handlePlayText(speakingText)}
            onPause={() => { speechEngine.pause(); setIsPlaying(false); }}
            onReplay={() => handlePlayText(speakingText)}
            onSpeechRate={r => { setSpeechRate(r); }}
            onToggleCaptions={() => setShowCaptions(v => !v)}
            onVisionObservation={handleVisionObservation}
          />

          {/* ── KARAOKE CAPTION BAR ── */}
          {showCaptions && speakingText && (
            <div className="p-4" style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 he-keep-round animate-pulse" />
                  LIVE TRANSCRIPT — {activePersona.name.split(',')[0]}
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5" style={{ background: 'var(--text-ink)', color: 'var(--bg-surface)' }}>
                  AI: {aiModel}
                </span>
              </div>
              <div className="text-sm leading-relaxed" style={{ background: 'var(--bg-paper)', padding: '10px 12px', border: '1px solid var(--rule)', minHeight: 52 }}>
                {speakingText.split(' ').map((w, i) => {
                  const isActive = activeWord.toLowerCase().replace(/[^a-z0-9]/g, '') === w.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return (
                    <span key={i} className="mr-1 transition-all inline-block"
                      style={isActive && isPlaying ? { background: '#FFE45C', color: '#080808', fontWeight: 'bold', padding: '0 2px', border: '1px solid var(--border)', transform: 'scale(1.05)' } : { color: 'var(--text-ink)' }}>
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CHAT INPUT PANEL ── */}
          <div className="p-4 space-y-3" style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '3px 3px 0 var(--border)' }}>
            {/* Quick Replies */}
            {dialogueHistory.length > 0 && dialogueHistory[dialogueHistory.length - 1].speaker === 'doctor' && dialogueHistory[dialogueHistory.length - 1].quickReplies && (
              <div className="flex flex-wrap gap-2">
                {dialogueHistory[dialogueHistory.length - 1].quickReplies!.map((qr, i) => (
                  <button key={i} onClick={() => handleSubmit(qr)} disabled={isProcessing}
                    className="px-3 py-1.5 text-xs font-mono font-bold cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: 'var(--bg-paper)', color: 'var(--text-ink)', border: '1px solid var(--border)', boxShadow: '2px 2px 0 var(--border)' }}>
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Text input row */}
            <div className="flex items-center gap-2">
              <button onClick={handleToggleRecording} title={isRecording ? 'Stop recording' : 'Start voice input'}
                className="p-3 cursor-pointer transition-all shrink-0 flex items-center gap-1.5 font-mono font-bold text-[11px]"
                style={{
                  background: isRecording ? '#DC2626' : 'var(--bg-paper)',
                  color: isRecording ? '#fff' : 'var(--text-ink)',
                  border: `1.5px solid ${isRecording ? '#DC2626' : 'var(--border)'}`,
                  boxShadow: `2px 2px 0 ${isRecording ? '#B91C1C' : 'var(--border)'}`,
                }}>
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={isRecording ? liveTranscript : inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(inputText); }}}
                disabled={isProcessing || isRecording}
                placeholder={isRecording ? '🎤 Listening…' : `Type your message to ${activePersona.name.split(',')[0]}…`}
                className="he-input flex-1"
              />
              <button
                onClick={() => handleSubmit(inputText)}
                disabled={!inputText.trim() || isProcessing || isRecording}
                className="he-btn !py-3 cursor-pointer disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                <span className="w-2 h-2 rounded-full he-keep-round bg-teal-500 animate-ping" />
                {activePersona.name.split(',')[0]} is reviewing your response and checking clinical safety rules…
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Clinical Dossier ── */}
        <div className="lg:col-span-5 space-y-3">
          {/* Dialogue History */}
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '3px 3px 0 var(--border)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--bg-paper)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--text-ink)' }} />
              <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-ink)' }}>CONSULTATION DIALOGUE</span>
              <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{dialogueHistory.length} turns</span>
            </div>
            <div ref={scrollRef} className="overflow-y-auto p-3 space-y-3" style={{ maxHeight: 320 }}>
              {dialogueHistory.map(turn => (
                <div key={turn.id} className={`flex flex-col ${turn.speaker === 'patient' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
                      {turn.speaker === 'doctor' ? activePersona.name.split(',')[0] : 'You'}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>· {turn.time}</span>
                    {turn.riskLevel && turn.riskLevel !== 'LOW' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5"
                        style={{ background: turn.riskLevel === 'CRITICAL' ? '#DC2626' : turn.riskLevel === 'HIGH_SUBACUTE' ? '#F59E0B' : '#FEF3C7', color: turn.riskLevel === 'CRITICAL' ? '#fff' : '#92400E' }}>
                        {turn.riskLevel}
                      </span>
                    )}
                  </div>
                  <div className="max-w-[88%] p-3 text-xs leading-relaxed"
                    style={{
                      background: turn.speaker === 'patient' ? '#FFE45C' : 'var(--bg-paper)',
                      color: turn.speaker === 'patient' ? '#080808' : 'var(--text-ink)',
                      border: `1.5px solid ${turn.speaker === 'patient' ? 'var(--border)' : 'var(--rule)'}`,
                      boxShadow: `2px 2px 0 var(--border)`,
                    }}>
                    {turn.text}
                    {turn.clinicalObservations && turn.clinicalObservations.length > 0 && (
                      <div className="mt-2 pt-1.5 flex flex-wrap gap-1" style={{ borderTop: '1px solid var(--rule)' }}>
                        {turn.clinicalObservations.map((o, i) => (
                          <span key={i} className="text-[9px] font-mono px-1.5 py-0.5"
                            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--rule)' }}>{o}</span>
                        ))}
                      </div>
                    )}
                    {turn.safetyAlert && (
                      <div className="mt-2 p-2 flex items-start gap-1.5 text-[10px]"
                        style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderLeft: '3px solid #F59E0B', color: '#92400E' }}>
                        <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{turn.safetyAlert}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 text-[11px] font-mono p-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-2 h-2 rounded-full he-keep-round bg-teal-500 animate-ping" />
                  {activePersona.name.split(',')[0]} is synthesizing your clinical response…
                </div>
              )}
            </div>
          </div>

          {/* ── DOSSIER TABS ── */}
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', boxShadow: '3px 3px 0 var(--border)' }}>
            <div className="flex items-center overflow-x-auto" style={{ borderBottom: '1.5px solid var(--border)' }}>
              {([
                { id: 'soap',   label: 'SOAP Note',    icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'safety', label: 'Safety Matrix', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { id: 'sbar',   label: 'Handover',      icon: <Stethoscope className="w-3.5 h-3.5" /> },
              ] as const).map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors flex-shrink-0"
                  style={{
                    background: activeTab === t.id ? '#FFE45C' : 'transparent',
                    color: activeTab === t.id ? '#080808' : 'var(--text-muted)',
                    borderBottom: activeTab === t.id ? '2px solid var(--border)' : '2px solid transparent',
                  }}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
            <div>
              {activeTab === 'soap'   && <SoapNoteCard soap={soap} patientName={patient.name} specialistName={activePersona.name.split(',')[0]} />}
              {activeTab === 'safety' && <SafetyMatrixCard entries={safetyMatrix} />}
              {activeTab === 'sbar'   && (
                <SbarCard
                  patientName={patient.name}
                  physician={patient.primaryPhysician.split(' (')[0]}
                  specialist={activePersona.name}
                  riskLevel={dialogueHistory.find(d => d.riskLevel && d.riskLevel !== 'LOW')?.riskLevel || 'MODERATE'}
                  keyFindings={[
                    'Acute eGFR decline: 64 → 52 mL/min (18.7% drop)',
                    'NT-proBNP elevation: 180 → 480 pg/mL',
                    `NSAID + ACEi concurrent use (HIGH RISK — KDIGO guideline violation)`,
                    `Patient reported: ${dialogueHistory.filter(d => d.speaker === 'patient').map(d => d.text.slice(0, 40)).join('; ') || 'ongoing symptom monitoring'}`,
                  ]}
                  recommendations={soap.plan}
                />
              )}
            </div>
          </div>

          {/* ── Export Button ── */}
          <button onClick={handleExport} className="w-full he-btn justify-center cursor-pointer">
            <Download className="w-4 h-4" />
            EXPORT COMPLETE CONSULTATION REPORT
          </button>

          {/* ── Quick Bio-Stats ── */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'eGFR', value: '52', unit: 'mL/min', alert: true },
              { label: 'NT-proBNP', value: '480', unit: 'pg/mL', alert: true },
              { label: 'BP', value: '138/86', unit: 'mmHg', alert: false },
              { label: 'HR', value: '78', unit: 'bpm', alert: false },
            ].map((s, i) => (
              <div key={i} className="p-2 text-center"
                style={{
                  background: s.alert ? '#FEF3C7' : 'var(--bg-paper)',
                  border: `1px solid ${s.alert ? '#F59E0B' : 'var(--rule)'}`,
                }}>
                <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                <div className="font-bold font-display text-base" style={{ color: s.alert ? '#92400E' : 'var(--text-ink)' }}>{s.value}</div>
                <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{s.unit}</div>
                {s.alert && <div className="text-[9px] font-mono font-bold" style={{ color: '#DC2626' }}>▲ ALERT</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVirtualSpecialistStudio;
