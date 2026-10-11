/**
 * Inbound Webhook Cryptographic Verification Service (V16)
 *
 * Enforces secure HMAC-SHA256 signature verification and replay protection
 * for inbound webhooks (e.g. EHR notifications, lab telemetry, health system events).
 */

import crypto from 'crypto';

export interface WebhookVerificationOptions {
  rawBody: string | Buffer;
  signatureHeader?: string;
  secret: string;
  timestampHeader?: string;
  toleranceSeconds?: number; // Default 300 seconds (5 minutes)
}

export interface WebhookVerificationResult {
  isValid: boolean;
  reason?: 'VALID' | 'MISSING_SIGNATURE' | 'EXPIRED_TIMESTAMP' | 'INVALID_SIGNATURE' | 'MISSING_SECRET';
  message: string;
}

export class WebhookVerificationService {
  /**
   * Verify HMAC-SHA256 webhook signature with constant-time comparison
   * and replay timestamp tolerance check.
   */
  public static verifySignature(options: WebhookVerificationOptions): WebhookVerificationResult {
    const { rawBody, signatureHeader, secret, timestampHeader, toleranceSeconds = 300 } = options;

    if (!secret) {
      return {
        isValid: false,
        reason: 'MISSING_SECRET',
        message: 'Webhook secret is not configured.'
      };
    }

    if (!signatureHeader) {
      return {
        isValid: false,
        reason: 'MISSING_SIGNATURE',
        message: 'Missing webhook signature header.'
      };
    }

    // Replay attack prevention via timestamp verification
    if (timestampHeader) {
      const timestampMs = parseInt(timestampHeader, 10) * (timestampHeader.length === 10 ? 1000 : 1);
      const nowMs = Date.now();
      const ageSeconds = Math.abs(nowMs - timestampMs) / 1000;

      if (isNaN(timestampMs) || ageSeconds > toleranceSeconds) {
        return {
          isValid: false,
          reason: 'EXPIRED_TIMESTAMP',
          message: `Webhook timestamp expired or out of tolerance window (${Math.round(ageSeconds)}s > ${toleranceSeconds}s).`
        };
      }
    }

    // Compute expected signature over (timestamp.payload) or payload
    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const signedPayload = timestampHeader ? `${timestampHeader}.${bodyString}` : bodyString;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Clean provided signature (handling 'sha256=...' or raw hex)
    const normalizedSignature = signatureHeader.replace(/^sha256=/i, '').trim();

    if (normalizedSignature.length !== expectedSignature.length) {
      return {
        isValid: false,
        reason: 'INVALID_SIGNATURE',
        message: 'Webhook signature length mismatch.'
      };
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(normalizedSignature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );

    if (!isValid) {
      return {
        isValid: false,
        reason: 'INVALID_SIGNATURE',
        message: 'Computed HMAC-SHA256 signature does not match signature header.'
      };
    }

    return {
      isValid: true,
      reason: 'VALID',
      message: 'Webhook signature verified successfully.'
    };
  }
}
