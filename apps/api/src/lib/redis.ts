import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

class MemoryFallback {
  private cache = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<string> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.cache.delete(key)) count++;
    }
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$';
    const regex = new RegExp(regexStr);
    const result: string[] = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        result.push(key);
      }
    }
    return result;
  }
}

let redis: any;

if (redisUrl) {
  redis = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    }
  });
  redis.on('error', (err: any) => {
    console.error('[REDIS ERROR]:', err.message);
  });
} else {
  console.warn('[REDIS] REDIS_URL not set. Falling back to in-memory store.');
  redis = new MemoryFallback();
}

export default redis;
