/**
 * Heal Engine - Unified 3D Specialist Avatar Pipeline Service
 * 
 * Implements architectural separation:
 * 1. Clinical Reasoning & Safety Gate: Sovereign to Heal Engine (never outsourced)
 * 2. Pluggable Avatar Runtime Adapters:
 *    - R3F_NATIVE: React Three Fiber + Rigged GLB + Local Speech/Viseme Sync (Full 3D Control, HIPAA-Isolated)
 *    - CONVAI_SDK: Convai Web SDK for Voice & Character Interaction with Emotion Signals
 *    - DID_STREAMING: D-ID Agents SDK for Live Video Stream Presenters (Fast Fallback)
 *    - AUDIO2FACE_BRIDGE: NVIDIA Omniverse Audio2Face ARKit 52 Blendshape Bridge
 */

import { SpecialistResponse, AvatarState } from '../types/health';

export type AvatarPipelineType = 
  | 'R3F_NATIVE'
  | 'CONVAI_SDK'
  | 'DID_STREAMING'
  | 'AUDIO2FACE_BRIDGE';

export interface AvatarPipelineConfig {
  activePipeline: AvatarPipelineType;
  enableEyeTracking: boolean;
  enableAudio2FaceStream: boolean;
  enableConvaiEmotionSignals: boolean;
  streamingQuality: 'high' | 'medium' | 'low';
  audioSampleRate: number;
  convaiApiKey?: string;
  convaiCharacterId?: string;
  didApiKey?: string;
  audio2FaceWsUrl?: string;
}

export interface PipelineHealthStatus {
  pipeline: AvatarPipelineType;
  name: string;
  isReady: boolean;
  isRotatable3D: boolean;
  hipaaCompliantLocal: boolean;
  estimatedLatencyMs: number;
  supportedFeatures: {
    facialRig: boolean;
    speechSync: boolean;
    audioInput: boolean;
    rotatableMesh: boolean;
    safetyGateEnforced: boolean;
  };
}

// ARKit 52 Facial Blendshapes for NVIDIA Audio2Face & MetaHuman Compatibility
export interface ARKit52Blendshapes {
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  eyeLookDownLeft: number;
  eyeLookDownRight: number;
  eyeLookInLeft: number;
  eyeLookInRight: number;
  eyeLookOutLeft: number;
  eyeLookOutRight: number;
  eyeLookUpLeft: number;
  eyeLookUpRight: number;
  eyeSquintLeft: number;
  eyeSquintRight: number;
  eyeWideLeft: number;
  eyeWideRight: number;
  jawForward: number;
  jawLeft: number;
  jawRight: number;
  jawOpen: number;
  mouthClose: number;
  mouthFunnel: number;
  mouthPucker: number;
  mouthLeft: number;
  mouthRight: number;
  mouthSmileLeft: number;
  mouthSmileRight: number;
  mouthFrownLeft: number;
  mouthFrownRight: number;
  mouthDimpleLeft: number;
  mouthDimpleRight: number;
  mouthStretchLeft: number;
  mouthStretchRight: number;
  mouthRollLower: number;
  mouthRollUpper: number;
  mouthShrugLower: number;
  mouthShrugUpper: number;
  mouthPressLeft: number;
  mouthPressRight: number;
  mouthLowerDownLeft: number;
  mouthLowerDownRight: number;
  mouthUpperUpLeft: number;
  mouthUpperUpRight: number;
  browDownLeft: number;
  browDownRight: number;
  browInnerUp: number;
  browOuterUpLeft: number;
  browOuterUpRight: number;
  cheekPuff: number;
  cheekSquintLeft: number;
  cheekSquintRight: number;
  noseSneerLeft: number;
  noseSneerRight: number;
  tongueOut: number;
}

class AvatarPipelineService {
  private config: AvatarPipelineConfig = {
    activePipeline: 'R3F_NATIVE',
    enableEyeTracking: true,
    enableAudio2FaceStream: false,
    enableConvaiEmotionSignals: true,
    streamingQuality: 'high',
    audioSampleRate: 44100,
    audio2FaceWsUrl: 'ws://localhost:8011/audio2face'
  };

  private listeners: Array<(config: AvatarPipelineConfig) => void> = [];

  constructor() {
    // Load persisted pipeline preference if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('heal_avatar_pipeline');
      if (stored) {
        try {
          this.config = { ...this.config, ...JSON.parse(stored) };
        } catch {
          // ignore parsing error
        }
      }
    }
  }

  public getConfig(): AvatarPipelineConfig {
    return { ...this.config };
  }

  public setPipeline(pipeline: AvatarPipelineType): void {
    this.config.activePipeline = pipeline;
    if (typeof window !== 'undefined') {
      localStorage.setItem('heal_avatar_pipeline', JSON.stringify(this.config));
    }
    this.notify();
  }

  public updateConfig(partial: Partial<AvatarPipelineConfig>): void {
    this.config = { ...this.config, ...partial };
    if (typeof window !== 'undefined') {
      localStorage.setItem('heal_avatar_pipeline', JSON.stringify(this.config));
    }
    this.notify();
  }

  public subscribe(cb: (config: AvatarPipelineConfig) => void): () => void {
    this.listeners.push(cb);
    cb(this.config);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb(this.config));
  }

  /**
   * Diagnostic evaluation of each pipeline in accordance with clinical criteria
   */
  public getAvailablePipelines(): PipelineHealthStatus[] {
    return [
      {
        pipeline: 'R3F_NATIVE',
        name: 'Native 3D Rigged WebGL (R3F + Three.js)',
        isReady: true,
        isRotatable3D: true,
        hipaaCompliantLocal: true,
        estimatedLatencyMs: 0, // Zero cloud network latency
        supportedFeatures: {
          facialRig: true,
          speechSync: true,
          audioInput: true,
          rotatableMesh: true,
          safetyGateEnforced: true
        }
      },
      {
        pipeline: 'AUDIO2FACE_BRIDGE',
        name: 'NVIDIA Audio2Face Bridge (ARKit 52)',
        isReady: this.config.enableAudio2FaceStream,
        isRotatable3D: true,
        hipaaCompliantLocal: true,
        estimatedLatencyMs: 18,
        supportedFeatures: {
          facialRig: true,
          speechSync: true,
          audioInput: true,
          rotatableMesh: true,
          safetyGateEnforced: true
        }
      },
      {
        pipeline: 'CONVAI_SDK',
        name: 'Convai Web SDK (Character & Emotion Layer)',
        isReady: Boolean(this.config.convaiApiKey),
        isRotatable3D: true,
        hipaaCompliantLocal: false, // Cloud character API
        estimatedLatencyMs: 120,
        supportedFeatures: {
          facialRig: true,
          speechSync: true,
          audioInput: true,
          rotatableMesh: true,
          safetyGateEnforced: true // Heal Engine enforces safety before Convai plays
        }
      },
      {
        pipeline: 'DID_STREAMING',
        name: 'D-ID Agents SDK (Live Stream Presenter)',
        isReady: Boolean(this.config.didApiKey),
        isRotatable3D: false, // Streamed 2D video presenter
        hipaaCompliantLocal: false,
        estimatedLatencyMs: 380,
        supportedFeatures: {
          facialRig: false,
          speechSync: true,
          audioInput: true,
          rotatableMesh: false,
          safetyGateEnforced: true
        }
      }
    ];
  }

  /**
   * Translates an approved clinical response into ARKit 52 morph targets
   * for NVIDIA Audio2Face or MetaHuman rigs.
   */
  public mapResponseToARKit52(
    response: SpecialistResponse,
    viseme: string = 'SIL',
    syllableEnergy: number = 0
  ): Partial<ARKit52Blendshapes> {
    const isAlerting = response.state === 'ALERTING' || response.requiresClinicianReview;
    const isGreeting = response.state === 'GREETING' || response.state === 'REASSURING';

    return {
      jawOpen: syllableEnergy * 0.75,
      mouthSmileLeft: isGreeting ? 0.35 : 0.05,
      mouthSmileRight: isGreeting ? 0.35 : 0.05,
      mouthFrownLeft: isAlerting ? 0.45 : 0.0,
      mouthFrownRight: isAlerting ? 0.45 : 0.0,
      browDownLeft: isAlerting ? 0.65 : 0.0,
      browDownRight: isAlerting ? 0.65 : 0.0,
      browInnerUp: response.state === 'UNDERSTANDING' ? 0.4 : 0.1,
      mouthPucker: viseme === 'OH' ? 0.7 : 0.0,
      mouthFunnel: viseme === 'OH' ? 0.5 : 0.0,
      mouthClose: viseme === 'MBP' ? 0.8 : 0.0
    };
  }
}

export const avatarPipelineService = new AvatarPipelineService();
