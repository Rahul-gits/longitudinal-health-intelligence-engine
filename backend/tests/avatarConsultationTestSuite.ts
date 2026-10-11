/**
 * Avatar Consultation & 3D Specialist Test Suite
 * Validates deterministic avatar states, viseme classification,
 * clinical safety gate isolation, and structured response generation.
 */

import { getAvatarBehavior } from '../../frontend/src/components/DigitalHuman/AvatarStateController';
import { classifyWordToViseme, getVisemeMorphWeights } from '../../frontend/src/components/DigitalHuman/LipSyncController';
import { virtualDoctorScreeningEngine } from '../../frontend/src/engine/virtualDoctorScreeningEngine';
import { AvatarState, DoctorPostureMode, postureToAvatarState, avatarStateToPosture } from '../../frontend/src/types/health';
import { DOCTOR_STYLE_MAP } from '../../frontend/src/components/DigitalHuman/Specialist3DScene';

export function runAvatarConsultationTestSuite() {
  console.log('─────────────────────────────────────────────────────────────');
  console.log('🏥 HEAL ENGINE - 3D SPECIALIST & AVATAR CONSULTATION TEST SUITE');
  console.log('─────────────────────────────────────────────────────────────\n');

  let passed = 0;
  let total = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✓ [PASS] ${testName}`);
    } else {
      console.error(`  ✗ [FAIL] ${testName} - ${details || 'Assertion failed'}`);
    }
  }

  // 1. DETERMINISTIC AVATAR STATES
  console.log('1. Testing Deterministic Avatar States:');
  const expectedStates: AvatarState[] = [
    'GREETING',
    'LISTENING',
    'UNDERSTANDING',
    'REVIEWING',
    'EXPLAINING',
    'CHECKING',
    'REASSURING',
    'ALERTING'
  ];

  for (const st of expectedStates) {
    const behavior = getAvatarBehavior(st, false);
    assert(`State '${st}' resolves valid behavioral parameters`, behavior.state === st && !!behavior.statusLabel);
  }

  // 2. SAFETY GATE ESCALATION OVERRIDE
  console.log('\n2. Testing Safety Gate Escalation Override:');
  const overridden = getAvatarBehavior('REASSURING', true); // Attempt reassuring when safety alert active
  assert(
    'Safety alert forces deterministic escalation to ALERTING state',
    overridden.state === 'ALERTING' && overridden.safetyEscalated === true && overridden.browFurrowWeight > 0.5,
    `Resolved state was ${overridden.state}`
  );

  const listeningOverridden = getAvatarBehavior('LISTENING', true);
  assert(
    'Safety alert during listening forces ALERTING state with direct fixed gaze',
    listeningOverridden.state === 'ALERTING' && listeningOverridden.gazeTarget === 'alert_fixed'
  );

  // 3. PHONEME TO VISEME CLASSIFICATION & MORPH WEIGHTS
  console.log('\n3. Testing Speech Lip Sync & Viseme Classification:');
  assert('Word "Mom" maps to bilabial MBP viseme', classifyWordToViseme('Mom') === 'MBP');
  assert('Word "Pharmacy" maps to labiodental FV viseme', classifyWordToViseme('Pharmacy') === 'FV');
  assert('Word "Water" maps to rounded OH viseme', classifyWordToViseme('Water') === 'OH');
  assert('Word "Kidney" maps to spread EE viseme', classifyWordToViseme('Kidney') === 'EE');
  assert('Word "Telemetry" maps to lingual/dental LDT viseme', classifyWordToViseme('Telemetry') === 'LDT');
  assert('Empty string maps to silence SIL viseme', classifyWordToViseme('') === 'SIL');

  const mbpWeights = getVisemeMorphWeights('MBP', 1.0);
  assert('MBP viseme compresses lips (jawOpen near 0)', mbpWeights.jawOpen < 0.1 && mbpWeights.mouthOpen === 0);

  const aaWeights = getVisemeMorphWeights('AA', 1.0);
  assert('AA viseme articulates wide jaw opening', aaWeights.jawOpen > 0.6 && aaWeights.viseme_aa > 0.8);

  const eeWeights = getVisemeMorphWeights('EE', 1.0);
  assert('EE viseme spreads mouth horizontally', eeWeights.mouthSpread > 1.15 && eeWeights.viseme_ee > 0.7);

  // 4. BIDIRECTIONAL STATE CONVERSIONS
  console.log('\n4. Testing State <-> Posture Bidirectional Mapping:');
  assert('greeting converts to GREETING', postureToAvatarState('greeting') === 'GREETING');
  assert('listening converts to LISTENING', postureToAvatarState('listening') === 'LISTENING');
  assert('alerting converts to ALERTING', postureToAvatarState('alerting') === 'ALERTING');
  assert('reassuring converts to REASSURING', postureToAvatarState('reassuring') === 'REASSURING');
  assert('GREETING converts back to greeting', avatarStateToPosture('GREETING') === 'greeting');
  assert('ALERTING converts back to alerting', avatarStateToPosture('ALERTING') === 'alerting');

  // 5. STRUCTURED RESPONSE & CLINICAL INTELLIGENCE ISOLATION
  console.log('\n5. Testing Structured Response & Clinical Intelligence Separation:');
  const personas = virtualDoctorScreeningEngine.getPersonas();
  assert('Specialist personas registry contains minimum 4 doctors', personas.length >= 4);

  const nephrologist = personas.find(p => p.id === 'doc-chen' || p.id === 'doc-thorne') || personas[0];
  const greetingResp = virtualDoctorScreeningEngine.getStructuredResponse(nephrologist.id, 0);
  assert(
    'Step 0 returns structured GREETING response with subtitles',
    greetingResp.state === 'GREETING' && greetingResp.subtitles.length > 0 && !greetingResp.requiresClinicianReview
  );

  const reviewResp = virtualDoctorScreeningEngine.getStructuredResponse(nephrologist.id, 1);
  assert(
    'Step 1 returns REVIEWING state with evidence citations',
    reviewResp.state === 'REVIEWING' && !!reviewResp.evidenceCitations
  );

  const alertStepResp = virtualDoctorScreeningEngine.getStructuredResponse(nephrologist.id, 2);
  assert(
    'Medication interaction step returns ALERTING state and clinician review required',
    alertStepResp.state === 'ALERTING' && alertStepResp.requiresClinicianReview === true
  );

  // Patient symptom emergency test
  const emergencyResp = virtualDoctorScreeningEngine.getStructuredResponse(
    nephrologist.id,
    3,
    null,
    'I have sudden crushing chest pain and cannot breathe'
  );
  assert(
    'Patient emergency text triggers hard clinical escalation to ALERTING and safety gate alert',
    emergencyResp.state === 'ALERTING' && emergencyResp.requiresClinicianReview === true && emergencyResp.safetyGateAlert !== undefined
  );

  // 6. SPECIALIST 3D STYLING & RIG CONFIGURATION
  console.log('\n6. Testing Specialist 3D Appearance & Persona Configurations:');
  assert('Dr. Thorne configuration exists with cardiorenal navy scrubs', DOCTOR_STYLE_MAP['doc-thorne'].scrubColor === 0x1E3A8A);
  assert('Dr. Vance configuration exists with blue eyes from clinical profile', DOCTOR_STYLE_MAP['doc-vance'].eyeColor === 0x38BDF8);
  assert('Dr. Chen configuration exists with nephrology cyan scrubs', DOCTOR_STYLE_MAP['doc-chen'].scrubColor === 0x0284C7);

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log(`Summary: ${passed}/${total} assertions passed (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('─────────────────────────────────────────────────────────────\n');

  if (passed !== total) {
    process.exit(1);
  }
}

// Run test suite
runAvatarConsultationTestSuite();
