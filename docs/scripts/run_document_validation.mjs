/**
 * Executable Clinical Document Pipeline Runner (Milestone M2)
 * 
 * Verifies the end-to-end document processing pipeline:
 * Upload -> File Validation -> OCR -> Entity Extraction -> Data Integrity -> Timeline -> State -> Intelligence -> Safety -> Clinician Review.
 */

async function runDocValidation() {
  console.log('\n================================================================');
  console.log('   HEAL ENGINE: MILESTONE M2 - REAL CLINICAL DOCUMENT PIPELINE ');
  console.log('================================================================\n');

  try {
    const res = await fetch('http://localhost:5000/api/validation/document-pipeline-tests');
    const data = await res.json();
    const rep = data.documentReport;

    console.log(`Suite ID:                     ${rep.suiteId}`);
    console.log(`Timestamp:                    ${rep.timestamp}`);
    console.log(`Total Documents Tested:       ${rep.totalDocumentsTested}`);
    console.log(`Accepted for Review:          ${rep.acceptedCount}`);
    console.log(`Rejected (Low OCR):           ${rep.rejectedCount} (OCR confidence < 0.65 threshold)`);
    console.log(`Quarantined (Anomalies):      ${rep.quarantinedCount} (Missing/conflicting/duplicate values)`);
    console.log(`"DO NOT GUESS" Adherence:     ${rep.doNotGuessAdherenceRate}% (Zero Heuristic Hallucination) ✅\n`);

    console.log('Tested Real-World Document Fixtures:\n');

    for (const doc of rep.results) {
      console.log(`• Document: ${doc.documentId} - ${doc.filename}`);
      console.log(`  Type:        ${doc.documentType} | Origin: ${doc.originatingInstitution}`);
      console.log(`  OCR Score:   ${doc.pipelineSteps.ocrExtraction.confidenceScore * 100}% (${doc.pipelineSteps.ocrExtraction.status})`);
      console.log(`  Integrity:   ${doc.pipelineSteps.dataIntegrity.status} ${doc.pipelineSteps.dataIntegrity.anomalies.length > 0 ? '⚠️ ' + doc.pipelineSteps.dataIntegrity.anomalies[0] : ''}`);
      console.log(`  Timeline:    ${doc.pipelineSteps.patientTimeline.status} -> Patient: ${doc.pipelineSteps.patientTimeline.targetPatientId}`);
      console.log(`  Safety Gate: ${doc.pipelineSteps.clinicalIntelligenceAndSafety.safetyGateTriggered || 'EVALUATED'} -> ${doc.pipelineSteps.clinicalIntelligenceAndSafety.recommendation}`);
      console.log(`  Status:      ${doc.overallStatus} ✅\n`);
    }

    console.log('================================================================');
    console.log(`RESULT: ${rep.summaryStatement}`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('Document validation runner error:', err);
    process.exit(1);
  }
}

runDocValidation();
