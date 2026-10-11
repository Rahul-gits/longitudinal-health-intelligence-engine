import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = FileReaderPolyfill;

/**
 * Anatomically sculpted 3D human head with realistic facial topology,
 * UV mapping, and ARKit/Viseme morph targets.
 */
function createAnatomicalHead(isFemale = false) {
  const widthSegments = 64;
  const heightSegments = 64;
  const radius = 0.38;
  const geo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  const count = pos.count;

  // Sculpt anatomical human facial planes
  for (let i = 0; i < count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Cranial shaping: slightly elongate vertically and flatten temples
    y *= isFemale ? 1.05 : 1.08;
    if (Math.abs(x) > 0.18) {
      x *= 0.94; // Temple compression
    }

    if (z > 0) {
      // 1. Orbital eye sockets (cavity for biological 3D eyes)
      const eyeSpacing = isFemale ? 0.110 : 0.118;
      const eyeY = 0.088;
      const lEyeDist = Math.hypot(x - (-eyeSpacing), y - eyeY);
      const rEyeDist = Math.hypot(x - eyeSpacing, y - eyeY);
      const minEyeDist = Math.min(lEyeDist, rEyeDist);
      if (minEyeDist < 0.082) {
        z -= Math.cos((minEyeDist / 0.082) * (Math.PI / 2)) * 0.072;
      }

      // 2. Supraorbital brow ridge and glabella
      if (y > 0.12 && y < 0.22 && Math.abs(x) < 0.24) {
        const browProminence = isFemale ? 0.016 : 0.032;
        z += Math.sin(((y - 0.12) / 0.10) * Math.PI) * (1 - Math.abs(x) / 0.24) * browProminence;
      }

      // 3. Nose: Bridge, dorsum, tip (apex), columella, and nostrils
      if (y > -0.09 && y < 0.13 && Math.abs(x) < 0.078) {
        const noseYNorm = (y - (-0.09)) / 0.22;
        const noseWidth = Math.max(0, 1 - Math.abs(x) / (isFemale ? 0.052 : 0.060));
        const bridgeDepth = 0.055 + (1 - noseYNorm) * 0.045;
        z += bridgeDepth * noseWidth;

        // Nostril flare
        if (y < -0.03 && y > -0.08 && Math.abs(x) > 0.026) {
          x += Math.sign(x) * 0.012;
        }
      }

      // 4. Zygomatic cheekbones
      if (y > -0.06 && y < 0.12 && Math.abs(x) > 0.10 && Math.abs(x) < 0.32) {
        const cheekWeight = Math.sin(((y - (-0.06)) / 0.18) * Math.PI) * Math.max(0, 1 - Math.abs(Math.abs(x) - 0.20) / 0.11);
        z += cheekWeight * (isFemale ? 0.026 : 0.022);
        x += Math.sign(x) * cheekWeight * 0.010;
      }

      // 5. Philtrum and Lips (Vermilion border and oral separation)
      if (y > -0.17 && y < -0.05 && Math.abs(x) < 0.13) {
        const mouthX = Math.max(0, 1 - Math.abs(x) / (isFemale ? 0.115 : 0.125));
        // Oral fissure indent
        if (y > -0.085 && y < -0.065 && Math.abs(x) < 0.08) {
          z -= 0.014 * (1 - Math.abs(x) / 0.08);
        }
        // Upper & lower lip fullness
        const lipCurve = Math.sin(((y - (-0.17)) / 0.12) * Math.PI) * mouthX;
        z += lipCurve * (isFemale ? 0.030 : 0.026);
      }

      // 6. Mentum (Chin projection) & Jawline
      if (y < -0.19 && y > -0.36 && Math.abs(x) < (isFemale ? 0.13 : 0.16)) {
        const chinWidth = isFemale ? 0.13 : 0.16;
        const chinCurve = Math.sin(((y - (-0.36)) / 0.17) * Math.PI) * (1 - Math.abs(x) / chinWidth);
        z += chinCurve * (isFemale ? 0.026 : 0.035);
      }
    } else {
      // Occipital flattening and back-of-head curvature
      z *= 0.92;
    }

    pos.setXYZ(i, x, y, z);

    // Compute unwrapped frontal face UV coordinates
    if (z > -0.05) {
      const u = 0.5 + (x / 0.55);
      const v = 0.5 + (y / 0.65);
      uvs.setXY(i, Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v)));
    }
  }

  geo.computeVertexNormals();

  // ── MORPH TARGETS FOR REAL-TIME FACIAL ANIMATION & VISEMES ──
  const morphJawOpen = new Float32Array(count * 3);
  const morphVisemeOh = new Float32Array(count * 3);
  const morphVisemeEe = new Float32Array(count * 3);
  const morphVisemeAa = new Float32Array(count * 3);
  const morphVisemeMbp = new Float32Array(count * 3);
  const morphVisemeFv = new Float32Array(count * 3);
  const morphSmile = new Float32Array(count * 3);
  const morphBlinkL = new Float32Array(count * 3);
  const morphBlinkR = new Float32Array(count * 3);
  const morphBrowDown = new Float32Array(count * 3);
  const morphBrowInnerUp = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // 1. Jaw Open / Mouth Open (Jaw dropping down and forward)
    if (y < -0.065 && z > -0.05) {
      const jawWeight = Math.min(1, Math.max(0, (-y - 0.065) / 0.26));
      morphJawOpen[i * 3 + 1] = -0.075 * jawWeight;
      morphJawOpen[i * 3 + 2] = 0.016 * jawWeight;
    }

    // 2. Viseme OH (Lips rounded into an O, corners drawn inward, lips pushed forward)
    if (y > -0.17 && y < -0.04 && Math.abs(x) < 0.14 && z > 0.08) {
      const w = (1 - Math.abs(x) / 0.14);
      morphVisemeOh[i * 3] = -Math.sign(x) * 0.018 * w; // Corner inward
      morphVisemeOh[i * 3 + 1] = -0.024 * w;          // Moderate open
      morphVisemeOh[i * 3 + 2] = 0.028 * w;           // Pucker protrusion
    }

    // 3. Viseme EE (Mouth corners pulled wide laterally and slightly upward)
    if (y > -0.16 && y < -0.05 && Math.abs(x) < 0.16 && z > 0.08) {
      const w = Math.min(1, Math.abs(x) / 0.08);
      morphVisemeEe[i * 3] = Math.sign(x) * 0.026 * w;
      morphVisemeEe[i * 3 + 1] = 0.008 * w;
      morphVisemeEe[i * 3 + 2] = -0.006 * w;
    }

    // 4. Viseme AA (Wide open vocalic phoneme)
    if (y < -0.06 && z > -0.02) {
      const w = Math.min(1, Math.max(0, (-y - 0.06) / 0.22));
      morphVisemeAa[i * 3 + 1] = -0.085 * w;
      morphVisemeAa[i * 3 + 2] = 0.018 * w;
      if (Math.abs(x) > 0.04 && Math.abs(x) < 0.14 && y > -0.16) {
        morphVisemeAa[i * 3] = Math.sign(x) * 0.012;
      }
    }

    // 5. Viseme MBP (Bilabial closure - lips firmly pressed together)
    if (y > -0.15 && y < -0.05 && Math.abs(x) < 0.12 && z > 0.10) {
      if (y > -0.09) {
        morphVisemeMbp[i * 3 + 1] = -0.012; // Upper lip down
      } else {
        morphVisemeMbp[i * 3 + 1] = 0.016;  // Lower lip up
      }
      morphVisemeMbp[i * 3 + 2] = -0.008;   // Flat compression
    }

    // 6. Viseme FV (Labiodental - lower lip tucked slightly inward against upper incisors)
    if (y > -0.14 && y < -0.07 && Math.abs(x) < 0.10 && z > 0.10) {
      if (y < -0.09) {
        morphVisemeFv[i * 3 + 1] = 0.014;
        morphVisemeFv[i * 3 + 2] = -0.012;
      }
    }

    // 7. Smile (Zygomaticus major contraction)
    if (y > -0.16 && y < -0.05 && Math.abs(x) > 0.035 && Math.abs(x) < 0.18 && z > 0.08) {
      const cornerWeight = Math.min(1, (Math.abs(x) - 0.035) / 0.08);
      morphSmile[i * 3] = Math.sign(x) * 0.022 * cornerWeight;
      morphSmile[i * 3 + 1] = 0.024 * cornerWeight;
      morphSmile[i * 3 + 2] = 0.010 * cornerWeight;
    }

    // 8. Left Eye Blink (Upper lid descends over globe)
    if (x < -0.05 && x > -0.19 && y > 0.05 && y < 0.15 && z > 0.14) {
      const blinkWeight = Math.min(1, Math.max(0, (y - 0.05) / 0.08));
      morphBlinkL[i * 3 + 1] = -0.032 * blinkWeight;
      morphBlinkL[i * 3 + 2] = -0.014 * blinkWeight;
    }

    // 9. Right Eye Blink
    if (x > 0.05 && x < 0.19 && y > 0.05 && y < 0.15 && z > 0.14) {
      const blinkWeight = Math.min(1, Math.max(0, (y - 0.05) / 0.08));
      morphBlinkR[i * 3 + 1] = -0.032 * blinkWeight;
      morphBlinkR[i * 3 + 2] = -0.014 * blinkWeight;
    }

    // 10. Brow Down (Corrugator supercilii - serious / clinical safety alert)
    if (y > 0.13 && y < 0.23 && Math.abs(x) < 0.22 && z > 0.10) {
      morphBrowDown[i * 3 + 1] = -0.026;
      morphBrowDown[i * 3] = -Math.sign(x) * 0.008;
      morphBrowDown[i * 3 + 2] = 0.008;
    }

    // 11. Brow Inner Up (Frontalis - active listening, clinical empathy, reassurance)
    if (y > 0.14 && y < 0.24 && Math.abs(x) < 0.12 && z > 0.10) {
      const innerWeight = 1 - Math.abs(x) / 0.12;
      morphBrowInnerUp[i * 3 + 1] = 0.028 * innerWeight;
    }
  }

  geo.morphAttributes.position = [
    new THREE.BufferAttribute(morphJawOpen, 3),
    new THREE.BufferAttribute(morphVisemeOh, 3),
    new THREE.BufferAttribute(morphVisemeEe, 3),
    new THREE.BufferAttribute(morphVisemeAa, 3),
    new THREE.BufferAttribute(morphVisemeMbp, 3),
    new THREE.BufferAttribute(morphVisemeFv, 3),
    new THREE.BufferAttribute(morphSmile, 3),
    new THREE.BufferAttribute(morphBlinkL, 3),
    new THREE.BufferAttribute(morphBlinkR, 3),
    new THREE.BufferAttribute(morphBrowDown, 3),
    new THREE.BufferAttribute(morphBrowInnerUp, 3)
  ];

  return geo;
}

/**
 * Creates 3D hair geometry tailored to male (Vance) or female (Chen) clinician
 */
function createDoctorHairGeometry(isFemale = false) {
  if (isFemale) {
    // Professional styled updo / parted hair behind ears (Chen, Picture 2)
    const hairGeo = new THREE.SphereGeometry(0.398, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const pos = hairGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Volume on crown and back bun
      if (y > 0.12) {
        y += 0.024;
      }
      if (z < -0.15) {
        z -= 0.045; // Back bun / gathering
      }
      // Soft side parting
      if (x > -0.05 && x < 0.05 && y > 0.22 && z > 0.12) {
        y -= 0.012;
      }
      pos.setXYZ(i, x, y, z);
    }
    hairGeo.computeVertexNormals();
    return hairGeo;
  } else {
    // Textured short crop with natural hairline and faded sides (Vance, Picture 3)
    const hairGeo = new THREE.SphereGeometry(0.395, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.54);
    const pos = hairGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Textured quiff elevation on top
      if (y > 0.16 && z > -0.08) {
        y += 0.038 * (1 - Math.abs(x) / 0.26);
        z += 0.015;
      }
      // Clean taper at temples
      if (Math.abs(x) > 0.22 && y < 0.15) {
        x *= 0.96;
      }
      pos.setXYZ(i, x, y, z);
    }
    hairGeo.computeVertexNormals();
    return hairGeo;
  }
}

/**
 * Builds tailored 3D clinician attire:
 * Lab coat, collared shirt/scrubs, tie, and stethoscope
 */
function buildDoctorAttire(rootGroup, isFemale = false, materials) {
  // 1. Neck (anatomical cylinder with sternocleidomastoid tapering)
  const neckGeo = new THREE.CylinderGeometry(0.135, 0.165, 0.28, 32);
  const neckMesh = new THREE.Mesh(neckGeo, materials.skin);
  neckMesh.name = 'DoctorNeck';
  neckMesh.position.set(0, 1.26, -0.02);
  rootGroup.add(neckMesh);

  // 2. Structured Medical Lab Coat Torso
  // High-poly bust correctly proportioned to human anatomy
  const coatGeo = new THREE.CylinderGeometry(0.38, 0.46, 0.88, 36);
  const coatMesh = new THREE.Mesh(coatGeo, materials.coat);
  coatMesh.name = 'DoctorTorso';
  coatMesh.scale.set(1.22, 1.0, 0.72);
  coatMesh.position.set(0, 0.76, 0);
  rootGroup.add(coatMesh);

  // 3. Shoulders
  const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), materials.coat);
  lShoulder.name = 'LeftShoulder';
  lShoulder.scale.set(1.15, 0.9, 0.9);
  lShoulder.position.set(-0.46, 1.10, 0);
  rootGroup.add(lShoulder);

  const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), materials.coat);
  rShoulder.name = 'RightShoulder';
  rShoulder.scale.set(1.15, 0.9, 0.9);
  rShoulder.position.set(0.46, 1.10, 0);
  rootGroup.add(rShoulder);

  // 4. Upper Arms
  const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.44, 20), materials.coat);
  lArm.name = 'LeftUpperArm';
  lArm.position.set(-0.48, 0.84, 0);
  lArm.rotation.z = -0.15;
  rootGroup.add(lArm);

  const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.44, 20), materials.coat);
  rArm.name = 'RightUpperArm';
  rArm.position.set(0.48, 0.84, 0);
  rArm.rotation.z = 0.15;
  rootGroup.add(rArm);

  // 5. Lapels of the Medical Lab Coat
  const lLapelGeo = new THREE.BoxGeometry(0.08, 0.44, 0.03);
  const lLapel = new THREE.Mesh(lLapelGeo, materials.coat);
  lLapel.name = 'LeftLapel';
  lLapel.position.set(-0.16, 0.98, 0.22);
  lLapel.rotation.z = -0.20;
  rootGroup.add(lLapel);

  const rLapel = new THREE.Mesh(lLapelGeo, materials.coat);
  rLapel.name = 'RightLapel';
  rLapel.position.set(0.16, 0.98, 0.22);
  rLapel.rotation.z = 0.20;
  rootGroup.add(rLapel);

  // 6. Chest Attire Insert:
  // Male (Vance, Picture 3): Crisp dress shirt + collar points + striped tie
  // Female (Chen, Picture 2): Professional V-neck scrubs
  if (isFemale) {
    // V-neck clinical scrub insert
    const scrubGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.38, 24, 1, false, Math.PI * 0.75, Math.PI * 0.5);
    const scrubMesh = new THREE.Mesh(scrubGeo, materials.scrubs);
    scrubMesh.name = 'DoctorScrubsInsert';
    scrubMesh.position.set(0, 1.02, 0.14);
    rootGroup.add(scrubMesh);

    // V-neck collar trim
    const trimGeo = new THREE.BoxGeometry(0.18, 0.02, 0.02);
    const lTrim = new THREE.Mesh(trimGeo, materials.scrubs);
    lTrim.position.set(-0.06, 1.14, 0.19);
    lTrim.rotation.z = -0.7;
    rootGroup.add(lTrim);

    const rTrim = new THREE.Mesh(trimGeo, materials.scrubs);
    rTrim.position.set(0.06, 1.14, 0.19);
    rTrim.rotation.z = 0.7;
    rootGroup.add(rTrim);
  } else {
    // White dress shirt insert
    const shirtGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.38, 24, 1, false, Math.PI * 0.75, Math.PI * 0.5);
    const shirtMesh = new THREE.Mesh(shirtGeo, materials.shirt);
    shirtMesh.name = 'DoctorShirtInsert';
    shirtMesh.position.set(0, 1.02, 0.14);
    rootGroup.add(shirtMesh);

    // Collar points
    const collarGeo = new THREE.BoxGeometry(0.09, 0.05, 0.02);
    const lCollar = new THREE.Mesh(collarGeo, materials.shirt);
    lCollar.position.set(-0.08, 1.17, 0.19);
    lCollar.rotation.z = -0.55;
    rootGroup.add(lCollar);

    const rCollar = new THREE.Mesh(collarGeo, materials.shirt);
    rCollar.position.set(0.08, 1.17, 0.19);
    rCollar.rotation.z = 0.55;
    rootGroup.add(rCollar);

    // Striped silk doctor tie (Picture 3)
    const tieGeo = new THREE.BoxGeometry(0.052, 0.32, 0.02);
    const tieMesh = new THREE.Mesh(tieGeo, materials.tie);
    tieMesh.name = 'DoctorTie';
    tieMesh.position.set(0, 0.98, 0.20);
    rootGroup.add(tieMesh);

    const tieKnotGeo = new THREE.CylinderGeometry(0.024, 0.018, 0.04, 12);
    const tieKnot = new THREE.Mesh(tieKnotGeo, materials.tie);
    tieKnot.name = 'DoctorTieKnot';
    tieKnot.position.set(0, 1.15, 0.20);
    rootGroup.add(tieKnot);
  }

  // 7. Anatomical Dual-Lumen Stethoscope
  const stethCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.19, 1.28, 0.08),
    new THREE.Vector3(-0.24, 1.12, 0.18),
    new THREE.Vector3(-0.16, 0.88, 0.24),
    new THREE.Vector3(-0.04, 0.80, 0.26),
    new THREE.Vector3(0.08, 0.86, 0.24),
    new THREE.Vector3(0.24, 1.12, 0.18),
    new THREE.Vector3(0.19, 1.28, 0.08),
  ]);
  const stethGeo = new THREE.TubeGeometry(stethCurve, 48, 0.014, 12, false);
  const stethMesh = new THREE.Mesh(stethGeo, materials.stethoscopeTubing);
  stethMesh.name = 'StethoscopeTubing';
  rootGroup.add(stethMesh);

  // Stethoscope Bell & Diaphragm Chestpiece
  const bellGeo = new THREE.CylinderGeometry(0.042, 0.046, 0.022, 28);
  const bellMesh = new THREE.Mesh(bellGeo, materials.stethoscopeMetal);
  bellMesh.name = 'StethoscopeBell';
  bellMesh.rotation.x = Math.PI / 2;
  bellMesh.position.set(-0.05, 0.79, 0.27);
  rootGroup.add(bellMesh);

  // Clinician Identification Badge
  const badgeCardGeo = new THREE.BoxGeometry(0.11, 0.15, 0.01);
  const badgeCard = new THREE.Mesh(badgeCardGeo, materials.badge);
  badgeCard.name = 'ClinicianBadge';
  badgeCard.position.set(0.26, 0.95, 0.23);
  badgeCard.rotation.y = -0.06;
  rootGroup.add(badgeCard);

  const badgeHeaderGeo = new THREE.BoxGeometry(0.11, 0.035, 0.012);
  const badgeHeader = new THREE.Mesh(badgeHeaderGeo, materials.badgeHeader);
  badgeHeader.position.set(0.26, 1.01, 0.231);
  badgeHeader.rotation.y = -0.06;
  rootGroup.add(badgeHeader);
}

/**
 * Creates 3D biological eyes with sclera, iris, and pupil
 */
function create3DEyes(rootGroup, eyeSpacing, eyeY, eyeZ, eyeMaterials) {
  const eyeRadius = 0.046;

  // Left Eye Group (Independent pivot for gaze tracking)
  const leftEyeGroup = new THREE.Group();
  leftEyeGroup.name = 'LeftEye';
  leftEyeGroup.position.set(-eyeSpacing, eyeY, eyeZ);

  // Sclera
  const leftSclera = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 24, 24), eyeMaterials.sclera);
  leftEyeGroup.add(leftSclera);

  // Iris
  const leftIris = new THREE.Mesh(new THREE.CircleGeometry(0.026, 24), eyeMaterials.iris);
  leftIris.position.set(0, 0, eyeRadius * 0.98);
  leftEyeGroup.add(leftIris);

  // Pupil
  const leftPupil = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), eyeMaterials.pupil);
  leftPupil.position.set(0, 0, eyeRadius * 0.99);
  leftEyeGroup.add(leftPupil);

  // Cornea specularity dome
  const leftCornea = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius * 0.72, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), eyeMaterials.cornea);
  leftCornea.position.set(0, 0, eyeRadius * 0.75);
  leftEyeGroup.add(leftCornea);

  rootGroup.add(leftEyeGroup);

  // Right Eye Group
  const rightEyeGroup = new THREE.Group();
  rightEyeGroup.name = 'RightEye';
  rightEyeGroup.position.set(eyeSpacing, eyeY, eyeZ);

  const rightSclera = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 24, 24), eyeMaterials.sclera);
  rightEyeGroup.add(rightSclera);

  const rightIris = new THREE.Mesh(new THREE.CircleGeometry(0.026, 24), eyeMaterials.iris);
  rightIris.position.set(0, 0, eyeRadius * 0.98);
  rightEyeGroup.add(rightIris);

  const rightPupil = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), eyeMaterials.pupil);
  rightPupil.position.set(0, 0, eyeRadius * 0.99);
  rightEyeGroup.add(rightPupil);

  const rightCornea = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius * 0.72, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), eyeMaterials.cornea);
  rightCornea.position.set(0, 0, eyeRadius * 0.75);
  rightEyeGroup.add(rightCornea);

  rootGroup.add(rightEyeGroup);
}

/**
 * Generates an end-to-end 3D Doctor GLB file for a given clinician persona
 */
async function exportSpecialistDoctor(personaId, isFemale, outputFilename) {
  const scene = new THREE.Scene();
  scene.name = `DoctorScene_${personaId}`;

  const rootGroup = new THREE.Group();
  rootGroup.name = 'DoctorRoot';
  scene.add(rootGroup);

  // 1. Materials configuration
  const skinColor = isFemale ? 0xDFC0AB : 0xD5A78E;
  const hairColor = isFemale ? 0x241812 : 0x2A1D16;
  const irisColor = isFemale ? 0x422818 : 0x38BDF8; // Hazel for Chen, Piercing blue for Vance (Picture 3)

  const materials = {
    skin: new THREE.MeshStandardMaterial({
      name: 'DoctorSkin',
      color: skinColor,
      roughness: 0.52,
      metalness: 0.04
    }),
    hair: new THREE.MeshStandardMaterial({
      name: 'DoctorHair',
      color: hairColor,
      roughness: 0.75,
      metalness: 0.08
    }),
    coat: new THREE.MeshStandardMaterial({
      name: 'DoctorCoat',
      color: 0xF8FAFC, // Crisp white medical doctor coat
      roughness: 0.42,
      metalness: 0.02
    }),
    scrubs: new THREE.MeshStandardMaterial({
      name: 'DoctorScrubs',
      color: 0x5B8DB8, // Clinical sky/ocean blue (Picture 2)
      roughness: 0.65,
      metalness: 0.0
    }),
    shirt: new THREE.MeshStandardMaterial({
      name: 'DoctorShirt',
      color: 0xFFFFFF,
      roughness: 0.45,
      metalness: 0.0
    }),
    tie: new THREE.MeshStandardMaterial({
      name: 'DoctorTie',
      color: 0x4B6B94, // Striped doctor tie tone (Picture 3)
      roughness: 0.35,
      metalness: 0.15
    }),
    stethoscopeTubing: new THREE.MeshStandardMaterial({
      name: 'StethoscopeTubingMat',
      color: 0x1E293B, // Charcoal medical grade silicone
      roughness: 0.40,
      metalness: 0.05
    }),
    stethoscopeMetal: new THREE.MeshStandardMaterial({
      name: 'StethoscopeMetalMat',
      color: 0xE2E8F0,
      roughness: 0.20,
      metalness: 0.90
    }),
    badge: new THREE.MeshStandardMaterial({
      name: 'BadgeMat',
      color: 0xFFFFFF,
      roughness: 0.35,
      metalness: 0.05
    }),
    badgeHeader: new THREE.MeshStandardMaterial({
      name: 'BadgeHeaderMat',
      color: isFemale ? 0x0EA5E9 : 0x3B82F6,
      roughness: 0.30,
      metalness: 0.1
    })
  };

  const eyeMaterials = {
    sclera: new THREE.MeshStandardMaterial({
      name: 'EyeSclera',
      color: 0xFCFBF9,
      roughness: 0.12,
      metalness: 0.0
    }),
    iris: new THREE.MeshStandardMaterial({
      name: 'EyeIris',
      color: irisColor,
      roughness: 0.15,
      metalness: 0.0
    }),
    pupil: new THREE.MeshBasicMaterial({
      name: 'EyePupil',
      color: 0x020202
    }),
    cornea: new THREE.MeshPhysicalMaterial({
      name: 'EyeCornea',
      color: 0xFFFFFF,
      transmission: 0.94,
      transparent: true,
      roughness: 0.02,
      ior: 1.336
    })
  };

  // 2. Sculpted Anatomical Head Mesh with Morph Targets
  const headGeo = createAnatomicalHead(isFemale);
  const headMesh = new THREE.Mesh(headGeo, materials.skin);
  headMesh.name = 'DoctorHead';
  headMesh.position.set(0, 1.48, 0);

  // Morph target dictionary mapping
  headMesh.morphTargetDictionary = {
    jawOpen: 0,
    mouthOpen: 0,
    viseme_oh: 1,
    viseme_ee: 2,
    viseme_aa: 3,
    viseme_mbp: 4,
    viseme_fv: 5,
    mouthSmile: 6,
    eyeBlinkLeft: 7,
    eyeBlinkRight: 8,
    browDown: 9,
    browInnerUp: 10
  };
  headMesh.morphTargetInfluences = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  rootGroup.add(headMesh);

  // 3. Hair Mesh
  const hairGeo = createDoctorHairGeometry(isFemale);
  const hairMesh = new THREE.Mesh(hairGeo, materials.hair);
  hairMesh.name = 'DoctorHair';
  hairMesh.position.set(0, 1.54, -0.02);
  hairMesh.scale.set(1.02, 1.04, 1.04);
  rootGroup.add(hairMesh);

  // 4. Biological 3D Eyes
  const eyeSpacing = isFemale ? 0.110 : 0.118;
  const eyeY = 1.568;
  const eyeZ = 0.285;
  create3DEyes(rootGroup, eyeSpacing, eyeY, eyeZ, eyeMaterials);

  // 5. Attire: Lab coat, shirt/scrubs, lapels, tie, and stethoscope
  buildDoctorAttire(rootGroup, isFemale, materials);

  // 6. Export to binary GLB
  const exporter = new GLTFExporter();
  const outputDir = path.resolve('frontend/public/models');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const glbPath = path.join(outputDir, outputFilename);

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          fs.writeFileSync(glbPath, Buffer.from(gltf));
          console.log(`✓ Successfully exported [${personaId}] to ${glbPath} (${gltf.byteLength} bytes)`);
          resolve(glbPath);
        } else {
          const jsonStr = JSON.stringify(gltf);
          fs.writeFileSync(glbPath.replace('.glb', '.gltf'), jsonStr);
          console.log(`✓ Exported gltf JSON for [${personaId}]`);
          resolve(glbPath);
        }
      },
      (error) => {
        console.error(`Export error for [${personaId}]:`, error);
        reject(error);
      },
      { binary: true }
    );
  });
}

async function main() {
  console.log('Generating realistic 3D Specialist clinician models...');
  
  // 1. Dr. Marcus Vance / Dr. Aris Thorne (Male MetaHuman specialist, Picture 3)
  await exportSpecialistDoctor('doc-vance', false, 'specialist-doctor-vance.glb');
  
  // 2. Dr. Sarah Chen / Dr. Maya Lin (Female clinical specialist, Picture 2)
  await exportSpecialistDoctor('doc-chen', true, 'specialist-doctor-chen.glb');

  // 3. Default specialist-doctor.glb (symlink/copy Vance as default)
  const defaultSrc = path.resolve('frontend/public/models/specialist-doctor-vance.glb');
  const defaultDst = path.resolve('frontend/public/models/specialist-doctor.glb');
  fs.copyFileSync(defaultSrc, defaultDst);
  console.log(`✓ Copied default specialist model to ${defaultDst}`);

  // Also mirror to dist/models if dist exists
  const distModelsDir = path.resolve('dist/models');
  if (fs.existsSync(distModelsDir)) {
    fs.copyFileSync(defaultSrc, path.join(distModelsDir, 'specialist-doctor-vance.glb'));
    fs.copyFileSync(path.resolve('frontend/public/models/specialist-doctor-chen.glb'), path.join(distModelsDir, 'specialist-doctor-chen.glb'));
    fs.copyFileSync(defaultDst, path.join(distModelsDir, 'specialist-doctor.glb'));
    console.log(`✓ Synchronized models to dist/models/`);
  }

  console.log('🎉 All 3D Specialist clinician models generated successfully!');
}

main().catch(err => {
  console.error('Fatal error during GLB generation:', err);
  process.exit(1);
});
