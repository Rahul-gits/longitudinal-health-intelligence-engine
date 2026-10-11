import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfills for Node environment
globalThis.self = globalThis;
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
 * Creates 3D medical accessories: dual-tube stethoscope and clinician badge
 * properly proportioned to human anatomy (neck y ~ 1.45, chest y ~ 1.25)
 */
function createMedicalAccessories(isFemale = false) {
  const group = new THREE.Group();
  group.name = 'MedicalAccessories';

  // 1. Dual-Lumen Silicone Stethoscope Tubing
  // Neck is at y ~ 1.48, chest center at y ~ 1.28
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
    color: 0x1E293B, // Charcoal medical grade silicone
    roughness: 0.40,
    metalness: 0.05
  });

  const stethGeo = new THREE.TubeGeometry(stethCurve, 48, 0.009, 12, false);
  const stethMesh = new THREE.Mesh(stethGeo, stethMat);
  stethMesh.name = 'StethoscopeTubing';
  stethMesh.castShadow = true;
  group.add(stethMesh);

  // 2. Stainless Steel Dual-Frequency Chestpiece (Bell & Diaphragm)
  const bellMat = new THREE.MeshStandardMaterial({
    name: 'StethoscopeStainlessSteel',
    color: 0xE2E8F0,
    roughness: 0.18,
    metalness: 0.92
  });

  const bellGeo = new THREE.CylinderGeometry(0.024, 0.027, 0.014, 28);
  const bellMesh = new THREE.Mesh(bellGeo, bellMat);
  bellMesh.name = 'StethoscopeBell';
  bellMesh.rotation.x = Math.PI / 2;
  bellMesh.position.set(-0.03, 1.14, 0.16);
  bellMesh.castShadow = true;
  group.add(bellMesh);

  // 3. Clinician Credentials Badge on Left Lapel
  const badgeCardGeo = new THREE.BoxGeometry(0.065, 0.09, 0.006);
  const badgeCardMat = new THREE.MeshStandardMaterial({
    name: 'ClinicianBadgeCard',
    color: 0xFFFFFF,
    roughness: 0.35,
    metalness: 0.02
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
    color: isFemale ? 0x0284C7 : 0x1E3A8A, // Blue clinical banner
    roughness: 0.30,
    metalness: 0.10
  });
  const badgeHeader = new THREE.Mesh(badgeHeaderGeo, badgeHeaderMat);
  badgeHeader.position.set(0.14, 1.315, 0.131);
  badgeHeader.rotation.y = -0.06;
  group.add(badgeHeader);

  return group;
}

/**
 * Loads a Ready Player Me GLB, styles it for clinician duty, and exports the final GLB
 */
async function processDoctorModel(srcPath, outputPath, isFemale) {
  const buf = fs.readFileSync(srcPath);
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.parse(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      '',
      (gltf) => {
        const scene = gltf.scene;
        scene.name = isFemale ? 'SpecialistDoctor_Chen' : 'SpecialistDoctor_Vance';

        // 1. Clean up meshes: hide or remove glasses on male so eyes are crystal clear
        const glasses = scene.getObjectByName('Wolf3D_Glasses');
        if (glasses) {
          glasses.parent.remove(glasses);
          console.log('✓ Removed glasses for unobstructed eye visibility');
        }

        // 2. Enhance medical attire materials
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Outfit top -> Clinical doctor lab coat / medical scrub coat
            if (child.name === 'Wolf3D_Outfit_Top') {
              if (child.material) {
                // Apply white lab coat tint and clean medical textile roughness
                child.material.roughness = 0.55;
                child.material.metalness = 0.02;
              }
            }

            // Skin material -> Subsurface warmth and natural softness
            if (child.name === 'Wolf3D_Head' || child.name === 'Wolf3D_Body') {
              if (child.material) {
                child.material.roughness = 0.50;
                child.material.metalness = 0.0;
              }
            }

            // Hair -> Natural specular and anisotropic softness
            if (child.name === 'Wolf3D_Hair') {
              if (child.material) {
                child.material.roughness = 0.72;
                child.material.metalness = 0.05;
              }
            }

            // Eyes -> Moist corneal specularity and clarity
            if (child.name === 'EyeLeft' || child.name === 'EyeRight') {
              if (child.material) {
                child.material.roughness = 0.12;
                child.material.metalness = 0.0;
              }
            }
          }
        });

        // 3. Attach medical accessories (stethoscope & hospital credential badge)
        const medicalAccessories = createMedicalAccessories(isFemale);
        scene.add(medicalAccessories);

        // 4. Export to final binary GLB
        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (glb) => {
            if (glb instanceof ArrayBuffer) {
              fs.writeFileSync(outputPath, Buffer.from(glb));
              console.log(`✓ Successfully exported [${path.basename(outputPath)}] (${glb.byteLength} bytes)`);
              resolve(outputPath);
            } else {
              reject(new Error('Export did not produce ArrayBuffer'));
            }
          },
          (err) => reject(err),
          { binary: true }
        );
      },
      (err) => reject(err)
    );
  });
}

async function main() {
  console.log('Upgrading Heal Engine 3D Specialist models to real rigged human assets...');

  const maleSrc = 'devops/rpm-male.glb';
  const femaleSrc = 'devops/rpm-female.glb';

  const vanceDest = 'frontend/public/models/specialist-doctor-vance.glb';
  const chenDest = 'frontend/public/models/specialist-doctor-chen.glb';
  const defaultDest = 'frontend/public/models/specialist-doctor.glb';

  await processDoctorModel(maleSrc, vanceDest, false);
  await processDoctorModel(femaleSrc, chenDest, true);

  // Copy default alias to Vance
  fs.copyFileSync(vanceDest, defaultDest);
  console.log(`✓ Updated default model: ${defaultDest}`);

  // Mirror to dist/models if dist exists
  const distDir = 'dist/models';
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(vanceDest, path.join(distDir, 'specialist-doctor-vance.glb'));
    fs.copyFileSync(chenDest, path.join(distDir, 'specialist-doctor-chen.glb'));
    fs.copyFileSync(defaultDest, path.join(distDir, 'specialist-doctor.glb'));
    console.log(`✓ Synchronized models to ${distDir}/`);
  }

  console.log('🎉 Both male and female specialist doctor GLBs successfully prepared!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
