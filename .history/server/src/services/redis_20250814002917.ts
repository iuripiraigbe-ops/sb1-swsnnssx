import Redis from 'ioredis';

let redis: Redis;

export async function initializeRedis() {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

  redis.on('connect', () => {
    console.log('Connected to Redis');
  });

  return redis;
}

export function getRedis() {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
}

// Cache helpers
export async function getCached<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

export async function setCached(key: string, value: any, ttl = 3600): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function deleteCached(key: string): Promise<void> {
  await redis.del(key);
}

// Video stats helpers
export async function incrementVideoViews(videoId: string): Promise<number> {
  const key = `video:${videoId}:views`;
  return await redis.incr(key);
}

export async function incrementVideoLikes(videoId: string): Promise<number> {
  const key = `video:${videoId}:likes`;
  return await redis.incr(key);
}

export async function decrementVideoLikes(videoId: string): Promise<number> {
  const key = `video:${videoId}:likes`;
  return await redis.decr(key);
}

export async function getVideoStats(videoId: string) {
  const [views, likes] = await Promise.all([
    redis.get(`video:${videoId}:views`),
    redis.get(`video:${videoId}:likes`),
  ]);

  return {
    views: parseInt(views || '0'),
    likes: parseInt(likes || '0'),
  };
}
