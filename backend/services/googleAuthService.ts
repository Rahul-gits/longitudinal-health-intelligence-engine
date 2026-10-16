import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

export interface GoogleUserProfile {
  googleSubject: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  pictureUrl?: string;
}

let oauth2Client: OAuth2Client | null = null;
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);
}

// Generate state secret for HMAC CSRF protection
const STATE_SECRET = process.env.SESSION_SECRET || 'dev_state_csrf_secret_heal_engine_2026';

export class GoogleAuthService {
  /**
   * Generates a tamper-proof state parameter with timestamp and HMAC signature.
   */
  public static generateState(): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();
    const data = `${nonce}:${timestamp}`;
    const signature = crypto.createHmac('sha256', STATE_SECRET).update(data).digest('hex');
    return Buffer.from(`${data}:${signature}`).toString('base64url');
  }

  /**
   * Verifies the state parameter to protect against CSRF and replay attacks.
   */
  public static verifyState(stateToken: string): boolean {
    try {
      const decoded = Buffer.from(stateToken, 'base64url').toString('utf8');
      const parts = decoded.split(':');
      if (parts.length !== 3) return false;

      const [nonce, timestampStr, signature] = parts;
      const data = `${nonce}:${timestampStr}`;
      const expectedSignature = crypto.createHmac('sha256', STATE_SECRET).update(data).digest('hex');

      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return false;
      }

      const timestamp = parseInt(timestampStr, 10);
      const MAX_STATE_AGE_MS = 10 * 60 * 1000; // 10 minutes
      if (isNaN(timestamp) || Date.now() - timestamp > MAX_STATE_AGE_MS) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates the Google OAuth authorization redirect URL.
   */
  public static getAuthorizationUrl(state: string): string {
    if (!oauth2Client) {
      oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);
    }

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'consent'
    });
  }

  /**
   * Exchanges authorization code for tokens and returns verified profile.
   */
  public static async exchangeCodeForProfile(code: string): Promise<GoogleUserProfile> {
    if (!oauth2Client) {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured on server');
      }
      oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);
    }

    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.id_token) {
      throw new Error('Google did not return an identity token');
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new Error('Incomplete profile payload returned by Google');
    }

    return {
      googleSubject: payload.sub,
      email: payload.email.toLowerCase().trim(),
      fullName: payload.name || payload.email.split('@')[0],
      emailVerified: !!payload.email_verified,
      pictureUrl: payload.picture
    };
  }

  /**
   * Verifies a client-side Google credential ID token (e.g. from Google One-Tap).
   */
  public static async verifyCredentialIdToken(idToken: string): Promise<GoogleUserProfile> {
    if (!oauth2Client) {
      oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new Error('Invalid or incomplete identity token');
    }

    return {
      googleSubject: payload.sub,
      email: payload.email.toLowerCase().trim(),
      fullName: payload.name || payload.email.split('@')[0],
      emailVerified: !!payload.email_verified,
      pictureUrl: payload.picture
    };
  }
}
