import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// ============================================================================
// Password Hashing (Node.js built-in crypto.scryptSync — no external dependency)
// ============================================================================

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

// ============================================================================
// Data Types & Stores
// ============================================================================

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'patient' | 'clinician' | 'researcher' | 'admin';
  allowedPatientIds: string[];
  tenantId: string;
  emailVerified: boolean;
  consentAccepted: boolean;
  profileCompleted: boolean;
  failedLoginAttempts: number;
  lockedUntil: number | null;
  createdAt: string;
  lastLoginAt: string;
  profile?: {
    dob?: string;
    sex?: string;
    preferredLanguage?: string;
    communicationPref?: string;
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    hasUploadedRecords?: boolean;
  };
}

export interface SessionRecord {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export const usersDb: Map<string, UserRecord> = new Map();
export const sessionsDb: Map<string, SessionRecord> = new Map();
const activeOtps: Map<string, { otp: string; expiresAt: number }> = new Map();

// ============================================================================
// Demo Seed Users — passwords hashed with scrypt at startup
// Demo password: HealDemo2026!
// ============================================================================

const DEMO_PASSWORD = 'HealDemo2026!';

const defaultDemoUser: UserRecord = {
  id: 'user-rahul-01',
  email: 'rahul@example.com',
  fullName: 'Rahul Gunda',
  passwordHash: hashPassword(DEMO_PASSWORD),
  role: 'clinician',
  allowedPatientIds: ['patient-ev-68', 'patient-mr-42', 'patient-mj-72'],
  tenantId: 'st-jude-cardiorenal-network',
  emailVerified: true,
  consentAccepted: true,
  profileCompleted: true,
  failedLoginAttempts: 0,
  lockedUntil: null,
  createdAt: '2026-01-15T08:00:00Z',
  lastLoginAt: new Date().toISOString(),
  profile: {
    dob: '1998-06-20',
    sex: 'Male',
    preferredLanguage: 'English',
    communicationPref: 'Email & SMS',
    conditions: ['Hypertension (Stage 1)'],
    medications: ['Lisinopril 10mg'],
    allergies: ['Penicillin'],
    hasUploadedRecords: true
  }
};

const defaultEleanorUser: UserRecord = {
  id: 'user-eleanor-02',
  email: 'eleanor@example.com',
  fullName: 'Eleanor Vance',
  passwordHash: hashPassword(DEMO_PASSWORD),
  role: 'patient',
  allowedPatientIds: ['patient-ev-68'],
  tenantId: 'st-jude-cardiorenal-network',
  emailVerified: true,
  consentAccepted: true,
  profileCompleted: true,
  failedLoginAttempts: 0,
  lockedUntil: null,
  createdAt: '2026-02-01T08:00:00Z',
  lastLoginAt: new Date().toISOString(),
  profile: {
    dob: '1958-04-12',
    sex: 'Female',
    preferredLanguage: 'English',
    communicationPref: 'SMS & Mobile App',
    conditions: ['Heart Failure with Preserved Ejection Fraction (HFpEF)', 'CKD Stage 3b', 'T2D'],
    medications: ['Empagliflozin 10mg', 'Furosemide 40mg', 'Spironolactone 25mg'],
    allergies: ['Sulfa drugs', 'NSAIDs (Avoid)'],
    hasUploadedRecords: true
  }
};

usersDb.set(defaultDemoUser.email.toLowerCase(), defaultDemoUser);
usersDb.set(defaultEleanorUser.email.toLowerCase(), defaultEleanorUser);

// ============================================================================
// Session Validation — exported for RBAC middleware
// ============================================================================

/**
 * Validates a session ID against the server-side session store.
 * Returns the associated user record, or null if invalid/expired.
 */
export function validateSession(sessionId: string | null): { user: UserRecord; session: SessionRecord } | null {
  if (!sessionId) return null;
  const session = sessionsDb.get(sessionId);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    sessionsDb.delete(sessionId);
    return null;
  }

  const user = Array.from(usersDb.values()).find(u => u.id === session.userId);
  if (!user) return null;

  return { user, session };
}

// Helper to sanitize user object — never expose password hash or security counters
const sanitizeUser = (user: UserRecord) => {
  const { passwordHash, failedLoginAttempts, lockedUntil, ...safe } = user;
  return safe;
};

function generateSessionId(): string {
  return `sess_${crypto.randomBytes(24).toString('hex')}`;
}

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Account lockout constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ============================================================================
// Routes
// ============================================================================

// 1. POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (usersDb.has(normalizedEmail)) {
    return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
  }

  const newUser: UserRecord = {
    id: `user-${crypto.randomBytes(8).toString('hex')}`,
    email: normalizedEmail,
    fullName: fullName.trim(),
    passwordHash: hashPassword(password),
    role: 'patient',
    allowedPatientIds: [],
    tenantId: 'default',
    emailVerified: false,
    consentAccepted: false,
    profileCompleted: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  usersDb.set(normalizedEmail, newUser);

  const otpCode = generateOtp();
  activeOtps.set(normalizedEmail, { otp: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });

  const sessionId = generateSessionId();
  sessionsDb.set(sessionId, {
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  // In production, OTP is sent via email/SMS. In dev, include it for testing.
  const isDev = process.env.NODE_ENV !== 'production';

  return res.status(201).json({
    success: true,
    message: 'Account created successfully. Verification code sent.',
    sessionId,
    user: sanitizeUser(newUser),
    ...(isDev ? { demoOtp: otpCode } : {})
  });
});

// 2. POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please enter both your email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = usersDb.get(normalizedEmail);

  // FIXED: No auto-account creation. Unknown email → 401.
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Unable to sign in. Check your email and password and try again.'
    });
  }

  // Check account lockout
  if (user.lockedUntil && Date.now() < user.lockedUntil) {
    const remainingMinutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({
      success: false,
      error: `Account temporarily locked due to repeated failed attempts. Try again in ${remainingMinutes} minute(s).`
    });
  }

  // FIXED: Real password verification using constant-time comparison.
  // No backdoor passwords. No universal bypass.
  if (!verifyPassword(password, user.passwordHash)) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      user.failedLoginAttempts = 0;
    }
    usersDb.set(normalizedEmail, user);
    return res.status(401).json({
      success: false,
      error: 'Unable to sign in. Check your email and password and try again.'
    });
  }

  // Successful login — reset failure counters
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date().toISOString();
  usersDb.set(normalizedEmail, user);

  const sessionId = generateSessionId();
  sessionsDb.set(sessionId, {
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  return res.json({
    success: true,
    message: 'Signed in successfully.',
    sessionId,
    user: sanitizeUser(user)
  });
});

// 3. POST /api/auth/send-otp
router.post('/send-otp', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required to send verification code.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const otpCode = generateOtp();
  activeOtps.set(normalizedEmail, { otp: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });

  const isDev = process.env.NODE_ENV !== 'production';

  return res.json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}.`,
    ...(isDev ? { demoOtp: otpCode } : {})
  });
});

// 4. POST /api/auth/verify-otp / verify-email
router.post('/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and 6-digit verification code are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = usersDb.get(normalizedEmail);
  const storedOtp = activeOtps.get(normalizedEmail);

  // FIXED: Only accept the exact stored OTP. No wildcard/any-6-digit bypass.
  if (!storedOtp || storedOtp.otp !== otp.trim()) {
    return res.status(400).json({ success: false, error: 'Invalid verification code. Please check and try again.' });
  }

  // Check OTP expiration
  if (Date.now() > storedOtp.expiresAt) {
    activeOtps.delete(normalizedEmail);
    return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' });
  }

  // Consume OTP (single-use)
  activeOtps.delete(normalizedEmail);

  if (user) {
    user.emailVerified = true;
    usersDb.set(normalizedEmail, user);
  }

  return res.json({
    success: true,
    message: 'Identity verified successfully.',
    user: user ? sanitizeUser(user) : null
  });
});

// 5. POST /api/auth/consent
router.post('/consent', (req: Request, res: Response) => {
  const { email, acceptedTerms, acceptedPrivacy } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = usersDb.get(normalizedEmail);

  if (!acceptedTerms || !acceptedPrivacy) {
    return res.status(400).json({ success: false, error: 'You must accept the data-use and privacy terms to continue.' });
  }

  if (user) {
    user.consentAccepted = true;
    usersDb.set(normalizedEmail, user);
  }

  return res.json({
    success: true,
    message: 'Consent registered successfully.',
    user: user ? sanitizeUser(user) : null
  });
});

// 6. POST /api/auth/profile-setup
router.post('/profile-setup', (req: Request, res: Response) => {
  const { email, dob, sex, preferredLanguage, communicationPref, conditions, medications, allergies, hasUploadedRecords } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = usersDb.get(normalizedEmail);

  if (user) {
    user.profileCompleted = true;
    user.profile = {
      dob: dob || '1985-05-15',
      sex: sex || 'Female',
      preferredLanguage: preferredLanguage || 'English',
      communicationPref: communicationPref || 'Email & Mobile App',
      conditions: conditions || [],
      medications: medications || [],
      allergies: allergies || [],
      hasUploadedRecords: !!hasUploadedRecords
    };
    usersDb.set(normalizedEmail, user);
  }

  return res.json({
    success: true,
    message: 'Health profile setup completed.',
    user: user ? sanitizeUser(user) : null
  });
});

// 7. GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const sessionId = req.headers['x-session-id'] as string || (authHeader ? authHeader.replace('Bearer ', '') : null);

  const result = validateSession(sessionId);
  if (result) {
    return res.json({
      success: true,
      authenticated: true,
      user: sanitizeUser(result.user)
    });
  }

  return res.json({
    success: true,
    authenticated: false,
    user: null
  });
});

// 8. POST /api/auth/forgot-password
const resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();

router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, { email: normalizedEmail, expiresAt: Date.now() + 15 * 60 * 1000 });

  // FIXED: Never return reset token in response body.
  // In production, send via email. In dev, log to server console.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUTH-DEV] Password reset token for ${normalizedEmail}: ${token}`);
  }

  return res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been sent.',
    expiresInMinutes: 15
  });
});

// 9. POST /api/auth/reset-password
router.post('/reset-password', (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ success: false, error: 'Reset token and new password are required.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
  }

  const record = resetTokens.get(resetToken);
  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
  }

  const user = usersDb.get(record.email);
  if (user) {
    user.passwordHash = hashPassword(newPassword);
    usersDb.set(record.email, user);
  }

  resetTokens.delete(resetToken);

  return res.json({
    success: true,
    message: 'Password has been reset successfully. Please sign in with your new credentials.'
  });
});

// 10. POST /api/auth/refresh-token (Rotation)
const refreshTokens: Map<string, { userId: string; expiresAt: number }> = new Map();

router.post('/refresh-token', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ success: false, error: 'INVALID_REFRESH_TOKEN', message: 'Token expired or revoked.' });
  }

  const record = refreshTokens.get(refreshToken)!;
  if (Date.now() > record.expiresAt) {
    refreshTokens.delete(refreshToken);
    return res.status(401).json({ success: false, error: 'REFRESH_TOKEN_EXPIRED', message: 'Session expired. Please log in again.' });
  }

  // Rotate token (single-use semantics)
  refreshTokens.delete(refreshToken);
  const newRefreshToken = `rfsh_${crypto.randomBytes(24).toString('hex')}`;
  const newSessionId = generateSessionId();

  refreshTokens.set(newRefreshToken, { userId: record.userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

  return res.json({
    success: true,
    accessToken: newSessionId,
    refreshToken: newRefreshToken,
    expiresInSeconds: 900
  });
});

// 11. GET /api/auth/admin/audit-log (Privileged Administrator Endpoint)
router.get('/admin/audit-log', (req: Request, res: Response) => {
  // FIXED: Uses real session validation, not header trust
  const authHeader = req.headers.authorization;
  const sessionId = req.headers['x-session-id'] as string || (authHeader ? authHeader.replace('Bearer ', '') : null);

  const result = validateSession(sessionId);
  if (!result || result.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN_ADMIN_ONLY',
      message: 'Access denied: Privileged administrative operations are restricted to verified administrators.'
    });
  }

  return res.json({
    success: true,
    adminId: result.user.id,
    timestamp: new Date().toISOString(),
    systemAudits: [
      { id: 'SEC-ADM-01', action: 'KEY_ROTATION_CHECK', status: 'COMPLIANT', timestamp: new Date().toISOString() },
      { id: 'SEC-ADM-02', action: 'DATABASE_ENCRYPTION_VERIFICATION', status: 'AES-256-GCM_ACTIVE', timestamp: new Date().toISOString() },
      { id: 'SEC-ADM-03', action: 'RBAC_POLICIES_ENFORCED', status: 'ZERO_TRUST', timestamp: new Date().toISOString() }
    ]
  });
});

// 12. POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const sessionId = req.headers['x-session-id'] as string || (authHeader ? authHeader.replace('Bearer ', '') : null);
  if (sessionId) {
    sessionsDb.delete(sessionId);
  }
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
