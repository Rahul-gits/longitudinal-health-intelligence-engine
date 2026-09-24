import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes';
import workflowRoutes from './routes/workflowRoutes';
import screeningRoutes from './routes/screeningRoutes';
import swarmRoutes from './routes/swarmRoutes';
import conferenceRoutes from './routes/conferenceRoutes';
import safetyRoutes from './routes/safetyRoutes';
import reportRoutes from './routes/reportRoutes';
import benchmarkRoutes from './routes/benchmarkRoutes';
import auditRoutes from './routes/auditRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [HEAL-ENGINE-API] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'HEAL Engine Longitudinal Clinical Intelligence Backend',
    version: '2.4.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
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
      '/api/audit'
    ]
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/swarm', swarmRoutes);
app.use('/api/conference', conferenceRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/audit', auditRoutes);

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
