import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisConnectionManager {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private connectionAttempted: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) return null; // stop reconnecting if not available
          return Math.min(times * 1000, 3000);
        },
        enableReadyCheck: true,
        lazyConnect: true
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('✓ [HEAL-REDIS] Redis client connected successfully.');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        if (!this.connectionAttempted) {
          console.warn(`[HEAL-REDIS] Redis connection notice: ${err.message}. Operating in resilient fallback mode.`);
          this.connectionAttempted = true;
        }
      });
    } catch (err: any) {
      this.isConnected = false;
      console.warn(`[HEAL-REDIS] Failed to construct Redis client: ${err.message}`);
    }
  }

  public async connect(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.connect();
      this.isConnected = true;
      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  public async checkConnection(): Promise<{ connected: boolean; status: string; error?: string }> {
    if (!this.client || !this.isConnected) {
      return { connected: false, status: 'DISCONNECTED_FALLBACK', error: 'Redis host unreachable' };
    }
    try {
      const ping = await this.client.ping();
      return { connected: ping === 'PONG', status: ping === 'PONG' ? 'OPERATIONAL' : 'DEGRADED' };
    } catch (err: any) {
      return { connected: false, status: 'DISCONNECTED_FALLBACK', error: err.message };
    }
  }

  public getClient(): Redis | null {
    return this.client;
  }

  public isOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Save job state to Redis
   */
  public async setJob(jobId: string, jobData: Record<string, any>, ttlSeconds = 86400): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.set(`heal:job:${jobId}`, JSON.stringify(jobData), 'EX', ttlSeconds);
    } catch (err: any) {
      console.warn(`[HEAL-REDIS] Error saving job ${jobId}:`, err.message);
    }
  }

  /**
   * Retrieve job state from Redis
   */
  public async getJob(jobId: string): Promise<Record<string, any> | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const data = await this.client.get(`heal:job:${jobId}`);
      return data ? JSON.parse(data) : null;
    } catch (err: any) {
      console.warn(`[HEAL-REDIS] Error getting job ${jobId}:`, err.message);
      return null;
    }
  }

  /**
   * Set idempotency key mapping
   */
  public async setIdempotency(key: string, jobId: string, ttlSeconds = 86400): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.set(`heal:idemp:${key}`, jobId, 'EX', ttlSeconds);
    } catch (err: any) {
      console.warn(`[HEAL-REDIS] Error storing idempotency key:`, err.message);
    }
  }

  /**
   * Retrieve idempotency key mapping
   */
  public async getIdempotency(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      return await this.client.get(`heal:idemp:${key}`);
    } catch {
      return null;
    }
  }
}

export const redisService = new RedisConnectionManager();
