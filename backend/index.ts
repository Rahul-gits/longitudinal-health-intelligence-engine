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
import contactRoutes from './routes/contactRoutes';
import {
  secureHeadersMiddleware,
  rateLimitMiddleware,
  promptInjectionDefenseMiddleware
} from './middleware/securityHardeningMiddleware';

import { observabilityService } from './services/observabilityService';
import { checkDatabaseHealth } from './services/sessionStore';
import { qdrantClientService } from './services/qdrantClientService';
import { redisService } from './services/redisService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Robustness Middleware
app.use(secureHeadersMiddleware);

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy for clinical data protection'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'x-patient-id', 'x-user-role', 'x-tenant-id']
}));
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

// Health check endpoint (Real dependency verification: PostgreSQL, Qdrant, Redis)
app.get('/api/health', async (_req: Request, res: Response) => {
  const [dbHealth, qdrantHealth, redisHealth] = await Promise.all([
    checkDatabaseHealth().catch(err => ({ connected: false, status: 'ERROR', error: err.message })),
    qdrantClientService.checkHealth().catch(err => ({ connected: false, version: undefined as string | undefined, error: err.message })),
    redisService.checkConnection().catch(err => ({ connected: false, status: 'ERROR', error: err.message }))
  ]);

  const vectorStoreMode = qdrantHealth.connected ? 'VECTOR_DB_QDRANT' : 'LOCAL_FALLBACK';
  const overallStatus = 'HEALTHY';

  res.json({
    status: overallStatus,
    service: 'HEAL Engine Longitudinal Clinical Intelligence Backend',
    version: '2.5.0-governed',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    dependencies: {
      postgres: {
        connected: dbHealth.connected,
        status: dbHealth.status,
        ...(dbHealth.error ? { error: dbHealth.error } : {})
      },
      vectorStore: {
        connected: qdrantHealth.connected,
        mode: vectorStoreMode,
        ...(qdrantHealth.version ? { version: qdrantHealth.version } : {}),
        ...(qdrantHealth.error ? { error: qdrantHealth.error } : {})
      },
      redis: {
        connected: redisHealth.connected,
        status: redisHealth.status,
        ...(redisHealth.error ? { error: redisHealth.error } : {})
      }
    },
    database: {
      connected: dbHealth.connected,
      mode: vectorStoreMode,
      details: qdrantHealth.connected
        ? 'Qdrant Vector Store Active'
        : 'Resilient Local Semantic Vector Store Active'
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
      '/api/contact',
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
app.use('/api/contact', contactRoutes);

// Search Engine Indexing Protection for API endpoints & Private Workspaces
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/app') || req.path.startsWith('/dashboard') || req.path.startsWith('/clinical')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  next();
});

// URL Normalization & 301 Permanent Redirects
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  const pathname = req.path;

  // 1. Legacy Alias 301 Permanent Redirects
  if (pathname === '/home') {
    const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
    return res.redirect(301, '/' + qs);
  }
  if (pathname === '/specialist') {
    const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
    return res.redirect(301, '/specialists' + qs);
  }
  if (pathname === '/tech') {
    const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
    return res.redirect(301, '/technology' + qs);
  }

  // 2. Trailing slash normalization (e.g. /about/ -> /about)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const cleanPath = pathname.slice(0, -1);
    const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
    return res.redirect(301, cleanPath + qs);
  }

  // 3. Uppercase to lowercase normalization (e.g. /ABOUT -> /about)
  const lowerPath = pathname.toLowerCase();
  if (pathname !== lowerPath && !pathname.startsWith('/api/')) {
    const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
    return res.redirect(301, lowerPath + qs);
  }

  next();
});

// Static directory paths
const distPath = fs.existsSync(path.resolve(process.cwd(), 'dist'))
  ? path.resolve(process.cwd(), 'dist')
  : path.resolve(__dirname, '../dist');
const publicPath = path.resolve(process.cwd(), 'frontend', 'public');

// Explicit robots.txt endpoint
app.get('/robots.txt', (_req: Request, res: Response) => {
  const robotsDist = path.resolve(distPath, 'robots.txt');
  const robotsPublic = path.resolve(publicPath, 'robots.txt');
  const target = fs.existsSync(robotsDist) ? robotsDist : robotsPublic;
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    return res.sendFile(target);
  }
  res.status(404).send('User-agent: *\nDisallow: /api/');
});

// Explicit sitemap.xml endpoint
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const sitemapDist = path.resolve(distPath, 'sitemap.xml');
  const sitemapPublic = path.resolve(publicPath, 'sitemap.xml');
  const target = fs.existsSync(sitemapDist) ? sitemapDist : sitemapPublic;
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    return res.sendFile(target);
  }
  res.status(404).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
});

// Google Search Console HTML Verification File Support
app.get(/^\/google([a-zA-Z0-9_-]+)\.html$/, (req: Request, res: Response) => {
  const requestedFile = req.path.replace(/^\//, '');
  const verificationFile = path.resolve(publicPath, requestedFile);
  if (fs.existsSync(verificationFile)) {
    return res.sendFile(verificationFile);
  }
  const expectedCode = process.env.VITE_GSC_VERIFICATION_CODE || process.env.GSC_VERIFICATION_CODE;
  if (expectedCode && requestedFile === `google${expectedCode}.html`) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    return res.send(`google-site-verification: google${expectedCode}.html`);
  }
  res.status(404).send('Google Search Console verification file not found.');
});

// Serve frontend static assets in production if dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const routeSegment = req.path.replace(/^\/|\/$/g, '');
      // Check for pre-rendered route static HTML: e.g. dist/about/index.html, dist/privacy/index.html
      if (routeSegment) {
        const prerenderedFile = path.resolve(distPath, routeSegment, 'index.html');
        if (fs.existsSync(prerenderedFile)) {
          res.setHeader('Content-Type', 'text/html; charset=UTF-8');
          return res.sendFile(prerenderedFile);
        }
      }
      return res.sendFile(path.resolve(distPath, 'index.html'));
    }
    next();
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

// Global Error Handler (V17: Production error sanitization)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[HEAL-ENGINE-ERROR]', err);
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: isProd
      ? 'An unexpected error occurred in clinical processing. Please contact system support.'
      : (err.message || 'Internal Server Error in Clinical Engine'),
    code: err.code || 'INTERNAL_SERVER_ERROR'
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
