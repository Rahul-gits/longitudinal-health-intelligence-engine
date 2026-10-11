import React, { useEffect, useRef, useState } from 'react';
import { AvatarBehavioralParameters } from './AvatarStateController';

export interface PostureKinematics {
  headRotation: [number, number, number];  // [pitch (X), yaw (Y), roll (Z)] in radians
  neckRotation: [number, number, number];
  spineOffset: [number, number, number];   // [x, y, z] translational offset
  chestBreathingScale: number;             // 1.0 +/- breathing expansion
  noddingPhase: number;
}

export interface GestureControllerProps {
  behavior: AvatarBehavioralParameters;
  isSpeaking: boolean;
  pointerPosition?: { x: number; y: number };
  onKinematicsUpdate?: (kinematics: PostureKinematics) => void;
}

/**
 * GestureController: Governs head motion, listening nods, thoughtful head tilt,
 * organic respiratory cycles, and restrained clinical postural shifts.
 */
export const GestureController: React.FC<GestureControllerProps> = ({
  behavior,
  isSpeaking,
  pointerPosition = { x: 0, y: 0 },
  onKinematicsUpdate
}) => {
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();

    const loop = (time: number) => {
      const elapsed = time - startTime;

      // 1. Organic Respiration Cycle (~14 breaths / min -> ~0.23 Hz)
      const breathingPhase = (elapsed / 1000) * 1.45;
      const breathingWave = Math.sin(breathingPhase);
      const chestScale = 1.0 + breathingWave * 0.015 * (behavior.breathingAmplitude || 1.0);

      // 2. Listening Nodding Motion
      let nodPitch = 0;
      if (behavior.noddingEnabled) {
        // Natural human listening cadence: intermittent slow affirmative nodding cycles
        const nodCadence = Math.sin((elapsed / 1000) * 3.8);
        const nodBurst = Math.sin((elapsed / 1000) * 0.45); // Active for 2s every 7s
        if (nodBurst > 0.3) {
          nodPitch = Math.max(0, nodCadence) * 0.038;
        }
      }

      // 3. Speech Emphasis Micro-gestures (Explaining / Speaking)
      let speechHeadPitch = 0;
      let speechHeadYaw = 0;
      if (isSpeaking) {
        const speechOsc = Math.sin((elapsed / 1000) * 4.6);
        speechHeadPitch = speechOsc * 0.018;
        speechHeadYaw = Math.cos((elapsed / 1000) * 2.3) * 0.014;
      }

      // 4. Clinical State Posture Offsets
      let targetPitch = 0; // X
      let targetYaw = 0;   // Y
      let targetRoll = 0;  // Z
      let targetPosZ = behavior.postureLean;

      switch (behavior.state) {
        case 'GREETING':
          targetPitch = 0.01;
          targetRoll = -0.015; // Gentle welcoming head inclination
          break;

        case 'LISTENING':
          targetPitch = 0.03 + nodPitch;
          targetRoll = 0.02; // Attentive tilt
          break;

        case 'UNDERSTANDING':
          targetPitch = 0.02 + nodPitch;
          targetYaw = -0.04;
          targetRoll = 0.045; // Characteristic thoughtful head tilt
          break;

        case 'REVIEWING':
          targetPitch = -0.06; // Head tilted slightly down towards records
          targetYaw = 0.05;   // Head turned slightly towards lab evidence chart
          targetRoll = -0.01;
          break;

        case 'EXPLAINING':
          targetPitch = speechHeadPitch;
          targetYaw = speechHeadYaw;
          targetRoll = 0.01;
          break;

        case 'CHECKING':
          targetPitch = 0.01;
          targetYaw = 0.0;
          targetRoll = 0.0;
          break;

        case 'REASSURING':
          targetPitch = -0.01;
          targetRoll = -0.035; // Gentle, comforting tilt
          break;

        case 'ALERTING':
          targetPitch = 0.05; // Erect, serious forward attention
          targetYaw = 0.0;
          targetRoll = 0.0;
          targetPosZ = 0.06; // Leaned forward
          break;
      }

      // Soft mouse look influence on head orientation
      const headLookX = (pointerPosition.y * 0.04);
      const headLookY = (pointerPosition.x * 0.06);

      const kinematics: PostureKinematics = {
        headRotation: [targetPitch + headLookX, targetYaw + headLookY, targetRoll],
        neckRotation: [(targetPitch + headLookX) * 0.45, (targetYaw + headLookY) * 0.45, targetRoll * 0.45],
        spineOffset: [0, breathingWave * 0.004, targetPosZ],
        chestBreathingScale: chestScale,
        noddingPhase: nodPitch
      };

      onKinematicsUpdate?.(kinematics);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [behavior, isSpeaking, pointerPosition, onKinematicsUpdate]);

  return null;
};
