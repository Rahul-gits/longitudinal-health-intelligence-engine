import React, { useEffect, useRef, useState, useCallback } from 'react';

export type VisemeType = 'SIL' | 'AA' | 'EE' | 'OH' | 'MBP' | 'FV' | 'LDT';

export interface MorphWeightSet {
  jawOpen: number;       // 0 to 1
  mouthOpen: number;     // 0 to 1
  mouthSpread: number;   // 0.8 to 1.3
  mouthPucker: number;   // 0 to 1
  viseme_aa: number;     // 0 to 1
  viseme_ee: number;     // 0 to 1
  viseme_oh: number;     // 0 to 1
  viseme_sil: number;    // 0 to 1
  viseme_mbp?: number;   // 0 to 1
  viseme_fv?: number;    // 0 to 1
  currentViseme: VisemeType;
}

/**
 * Phonetic classifier mapping English words/syllables to standard viseme shapes
 */
export function classifyWordToViseme(word: string): VisemeType {
  if (!word || !word.trim()) return 'SIL';
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 'SIL';

  // 1. Labiodental fricative: F, V, PH (checked before generic P)
  if (/^[fv]/.test(clean) || clean.startsWith('ph') || clean.includes('ph')) return 'FV';

  // 2. Bilabial closure: M, B, P
  if (/^[mbp]/.test(clean) || /(mb|mp|bb|pp)$/.test(clean)) return 'MBP';

  // 3. Lingual / alveolar consonants: L, D, T, N, S, Z, TH, CH, SH (checked before interior vowels)
  if (/^[ldtnsz]/.test(clean) || clean.startsWith('th') || clean.startsWith('ch') || clean.startsWith('sh')) return 'LDT';

  // 4. Rounded open vowels and bilabial glides: W, O, OO, OW, AW, AU
  if (/^w/.test(clean) || /(oo|ou|ow|aw|au|[ou])/.test(clean)) return 'OH';

  // 5. Spread vowels: EE, EA, AI, AY, EY, I
  if (/(ee|ea|ai|ay|ey|[ie])/.test(clean)) return 'EE';

  // 6. Open back vowel (fallback for standard syllables): A
  return 'AA';
}

/**
 * Maps a classified viseme into realistic anatomical 3D morph weights
 */
export function getVisemeMorphWeights(viseme: VisemeType, syllableIntensity: number): MorphWeightSet {
  const intensity = Math.min(1.0, Math.max(0.0, syllableIntensity));

  switch (viseme) {
    case 'SIL':
      return {
        jawOpen: 0.0,
        mouthOpen: 0.0,
        mouthSpread: 1.0,
        mouthPucker: 0.0,
        viseme_aa: 0.0,
        viseme_ee: 0.0,
        viseme_oh: 0.0,
        viseme_sil: 1.0,
        currentViseme: 'SIL'
      };

    case 'AA':
      return {
        jawOpen: 0.75 * intensity,
        mouthOpen: 0.85 * intensity,
        mouthSpread: 1.05,
        mouthPucker: 0.0,
        viseme_aa: 0.9 * intensity,
        viseme_ee: 0.0,
        viseme_oh: 0.1 * intensity,
        viseme_sil: 0.0,
        currentViseme: 'AA'
      };

    case 'OH':
      return {
        jawOpen: 0.65 * intensity,
        mouthOpen: 0.6 * intensity,
        mouthSpread: 0.85,
        mouthPucker: 0.7 * intensity,
        viseme_aa: 0.1 * intensity,
        viseme_ee: 0.0,
        viseme_oh: 0.85 * intensity,
        viseme_sil: 0.0,
        currentViseme: 'OH'
      };

    case 'EE':
      return {
        jawOpen: 0.35 * intensity,
        mouthOpen: 0.4 * intensity,
        mouthSpread: 1.25,
        mouthPucker: 0.0,
        viseme_aa: 0.0,
        viseme_ee: 0.85 * intensity,
        viseme_oh: 0.0,
        viseme_sil: 0.0,
        currentViseme: 'EE'
      };

    case 'MBP':
      // Bilabial closure: lips compressed together
      return {
        jawOpen: 0.05 * intensity,
        mouthOpen: 0.0,
        mouthSpread: 0.98,
        mouthPucker: 0.3 * intensity,
        viseme_aa: 0.0,
        viseme_ee: 0.0,
        viseme_oh: 0.0,
        viseme_sil: 0.2,
        currentViseme: 'MBP'
      };

    case 'FV':
      // Lower lip tucked against upper teeth
      return {
        jawOpen: 0.2 * intensity,
        mouthOpen: 0.18 * intensity,
        mouthSpread: 1.08,
        mouthPucker: 0.1,
        viseme_aa: 0.0,
        viseme_ee: 0.2 * intensity,
        viseme_oh: 0.0,
        viseme_sil: 0.0,
        currentViseme: 'FV'
      };

    case 'LDT':
      return {
        jawOpen: 0.45 * intensity,
        mouthOpen: 0.42 * intensity,
        mouthSpread: 1.05,
        mouthPucker: 0.05,
        viseme_aa: 0.3 * intensity,
        viseme_ee: 0.15 * intensity,
        viseme_oh: 0.0,
        viseme_sil: 0.0,
        currentViseme: 'LDT'
      };

    default:
      return {
        jawOpen: 0.0,
        mouthOpen: 0.0,
        mouthSpread: 1.0,
        mouthPucker: 0.0,
        viseme_aa: 0.0,
        viseme_ee: 0.0,
        viseme_oh: 0.0,
        viseme_sil: 1.0,
        currentViseme: 'SIL'
      };
  }
}

export interface LipSyncControllerProps {
  isSpeaking: boolean;
  isMuted?: boolean;
  activeWord?: string;
  onMorphWeightsUpdate?: (weights: MorphWeightSet) => void;
}

/**
 * LipSyncController: Synchronizes mouth shapes and jaw articulation
 * using syllabic audio cadence analysis with smooth temporal dampening.
 */
export const LipSyncController: React.FC<LipSyncControllerProps> = ({
  isSpeaking,
  isMuted = false,
  activeWord = '',
  onMorphWeightsUpdate
}) => {
  const currentWeightsRef = useRef<MorphWeightSet>({
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

  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSpeaking || isMuted) {
      const restWeights: MorphWeightSet = {
        jawOpen: 0,
        mouthOpen: 0,
        mouthSpread: 1.0,
        mouthPucker: 0,
        viseme_aa: 0,
        viseme_ee: 0,
        viseme_oh: 0,
        viseme_sil: 1.0,
        currentViseme: 'SIL'
      };
      currentWeightsRef.current = restWeights;
      onMorphWeightsUpdate?.(restWeights);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const startTime = performance.now();

    const loop = (time: number) => {
      const elapsed = time - startTime;

      // Human speech articulation cadence (~4.2 Hz primary syllable oscillator + 11.5 Hz micro-articulators)
      const primaryOsc = Math.sin((elapsed / 1000) * Math.PI * 8.4);
      const secondaryOsc = Math.sin((elapsed / 1000) * Math.PI * 15.2);
      const microFlutter = Math.sin((elapsed / 1000) * Math.PI * 24.0) * 0.1;
      
      const rawSyllableWave = Math.max(0, primaryOsc * 0.7 + secondaryOsc * 0.3 + microFlutter);
      const syllableIntensity = Math.min(1.0, Math.max(0.12, rawSyllableWave * 1.15));

      const viseme = classifyWordToViseme(activeWord);
      const targetWeights = getVisemeMorphWeights(viseme, syllableIntensity);

      // Smooth temporal interpolation (lerp factor = 0.28)
      const lerp = (curr: number, tgt: number, f: number = 0.28) => curr + (tgt - curr) * f;

      const interpolated: MorphWeightSet = {
        jawOpen: lerp(currentWeightsRef.current.jawOpen, targetWeights.jawOpen),
        mouthOpen: lerp(currentWeightsRef.current.mouthOpen, targetWeights.mouthOpen),
        mouthSpread: lerp(currentWeightsRef.current.mouthSpread, targetWeights.mouthSpread),
        mouthPucker: lerp(currentWeightsRef.current.mouthPucker, targetWeights.mouthPucker),
        viseme_aa: lerp(currentWeightsRef.current.viseme_aa, targetWeights.viseme_aa),
        viseme_ee: lerp(currentWeightsRef.current.viseme_ee, targetWeights.viseme_ee),
        viseme_oh: lerp(currentWeightsRef.current.viseme_oh, targetWeights.viseme_oh),
        viseme_sil: lerp(currentWeightsRef.current.viseme_sil, targetWeights.viseme_sil),
        currentViseme: viseme
      };

      currentWeightsRef.current = interpolated;
      onMorphWeightsUpdate?.(interpolated);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isSpeaking, isMuted, activeWord, onMorphWeightsUpdate]);

  return null;
};
