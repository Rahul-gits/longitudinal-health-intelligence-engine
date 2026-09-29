import React, { useEffect, useState } from 'react';
import { DoctorPostureMode, VirtualDoctorPersona } from '../types/health';
import { 
  Activity, 
  Stethoscope, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  Mic
} from 'lucide-react';

interface DoctorAnimatedAvatarProps {
  persona: VirtualDoctorPersona;
  posture: DoctorPostureMode;
  isSpeaking: boolean;
  isMuted?: boolean;
  activeWord?: string;
  onSelectPosture?: (posture: DoctorPostureMode) => void;
}

export type VisemeShape = 'SIL' | 'OH' | 'EE' | 'MBP' | 'FV' | 'LDT' | 'REST_TALK';

function computeVisemeFromWord(word: string, tick: number): VisemeShape {
  if (!word || !word.trim()) {
    const osc = Math.sin(tick / 90);
    return osc > 0.25 ? 'REST_TALK' : 'SIL';
  }
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 'REST_TALK';

  // Bilabials (lips closed): M, B, P
  if (/^[mbp]/.test(clean) || /(mb|mp|bb|pp)$/.test(clean)) return 'MBP';

  // Labiodentals: F, V
  if (/^[fv]/.test(clean) || clean.includes('ph')) return 'FV';

  // Rounded open vowels: O, U, OO, OW, AW
  if (/(oo|ou|ow|aw|au|[ou])/.test(clean)) return 'OH';

  // Wide smile vowels / stretch: EE, EA, I, E
  if (/(ee|ea|ai|ay|ey|[ie])/.test(clean)) return 'EE';

  // Alveolar / Dental: L, D, T, N, S, Z, TH
  if (/^[ldtnsz]/.test(clean) || clean.includes('th') || clean.includes('ch') || clean.includes('sh')) return 'LDT';

  return 'REST_TALK';
}

export const DoctorAnimatedAvatar: React.FC<DoctorAnimatedAvatarProps> = ({
  persona,
  posture,
  isSpeaking,
  isMuted = false,
  activeWord = '',
  onSelectPosture
}) => {
  const [blink, setBlink] = useState<boolean>(false);
  const [mouthOpen, setMouthOpen] = useState<number>(0); // 0 to 1
  const [currentViseme, setCurrentViseme] = useState<VisemeShape>('SIL');
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [audioMeterLevel, setAudioMeterLevel] = useState<number>(0);
  const [audioBands, setAudioBands] = useState<number[]>([15, 25, 35, 45, 30, 20, 10, 5]);

  // Periodic blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, []);

  // Breathing subtle motion
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(breathInterval);
  }, []);

  // High-Fidelity Viseme & Lip-Sync Engine
  useEffect(() => {
    if (!isSpeaking || isMuted) {
      setMouthOpen(0);
      setCurrentViseme('SIL');
      setAudioMeterLevel(0);
      setAudioBands([5, 8, 5, 8, 5, 5, 3, 2]);
      return;
    }

    let tick = 0;
    const mouthInterval = setInterval(() => {
      tick += 1;
      const viseme = computeVisemeFromWord(activeWord, Date.now());
      setCurrentViseme(viseme);

      // Amplitude varies by viseme
      let targetOpen = 0.5;
      if (viseme === 'MBP') targetOpen = 0.05; // almost closed
      else if (viseme === 'OH') targetOpen = 0.95; // tall open
      else if (viseme === 'EE') targetOpen = 0.45; // wide horizontal
      else if (viseme === 'FV') targetOpen = 0.35; // upper teeth resting on lip
      else if (viseme === 'LDT') targetOpen = 0.65; // medium open with tongue
      else targetOpen = Math.sin(Date.now() / 85) * 0.35 + 0.55;

      setMouthOpen(targetOpen);
      setAudioMeterLevel(Math.floor(Math.random() * 65) + 35);
      setAudioBands([
        Math.floor(Math.random() * 70) + 25,
        Math.floor(Math.random() * 85) + 15,
        Math.floor(Math.random() * 90) + 10,
        Math.floor(Math.random() * 95) + 15,
        Math.floor(Math.random() * 80) + 20,
        Math.floor(Math.random() * 75) + 15,
        Math.floor(Math.random() * 60) + 10,
        Math.floor(Math.random() * 50) + 5
      ]);
    }, 70);

    return () => clearInterval(mouthInterval);
  }, [isSpeaking, isMuted, activeWord]);

  // Derive subtle posture shifts
  const getHeadTilt = () => {
    switch (posture) {
      case 'listening': return 'rotate-2 translate-x-1';
      case 'explaining': return '-rotate-1 -translate-y-1';
      case 'alerting': return 'rotate-0 translate-y-0.5';
      case 'prescribing':
      case 'reassuring': return 'rotate-1 translate-y-0';
      case 'greeting':
      default: return 'rotate-0';
    }
  };

  const getEyebrowAngle = () => {
    switch (posture) {
      case 'alerting': return 'translate-y-1 rotate-3';
      case 'listening': return '-translate-y-0.5';
      case 'explaining': return '-translate-y-1 -rotate-2';
      default: return '';
    }
  };

  const breathScale = 1 + Math.sin(breathPhase * 0.06) * 0.015;

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-[#111827] via-[#1F2937] to-[#0F172A] border-3 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden flex flex-col items-center justify-between p-4 text-white select-none">
      {/* Top Tele-Health HUD Bar */}
      <div className="w-full flex items-center justify-between z-20 pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
            LIVE CLINICAL STREAM • HD 1080P
          </span>
        </div>

        {/* Posture Mode & Lip-Sync Viseme Badge */}
        <div className="flex items-center space-x-2">
          {isSpeaking && !isMuted && (
            <span className="hidden md:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIP-SYNC: [{currentViseme}] {activeWord ? `"${activeWord}"` : 'ON'}
            </span>
          )}
          <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000] text-black"
                style={{ backgroundColor: persona.badgeBg }}>
            POSTURE: {posture.toUpperCase()}
          </span>
          <div className="hidden sm:flex items-center space-x-1 bg-black/50 px-2 py-0.5 rounded border border-white/20 text-[10px] font-mono">
            {isSpeaking && !isMuted ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-white/50" />
            )}
            <span>{isSpeaking ? (isMuted ? 'MUTED' : 'SPEAKING') : 'LISTENING'}</span>
          </div>
        </div>
      </div>

      {/* Main Vector Animated Doctor Studio */}
      <div className="relative w-full flex-1 flex items-center justify-center my-2">
        {/* Background Clinic Studio Lighting & Grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3A86FF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Halo Glow keyed to Persona Accent Color */}
        <div 
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: persona.accentColor }}
        ></div>

        {/* SVG Doctor Avatar Model */}
        <div 
          className={`relative transition-transform duration-500 transform ${getHeadTilt()}`}
          style={{ transform: `scale(${breathScale})` }}
        >
          <svg width="260" height="280" viewBox="0 0 260 280" className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id={`coatGrad-${persona.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <linearGradient id={`scrubGrad-${persona.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={persona.avatarColor} />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDDFD0" />
                <stop offset="100%" stopColor="#F6C5AF" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3"/>
              </filter>
            </defs>

            {/* Shoulders & Lab Coat Body */}
            <g id="body-and-coat">
              {/* Doctor Under-shirt / Scrubs */}
              <path 
                d="M 80 180 L 130 220 L 180 180 L 205 280 L 55 280 Z" 
                fill={`url(#scrubGrad-${persona.id})`} 
                stroke="#000000" 
                strokeWidth="2.5" 
              />

              {/* White Lab Coat Left Lapel */}
              <path 
                d="M 50 180 Q 90 200 95 280 L 40 280 Q 30 220 50 180 Z" 
                fill={`url(#coatGrad-${persona.id})`} 
                stroke="#000000" 
                strokeWidth="2.5" 
              />

              {/* White Lab Coat Right Lapel */}
              <path 
                d="M 210 180 Q 170 200 165 280 L 220 280 Q 230 220 210 180 Z" 
                fill={`url(#coatGrad-${persona.id})`} 
                stroke="#000000" 
                strokeWidth="2.5" 
              />

              {/* Stethoscope around neck */}
              <path 
                d="M 90 170 C 90 225, 170 225, 170 170" 
                fill="none" 
                stroke="#1E293B" 
                strokeWidth="5" 
                strokeLinecap="round"
              />
              <path 
                d="M 130 220 L 130 245" 
                fill="none" 
                stroke="#1E293B" 
                strokeWidth="4" 
              />
              {/* Stethoscope Bell Chest Piece */}
              <circle cx="130" cy="252" r="10" fill="#94A3B8" stroke="#000000" strokeWidth="2.5" />
              <circle cx="130" cy="252" r="5" fill="#38BDF8" />

              {/* Doctor ID Badge Card on Coat */}
              <rect x="62" y="215" width="26" height="34" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
              <rect x="66" y="219" width="18" height="12" fill={persona.avatarColor} />
              <line x1="66" y1="236" x2="84" y2="236" stroke="#000000" strokeWidth="1.5" />
              <line x1="66" y1="241" x2="78" y2="241" stroke="#64748B" strokeWidth="1" />
            </g>

            {/* Neck */}
            <rect x="112" y="140" width="36" height="36" rx="4" fill="url(#skinGrad)" stroke="#000000" strokeWidth="2" />

            {/* Head & Face */}
            <g id="head" className="transition-transform duration-300">
              {/* Ears */}
              <circle cx="78" cy="115" r="11" fill="url(#skinGrad)" stroke="#000000" strokeWidth="2" />
              <circle cx="182" cy="115" r="11" fill="url(#skinGrad)" stroke="#000000" strokeWidth="2" />

              {/* Face Contour */}
              <path 
                d="M 85 95 C 85 50, 175 50, 175 95 C 175 145, 155 165, 130 165 C 105 165, 85 145, 85 95 Z" 
                fill="url(#skinGrad)" 
                stroke="#000000" 
                strokeWidth="2.5" 
              />

              {/* Hair / Headwear */}
              <path 
                d="M 82 92 C 80 50, 180 50, 178 92 C 168 62, 92 62, 82 92 Z" 
                fill="#1E293B" 
                stroke="#000000" 
                strokeWidth="2" 
              />
              <path 
                d="M 82 80 Q 130 50 178 80 Q 165 42 130 42 Q 95 42 82 80 Z" 
                fill="#0F172A" 
              />

              {/* Eyebrows with dynamic posture expressions */}
              <g className={`transition-all duration-300 ${getEyebrowAngle()}`}>
                {/* Left Eyebrow */}
                <path 
                  d={posture === 'alerting' ? "M 98 88 Q 110 84 118 90" : "M 98 86 Q 110 82 118 86"} 
                  fill="none" 
                  stroke="#0F172A" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />
                {/* Right Eyebrow */}
                <path 
                  d={posture === 'alerting' ? "M 142 90 Q 150 84 162 88" : "M 142 86 Q 150 82 162 86"} 
                  fill="none" 
                  stroke="#0F172A" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />
              </g>

              {/* Eyes & Blinking Animation */}
              <g id="eyes">
                {blink ? (
                  <>
                    {/* Closed Eyes Lines during Blink */}
                    <line x1="98" y1="102" x2="116" y2="102" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="144" y1="102" x2="162" y2="102" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    {/* Left Eye */}
                    <ellipse cx="107" cy="102" rx="9" ry="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                    <circle cx="108" cy="102" r="4.5" fill="#1E293B" />
                    <circle cx="109.5" cy="100.5" r="1.5" fill="#FFFFFF" />

                    {/* Right Eye */}
                    <ellipse cx="153" cy="102" rx="9" ry="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                    <circle cx="152" cy="102" r="4.5" fill="#1E293B" />
                    <circle cx="153.5" cy="100.5" r="1.5" fill="#FFFFFF" />
                  </>
                )}
              </g>

              {/* Nose */}
              <path d="M 130 102 L 126 122 L 134 122" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Animated Mouth with Complete Viseme Lip Sync */}
              <g id="mouth" className="transition-all duration-75">
                {isSpeaking && !isMuted ? (
                  currentViseme === 'MBP' ? (
                    // MBP: Bilabial closed lips pressed tightly together
                    <g>
                      <path d="M 119 142 Q 130 140 141 142" stroke="#881337" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M 123 141 Q 130 139 137 141" fill="none" stroke="#FDA4AF" strokeWidth="1.2" />
                    </g>
                  ) : currentViseme === 'FV' ? (
                    // FV: Labiodental - Upper incisors resting on lower lip
                    <g>
                      <ellipse cx="130" cy="142" rx="11" ry="4" fill="#4C0519" stroke="#000000" strokeWidth="1.5" />
                      {/* Upper teeth overlapping lower lip */}
                      <rect x="124" y="139" width="12" height="3.5" rx="1" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
                      <path d="M 121 143 Q 130 146 139 143" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  ) : currentViseme === 'OH' ? (
                    // OH: Tall rounded mouth cavity
                    <g>
                      <ellipse cx="130" cy="144" rx={9 + mouthOpen * 2} ry={9 + mouthOpen * 6} fill="#3B0712" stroke="#000000" strokeWidth="2" />
                      {/* Upper teeth arch */}
                      <path d="M 124 139 Q 130 141 136 139" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                      {/* Tongue */}
                      <ellipse cx="130" cy={147 + mouthOpen * 3} rx="6" ry="3.5" fill="#F43F5E" />
                      {/* Round lips ring */}
                      <ellipse cx="130" cy="144" rx={10 + mouthOpen * 2} ry={10 + mouthOpen * 6} fill="none" stroke="#991B1B" strokeWidth="2.5" />
                    </g>
                  ) : currentViseme === 'EE' ? (
                    // EE: Wide smile slit, upper and lower teeth prominently exposed
                    <g>
                      <ellipse cx="130" cy="142" rx={16 + mouthOpen * 3} ry={4 + mouthOpen * 3} fill="#4C0519" stroke="#000000" strokeWidth="1.5" />
                      {/* Upper teeth */}
                      <path d="M 117 139 Q 130 142 143 139" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                      {/* Lower teeth */}
                      <path d="M 119 144 Q 130 142 141 144" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                      {/* Lip corners */}
                      <path d="M 113 140 Q 130 147 147 140" fill="none" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                  ) : currentViseme === 'LDT' ? (
                    // LDT: Medium open with tongue tip touching upper palate
                    <g>
                      <ellipse cx="130" cy="143" rx={12 + mouthOpen * 2} ry={6 + mouthOpen * 4} fill="#450A0A" stroke="#000000" strokeWidth="2" />
                      {/* Upper teeth line */}
                      <path d="M 121 140 Q 130 142 139 140" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" />
                      {/* Elevated Tongue tip */}
                      <ellipse cx="130" cy={141} rx="5" ry="3" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />
                    </g>
                  ) : (
                    // REST_TALK: Dynamic open talk
                    <g>
                      <ellipse cx="130" cy="143" rx={11 + mouthOpen * 3} ry={5 + mouthOpen * 5} fill="#450A0A" stroke="#000000" strokeWidth="2" />
                      <path d={`M ${122 - mouthOpen * 2} 140 Q 130 142 ${138 + mouthOpen * 2} 140`} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" />
                      <ellipse cx="130" cy={144 + mouthOpen * 2} rx="6" ry="3" fill="#F43F5E" />
                    </g>
                  )
                ) : (
                  // Closed warm smile / neutral posture
                  <path 
                    d={posture === 'alerting' ? "M 122 144 Q 130 141 138 144" : "M 120 140 Q 130 148 140 140"} 
                    fill="none" 
                    stroke="#991B1B" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                )}
              </g>
            </g>

            {/* Gesture Overlay (Hand / Stethoscope Action based on Posture) */}
            {posture === 'greeting' && (
              <g className="animate-bounce">
                {/* Waving Hand */}
                <circle cx="215" cy="140" r="14" fill="url(#skinGrad)" stroke="#000000" strokeWidth="2" />
                <path d="M 215 130 L 215 118" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                <path d="M 221 132 L 225 122" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                <path d="M 209 132 L 205 122" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {posture === 'explaining' && (
              <g className="animate-pulse">
                {/* Pointing to Floating Chart Gesture */}
                <circle cx="215" cy="165" r="12" fill="url(#skinGrad)" stroke="#000000" strokeWidth="2" />
                <path d="M 215 160 L 235 145" stroke="#FFE600" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            )}

            {posture === 'alerting' && (
              <g className="animate-pulse">
                {/* Alert Badge Indicator */}
                <circle cx="45" cy="140" r="16" fill="#FFE600" stroke="#000000" strokeWidth="2.5" />
                <text x="45" y="146" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#000000">⚠️</text>
              </g>
            )}
          </svg>
        </div>

        {/* Floating Context Pill Overlay */}
        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000] text-right text-xs">
          <span className="text-[10px] font-mono text-emerald-400 font-bold block">SPECIALIST LENS</span>
          <span className="font-display font-extrabold text-white text-xs">{persona.specialty}</span>
        </div>
      </div>

      {/* Bottom Video HUD: Doctor Nameplate & Live Audio Spectrum */}
      <div className="w-full bg-[#111827] border-2 border-black p-3 shadow-[3px_3px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-black text-xs font-display shadow-[1px_1px_0px_0px_#000]"
            style={{ backgroundColor: persona.avatarColor }}
          >
            <Stethoscope className="w-4 h-4 text-black stroke-[2.5]" />
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

        {/* Dynamic Voice Spectrum Visualizer */}
        <div className="flex items-center space-x-1 bg-black/60 px-2 py-1.5 border border-white/10">
          <span className="text-[9px] font-mono font-bold text-white/60 mr-1">AUDIO</span>
          {[20, 50, 80, 40, 65, 30, 90, 45, 60, 25].map((h, i) => (
            <div 
              key={i} 
              className="w-1 bg-emerald-400 transition-all duration-75"
              style={{
                height: isSpeaking && !isMuted ? `${Math.max(4, Math.min(22, (h * audioMeterLevel) / 60))}px` : '4px',
                opacity: isSpeaking && !isMuted ? 1 : 0.3
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
