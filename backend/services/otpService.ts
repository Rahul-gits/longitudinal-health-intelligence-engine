import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import pg from 'pg';

export interface OtpRecord {
  id: string;
  emailNormalized: string;
  purpose: 'signup' | 'login' | 'verification';
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  createdAt: Date;
}

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS ?? 300);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

// Dev secret fallback for testing and non-production environments
const DEFAULT_DEV_HMAC_SECRET = '4b13a7c6e082ef738b55d9d71b86e8efca42f36f8749a973bbad1fa80c8541a7';

export function getOtpSecret(): string {
  const secret = process.env.OTP_HMAC_SECRET || (process.env.NODE_ENV !== 'production' ? DEFAULT_DEV_HMAC_SECRET : undefined);
  if (!secret) {
    throw new Error('OTP_HMAC_SECRET is not configured');
  }
  return secret;
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 */
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Hashes an OTP with HMAC-SHA256 tied specifically to the normalized email address.
 * Never stores or transmits plaintext OTP in database or logs.
 */
export function hashOtp(email: string, otp: string): string {
  const normalized = email.toLowerCase().trim();
  return createHmac('sha256', getOtpSecret())
    .update(`${normalized}:${otp.trim()}`)
    .digest('hex');
}

/**
 * Calculates expiration timestamp for newly issued OTP.
 */
export function otpExpiresAt(): Date {
  return new Date(Date.now() + OTP_TTL_SECONDS * 1000);
}

/**
 * Constant-time comparison between submitted and stored OTP hashes.
 * Prevents timing side-channel attacks.
 */
export function otpMatches(submittedHash: string, storedHash: string): boolean {
  try {
    const a = Buffer.from(submittedHash, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// In-memory backing store for OTP records
// Used when PostgreSQL is not configured or in memory/testing mode
const memoryOtpStore: Map<string, OtpRecord[]> = new Map();

// Optional PostgreSQL client pool
let pgPool: pg.Pool | null = null;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  try {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      ssl: process.env.DATABASE_SSL_MODE === 'require' ? { rejectUnauthorized: false } : undefined
    });
    pgPool.on('error', (err) => {
      console.warn('[OTP-SERVICE] PostgreSQL pool warning:', err.message);
    });
  } catch (err: any) {
    console.warn('[OTP-SERVICE] Notice: PostgreSQL initialization skipped:', err.message);
  }
}

export interface RequestOtpResult {
  allowed: boolean;
  cooldownRemainingSeconds?: number;
  otp?: string;
  error?: string;
}

export interface VerifyOtpResult {
  valid: boolean;
  status: 'SUCCESS' | 'EXPIRED' | 'ALREADY_CONSUMED' | 'INVALID_CODE' | 'TOO_MANY_ATTEMPTS' | 'NOT_FOUND';
  message: string;
  attemptsRemaining?: number;
}

export class OtpService {
  /**
   * Enforces resend cooldown and issues a new OTP record.
   */
  public static async requestOtp(
    email: string,
    purpose: 'signup' | 'login' | 'verification' = 'verification'
  ): Promise<RequestOtpResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    // Check PostgreSQL if pool is available and healthy
    if (pgPool) {
      try {
        const client = await pgPool.connect();
        try {
          // Check last created OTP for cooldown
          const recentRes = await client.query(
            `SELECT created_at FROM auth_email_otps 
             WHERE email_normalized = $1 AND purpose = $2 
             ORDER BY created_at DESC LIMIT 1`,
            [normalizedEmail, purpose]
          );

          if (recentRes.rows.length > 0) {
            const lastCreated = new Date(recentRes.rows[0].created_at);
            const elapsedSeconds = Math.floor((now.getTime() - lastCreated.getTime()) / 1000);
            if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
              return {
                allowed: false,
                cooldownRemainingSeconds: OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds,
                error: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds} second(s) before requesting another code.`
              };
            }
          }

          const otp = generateOtp();
          const hashed = hashOtp(normalizedEmail, otp);
          const expiry = otpExpiresAt();

          await client.query(
            `INSERT INTO auth_email_otps (email_normalized, purpose, otp_hash, expires_at, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [normalizedEmail, purpose, hashed, expiry, now]
          );

          return { allowed: true, otp };
        } finally {
          client.release();
        }
      } catch (err: any) {
        // Fall back to resilient in-memory store
        console.warn('[OTP-SERVICE] PostgreSQL query fell back to in-memory store:', err.message);
      }
    }

    // In-memory logic
    const history = memoryOtpStore.get(normalizedEmail) || [];
    const latest = history[history.length - 1];

    if (latest && !latest.consumedAt) {
      const elapsedSeconds = Math.floor((now.getTime() - latest.createdAt.getTime()) / 1000);
      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        return {
          allowed: false,
          cooldownRemainingSeconds: OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds,
          error: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds} second(s) before requesting another code.`
        };
      }
    }

    const otp = generateOtp();
    const hashed = hashOtp(normalizedEmail, otp);
    const expiry = otpExpiresAt();

    const record: OtpRecord = {
      id: `otp_${Date.now()}_${randomInt(1000, 9999)}`,
      emailNormalized: normalizedEmail,
      purpose,
      otpHash: hashed,
      expiresAt: expiry,
      attempts: 0,
      consumedAt: null,
      createdAt: now
    };

    history.push(record);
    memoryOtpStore.set(normalizedEmail, history);

    return { allowed: true, otp };
  }

  /**
   * Verifies and atomically consumes an OTP code.
   */
  public static async verifyOtp(
    email: string,
    submittedOtp: string,
    purpose?: 'signup' | 'login' | 'verification'
  ): Promise<VerifyOtpResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const submittedHash = hashOtp(normalizedEmail, submittedOtp);
    const now = new Date();

    // Check PostgreSQL if pool is active
    if (pgPool) {
      try {
        const client = await pgPool.connect();
        try {
          await client.query('BEGIN');

          const query = purpose
            ? `SELECT * FROM auth_email_otps 
               WHERE email_normalized = $1 AND purpose = $2 
               ORDER BY created_at DESC LIMIT 1 FOR UPDATE`
            : `SELECT * FROM auth_email_otps 
               WHERE email_normalized = $1 
               ORDER BY created_at DESC LIMIT 1 FOR UPDATE`;
          const params = purpose ? [normalizedEmail, purpose] : [normalizedEmail];

          const res = await client.query(query, params);
          if (res.rows.length === 0) {
            await client.query('ROLLBACK');
            return { valid: false, status: 'NOT_FOUND', message: 'No verification code found for this email.' };
          }

          const row = res.rows[0];

          // Check if already consumed
          if (row.consumed_at) {
            await client.query('ROLLBACK');
            return { valid: false, status: 'ALREADY_CONSUMED', message: 'This verification code has already been used.' };
          }

          // Check max attempts
          if (row.attempts >= OTP_MAX_ATTEMPTS) {
            await client.query('ROLLBACK');
            return { valid: false, status: 'TOO_MANY_ATTEMPTS', message: 'Maximum verification attempts exceeded. Please request a new code.' };
          }

          // Check expiration
          if (now > new Date(row.expires_at)) {
            await client.query('ROLLBACK');
            return { valid: false, status: 'EXPIRED', message: 'Verification code has expired. Please request a new code.' };
          }

          // Compare hash in constant time
          const matches = otpMatches(submittedHash, row.otp_hash);
          if (!matches) {
            const nextAttempts = row.attempts + 1;
            await client.query('UPDATE auth_email_otps SET attempts = $1 WHERE id = $2', [nextAttempts, row.id]);
            await client.query('COMMIT');
            return {
              valid: false,
              status: 'INVALID_CODE',
              message: 'Invalid verification code. Please check and try again.',
              attemptsRemaining: Math.max(0, OTP_MAX_ATTEMPTS - nextAttempts)
            };
          }

          // Mark consumed atomically
          await client.query('UPDATE auth_email_otps SET consumed_at = $1 WHERE id = $2', [now, row.id]);
          await client.query('COMMIT');

          return { valid: true, status: 'SUCCESS', message: 'Identity verified successfully.' };
        } catch (txErr) {
          await client.query('ROLLBACK');
          throw txErr;
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('[OTP-SERVICE] PostgreSQL verify failed, falling back to in-memory store:', err.message);
      }
    }

    // In-memory verification
    const history = memoryOtpStore.get(normalizedEmail) || [];
    const eligible = purpose
      ? history.filter(r => r.purpose === purpose)
      : history;

    const record = eligible[eligible.length - 1];

    if (!record) {
      return { valid: false, status: 'NOT_FOUND', message: 'No verification code found for this email.' };
    }

    if (record.consumedAt) {
      return { valid: false, status: 'ALREADY_CONSUMED', message: 'This verification code has already been used.' };
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return { valid: false, status: 'TOO_MANY_ATTEMPTS', message: 'Maximum verification attempts exceeded. Please request a new code.' };
    }

    if (now > record.expiresAt) {
      return { valid: false, status: 'EXPIRED', message: 'Verification code has expired. Please request a new code.' };
    }

    const matches = otpMatches(submittedHash, record.otpHash);
    if (!matches) {
      record.attempts += 1;
      return {
        valid: false,
        status: 'INVALID_CODE',
        message: 'Invalid verification code. Please check and try again.',
        attemptsRemaining: Math.max(0, OTP_MAX_ATTEMPTS - record.attempts)
      };
    }

    // Atomically consume
    record.consumedAt = now;
    return { valid: true, status: 'SUCCESS', message: 'Identity verified successfully.' };
  }

  /**
   * Resets active OTPs for an email (useful in testing)
   */
  public static clearOtpsForTesting(email?: string): void {
    if (email) {
      memoryOtpStore.delete(email.toLowerCase().trim());
    } else {
      memoryOtpStore.clear();
    }
  }
}
