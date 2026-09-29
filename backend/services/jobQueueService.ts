export type JobType = 
  | 'OCR_PROCESSING' 
  | 'DOCUMENT_PARSING' 
  | 'RAG_EMBEDDING' 
  | 'LONGITUDINAL_RECALC' 
  | 'REPORT_GENERATION';

export type JobStatus = 
  | 'QUEUED' 
  | 'RUNNING' 
  | 'SUCCEEDED' 
  | 'FAILED' 
  | 'RETRYING' 
  | 'CANCELLED' 
  | 'DEAD_LETTER';

export type JobPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface ClinicalJobRecord {
  jobId: string;
  patientId: string;
  jobType: JobType;
  priority: JobPriority;
  status: JobStatus;
  progress: number;
  workerId: string;
  workerVersion: string;
  inputVersion: string;
  outputVersion?: string;
  idempotencyKey?: string;
  attemptCount: number;
  maxAttempts: number;
  payload: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

import { redisService } from './redisService';

export class JobQueueService {
  private jobs: Map<string, ClinicalJobRecord> = new Map();
  private idempotencyIndex: Map<string, string> = new Map(); // idempotencyKey -> jobId
  private eventListeners: ((job: ClinicalJobRecord) => void)[] = [];
  private readonly defaultMaxAttempts = 3;
  private readonly currentWorkerVersion = 'v2.4.1-clinical-worker';

  constructor() {
    // Connect to Redis asynchronously
    redisService.connect().catch(() => {});

    // Seed initial historical job with full audit metadata
    this.enqueueJob({
      id: 'job-ocr-seed-01',
      jobType: 'OCR_PROCESSING',
      patientId: 'patient-ev-68',
      priority: 'HIGH',
      idempotencyKey: 'idemp-ocr-cmp-2026-08',
      payload: { documentTitle: 'Outpatient Comprehensive Metabolic Panel', pageCount: 3, sourceClinic: 'St. Jude Health' }
    });
  }

  public enqueueJob(params: {
    id?: string;
    jobType: JobType;
    patientId: string;
    priority?: JobPriority;
    idempotencyKey?: string;
    inputVersion?: string;
    maxAttempts?: number;
    payload: Record<string, any>;
  }): ClinicalJobRecord {
    // 1. Idempotency Check: prevent duplicate medical records or repeated heavy OCR
    if (params.idempotencyKey && this.idempotencyIndex.has(params.idempotencyKey)) {
      const existingJobId = this.idempotencyIndex.get(params.idempotencyKey)!;
      const existingJob = this.jobs.get(existingJobId);
      if (existingJob && (existingJob.status === 'SUCCEEDED' || existingJob.status === 'RUNNING' || existingJob.status === 'QUEUED')) {
        console.log(`[JobQueue] Idempotent hit: returning existing job ${existingJobId} for key ${params.idempotencyKey}`);
        return existingJob;
      }
    }

    const jobId = params.id || `job-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const job: ClinicalJobRecord = {
      jobId,
      patientId: params.patientId,
      jobType: params.jobType,
      priority: params.priority || 'NORMAL',
      status: 'QUEUED',
      progress: 0,
      workerId: `worker-node-${Math.floor(Math.random() * 4) + 1}`,
      workerVersion: this.currentWorkerVersion,
      inputVersion: params.inputVersion || 'fhir-r4-v1.0',
      idempotencyKey: params.idempotencyKey,
      attemptCount: 0,
      maxAttempts: params.maxAttempts || this.defaultMaxAttempts,
      payload: params.payload,
      createdAt: new Date().toISOString()
    };

    if (params.idempotencyKey) {
      this.idempotencyIndex.set(params.idempotencyKey, jobId);
    }

    this.jobs.set(jobId, job);
    this.notifyListeners(job);

    this.dispatchJobExecution(jobId);
    return job;
  }

  public cancelJob(jobId: string, reason?: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status === 'SUCCEEDED' || job.status === 'DEAD_LETTER' || job.status === 'CANCELLED') {
      return false;
    }
    job.status = 'CANCELLED';
    job.error = reason || 'Cancelled by clinician or system supervisor';
    job.completedAt = new Date().toISOString();
    this.notifyListeners(job);
    return true;
  }

  private dispatchJobExecution(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'CANCELLED') return;

    job.attemptCount += 1;
    job.status = 'RUNNING';
    job.startedAt = new Date().toISOString();
    job.progress = 20;
    this.notifyListeners(job);

    setTimeout(() => {
      if (job.status === 'CANCELLED') return;
      job.progress = 65;
      this.notifyListeners(job);

      setTimeout(() => {
        if (job.status === 'CANCELLED') return;

        // Deterministic simulation of success vs failure based on test inputs
        const shouldSimulateFailure = job.payload?.simulateFailure && job.attemptCount < job.maxAttempts;
        const shouldSimulateFatal = job.payload?.simulateFatalError;

        if (shouldSimulateFailure) {
          job.status = 'RETRYING';
          job.error = `Transient OCR OCRWorkerTimeout on attempt ${job.attemptCount}`;
          job.progress = 0;
          this.notifyListeners(job);

          // Retry with exponential backoff
          const backoffDelay = Math.pow(2, job.attemptCount) * 400;
          setTimeout(() => this.dispatchJobExecution(jobId), backoffDelay);
          return;
        }

        if (shouldSimulateFatal || (job.payload?.simulateFailure && job.attemptCount >= job.maxAttempts)) {
          job.status = 'DEAD_LETTER';
          job.error = `Fatal non-recoverable error after ${job.attemptCount} attempts. Routing to Dead Letter Queue for engineering review.`;
          job.completedAt = new Date().toISOString();
          this.notifyListeners(job);
          return;
        }

        // Job succeeded cleanly
        job.status = 'SUCCEEDED';
        job.progress = 100;
        job.completedAt = new Date().toISOString();
        job.outputVersion = 'output-hash-' + Math.random().toString(36).substring(2, 8);

        if (job.jobType === 'OCR_PROCESSING') {
          job.result = {
            extractedEntities: 16,
            confidence: 0.985,
            provenance: 'FHIR R4 DiagnosticReport Verified',
            normalizedBiomarkers: ['eGFR', 'Serum Creatinine', 'BUN', 'Potassium'],
            idempotencyVerified: true
          };
        } else if (job.jobType === 'LONGITUDINAL_RECALC') {
          job.result = {
            eGfrSlope: '-6.2 mL/min/year',
            cockcroftGaultCrCl: 43.9,
            reversibilityProbability: 0.95,
            riskStratification: 'STAGE_3B_DECLINING'
          };
        } else if (job.jobType === 'RAG_EMBEDDING') {
          job.result = {
            chunksIndexed: 24,
            vectorDimensions: 1536,
            store: 'KDIGO-2024-Index',
            model: 'text-embedding-3-small'
          };
        } else {
          job.result = { status: 'Task executed successfully', recordsProcessed: 1 };
        }

        this.notifyListeners(job);
      }, 700);
    }, 400);
  }

  public getJob(jobId: string): ClinicalJobRecord | undefined {
    return this.jobs.get(jobId);
  }

  public getAllJobs(patientId?: string): ClinicalJobRecord[] {
    const list = Array.from(this.jobs.values());
    if (patientId) {
      return list.filter(j => j.patientId === patientId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public onJobUpdate(callback: (job: ClinicalJobRecord) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(job: ClinicalJobRecord): void {
    // Persist durable state in Redis
    redisService.setJob(job.jobId, job).catch(() => {});
    if (job.idempotencyKey) {
      redisService.setIdempotency(job.idempotencyKey, job.jobId).catch(() => {});
    }

    this.eventListeners.forEach(cb => {
      try {
        cb({ ...job });
      } catch (err) {
        console.error('JobQueue listener error:', err);
      }
    });
  }
}

export const jobQueueService = new JobQueueService();
