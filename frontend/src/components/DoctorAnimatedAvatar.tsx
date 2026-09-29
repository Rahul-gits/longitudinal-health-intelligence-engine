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
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [audioMeterLevel, setAudioMeterLevel] = useState<number>(0);

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

  // Lip-sync / Mouth opening oscillation when speaking
  useEffect(() => {
    if (!isSpeaking || isMuted) {
      setMouthOpen(0);
      setAudioMeterLevel(0);
      return;
    }

    const mouthInterval = setInterval(() => {
      // Dynamic mouth opening with slight random variation to simulate syllables
      const randomFactor = Math.sin(Date.now() / 90) * 0.4 + 0.6;
      setMouthOpen(Math.max(0.15, Math.min(1, randomFactor)));
      setAudioMeterLevel(Math.floor(Math.random() * 80) + 20);
    }, 90);

    return () => clearInterval(mouthInterval);
  }, [isSpeaking, isMuted]);

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

        {/* Posture Mode Badge */}
        <div className="flex items-center space-x-2">
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

              {/* Animated Mouth (Lip Sync) */}
              <g id="mouth">
                {isSpeaking && !isMuted && mouthOpen > 0 ? (
                  // Open mouth talking with teeth/tongue
                  <g>
                    <ellipse 
                      cx="130" 
                      cy="142" 
                      rx={10 + mouthOpen * 4} 
                      ry={4 + mouthOpen * 7} 
                      fill="#7F1D1D" 
                      stroke="#000000" 
                      strokeWidth="2" 
                    />
                    {/* Upper teeth */}
                    <path 
                      d={`M ${122 - mouthOpen * 2} 139 Q 130 142 ${138 + mouthOpen * 2} 139`} 
                      fill="#FFFFFF" 
                      stroke="#FFFFFF" 
                      strokeWidth="2" 
                    />
                    {/* Tongue */}
                    <ellipse cx="130" cy={144 + mouthOpen * 2} rx="6" ry="3" fill="#EF4444" />
                  </g>
                ) : (
                  // Closed warm smile / neutral mouth
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
