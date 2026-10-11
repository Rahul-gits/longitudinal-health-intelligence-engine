import React, { useEffect, useState, useRef } from 'react';
import { AvatarState } from '../../types/health';
import { AvatarBehavioralParameters } from './AvatarStateController';

export interface FacialExpressionWeights {
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  browInnerUp: number;
  browDown: number;
  mouthSmile: number;
  eyeSquint: number;
  gazeVector: [number, number, number]; // [x, y, z] normalized look direction
}

export interface ExpressionControllerProps {
  behavior: AvatarBehavioralParameters;
  pointerPosition?: { x: number; y: number }; // -1 to 1 normalized mouse/head coordinates
  onExpressionUpdate?: (weights: FacialExpressionWeights) => void;
}

/**
 * ExpressionController: Controls natural physiological blinking,
 * eye saccades, gaze orientation, and clinical facial expressions.
 */
export const ExpressionController: React.FC<ExpressionControllerProps> = ({
  behavior,
  pointerPosition = { x: 0, y: 0 },
  onExpressionUpdate
}) => {
  const [blinkValue, setBlinkValue] = useState<number>(0);
  const [saccadeOffset, setSaccadeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // 1. Natural Human Blinking Engine
  useEffect(() => {
    let timeoutId: any;
    let isMounted = true;

    const triggerBlinkCycle = () => {
      if (!isMounted) return;

      // Close eyelids
      setBlinkValue(1.0);
      setTimeout(() => {
        if (!isMounted) return;
        setBlinkValue(0.0);

        // 35% probability of physiological double-blink
        if (Math.random() < 0.35) {
          setTimeout(() => {
            if (!isMounted) return;
            setBlinkValue(1.0);
            setTimeout(() => {
              if (isMounted) setBlinkValue(0.0);
            }, 110);
          }, 180);
        }
      }, 130);

      // Schedule next blink based on behavior state multiplier
      const baseDelay = (3200 + Math.random() * 1800) * (behavior.blinkRateMultiplier || 1.0);
      timeoutId = setTimeout(triggerBlinkCycle, baseDelay);
    };

    timeoutId = setTimeout(triggerBlinkCycle, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [behavior.blinkRateMultiplier]);

  // 2. Natural Involuntary Eye Saccades (subtle micro-shifts in gaze fixation)
  useEffect(() => {
    if (behavior.state === 'ALERTING') {
      // In ALERTING state, doctor maintains unwavering, direct gaze
      setSaccadeOffset({ x: 0, y: 0 });
      return;
    }

    const saccadeInterval = setInterval(() => {
      // Micro-jitter: +/- 0.02
      const jitterX = (Math.random() - 0.5) * 0.035;
      const jitterY = (Math.random() - 0.5) * 0.025;
      setSaccadeOffset({ x: jitterX, y: jitterY });
    }, 1800);

    return () => clearInterval(saccadeInterval);
  }, [behavior.state]);

  const lastEmittedRef = useRef<FacialExpressionWeights | null>(null);

  // 3. Continuous frame loop updating final expression weights & gaze
  useEffect(() => {
    const loop = () => {
      let baseGazeX = 0;
      let baseGazeY = 0;
      let baseGazeZ = 1.0;

      // Target gaze according to clinical consultation behavior
      switch (behavior.gazeTarget) {
        case 'direct_camera':
          // Soft tracking of user pointer combined with camera eye contact
          baseGazeX = pointerPosition.x * 0.12 + saccadeOffset.x;
          baseGazeY = pointerPosition.y * 0.08 + saccadeOffset.y;
          break;

        case 'patient_chart':
          // Gaze shifts downward-right towards health metrics chart
          baseGazeX = 0.22 + saccadeOffset.x * 0.5;
          baseGazeY = -0.28 + saccadeOffset.y * 0.5;
          break;

        case 'thoughtful_tilt':
          // Subtle upward thoughtful glance
          baseGazeX = -0.08 + saccadeOffset.x;
          baseGazeY = 0.14 + saccadeOffset.y;
          break;

        case 'alert_fixed':
          // Completely centered, unflinching
          baseGazeX = 0;
          baseGazeY = 0;
          break;
      }

      const weights: FacialExpressionWeights = {
        eyeBlinkLeft: blinkValue,
        eyeBlinkRight: blinkValue,
        browInnerUp: behavior.browInnerUpWeight,
        browDown: behavior.browFurrowWeight,
        mouthSmile: behavior.smileWeight,
        eyeSquint: behavior.smileWeight * 0.45,
        gazeVector: [baseGazeX, baseGazeY, baseGazeZ]
      };

      const prev = lastEmittedRef.current;
      const hasSignificantChange = !prev ||
        Math.abs(weights.eyeBlinkLeft - prev.eyeBlinkLeft) > 0.01 ||
        Math.abs(weights.browInnerUp - prev.browInnerUp) > 0.01 ||
        Math.abs(weights.browDown - prev.browDown) > 0.01 ||
        Math.abs(weights.mouthSmile - prev.mouthSmile) > 0.01 ||
        Math.abs(weights.gazeVector[0] - prev.gazeVector[0]) > 0.005 ||
        Math.abs(weights.gazeVector[1] - prev.gazeVector[1]) > 0.005;

      if (hasSignificantChange) {
        lastEmittedRef.current = weights;
        onExpressionUpdate?.(weights);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [behavior, pointerPosition, blinkValue, saccadeOffset, onExpressionUpdate]);

  return null;
};
