import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import patientRoutes from './routes/patientRoutes';
import workflowRoutes from './routes/workflowRoutes';
import screeningRoutes, { handleVirtualDoctorChat } from './routes/screeningRoutes';
import swarmRoutes from './routes/swarmRoutes';
import conferenceRoutes from './routes/conferenceRoutes';
import safetyRoutes from './routes/safetyRoutes';
import reportRoutes from './routes/reportRoutes';
import benchmarkRoutes from './routes/benchmarkRoutes';
import auditRoutes from './routes/auditRoutes';
import authRoutes from './routes/authRoutes';
import validationRoutes from './routes/validationRoutes';
import fhirRoutes from './routes/fhirRoutes';
import securityRoutes from './routes/securityRoutes';
import usabilityRoutes from './routes/usabilityRoutes';
import shadowRoutes from './routes/shadowRoutes';
import governanceRoutes from './routes/governanceRoutes';
import ragRoutes from './routes/ragRoutes';
import {
  secureHeadersMiddleware,
  rateLimitMiddleware,
  promptInjectionDefenseMiddleware
} from './middleware/securityHardeningMiddleware';

import { observabilityService } from './services/observabilityService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Robustness Middleware
app.use(secureHeadersMiddleware);
app.use(cors());
app.use(rateLimitMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(promptInjectionDefenseMiddleware);

// Request Logging & Latency Tracking
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  console.log(`[${timestamp}] [HEAL-ENGINE-API] ${req.method} ${req.url}`);

  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    observabilityService.recordRequestLatency(latencyMs);
  });

  next();
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'HEAL Engine Longitudinal Clinical Intelligence Backend',
    version: '2.5.0-governed',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      connected: true,
      mode: 'VECTOR_DB_QDRANT',
      details: 'Qdrant Vector Store Active'
    },
    endpoints: [
      '/api/auth',
      '/api/patients',
      '/api/workflow',
      '/api/screening',
      '/api/swarm',
      '/api/conference',
      '/api/safety',
      '/api/reports',
      '/api/benchmarks',
      '/api/audit',
      '/api/validation',
      '/api/rag',
      '/api/metrics'
    ]
  });
});

// Prometheus Operational Metrics Endpoint
app.get('/api/metrics', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(observabilityService.getPrometheusMetrics());
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patient', patientRoutes);
app.post('/api/workflow/virtual-doctor/patient-check', handleVirtualDoctorChat);
app.use('/api/workflow', workflowRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/swarm', swarmRoutes);
app.use('/api/conference', conferenceRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/fhir', fhirRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/usability', usabilityRoutes);
app.use('/api/shadow', shadowRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/rag', ragRoutes);

// Serve frontend static assets in production if dist directory exists
const distPath = fs.existsSync(path.resolve(process.cwd(), 'dist'))
  ? path.resolve(process.cwd(), 'dist')
  : path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found on HEAL Engine Server',
    hint: 'Check /api/health for a list of available clinical routes.'
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[HEAL-ENGINE-ERROR]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error in Clinical Engine'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ HEAL ENGINE CLINICAL BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
