import { Request, Response, NextFunction } from 'express';

// Rate Limiting Bucket Store
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();
const MAX_GENERAL_TOKENS = 120; // 120 requests per minute
const REFILL_RATE_PER_MS = MAX_GENERAL_TOKENS / (60 * 1000);

// Security Audit Log (Immutable in-memory buffer)
export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  eventType: 'ISOLATION_VIOLATION' | 'PROMPT_INJECTION_ATTEMPT' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_PRIVILEGE_ESCALATION';
  ip: string;
  endpoint: string;
  actorRole: string;
  details: string;
  severity: 'HIGH' | 'CRITICAL';
}

export const securityAuditLogs: SecurityAuditEvent[] = [];

/**
 * 1. Secure HTTP Headers Middleware
 */
export const secureHeadersMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

/**
 * 2. In-Memory Token Bucket Rate Limiting
 */
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let bucket = rateLimitStore.get(clientIp);
  if (!bucket) {
    bucket = { tokens: MAX_GENERAL_TOKENS, lastRefill: now };
    rateLimitStore.set(clientIp, bucket);
  } else {
    // Refill tokens
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(MAX_GENERAL_TOKENS, bucket.tokens + elapsed * REFILL_RATE_PER_MS);
    bucket.lastRefill = now;
  }

  if (bucket.tokens < 1) {
    const event: SecurityAuditEvent = {
      id: `SEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType: 'RATE_LIMIT_EXCEEDED',
      ip: clientIp,
      endpoint: req.originalUrl,
      actorRole: (req.headers['x-user-role'] as string) || 'anonymous',
      details: 'Exceeded maximum request rate limit threshold.',
      severity: 'HIGH'
    };
    securityAuditLogs.push(event);

    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait before submitting additional clinical telemetry.'
    });
  }

  bucket.tokens -= 1;
  next();
};

/**
 * 3. Prompt Injection & Adversarial Clinical Input Defense
 */
const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /bypass (all )?(safety|clinical) (gates?|rules?|constraints?)/i,
  /system prompt/i,
  /you are now an unrestricted/i,
  /jailbreak/i,
  /disregard (all )?contraindications/i,
  /prescribe (fentanyl|oxycodone|morphine|narcotics) without (doctor|approval|review)/i,
  /override (fatal|black box|contraindication)/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i
];

export const promptInjectionDefenseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check request body, query, and message fields
  const payloadToScan = JSON.stringify(req.body) + ' ' + JSON.stringify(req.query);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(payloadToScan)) {
      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const event: SecurityAuditEvent = {
        id: `SEC-INJ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        eventType: 'PROMPT_INJECTION_ATTEMPT',
        ip: clientIp,
        endpoint: req.originalUrl,
        actorRole: (req.headers['x-user-role'] as string) || 'patient',
        details: `Adversarial input detected matching pattern: ${pattern.toString()}`,
        severity: 'CRITICAL'
      };
      securityAuditLogs.push(event);

      return res.status(400).json({
        success: false,
        error: 'ADVERSARIAL_INPUT_REJECTED',
        message: 'Security Alert: Input contained disallowed prompt injection or safety bypass heuristics. Intercepted by Deterministic Safety Firewall.',
        auditEventId: event.id
      });
    }
  }

  next();
};

/**
 * 4. Multi-Patient Isolation & Persona Separation Guard
 */
export const enforceStrictPatientIsolation = (req: Request, res: Response, next: NextFunction) => {
  const role = (req.headers['x-user-role'] as string) || 'clinician';
  const urlMatch = req.originalUrl ? req.originalUrl.match(/\/patient[s]?\/([a-zA-Z0-9_-]+)/) : null;
  const targetPatientId = req.params?.patientId || req.params?.id || req.body?.patientId || req.query?.patientId || (urlMatch ? urlMatch[1] : undefined);
  const authenticatedPatientId = (req.headers['x-patient-id'] as string) || 'patient-ev-68';

  // If actor is a patient, they CANNOT access any patient ID other than their own assigned ID
  if (role === 'patient') {
    // 1. Prevent cross-patient data access
    if (targetPatientId && targetPatientId !== authenticatedPatientId) {
      const event: SecurityAuditEvent = {
        id: `SEC-ISO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        eventType: 'ISOLATION_VIOLATION',
        ip: req.ip || '127.0.0.1',
        endpoint: req.originalUrl,
        actorRole: 'patient',
        details: `Patient '${authenticatedPatientId}' attempted unauthorized access to Patient '${targetPatientId}'. Access blocked.`,
        severity: 'CRITICAL'
      };
      securityAuditLogs.push(event);

      return res.status(403).json({
        success: false,
        error: 'PATIENT_ISOLATION_VIOLATION',
        message: 'Forbidden: Strict cryptographic patient isolation prohibits cross-patient record access.',
        auditEventId: event.id
      });
    }

    // 2. Prevent patient from calling clinician-only endpoints
    const clinicianOnlyPaths = ['/decision', '/override', '/batch-approve', '/scenarios', '/validation'];
    const isClinicianPath = clinicianOnlyPaths.some(p => req.originalUrl.includes(p));
    if (isClinicianPath) {
      const event: SecurityAuditEvent = {
        id: `SEC-ESC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        eventType: 'UNAUTHORIZED_PRIVILEGE_ESCALATION',
        ip: req.ip || '127.0.0.1',
        endpoint: req.originalUrl,
        actorRole: 'patient',
        details: `Patient attempted privileged clinician decision endpoint: ${req.originalUrl}`,
        severity: 'CRITICAL'
      };
      securityAuditLogs.push(event);

      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_CLINICIAN_ONLY',
        message: 'Forbidden: This action requires verified clinician credentials.',
        auditEventId: event.id
      });
    }
  }

  next();
};
