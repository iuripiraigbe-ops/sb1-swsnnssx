import { redis } from '../lib/redis.js';

export async function initializeRedis() {
  // Redis já está inicializado no lib/redis.ts
  // Apenas testa a conexão
  try {
    await redis.ping();
    console.log('✅ Redis service initialized');
    return redis;
  } catch (error) {
    console.error('❌ Failed to initialize Redis service:', error);
    throw error;
  }
}

// Helper functions for caching
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttl = 3600): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
}

export async function deleteCachedData(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Error deleting cached data:', error);
  }
}

// Video views and likes counters
export async function incrementVideoViews(videoId: string): Promise<number> {
  try {
    return await redis.incr(`video:${videoId}:views`);
  } catch (error) {
    console.error('Error incrementing video views:', error);
    return 0;
  }
}

export async function getVideoViews(videoId: string): Promise<number> {
  try {
    const views = await redis.get(`video:${videoId}:views`);
    return views ? parseInt(views) : 0;
  } catch (error) {
    console.error('Error getting video views:', error);
    return 0;
  }
}

export async function incrementVideoLikes(videoId: string): Promise<number> {
  try {
    return await redis.incr(`video:${videoId}:likes`);
  } catch (error) {
    console.error('Error incrementing video likes:', error);
    return 0;
  }
}

export async function decrementVideoLikes(videoId: string): Promise<number> {
  try {
    return await redis.decr(`video:${videoId}:likes`);
  } catch (error) {
    console.error('Error decrementing video likes:', error);
    return 0;
  }
}

export async function getVideoLikes(videoId: string): Promise<number> {
  try {
    const likes = await redis.get(`video:${videoId}:likes`);
    return likes ? parseInt(likes) : 0;
  } catch (error) {
    console.error('Error getting video likes:', error);
    return 0;
  }
}
