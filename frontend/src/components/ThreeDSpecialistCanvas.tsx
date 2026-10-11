import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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

/**
 * Creates 3D medical accessories: dual-lumen silicone stethoscope and clinician badge
 * proportioned to human anatomy (neck y ~ 1.48, chest y ~ 1.25)
 */
function createMedicalAccessories(isFemale: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = 'MedicalAccessories';

  // 1. Dual-Lumen Silicone Stethoscope Tubing
  const stethCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.09, 1.48, 0.04),
    new THREE.Vector3(-0.13, 1.38, 0.10),
    new THREE.Vector3(-0.08, 1.22, 0.14),
    new THREE.Vector3(-0.02, 1.15, 0.15),
    new THREE.Vector3(0.04, 1.20, 0.14),
    new THREE.Vector3(0.13, 1.38, 0.10),
    new THREE.Vector3(0.09, 1.48, 0.04),
  ]);

  const stethMat = new THREE.MeshStandardMaterial({
    name: 'StethoscopeSilicone',
    color: 0x1E293B,
    roughness: 0.40,
    metalness: 0.05,
  });

  const stethGeo = new THREE.TubeGeometry(stethCurve, 48, 0.009, 12, false);
  const stethMesh = new THREE.Mesh(stethGeo, stethMat);
  stethMesh.name = 'StethoscopeTubing';
  stethMesh.castShadow = true;
  group.add(stethMesh);

  // 2. Stainless Steel Dual-Frequency Chestpiece
  const bellMat = new THREE.MeshStandardMaterial({
    name: 'StethoscopeStainlessSteel',
    color: 0xE2E8F0,
    roughness: 0.18,
    metalness: 0.92,
  });

  const bellGeo = new THREE.CylinderGeometry(0.024, 0.027, 0.014, 28);
  const bellMesh = new THREE.Mesh(bellGeo, bellMat);
  bellMesh.name = 'StethoscopeBell';
  bellMesh.rotation.x = Math.PI / 2;
  bellMesh.position.set(-0.02, 1.14, 0.16);
  bellMesh.castShadow = true;
  group.add(bellMesh);

  // 3. Clinician Credentials Badge on Left Lapel
  const badgeCardGeo = new THREE.BoxGeometry(0.065, 0.09, 0.006);
  const badgeCardMat = new THREE.MeshStandardMaterial({
    name: 'ClinicianBadgeCard',
    color: 0xFFFFFF,
    roughness: 0.35,
    metalness: 0.02,
  });
  const badgeMesh = new THREE.Mesh(badgeCardGeo, badgeCardMat);
  badgeMesh.name = 'ClinicianBadge';
  badgeMesh.position.set(0.14, 1.28, 0.13);
  badgeMesh.rotation.y = -0.06;
  badgeMesh.castShadow = true;
  group.add(badgeMesh);

  const badgeHeaderGeo = new THREE.BoxGeometry(0.065, 0.022, 0.008);
  const badgeHeaderMat = new THREE.MeshStandardMaterial({
    name: 'BadgeHeaderBanner',
    color: isFemale ? 0x0284C7 : 0x1E3A8A,
    roughness: 0.30,
    metalness: 0.10,
  });
  const badgeHeader = new THREE.Mesh(badgeHeaderGeo, badgeHeaderMat);
  badgeHeader.position.set(0.14, 1.315, 0.131);
  badgeHeader.rotation.y = -0.06;
  group.add(badgeHeader);

  return group;
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
  const [showVisionFeed, setShowVisionFeed] = useState<boolean>(false);
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

  // Real-time synchronization refs for 60fps render loop (prevents WebGL context tears)
  const isSpeakingRef = useRef(isSpeaking);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  const postureRef = useRef(posture);
  useEffect(() => { postureRef.current = posture; }, [posture]);
  const activeVisemeRef = useRef(activeViseme);
  useEffect(() => { activeVisemeRef.current = activeViseme; }, [activeViseme]);
  const cameraModeRef = useRef(cameraMode);
  useEffect(() => { cameraModeRef.current = cameraMode; }, [cameraMode]);
  const showHoloHudRef = useRef(showHoloHud);
  useEffect(() => { showHoloHudRef.current = showHoloHud; }, [showHoloHud]);
  const mousePosRef = useRef(mousePos);
  useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);
  const orbitAnglesRef = useRef(orbitAngles);
  useEffect(() => { orbitAnglesRef.current = orbitAngles; }, [orbitAngles]);
  const isRecordingRef = useRef(isRecording);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  // ── THREE.JS REALISTIC 3D AVATAR RIGGING ENGINE ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDisposed = false;
    let animationFrameId: number;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090d);

    const camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / (canvas.clientHeight || 480), 0.1, 100);
    camera.position.set(0, 0.22, 1.25);
    camera.lookAt(0, 0.22, 0);

    // ── 3-POINT CLINICAL LIGHTING SETUP ──
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.0);
    keyLight.position.set(1.4, 2.2, 1.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 1.0);
    fillLight.position.set(-1.6, 1.2, 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(0, 2.4, -1.8);
    scene.add(rimLight);

    const eyeCatchLight = new THREE.PointLight(0xffffff, 0.8, 3.0);
    eyeCatchLight.position.set(0, 0.28, 1.2);
    scene.add(eyeCatchLight);

    // Character Root Group (framed chest-up: head y ~ 0.24, crown y ~ 0.39, chest y ~ -0.11)
    const characterRoot = new THREE.Group();
    characterRoot.position.set(0, -1.36, 0);
    scene.add(characterRoot);

    // References to animated 3D character nodes & bones
    let headMesh: THREE.SkinnedMesh | null = null;
    let teethMesh: THREE.SkinnedMesh | null = null;
    let headBone: THREE.Bone | null = null;
    let neckBone: THREE.Bone | null = null;
    let spineBone: THREE.Bone | null = null;
    let rightArmBone: THREE.Bone | null = null;
    let leftEyeBone: THREE.Bone | null = null;
    let rightEyeBone: THREE.Bone | null = null;

    const baseHeadRot = new THREE.Euler();
    const baseNeckRot = new THREE.Euler();
    const baseSpineRot = new THREE.Euler();
    const baseRightArmRot = new THREE.Euler();
    const baseLeftEyeRot = new THREE.Euler();
    const baseRightEyeRot = new THREE.Euler();

    // Determine model path based on clinician persona
    const isFemale = persona.id.includes('chen') || persona.id.includes('lin');
    const glbUrl = isFemale ? '/models/specialist-doctor-chen.glb' : '/models/specialist-doctor-vance.glb';

    // Helper to configure realistic clinician model nodes
    const setupModelNodes = (model: THREE.Group) => {
      model.traverse((child) => {
        // Ensure unobstructed eyes: hide glasses on male clinician
        if (child.name === 'Wolf3D_Glasses') {
          child.visible = false;
        }

        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mesh = child as THREE.Mesh;

          if (child.name === 'Wolf3D_Head' || child.name === 'DoctorHead') {
            headMesh = child as THREE.SkinnedMesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.48;
              mat.metalness = 0.0;
            }
          } else if (child.name === 'Wolf3D_Teeth') {
            teethMesh = child as THREE.SkinnedMesh;
            if (mesh.material) {
              (mesh.material as THREE.MeshStandardMaterial).roughness = 0.35;
            }
          } else if (child.name === 'Wolf3D_Hair') {
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.75;
              mat.metalness = 0.04;
            }
          } else if (child.name === 'Wolf3D_Outfit_Top') {
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.60;
              mat.metalness = 0.02;
            }
          } else if (child.name === 'EyeLeft' || child.name === 'EyeRight') {
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.08;
              mat.metalness = 0.0;
            }
          }
        }

        if ((child as THREE.Bone).isBone) {
          if (child.name === 'Head') {
            headBone = child as THREE.Bone;
            baseHeadRot.copy(headBone.rotation);
          } else if (child.name === 'Neck') {
            neckBone = child as THREE.Bone;
            baseNeckRot.copy(neckBone.rotation);
          } else if (child.name === 'Spine2') {
            spineBone = child as THREE.Bone;
            baseSpineRot.copy(spineBone.rotation);
          } else if (child.name === 'RightArm') {
            rightArmBone = child as THREE.Bone;
            baseRightArmRot.copy(rightArmBone.rotation);
          } else if (child.name === 'LeftEye') {
            leftEyeBone = child as THREE.Bone;
            baseLeftEyeRot.copy(leftEyeBone.rotation);
          } else if (child.name === 'RightEye') {
            rightEyeBone = child as THREE.Bone;
            baseRightEyeRot.copy(rightEyeBone.rotation);
          }
        }
      });

      // Attach 3D medical accessories (stethoscope & credentials badge)
      const accessories = createMedicalAccessories(isFemale);
      model.add(accessories);
    };

    // Load Genuine Rigged Human Clinician Model
    const loader = new GLTFLoader();
    loader.load(
      glbUrl,
      (gltf) => {
        if (isDisposed) return;
        setupModelNodes(gltf.scene);
        characterRoot.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.warn('Could not load primary GLB model, checking fallback:', error);
        loader.load('/models/specialist-doctor.glb', (fallbackGltf) => {
          if (isDisposed) return;
          setupModelNodes(fallbackGltf.scene);
          characterRoot.add(fallbackGltf.scene);
        });
      }
    );

    // ── 3D SPATIAL HOLOGRAPHIC TELEMETRY HUD ──
    const holoGroup = new THREE.Group();
    holoGroup.position.set(0.46, 0.22, 0.15); // Lateral position beside shoulder (never covering face)
    scene.add(holoGroup);

    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.005, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true, transparent: true, opacity: 0.65 })
    );
    holoGroup.add(holoRing);

    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.14, 0.15, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe45c, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    holoGroup.add(innerRing);

    const createDataNode = (yOffset: number, color: number) => {
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.024),
        new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.85 })
      );
      node.position.set(0.14, yOffset, 0);
      holoGroup.add(node);
      return node;
    };
    const node1 = createDataNode(0.12, 0x00f5d4);
    const node2 = createDataNode(0.0, 0xffe45c);
    const node3 = createDataNode(-0.12, 0xf43f5e);

    // ── 60 FPS RENDER LOOP WITH SYNCHRONOUS VISION TRACKING ──
    let lastTime = performance.now();
    let elapsedTime = 0;
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

    // Helper to drive morph targets safely
    const driveMorph = (mesh: THREE.SkinnedMesh | null, names: string[], val: number, speed: number = 0.35) => {
      if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      for (const name of names) {
        const idx = mesh.morphTargetDictionary[name];
        if (idx !== undefined) {
          mesh.morphTargetInfluences[idx] += (val - mesh.morphTargetInfluences[idx]) * speed;
        }
      }
    };

    const render = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      elapsedTime += delta;

      // Read current values synchronously from refs
      const curVision = visionRef.current;
      const curMouse = mousePosRef.current;
      const curSpeaking = isSpeakingRef.current;
      const curMuted = isMutedRef.current;
      const curPosture = postureRef.current;
      const curViseme = activeVisemeRef.current;
      const curCamMode = cameraModeRef.current;
      const curHolo = showHoloHudRef.current;
      const curOrbit = orbitAnglesRef.current;
      const curRecording = isRecordingRef.current;

      holoGroup.visible = curHolo;
      if (curHolo) {
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

      // Autonomic thoracic respiration
      if (spineBone) {
        const breath = Math.sin(elapsedTime * 1.5) * 0.012;
        spineBone.rotation.x = baseSpineRot.x + breath;
      }

      // Conversational nod when listening or patient speaks
      let nodOffset = 0;
      if (curPosture === 'listening' || curRecording || curVision?.affect === 'nodding') {
        nodOffset = Math.sin(elapsedTime * 3.2) * 0.035;
      }

      // Procedural natural blinking (every 3.2 - 4.8s)
      blinkTimer += delta;
      if (blinkTimer > 3.6 && !isBlinking) {
        if (Math.random() > 0.30) {
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
      const blinkWeight = Math.sin(blinkProgress);

      // Smooth gaze & posture orientation
      let targetLookX = curMouse.x * 0.22;
      let targetLookY = -curMouse.y * 0.14;

      if (curVision?.patientPresent) {
        targetLookX = curVision.faceCentroid.x * 0.30 + curMouse.x * 0.08;
        targetLookY = curVision.faceCentroid.y * 0.18 - curMouse.y * 0.05;
      }

      let posturePitch = 0;
      let postureYaw = 0;
      let postureRoll = 0;

      if (curVision?.gesture === 'chest_touch' || curVision?.affect === 'pain_grimace') {
        posturePitch = 0.05;
        postureRoll = -0.02;
      } else if (curVision?.gesture === 'wave_hello') {
        posturePitch = 0.02;
        postureRoll = 0.02;
      } else if (curPosture === 'listening' || curVision?.gesture === 'hand_raise_stop') {
        posturePitch = 0.05;
        postureRoll = -0.02;
      } else if (curPosture === 'alerting') {
        posturePitch = -0.02;
      } else if (curPosture === 'reassuring') {
        postureRoll = 0.02;
        posturePitch = 0.025;
      }

      // Animate 3D Doctor Head & Neck Bones
      if (headBone) {
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, baseHeadRot.x + targetLookY * 0.35 + posturePitch + nodOffset, 0.10);
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, baseHeadRot.y + targetLookX * 0.45 + postureYaw, 0.10);
        headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, baseHeadRot.z + postureRoll, 0.08);
      }
      if (neckBone) {
        neckBone.rotation.x = THREE.MathUtils.lerp(neckBone.rotation.x, baseNeckRot.x + (targetLookY * 0.35 + posturePitch + nodOffset) * 0.25, 0.10);
        neckBone.rotation.y = THREE.MathUtils.lerp(neckBone.rotation.y, baseNeckRot.y + (targetLookX * 0.45 + postureYaw) * 0.25, 0.10);
      }

      // Eye gaze tracking (pupils aim naturally without socket displacement)
      if (leftEyeBone && rightEyeBone) {
        leftEyeBone.rotation.y = THREE.MathUtils.lerp(leftEyeBone.rotation.y, baseLeftEyeRot.y + targetLookX * 0.22, 0.15);
        leftEyeBone.rotation.x = THREE.MathUtils.lerp(leftEyeBone.rotation.x, baseLeftEyeRot.x - targetLookY * 0.15, 0.15);
        rightEyeBone.rotation.y = THREE.MathUtils.lerp(rightEyeBone.rotation.y, baseRightEyeRot.y + targetLookX * 0.22, 0.15);
        rightEyeBone.rotation.x = THREE.MathUtils.lerp(rightEyeBone.rotation.x, baseRightEyeRot.x - targetLookY * 0.15, 0.15);
      }

      // Conversational right arm gesture when speaking
      if (rightArmBone) {
        const gestureOffset = (curSpeaking && !curMuted) ? 0.05 + Math.sin(elapsedTime * 3.5) * 0.03 : 0;
        rightArmBone.rotation.z = THREE.MathUtils.lerp(rightArmBone.rotation.z, baseRightArmRot.z + gestureOffset, 0.10);
      }

      // ── DRIVE ARKit & OCULUS VISEME MORPH TARGETS ──
      // Blinks
      driveMorph(headMesh, ['eyeBlinkLeft', 'eyeBlink_L'], blinkWeight, 0.45);
      driveMorph(headMesh, ['eyeBlinkRight', 'eyeBlink_R'], blinkWeight, 0.45);

      // Speech articulation
      let targetJawOpen = 0;
      let targetOh = 0;
      let targetEe = 0;
      let targetAa = 0;
      let targetMbp = 0;
      let targetFv = 0;
      let targetLdt = 0;

      if (curSpeaking && !curMuted) {
        const s1 = Math.sin(elapsedTime * 22.0);
        const s2 = Math.sin(elapsedTime * 34.0);
        const speechAmp = Math.max(0, s1 * 0.65 + s2 * 0.35);

        if (curViseme === 'MBP') {
          targetJawOpen = 0.06;
          targetMbp = 0.85;
        } else if (curViseme === 'OH') {
          targetJawOpen = 0.60 * speechAmp;
          targetOh = 0.88;
        } else if (curViseme === 'EE') {
          targetJawOpen = 0.38 * speechAmp;
          targetEe = 0.82;
        } else if (curViseme === 'FV') {
          targetJawOpen = 0.22 * speechAmp;
          targetFv = 0.75;
        } else if (curViseme === 'LDT') {
          targetJawOpen = 0.32 * speechAmp;
          targetLdt = 0.65;
        } else {
          targetJawOpen = 0.70 * speechAmp;
          targetAa = 0.65 * speechAmp;
        }
      }

      // Apply jaw and mouth phonemes to both head and teeth meshes
      driveMorph(headMesh, ['jawOpen'], targetJawOpen, 0.35);
      driveMorph(teethMesh, ['jawOpen'], targetJawOpen, 0.35);

      driveMorph(headMesh, ['viseme_O', 'viseme_oh', 'viseme_U'], targetOh, 0.35);
      driveMorph(headMesh, ['viseme_E', 'viseme_ee', 'viseme_I'], targetEe, 0.35);
      driveMorph(headMesh, ['viseme_aa'], targetAa, 0.35);
      driveMorph(headMesh, ['viseme_PP', 'viseme_mbp', 'mouthClose'], targetMbp, 0.35);
      driveMorph(headMesh, ['viseme_FF', 'viseme_fv'], targetFv, 0.35);
      driveMorph(headMesh, ['viseme_TH', 'viseme_DD', 'viseme_SS'], targetLdt, 0.35);

      // Clinical expressions
      const targetSmile = (curPosture === 'greeting' || curPosture === 'reassuring') ? 0.30 : 0.05;
      const targetBrowDown = (curPosture === 'alerting' || curVision?.affect === 'pain_grimace') ? 0.60 : 0.0;
      const targetBrowUp = (curPosture === 'listening' || curPosture === 'explaining') ? 0.35 : 0.0;

      driveMorph(headMesh, ['mouthSmileLeft', 'mouthSmileRight', 'mouthSmile'], targetSmile, 0.15);
      driveMorph(headMesh, ['browDownLeft', 'browDownRight', 'browDown'], targetBrowDown, 0.15);
      driveMorph(headMesh, ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'], targetBrowUp, 0.15);

      // Camera Angle Control (Chest-up consultation framing centered at y=0.22)
      let targetCamX = 0;
      let targetCamY = 0.22;
      let targetCamZ = 1.25;
      let targetCamFov = 30;

      if (curCamMode === 'portrait') {
        targetCamX = 0;
        targetCamY = 0.22;
        targetCamZ = 1.25;
        targetCamFov = 30;
      } else if (curCamMode === 'cinematic') {
        targetCamX = -0.34;
        targetCamY = 0.22;
        targetCamZ = 1.30;
        targetCamFov = 32;
      } else if (curCamMode === 'hologram') {
        targetCamX = 0.28;
        targetCamY = 0.22;
        targetCamZ = 1.32;
        targetCamFov = 32;
      } else if (curCamMode === 'orbit') {
        const radius = 1.30;
        targetCamX = Math.sin(curOrbit.yaw) * radius;
        targetCamZ = Math.cos(curOrbit.yaw) * radius;
        targetCamY = 0.22 + curOrbit.pitch;
      }

      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      if (Math.abs(camera.fov - targetCamFov) > 0.1) {
        camera.fov += (targetCamFov - camera.fov) * 0.05;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(0, 0.22, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [persona.id]);

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
