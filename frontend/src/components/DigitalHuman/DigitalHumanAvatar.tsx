import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { VirtualDoctorPersona, DoctorPostureMode, AvatarState } from '../../types/health';
import { AvatarStateController, AvatarBehavioralParameters } from './AvatarStateController';
import { LipSyncController, MorphWeightSet } from './LipSyncController';
import { ExpressionController, FacialExpressionWeights } from './ExpressionController';
import { GestureController, PostureKinematics } from './GestureController';
import { SpecialistDoctorModel } from './Specialist3DScene';
import { avatarPipelineService, AvatarPipelineType, PipelineHealthStatus } from '../../services/avatarPipelineService';
import { 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Camera, 
  Sun, 
  Moon, 
  Layers, 
  AlertTriangle,
  Volume2,
  VolumeX,
  Eye,
  CheckCircle2,
  Settings,
  Cpu,
  Wifi,
  Lock,
  X
} from 'lucide-react';

export interface DigitalHumanAvatarProps {
  persona: VirtualDoctorPersona;
  posture?: DoctorPostureMode;
  state?: AvatarState;
  isSpeaking: boolean;
  isMuted?: boolean;
  activeWord?: string;
  transcriptText?: string;
  patientTranscript?: string;
  patientName?: string;
  modelUrl?: string;
  hasSafetyAlert?: boolean;
  onStateChange?: (state: AvatarState) => void;
  onSelectPersona?: (personaId: string) => void;
  onToggleMute?: () => void;
  onEndCall?: () => void;
  onFallbackTo2D?: () => void;
}

// Fallback error boundary for 3D WebGL context
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class ThreeDErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean; error: any }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('Three.js / WebGL render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Telehealth 3D Loading Indicator
const Clinical3DLoader: React.FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl text-white space-y-3 min-w-[240px]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-12 h-12 rounded-full border-3 border-cyan-400 border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold tracking-wide text-cyan-300">INITIALIZING 3D SPECIALIST</p>
          <p className="text-xs text-slate-400 mt-0.5">Calibrating facial rig & clinical presence...</p>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-2/3 animate-pulse" />
        </div>
      </div>
    </Html>
  );
};

export const DigitalHumanAvatar: React.FC<DigitalHumanAvatarProps> = ({
  persona,
  posture = 'greeting',
  state,
  isSpeaking,
  isMuted = false,
  activeWord = '',
  transcriptText = '',
  patientTranscript = '',
  patientName,
  modelUrl = '/models/specialist-doctor.glb',
  hasSafetyAlert = false,
  onStateChange,
  onSelectPersona,
  onToggleMute,
  onEndCall,
  onFallbackTo2D
}) => {
  // Lighting and Camera Options
  const [lightingPreset, setLightingPreset] = useState<'clinical' | 'warm' | 'evening'>('clinical');
  const [cameraOrbitEnabled, setCameraOrbitEnabled] = useState<boolean>(false);
  // Pipeline State
  const [showPipelineModal, setShowPipelineModal] = useState<boolean>(false);
  const [pipelineConfig, setPipelineConfig] = useState(avatarPipelineService.getConfig());
  const availablePipelines = avatarPipelineService.getAvailablePipelines();

  useEffect(() => {
    return avatarPipelineService.subscribe(cfg => setPipelineConfig(cfg));
  }, []);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Real-time animation states shared between controllers and 3D scene
  const [morphWeights, setMorphWeights] = useState<MorphWeightSet>({
    jawOpen: 0,
    mouthOpen: 0,
    mouthSpread: 1.0,
    mouthPucker: 0,
    viseme_aa: 0,
    viseme_ee: 0,
    viseme_oh: 0,
    viseme_sil: 1.0,
    currentViseme: 'SIL'
  });

  const [expressionWeights, setExpressionWeights] = useState<FacialExpressionWeights>({
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
    browInnerUp: 0.1,
    browDown: 0,
    mouthSmile: 0.2,
    eyeSquint: 0,
    gazeVector: [0, 0, 1]
  });

  const [kinematics, setKinematics] = useState<PostureKinematics>({
    headRotation: [0, 0, 0],
    neckRotation: [0, 0, 0],
    spineOffset: [0, 0, 0],
    chestBreathingScale: 1.0,
    noddingPhase: 0
  });

  // Track prefers-reduced-motion for accessibility
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Track pointer for subtle eye gaze orientation
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPointerPos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPointerPos({ x: 0, y: 0 });
  }, []);

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[520px] md:h-[600px] bg-[#070A10] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col justify-between select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP CONSULTATION HUD
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent flex items-center justify-between pointer-events-auto">
        {/* Left: Security and 3D Presence Badge */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">HEAL ENGINE</span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              3D VIRTUAL CONSULTATION
            </span>
          </div>
        </div>

        {/* Right: Specialist Badge & Controls */}
        <div className="flex items-center space-x-2">
          {/* Pipeline Switcher / Settings */}
          <button
            onClick={() => setShowPipelineModal(true)}
            title="Configure Avatar Rendering Pipeline (R3F, Convai, D-ID, Audio2Face)"
            className="p-1.5 bg-black/50 hover:bg-black/80 rounded-full border border-cyan-500/30 text-cyan-300 hover:text-white transition-all text-xs flex items-center gap-1.5 px-2.5 shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono text-[11px]">
              {pipelineConfig.activePipeline === 'R3F_NATIVE' ? 'R3F 3D' :
               pipelineConfig.activePipeline === 'CONVAI_SDK' ? 'Convai' :
               pipelineConfig.activePipeline === 'DID_STREAMING' ? 'D-ID' : 'Audio2Face'}
            </span>
          </button>

          {/* Lighting Mode Selector */}
          <button
            onClick={() => setLightingPreset(p => p === 'clinical' ? 'warm' : p === 'warm' ? 'evening' : 'clinical')}
            title="Toggle Clinical Lighting Preset"
            className="p-1.5 bg-black/50 hover:bg-black/80 rounded-full border border-white/10 text-white/70 hover:text-white transition-all text-xs flex items-center gap-1 px-2.5"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize hidden sm:inline">{lightingPreset}</span>
          </button>

          {/* Fixed vs Orbit Camera Toggle */}
          <button
            onClick={() => setCameraOrbitEnabled(!cameraOrbitEnabled)}
            title={cameraOrbitEnabled ? "Orbit Camera Enabled (Click to Lock Frontal View)" : "Camera Locked (Click to Enable 3D Orbit)"}
            className={`p-1.5 rounded-full border text-xs transition-all flex items-center gap-1 px-2.5 ${
              cameraOrbitEnabled 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                : 'bg-black/50 hover:bg-black/80 border-white/10 text-white/70'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{cameraOrbitEnabled ? 'Orbit Free' : 'Locked View'}</span>
          </button>

          {/* 2D Fallback Toggle */}
          {onFallbackTo2D && (
            <button
              onClick={onFallbackTo2D}
              title="Switch to High-Res 2D Photo Mode"
              className="p-1.5 bg-black/50 hover:bg-black/80 rounded-full border border-white/10 text-white/70 hover:text-white transition-all text-xs flex items-center gap-1 px-2.5"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">2D Photo</span>
            </button>
          )}

          {/* Doctor Info Badge */}
          <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold">{persona.name.split(',')[0]}</span>
            <span className="text-white/50 text-[11px] hidden sm:inline">({persona.specialty.split('&')[0].trim()})</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DETERMINISTIC CONTROLLERS & 3D R3F CANVAS
      ───────────────────────────────────────────────────────────── */}
      <AvatarStateController
        state={state}
        posture={posture}
        isSpeaking={isSpeaking}
        hasSafetyAlert={hasSafetyAlert}
        onStateChange={onStateChange}
      >
        {(behavior: AvatarBehavioralParameters) => (
          <>
            {/* Logic Controllers (drive morph weights, expressions, kinematics) */}
            <LipSyncController
              isSpeaking={isSpeaking}
              isMuted={isMuted}
              activeWord={activeWord}
              onMorphWeightsUpdate={setMorphWeights}
            />

            <ExpressionController
              behavior={behavior}
              pointerPosition={reducedMotion ? { x: 0, y: 0 } : pointerPos}
              onExpressionUpdate={setExpressionWeights}
            />

            <GestureController
              behavior={behavior}
              isSpeaking={isSpeaking}
              pointerPosition={reducedMotion ? { x: 0, y: 0 } : pointerPos}
              onKinematicsUpdate={setKinematics}
            />

            {/* 3D WebGL Canvas */}
            <ThreeDErrorBoundary
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="font-bold">3D WebGL Rendering Fallback</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Your browser or GPU is running in high-efficiency mode. Switching to high-fidelity photographic consultation.
                  </p>
                  {onFallbackTo2D && (
                    <button
                      onClick={onFallbackTo2D}
                      className="mt-4 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-semibold"
                    >
                      Switch to 2D Mode
                    </button>
                  )}
                </div>
              }
            >
              <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
                <Canvas
                  camera={{ position: [0, 0.22, 1.25], fov: 30 }}
                  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                  className="w-full h-full"
                >
                  {/* Lighting Environment */}
                  {lightingPreset === 'clinical' && (
                    <>
                      <ambientLight intensity={1.4} />
                      <directionalLight position={[1.5, 2.8, 2.2]} intensity={2.2} color="#FFFFFF" />
                      <directionalLight position={[-2.0, 1.2, 1.0]} intensity={1.0} color="#E0F2FE" />
                      <directionalLight position={[0, 3.0, -2.5]} intensity={1.6} color="#00F5D4" />
                    </>
                  )}

                  {lightingPreset === 'warm' && (
                    <>
                      <ambientLight intensity={1.2} />
                      <directionalLight position={[1.8, 2.5, 2.0]} intensity={2.4} color="#FFFBEB" />
                      <directionalLight position={[-2.0, 1.0, 1.0]} intensity={0.9} color="#FED7AA" />
                      <directionalLight position={[0, 2.5, -2.0]} intensity={1.2} color="#FBBF24" />
                    </>
                  )}

                  {lightingPreset === 'evening' && (
                    <>
                      <ambientLight intensity={0.9} />
                      <directionalLight position={[1.2, 2.0, 1.8]} intensity={1.8} color="#E2E8F0" />
                      <directionalLight position={[-1.8, 0.8, 1.0]} intensity={0.7} color="#94A3B8" />
                      <directionalLight position={[0, 2.0, -1.8]} intensity={1.4} color="#38BDF8" />
                    </>
                  )}

                  <Suspense fallback={<Clinical3DLoader />}>
                    <SpecialistDoctorModel
                      modelUrl={modelUrl}
                      persona={persona}
                      morphWeights={morphWeights}
                      expressionWeights={expressionWeights}
                      kinematics={kinematics}
                      isSpeaking={isSpeaking}
                    />
                  </Suspense>

                  {cameraOrbitEnabled && (
                    <OrbitControls
                      enablePan={false}
                      enableZoom={true}
                      minDistance={0.8}
                      maxDistance={2.2}
                      minPolarAngle={Math.PI / 2.6}
                      maxPolarAngle={Math.PI / 1.8}
                      target={[0, 0.22, 0]}
                    />
                  )}
                </Canvas>
              </div>
            </ThreeDErrorBoundary>

            {/* ─────────────────────────────────────────────────────────────
                3. BOTTOM CONSULTATION HUD (Deterministic State, Visemes & Subtitles)
            ───────────────────────────────────────────────────────────── */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex flex-col items-center pointer-events-auto space-y-2">
              {/* State Machine Status & Viseme HUD */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-lg ${behavior.statusBadgeColor}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span className="font-bold tracking-wide">{behavior.state}</span>
                  <span className="opacity-40">•</span>
                  <span className="text-[11px] opacity-90">{behavior.statusLabel}</span>
                </div>

                {isSpeaking && !isMuted && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                    <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>VISEME: {morphWeights.currentViseme}</span>
                    <span className="text-white/40">|</span>
                    <span>JAW: {(morphWeights.jawOpen * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>

              {/* Subtitles Overlay */}
              {transcriptText && (
                <div className="max-w-2xl w-full bg-black/75 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-center shadow-xl">
                  <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed">
                    {transcriptText.split(' ').map((word, i) => {
                      const isCurrent = activeWord && word.toLowerCase().includes(activeWord.toLowerCase());
                      return (
                        <span 
                          key={i} 
                          className={isCurrent ? "text-cyan-300 font-bold bg-cyan-950/80 px-1 rounded transition-colors" : ""}
                        >
                          {word}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </AvatarStateController>

      {/* ─────────────────────────────────────────────────────────────
          4. PIPELINE CONFIGURATION & ARCHITECTURE MODAL
      ───────────────────────────────────────────────────────────── */}
      {showPipelineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Avatar Pipeline & Interaction Stack</h3>
                  <p className="text-xs text-slate-400">Select rendering framework, facial animation, and interaction runtime</p>
                </div>
              </div>
              <button
                onClick={() => setShowPipelineModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Sovereign Safety Notice */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start space-x-3">
                <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-300">Sovereign Clinical Intelligence Guarantee</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Heal Engine strictly decouples rendering from clinical intelligence. All clinical decisions, KDIGO criteria, and safety gates run on Heal Engine's local backend before the avatar speaks.
                  </p>
                </div>
              </div>

              {/* Pipelines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePipelines.map((pipe) => {
                  const isSelected = pipelineConfig.activePipeline === pipe.pipeline;
                  return (
                    <div
                      key={pipe.pipeline}
                      onClick={() => {
                        avatarPipelineService.setPipeline(pipe.pipeline);
                      }}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-400 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-850/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-100 text-xs">{pipe.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mb-3">
                          {pipe.pipeline === 'R3F_NATIVE' && 'Fully controllable rigged 3D human in React Three Fiber with procedural phonemes & saccadic eye tracking.'}
                          {pipe.pipeline === 'CONVAI_SDK' && 'Convai Web SDK voice & character interaction layer. Connects emotion signals to 3D facial mesh.'}
                          {pipe.pipeline === 'DID_STREAMING' && 'Fast real-time talking-presenter video stream. Returns 2D video rather than controllable 3D geometry.'}
                          {pipe.pipeline === 'AUDIO2FACE_BRIDGE' && 'NVIDIA Omniverse Audio2Face ARKit 52 blendshape bridge driving real-time facial micro-movement.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${pipe.isRotatable3D ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/40' : 'bg-amber-950/80 text-amber-300 border border-amber-700/40'}`}>
                          {pipe.isRotatable3D ? '3D Rotatable Mesh' : '2D Video Stream'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {pipe.estimatedLatencyMs === 0 ? '0ms Local' : `~${pipe.estimatedLatencyMs}ms`}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${pipe.hipaaCompliantLocal ? 'bg-emerald-950/80 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                          {pipe.hipaaCompliantLocal ? 'HIPAA Local' : 'Cloud Endpoint'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advanced Settings */}
              <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2.5">
                <p className="font-semibold text-slate-200">Animation & Tracking Parameters</p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Biological Saccadic Eye Tracking & Gaze Following</span>
                  <input
                    type="checkbox"
                    checked={pipelineConfig.enableEyeTracking}
                    onChange={(e) => avatarPipelineService.updateConfig({ enableEyeTracking: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Convai Emotional Signal Modulation (Empathy / Calm / Urgent)</span>
                  <input
                    type="checkbox"
                    checked={pipelineConfig.enableConvaiEmotionSignals}
                    onChange={(e) => avatarPipelineService.updateConfig({ enableConvaiEmotionSignals: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Active: <span className="text-cyan-300 font-semibold">{pipelineConfig.activePipeline}</span>
              </span>
              <button
                onClick={() => setShowPipelineModal(false)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-md"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalHumanAvatar;
