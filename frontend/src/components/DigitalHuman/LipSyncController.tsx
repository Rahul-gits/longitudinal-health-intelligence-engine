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
  viseme_mbp?: number;   // 0 to 1 (bilabial plosives)
  viseme_fv?: number;    // 0 to 1 (labiodental)
  viseme_th?: number;    // 0 to 1 (lingual / dental)
  viseme_dd?: number;    // 0 to 1 (alveolar)
  viseme_ss?: number;    // 0 to 1 (sibilant)
  currentViseme: VisemeType;
}

/**
 * High-precision phonetic dictionary of clinical medications, biomarkers, and anatomy
 * mapping spoken words into multi-syllable viseme progressions.
 */
export const CLINICAL_VOCABULARY_LEXICON: Record<string, VisemeType[]> = {
  // Common test words
  mom: ['MBP', 'AA', 'MBP'],
  pharmacy: ['FV', 'AA', 'MBP', 'AA', 'LDT', 'EE'],
  water: ['OH', 'AA', 'LDT', 'EE'],
  kidney: ['EE', 'LDT', 'EE'],
  telemetry: ['LDT', 'EE', 'LDT', 'EE', 'MBP', 'EE', 'LDT', 'EE'],

  // Core Clinical Medications
  lisinopril: ['LDT', 'EE', 'LDT', 'OH', 'MBP', 'EE', 'LDT'],
  furosemide: ['FV', 'OH', 'OH', 'EE', 'MBP', 'AA', 'EE', 'LDT'],
  diclofenac: ['LDT', 'EE', 'AA', 'OH', 'FV', 'EE', 'AA', 'LDT'],
  metformin: ['MBP', 'EE', 'LDT', 'FV', 'OH', 'MBP', 'EE', 'LDT'],
  spironolactone: ['LDT', 'MBP', 'EE', 'OH', 'LDT', 'OH', 'AA', 'LDT', 'OH', 'LDT'],
  atorvastatin: ['AA', 'LDT', 'OH', 'AA', 'FV', 'AA', 'LDT', 'AA', 'LDT', 'EE', 'LDT'],
  clopidogrel: ['AA', 'OH', 'MBP', 'EE', 'LDT', 'OH', 'AA', 'EE', 'LDT'],
  warfarin: ['OH', 'AA', 'FV', 'AA', 'EE', 'LDT'],
  aspirin: ['AA', 'LDT', 'MBP', 'EE', 'LDT'],
  ibuprofen: ['AA', 'EE', 'MBP', 'OH', 'FV', 'OH', 'EE', 'LDT'],
  acetaminophen: ['AA', 'LDT', 'EE', 'LDT', 'AA', 'MBP', 'EE', 'LDT', 'OH', 'FV', 'EE', 'LDT'],
  carvedilol: ['AA', 'AA', 'FV', 'EE', 'LDT', 'EE', 'OH', 'LDT'],
  sacubitril: ['LDT', 'AA', 'AA', 'OH', 'MBP', 'EE', 'LDT', 'EE', 'LDT'],
  valsartan: ['FV', 'AA', 'LDT', 'LDT', 'AA', 'LDT', 'AA', 'LDT'],
  empagliflozin: ['EE', 'MBP', 'AA', 'AA', 'LDT', 'EE', 'FV', 'OH', 'LDT', 'EE', 'LDT'],
  dapagliflozin: ['LDT', 'AA', 'AA', 'MBP', 'AA', 'LDT', 'EE', 'FV', 'OH', 'LDT', 'EE', 'LDT'],
  losartan: ['LDT', 'OH', 'LDT', 'AA', 'LDT', 'AA', 'LDT'],
  amlodipine: ['AA', 'MBP', 'LDT', 'OH', 'LDT', 'EE', 'MBP', 'EE', 'LDT'],
  hydrochlorothiazide: ['AA', 'AA', 'LDT', 'OH', 'AA', 'LDT', 'EE', 'OH', 'LDT', 'AA', 'LDT', 'AA', 'LDT', 'EE', 'LDT'],

  // Biomarkers, Genomics, Organ Systems & Lab Terms
  egfr: ['EE', 'EE', 'FV', 'AA'],
  ckd: ['AA', 'AA', 'LDT'],
  creatinine: ['AA', 'EE', 'AA', 'LDT', 'EE', 'LDT', 'EE', 'LDT'],
  potassium: ['MBP', 'OH', 'LDT', 'AA', 'EE', 'OH', 'MBP'],
  cyp2c9: ['LDT', 'EE', 'MBP', 'LDT', 'OH', 'LDT', 'EE'],
  ntprobnp: ['LDT', 'LDT', 'MBP', 'OH', 'MBP', 'LDT', 'MBP'],
  nephrology: ['LDT', 'EE', 'FV', 'OH', 'LDT', 'OH', 'AA', 'EE'],
  cardiorenal: ['AA', 'AA', 'LDT', 'EE', 'OH', 'EE', 'LDT', 'AA', 'LDT'],
  cardiology: ['AA', 'AA', 'LDT', 'EE', 'OH', 'LDT', 'OH', 'AA', 'EE'],
  pharmacogenomics: ['FV', 'AA', 'MBP', 'AA', 'AA', 'OH', 'EE', 'OH', 'MBP', 'EE', 'LDT'],
  hemodynamics: ['EE', 'MBP', 'OH', 'LDT', 'AA', 'EE', 'AA', 'MBP', 'EE', 'LDT'],
  hypertension: ['AA', 'EE', 'MBP', 'EE', 'LDT', 'EE', 'LDT', 'EE', 'OH', 'LDT'],
  hyperkalemia: ['AA', 'EE', 'MBP', 'EE', 'AA', 'AA', 'LDT', 'EE', 'MBP', 'EE', 'AA'],
  hypokalemia: ['AA', 'EE', 'MBP', 'OH', 'AA', 'AA', 'LDT', 'EE', 'MBP', 'EE', 'AA'],
  decongestion: ['LDT', 'EE', 'AA', 'OH', 'LDT', 'EE', 'LDT', 'OH', 'LDT'],
  electrolytes: ['EE', 'LDT', 'EE', 'AA', 'LDT', 'OH', 'LDT', 'AA', 'EE', 'LDT'],
  prescription: ['MBP', 'EE', 'LDT', 'AA', 'EE', 'MBP', 'LDT', 'EE', 'OH', 'LDT'],
  medication: ['MBP', 'EE', 'LDT', 'EE', 'AA', 'AA', 'LDT', 'EE', 'OH', 'LDT'],
  consultation: ['AA', 'OH', 'LDT', 'OH', 'LDT', 'AA', 'LDT', 'EE', 'OH', 'LDT'],
  recommendation: ['AA', 'EE', 'AA', 'OH', 'MBP', 'EE', 'LDT', 'AA', 'LDT', 'EE', 'OH', 'LDT'],
  diagnosis: ['LDT', 'AA', 'EE', 'AA', 'OH', 'LDT', 'EE', 'LDT'],
  symptoms: ['LDT', 'EE', 'MBP', 'LDT', 'OH', 'MBP', 'LDT'],
  edema: ['EE', 'LDT', 'EE', 'MBP', 'AA'],
  orthopnea: ['OH', 'LDT', 'OH', 'MBP', 'LDT', 'EE', 'AA'],
  systolic: ['LDT', 'EE', 'LDT', 'OH', 'LDT', 'EE', 'AA'],
  diastolic: ['LDT', 'AA', 'EE', 'AA', 'LDT', 'OH', 'LDT', 'EE', 'AA'],
  clearance: ['AA', 'LDT', 'EE', 'AA', 'LDT', 'AA', 'LDT'],
  guidelines: ['AA', 'AA', 'EE', 'LDT', 'LDT', 'AA', 'EE', 'LDT']
};

/**
 * Patient-friendly vocabulary explanations for clinical clarity and user understanding
 */
export interface ClinicalVocabularyEntry {
  term: string;
  phonetic: string;
  category: 'Medication' | 'Biomarker' | 'Pathology' | 'Physiology' | 'Gene' | 'Guideline';
  patientExplanation: string;
  clinicalSignificance: string;
  syllables: string[];
}

export const CLINICAL_VOCABULARY_GLOSSARY: Record<string, ClinicalVocabularyEntry> = {
  lisinopril: {
    term: 'Lisinopril',
    phonetic: 'lye-SIN-oh-pril',
    category: 'Medication',
    patientExplanation: 'Blood pressure medication (ACE inhibitor) that protects your kidneys and relaxes blood vessels.',
    clinicalSignificance: 'First-line renin-angiotensin blockade. Monitor serum creatinine and potassium for acute elevation.',
    syllables: ['Li', 'si', 'no', 'pril']
  },
  furosemide: {
    term: 'Furosemide',
    phonetic: 'fur-OH-se-mide',
    category: 'Medication',
    patientExplanation: 'Diuretic (water pill) that helps your kidneys remove excess fluid and relieves lung or ankle swelling.',
    clinicalSignificance: 'Loop diuretic for cardiorenal decongestion. Risk of hypokalemia and prerenal azotemia if over-diuresed.',
    syllables: ['Fu', 'ro', 'se', 'mide']
  },
  diclofenac: {
    term: 'Diclofenac',
    phonetic: 'dye-KLO-fen-ak',
    category: 'Medication',
    patientExplanation: 'Anti-inflammatory pain reliever (NSAID) that can strain kidney filters and blunt blood pressure pills.',
    clinicalSignificance: 'Non-steroidal anti-inflammatory. Inhibits renal prostaglandins, elevating AKI and cardiorenal decompensation risk.',
    syllables: ['Di', 'clo', 'fe', 'nac']
  },
  egfr: {
    term: 'eGFR',
    phonetic: 'ee-GEE-eff-ar',
    category: 'Biomarker',
    patientExplanation: 'Kidney filtration score measuring how many milliliters of blood your kidneys clean every minute.',
    clinicalSignificance: 'Estimated Glomerular Filtration Rate. Normal >90 mL/min/1.73m². Value <60 defines chronic kidney disease (CKD).',
    syllables: ['e', 'G', 'F', 'R']
  },
  creatinine: {
    term: 'Creatinine',
    phonetic: 'kree-AT-ih-neen',
    category: 'Biomarker',
    patientExplanation: 'Natural muscle waste product in blood; higher numbers tell doctors your kidneys are working harder.',
    clinicalSignificance: 'Serum creatinine marker. A rise ≥0.3 mg/dL within 48h meets KDIGO diagnostic criteria for Acute Kidney Injury.',
    syllables: ['Cre', 'at', 'i', 'nine']
  },
  potassium: {
    term: 'Potassium',
    phonetic: 'poh-TASS-ee-um',
    category: 'Biomarker',
    patientExplanation: 'Crucial blood mineral regulating your heart rhythm and muscle contraction; must stay in a safe balanced zone.',
    clinicalSignificance: 'Essential cation. Serum safe range: 3.5 - 5.0 mEq/L. Hyperkalemia (>5.0) carries severe cardiac arrhythmia risk.',
    syllables: ['Po', 'tas', 'si', 'um']
  },
  cyp2c9: {
    term: 'CYP2C9',
    phonetic: 'sip-TOO-see-nine',
    category: 'Gene',
    patientExplanation: 'Liver enzyme gene that determines how fast or slowly your body clears medications like NSAIDs or blood thinners.',
    clinicalSignificance: 'Pharmacogenomic biomarker. Intermediate (*1/*3) and poor metabolizers have diminished drug clearance and elevated toxicity risk.',
    syllables: ['CYP', '2', 'C', '9']
  },
  metformin: {
    term: 'Metformin',
    phonetic: 'met-FOR-min',
    category: 'Medication',
    patientExplanation: 'First-choice medication for type 2 diabetes that helps your body use natural insulin more effectively.',
    clinicalSignificance: 'Biguanide antihyperglycemic agent. Requires dose adjustment when eGFR <45, contraindicated if eGFR <30.',
    syllables: ['Met', 'for', 'min']
  },
  spironolactone: {
    term: 'Spironolactone',
    phonetic: 'speer-on-oh-LAK-tone',
    category: 'Medication',
    patientExplanation: 'Potassium-sparing water pill that blocks hormone aldosterone to protect your heart and kidneys.',
    clinicalSignificance: 'Mineralocorticoid receptor antagonist (MRA). Strong guideline recommendation for heart failure, monitors potassium closely.',
    syllables: ['Spi', 'ro', 'no', 'lac', 'tone']
  },
  hemodynamics: {
    term: 'Hemodynamics',
    phonetic: 'hee-moh-dye-NAM-iks',
    category: 'Physiology',
    patientExplanation: 'The physical forces and blood flow pressures circulating oxygen and nutrients through your organs.',
    clinicalSignificance: 'Intravascular volume, systemic vascular resistance, and cardiac output governing renal perfusion pressure.',
    syllables: ['He', 'mo', 'dy', 'nam', 'ics']
  },
  cardiorenal: {
    term: 'Cardiorenal',
    phonetic: 'kar-dee-oh-REE-nul',
    category: 'Physiology',
    patientExplanation: 'The interconnected health loop between your heart and kidneys, where one directly influences the other.',
    clinicalSignificance: 'Bidirectional heart-kidney crosstalk. Cardiorenal syndrome (CRS) types 1-5 dictate simultaneous fluid and filtration care.',
    syllables: ['Car', 'di', 'o', 're', 'nal']
  },
  nephrology: {
    term: 'Nephrology',
    phonetic: 'neh-FROL-oh-jee',
    category: 'Physiology',
    patientExplanation: 'The medical specialty centered entirely on kidney care, fluid balance, and electrolyte regulation.',
    clinicalSignificance: 'Medical subspecialty managing renal pathology, acute tubular necrosis, glomerulonephritis, and dialysis therapies.',
    syllables: ['Neph', 'rol', 'o', 'gy']
  },
  pharmacogenomics: {
    term: 'Pharmacogenomics',
    phonetic: 'far-muh-koh-jeh-NOM-iks',
    category: 'Gene',
    patientExplanation: 'Personalized medicine study of how your unique DNA influences how you respond to medications.',
    clinicalSignificance: 'CPIC-guided genotype-to-phenotype translation optimizing drug efficacy while eliminating adverse drug reactions.',
    syllables: ['Phar', 'ma', 'co', 'ge', 'nom', 'ics']
  },
  hypertension: {
    term: 'Hypertension',
    phonetic: 'hye-per-TEN-shun',
    category: 'Pathology',
    patientExplanation: 'High blood pressure placing extra strain on your heart and delicate kidney blood vessels.',
    clinicalSignificance: 'Chronic arterial pressure elevation ≥130/80 mmHg; major modifiable driver of CKD progression and stroke.',
    syllables: ['Hy', 'per', 'ten', 'sion']
  },
  decongestion: {
    term: 'Decongestion',
    phonetic: 'dee-kun-JES-chun',
    category: 'Physiology',
    patientExplanation: 'The safe medical unloading of excess fluid buildup from your lungs, abdomen, and lower limbs.',
    clinicalSignificance: 'Therapeutic clearance of interstitial and central venous congestion to restore renal vein drainage perfusion gradient.',
    syllables: ['De', 'con', 'ges', 'tion']
  }
};

/**
 * Looks up any spoken word in the clinical vocabulary glossary
 */
export function lookupClinicalVocabulary(word: string): ClinicalVocabularyEntry | null {
  if (!word) return null;
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return null;

  if (CLINICAL_VOCABULARY_GLOSSARY[clean]) {
    return CLINICAL_VOCABULARY_GLOSSARY[clean];
  }

  // Check prefix / partial match for composite clinical terms
  for (const [key, entry] of Object.entries(CLINICAL_VOCABULARY_GLOSSARY)) {
    if (clean.includes(key) || key.includes(clean)) {
      if (clean.length >= 4) return entry;
    }
  }

  return null;
}

/**
 * Decomposes any English or clinical word into a sequential progression of visemes
 */
export function decomposeWordToVisemes(word: string): VisemeType[] {
  if (!word || !word.trim()) return ['SIL'];
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return ['SIL'];

  // 1. Direct match in clinical vocabulary lexicon
  if (CLINICAL_VOCABULARY_LEXICON[clean]) {
    return CLINICAL_VOCABULARY_LEXICON[clean];
  }

  // 2. Rule-based phonetic multi-syllable chunking
  const chunks = clean.match(/(?:[bcdfghjklmnpqrstvwxyz]+|[aeiouy]+)/gi);
  if (!chunks || chunks.length === 0) {
    return [classifyWordToViseme(clean)];
  }

  const sequence: VisemeType[] = [];
  for (const chunk of chunks) {
    if (/^[fv]/.test(chunk) || chunk.includes('ph')) {
      sequence.push('FV');
    } else if (/^[mbp]/.test(chunk)) {
      sequence.push('MBP');
    } else if (/^[ldtnsz]/.test(chunk) || chunk.startsWith('th') || chunk.startsWith('ch') || chunk.startsWith('sh')) {
      sequence.push('LDT');
    } else if (/^w/.test(chunk) || /(oo|ou|ow|aw|au|[ou])/.test(chunk)) {
      sequence.push('OH');
    } else if (/(ee|ea|ai|ay|ey|[ie])/.test(chunk)) {
      sequence.push('EE');
    } else if (/a/.test(chunk)) {
      sequence.push('AA');
    } else {
      sequence.push('LDT');
    }
  }

  // Deduplicate consecutive identical visemes for natural articulation
  const filtered = sequence.filter((v, idx) => idx === 0 || v !== sequence[idx - 1]);
  return filtered.length > 0 ? filtered : [classifyWordToViseme(clean)];
}

/**
 * Returns the active viseme for a word based on fractional progress (0.0 to 1.0)
 */
export function getWordVisemeAtProgress(word: string, progress: number): VisemeType {
  const visemes = decomposeWordToVisemes(word);
  if (!visemes || visemes.length === 0) return 'SIL';
  if (visemes.length === 1) return visemes[0];

  const clamped = Math.min(0.999, Math.max(0, progress));
  const index = Math.floor(clamped * visemes.length);
  return visemes[index] || visemes[0];
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
        viseme_mbp: 0.0,
        viseme_fv: 0.0,
        viseme_th: 0.0,
        viseme_dd: 0.0,
        viseme_ss: 0.0,
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
        viseme_mbp: 0.0,
        viseme_fv: 0.0,
        viseme_th: 0.0,
        viseme_dd: 0.0,
        viseme_ss: 0.0,
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
        viseme_mbp: 0.0,
        viseme_fv: 0.0,
        viseme_th: 0.0,
        viseme_dd: 0.0,
        viseme_ss: 0.0,
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
        viseme_mbp: 0.0,
        viseme_fv: 0.0,
        viseme_th: 0.0,
        viseme_dd: 0.0,
        viseme_ss: 0.0,
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
        viseme_mbp: 0.95 * intensity,
        viseme_fv: 0.0,
        viseme_th: 0.0,
        viseme_dd: 0.0,
        viseme_ss: 0.0,
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
        viseme_mbp: 0.0,
        viseme_fv: 0.90 * intensity,
        viseme_th: 0.0,
        viseme_dd: 0.0,
        viseme_ss: 0.0,
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
        viseme_mbp: 0.0,
        viseme_fv: 0.0,
        viseme_th: 0.85 * intensity,
        viseme_dd: 0.80 * intensity,
        viseme_ss: 0.75 * intensity,
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
        viseme_mbp: 0.0,
        viseme_fv: 0.0,
        viseme_th: 0.0,
        viseme_dd: 0.0,
        viseme_ss: 0.0,
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
 * using multi-syllable phonetic clinical vocabulary progressions and syllabic audio cadence analysis.
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
    viseme_mbp: 0,
    viseme_fv: 0,
    viseme_th: 0,
    viseme_dd: 0,
    viseme_ss: 0,
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
        viseme_mbp: 0,
        viseme_fv: 0,
        viseme_th: 0,
        viseme_dd: 0,
        viseme_ss: 0,
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
    // Word duration estimate based on word length for seamless syllable timing
    const cleanWord = (activeWord || '').trim();
    const estimatedWordDuration = Math.max(220, Math.min(850, cleanWord.length * 55 + 120));

    const loop = (time: number) => {
      const elapsed = time - startTime;

      // Human speech articulation cadence (~4.2 Hz primary syllable oscillator + 11.5 Hz micro-articulators)
      const primaryOsc = Math.sin((elapsed / 1000) * Math.PI * 8.4);
      const secondaryOsc = Math.sin((elapsed / 1000) * Math.PI * 15.2);
      const microFlutter = Math.sin((elapsed / 1000) * Math.PI * 24.0) * 0.1;
      
      const rawSyllableWave = Math.max(0, primaryOsc * 0.7 + secondaryOsc * 0.3 + microFlutter);
      const syllableIntensity = Math.min(1.0, Math.max(0.12, rawSyllableWave * 1.15));

      // Synchronize with multi-syllable phonetic sequence over the word's progress
      const progress = Math.min(1.0, elapsed / estimatedWordDuration);
      const viseme = getWordVisemeAtProgress(cleanWord, progress);
      const targetWeights = getVisemeMorphWeights(viseme, syllableIntensity);

      // Smooth temporal interpolation (lerp factor = 0.32)
      const lerp = (curr: number, tgt: number, f: number = 0.32) => curr + (tgt - curr) * f;

      const interpolated: MorphWeightSet = {
        jawOpen: lerp(currentWeightsRef.current.jawOpen, targetWeights.jawOpen),
        mouthOpen: lerp(currentWeightsRef.current.mouthOpen, targetWeights.mouthOpen),
        mouthSpread: lerp(currentWeightsRef.current.mouthSpread, targetWeights.mouthSpread),
        mouthPucker: lerp(currentWeightsRef.current.mouthPucker, targetWeights.mouthPucker),
        viseme_aa: lerp(currentWeightsRef.current.viseme_aa, targetWeights.viseme_aa),
        viseme_ee: lerp(currentWeightsRef.current.viseme_ee, targetWeights.viseme_ee),
        viseme_oh: lerp(currentWeightsRef.current.viseme_oh, targetWeights.viseme_oh),
        viseme_sil: lerp(currentWeightsRef.current.viseme_sil, targetWeights.viseme_sil),
        viseme_mbp: lerp(currentWeightsRef.current.viseme_mbp || 0, targetWeights.viseme_mbp || 0),
        viseme_fv: lerp(currentWeightsRef.current.viseme_fv || 0, targetWeights.viseme_fv || 0),
        viseme_th: lerp(currentWeightsRef.current.viseme_th || 0, targetWeights.viseme_th || 0),
        viseme_dd: lerp(currentWeightsRef.current.viseme_dd || 0, targetWeights.viseme_dd || 0),
        viseme_ss: lerp(currentWeightsRef.current.viseme_ss || 0, targetWeights.viseme_ss || 0),
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
