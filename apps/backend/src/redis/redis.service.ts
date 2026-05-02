import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface CacheOptions {
  ttlSeconds?: number;
  skipCache?: boolean;
}

export interface MultiCacheItem<T = unknown> {
  key: string;
  value: T;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      console.log('[Redis] Initializing Upstash Redis connection (lazy)...');
      
      this.client = new Redis(redisUrl, {
        lazyConnect: true,          // Don't block startup
        maxRetriesPerRequest: 0,    // Don't retry commands on failure in dev
        connectTimeout: 2000,       // 2s timeout for connection
        commandTimeout: 2000,       // 2s timeout for commands
        enableReadyCheck: false,
        enableOfflineQueue: false,  // Fail immediately if disconnected
        retryStrategy: (times) => {
          // If we've tried once and failed, wait 60s before next attempt
          if (times > 0) {
            const now = Date.now();
            if (!this.lastRetryLogTime || now - this.lastRetryLogTime > 60000) {
              console.warn(`[Redis] Connection attempt ${times} failed. Retrying in 60s...`);
              this.lastRetryLogTime = now;
            }
            return 60000; 
          }
          return 2000;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      // Crucial: Handle ALL error events to prevent process crash
      this.client.on('error', (err) => {
        // Only log once every 5 minutes to prevent log spam in dev
        const now = Date.now();
        if (!this.lastErrorLogTime || now - this.lastErrorLogTime > 300000) {
          console.warn('[Redis] Connection issue detected. Features using cache may be slow or unavailable.', err.message);
          this.lastErrorLogTime = now;
        }
      });

      // Try an initial background connection but don't await it
      // Wrap in a try-catch just in case bun/node handles this differently
      try {
        this.client.connect().catch((err) => {
          // Error event listener will handle the logging
        });
      } catch (e) {
        // Ignore synchronous errors during connect call
      }
    } else {
      console.warn('[Redis] REDIS_URL not set. Falling back to memory cache simulation.');
    }
  }

  private lastErrorLogTime = 0;
  private lastRetryLogTime = 0;

  onModuleDestroy() {
    if (this.client) {
      this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`[Redis] Get failed for ${key}`, e);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (e) {
      console.error(`[Redis] Set failed for ${key}`, e);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (e) {
      console.error(`[Redis] Del failed for ${key}`, e);
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.incr(key);
    } catch (e) {
      console.error(`[Redis] Incr failed for ${key}`, e);
      return 0;
    }
  }

  async mget<T>(keys: string[]): Promise<Array<T | null>> {
    if (!this.client || keys.length === 0) return [];
    try {
      const values = await this.client.mget(...keys);
      return values.map((v) => (v ? (JSON.parse(v) as T) : null));
    } catch (e) {
      console.error('[Redis] MGet failed', e);
      return keys.map(() => null);
    }
  }

  async mset(items: MultiCacheItem[], ttlSeconds = 3600): Promise<void> {
    if (!this.client || items.length === 0) return;
    try {
      const pipeline = this.client.pipeline();
      for (const item of items) {
        pipeline.set(item.key, JSON.stringify(item.value), 'EX', ttlSeconds);
      }
      await pipeline.exec();
    } catch (e) {
      console.error('[Redis] MSet failed', e);
    }
  }

  async mdel(keys: string[]): Promise<void> {
    if (!this.client || keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch (e) {
      console.error('[Redis] MDel failed', e);
    }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.client) return 0;
    try {
      let count = 0;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
          count += keys.length;
        }
      } while (cursor !== '0');
      return count;
    } catch (e) {
      console.error(`[Redis] InvalidatePattern failed for ${pattern}`, e);
      return 0;
    }
  }

  async touch(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client) return false;
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (e) {
      console.error(`[Redis] Touch failed for ${key}`, e);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (e) {
      console.error(`[Redis] Exists failed for ${key}`, e);
      return false;
    }
  }

  async getTtl(key: string): Promise<number> {
    if (!this.client) return -1;
    try {
      return await this.client.ttl(key);
    } catch (e) {
      console.error(`[Redis] Ttl failed for ${key}`, e);
      return -1;
    }
  }

  async ping(): Promise<{ latencyMs: number; connected: boolean }> {
    if (!this.client) {
      return { latencyMs: -1, connected: false };
    }
    try {
      const start = Date.now();
      await this.client.ping();
      return { latencyMs: Date.now() - start, connected: true };
    } catch (e) {
      console.error('[Redis] Ping failed', e);
      return { latencyMs: -1, connected: false };
    }
  }

  async getInfo(): Promise<Record<string, string> | null> {
    if (!this.client) return null;
    try {
      const info = await this.client.info();
      const result: Record<string, string> = {};
      for (const line of info.split('\r\n')) {
        const [key, value] = line.split(':');
        if (key && value) result[key] = value;
      }
      return result;
    } catch (e) {
      console.error('[Redis] Info failed', e);
      return null;
    }
  }

  get isConnected(): boolean {
    return this.client !== null;
  }
}
