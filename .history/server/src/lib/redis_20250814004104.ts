import Redis from 'ioredis';

const url = process.env.REDIS_URL;
if (!url) {
  throw new Error('REDIS_URL ausente (precisa do rediss:// da Upstash)');
}

export const redis = new Redis(url, {
  // Upstash já usa TLS no rediss://
  maxRetriesPerRequest: null, // BullMQ recomenda isso p/ compatibilidade
  enableReadyCheck: true,
} as any);

// Event handlers para debugging
redis.on('connect', () => {
  console.log('✅ Redis conectado');
});

redis.on('error', (error) => {
  console.error('❌ Erro no Redis:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis desconectado');
});
