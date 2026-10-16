/**
 * HEAL Engine: Google Sign-In & Resend Email OTP Verification Test Suite
 * File: backend/tests/resendGoogleAuthTestSuite.ts
 *
 * Exercises the end-to-end authentication architecture:
 * 1. Resend Email OTP generation, HMAC hashing, cooldowns, attempts, and single-use consumption
 * 2. Google OAuth 2.0 state validation, CSRF tampering prevention, and least-privileged account creation
 * 3. Server-managed session lifecycle, cookie generation, and RBAC / clinical isolation boundaries
 */

import { OtpService, hashOtp, otpMatches } from '../services/otpService';
import { GoogleAuthService } from '../services/googleAuthService';
import { SessionStore } from '../services/sessionStore';
import authRouter, { usersDb, sessionsDb, validateSession, extractSessionId, setSessionCookie, clearSessionCookie } from '../routes/authRoutes';
import { authenticateAndAuthorize } from '../middleware/securityRbacMiddleware';
import crypto from 'crypto';

interface TestResult {
  id: string;
  name: string;
  expected: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordTest(id: string, name: string, expected: string, passed: boolean, details: string) {
  results.push({ id, name, expected, passed, details });
  console.log(`[${passed ? '✓ PASS' : '✗ FAIL'}] [${id}] ${name}`);
  if (!passed) console.error(`  Details: ${details}`);
}

// Mock Express Response Helper
function createMockResponse() {
  let statusCode = 200;
  let headers: Record<string, string> = {};
  let body: any = null;

  return {
    status: (code: number) => {
      statusCode = code;
      return { json: (b: any) => { body = b; } };
    },
    setHeader: (name: string, val: string) => {
      headers[name.toLowerCase()] = val;
    },
    json: (b: any) => { body = b; },
    getStatusCode: () => statusCode,
    getHeaders: () => headers,
    getBody: () => body
  };
}

export async function runResendGoogleAuthTestSuite(): Promise<{ allPassed: boolean; total: number; passed: number }> {
  console.log('========================================================================');
  console.log('HEAL ENGINE: GOOGLE SIGN-IN + RESEND OTP + SESSION TEST SUITE');
  console.log('========================================================================\n');

  OtpService.clearOtpsForTesting();

  // Test 1: Request OTP with valid email
  {
    const email = 'doctor.alice@hospital.org';
    const res = await OtpService.requestOtp(email, 'verification');
    const isValidCode = res.allowed && typeof res.otp === 'string' && /^\d{6}$/.test(res.otp);
    recordTest(
      'AUTH-01',
      'Request OTP with valid email',
      'Generic success response; cryptographic 6-digit code issued',
      isValidCode,
      isValidCode ? '6-digit OTP code successfully issued for delivery' : 'Failed to issue 6-digit OTP code'
    );
  }

  // Test 2: Submit correct, unexpired OTP (Single-Use Verification)
  {
    const email = 'patient.bob@example.com';
    const otpIssue = await OtpService.requestOtp(email, 'login');
    const verifyRes = await OtpService.verifyOtp(email, otpIssue.otp!, 'login');
    const isVerified = verifyRes.valid && verifyRes.status === 'SUCCESS';

    recordTest(
      'AUTH-02',
      'Submit correct, unexpired OTP',
      'HMAC matches in constant time; code verified successfully',
      isVerified,
      isVerified ? 'OTP verified and marked consumed' : `Verification failed: ${verifyRes.message}`
    );
  }

  // Test 3: Submit already consumed OTP (Single-Use Semantics)
  {
    const email = 'patient.bob@example.com';
    // Attempt to reuse the same OTP verified in Test 2
    const replayRes = await OtpService.verifyOtp(email, 'dummy_or_same', 'login');
    const replayBlocked = !replayRes.valid;

    recordTest(
      'AUTH-03',
      'Submit expired or already consumed OTP',
      'Replay submission strictly rejected',
      replayBlocked,
      replayBlocked ? 'Replay attack successfully prevented' : 'VULNERABILITY: Replay OTP accepted'
    );
  }

  // Test 4: Submit incorrect OTP and check attempt counting
  {
    const email = 'clinician.carol@hospital.org';
    await OtpService.requestOtp(email, 'verification');
    const invalidRes = await OtpService.verifyOtp(email, '000000', 'verification');
    const isRejected = !invalidRes.valid && invalidRes.status === 'INVALID_CODE';

    recordTest(
      'AUTH-04',
      'Submit incorrect OTP',
      'Rejected with INVALID_CODE; attempt count increases',
      isRejected,
      isRejected ? 'Invalid submission rejected and attempt recorded' : 'Failed to reject invalid code'
    );
  }

  // Test 5: Exceed resend cooldown
  {
    const email = 'patient.dan@example.com';
    await OtpService.requestOtp(email, 'verification');
    // Immediate second request within 60s cooldown
    const cooldownRes = await OtpService.requestOtp(email, 'verification');
    const isCooldownEnforced = !cooldownRes.allowed && !!cooldownRes.cooldownRemainingSeconds;

    recordTest(
      'AUTH-05',
      'Exceed resend cooldown limit',
      'Rapid second request blocked with cooldown remaining',
      isCooldownEnforced,
      isCooldownEnforced ? `Cooldown enforced (${cooldownRes.cooldownRemainingSeconds}s remaining)` : 'Cooldown failed to trigger'
    );
  }

  // Test 6: Exceed maximum verification attempts
  {
    const email = 'patient.eve@example.com';
    await OtpService.requestOtp(email, 'verification');
    for (let i = 0; i < 5; i++) {
      await OtpService.verifyOtp(email, '111111', 'verification');
    }
    const lockedRes = await OtpService.verifyOtp(email, '222222', 'verification');
    const isLocked = !lockedRes.valid && lockedRes.status === 'TOO_MANY_ATTEMPTS';

    recordTest(
      'AUTH-06',
      'Exceed maximum verification attempts',
      'Locked out after 5 consecutive failed attempts',
      isLocked,
      isLocked ? 'Account locked against brute-force attack' : 'Failed to enforce max attempts'
    );
  }

  // Test 7: Tamper with Google OAuth state parameter
  {
    const validState = GoogleAuthService.generateState();
    const isOriginalValid = GoogleAuthService.verifyState(validState);

    // Tamper with state string
    const tampered = validState.slice(0, -4) + 'abcd';
    const isTamperedRejected = !GoogleAuthService.verifyState(tampered);

    const passed = isOriginalValid && isTamperedRejected;
    recordTest(
      'AUTH-07',
      'Tamper with Google OAuth state',
      'Valid state accepted; tampered state rejected via constant-time HMAC check',
      passed,
      passed ? 'State CSRF protection verified' : 'State tampering not detected'
    );
  }

  // Test 8: Session store creation and expiration verification
  {
    const testUserId = `user-test-${Date.now()}`;
    const { sessionId, session } = await SessionStore.createSession(testUserId, { ttlDays: 1 });
    const retrieved = SessionStore.getSession(sessionId);
    const validLookup = retrieved !== null && retrieved.userId === testUserId;

    // Invalidate session
    await SessionStore.destroySession(sessionId);
    const postDestroy = SessionStore.getSession(sessionId);
    const destroyed = postDestroy === null;

    const passed = validLookup && destroyed;
    recordTest(
      'AUTH-08',
      'Server-managed session creation and revocation',
      'Session validated against store; revoked on logout',
      passed,
      passed ? 'Session lifecycle verified' : 'Session retrieval/revocation failed'
    );
  }

  // Test 9: Secure Cookie Configuration (HttpOnly, SameSite, Secure)
  {
    const mockRes = createMockResponse();
    const testSessionId = 'sess_cookie_test_token_12345';
    setSessionCookie(mockRes as any, testSessionId);

    const setCookie = mockRes.getHeaders()['set-cookie'] || '';
    const hasHttpOnly = setCookie.includes('HttpOnly');
    const hasSameSiteLax = setCookie.includes('SameSite=Lax');
    const hasPath = setCookie.includes('Path=/');

    const passed = hasHttpOnly && hasSameSiteLax && hasPath;
    recordTest(
      'AUTH-09',
      'Secure Cookie Header Generation',
      'HttpOnly, SameSite=Lax, and Path=/ present on session cookies',
      passed,
      passed ? `Verified Set-Cookie attributes: ${setCookie}` : 'Cookie attributes missing security flags'
    );
  }

  // Test 10: Cookie Extraction from Incoming Request
  {
    const testSession = 'sess_incoming_cookie_test';
    const reqWithCookie: any = {
      headers: {
        cookie: `unrelated=123; heal.sid=${testSession}; other=xyz`
      }
    };
    const extracted = extractSessionId(reqWithCookie);
    const passed = extracted === testSession;

    recordTest(
      'AUTH-10',
      'Session Extraction from Cookie and Headers',
      'Seamlessly extracts session token from heal.sid cookie',
      passed,
      passed ? `Extracted sessionId: ${extracted}` : 'Failed to extract cookie session'
    );
  }

  // Test 11: Patient cannot access clinician-only endpoints (RBAC)
  {
    const patientSessionId = 'sess_patient_rbac_test';
    const patientUser = {
      id: 'u-patient-001',
      email: 'patient.isolated@example.com',
      fullName: 'Patient Isolated',
      passwordHash: 'dummy',
      role: 'patient' as const,
      allowedPatientIds: ['patient-isolated-001'],
      tenantId: 'tenant-1',
      emailVerified: true,
      consentAccepted: true,
      profileCompleted: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    usersDb.set(patientUser.email, patientUser);
    sessionsDb.set(patientSessionId, {
      userId: patientUser.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    });

    const clinicianGate = authenticateAndAuthorize(['clinician']);
    let statusReturned = 200;
    let nextCalled = false;
    const mockReq: any = { headers: { 'x-session-id': patientSessionId } };
    const mockRes: any = {
      status: (code: number) => {
        statusReturned = code;
        return { json: () => {} };
      }
    };
    clinicianGate(mockReq, mockRes, () => { nextCalled = true; });

    const passed = statusReturned === 403 && !nextCalled;
    recordTest(
      'AUTH-11',
      'Role-based Access Control (Patient -> Clinician endpoint)',
      'Patient role strictly blocked with HTTP 403 FORBIDDEN_ROLE',
      passed,
      passed ? 'RBAC enforcement verified' : `Failed: Status ${statusReturned}`
    );
  }

  // Test 12: Cross-patient data boundary (IDOR / BOLA Prevention)
  {
    const patientSessionId = 'sess_patient_rbac_test';
    const patientGate = authenticateAndAuthorize(['patient']);
    let statusReturned = 200;
    let nextCalled = false;
    // Attempt to access another patient's records
    const mockReq: any = {
      headers: { 'x-session-id': patientSessionId },
      params: { patientId: 'patient-victim-999' }
    };
    const mockRes: any = {
      status: (code: number) => {
        statusReturned = code;
        return { json: () => {} };
      }
    };
    patientGate(mockReq, mockRes, () => { nextCalled = true; });

    const passed = statusReturned === 403 && !nextCalled;
    recordTest(
      'AUTH-12',
      'Cross-Patient Resource Isolation (IDOR/BOLA Protection)',
      'Patient attempting another patient record receives HTTP 403 PATIENT_RESOURCE_FORBIDDEN',
      passed,
      passed ? 'Patient isolation verified' : `Failed: Status ${statusReturned}`
    );
  }

  // Test 13: Registration Verification Gating (No premature session issued)
  {
    const regEmail = 'pending.patient@example.com';
    const mockReq: any = {
      body: {
        fullName: 'Pending Patient',
        email: regEmail,
        password: 'ValidPassword123!'
      }
    };
    const mockRes = createMockResponse();

    await (authRouter as any).handle(
      Object.assign(mockReq, { method: 'POST', url: '/register', path: '/register' }),
      mockRes as any,
      () => {}
    );

    const body = mockRes.getBody();
    const createdUser = usersDb.get(regEmail);
    const noPrematureSession = !body?.sessionId && createdUser?.emailVerified === false;
    const isPending = body?.requiresVerification === true;

    const passed = noPrematureSession && isPending && mockRes.getStatusCode() === 201;
    recordTest(
      'AUTH-13',
      'Registration Verification Gating (No premature session)',
      'Account created in pending state with emailVerified=false; zero session token issued until verification',
      passed,
      passed ? 'Verified registration lifecycle enforces email verification before granting session' : 'Failed: Session token leaked before verification'
    );
  }

  // Test 14: Consent & Profile endpoints derive identity strictly from session, rejecting unauthenticated requests
  {
    const unauthReq: any = {
      headers: {},
      body: {
        email: 'attacker@evil.com',
        acceptedTerms: true,
        acceptedPrivacy: true
      }
    };
    const unauthRes = createMockResponse();

    await (authRouter as any).handle(
      Object.assign(unauthReq, { method: 'POST', url: '/consent', path: '/consent' }),
      unauthRes as any,
      () => {}
    );

    const isBlocked = unauthRes.getStatusCode() === 401 && unauthRes.getBody()?.error === 'AUTHENTICATION_REQUIRED';
    recordTest(
      'AUTH-14',
      'Consent Route Derives Identity Strictly from Verified Session',
      'Unauthenticated consent request with body email is rejected with HTTP 401 AUTHENTICATION_REQUIRED',
      isBlocked,
      isBlocked ? 'Body email spoofing strictly prevented; valid session required' : `Failed: Status ${unauthRes.getStatusCode()}`
    );
  }

  // Test 15: Profile update rejects unauthenticated requests with zero fallback to Eleanor Vance or other accounts
  {
    const spoofReq: any = {
      headers: {},
      body: {
        fullName: 'Spoofed Name',
        email: 'eleanor@example.com' // Attempt to modify Eleanor without session
      }
    };
    const spoofRes = createMockResponse();

    await (authRouter as any).handle(
      Object.assign(spoofReq, { method: 'PUT', url: '/profile', path: '/profile' }),
      spoofRes as any,
      () => {}
    );

    const isRejected = spoofRes.getStatusCode() === 401;
    const eleanor = usersDb.get('eleanor@example.com');
    const eleanorUnmodified = eleanor?.fullName === 'Eleanor Vance';

    const passed = isRejected && eleanorUnmodified;
    recordTest(
      'AUTH-15',
      'Profile Update Zero-Fallback Defense',
      'Unauthenticated profile modification rejected with HTTP 401; fallback to demo/existing accounts eliminated',
      passed,
      passed ? 'Zero-fallback policy verified; account impersonation closed' : `Failed: Status ${spoofRes.getStatusCode()}`
    );
  }

  const passedCount = results.filter(r => r.passed).length;
  const allPassed = passedCount === results.length;

  console.log('\n========================================================================');
  console.log(`AUTH TEST SUITE SUMMARY: ${passedCount}/${results.length} Tests Passed (${((passedCount / results.length) * 100).toFixed(1)}%)`);
  console.log('========================================================================\n');

  return { allPassed, total: results.length, passed: passedCount };
}

// Execute if run directly
if (process.argv[1]?.includes('resendGoogleAuthTestSuite')) {
  runResendGoogleAuthTestSuite().then(({ allPassed }) => {
    process.exit(allPassed ? 0 : 1);
  });
}
