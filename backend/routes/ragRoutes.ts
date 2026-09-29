import { Router, Request, Response } from 'express';
import { vectorDatabase } from '../db/vectorDatabase';

const router = Router();

/**
 * GET /api/rag/stats
 * Returns vector database collection statistics, embedding dimensions, and domain breakdowns
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = vectorDatabase.getStats();
    res.json({
      status: 'success',
      data: stats
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/rag/documents
 * List all evidence chunks currently indexed in the vector database
 */
router.get('/documents', (req: Request, res: Response) => {
  try {
    const chunks = vectorDatabase.getAllChunks();
    res.json({
      status: 'success',
      total: chunks.length,
      data: chunks
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * POST /api/rag/query
 * Perform semantic vector search for evidence RAG with cosine similarity ranking
 */
router.post('/query', (req: Request, res: Response) => {
  try {
    const { query, topK, minSimilarity, domain, organization, contraindicationsOnly } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: 'error', message: 'A valid text "query" string is required.' });
    }

    const results = vectorDatabase.searchEvidence(query, {
      topK: topK ? parseInt(topK, 10) : 4,
      minSimilarity: minSimilarity ? parseFloat(minSimilarity) : 0.25,
      domain,
      organization,
      contraindicationsOnly: Boolean(contraindicationsOnly)
    });

    const ragContext = vectorDatabase.buildRagPromptContext(results);

    res.json({
      status: 'success',
      query,
      matchCount: results.length,
      results,
      ragContext
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * POST /api/rag/ingest
 * Ingest new clinical guideline documents or evidence chunks into the vector database
 */
router.post('/ingest', (req: Request, res: Response) => {
  try {
    const {
      title,
      sourceOrganization,
      clinicalDomain,
      content,
      guidelineVersion,
      publicationDate,
      section,
      pageOrParagraph,
      recommendation,
      evidenceClass,
      actionableContraindication,
      contraindicatedMedications,
      contraindicatedConditions,
      recommendedAlternatives,
      metadata
    } = req.body;

    if (!title || !sourceOrganization || !clinicalDomain || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required ingestion fields: "title", "sourceOrganization", "clinicalDomain", and "content" are required.'
      });
    }

    const ingestedChunk = vectorDatabase.ingest({
      title,
      sourceOrganization,
      clinicalDomain,
      content,
      guidelineVersion,
      publicationDate,
      section,
      pageOrParagraph,
      recommendation,
      evidenceClass,
      actionableContraindication: Boolean(actionableContraindication),
      contraindicatedMedications,
      contraindicatedConditions,
      recommendedAlternatives,
      metadata
    });

    res.status(201).json({
      status: 'success',
      message: 'Evidence document successfully vectorized and ingested into vector database.',
      data: ingestedChunk
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

import { clinicalEvidencePipelineService, IngestionInput } from '../services/clinicalEvidencePipelineService';

/**
 * GET /api/rag/pipeline/presets
 * Returns sample documents for the 4 primary categories: Guidelines, Drug References, Clinical Studies, Institutional Protocols
 */
router.get('/pipeline/presets', (_req: Request, res: Response) => {
  const presets: IngestionInput[] = [
    {
      title: 'KDIGO 2024 Clinical Practice Guideline for Chronic Kidney Disease',
      category: 'GUIDELINE',
      fileFormat: 'PDF',
      sourceOrganization: 'KDIGO',
      clinicalDomain: 'Nephrology',
      guidelineVersion: 'v2024.1 (Published March 2024)',
      publicationDate: '2024-03-15',
      ocrConfidence: 0.99,
      rawContent: `Section 4.2: Pharmacological Interventions & Avoidance of Nephrotoxic Exposure.

Recommendation 4.2.1: In patients with estimated glomerular filtration rate (eGFR) < 60 mL/min/1.73m² (CKD Stage 3a to 5) or receiving active RAAS inhibitor therapy (such as Lisinopril or Losartan), systemic non-selective oral NSAIDs (including Ibuprofen, Advil, Motrin, Naproxen, Aleve) must be strictly avoided.

Mechanism of Hazard: Prostaglandin inhibition leads to severe afferent arteriolar vasoconstriction, precipitating acute reversible hemodynamic GFR collapse.

Recommended Alternatives: Utilize topical Diclofenac 1% gel, acetaminophen up to 2g/day, or non-pharmacological cryotherapy under clinical supervision.`
    },
    {
      title: 'FDA Package Insert & Beers Criteria: Oral NSAID Renal & Cardiovascular Warnings',
      category: 'DRUG_REFERENCE',
      fileFormat: 'DOCX',
      sourceOrganization: 'FDA',
      clinicalDomain: 'Pharmacogenomics',
      guidelineVersion: 'FDA Label Revision 2023',
      publicationDate: '2023-09-01',
      ocrConfidence: 0.98,
      rawContent: `Black Box Warning: Cardiovascular and Renal Risk.

NSAIDs cause an increased risk of serious cardiovascular thrombotic events, myocardial infarction, and stroke.

Contraindications & Renal Impairment: Administration of systemic oral NSAIDs is contraindicated in patients with advanced renal disease or older adults (age >= 65) with baseline CKD. Co-administration with ACE inhibitors and loop diuretics causes the "Triple Whammy" acute kidney injury syndrome.

Patients carrying CYP2C9*3 intermediate metabolizer alleles exhibit 50% impaired clearance, resulting in persistent drug accumulation.`
    },
    {
      title: 'EMPA-KIDNEY Trial: Cardiorenal Outcomes of SGLT2 Inhibition in Chronic Kidney Disease',
      category: 'CLINICAL_STUDY',
      fileFormat: 'PDF',
      sourceOrganization: 'NEJM / Clinical Study',
      clinicalDomain: 'Metabolic',
      guidelineVersion: 'Phase III RCT (N=6,609)',
      publicationDate: '2023-01-12',
      ocrConfidence: 0.97,
      rawContent: `Clinical Trial Outcomes: Progression of Kidney Disease and Cardiovascular Mortality.

Methods: Double-blind, randomized, placebo-controlled trial evaluating Empagliflozin 10mg daily in patients with CKD (eGFR 20 to 45 mL/min/1.73m² or eGFR 45 to 90 with urinary albumin-to-creatinine ratio >= 200 mg/g).

Results: Empagliflozin led to a statistically significant 28% relative risk reduction in progression of kidney disease or cardiovascular death (HR 0.72; 95% CI 0.64-0.82; p < 0.001).

Recommendation: SGLT2 inhibitors should be initiated as standard of care in CKD populations to preserve residual nephron function.`
    },
    {
      title: 'Hospital Clinical Formulary Protocol: Inpatient Nephrotoxic Sparing and Analgesic Pathway',
      category: 'INSTITUTIONAL_PROTOCOL',
      fileFormat: 'TXT',
      sourceOrganization: 'Institutional Protocol',
      clinicalDomain: 'Nephrology',
      guidelineVersion: 'Hospital Guideline Policy #MED-704',
      publicationDate: '2024-02-01',
      ocrConfidence: 0.98,
      rawContent: `Section 1: Inpatient Pain Management for Patients with Reduced Renal Function.

Protocol Directive: For all admitted patients with baseline serum creatinine > 1.4 mg/dL or eGFR < 60 mL/min, electronic prescribing systems will trigger an automated hard stop blocking systemic oral NSAID orders.

Step 1: First-line mild to moderate somatic pain: Acetaminophen 500mg-650mg PO Q6H PRN (maximum 2,000mg per 24 hours).
Step 2: Localized joint/musculoskeletal pain: Topical Diclofenac gel 1% applied TID to affected joint.
Step 3: Neuropathic pain: Dose-adjusted Gabapentin according to calculated creatinine clearance.`
    }
  ];

  res.json({
    status: 'success',
    total: presets.length,
    data: presets
  });
});

/**
 * POST /api/rag/pipeline/execute
 * Executes the full 12-stage clinical evidence pipeline:
 * Document Ingestion -> OCR -> Clinical Cleaning -> Semantic Chunking -> Metadata Enrichment
 * -> Embedding Generation -> Vector DB -> Hybrid Retrieval -> Reranking -> Evidence Context
 * -> Clinical Intelligence -> Safety Constraint Engine -> Clinician Review
 */
router.post('/pipeline/execute', async (req: Request, res: Response) => {
  try {
    const input: IngestionInput = req.body;

    if (!input.title || !input.rawContent) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required pipeline fields: "title" and "rawContent" are required.'
      });
    }

    const report = await clinicalEvidencePipelineService.executePipeline({
      documentId: input.documentId,
      title: input.title,
      category: input.category || 'GUIDELINE',
      fileFormat: input.fileFormat || 'PDF',
      sourceOrganization: input.sourceOrganization || 'Clinical Organization',
      clinicalDomain: input.clinicalDomain || 'General Medicine',
      guidelineVersion: input.guidelineVersion,
      publicationDate: input.publicationDate,
      rawContent: input.rawContent,
      ocrConfidence: input.ocrConfidence,
      metadata: input.metadata,
      patientContext: input.patientContext || {
        patientId: 'patient-ev-68',
        patientName: 'Eleanor Vance',
        conditions: ['CKD Stage 3', 'Hypertension'],
        medications: ['Lisinopril 20mg daily'],
        egfr: 52
      }
    });

    res.json({
      status: 'success',
      data: report
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * POST /api/rag/pipeline/review-decision
 * Clinician records review action (APPROVED, MODIFIED, REJECTED)
 */
router.post('/pipeline/review-decision', (req: Request, res: Response) => {
  try {
    const { packetId, action, reviewedBy, notes } = req.body;

    if (!packetId || !action || !reviewedBy) {
      return res.status(400).json({
        status: 'error',
        message: '"packetId", "action" (APPROVED | MODIFIED | REJECTED), and "reviewedBy" are required.'
      });
    }

    const updated = clinicalEvidencePipelineService.recordClinicianDecision(packetId, {
      action,
      reviewedBy,
      notes
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: `Review packet with ID "${packetId}" not found.`
      });
    }

    res.json({
      status: 'success',
      message: `Clinician review recorded: ${action}.`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/rag/pipeline/review-packets
 * Returns all active clinician review packets
 */
router.get('/pipeline/review-packets', (_req: Request, res: Response) => {
  try {
    const packets = clinicalEvidencePipelineService.getAllReviewPackets();
    res.json({
      status: 'success',
      total: packets.length,
      data: packets
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

import { dailyMedSplService } from '../services/dailyMedSplService';

/**
 * GET /api/rag/spl/summary
 * Returns comprehensive statistical and clinical summary of dm_spl_release_human_rx_part1.zip
 */
router.get('/spl/summary', (_req: Request, res: Response) => {
  try {
    const summary = dailyMedSplService.getDatabaseSummary();
    res.json({
      status: 'success',
      data: summary
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * POST /api/rag/spl/ingest
 * Trigger ingestion of extracted DailyMed SPL drug packages into vector database
 */
router.post('/spl/ingest', (_req: Request, res: Response) => {
  try {
    const result = dailyMedSplService.ingestExtractedSplToVectorDb();
    res.json({
      status: 'success',
      message: `Successfully ingested ${result.ingestedCount} FDA SPL drug labels into vector database.`,
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * POST /api/rag/spl/search
 * Search specifically across FDA SPL drug labeling vector chunks
 */
router.post('/spl/search', (req: Request, res: Response) => {
  try {
    const { query, topK } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Text "query" is required.' });
    }
    const results = dailyMedSplService.searchSplDrugs(query, topK ? parseInt(topK, 10) : 5);
    res.json({
      status: 'success',
      query,
      matchCount: results.length,
      data: results
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
