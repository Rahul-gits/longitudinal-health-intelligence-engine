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

export default router;
