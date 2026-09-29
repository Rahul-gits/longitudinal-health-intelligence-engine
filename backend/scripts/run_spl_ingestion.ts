import { dailyMedSplService } from '../services/dailyMedSplService';
import { vectorDatabase } from '../db/vectorDatabase';

console.log('====================================================');
console.log('FDA DAILYMED SPL HUMAN RX DATABASE INGESTION RUNNER');
console.log('====================================================\n');

// 1. Get Summary of Database
const summary = dailyMedSplService.getDatabaseSummary();
console.log(`Dataset: ${summary.datasetTitle}`);
console.log(`Archive: ${summary.archiveFileName} (${summary.archiveSizeFormatted})`);
console.log(`Total SPL Packages: ${summary.totalSplPackages.toLocaleString()}`);
console.log(`Standard: ${summary.standard}`);
console.log(`Release: ${summary.releasePart}\n`);

console.log('LOINC Clinical Sections Covered:');
summary.loincSectionsSupported.forEach(s => {
  console.log(`  - [${s.code}] ${s.name}: ${s.description}`);
});

console.log('\nStarting Vector Database Ingestion...');
const result = dailyMedSplService.ingestExtractedSplToVectorDb();

console.log(`\n✓ Successfully Ingested ${result.ingestedCount} FDA SPL Drug Records into Vector Database!`);
console.log(`✓ Total Vector Store Chunks now: ${result.totalChunksNow}`);
console.log('\nTherapeutic Domain Distribution:');
Object.entries(result.domainDistribution).forEach(([dom, count]) => {
  console.log(`  - ${dom}: ${count} drug labels`);
});

// Run verification semantic searches
console.log('\n--- Verifying Semantic Vector Search over Ingested SPL Data ---');

const testQueries = [
  'Renal contraindications and thiazide diuretics in kidney disease',
  'Carvedilol beta blocker asthma contraindication',
  'Oral NSAID naproxen indomethacin gastrointestinal hazard and pain'
];

for (const q of testQueries) {
  console.log(`\nQuery: "${q}"`);
  const matches = dailyMedSplService.searchSplDrugs(q, 2);
  matches.forEach((m, idx) => {
    console.log(`  [Match ${idx + 1}] ${m.medicationName} | Score: ${(m.similarityScore * 100).toFixed(1)}% | Domain: ${m.clinicalDomain}`);
    console.log(`    Recommendation: ${m.recommendation.slice(0, 140)}...`);
  });
}

console.log('\n✓ Vector Ingestion & RAG Verification Complete!');
