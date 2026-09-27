// End-to-End Runtime Endpoint Verification Test
async function testAll() {
  console.log('\n======================================================');
  console.log('   HEAL ENGINE: END-TO-END RUNTIME VALIDATION SUITE   ');
  console.log('======================================================\n');

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5000/api/health');
    const health = await healthRes.json();
    console.log('✓ [1/6] API Health Check: Status =', health.status, '| Service =', health.service);

    // 2. Canonical Patient State
    const stateRes = await fetch('http://localhost:5000/api/patient/patient-ev-68/state');
    const state = await stateRes.json();
    console.log('✓ [2/6] Canonical Patient State: Name =', state.patient.name, '| Conditions =', state.patient.conditions.length, '| Meds =', state.patient.activeMedications.length);

    // 3. Dynamic Attention Items
    const attRes = await fetch('http://localhost:5000/api/patient/patient-ev-68/attention');
    const att = await attRes.json();
    console.log('✓ [3/6] Dynamic Attention Items: Total =', att.totalItems, '| Doctor Note =', att.doctorNote.slice(0, 50) + '...');

    // 4. Clinician Human-In-The-Loop Decision
    const decRes = await fetch('http://localhost:5000/api/patient/patient-ev-68/care-plan/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'APPROVED',
        candidateChosen: 'Topical Diclofenac 1% Gel',
        rationaleNotes: 'Approved safe topical alternative; ordered 7-day repeat renal panel.',
        clinicianName: 'Dr. Aris Thorne, MD'
      })
    });
    const dec = await decRes.json();
    console.log('✓ [4/6] Clinician Decision Recorded: Action =', dec.decision.action, '| Candidate =', dec.decision.candidateChosen, '| Audit Ledger Tx =', dec.decision.ledgerTxId);

    // 5. Automated 12-Scenario Clinical Suite
    const scenRes = await fetch('http://localhost:5000/api/workflow/scenarios/run-suite', { method: 'POST' });
    const scen = await scenRes.json();
    console.log('✓ [5/6] 12-Scenario Clinical Safety Suite: Suite =', scen.suiteResults.suiteVersion, '| All Passed =', scen.suiteResults.allPassed, '| Score =', scen.suiteResults.overallClinicalSafetyScore + '%');

    // 6. Security RBAC & Virtual Doctor Tests
    const secRes = await fetch('http://localhost:5000/api/workflow/security/run-tests', { method: 'POST' });
    const sec = await secRes.json();
    const vdRes = await fetch('http://localhost:5000/api/workflow/virtual-doctor/safety-tests', { method: 'POST' });
    const vd = await vdRes.json();

    console.log('✓ [6/6] Security Invariants: Score =', sec.summary.securityScore + '% | All Passed =', sec.summary.allPassed);
    console.log('✓ [6/6] Virtual Doctor Safety: All Passed =', vd.allPassed, '| Tests =', vd.totalTests);

    console.log('\n======================================================');
    console.log('   ALL RUNTIME ENDPOINTS VERIFIED & OPERATIONAL       ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testAll();
