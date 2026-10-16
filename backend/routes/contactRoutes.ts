import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// In-Memory Audited Inquiry Store
export interface ContactInquiry {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  organization?: string;
  role?: string;
  subject: string;
  message: string;
  ip: string;
  status: 'PENDING_CONFIG' | 'DISPATCHED' | 'DISPATCH_FAILED';
  deliveryError?: string;
}

export const contactInquiryLedger: ContactInquiry[] = [];

// Dedicated Contact Rate Limiter: 5 submissions per 10 minutes per IP
const contactRateLimits = new Map<string, { count: number; resetTime: number }>();
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateLimits.get(ip);

  if (!entry || now > entry.resetTime) {
    contactRateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Strict email regex (RFC 5322 subset)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Header injection pattern check
function containsHeaderInjection(str: string): boolean {
  return /[\r\n]/.test(str);
}

/**
 * GET /api/contact/status
 * Public status endpoint indicating if outbound delivery service is configured
 */
router.get('/status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(
    process.env.CONTACT_SMTP_HOST ||
    process.env.CONTACT_WEBHOOK_URL ||
    process.env.RESEND_API_KEY
  );

  res.json({
    service: 'HEAL Engine Contact Dispatch Service',
    configured: isConfigured,
    deliveryMode: isConfigured ? 'EXTERNAL_PROVIDER' : 'AUDITED_IN_MEMORY_QUEUE',
    recipient: process.env.CONTACT_RECIPIENT_EMAIL || 'contact@healengine.hospital.org'
  });
});

/**
 * POST /api/contact
 * Validates, rate-limits, and processes clinical inquiries
 */
router.post('/', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';

  // 1. Rate Limiting Check
  if (!checkContactRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'Too many contact requests from this IP. Please wait 10 minutes before submitting another inquiry.'
    });
  }

  const { name, email, organization, role, subject, message, honeypot } = req.body || {};

  // 2. Anti-Spam Honeypot Check
  if (honeypot && String(honeypot).trim().length > 0) {
    // Bot detected - reject quietly
    return res.status(400).json({
      success: false,
      code: 'SPAM_REJECTED',
      error: 'Submission identified as automated spam.'
    });
  }

  // 3. Validation: Required fields & types
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_NAME',
      error: 'Name must be between 2 and 100 characters.'
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 254) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_EMAIL',
      error: 'Please provide a valid email address.'
    });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 200) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_SUBJECT',
      error: 'Subject must be between 3 and 200 characters.'
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_MESSAGE',
      error: 'Message must be between 10 and 3000 characters.'
    });
  }

  // 4. Header Injection Defense
  if (
    containsHeaderInjection(name) ||
    containsHeaderInjection(email) ||
    containsHeaderInjection(subject) ||
    (organization && containsHeaderInjection(organization))
  ) {
    return res.status(400).json({
      success: false,
      code: 'MALFORMED_HEADER_INJECTION',
      error: 'Invalid characters detected in header fields.'
    });
  }

  const sanitizedInquiry: ContactInquiry = {
    id: `INQ-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    timestamp: new Date().toISOString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    organization: organization ? String(organization).trim().slice(0, 100) : undefined,
    role: role ? String(role).trim().slice(0, 50) : undefined,
    subject: subject.trim(),
    message: message.trim(),
    ip: clientIp,
    status: 'PENDING_CONFIG'
  };

  // 5. Provider Dispatch Workflow
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  const smtpHost = process.env.CONTACT_SMTP_HOST;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (webhookUrl) {
    try {
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: sanitizedInquiry.id,
          recipient: process.env.CONTACT_RECIPIENT_EMAIL || 'contact@healengine.hospital.org',
          inquiry: sanitizedInquiry
        })
      });

      if (!webhookRes.ok) {
        throw new Error(`Webhook responded with HTTP ${webhookRes.status}`);
      }

      sanitizedInquiry.status = 'DISPATCHED';
      contactInquiryLedger.push(sanitizedInquiry);

      return res.status(200).json({
        success: true,
        ticketId: sanitizedInquiry.id,
        message: 'Your inquiry has been successfully transmitted to the HEAL Engine Clinical Engineering team.',
        status: 'DISPATCHED'
      });
    } catch (err: any) {
      sanitizedInquiry.status = 'DISPATCH_FAILED';
      sanitizedInquiry.deliveryError = err.message;
      contactInquiryLedger.push(sanitizedInquiry);

      return res.status(502).json({
        success: false,
        code: 'DISPATCH_GATEWAY_ERROR',
        error: 'Failed to deliver message via configured outbound gateway. The inquiry has been logged for manual review.',
        ticketId: sanitizedInquiry.id
      });
    }
  }

  // If no external email service provider is configured:
  // Store in audited ledger and honestly communicate setup requirement
  contactInquiryLedger.push(sanitizedInquiry);

  return res.status(200).json({
    success: false,
    code: 'EMAIL_SERVICE_NOT_CONFIGURED',
    error: 'Outbound email delivery provider is not configured in this environment.',
    guidance: 'To enable automatic dispatch to hospital administration, set CONTACT_WEBHOOK_URL or CONTACT_SMTP_HOST in environment secrets.',
    ticketId: sanitizedInquiry.id,
    loggedForForensics: true
  });
});

export default router;
