import pg from 'pg';
import crypto from 'crypto';

export interface SessionData {
  userId: string;
  createdAt: string;
  expiresAt: string;
  mfaVerified?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory sessions store (exported for fast synchronous lookups and backward compatibility)
export const activeSessions: Map<string, SessionData> = new Map();

// Optional PostgreSQL Pool for session persistence
let pgPool: pg.Pool | null = null;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  try {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      ssl: process.env.DATABASE_SSL_MODE === 'require' ? { rejectUnauthorized: false } : undefined
    });
  } catch (err: any) {
    console.warn('[SESSION-STORE] Notice: PostgreSQL session store initialization skipped:', err.message);
  }
}

export class SessionStore {
  /**
   * Generates a cryptographically strong session identifier.
   */
  public static generateSessionId(): string {
    return `sess_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Creates and stores a session in both memory and PostgreSQL if available.
   */
  public static async createSession(
    userId: string,
    options: { mfaVerified?: boolean; ipAddress?: string; userAgent?: string; ttlDays?: number } = {}
  ): Promise<{ sessionId: string; session: SessionData }> {
    const sessionId = this.generateSessionId();
    const ttlDays = options.ttlDays ?? 7;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

    const session: SessionData = {
      userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      mfaVerified: options.mfaVerified,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent
    };

    // Store in active memory
    activeSessions.set(sessionId, session);

    // Persist to PostgreSQL if configured
    if (pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO user_sessions (sid, sess, expire)
           VALUES ($1, $2, $3)
           ON CONFLICT (sid) DO UPDATE SET sess = $2, expire = $3`,
          [sessionId, JSON.stringify(session), expiresAt]
        );
      } catch (err: any) {
        console.warn('[SESSION-STORE] PostgreSQL session save skipped:', err.message);
      }
    }

    return { sessionId, session };
  }

  /**
   * Retrieves a session, verifying expiry.
   */
  public static getSession(sessionId: string | null): SessionData | null {
    if (!sessionId) return null;
    const session = activeSessions.get(sessionId);
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      activeSessions.delete(sessionId);
      if (pgPool) {
        pgPool.query('DELETE FROM user_sessions WHERE sid = $1', [sessionId]).catch(() => {});
      }
      return null;
    }

    return session;
  }

  /**
   * Destroys a session on logout.
   */
  public static async destroySession(sessionId: string | null): Promise<void> {
    if (!sessionId) return;
    activeSessions.delete(sessionId);

    if (pgPool) {
      try {
        await pgPool.query('DELETE FROM user_sessions WHERE sid = $1', [sessionId]);
      } catch (err: any) {
        // Safe to ignore on cleanup
      }
    }
  }

  /**
   * Loads persisted sessions from PostgreSQL into memory on startup if connected.
   */
  public static async syncFromPostgres(): Promise<void> {
    if (!pgPool) return;
    try {
      const res = await pgPool.query(
        `SELECT sid, sess, expire FROM user_sessions WHERE expire > NOW()`
      );
      for (const row of res.rows) {
        try {
          const sess = typeof row.sess === 'string' ? JSON.parse(row.sess) : row.sess;
          activeSessions.set(row.sid, sess);
        } catch {
          // ignore corrupted single rows
        }
      }
      console.log(`[SESSION-STORE] Synced ${res.rows.length} active session(s) from PostgreSQL.`);
    } catch (err: any) {
      console.warn('[SESSION-STORE] Could not sync sessions from PostgreSQL:', err.message);
    }
  }
}

/**
 * Checks PostgreSQL connectivity for health and readiness probes.
 */
export async function checkDatabaseHealth(): Promise<{ connected: boolean; status: string; error?: string }> {
  if (!pgPool) {
    return { connected: false, status: 'NOT_CONFIGURED_MEMORY_FALLBACK' };
  }
  try {
    const client = await pgPool.connect();
    try {
      await client.query('SELECT 1');
      return { connected: true, status: 'CONNECTED' };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { connected: false, status: 'CONNECTION_FAILED', error: err.message };
  }
}
