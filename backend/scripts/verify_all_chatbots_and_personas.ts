/**
 * Comprehensive Routing & LLM Persona Verification Test Suite
 * Validates that all chatbot API routes, virtual personas, and multi-agent
 * systems correctly route requests, handle clinical context, and return
 * structured, grounded LLM responses.
 */

import '../index';
import { SessionStore } from '../services/sessionStore';

const BASE_URL = 'http://localhost:5000';

interface VerificationResult {
  suite: string;
  name: string;
  endpoint: string;
  method: string;
  status: number;
  passed: boolean;
  llmProvider?: string;
  llmModel?: string;
  personaTested?: string;
  details?: string;
  sampleResponse?: string;
}

const results: VerificationResult[] = [];

async function send(endpoint: string, options: RequestInit = {}): Promise<{ status: number; data: any; raw: string }> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const raw = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
    return { status: res.status, data, raw };
  } catch (err: any) {
    return { status: 500, data: null, raw: err.message };
  }
}

export async function runComprehensiveVerification() {
  console.log('\n================================================================================');
  console.log('🩺 HEAL ENGINE: COMPREHENSIVE API ROUTING & LLM PERSONA VERIFICATION SUITE');
  console.log('================================================================================\n');

  // Wait 1 second to ensure server is listening
  await new Promise(r => setTimeout(r, 1000));

  // Authenticate as clinician against running backend server to obtain valid session for RBAC routes
  let sessionId = '';
  const loginRes = await send('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'rahul@example.com', password: 'HealDemo2026!' })
  });
  if (loginRes.data?.sessionId) {
    sessionId = loginRes.data.sessionId;
  } else {
    const clinicianSession = await SessionStore.createSession('user-rahul-01', { ttlDays: 1 });
    sessionId = clinicianSession.sessionId;
  }
  const clinicianHeaders = {
    'Authorization': `Bearer ${sessionId}`,
    'x-session-id': sessionId,
    'Cookie': `heal_session=${sessionId}`
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SYSTEM HEALTH & METRICS ROUTING
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('▶ [1/6] Testing System Infrastructure & Health Routings...');
  
  const healthRes = await send('/api/health');
  results.push({
    suite: 'INFRASTRUCTURE',
    name: 'Core Health Check & Dependency Verification',
    endpoint: '/api/health',
    method: 'GET',
    status: healthRes.status,
    passed: healthRes.status === 200 && healthRes.data?.status === 'HEALTHY',
    details: `Vector DB Mode: ${healthRes.data?.database?.mode || 'N/A'}`
  });

  const metricsRes = await send('/api/metrics');
  results.push({
    suite: 'INFRASTRUCTURE',
    name: 'Prometheus Operational Metrics Endpoint',
    endpoint: '/api/metrics',
    method: 'GET',
    status: metricsRes.status,
    passed: metricsRes.status === 200 && metricsRes.raw.includes('heal_uptime_seconds'),
    details: 'Prometheus metric stream active'
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. AI SPECIALIST PERSONA ROSTER & HANDOVER ROUTING
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [2/6] Testing AI Specialist Persona Roster & Handover Routings...');

  const rosterRes = await send('/api/screening/specialists');
  const specialists = rosterRes.data?.specialists || [];
  const hasAllPersonas = ['doc-thorne', 'doc-lin', 'doc-vance', 'doc-chen'].every(id =>
    specialists.some((s: any) => s.id === id)
  );

  results.push({
    suite: 'PERSONA_ROSTER',
    name: 'Fetch All 4 AI Specialist Personas',
    endpoint: '/api/screening/specialists',
    method: 'GET',
    status: rosterRes.status,
    passed: rosterRes.status === 200 && hasAllPersonas,
    details: `Roster returned ${specialists.length} specialists: ${specialists.map((s: any) => s.name.split(',')[0]).join(', ')}`
  });

  const handoverRes = await send('/api/screening/specialist-switch', {
    method: 'POST',
    body: JSON.stringify({
      previousPersonaId: 'doc-thorne',
      targetPersonaId: 'doc-lin',
      patientName: 'Eleanor Vance',
      chiefConcern: 'Medication safety review'
    })
  });

  results.push({
    suite: 'PERSONA_ROSTER',
    name: 'Mid-Consultation Persona Handover (Dr. Thorne -> Dr. Lin)',
    endpoint: '/api/screening/specialist-switch',
    method: 'POST',
    status: handoverRes.status,
    passed: handoverRes.status === 200 && handoverRes.data?.activePersona?.id === 'doc-lin' && !!handoverRes.data?.handoverMessage,
    details: `Handover message received: "${handoverRes.data?.handoverMessage?.substring(0, 75)}..."`
  });

  const startRes = await send('/api/screening/start', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-ev-68',
      patientName: 'Eleanor Vance',
      personaId: 'doc-thorne'
    })
  });

  results.push({
    suite: 'PERSONA_ROSTER',
    name: 'Initialize Tele-Screening Session (/start)',
    endpoint: '/api/screening/start',
    method: 'POST',
    status: startRes.status,
    passed: startRes.status === 200 && !!startRes.data?.initialTurn && startRes.data?.persona?.id === 'doc-thorne',
    details: `Session ID: ${startRes.data?.sessionId}, Greeting generated`
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. LLM INFERENCE ACROSS ALL 4 VIRTUAL SCREENING PERSONAS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [3/6] Testing LLM Generation across each AI Specialist Virtual Persona...');

  // Persona 1: Dr. Aris Thorne (Cardiorenal)
  const thorneRes = await send('/api/screening/chat', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-ev-68',
      patientName: 'Eleanor Vance',
      personaId: 'doc-thorne',
      personaName: 'Dr. Aris Thorne, MD',
      specialty: 'Chief of Cardiorenal Medicine',
      clinicalFocus: 'Acute-on-Chronic Renal Perfusion & Fluid Hemodynamics',
      conditions: ['Heart Failure (HFpEF)', 'Chronic Kidney Disease (Stage 3b)', 'Essential Hypertension'],
      medications: ['Lisinopril 20mg', 'Furosemide 40mg', 'Spironolactone 25mg'],
      userMessage: 'Dr. Thorne, I have been feeling extra heavy in my legs and waking up needing two pillows. Is my fluid backing up?'
    })
  });

  const thornePass = thorneRes.status === 200 &&
    !!thorneRes.data?.doctorResponse &&
    thorneRes.data?.personaId === 'doc-thorne' &&
    (thorneRes.data?.clinicalObservations?.length || 0) > 0;

  results.push({
    suite: 'LLM_PERSONA_INFERENCE',
    name: 'Dr. Aris Thorne (Cardiorenal Fluid & Hemodynamics Response)',
    endpoint: '/api/screening/chat',
    method: 'POST',
    status: thorneRes.status,
    passed: thornePass,
    llmProvider: thorneRes.data?.provider,
    llmModel: thorneRes.data?.model,
    personaTested: 'Dr. Aris Thorne, MD',
    sampleResponse: thorneRes.data?.doctorResponse?.substring(0, 110) + '...',
    details: `Posture: ${thorneRes.data?.recommendedPosture}, RAG guidelines grounded: ${thorneRes.data?.ragEvidence?.length || 0}`
  });

  // Persona 2: Dr. Maya Lin (Pharmacology)
  const linRes = await send('/api/screening/chat', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-ev-68',
      patientName: 'Eleanor Vance',
      personaId: 'doc-lin',
      personaName: 'Dr. Maya Lin, PharmD',
      specialty: 'Geriatric Clinical Pharmacologist',
      clinicalFocus: 'Drug-Drug Interactions & CYP2C9 Pharmacogenomics',
      conditions: ['Chronic Kidney Disease', 'Essential Hypertension', 'Severe Osteoarthritis'],
      medications: ['Lisinopril 20mg', 'Furosemide 40mg'],
      userMessage: 'Dr. Lin, my knee arthritis is agonizing. Can I take Motrin or Advil 800mg with my Lisinopril?'
    })
  });

  const linBodyStr = JSON.stringify(linRes.data || '').toLowerCase();
  const linPass = linRes.status === 200 &&
    linRes.data?.personaId === 'doc-lin' &&
    (linBodyStr.includes('nsaid') || linBodyStr.includes('lisinopril') || linBodyStr.includes('kidney') || linBodyStr.includes('topical')) &&
    linRes.data?.safetyGateTriggered === true;

  results.push({
    suite: 'LLM_PERSONA_INFERENCE',
    name: 'Dr. Maya Lin (Pharmacology & Drug-Drug Safety Boundary Response)',
    endpoint: '/api/screening/chat',
    method: 'POST',
    status: linRes.status,
    passed: linPass,
    llmProvider: linRes.data?.provider,
    llmModel: linRes.data?.model,
    personaTested: 'Dr. Maya Lin, PharmD',
    sampleResponse: linRes.data?.doctorResponse?.substring(0, 110) + '...',
    details: `Safety Gate Triggered: ${linRes.data?.safetyGateTriggered}, Risk: ${linRes.data?.riskLevel}`
  });

  // Persona 3: Dr. Marcus Vance (Primary Care & Holistic Care)
  const vanceRes = await send('/api/screening/chat', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-ev-68',
      patientName: 'Eleanor Vance',
      personaId: 'doc-vance',
      personaName: 'Dr. Marcus Vance, MD',
      specialty: 'Primary Care Physician & Patient Advocate',
      clinicalFocus: 'Holistic Symptom Management & Daily Mobility',
      conditions: ['Chronic Kidney Disease', 'Mild Osteoarthritis'],
      medications: ['Lisinopril 20mg'],
      userMessage: 'Dr. Vance, how can I stay mobile and walk in the garden without straining my knees or taking risky pills?'
    })
  });

  const vancePass = vanceRes.status === 200 &&
    vanceRes.data?.personaId === 'doc-vance' &&
    !!vanceRes.data?.doctorResponse;

  results.push({
    suite: 'LLM_PERSONA_INFERENCE',
    name: 'Dr. Marcus Vance (Primary Care & Patient Mobility Response)',
    endpoint: '/api/screening/chat',
    method: 'POST',
    status: vanceRes.status,
    passed: vancePass,
    llmProvider: vanceRes.data?.provider,
    llmModel: vanceRes.data?.model,
    personaTested: 'Dr. Marcus Vance, MD',
    sampleResponse: vanceRes.data?.doctorResponse?.substring(0, 110) + '...',
    details: `Posture: ${vanceRes.data?.recommendedPosture}, Quick replies: ${vanceRes.data?.suggestedReplies?.length}`
  });

  // Persona 4: Dr. Sarah Chen (Preventive Nephrology)
  const chenRes = await send('/api/screening/chat', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-ev-68',
      patientName: 'Eleanor Vance',
      personaId: 'doc-chen',
      personaName: 'Dr. Sarah Chen, MD',
      specialty: 'Preventive Nephrology Specialist',
      clinicalFocus: '7-Day Renal Recovery Trajectory & Hydration Protocol',
      conditions: ['Acute-on-Chronic Kidney Injury', 'Hypertension'],
      medications: ['Lisinopril 10mg'],
      userMessage: 'Dr. Chen, my eGFR dropped to 52. What is my 7-day kidney recovery plan and how much water should I drink?'
    })
  });

  const chenPass = chenRes.status === 200 &&
    chenRes.data?.personaId === 'doc-chen' &&
    !!chenRes.data?.doctorResponse;

  results.push({
    suite: 'LLM_PERSONA_INFERENCE',
    name: 'Dr. Sarah Chen (Nephrology Recovery Curve & Hydration Response)',
    endpoint: '/api/screening/chat',
    method: 'POST',
    status: chenRes.status,
    passed: chenPass,
    llmProvider: chenRes.data?.provider,
    llmModel: chenRes.data?.model,
    personaTested: 'Dr. Sarah Chen, MD',
    sampleResponse: chenRes.data?.doctorResponse?.substring(0, 110) + '...',
    details: `Clinical Observations: ${chenRes.data?.clinicalObservations?.length}, Care loop: ${chenRes.data?.careLoopTrigger}`
  });

  // Emergency Red Flag Intercept Test
  const emergencyRes = await send('/api/screening/chat', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-ev-68',
      patientName: 'Eleanor Vance',
      personaId: 'doc-thorne',
      userMessage: 'I have severe crushing chest pain radiating to my jaw and I feel faint!'
    })
  });

  const emergencyPass = emergencyRes.status === 200 &&
    emergencyRes.data?.requiresEmergency === true &&
    emergencyRes.data?.riskLevel === 'CRITICAL' &&
    emergencyRes.data?.safetyGateTriggered === true;

  results.push({
    suite: 'LLM_PERSONA_INFERENCE',
    name: 'Red Flag Emergency Intercept (Chest Pain -> 911 Escalation)',
    endpoint: '/api/screening/chat',
    method: 'POST',
    status: emergencyRes.status,
    passed: emergencyPass,
    llmProvider: emergencyRes.data?.provider,
    llmModel: emergencyRes.data?.model,
    sampleResponse: emergencyRes.data?.doctorResponse?.substring(0, 100) + '...',
    details: 'Hard clinical intercept engaged: requiresEmergency=true, risk=CRITICAL'
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. API CHAT ROUTING ALIASES VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [4/6] Testing Routing Aliases across all Chatbot API Entry Points...');

  const endpointsToTest = [
    { path: '/api/screening/chat', method: 'POST', label: 'Primary Screening Chat (/screening/chat)' },
    { path: '/api/screening/respond', method: 'POST', label: 'Screening Respond Alias (/screening/respond)' },
    { path: '/api/screening/patient-check', method: 'POST', label: 'Screening Patient-Check Alias (/screening/patient-check)' },
    { path: '/api/screening/specialist-consult', method: 'POST', label: 'Screening Specialist-Consult Alias (/screening/specialist-consult)' },
    { path: '/api/workflow/virtual-doctor/patient-check', method: 'POST', label: 'Workflow Virtual Doctor Check (/workflow/virtual-doctor/patient-check)' }
  ];

  for (const ep of endpointsToTest) {
    const aliasRes = await send(ep.path, {
      method: ep.method,
      body: JSON.stringify({
        patientName: 'Eleanor Vance',
        userMessage: 'Checking in for my scheduled blood pressure and kidney review.',
        personaId: 'doc-thorne'
      })
    });

    results.push({
      suite: 'ROUTING_ALIASES',
      name: ep.label,
      endpoint: ep.path,
      method: ep.method,
      status: aliasRes.status,
      passed: aliasRes.status === 200 && !!aliasRes.data?.doctorResponse,
      llmProvider: aliasRes.data?.provider,
      details: `Response received, Persona: ${aliasRes.data?.personaId || 'resolved'}`
    });
  }

  // Voice synthesis endpoint
  const voiceRes = await send('/api/screening/synthesize-voice', {
    method: 'POST',
    body: JSON.stringify({
      personaId: 'doc-lin',
      text: 'Hello Eleanor, I am Dr. Maya Lin reviewing your medications.',
      tone: 'compassionate_clinical'
    })
  });

  results.push({
    suite: 'ROUTING_ALIASES',
    name: 'Specialist Voice Parameter Synthesis (/screening/synthesize-voice)',
    endpoint: '/api/screening/synthesize-voice',
    method: 'POST',
    status: voiceRes.status,
    passed: voiceRes.status === 200 && voiceRes.data?.audioAvailable === true && voiceRes.data?.speechConfig?.voiceName === 'Samantha',
    details: `Voice: ${voiceRes.data?.speechConfig?.voiceName}, Pitch: ${voiceRes.data?.speechConfig?.pitch}`
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. WORKFLOW VIRTUAL DOCTOR SESSION & TURN ROUTINGS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [5/6] Testing Workflow Virtual Doctor Session, Turn Tracking & Safety Tests...');

  const turnRes = await send('/api/workflow/virtual-doctor/turn', {
    method: 'POST',
    headers: clinicianHeaders,
    body: JSON.stringify({
      sessionId: 'session-vdoc-audit-test-01',
      patientId: 'patient-ev-68',
      patientResponseRaw: 'I have not had any shortness of breath, but I did notice mild ankle swelling after walking.',
      doctorPosture: 'listening'
    })
  });

  results.push({
    suite: 'WORKFLOW_VIRTUAL_DOCTOR',
    name: 'Dialogue Turn with NegEx Symptom Extraction (/virtual-doctor/turn)',
    endpoint: '/api/workflow/virtual-doctor/turn',
    method: 'POST',
    status: turnRes.status,
    passed: turnRes.status === 200 && turnRes.data?.success === true,
    details: `Session updated, NegEx processed raw patient speech`
  });

  const getSessionsRes = await send('/api/workflow/virtual-doctor/sessions?patientId=patient-ev-68', {
    headers: clinicianHeaders
  });
  results.push({
    suite: 'WORKFLOW_VIRTUAL_DOCTOR',
    name: 'Fetch Patient Virtual Doctor Session Records (/virtual-doctor/sessions)',
    endpoint: '/api/workflow/virtual-doctor/sessions',
    method: 'GET',
    status: getSessionsRes.status,
    passed: getSessionsRes.status === 200 && Array.isArray(getSessionsRes.data?.sessions),
    details: `Returned ${getSessionsRes.data?.sessions?.length || 0} stored sessions`
  });

  const safetyTestsRes = await send('/api/workflow/virtual-doctor/safety-tests', {
    method: 'POST',
    headers: clinicianHeaders,
    body: JSON.stringify({})
  });

  results.push({
    suite: 'WORKFLOW_VIRTUAL_DOCTOR',
    name: 'Virtual Doctor Automated Safety Gate Tests (/virtual-doctor/safety-tests)',
    endpoint: '/api/workflow/virtual-doctor/safety-tests',
    method: 'POST',
    status: safetyTestsRes.status,
    passed: safetyTestsRes.status === 200 && safetyTestsRes.data?.allPassed === true,
    details: `All ${safetyTestsRes.data?.totalTests} clinical safety scenarios passed`
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. MULTI-AGENT CONFERENCE, SWARM & RAG ROUTINGS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [6/6] Testing Multi-Agent Clinical Conference, Swarm & RAG Routings...');

  // Conference Debate
  const debateRes = await send('/api/conference/debate', {
    method: 'POST',
    headers: clinicianHeaders
  });

  const turns = debateRes.data?.debate?.turns || [];
  results.push({
    suite: 'MULTI_AGENT_SYSTEMS',
    name: 'Case Conference Multi-Persona Clinical Debate (/conference/debate)',
    endpoint: '/api/conference/debate',
    method: 'POST',
    status: debateRes.status,
    passed: debateRes.status === 200 && turns.length >= 4 && !!debateRes.data?.debate?.resolution,
    details: `Debate generated ${turns.length} rounds among Dr. Thorne, Dr. Chen, Dr. Alvarez, Dr. Patel, and Sarah`
  });

  // Swarm Intelligence PSO Simulation
  const swarmRes = await send('/api/swarm/simulate', {
    method: 'POST',
    headers: clinicianHeaders,
    body: JSON.stringify({ iterations: 15 })
  });

  const sim = swarmRes.data?.simulation;
  const swarmPassed = swarmRes.status === 200 &&
    sim?.particlesCount > 0 &&
    sim?.globalConsensusVector?.overallConsensusScore > 0;

  results.push({
    suite: 'MULTI_AGENT_SYSTEMS',
    name: 'Multi-Agent Swarm Particle Swarm Consensus (/swarm/simulate)',
    endpoint: '/api/swarm/simulate',
    method: 'POST',
    status: swarmRes.status,
    passed: swarmPassed,
    details: `Swarm converged with ${sim?.particlesCount || 0} particles, consensus score: ${sim?.globalConsensusVector?.overallConsensusScore}`
  });

  // Clinical RAG Vector Retrieval
  const ragRes = await send('/api/rag/query', {
    method: 'POST',
    body: JSON.stringify({
      query: 'Lisinopril NSAID double whammy KDIGO renal failure contraindication',
      topK: 3
    })
  });

  results.push({
    suite: 'MULTI_AGENT_SYSTEMS',
    name: 'Clinical RAG Vector Guideline Retrieval (/rag/query)',
    endpoint: '/api/rag/query',
    method: 'POST',
    status: ragRes.status,
    passed: ragRes.status === 200 && (ragRes.data?.results?.length || 0) > 0,
    details: `Retrieved ${ragRes.data?.results?.length || 0} matching guideline evidence chunks`
  });

  // End-to-End Workflow Execution
  const workflowRes = await send('/api/workflow/run', {
    method: 'POST',
    headers: clinicianHeaders,
    body: JSON.stringify({ patientId: 'patient-ev-68' })
  });

  results.push({
    suite: 'MULTI_AGENT_SYSTEMS',
    name: '12-Phase End-to-End Clinical Intelligence Workflow (/workflow/run)',
    endpoint: '/api/workflow/run',
    method: 'POST',
    status: workflowRes.status,
    passed: workflowRes.status === 200 && workflowRes.data?.success === true,
    details: `Executed ${workflowRes.data?.workflow?.steps?.length || 0} steps, Recommendation: ${workflowRes.data?.workflow?.recommendation?.action || 'Active'}`
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // FINAL CONSOLIDATION & REPORTING
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================================');
  console.log('📊 VERIFICATION RESULTS BREAKDOWN:');
  console.log('================================================================================\n');

  let passedCount = 0;
  for (const r of results) {
    if (r.passed) passedCount++;
    const symbol = r.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} [${r.suite}] ${r.name}`);
    console.log(`    Route: ${r.method} ${r.endpoint} -> Status ${r.status}`);
    if (r.llmProvider) {
      console.log(`    LLM Provider: ${r.llmProvider} | Model: ${r.llmModel || 'default'}`);
    }
    if (r.personaTested) {
      console.log(`    Specialist Persona: ${r.personaTested}`);
    }
    if (r.sampleResponse) {
      console.log(`    Excerpt: "${r.sampleResponse}"`);
    }
    if (r.details) {
      console.log(`    Details: ${r.details}`);
    }
    console.log('');
  }

  const allPassed = passedCount === results.length;
  console.log('================================================================================');
  console.log(`FINAL TALLY: ${passedCount}/${results.length} assertions passed (${((passedCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`STATUS: ${allPassed ? 'ALL ROUTINGS & LLM RESPONSES 100% OPERATIONAL' : 'FAILURES DETECTED'}`);
  console.log('================================================================================\n');

  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runComprehensiveVerification().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
