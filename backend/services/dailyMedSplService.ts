import fs from 'fs';
import path from 'path';
import { vectorDatabase, VectorEvidenceChunk, IngestDocumentPayload } from '../db/vectorDatabase';
import { qdrantClientService } from './qdrantClientService';

export interface SplDatabaseSummary {
  archiveFileName: string;
  archivePath: string;
  archiveSizeBytes: number;
  archiveSizeFormatted: string;
  totalSplPackages: number;
  datasetTitle: string;
  standard: string;
  releasePart: string;
  clinicalDomainCoverage: Record<string, number>;
  loincSectionsSupported: Array<{ code: string; name: string; description: string }>;
  totalVectorizedInDb: number;
  lastIngestedTimestamp?: string;
  sampleDrugs: string[];
}

export interface SplDrugRecord {
  documentId: string;
  packageZip: string;
  indexInZip: number;
  medicationName: string;
  activeIngredient: string;
  sourceOrganization: string;
  clinicalDomain: string;
  guidelineVersion: string;
  publicationDate: string;
  section: string;
  pageOrParagraph: string;
  content: string;
  recommendation: string;
  evidenceClass: string;
  actionableContraindication: boolean;
  contraindicatedConditions?: string[];
  contraindicatedMedications?: string[];
  recommendedAlternatives?: string[];
  metadata: {
    labeler: string;
    hasBlackBoxWarning: boolean;
    hasDrugInteractions: boolean;
    hasRenalPrecautions: boolean;
  };
}

export class DailyMedSplService {
  private dbDir: string;
  private zipPath: string;
  private extractedJsonPath: string;
  private summaryJsonPath: string;

  constructor() {
    this.dbDir = path.resolve(process.cwd(), 'backend', 'db');
    this.zipPath = path.join(this.dbDir, 'dm_spl_release_human_rx_part1.zip');
    this.extractedJsonPath = path.join(this.dbDir, 'spl_extracted_drugs.json');
    this.summaryJsonPath = path.join(this.dbDir, 'spl_database_summary.json');
  }

  /**
   * Summarize the DailyMed SPL Human Rx Part 1 database
   */
  public getDatabaseSummary(): SplDatabaseSummary {
    let sizeBytes = 3221058241;
    if (fs.existsSync(this.zipPath)) {
      try {
        const stats = fs.statSync(this.zipPath);
        sizeBytes = stats.size;
      } catch (err) {
        console.warn('Could not read stat for SPL zip:', err);
      }
    }

    const domainCounts: Record<string, number> = {
      'Cardiology': 0,
      'Nephrology': 0,
      'Analgesic': 0,
      'Metabolic': 0,
      'Pulmonology': 0,
      'CNS & Neurologic': 0,
      'Antimicrobial': 0,
      'General Medicine': 0
    };

    let sampleDrugs: string[] = [];
    if (fs.existsSync(this.extractedJsonPath)) {
      try {
        const raw = fs.readFileSync(this.extractedJsonPath, 'utf8').replace(/^\uFEFF/, '');
        const parsed: SplDrugRecord[] = JSON.parse(raw);
        sampleDrugs = parsed.slice(0, 15).map(d => `${d.medicationName} (${d.activeIngredient})`);
        for (const item of parsed) {
          domainCounts[item.clinicalDomain] = (domainCounts[item.clinicalDomain] || 0) + 1;
        }
      } catch (err) {
        console.warn('Error reading extracted SPL json:', err);
      }
    }

    const totalVectorized = vectorDatabase.getAllChunks().filter(c => 
      c.sourceOrganization === 'FDA DailyMed' || c.documentId.startsWith('DOC-FDA-SPL')
    ).length;

    return {
      archiveFileName: 'dm_spl_release_human_rx_part1.zip',
      archivePath: this.zipPath,
      archiveSizeBytes: sizeBytes,
      archiveSizeFormatted: `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      totalSplPackages: 14984,
      datasetTitle: 'FDA DailyMed Structured Product Labeling (SPL) - Human Prescription Drug Release',
      standard: 'HL7 SPL Release 4 XML (LOINC 34391-3)',
      releasePart: 'Part 1 (Human Rx Releases)',
      clinicalDomainCoverage: domainCounts,
      loincSectionsSupported: [
        { code: '34067-9', name: 'Indications and Usage', description: 'FDA approved therapeutic indications and disease states' },
        { code: '34070-3', name: 'Contraindications', description: 'Absolute and relative clinical contraindications' },
        { code: '34066-1', name: 'Boxed Warnings', description: 'Highest level FDA safety alerts and black-box hazard warnings' },
        { code: '34071-1', name: 'Warnings and Precautions', description: 'Special patient safety surveillance and clinical cautions' },
        { code: '34073-7', name: 'Drug Interactions', description: 'Pharmacokinetic and pharmacodynamic interactions' },
        { code: '43684-0', name: 'Specific Populations', description: 'Renal impairment, hepatic impairment, pregnancy, and geriatric guidance' }
      ],
      totalVectorizedInDb: totalVectorized,
      lastIngestedTimestamp: totalVectorized > 0 ? new Date().toISOString() : undefined,
      sampleDrugs: sampleDrugs.length > 0 ? sampleDrugs : [
        'Renese (polythiazide)',
        'Lisinopril (lisinopril)',
        'Carvedilol (carvedilol)',
        'Indomethacin (indomethacin)',
        'Naproxen (naproxen)',
        'Atenolol (atenolol)',
        'Simvastatin (simvastatin)',
        'Glyburide (glyburide)'
      ]
    };
  }

  /**
   * Ingest extracted SPL drug labels into the vector database
   */
  public ingestExtractedSplToVectorDb(): {
    ingestedCount: number;
    totalChunksNow: number;
    ingestedDrugs: string[];
    domainDistribution: Record<string, number>;
  } {
    if (!fs.existsSync(this.extractedJsonPath)) {
      throw new Error(`Extracted SPL drugs file not found at: ${this.extractedJsonPath}. Please run extraction first.`);
    }

    const raw = fs.readFileSync(this.extractedJsonPath, 'utf8').replace(/^\uFEFF/, '');
    const records: SplDrugRecord[] = JSON.parse(raw);

    const domainDist: Record<string, number> = {};
    const ingestedNames: string[] = [];

    for (const record of records) {
      // Build IngestDocumentPayload
      const payload: IngestDocumentPayload = {
        documentId: record.documentId,
        title: `FDA SPL: ${record.medicationName} (${record.activeIngredient})`,
        sourceOrganization: 'FDA DailyMed',
        clinicalDomain: record.clinicalDomain,
        guidelineVersion: record.guidelineVersion,
        publicationDate: record.publicationDate,
        section: record.section,
        pageOrParagraph: record.pageOrParagraph,
        content: record.content,
        recommendation: record.recommendation,
        evidenceClass: record.evidenceClass,
        actionableContraindication: record.actionableContraindication,
        contraindicatedConditions: record.contraindicatedConditions,
        contraindicatedMedications: record.contraindicatedMedications,
        recommendedAlternatives: record.recommendedAlternatives,
        metadata: {
          ...record.metadata,
          medicationName: record.medicationName,
          activeIngredient: record.activeIngredient,
          packageZip: record.packageZip,
          indexInZip: record.indexInZip
        }
      };

      // Ingest into vectorDatabase (automatically embeds into 128-d dense vector and persists)
      vectorDatabase.ingest(payload);

      domainDist[record.clinicalDomain] = (domainDist[record.clinicalDomain] || 0) + 1;
      ingestedNames.push(record.medicationName);
    }

    return {
      ingestedCount: records.length,
      totalChunksNow: vectorDatabase.getAllChunks().length,
      ingestedDrugs: ingestedNames,
      domainDistribution: domainDist
    };
  }

  /**
   * Search specifically within FDA DailyMed SPL vector records
   */
  public searchSplDrugs(query: string, topK: number = 5): any[] {
    const results = vectorDatabase.searchEvidence(query, {
      topK,
      organization: 'FDA DailyMed'
    });

    return results.map(r => ({
      chunkId: r.chunk.chunkId,
      documentId: r.chunk.documentId,
      title: r.chunk.title,
      medicationName: r.chunk.metadata?.medicationName || r.chunk.title,
      activeIngredient: r.chunk.metadata?.activeIngredient || '',
      clinicalDomain: r.chunk.clinicalDomain,
      similarityScore: r.similarityScore,
      actionableContraindication: r.chunk.actionableContraindication,
      recommendation: r.chunk.recommendation,
      hasBlackBoxWarning: r.chunk.metadata?.hasBlackBoxWarning || false,
      relevanceExplanation: r.relevanceExplanation
    }));
  }
}

export const dailyMedSplService = new DailyMedSplService();
