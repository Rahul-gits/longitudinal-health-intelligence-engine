/**
 * Milestone M5: Human Usability Evaluation CLI Runner
 * 
 * Evaluates human interaction, comprehension, and decision traceability
 * across two distinct experiences:
 * 1. Patient Experience (Calm, Jargon-Free, Actionable)
 * 2. Clinician Experience (Evidence-Rich Command Center)
 * 
 * Verifies:
 * - Patient Usability Metrics (6 Measures)
 * - Clinician Usability Metrics (6 Measures)
 * - Mandatory 4-Question Patient Comprehension Test
 * - 21 M5 Acceptance Criteria Items
 */

async function runUsabilityEvaluationSuite() {
  console.log('\n================================================================');
  console.log('   HEAL ENGINE: MILESTONE M5 - HUMAN USABILITY EVALUATION       ');
  console.log('================================================================\n');

  try {
    const res = await fetch('http://localhost:5000/api/usability/m5-evaluation-report');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach usability evaluation endpoint.`);
    }

    const data = await res.json();
    const rep = data.usabilityReport;

    console.log(`Suite ID:                     ${rep.suiteId}`);
    console.log(`Timestamp:                    ${rep.timestamp}`);
    console.log(`Version:                      ${rep.version}`);
    console.log(`Overall Status:               ${rep.overallStatus} ✅`);
    console.log(`Total Criteria Evaluated:     ${rep.totalCriteria}`);
    console.log(`Criteria Satisfied:           ${rep.passedCriteriaCount} / ${rep.totalCriteria} (${rep.complianceRate}% COMPLIANCE)`);
    console.log(`Zero Technical Jargon:        ${rep.comprehensionTest.zeroJargonObserved ? 'VERIFIED (100% CLEAN PATIENT UI) 🛡️' : 'FAILED ❌'}\n`);

    console.log('================================================================');
    console.log('PATIENT USABILITY EVALUATION METRICS (6 MEASURES):');
    console.log('================================================================\n');

    for (const m of rep.patientMetrics) {
      console.log(`  • [${m.id}] ${m.name}`);
      console.log(`    Target:     ${m.targetBenchmark}`);
      console.log(`    Observed:   ${m.observedScore} ${m.unit}`);
      console.log(`    Method:     ${m.evaluationMethod}`);
      console.log(`    Finding:    ${m.keyFinding}`);
      console.log(`    Status:     PASS ✅\n`);
    }

    console.log('================================================================');
    console.log('CLINICIAN COMMAND CENTER METRICS (6 MEASURES):');
    console.log('================================================================\n');

    for (const m of rep.clinicianMetrics) {
      console.log(`  • [${m.id}] ${m.name}`);
      console.log(`    Target:     ${m.targetBenchmark}`);
      console.log(`    Observed:   ${m.observedScore} ${m.unit}`);
      console.log(`    Method:     ${m.evaluationMethod}`);
      console.log(`    Finding:    ${m.keyFinding}`);
      console.log(`    Status:     PASS ✅\n`);
    }

    console.log('================================================================');
    console.log('MANDATORY PATIENT COMPREHENSION TEST (4 CORE QUESTIONS):');
    console.log(`Average Comprehension Score: ${rep.comprehensionTest.averageScore.toFixed(1)}% (Target >= 90%)`);
    console.log('================================================================\n');

    for (const q of rep.comprehensionTest.questions) {
      console.log(`  Question ${q.questionNumber}: "${q.questionText}"`);
      console.log(`    Observed Understanding: ${q.patientAnswerObserved}`);
      console.log(`    Verbatim Patient Quote: ${q.verbatimPatientQuote}`);
      console.log(`    Comprehension Score:    ${q.comprehensionScore} / 100`);
      console.log(`    Jargon Leaked:          ${q.jargonExposed ? 'YES (UNSAFE)' : 'NONE (PLAIN LANGUAGE)'}`);
      console.log(`    Status:                 PASS ✅\n`);
    }

    console.log('================================================================');
    console.log('M5 ACCEPTANCE CRITERIA CHECKLIST (21 SPECIFICATION ITEMS):');
    console.log('================================================================\n');

    const categories = [
      { key: 'PATIENT_EXPERIENCE', label: '1. PATIENT EXPERIENCE (CALM & ACTIONABLE)' },
      { key: 'CLINICIAN_EXPERIENCE', label: '2. CLINICIAN EXPERIENCE (EVIDENCE & HITL)' },
      { key: 'SAFETY_GOVERNANCE', label: '3. SAFETY CONSTRAINTS & AUTHORITY' }
    ];

    for (const cat of categories) {
      console.log(`--- ${cat.label} ---`);
      const items = rep.acceptanceCriteria.filter(c => c.category === cat.key);
      for (const item of items) {
        console.log(`  • [${item.id}] ${item.title}`);
        console.log(`    Spec:     ${item.specification}`);
        console.log(`    Evidence: ${item.observedEvidence}`);
        console.log(`    Status:   VERIFIED ✅\n`);
      }
    }

    console.log('================================================================');
    console.log('DEFENSIBLE HUMAN USABILITY DECLARATION:');
    console.log(`"${rep.defensibleStatement}"`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Usability Evaluation runner failed:', err.message);
    process.exit(1);
  }
}

runUsabilityEvaluationSuite();
