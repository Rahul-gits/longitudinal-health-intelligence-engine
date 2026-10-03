import React, { useEffect, useState, useRef, useMemo } from 'react';
import { DoctorPostureMode, VirtualDoctorPersona } from '../../types/health';
import { useAuth } from '../../context/AuthContext';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  FileText, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Users,
  Camera
} from 'lucide-react';

interface DigitalHumanConsultationViewProps {
  persona: VirtualDoctorPersona;
  posture: DoctorPostureMode;
  isSpeaking: boolean;
  isMuted: boolean;
  activeWord?: string;
  transcriptText?: string;
  patientTranscript?: string;
  patientName?: string;
  onSelectPosture?: (posture: DoctorPostureMode) => void;
  onSelectPersona?: (personaId: string) => void;
  onToggleMute?: () => void;
  onEndCall?: () => void;
  clinicalContext?: {
    title: string;
    description: string;
    severity?: 'warning' | 'info' | 'success';
    keyFindings?: Array<{ label: string; value: string; note?: string }>;
  };
}

export type VisemeShape = 'SIL' | 'OH' | 'EE' | 'MBP' | 'FV' | 'LDT' | 'REST_TALK';

const DOCTOR_PHOTO_MAP: Record<string, string> = {
  'doc-thorne': '/avatars/doc-jacob.jpg',
  'doc-jacob': '/avatars/doc-jacob.jpg',
  'doc-lin': '/avatars/doc-lin.jpg',
  'doc-vance': '/avatars/doc-vance.jpg',
  'doc-chen': '/avatars/doc-chen.jpg'
};

interface DoctorMouthLandmarks {
  x: number; // percentage in image (0-100)
  y: number; // percentage in image (0-100)
  widthPct: number;
  heightPct: number;
  upperLipTone: string;
  lowerLipTone: string;
  skinBlendTone: string;
}

const DOCTOR_MOUTH_MAP: Record<string, DoctorMouthLandmarks> = {
  'doc-thorne': { x: 50.5, y: 38.6, widthPct: 10.2, heightPct: 5.0, upperLipTone: '#7D3B43', lowerLipTone: '#9E4E58', skinBlendTone: '#6E3C32' },
  'doc-jacob': { x: 50.5, y: 38.6, widthPct: 10.2, heightPct: 5.0, upperLipTone: '#7D3B43', lowerLipTone: '#9E4E58', skinBlendTone: '#6E3C32' },
  'doc-lin': { x: 51.4, y: 40.7, widthPct: 9.4, heightPct: 4.6, upperLipTone: '#A84C60', lowerLipTone: '#C66579', skinBlendTone: '#D49B86' },
  'doc-vance': { x: 48.6, y: 38.5, widthPct: 10.0, heightPct: 4.8, upperLipTone: '#763842', lowerLipTone: '#944A54', skinBlendTone: '#723F36' },
  'doc-chen': { x: 49.7, y: 28.8, widthPct: 9.2, heightPct: 4.4, upperLipTone: '#A04E60', lowerLipTone: '#BE6576', skinBlendTone: '#C89380' }
};

function computeVisemeFromWord(word: string): VisemeShape {
  if (!word || !word.trim()) return 'REST_TALK';
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 'REST_TALK';

  if (/^[mbp]/.test(clean) || /(mb|mp|bb|pp)$/.test(clean)) return 'MBP';
  if (/^[fv]/.test(clean) || clean.includes('ph')) return 'FV';
  if (/(oo|ou|ow|aw|au|[ou])/.test(clean)) return 'OH';
  if (/(ee|ea|ai|ay|ey|[ie])/.test(clean)) return 'EE';
  if (/^[ldtnsz]/.test(clean) || clean.includes('th') || clean.includes('ch') || clean.includes('sh')) return 'LDT';

  return 'REST_TALK';
}

export const DigitalHumanConsultationView: React.FC<DigitalHumanConsultationViewProps> = ({
  persona,
  posture,
  isSpeaking,
  isMuted,
  activeWord = '',
  transcriptText = '',
  patientTranscript = '',
  patientName,
  onSelectPosture,
  onSelectPersona,
  onToggleMute,
  onEndCall,
  clinicalContext
}) => {
  const { user } = useAuth();
  const displayPatientName = patientName || user?.fullName || 'Rahul Gunda';

  // Human Physiological Simulation States
  const [blink, setBlink] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [nodPhase, setNodPhase] = useState<number>(0);
  const [mouthOpen, setMouthOpen] = useState<number>(0);
  const [mouthSpread, setMouthSpread] = useState<number>(1.0);
  const [currentViseme, setCurrentViseme] = useState<VisemeShape>('SIL');
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Call Controls State
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showContextDrawer, setShowContextDrawer] = useState<boolean>(false);
  const [useRealWebcam, setUseRealWebcam] = useState<boolean>(false);
  const [showSpecialistPicker, setShowSpecialistPicker] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportDims, setViewportDims] = useState<{ width: number; height: number }>({ width: 640, height: 600 });

  // Dynamic Viewport Measurement for Pixel-Perfect Facial Alignment
  useEffect(() => {
    if (!viewportRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setViewportDims({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute exact coordinates of doctor's mouth relative to rendered viewport
  const mouthBox = useMemo(() => {
    const data = DOCTOR_MOUTH_MAP[persona.id] || DOCTOR_MOUTH_MAP['doc-thorne'];
    const W = viewportDims.width;
    const H = viewportDims.height;
    if (!W || !H) {
      return {
        left: `${data.x}%`,
        top: `${data.y}%`,
        width: 76,
        height: 38,
        data
      };
    }

    let imgW = W;
    let imgH = H;
    let offX = 0;
    let offY = 0;

    if (W > H) {
      // Landscape: image scales to width, cropped vertically
      imgW = W;
      imgH = W;
      offY = -(W - H) / 2;
    } else {
      // Portrait: image scales to height, cropped horizontally
      imgH = H;
      imgW = H;
      offX = -(H - W) / 2;
    }

    const cx = offX + (data.x / 100) * imgW;
    const cy = offY + (data.y / 100) * imgH;
    const bw = (data.widthPct / 100) * imgW;
    const bh = (data.heightPct / 100) * imgH;

    return {
      left: `${cx}px`,
      top: `${cy}px`,
      width: Math.max(56, bw),
      height: Math.max(28, bh),
      data
    };
  }, [persona.id, viewportDims]);

  // 1. Natural Blinking Engine (every 3.2 - 4.5s with occasional double-blinks)
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);

      // 40% probability of human micro double-blink
      if (Math.random() > 0.6) {
        setTimeout(() => {
          setBlink(true);
          setTimeout(() => setBlink(false), 120);
        }, 280);
      }
    }, 3800);

    return () => clearInterval(blinkTimer);
  }, []);

  // 2. Organic Breathing Cycle (sinusoidal continuous curve)
  useEffect(() => {
    const breathTimer = setInterval(() => {
      setBreathPhase(p => (p + 1) % 360);
    }, 40);
    return () => clearInterval(breathTimer);
  }, []);

  // 3. Attentive Listening Nodding (subtle nodding when patient is speaking)
  useEffect(() => {
    if (posture === 'listening') {
      const nodTimer = setInterval(() => {
        setNodPhase(n => (n + 1) % 360);
      }, 50);
      return () => clearInterval(nodTimer);
    } else {
      setNodPhase(0);
    }
  }, [posture]);

  // 4. Real-time Syllabic Viseme & Lip Sync Engine (Continuous fluid speech articulation)
  useEffect(() => {
    if (!isSpeaking || isMuted) {
      setMouthOpen(0);
      setMouthSpread(1.0);
      setCurrentViseme('SIL');
      return;
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const animateLipSync = (now: number) => {
      const elapsed = now - startTime;

      // Human speech syllable rhythm (~4.2 Hz primary cadence with micro-flutter)
      const primaryOsc = Math.sin((elapsed / 1000) * Math.PI * 8.4);
      const secondaryOsc = Math.sin((elapsed / 1000) * Math.PI * 13.8);
      const syllableWave = Math.max(0, (primaryOsc * 0.72 + secondaryOsc * 0.28));

      // Viseme phoneme configuration
      const viseme = computeVisemeFromWord(activeWord);
      setCurrentViseme(viseme);

      let visemeOpen = 0.55;
      let visemeSpread = 1.0;

      switch (viseme) {
        case 'MBP': // Lips pressed closed on bilabial plosives (M, B, P)
          visemeOpen = 0.02;
          visemeSpread = 0.96;
          break;
        case 'OH': // Rounded open vowels (O, OO, U)
          visemeOpen = 0.88;
          visemeSpread = 0.84;
          break;
        case 'EE': // Wide smile vowels (E, EE, AY)
          visemeOpen = 0.42;
          visemeSpread = 1.24;
          break;
        case 'FV': // Labiodental fricatives (F, V)
          visemeOpen = 0.26;
          visemeSpread = 1.04;
          break;
        case 'LDT': // Lingual / alveolar (L, D, T, S, Z)
          visemeOpen = 0.54;
          visemeSpread = 1.1;
          break;
        default: // Fluid speech vowel-consonant flow
          visemeOpen = 0.6;
          visemeSpread = 1.02;
      }

      // Continuous dynamic aperture combining syllable wave and phoneme target
      const targetAperture = Math.min(1.0, Math.max(0.04, visemeOpen * (0.3 + 0.7 * syllableWave)));
      setMouthOpen(targetAperture);
      setMouthSpread(visemeSpread);

      animationFrameId = requestAnimationFrame(animateLipSync);
    };

    animationFrameId = requestAnimationFrame(animateLipSync);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isMuted, activeWord]);

  // 5. Optional Real Webcam Stream Connection
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useRealWebcam && isCameraOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => setUseRealWebcam(false));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [useRealWebcam, isCameraOn]);

  // Subtle Mouse Parallax Depth
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  // Human Head Motion & Eye Gaze Physics
  const getGazeAndTransform = () => {
    const breathOffset = Math.sin((breathPhase * Math.PI) / 180) * 2;
    const nodOffset = posture === 'listening' ? Math.sin((nodPhase * Math.PI) / 180) * 2.5 : 0;

    let baseScale = 1.0;
    let rotateX = -mouseTilt.y * 0.5;
    let rotateY = mouseTilt.x * 0.5;
    let translateY = breathOffset + nodOffset;
    let translateX = 0;

    switch (posture) {
      case 'greeting':
        baseScale = 1.01;
        break;
      case 'listening':
        // Attentive forward posture, direct eye contact
        baseScale = 1.02;
        translateY += 1.5;
        break;
      case 'understanding':
        // Subtle thoughtful tilt
        rotateY += 1.2;
        break;
      case 'reviewing':
        // Gaze shifts down and slightly right toward notes/chart
        translateY += 4.5;
        translateX += 2.5;
        rotateX += 1.5;
        break;
      case 'explaining':
        // Centered eye contact, lively micro movements
        baseScale = 1.01;
        break;
      case 'alerting':
        // Calm, serious direct eye contact, slightly forward
        baseScale = 1.03;
        translateY += 2;
        break;
      case 'reassuring':
        // Warm, relaxed slight head tilt
        rotateY -= 1.0;
        break;
    }

    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px) translateX(${translateX}px) scale(${baseScale})`
    };
  };

  // Human Behavior Status Text
  const getHumanStatus = () => {
    if (isSpeaking && !isMuted) {
      return {
        text: `${persona.name.split(',')[0]} is speaking`,
        dotColor: 'bg-emerald-400 animate-pulse'
      };
    }
    switch (posture) {
      case 'greeting':
        return { text: `${persona.name.split(',')[0]} is greeting you`, dotColor: 'bg-emerald-400' };
      case 'listening':
        return { text: `${persona.name.split(',')[0]} is listening...`, dotColor: 'bg-cyan-400 animate-pulse' };
      case 'understanding':
        return { text: 'Understanding your symptoms...', dotColor: 'bg-amber-400 animate-pulse' };
      case 'reviewing':
        return { text: 'Reviewing your health history & medications...', dotColor: 'bg-amber-400 animate-pulse' };
      case 'explaining':
        return { text: `${persona.name.split(',')[0]} is explaining findings`, dotColor: 'bg-emerald-400' };
      case 'alerting':
        return { text: 'Clinical safety advisory', dotColor: 'bg-rose-400' };
      case 'reassuring':
        return { text: `${persona.name.split(',')[0]} is reassuring you`, dotColor: 'bg-violet-400' };
      default:
        return { text: 'Connected in secure consultation', dotColor: 'bg-emerald-400' };
    }
  };

  const humanStatus = getHumanStatus();
  const doctorPhotoSrc = DOCTOR_PHOTO_MAP[persona.id] || '/avatars/doc-jacob.jpg';

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[520px] md:h-[580px] bg-[#0A0D14] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col justify-between select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP STATUS BAR (Clean, non-distracting consultation header)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white pointer-events-auto">
        {/* Left: Secure Session Indicator */}
        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">HEAL ENGINE</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            SECURE CONSULTATION
          </span>
        </div>

        {/* Right: Active Specialist Badge */}
        <div className="relative">
          <button
            onClick={() => setShowSpecialistPicker(!showSpecialistPicker)}
            className="flex items-center space-x-2 bg-black/60 backdrop-blur-md hover:bg-black/80 px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-white transition-all cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{persona.name.split(',')[0]}</span>
            <span className="text-white/50 text-[11px]">({persona.specialty.split('&')[0].trim()})</span>
            <ChevronRight className="w-3 h-3 text-white/50" />
          </button>

          {/* Specialist Quick Switcher Dropdown */}
          {showSpecialistPicker && onSelectPersona && (
            <div className="absolute top-10 right-0 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Clinical Specialist
              </div>
              {[
                { id: 'doc-thorne', name: 'Dr. Jacob Jones, MD', role: 'Cardiorenal Medicine' },
                { id: 'doc-lin', name: 'Dr. Maya Lin, PharmD', role: 'Clinical Pharmacology' },
                { id: 'doc-vance', name: 'Dr. Marcus Vance, MD', role: 'Family Medicine' },
                { id: 'doc-chen', name: 'Dr. Sarah Chen, MD', role: 'Nephrology' }
              ].map(spec => (
                <button
                  key={spec.id}
                  onClick={() => {
                    onSelectPersona(spec.id);
                    setShowSpecialistPicker(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    persona.id === spec.id ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{spec.name}</div>
                    <div className="text-[10px] text-slate-400">{spec.role}</div>
                  </div>
                  {persona.id === spec.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CENTRAL DIGITAL HUMAN VIDEO STREAM
      ───────────────────────────────────────────────────────────── */}
      <div 
        ref={viewportRef}
        className="relative w-full flex-1 flex items-center justify-center overflow-hidden"
      >
        {/* Main Specialist Full-Frame Photo with Motion Engine */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
          style={getGazeAndTransform()}
        >
          <img 
            src={doctorPhotoSrc}
            alt={persona.name}
            className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.02]"
          />

          {/* Realistic Eyelid Blink Overlay */}
          <div 
            className={`absolute inset-0 bg-slate-900/40 pointer-events-none transition-opacity duration-100 ${
              blink ? 'opacity-85' : 'opacity-0'
            }`}
          />

          {/* High-Fidelity Anatomical Lip Sync & Oral Articulation Component */}
          {isSpeaking && !isMuted && mouthOpen > 0.04 && (
            <div 
              className="absolute pointer-events-none transition-transform duration-75 ease-out"
              style={{
                left: mouthBox.left,
                top: mouthBox.top,
                transform: `translate(-50%, -50%) scaleX(${mouthSpread}) scaleY(${1 + mouthOpen * 0.15})`,
                width: `${mouthBox.width}px`,
                height: `${mouthBox.height}px`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))'
              }}
            >
              <svg 
                viewBox="0 0 100 50" 
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <filter id="lip-feather" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.7" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <radialGradient id="oral-cavity-grad" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#120406" />
                    <stop offset="60%" stopColor="#28090E" />
                    <stop offset="100%" stopColor="#3D1016" />
                  </radialGradient>

                  <linearGradient id="teeth-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="70%" stopColor="#F5EFE6" />
                    <stop offset="100%" stopColor="#D5CBBF" />
                  </linearGradient>

                  <linearGradient id="upper-lip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={mouthBox.data.skinBlendTone} stopOpacity="0.35" />
                    <stop offset="50%" stopColor={mouthBox.data.upperLipTone} stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#4A161C" stopOpacity="1" />
                  </linearGradient>

                  <linearGradient id="lower-lip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4A161C" stopOpacity="0.9" />
                    <stop offset="40%" stopColor={mouthBox.data.lowerLipTone} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={mouthBox.data.skinBlendTone} stopOpacity="0.35" />
                  </linearGradient>
                </defs>

                {/* 1. Underlying Oral Cavity */}
                <ellipse 
                  cx="50" 
                  cy="25" 
                  rx={34 * mouthSpread} 
                  ry={Math.max(2, 16 * mouthOpen)} 
                  fill="url(#oral-cavity-grad)" 
                />

                {/* 2. Pearlescent Upper Teeth Row */}
                {mouthOpen > 0.1 && (
                  <path 
                    d={`M ${50 - 24 * Math.min(1.1, mouthSpread)} 22 
                        Q 50 ${20 + mouthOpen * 2} ${50 + 24 * Math.min(1.1, mouthSpread)} 22 
                        L ${50 + 22 * Math.min(1.1, mouthSpread)} ${23 + Math.min(6, mouthOpen * 7)} 
                        Q 50 ${24 + Math.min(7, mouthOpen * 8)} ${50 - 22 * Math.min(1.1, mouthSpread)} ${23 + Math.min(6, mouthOpen * 7)} Z`}
                    fill="url(#teeth-grad)"
                    opacity={Math.min(1, mouthOpen * 2.2)}
                  />
                )}

                {/* 3. Subtle Lower Teeth / Tongue Arc */}
                {mouthOpen > 0.42 && (
                  <path 
                    d={`M ${50 - 18 * mouthSpread} ${25 + mouthOpen * 10} 
                        Q 50 ${23 + mouthOpen * 8} ${50 + 18 * mouthSpread} ${25 + mouthOpen * 10} 
                        Q 50 ${27 + mouthOpen * 11} ${50 - 18 * mouthSpread} ${25 + mouthOpen * 10} Z`}
                    fill="#8A3440"
                    opacity={0.85}
                  />
                )}

                {/* 4. Natural Upper Lip with Cupid's Bow */}
                <path 
                  d={`M 12 25 
                      Q 32 17 44 20 
                      Q 50 22 56 20 
                      Q 68 17 88 25 
                      Q 68 21 50 23 
                      Q 32 21 12 25 Z`}
                  fill="url(#upper-lip-grad)"
                  filter="url(#lip-feather)"
                />

                {/* 5. Articulating Lower Lip */}
                <path 
                  d={`M 14 25 
                      Q 50 ${23 + mouthOpen * 18} 86 25 
                      Q 50 ${30 + mouthOpen * 19} 14 25 Z`}
                  fill="url(#lower-lip-grad)"
                  filter="url(#lip-feather)"
                />

                {/* 6. Soft Specular Light Reflection on Lower Lip */}
                <ellipse 
                  cx="50" 
                  cy={27 + mouthOpen * 16} 
                  rx="18" 
                  ry="2.2" 
                  fill="white" 
                  opacity="0.22" 
                />
              </svg>
            </div>
          )}
        </div>

        {/* Dynamic Human State Subtitle Pill (Docked cleanly above controls) */}
        <div className="absolute bottom-14 inset-x-0 flex flex-col items-center pointer-events-none z-20 px-4">
          <div className="inline-flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-white shadow-lg">
            <span className={`w-2 h-2 rounded-full ${humanStatus.dotColor}`} />
            <span className="font-medium text-slate-100">{humanStatus.text}</span>
          </div>

          {/* Closed Captions Live Spoken Transcript */}
          {showCaptions && transcriptText && (
            <div className="mt-2 max-w-lg bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-xs text-center shadow-xl leading-relaxed">
              <span className="text-slate-300">"{transcriptText}"</span>
            </div>
          )}

          {/* Patient Spoken Live ASR Transcript */}
          {posture === 'listening' && patientTranscript && (
            <div className="mt-2 max-w-md bg-cyan-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-400/30 text-cyan-200 text-xs text-center shadow-lg animate-pulse">
              <span className="font-semibold text-cyan-400">You: </span>
              <span>"{patientTranscript}"</span>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. PICTURE-IN-PICTURE (Patient Webcam / Self-View)
        ───────────────────────────────────────────────────────────── */}
        <div className="absolute bottom-20 right-4 w-36 h-28 md:w-44 md:h-32 bg-slate-900 rounded-xl overflow-hidden border-2 border-white/40 shadow-2xl z-30 transition-all hover:scale-105 group">
          {isCameraOn ? (
            useRealWebcam ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <img 
                src="/avatars/patient-eleanor.jpg" 
                alt={`You (${displayPatientName})`} 
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
              <VideoOff className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Camera Off</span>
            </div>
          )}

          {/* Self-view Header & Live Switcher */}
          <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] font-mono text-white/90">
            <span className="bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-slate-200 font-semibold">
              YOU
            </span>
            <button 
              onClick={() => setUseRealWebcam(!useRealWebcam)}
              className="bg-black/70 hover:bg-black/90 p-1 rounded text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
              title={useRealWebcam ? 'Switch to Simulation Photo' : 'Use Live Webcam'}
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[9px] text-white/80 bg-black/60 backdrop-blur px-1 rounded">
            <span className="truncate max-w-[100px]">{displayPatientName}</span>
            <span className="text-emerald-400 font-mono font-bold ml-1 flex-shrink-0">● LIVE</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. CLINICAL CONTEXT SLIDE-OUT DRAWER (Non-intrusive card)
        ───────────────────────────────────────────────────────────── */}
        {showContextDrawer && clinicalContext && (
          <div className="absolute top-16 left-4 bottom-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 z-40 flex flex-col justify-between text-white animate-in slide-in-from-left-4 duration-300">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Clinical Context</span>
                </div>
                <button 
                  onClick={() => setShowContextDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-sm text-slate-100">{clinicalContext.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{clinicalContext.description}</p>
              </div>

              {clinicalContext.keyFindings && clinicalContext.keyFindings.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Key Indicators</div>
                  {clinicalContext.keyFindings.map((finding, idx) => (
                    <div key={idx} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-300">{finding.label}</span>
                        <span className="font-mono font-bold text-emerald-400">{finding.value}</span>
                      </div>
                      {finding.note && (
                        <div className="text-[10px] text-slate-400 mt-1">{finding.note}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800 text-center">
              Heal Engine Clinical Intelligence Gateway v2.5
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM CALL CONTROLS BAR (Video-call style floating pill)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-30 p-3 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-700/80 shadow-2xl">
          {/* Microphone Mute */}
          <button
            onClick={() => {
              setIsMicMuted(!isMicMuted);
              if (onToggleMute) onToggleMute();
            }}
            className={`p-3 rounded-full transition-all ${
              isMicMuted 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
            }`}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-3 rounded-full transition-all ${
              !isCameraOn 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
            }`}
            title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Closed Captions Subtitles */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-3 rounded-full transition-all ${
              showCaptions 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
            title="Toggle Live Closed Captions"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* View Clinical Context */}
          <button
            onClick={() => setShowContextDrawer(!showContextDrawer)}
            className={`p-3 rounded-full transition-all ${
              showContextDrawer 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
            }`}
            title="Toggle Clinical Context Notes"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-700 mx-1" />

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 transition-transform active:scale-95"
            title="End Consultation"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
