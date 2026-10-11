import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { VirtualDoctorPersona } from '../../types/health';
import { MorphWeightSet } from './LipSyncController';
import { FacialExpressionWeights } from './ExpressionController';
import { PostureKinematics } from './GestureController';

// Doctor Persona styling configurations
export const DOCTOR_STYLE_MAP: Record<string, {
  skinTone: number;
  hairColor: number;
  scrubColor: number;
  eyeColor: number;
  irisHex: string;
  tieColor?: number;
  stethoscopeColor: number;
  isFemale: boolean;
  photoUrl: string;
  modelUrl: string;
}> = {
  'doc-thorne': {
    skinTone: 0xD49E82,
    hairColor: 0x362316,
    scrubColor: 0x1E3A8A,
    eyeColor: 0x38BDF8, // Piercing blue eyes (from Picture 3 MetaHuman)
    irisHex: '#38BDF8',
    stethoscopeColor: 0xCBD5E1,
    isFemale: false,
    photoUrl: '/avatars/doc-thorne.jpg',
    modelUrl: '/models/specialist-doctor-vance.glb'
  },
  'doc-jacob': {
    skinTone: 0xD49E82,
    hairColor: 0x362316,
    scrubColor: 0x1E3A8A,
    eyeColor: 0x38BDF8,
    irisHex: '#38BDF8',
    stethoscopeColor: 0xCBD5E1,
    isFemale: false,
    photoUrl: '/avatars/doc-jacob.jpg',
    modelUrl: '/models/specialist-doctor-vance.glb'
  },
  'doc-lin': {
    skinTone: 0xD9A07E,
    hairColor: 0x1B1B1B,
    scrubColor: 0x0284C7,
    eyeColor: 0x3C2314, // Warm hazel/brown eyes (from Picture 2)
    irisHex: '#422818',
    stethoscopeColor: 0x64748B,
    isFemale: true,
    photoUrl: '/avatars/doc-lin.jpg',
    modelUrl: '/models/specialist-doctor-chen.glb'
  },
  'doc-vance': {
    skinTone: 0xD49E82,
    hairColor: 0x4A3728,
    scrubColor: 0x2563EB,
    eyeColor: 0x38BDF8, // Piercing blue eyes (from Picture 3)
    irisHex: '#38BDF8',
    tieColor: 0x0284C7,
    stethoscopeColor: 0x94A3B8,
    isFemale: false,
    photoUrl: '/avatars/doc-vance.jpg',
    modelUrl: '/models/specialist-doctor-vance.glb'
  },
  'doc-chen': {
    skinTone: 0xD9A07E,
    hairColor: 0x382418,
    scrubColor: 0x0284C7,
    eyeColor: 0x3C2314, // Warm hazel/brown eyes (from Picture 2)
    irisHex: '#422818',
    stethoscopeColor: 0x64748B,
    isFemale: true,
    photoUrl: '/avatars/doc-chen.jpg',
    modelUrl: '/models/specialist-doctor-chen.glb'
  }
};

/**
 * Creates 3D medical accessories: dual-tube stethoscope and credentials badge
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

interface SpecialistModelProps {
  modelUrl?: string;
  persona: VirtualDoctorPersona;
  morphWeights: MorphWeightSet;
  expressionWeights: FacialExpressionWeights;
  kinematics: PostureKinematics;
  isSpeaking: boolean;
}

export const SpecialistDoctorModel: React.FC<SpecialistModelProps> = ({
  persona,
  morphWeights,
  expressionWeights,
  kinematics,
  isSpeaking
}) => {
  const rootGroupRef = useRef<THREE.Group | null>(null);

  // Persona styling and model path
  const personaStyle = DOCTOR_STYLE_MAP[persona.id] || DOCTOR_STYLE_MAP['doc-thorne'];
  const isFemale = personaStyle.isFemale;
  const glbPath = personaStyle.modelUrl || (isFemale ? '/models/specialist-doctor-chen.glb' : '/models/specialist-doctor-vance.glb');

  // Load genuine rigged 3D human doctor model
  const { scene } = useGLTF(glbPath);

  // Extract model components for high-performance animation
  const {
    clonedModel,
    headMesh,
    teethMesh,
    headBone,
    neckBone,
    spineBone,
    rightArmBone,
    leftEyeBone,
    rightEyeBone,
    baseHeadRot,
    baseNeckRot,
    baseSpineRot,
    baseRightArmRot,
    baseLeftEyeRot,
    baseRightEyeRot
  } = useMemo(() => {
    const clone = scene.clone(true);
    let hMesh: THREE.SkinnedMesh | null = null;
    let tMesh: THREE.SkinnedMesh | null = null;

    const bHead = new THREE.Euler();
    const bNeck = new THREE.Euler();
    const bSpine = new THREE.Euler();
    const bRArm = new THREE.Euler();
    const bLEye = new THREE.Euler();
    const bREye = new THREE.Euler();

    clone.traverse((child) => {
      // Unobstructed eyes: hide glasses on male clinician
      if (child.name === 'Wolf3D_Glasses') {
        child.visible = false;
      }

      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mesh = child as THREE.Mesh;

        if (child.name === 'Wolf3D_Head' || child.name === 'DoctorHead') {
          hMesh = child as THREE.SkinnedMesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.roughness = 0.48;
            mat.metalness = 0.0;
          }
        } else if (child.name === 'Wolf3D_Teeth') {
          tMesh = child as THREE.SkinnedMesh;
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
    });

    const hBone = (clone.getObjectByName('Head') as THREE.Bone | null) || null;
    const nBone = (clone.getObjectByName('Neck') as THREE.Bone | null) || null;
    const sBone = (clone.getObjectByName('Spine2') as THREE.Bone | null) || null;
    const rArmBone = (clone.getObjectByName('RightArm') as THREE.Bone | null) || null;
    const lEyeBone = (clone.getObjectByName('LeftEye') as THREE.Bone | null) || null;
    const rEyeBone = (clone.getObjectByName('RightEye') as THREE.Bone | null) || null;

    if (hBone) bHead.copy(hBone.rotation);
    if (nBone) bNeck.copy(nBone.rotation);
    if (sBone) bSpine.copy(sBone.rotation);
    if (rArmBone) bRArm.copy(rArmBone.rotation);
    if (lEyeBone) bLEye.copy(lEyeBone.rotation);
    if (rEyeBone) bREye.copy(rEyeBone.rotation);

    // Attach medical accessories
    const accessories = createMedicalAccessories(isFemale);
    clone.add(accessories);

    return {
      clonedModel: clone,
      headMesh: hMesh,
      teethMesh: tMesh,
      headBone: hBone,
      neckBone: nBone,
      spineBone: sBone,
      rightArmBone: rArmBone,
      leftEyeBone: lEyeBone,
      rightEyeBone: rEyeBone,
      baseHeadRot: bHead,
      baseNeckRot: bNeck,
      baseSpineRot: bSpine,
      baseRightArmRot: bRArm,
      baseLeftEyeRot: bLEye,
      baseRightEyeRot: bREye,
    };
  }, [scene, isFemale]);

  // Helper to drive morph targets safely
  const driveMorph = (mesh: THREE.SkinnedMesh | null, names: string[], val: number, speed: number = 0.35) => {
    if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    for (const name of names) {
      const idx = mesh.morphTargetDictionary[name];
      if (idx !== undefined) {
        mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[idx], val, speed);
      }
    }
  };

  // 60fps frame loop driving head rotation, gaze tracking, blinks, and lip sync
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Head & Neck rotations
    const [pitch, yaw, roll] = kinematics.headRotation;
    if (headBone) {
      headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, baseHeadRot.x + pitch * 0.4, 0.15);
      headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, baseHeadRot.y + yaw * 0.45, 0.15);
      headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, baseHeadRot.z + roll, 0.15);
    }
    if (neckBone) {
      neckBone.rotation.x = THREE.MathUtils.lerp(neckBone.rotation.x, baseNeckRot.x + pitch * 0.1, 0.15);
      neckBone.rotation.y = THREE.MathUtils.lerp(neckBone.rotation.y, baseNeckRot.y + yaw * 0.1, 0.15);
    }

    // 2. Eye Gaze tracking
    const [gazeX, gazeY] = expressionWeights.gazeVector;
    if (leftEyeBone && rightEyeBone) {
      leftEyeBone.rotation.y = THREE.MathUtils.lerp(leftEyeBone.rotation.y, baseLeftEyeRot.y + gazeX * 0.22, 0.2);
      leftEyeBone.rotation.x = THREE.MathUtils.lerp(leftEyeBone.rotation.x, baseLeftEyeRot.x - gazeY * 0.15, 0.2);
      rightEyeBone.rotation.y = THREE.MathUtils.lerp(rightEyeBone.rotation.y, baseRightEyeRot.y + gazeX * 0.22, 0.2);
      rightEyeBone.rotation.x = THREE.MathUtils.lerp(rightEyeBone.rotation.x, baseRightEyeRot.x - gazeY * 0.15, 0.2);
    }

    // 3. Real-Time Visemes, Morph Targets & Blinking
    // Blinks
    driveMorph(headMesh, ['eyeBlinkLeft', 'eyeBlink_L'], expressionWeights.eyeBlinkLeft, 0.5);
    driveMorph(headMesh, ['eyeBlinkRight', 'eyeBlink_R'], expressionWeights.eyeBlinkRight, 0.5);

    // Jaw Opening & Visemes
    driveMorph(headMesh, ['jawOpen'], morphWeights.jawOpen, 0.35);
    driveMorph(teethMesh, ['jawOpen'], morphWeights.jawOpen, 0.35);

    driveMorph(headMesh, ['viseme_O', 'viseme_oh', 'viseme_U'], morphWeights.viseme_oh, 0.35);
    driveMorph(headMesh, ['viseme_E', 'viseme_ee', 'viseme_I'], morphWeights.viseme_ee, 0.35);
    driveMorph(headMesh, ['viseme_aa'], morphWeights.viseme_aa, 0.35);
    if (morphWeights.viseme_mbp !== undefined) {
      driveMorph(headMesh, ['viseme_PP', 'viseme_mbp', 'mouthClose'], morphWeights.viseme_mbp, 0.35);
    }
    if (morphWeights.viseme_fv !== undefined) {
      driveMorph(headMesh, ['viseme_FF', 'viseme_fv'], morphWeights.viseme_fv, 0.35);
    }

    // Clinical Expressions
    driveMorph(headMesh, ['mouthSmileLeft', 'mouthSmileRight', 'mouthSmile'], expressionWeights.mouthSmile, 0.15);
    driveMorph(headMesh, ['browDownLeft', 'browDownRight', 'browDown'], expressionWeights.browDown, 0.15);
    driveMorph(headMesh, ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'], expressionWeights.browInnerUp, 0.15);

    // 4. Thoracic Respiration expansion
    if (spineBone) {
      const breath = Math.sin(time * 1.5) * 0.012;
      spineBone.rotation.x = baseSpineRot.x + breath;
    }

    // 5. Conversational arm sway when speaking
    if (rightArmBone) {
      const armSway = isSpeaking ? 0.05 + Math.sin(time * 3.5) * 0.03 : 0;
      rightArmBone.rotation.z = THREE.MathUtils.lerp(rightArmBone.rotation.z, baseRightArmRot.z + armSway, 0.10);
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, -1.36, 0]}>
      <primitive object={clonedModel} />
    </group>
  );
};

// Preload the genuine 3D doctor models
useGLTF.preload('/models/specialist-doctor-vance.glb');
useGLTF.preload('/models/specialist-doctor-chen.glb');
useGLTF.preload('/models/specialist-doctor.glb');
