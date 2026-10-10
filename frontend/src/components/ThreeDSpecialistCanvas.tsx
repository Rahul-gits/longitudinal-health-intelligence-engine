import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { VirtualDoctorPersona, DoctorPostureMode } from '../types/health';
import { computerVisionEngine, VisionObservation, PatientAffect, PatientGesture } from '../engine/computerVisionEngine';

export interface ThreeDSpecialistProps {
  persona: VirtualDoctorPersona;
  posture: DoctorPostureMode;
  isSpeaking: boolean;
  isMuted: boolean;
  activeWord: string;
  transcriptText: string;
  patientTranscript: string;
  isRecording: boolean;
  showCaptions: boolean;
  aiModel: string;
  callDuration: number;
  isCallActive: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onToggleMute: () => void;
  isPlaying: boolean;
  speechRate: number;
  onSpeechRate: (r: number) => void;
  onToggleCaptions: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
  onToggle2DMode?: () => void;
  is2DMode?: boolean;
  onVisionObservation?: (obs: VisionObservation) => void;
}

type CameraViewMode = 'portrait' | 'cinematic' | 'hologram' | 'orbit';

/* ─────────────────────────────────────────────────────────────
   ANATOMICAL SCULPTING & TEXTURE GENERATORS
   ───────────────────────────────────────────────────────────── */

/** Sculpt organic human head geometry with realistic facial planes and anatomical depth */
function createRealisticHeadGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.38, 56, 56);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const x = v.x;
    const y = v.y;
    const z = v.z;

    // Sculpt front face (z > 0)
    if (z > 0) {
      // 1. Orbital eye sockets with anatomical palpebral margin
      const leftEyeDist = Math.hypot(x - (-0.115), y - 0.095);
      const rightEyeDist = Math.hypot(x - 0.115, y - 0.095);
      const eyeDist = Math.min(leftEyeDist, rightEyeDist);
      if (eyeDist < 0.078) {
        // Deep smooth orbital cavity
        const indent = Math.cos((eyeDist / 0.078) * (Math.PI / 2)) * 0.068;
        v.z -= indent;
      }

      // 2. Brow ridge & supraorbital arch (y between 0.14 and 0.22)
      if (y > 0.13 && y < 0.22 && Math.abs(x) < 0.24) {
        const browArch = Math.sin(((y - 0.13) / 0.09) * Math.PI) * (1 - Math.abs(x) / 0.24);
        v.z += browArch * 0.024;
      }

      // 3. Realistic sculpted nose with bridge, dorsal slope, and nostril wings
      if (y > -0.06 && y < 0.13 && Math.abs(x) < 0.075) {
        const noseY = (y - (-0.06)) / 0.19; // 0 at base, 1 at bridge
        const noseX = Math.max(0, 1 - Math.abs(x) / 0.055);
        // Nasal bridge and cartilage tip projection
        const bridgeProtrude = (0.07 + 0.038 * (1 - noseY)) * noseX;
        v.z += bridgeProtrude;
        // Nostril flare at base
        if (y < -0.01 && Math.abs(x) > 0.032) {
          v.x += Math.sign(x) * 0.012;
        }
      }

      // 4. Zygomatic cheekbones with natural taper
      if (y > -0.03 && y < 0.14 && Math.abs(x) > 0.11 && Math.abs(x) < 0.32) {
        const cheekWeight = Math.sin(((y - (-0.03)) / 0.17) * Math.PI) * Math.max(0, 1 - Math.abs(Math.abs(x) - 0.21) / 0.11);
        v.z += cheekWeight * 0.024;
        v.x += Math.sign(x) * cheekWeight * 0.014;
      }

      // 5. Lips, Cupid's bow, and philtrum groove
      if (y > -0.16 && y < -0.04 && Math.abs(x) < 0.13) {
        const mouthX = Math.max(0, 1 - Math.abs(x) / 0.115);
        // Philtrum vertical groove
        if (y > -0.075 && Math.abs(x) < 0.022) {
          v.z -= 0.012 * (1 - Math.abs(x) / 0.022);
        }
        // Lip fullness curvature
        const lipCurve = Math.sin(((y - (-0.16)) / 0.12) * Math.PI) * mouthX;
        v.z += lipCurve * 0.026;
      }

      // 6. Sculpted chin & jawline (mandible)
      if (y < -0.12 && Math.abs(x) < 0.14) {
        const chinWeight = Math.max(0, 1 - Math.abs(x) / 0.12) * Math.max(0, 1 - Math.abs(y - (-0.23)) / 0.13);
        v.z += chinWeight * 0.036;
        v.y += chinWeight * 0.012;
      }
    }

    // Natural jaw taper on lower sides
    if (y < -0.08) {
      const taper = 0.74 + 0.26 * ((y + 0.38) / 0.30);
      v.x *= taper;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/** Generate realistic procedural iris texture with concentric muscle fibers and limbal ring */
function createRealisticIrisTexture(baseHex: string, fiberHex: string, limbalHex: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const cx = 256, cy = 256;

  // 1. Iris base color
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Outer limbal ring (dark defined border)
  const limbalGrad = ctx.createRadialGradient(cx, cy, 125, cx, cy, 252);
  limbalGrad.addColorStop(0, 'rgba(0,0,0,0)');
  limbalGrad.addColorStop(0.65, fiberHex);
  limbalGrad.addColorStop(1, limbalHex);
  ctx.fillStyle = limbalGrad;
  ctx.fillRect(0, 0, 512, 512);

  // 3. Radial collagen trabeculae & contraction furrows
  ctx.save();
  ctx.translate(cx, cy);
  for (let a = 0; a < 360; a += 0.8) {
    ctx.rotate((0.8 * Math.PI) / 180);
    ctx.strokeStyle = a % 2 === 0 ? fiberHex : 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(242, Math.sin(a * 5) * 3);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Central pupillary margin & dark pupil
  const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 82);
  pupilGrad.addColorStop(0, '#020202');
  pupilGrad.addColorStop(0.88, '#060606');
  pupilGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pupilGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 82, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT IMPLEMENTATION
   ───────────────────────────────────────────────────────────── */

export const ThreeDSpecialistCanvas: React.FC<ThreeDSpecialistProps> = ({
  persona,
  posture,
  isSpeaking,
  isMuted,
  activeWord,
  transcriptText,
  patientTranscript,
  isRecording,
  showCaptions,
  aiModel,
  callDuration,
  isCallActive,
  onPlay,
  onPause,
  onReplay,
  onToggleMute,
  isPlaying,
  speechRate,
  onSpeechRate,
  onToggleCaptions,
  onToggleRecording,
  onEndCall,
  onToggle2DMode,
  is2DMode = false,
  onVisionObservation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera & view modes
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('portrait');
  const [showHoloHud, setShowHoloHud] = useState<boolean>(true);
  const [showVisionFeed, setShowVisionFeed] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isOrbitDragging, setIsOrbitDragging] = useState(false);
  const [orbitAngles, setOrbitAngles] = useState({ yaw: 0, pitch: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Computer Vision Reference (Read synchronously in 60fps WebGL loop without React re-renders)
  const visionRef = useRef<VisionObservation>(computerVisionEngine.getLatestObservation());
  const [visionUiState, setVisionUiState] = useState<VisionObservation>(computerVisionEngine.getLatestObservation());
  const [visionSimulated, setVisionSimulated] = useState<boolean>(false);

  // Connect to Stabilized Computer Vision Engine
  useEffect(() => {
    let mounted = true;
    const unsub = computerVisionEngine.addListener((obs) => {
      if (!mounted) return;
      visionRef.current = obs; // sync ref for Three.js render loop (zero React re-render lag)
      setVisionUiState(obs);   // throttled UI update
      if (onVisionObservation) onVisionObservation(obs);

      // Vision gesture reaction: Patient raises hand -> Pause doctor speaking
      if (obs.gesture === 'hand_raise_stop' && isPlaying) {
        onPause();
      }
    });

    if (showVisionFeed && videoRef.current) {
      computerVisionEngine.startWebcam(videoRef.current).then(res => {
        if (!mounted) return;
        setVisionSimulated(res.simulated);
      });
    }

    return () => {
      mounted = false;
      unsub();
      computerVisionEngine.stopWebcam();
    };
  }, [showVisionFeed, isPlaying, onPause, onVisionObservation]);

  // Viseme mapping from active spoken word
  const activeViseme = useMemo(() => {
    if (!activeWord?.trim()) return 'REST';
    const c = activeWord.toLowerCase().replace(/[^a-z]/g, '');
    if (!c) return 'REST';
    if (/^[mbp]/.test(c) || /(mb|mp)$/.test(c)) return 'MBP';
    if (/^[fv]/.test(c) || c.includes('ph')) return 'FV';
    if (/(oo|ou|ow|aw|[ou])/.test(c)) return 'OH';
    if (/(ee|ea|ai|ay|[ie])/.test(c)) return 'EE';
    if (/^[ldtnsz]/.test(c) || c.includes('th') || c.includes('sh')) return 'LDT';
    return 'REST';
  }, [activeWord]);

  // Waveform visualization
  const [wavePhase, setWavePhase] = useState(0);
  useEffect(() => {
    if (isSpeaking || isRecording) {
      const t = setInterval(() => setWavePhase(p => (p + 1) % 360), 30);
      return () => clearInterval(t);
    }
  }, [isSpeaking, isRecording]);

  const waveBars = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const active = isSpeaking || isRecording;
      return active
        ? Math.max(4, Math.abs(Math.sin(((wavePhase + i * 22) * Math.PI) / 180) * 28 + Math.sin(((wavePhase * 1.3 + i * 15) * Math.PI) / 180) * 14))
        : 4;
    });
  }, [wavePhase, isSpeaking, isRecording]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const statusLabel = () => {
    if (visionUiState.gesture === 'hand_raise_stop') {
      return { text: 'Patient hand raised · Specialist paused & listening', dot: 'bg-amber-400 animate-pulse' };
    }
    if (visionUiState.gesture === 'chest_touch') {
      return { text: 'Patient indicates chest discomfort · Assessing telemetry', dot: 'bg-rose-400 animate-pulse' };
    }
    if (isSpeaking && !isMuted) return { text: `${persona.name.split(',')[0]} is speaking`, dot: 'bg-emerald-400 animate-pulse' };
    if (isRecording) return { text: 'Listening to you… (ASR Active)', dot: 'bg-teal-400 animate-pulse' };
    switch (posture) {
      case 'greeting': return { text: `${persona.name.split(',')[0]} is greeting you`, dot: 'bg-emerald-400' };
      case 'listening': return { text: `${persona.name.split(',')[0]} is listening attentively`, dot: 'bg-teal-400 animate-pulse' };
      case 'explaining': return { text: `${persona.name.split(',')[0]} is explaining clinical findings`, dot: 'bg-emerald-400' };
      case 'alerting': return { text: 'KDIGO Safety Gate Advisory Active', dot: 'bg-rose-400 animate-pulse' };
      case 'reassuring': return { text: `${persona.name.split(',')[0]} is reassuring care plan`, dot: 'bg-emerald-400' };
      case 'reviewing': return { text: `${persona.name.split(',')[0]} is reviewing diagnostic telemetry`, dot: 'bg-amber-400 animate-pulse' };
      default: return { text: '3D Clinical Tele-Specialist Online', dot: 'bg-emerald-400' };
    }
  };
  const status = statusLabel();

  // ── THREE.JS REALISTIC 3D AVATAR RIGGING ENGINE ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090d);

    const camera = new THREE.PerspectiveCamera(34, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0.16, 3.10);
    camera.lookAt(0, 0.14, 0);

    // ── 3-POINT CLINICAL LIGHTING SETUP ──
    const ambientLight = new THREE.AmbientLight(0xfcf8ee, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.4);
    keyLight.position.set(1.6, 2.2, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 1.2);
    fillLight.position.set(-1.8, 1.2, 1.6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe45c, 2.6);
    rimLight.position.set(0, 2.8, -1.8);
    scene.add(rimLight);

    const eyePointLight = new THREE.PointLight(0xffffff, 1.1, 3.2);
    eyePointLight.position.set(0, 0.28, 1.8);
    scene.add(eyePointLight);

    // Character Root Group
    const characterRoot = new THREE.Group();
    characterRoot.position.set(0, -0.08, 0);
    scene.add(characterRoot);

    // Persona-Specific Appearance Configuration
    const isThorne = persona.id.includes('thorne') || persona.id.includes('jacob');
    const isLin = persona.id.includes('lin');
    const isVance = persona.id.includes('vance');
    const isChen = persona.id.includes('chen');

    let skinToneHex = 0xdcb498; // Warm natural olive/caucasian
    let hairToneHex = 0x484852;
    let shirtToneHex = 0x1e3a8a; // Clinical blue
    let irisBase = '#5A3D28';
    let irisFiber = '#946B46';
    let irisLimbal = '#1E1008';
    let lipToneHex = 0x863d44;

    if (isThorne) {
      skinToneHex = 0xdab296;
      hairToneHex = 0x505058; // Salt-and-pepper silver
      shirtToneHex = 0x1e3a8a;
      irisBase = '#543924';
      irisFiber = '#8F6642';
      irisLimbal = '#1C0E06';
      lipToneHex = 0x823b42;
    } else if (isLin) {
      skinToneHex = 0xf0ceb4; // Golden-peach East Asian tone
      hairToneHex = 0x18181c; // Deep glossy black
      shirtToneHex = 0x0f766e; // Pharmacotherapy teal
      irisBase = '#342016';
      irisFiber = '#583622';
      irisLimbal = '#120804';
      lipToneHex = 0xa44658;
    } else if (isVance) {
      skinToneHex = 0x825241; // Deep warm bronze
      hairToneHex = 0x161618;
      shirtToneHex = 0x047857; // Emerald
      irisBase = '#26160E';
      irisFiber = '#44281A';
      irisLimbal = '#0E0603';
      lipToneHex = 0x6e353c;
    } else if (isChen) {
      skinToneHex = 0xe5bfa8; // Alabaster-ivory
      hairToneHex = 0x202024;
      shirtToneHex = 0x701a75; // Plum
      irisBase = '#382418';
      irisFiber = '#623E28';
      irisLimbal = '#140A05';
      lipToneHex = 0x9a4152;
    }

    // ── MULTI-LAYER SUBSURFACE SCATTERING SKIN SHADER ──
    const realisticSkinMat = new THREE.MeshPhysicalMaterial({
      color: skinToneHex,
      roughness: 0.52,
      metalness: 0.0,
      clearcoat: 0.08,
      clearcoatRoughness: 0.35,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xef8368), // Subsurface capillary warmth
    });

    const labCoatMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp white medical doctor coat
      roughness: 0.76,
      metalness: 0.02,
    });

    const innerShirtMat = new THREE.MeshStandardMaterial({
      color: shirtToneHex,
      roughness: 0.65,
      metalness: 0.04,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: hairToneHex,
      roughness: 0.72,
      metalness: 0.15,
    });

    // ── STRUCTURED TORSO & TAILORED LAB COAT ──
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, -0.36, 0);
    characterRoot.add(torsoGroup);

    // Upper chest & coat body
    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.48, 0.72, 28), labCoatMat);
    chestMesh.scale.set(1.18, 1.0, 0.68);
    chestMesh.position.y = -0.14;
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    torsoGroup.add(chestMesh);

    // Collared dress shirt / scrubs
    const shirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.38, 20), innerShirtMat);
    shirtMesh.scale.set(1, 1, 0.64);
    shirtMesh.position.set(0, 0.08, 0.07);
    torsoGroup.add(shirtMesh);

    // Notch Lapels
    const lapelGeo = new THREE.BoxGeometry(0.09, 0.42, 0.035);
    const leftLapel = new THREE.Mesh(lapelGeo, labCoatMat);
    leftLapel.position.set(-0.16, 0.04, 0.23);
    leftLapel.rotation.z = -0.22;
    torsoGroup.add(leftLapel);

    const rightLapel = new THREE.Mesh(lapelGeo, labCoatMat);
    rightLapel.position.set(0.16, 0.04, 0.23);
    rightLapel.rotation.z = 0.22;
    torsoGroup.add(rightLapel);

    // ── ARTICULATED GESTURING ARMS RIG ──
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.56, 0.08, 0);
    torsoGroup.add(rightArmGroup);

    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), labCoatMat);
    rightShoulder.scale.set(1.2, 1, 0.95);
    rightArmGroup.add(rightShoulder);

    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.34, 16), labCoatMat);
    rightBicep.position.set(0, -0.20, 0);
    rightArmGroup.add(rightBicep);

    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.36, 0);
    rightArmGroup.add(rightForearm);

    const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.30, 16), labCoatMat);
    rightForearmMesh.position.set(0, -0.15, 0);
    rightForearm.add(rightForearmMesh);

    // 3D Right Hand with Sculpted Fingers
    const rightHand = new THREE.Group();
    rightHand.position.set(0, -0.32, 0);
    rightForearm.add(rightHand);

    rightHand.add(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.035), realisticSkinMat));
    for (let f = -1.5; f <= 1.5; f += 1.0) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.010, 0.08, 8), realisticSkinMat);
      finger.position.set(f * 0.024, -0.09, 0);
      rightHand.add(finger);
    }
    const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 0.07, 8), realisticSkinMat);
    thumb.position.set(0.055, -0.04, 0.02);
    thumb.rotation.z = -0.55;
    rightHand.add(thumb);

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.56, 0.08, 0);
    torsoGroup.add(leftArmGroup);

    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), labCoatMat);
    leftShoulder.scale.set(1.2, 1, 0.95);
    leftArmGroup.add(leftShoulder);

    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.34, 16), labCoatMat);
    leftBicep.position.set(0, -0.20, 0);
    leftArmGroup.add(leftBicep);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.30, 16), labCoatMat);
    leftForearm.position.set(0, -0.50, 0);
    leftArmGroup.add(leftForearm);

    // Dual-Tube Stethoscope
    const stethMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
    const stethMetalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.95 });

    const stethCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.24, 0.36, 0.1),
      new THREE.Vector3(-0.28, 0.12, 0.25),
      new THREE.Vector3(-0.14, -0.14, 0.27),
      new THREE.Vector3(0.0, -0.21, 0.28),
      new THREE.Vector3(0.14, -0.14, 0.27),
      new THREE.Vector3(0.28, 0.12, 0.25),
      new THREE.Vector3(0.24, 0.36, 0.1),
    ]);
    const stethMesh = new THREE.Mesh(new THREE.TubeGeometry(stethCurve, 36, 0.015, 8, false), stethMat);
    torsoGroup.add(stethMesh);

    // Bell & Diaphragm Chestpiece
    const bellMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.048, 0.02, 24), stethMetalMat);
    bellMesh.rotation.x = Math.PI / 2;
    bellMesh.position.set(-0.06, -0.23, 0.28);
    torsoGroup.add(bellMesh);

    // Clinician Badge
    const badgeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.015), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
    badgeMesh.position.set(0.3, 0.02, 0.23);
    badgeMesh.rotation.y = -0.05;
    torsoGroup.add(badgeMesh);

    const badgeHeaderMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.04, 0.016),
      new THREE.MeshStandardMaterial({ color: persona.avatarColor ? new THREE.Color(persona.avatarColor) : new THREE.Color(0xffe45c) })
    );
    badgeHeaderMesh.position.set(0.3, 0.075, 0.232);
    badgeHeaderMesh.rotation.y = -0.05;
    torsoGroup.add(badgeHeaderMesh);

    // ── NECK & HEAD RIG ──
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.06, 0);
    characterRoot.add(neckGroup);

    const neckGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.28, 24);
    const neckMesh = new THREE.Mesh(neckGeo, realisticSkinMat);
    neckMesh.position.y = 0.04;
    neckMesh.castShadow = true;
    neckGroup.add(neckMesh);

    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.25, 0.02);
    neckGroup.add(headPivot);

    const headMesh = new THREE.Mesh(createRealisticHeadGeometry(), realisticSkinMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headPivot.add(headMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.085, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, realisticSkinMat);
    leftEar.scale.set(0.35, 1.25, 0.75);
    leftEar.position.set(-0.35, 0.06, -0.04);
    leftEar.rotation.z = -0.15;
    headPivot.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, realisticSkinMat);
    rightEar.scale.set(0.35, 1.25, 0.75);
    rightEar.position.set(0.35, 0.06, -0.04);
    rightEar.rotation.z = 0.15;
    headPivot.add(rightEar);

    // ── TWO-LAYER OPTICAL EYES WITH CLEARCOAT CORNEA ──
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(0, 0.095, 0.285);
    headPivot.add(eyeGroup);

    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xfefefe, roughness: 0.12 });
    const irisTex = createRealisticIrisTexture(irisBase, irisFiber, irisLimbal);
    const irisMat = new THREE.MeshStandardMaterial({ map: irisTex, roughness: 0.18 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020202 });
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      transparent: true,
      roughness: 0.03,
      ior: 1.336,
    });

    const createRealisticEye = (xPos: number) => {
      const eyeBall = new THREE.Group();
      eyeBall.position.set(xPos, 0, 0);

      // Sclera sphere
      eyeBall.add(new THREE.Mesh(new THREE.SphereGeometry(0.065, 24, 24), scleraMat));

      // Textured Iris Disc
      const irisMesh = new THREE.Mesh(new THREE.CircleGeometry(0.038, 24), irisMat);
      irisMesh.position.set(0, 0, 0.062);
      eyeBall.add(irisMesh);

      // Central Pupil
      const pupilMesh = new THREE.Mesh(new THREE.CircleGeometry(0.017, 20), pupilMat);
      pupilMesh.position.set(0, 0, 0.063);
      eyeBall.add(pupilMesh);

      // Crystal wet Cornea Dome
      const corneaMesh = new THREE.Mesh(new THREE.SphereGeometry(0.044, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), corneaMat);
      corneaMesh.position.set(0, 0, 0.052);
      eyeBall.add(corneaMesh);

      return eyeBall;
    };

    const leftEye = createRealisticEye(-0.115);
    const rightEye = createRealisticEye(0.115);
    eyeGroup.add(leftEye);
    eyeGroup.add(rightEye);

    // Eyelids
    const eyelidMat = new THREE.MeshStandardMaterial({ color: skinToneHex, roughness: 0.55 });
    const leftUpperLid = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), eyelidMat);
    leftUpperLid.position.set(-0.115, 0, 0);
    leftUpperLid.rotation.x = -Math.PI / 2 + 0.22;
    eyeGroup.add(leftUpperLid);

    const rightUpperLid = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), eyelidMat);
    rightUpperLid.position.set(0.115, 0, 0);
    rightUpperLid.rotation.x = -Math.PI / 2 + 0.22;
    eyeGroup.add(rightUpperLid);

    // ── ANATOMICALLY CONTOURED EYEBROWS ──
    const browMat = new THREE.MeshStandardMaterial({ color: hairToneHex, roughness: 0.88 });
    const createEyebrow = (isLeft: boolean) => {
      const browGroup = new THREE.Group();
      const dir = isLeft ? -1 : 1;
      // Medial brow head
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.008, 0.065, 12), browMat);
      inner.rotation.z = dir * (Math.PI / 2 - 0.12);
      inner.position.set(dir * 0.03, 0, 0);
      browGroup.add(inner);

      // Lateral brow tail arching downward
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.055, 12), browMat);
      outer.rotation.z = dir * (Math.PI / 2 + 0.28);
      outer.position.set(dir * 0.08, -0.008, -0.004);
      browGroup.add(outer);

      browGroup.position.set(dir * 0.115, 0.096, 0.058);
      return browGroup;
    };
    eyeGroup.add(createEyebrow(true));
    eyeGroup.add(createEyebrow(false));

    // ── 3D ARTICULATED MOUTH & VISEME RIG ──
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.10, 0.31);
    headPivot.add(mouthGroup);

    mouthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), new THREE.MeshBasicMaterial({ color: 0x140406 })));

    const teethMat = new THREE.MeshStandardMaterial({ color: 0xfcfcfc, roughness: 0.25 });
    const upperTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.018, 0.022), teethMat);
    upperTeeth.position.set(0, 0.012, -0.01);
    mouthGroup.add(upperTeeth);

    const lowerTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.016, 0.022), teethMat);
    lowerTeeth.position.set(0, -0.012, -0.01);
    mouthGroup.add(lowerTeeth);

    const lipMat = new THREE.MeshStandardMaterial({ color: lipToneHex, roughness: 0.48, metalness: 0.04 });
    const upperLip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.115, 16), lipMat);
    upperLip.rotation.z = Math.PI / 2;
    upperLip.position.set(0, 0.022, 0.025);
    mouthGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.015, 0.115, 16), lipMat);
    lowerLip.rotation.z = Math.PI / 2;
    lowerLip.position.set(0, -0.02, 0.025);
    mouthGroup.add(lowerLip);

    // ── VOLUMETRIC STYLED HAIR & ACCESSORIES ──
    if (isThorne) {
      // Natural textured hair coiffure with layered crown
      const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.395, 32, 32), hairMat);
      hairCrown.scale.set(0.97, 1.12, 1.06);
      hairCrown.position.set(0, 0.165, -0.04);
      headPivot.add(hairCrown);

      // Refined side-part hairline wave
      const frontWave = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.020, 0.26, 16), hairMat);
      frontWave.rotation.z = Math.PI / 2 - 0.15;
      frontWave.rotation.x = 0.45;
      frontWave.position.set(-0.04, 0.27, 0.22);
      headPivot.add(frontWave);

      // Natural silver-flecked temples and neat sideburns
      const silverMat = new THREE.MeshStandardMaterial({ color: 0x94949c, roughness: 0.75 });
      const leftTemple = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.016, 0.16, 12), silverMat);
      leftTemple.position.set(-0.35, 0.11, 0.05);
      leftTemple.rotation.z = 0.08;
      headPivot.add(leftTemple);

      const rightTemple = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.016, 0.16, 12), silverMat);
      rightTemple.position.set(0.35, 0.11, 0.05);
      rightTemple.rotation.z = -0.08;
      headPivot.add(rightTemple);

      // Designer Titanium Wireframe Spectacles
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, 0.095, 0.365);
      headPivot.add(glassesGroup);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.9 });
      const lensMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.96, transparent: true, roughness: 0.03 });

      const leftFrame = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.005, 12, 32), frameMat);
      leftFrame.position.set(-0.115, 0, 0);
      glassesGroup.add(leftFrame);
      const leftLens = new THREE.Mesh(new THREE.CircleGeometry(0.059, 24), lensMat);
      leftLens.position.set(-0.115, 0, 0);
      glassesGroup.add(leftLens);

      const rightFrame = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.005, 12, 32), frameMat);
      rightFrame.position.set(0.115, 0, 0);
      glassesGroup.add(rightFrame);
      const rightLens = new THREE.Mesh(new THREE.CircleGeometry(0.059, 24), lensMat);
      rightLens.position.set(0.115, 0, 0);
      glassesGroup.add(rightLens);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.055, 8), frameMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.012, 0);
      glassesGroup.add(bridge);

      // Temples connecting back towards the ears
      const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.32, 8), frameMat);
      leftArm.rotation.x = Math.PI / 2;
      leftArm.position.set(-0.178, 0.005, -0.15);
      glassesGroup.add(leftArm);

      const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.32, 8), frameMat);
      rightArm.rotation.x = Math.PI / 2;
      rightArm.position.set(0.178, 0.005, -0.15);
      glassesGroup.add(rightArm);
    } else if (isLin || isChen) {
      // Sleek volumetric professional bob
      const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.405, 32, 32), hairMat);
      hairCrown.scale.set(0.97, 1.14, 1.07);
      hairCrown.position.set(0, 0.175, -0.04);
      headPivot.add(hairCrown);

      // Gentle sweeping parted fringe across upper brow
      const fringeCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.012, 0.28, 16), hairMat);
      fringeCurve.rotation.z = Math.PI / 2 - 0.22;
      fringeCurve.rotation.x = 0.52;
      fringeCurve.position.set(-0.05, 0.26, 0.22);
      headPivot.add(fringeCurve);

      const fringeSweep = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.010, 0.22, 16), hairMat);
      fringeSweep.rotation.z = Math.PI / 2 + 0.18;
      fringeSweep.rotation.x = 0.50;
      fringeSweep.position.set(0.08, 0.27, 0.21);
      headPivot.add(fringeSweep);

      // Tapered cheekbone-framing locks
      const leftTress = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.014, 0.36, 16), hairMat);
      leftTress.position.set(-0.31, 0.06, 0.10);
      leftTress.rotation.z = -0.12;
      leftTress.rotation.x = 0.10;
      headPivot.add(leftTress);

      const rightTress = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.014, 0.36, 16), hairMat);
      rightTress.position.set(0.31, 0.06, 0.10);
      rightTress.rotation.z = 0.12;
      rightTress.rotation.x = 0.10;
      headPivot.add(rightTress);
    } else {
      const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.395, 30, 30), hairMat);
      hairCrown.scale.set(0.96, 1.09, 1.04);
      hairCrown.position.set(0, 0.16, -0.03);
      headPivot.add(hairCrown);
    }

    // ── 3D SPATIAL HOLOGRAPHIC TELEMETRY HUD ──
    const holoGroup = new THREE.Group();
    holoGroup.position.set(0.68, 0.14, 0.3);
    scene.add(holoGroup);

    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.30, 0.007, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true, transparent: true, opacity: 0.65 })
    );
    holoGroup.add(holoRing);

    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.17, 0.18, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe45c, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    holoGroup.add(innerRing);

    const createDataNode = (yOffset: number, color: number) => {
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.032),
        new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.85 })
      );
      node.position.set(0.18, yOffset, 0);
      holoGroup.add(node);
      return node;
    };
    const node1 = createDataNode(0.16, 0x00f5d4);
    const node2 = createDataNode(0.0, 0xffe45c);
    const node3 = createDataNode(-0.16, 0xf43f5e);

    // ── 60 FPS RENDER LOOP WITH SYNCHRONOUS VISION TRACKING ──
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight || 480;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    const render = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Read current vision synchronously from ref (Zero React Re-render Lag!)
      const curVision = visionRef.current;

      holoGroup.visible = showHoloHud;
      if (showHoloHud) {
        holoRing.rotation.z += delta * 0.45;
        holoRing.rotation.y += delta * 0.25;
        innerRing.rotation.z -= delta * 0.35;
        node1.rotation.y += delta * 1.5;
        node2.rotation.x += delta * 1.8;
        node3.rotation.z += delta * 1.2;

        const isChestAlert = curVision?.gesture === 'chest_touch' || curVision?.affect === 'pain_grimace';
        const pulseSpeed = isChestAlert ? 12.0 : 6.5;
        const pulse = 1 + Math.sin(elapsedTime * pulseSpeed) * (isChestAlert ? 0.08 : 0.04);
        holoRing.scale.set(pulse, pulse, pulse);
      }

      // Autonomic sinusoidal breathing
      const breath = Math.sin(elapsedTime * 1.45) * 0.015;
      torsoGroup.position.y = -0.36 + breath;
      chestMesh.scale.z = 0.68 + breath * 1.2;

      // Conversational nod
      let nodOffset = 0;
      if (posture === 'listening' || isRecording || curVision?.affect === 'nodding') {
        nodOffset = Math.sin(elapsedTime * 3.2) * 0.04;
      }

      // Procedural natural blinking
      blinkTimer += delta;
      if (blinkTimer > 3.5 && !isBlinking) {
        if (Math.random() > 0.35) {
          isBlinking = true;
          blinkProgress = 0;
        }
        blinkTimer = 0;
      }
      if (isBlinking) {
        blinkProgress += delta * 14;
        if (blinkProgress >= Math.PI) {
          isBlinking = false;
          blinkProgress = 0;
        }
      }
      const blinkAngle = Math.sin(blinkProgress) * 0.85;
      leftUpperLid.rotation.x = -Math.PI / 2 + 0.22 + blinkAngle;
      rightUpperLid.rotation.x = -Math.PI / 2 + 0.22 + blinkAngle;

      // ── SMOOTH LOW-PASS COMPUTER VISION GAZE & EYE-CONTACT REACTION ──
      let targetLookX = mousePos.x * 0.30;
      let targetLookY = -mousePos.y * 0.18;

      if (curVision?.patientPresent) {
        // Blend mouse look with smoothed patient webcam face tracking
        targetLookX = (curVision.faceCentroid.x * 0.36 + mousePos.x * 0.12);
        targetLookY = (curVision.faceCentroid.y * 0.22 - mousePos.y * 0.08);
      }

      let posturePitch = 0;
      let postureYaw = 0;
      let postureRoll = 0;

      if (curVision?.gesture === 'chest_touch' || curVision?.affect === 'pain_grimace') {
        posturePitch = 0.08;
        postureRoll = -0.04;
      } else if (curVision?.gesture === 'wave_hello') {
        posturePitch = 0.02;
        postureRoll = 0.03;
      } else if (posture === 'listening' || curVision?.gesture === 'hand_raise_stop') {
        posturePitch = 0.08;
        postureRoll = -0.04;
      } else if (posture === 'alerting') {
        posturePitch = -0.02;
      } else if (posture === 'reassuring') {
        postureRoll = 0.035;
        posturePitch = 0.035;
      }

      headPivot.rotation.y += (targetLookX + postureYaw - headPivot.rotation.y) * 0.08;
      headPivot.rotation.x += (targetLookY + posturePitch + nodOffset - headPivot.rotation.x) * 0.08;
      headPivot.rotation.z += (postureRoll - headPivot.rotation.z) * 0.06;

      // Eyes follow patient gaze directly
      const eyeLookX = (targetLookX * 1.2 - leftEye.rotation.y) * 0.15;
      const eyeLookY = (targetLookY * 1.2 - leftEye.rotation.x) * 0.15;
      leftEye.rotation.y += eyeLookX;
      rightEye.rotation.y += eyeLookX;
      leftEye.rotation.x += eyeLookY;
      rightEye.rotation.x += eyeLookY;

      // ── 3D ARTICULATED ARM GESTURES ──
      let targetRightArmRotX = 0.1;
      let targetRightArmRotZ = 0.15;
      let targetRightForearmRotX = -0.25;

      if (curVision?.gesture === 'wave_hello') {
        targetRightArmRotX = -1.2;
        targetRightArmRotZ = -0.65;
        targetRightForearmRotX = -1.1;
        rightHand.rotation.z = Math.sin(elapsedTime * 8.0) * 0.35;
      } else if (curVision?.gesture === 'chest_touch' || curVision?.affect === 'pain_grimace') {
        targetRightArmRotX = -0.85;
        targetRightArmRotZ = 0.45;
        targetRightForearmRotX = -1.2;
        rightHand.rotation.z = 0.2;
      } else if (isSpeaking && !isMuted) {
        const speechSway = Math.sin(elapsedTime * 4.5) * 0.18;
        targetRightArmRotX = -0.55 + speechSway;
        targetRightArmRotZ = -0.25;
        targetRightForearmRotX = -0.75 + speechSway * 0.5;
        rightHand.rotation.z = Math.sin(elapsedTime * 3.0) * 0.12;
      } else if (curVision?.gesture === 'hand_raise_stop') {
        targetRightArmRotX = -0.6;
        targetRightArmRotZ = -0.15;
        targetRightForearmRotX = -0.5;
        rightHand.rotation.z = 0;
      }

      rightArmGroup.rotation.x += (targetRightArmRotX - rightArmGroup.rotation.x) * 0.08;
      rightArmGroup.rotation.z += (targetRightArmRotZ - rightArmGroup.rotation.z) * 0.08;
      rightForearm.rotation.x += (targetRightForearmRotX - rightForearm.rotation.x) * 0.08;

      // 3D Lip-Sync Phonetics
      let targetJawOpen = 0;
      let targetLipSpread = 1.0;
      let targetLipPucker = 0;
      let targetTeethShow = 0;

      if (isSpeaking && !isMuted) {
        const s1 = Math.sin(elapsedTime * 24.0);
        const s2 = Math.sin(elapsedTime * 38.0);
        const speechEnvelope = Math.max(0, s1 * 0.7 + s2 * 0.3);

        if (activeViseme === 'MBP') {
          targetJawOpen = 0.006;
          targetLipSpread = 0.96;
          targetLipPucker = 0.01;
        } else if (activeViseme === 'OH') {
          targetJawOpen = 0.042 * speechEnvelope;
          targetLipSpread = 0.8;
          targetLipPucker = 0.032;
          targetTeethShow = 0.005;
        } else if (activeViseme === 'EE') {
          targetJawOpen = 0.022 * speechEnvelope;
          targetLipSpread = 1.32;
          targetLipPucker = -0.01;
          targetTeethShow = 0.016;
        } else if (activeViseme === 'FV') {
          targetJawOpen = 0.016 * speechEnvelope;
          targetLipSpread = 1.06;
          targetTeethShow = 0.012;
        } else {
          targetJawOpen = 0.035 * speechEnvelope;
          targetLipSpread = 1.04;
          targetTeethShow = 0.01;
        }
      }

      upperLip.position.y += (0.022 + targetTeethShow * 0.5 - upperLip.position.y) * 0.35;
      lowerLip.position.y += (-0.02 - targetJawOpen - lowerLip.position.y) * 0.35;
      upperLip.scale.x += (targetLipSpread - upperLip.scale.x) * 0.35;
      lowerLip.scale.x += (targetLipSpread - lowerLip.scale.x) * 0.35;
      upperLip.position.z = 0.025 + targetLipPucker;
      lowerLip.position.z = 0.025 + targetLipPucker;
      upperTeeth.position.y = 0.012 - targetTeethShow * 0.3;
      lowerTeeth.position.y = -0.012 - targetJawOpen * 0.6;

      // Camera Angle Control
      let targetCamX = 0;
      let targetCamY = 0.16;
      let targetCamZ = 3.10;
      let targetCamFov = 35;

      if (cameraMode === 'portrait') {
        targetCamX = 0;
        targetCamY = 0.16;
        targetCamZ = 3.10;
        targetCamFov = 35;
      } else if (cameraMode === 'cinematic') {
        targetCamX = -0.72;
        targetCamY = 0.18;
        targetCamZ = 3.15;
        targetCamFov = 37;
      } else if (cameraMode === 'hologram') {
        targetCamX = 0.38;
        targetCamY = 0.16;
        targetCamZ = 3.25;
        targetCamFov = 38;
      } else if (cameraMode === 'orbit') {
        const radius = 3.05;
        targetCamX = Math.sin(orbitAngles.yaw) * radius;
        targetCamZ = Math.cos(orbitAngles.yaw) * radius;
        targetCamY = 0.16 + orbitAngles.pitch;
      }

      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      if (Math.abs(camera.fov - targetCamFov) > 0.1) {
        camera.fov += (targetCamFov - camera.fov) * 0.05;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(0, 0.14, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [persona, posture, isSpeaking, isMuted, activeViseme, showHoloHud, cameraMode, mousePos, orbitAngles, isRecording]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden"
      style={{ background: '#080808', border: '2px solid var(--border)' }}
      onMouseMove={e => {
        if (!containerRef.current) return;
        const r = containerRef.current.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        setMousePos({ x: nx * 2, y: ny * 2 });

        if (isOrbitDragging) {
          const dx = (e.clientX - dragStartRef.current.x) * 0.01;
          const dy = (e.clientY - dragStartRef.current.y) * 0.01;
          setOrbitAngles(prev => ({
            yaw: prev.yaw - dx,
            pitch: Math.max(-0.6, Math.min(0.6, prev.pitch - dy)),
          }));
          dragStartRef.current = { x: e.clientX, y: e.clientY };
        }
      }}
      onMouseDown={e => {
        if (cameraMode === 'orbit') {
          setIsOrbitDragging(true);
          dragStartRef.current = { x: e.clientX, y: e.clientY };
        }
      }}
      onMouseUp={() => setIsOrbitDragging(false)}
      onMouseLeave={() => {
        setMousePos({ x: 0, y: 0 });
        setIsOrbitDragging(false);
      }}
    >
      {/* ── TOP STATUS OVERLAY ── */}
      <div
        className="absolute top-0 inset-x-0 z-30 p-3 flex items-center justify-between pointer-events-auto"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold"
            style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFE45C' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse he-keep-round" />
            3D DIGITAL HUMAN SPECIALIST · CV GESTURES
          </div>
          {isCallActive && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold text-white"
              style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse he-keep-round" />
              SESSION {fmt(callDuration)}
            </div>
          )}
        </div>

        {/* Camera Views, Hologram, Vision Toggles */}
        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center text-[10px] font-mono"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <button
              onClick={() => setCameraMode('portrait')}
              className="px-2 py-1 cursor-pointer transition-colors"
              style={{
                background: cameraMode === 'portrait' ? '#FFE45C' : 'transparent',
                color: cameraMode === 'portrait' ? '#080808' : 'rgba(255,255,255,0.7)',
                fontWeight: cameraMode === 'portrait' ? 'bold' : 'normal',
              }}
              title="Close-Up Consultation Portrait"
            >
              PORTRAIT
            </button>
            <button
              onClick={() => setCameraMode('cinematic')}
              className="px-2 py-1 cursor-pointer transition-colors"
              style={{
                background: cameraMode === 'cinematic' ? '#FFE45C' : 'transparent',
                color: cameraMode === 'cinematic' ? '#080808' : 'rgba(255,255,255,0.7)',
                fontWeight: cameraMode === 'cinematic' ? 'bold' : 'normal',
              }}
              title="3/4 Cinematic Studio View"
            >
              3/4 STUDIO
            </button>
            <button
              onClick={() => setCameraMode('hologram')}
              className="px-2 py-1 cursor-pointer transition-colors"
              style={{
                background: cameraMode === 'hologram' ? '#FFE45C' : 'transparent',
                color: cameraMode === 'hologram' ? '#080808' : 'rgba(255,255,255,0.7)',
                fontWeight: cameraMode === 'hologram' ? 'bold' : 'normal',
              }}
              title="Diagnostic Telemetry Angle"
            >
              HOLO VIEW
            </button>
            <button
              onClick={() => setCameraMode('orbit')}
              className="px-2 py-1 cursor-pointer transition-colors"
              style={{
                background: cameraMode === 'orbit' ? '#FFE45C' : 'transparent',
                color: cameraMode === 'orbit' ? '#080808' : 'rgba(255,255,255,0.7)',
                fontWeight: cameraMode === 'orbit' ? 'bold' : 'normal',
              }}
              title="Click & Drag to Orbit 360°"
            >
              360° ORBIT
            </button>
          </div>

          <button
            onClick={() => setShowHoloHud(v => !v)}
            className="px-2 py-1 text-[10px] font-mono font-bold cursor-pointer transition-colors"
            style={{
              background: showHoloHud ? 'rgba(0,245,212,0.2)' : 'rgba(255,255,255,0.06)',
              color: showHoloHud ? '#00F5D4' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${showHoloHud ? '#00F5D4' : 'rgba(255,255,255,0.12)'}`,
            }}
            title="Toggle 3D Floating Bio-HUD"
          >
            HOLO HUD {showHoloHud ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowVisionFeed(v => !v)}
            className="px-2 py-1 text-[10px] font-mono font-bold cursor-pointer transition-colors"
            style={{
              background: showVisionFeed ? 'rgba(255,228,92,0.25)' : 'rgba(255,255,255,0.06)',
              color: showVisionFeed ? '#FFE45C' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${showVisionFeed ? '#FFE45C' : 'rgba(255,255,255,0.12)'}`,
            }}
            title="Toggle Computer Vision Patient Feed & Gestures"
          >
            VISION AI {showVisionFeed ? 'ON' : 'OFF'}
          </button>

          {onToggle2DMode && (
            <button
              onClick={onToggle2DMode}
              className="px-2 py-1 text-[10px] font-mono cursor-pointer transition-colors"
              style={{
                background: is2DMode ? '#FFE45C' : 'rgba(255,255,255,0.06)',
                color: is2DMode ? '#080808' : 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              title="Toggle 2D Photo Stream fallback"
            >
              {is2DMode ? '2D PHOTO' : '3D WEBGL'}
            </button>
          )}
        </div>
      </div>

      {/* ── 3D WEBGL VIEWPORT ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '480px' }}>
        <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

        {cameraMode === 'orbit' && (
          <div
            className="absolute top-14 left-3 z-20 text-[10px] font-mono px-2 py-1 pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.75)', color: '#FFE45C', border: '1px solid rgba(255,228,92,0.3)' }}
          >
            DRAG TO ROTATE 360° · REAL-TIME WEBGL SPATIAL RIG
          </div>
        )}

        {/* ── 3D SPATIAL TELEMETRY HUD CARD ── */}
        {showHoloHud && (
          <div
            className="absolute top-16 right-4 z-20 p-2.5 max-w-[210px] pointer-events-none"
            style={{
              background: 'rgba(10,12,18,0.78)',
              border: '1px solid rgba(0,245,212,0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,245,212,0.12)',
            }}
          >
            <div className="flex items-center justify-between text-[9px] font-mono text-teal-400 border-b border-teal-500/20 pb-1 mb-1.5">
              <span>SPATIAL BIO-HUD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse he-keep-round" />
            </div>
            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex justify-between items-center text-white/90">
                <span className="text-white/50">eGFR:</span>
                <span className="font-bold text-amber-300">52 mL/min</span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span className="text-white/50">NT-proBNP:</span>
                <span className={`font-bold ${visionUiState.gesture === 'chest_touch' ? 'text-rose-400 animate-pulse font-extrabold' : 'text-rose-300'}`}>
                  480 pg/mL
                </span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span className="text-white/50">CYP2C9:</span>
                <span className="font-bold text-teal-300">*1/*3 Intermediate</span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span className="text-white/50">GAZE TRACK:</span>
                <span className="text-emerald-400 font-bold">{visionUiState.patientPresent ? 'LOCKED ON PATIENT' : 'STANDBY'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── STABILIZED COMPUTER VISION PiP & TEST BAR ── */}
        {showVisionFeed && (
          <div
            className="absolute bottom-20 right-4 z-30 p-2.5 w-64 pointer-events-auto"
            style={{
              background: 'rgba(8,10,14,0.92)',
              border: '1.5px solid var(--border)',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center justify-between mb-1 text-[9px] font-mono font-bold text-amber-300">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse he-keep-round" />
                <span>PATIENT VISION AI</span>
                {visionSimulated && <span className="text-[8px] text-white/50">(STABILIZED)</span>}
              </div>
              <span className="text-white/60">30 FPS</span>
            </div>

            <div className="relative w-full h-24 bg-black/80 overflow-hidden border border-white/10 flex items-center justify-center mb-1.5">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {visionUiState.patientPresent && (
                <div
                  className="absolute pointer-events-none transition-all duration-200"
                  style={{
                    left: `${(1 - (visionUiState.faceCentroid.x * 0.5 + 0.5)) * 75}%`,
                    top: `${(visionUiState.faceCentroid.y * 0.5 + 0.5) * 55}%`,
                    width: '38px',
                    height: '38px',
                    border: '1.5px dashed #00F5D4',
                    borderRadius: '4px',
                  }}
                >
                  <span className="absolute -top-3 left-0 text-[7px] font-mono bg-teal-900/90 text-teal-300 px-1">
                    PATIENT
                  </span>
                </div>
              )}

              {visionUiState.gesture && visionUiState.gesture !== 'none' && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 text-[8px] font-mono font-bold bg-amber-400 text-black">
                  {visionUiState.gesture.replace(/_/g, ' ').toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-0.5 text-[9px] font-mono text-white/80 mb-2">
              <div className="flex justify-between">
                <span className="text-white/50">AFFECT:</span>
                <span className="font-bold text-teal-300 uppercase">
                  {visionUiState.affect.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">GESTURE:</span>
                <span className="font-bold text-amber-300 uppercase">
                  {visionUiState.gesture === 'none' ? 'NONE (NORMAL)' : visionUiState.gesture.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-1.5">
              <div className="text-[8px] font-mono text-white/50 mb-1">TRIGGER PATIENT GESTURE TEST:</div>
              <div className="grid grid-cols-3 gap-1 text-[8px] font-mono">
                <button
                  onClick={() => computerVisionEngine.triggerTestGesture('wave_hello')}
                  className="px-1 py-0.5 bg-white/10 hover:bg-amber-400 hover:text-black transition-colors cursor-pointer text-center text-white"
                >
                  👋 WAVE
                </button>
                <button
                  onClick={() => computerVisionEngine.triggerTestGesture('hand_raise_stop')}
                  className="px-1 py-0.5 bg-white/10 hover:bg-amber-400 hover:text-black transition-colors cursor-pointer text-center text-white"
                >
                  ✋ RAISE HAND
                </button>
                <button
                  onClick={() => computerVisionEngine.triggerTestGesture('chest_touch')}
                  className="px-1 py-0.5 bg-white/10 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer text-center text-white"
                >
                  💔 CHEST PAIN
                </button>
                <button
                  onClick={() => computerVisionEngine.triggerTestGesture('thumbs_up')}
                  className="px-1 py-0.5 bg-white/10 hover:bg-emerald-400 hover:text-black transition-colors cursor-pointer text-center text-white"
                >
                  👍 THUMBS UP
                </button>
                <button
                  onClick={() => computerVisionEngine.triggerTestAffect('pain_grimace')}
                  className="px-1 py-0.5 bg-white/10 hover:bg-rose-400 hover:text-black transition-colors cursor-pointer text-center text-white"
                >
                  😣 GRIMACE
                </button>
                <button
                  onClick={() => computerVisionEngine.triggerTestAffect('nodding')}
                  className="px-1 py-0.5 bg-white/10 hover:bg-teal-400 hover:text-black transition-colors cursor-pointer text-center text-white"
                >
                  🔄 NODDING
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE AUDIO WAVEFORM ── */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-end gap-[2px] z-20 pointer-events-none">
          {waveBars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: `${h}px`,
                background: isRecording
                  ? `hsl(175, 80%, ${40 + (i % 5) * 6}%)`
                  : isSpeaking
                  ? '#FFE45C'
                  : 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                transition: 'height 80ms ease-out',
              }}
            />
          ))}
        </div>

        {/* ── STATUS PILL + CAPTIONS ── */}
        <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-2 pointer-events-none z-20 px-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono text-white"
            style={{ background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}
          >
            <span className={`w-2 h-2 rounded-full he-keep-round ${status.dot}`} />
            {status.text}
          </div>

          {showCaptions && transcriptText && (
            <div
              className="max-w-lg px-4 py-2 text-xs text-center text-white leading-relaxed"
              style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              "{transcriptText}"
            </div>
          )}

          {isRecording && patientTranscript && (
            <div
              className="max-w-md px-3 py-1 text-xs text-center font-mono animate-pulse"
              style={{ background: 'rgba(13,148,136,0.85)', color: '#CCFBF1', border: '1px solid rgba(13,148,136,0.5)' }}
            >
              <span className="font-bold">YOU: </span>
              {patientTranscript}
            </div>
          )}
        </div>

        {/* ── AI ENGINE BADGE ── */}
        <div
          className="absolute top-14 left-3 z-20 text-[9px] font-mono px-2 py-0.5 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#FFE45C', border: '1px solid rgba(255,228,92,0.3)' }}
        >
          ENGINE: {aiModel} · 3D ARTICULATED SPECIALIST + CV
        </div>
      </div>

      {/* ── CONTROLS BAR ── */}
      <div
        className="relative z-30 p-3 flex flex-wrap items-center justify-between gap-2"
        style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={onPlay}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold cursor-pointer transition-all"
              style={{ background: '#FFE45C', color: '#080808', border: '1.5px solid rgba(255,255,255,0.2)' }}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              SPEAK
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold cursor-pointer"
              style={{ background: 'rgba(255,228,92,0.15)', color: '#FFE45C', border: '1.5px solid #FFE45C' }}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              PAUSE
            </button>
          )}

          <button
            onClick={onReplay}
            title="Replay"
            className="p-2 cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 cursor-pointer"
            style={{
              background: isMuted ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isMuted ? '#DC2626' : 'rgba(255,255,255,0.1)'}`,
              color: isMuted ? '#F87171' : 'rgba(255,255,255,0.7)',
            }}
          >
            {isMuted ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            )}
          </button>

          <div
            className="flex items-center text-[10px] font-mono"
            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
          >
            {[0.8, 1.0, 1.25].map(r => (
              <button
                key={r}
                onClick={() => onSpeechRate(r)}
                className="px-2 py-1 cursor-pointer transition-colors"
                style={{
                  background: speechRate === r ? '#FFE45C' : 'transparent',
                  color: speechRate === r ? '#080808' : 'rgba(255,255,255,0.6)',
                  fontWeight: speechRate === r ? 'bold' : 'normal',
                }}
              >
                {r}x
              </button>
            ))}
          </div>

          <button
            onClick={onToggleCaptions}
            className="px-2.5 py-1.5 text-[10px] font-mono font-bold cursor-pointer"
            style={{
              background: showCaptions ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.06)',
              color: showCaptions ? '#10B981' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${showCaptions ? '#10B981' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            CC {showCaptions ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRecording}
            className="flex items-center gap-1.5 px-4 py-2 font-mono font-bold text-[11px] cursor-pointer transition-all"
            style={{
              background: isRecording ? '#DC2626' : 'rgba(13,148,136,0.15)',
              color: isRecording ? '#FFFFFF' : '#14B8A6',
              border: `1.5px solid ${isRecording ? '#DC2626' : '#0D9488'}`,
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            {isRecording ? 'TAP TO STOP' : 'HOLD / TAP TO SPEAK'}
          </button>

          <button
            onClick={onEndCall}
            className="flex items-center gap-1.5 px-3 py-2 font-mono font-bold text-[11px] cursor-pointer text-rose-400 hover:text-white hover:bg-rose-600 transition-all"
            style={{ background: 'rgba(220,38,38,0.12)', border: '1.5px solid rgba(220,38,38,0.3)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="23" y1="1" x2="1" y2="23" /></svg>
            END SESSION
          </button>
        </div>
      </div>
    </div>
  );
};
