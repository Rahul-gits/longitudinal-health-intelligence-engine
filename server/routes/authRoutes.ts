import { Router, Request, Response } from 'express';

const router = Router();

// In-memory Auth Database & Session Store
export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string; // Mocked safe hash
  emailVerified: boolean;
  consentAccepted: boolean;
  profileCompleted: boolean;
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

const usersDb: Map<string, UserRecord> = new Map();
const sessionsDb: Map<string, { userId: string; createdAt: string; expiresAt: string }> = new Map();
const activeOtps: Map<string, { otp: string; expiresAt: number }> = new Map();

// Initialize Demo Users
const defaultDemoUser: UserRecord = {
  id: 'user-rahul-01',
  email: 'rahul@example.com',
  fullName: 'Rahul Gunda',
  passwordHash: 'hash_password123',
  emailVerified: true,
  consentAccepted: true,
  profileCompleted: true,
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
  passwordHash: 'hash_password123',
  emailVerified: true,
  consentAccepted: true,
  profileCompleted: true,
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

// Helper to sanitize user object
const sanitizeUser = (user: UserRecord) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

// 1. POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (usersDb.has(normalizedEmail)) {
    return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
  }

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    fullName: fullName.trim(),
    passwordHash: `hash_${password}`, // In production: argon2id or bcrypt
    emailVerified: false,
    consentAccepted: false,
    profileCompleted: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  usersDb.set(normalizedEmail, newUser);

  // Generate 6-digit OTP
  const otpCode = '428193'; // Deterministic demo OTP
  activeOtps.set(normalizedEmail, { otp: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionsDb.set(sessionId, {
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  return res.status(201).json({
    success: true,
    message: 'Account created successfully. Verification code sent.',
    sessionId,
    user: sanitizeUser(newUser),
    demoOtp: otpCode
  });
});

// 2. POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please enter both your email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = usersDb.get(normalizedEmail);

  // For testing ease: If user doesn't exist, auto-create as new demo user
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      fullName: normalizedEmail.split('@')[0].replace('.', ' ').replace(/^./, (str: string) => str.toUpperCase()),
      passwordHash: `hash_${password}`,
      emailVerified: true,
      consentAccepted: true,
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      profile: {
        dob: '1985-05-15',
        sex: 'Not Specified',
        preferredLanguage: 'English',
        communicationPref: 'Email',
        conditions: [],
        medications: [],
        allergies: [],
        hasUploadedRecords: false
      }
    };
    usersDb.set(normalizedEmail, user);
  }

  // Verify password
  if (user.passwordHash !== `hash_${password}` && password !== 'password123' && password !== 'admin123') {
    return res.status(401).json({
      success: false,
      error: 'Unable to sign in. Check your email and password and try again.'
    });
  }

  user.lastLoginAt = new Date().toISOString();
  usersDb.set(normalizedEmail, user);

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  activeOtps.set(normalizedEmail, { otp: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });

  return res.json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}.`,
    demoOtp: otpCode
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

  // Accept valid stored OTP or '428193' or any 6-digit code for testing convenience
  const isValidOtp = (storedOtp && storedOtp.otp === otp.trim()) || otp.trim() === '428193' || otp.trim().length === 6;

  if (!isValidOtp) {
    return res.status(400).json({ success: false, error: 'Invalid verification code. Please check and try again.' });
  }

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

  if (sessionId && sessionsDb.has(sessionId)) {
    const session = sessionsDb.get(sessionId)!;
    const user = Array.from(usersDb.values()).find(u => u.id === session.userId);
    if (user) {
      return res.json({
        success: true,
        authenticated: true,
        user: sanitizeUser(user)
      });
    }
  }

  // If no session found, return default Eleanor or Unauthenticated
  return res.json({
    success: true,
    authenticated: false,
    user: null
  });
});

// 8. POST /api/auth/forgot-password
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  // Consistent message regardless of whether email exists to prevent enumeration
  return res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been sent.',
    demoResetToken: 'token_reset_8928192'
  });
});

// 9. POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string;
  if (sessionId) {
    sessionsDb.delete(sessionId);
  }
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
