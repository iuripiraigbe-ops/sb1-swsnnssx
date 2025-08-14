import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

// Import routes
import { authRoutes } from './routes/auth/index.js';
import { videoRoutes } from './routes/videos/index.js';
import { userRoutes } from './routes/users/index.js';
import { topicRoutes } from './routes/topics/index.js';

// Import middleware
import { authenticate } from './middleware/auth.js';

// Import services
import { initializeRedis } from './services/redis.js';
import { initializeWebSocket } from './services/websocket.js';

const prisma = new PrismaClient();
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret',
});

await fastify.register(multipart, {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '100000000'), // 100MB
  },
});

await fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
});



// Register routes
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(videoRoutes, { prefix: '/videos' });
await fastify.register(userRoutes, { prefix: '/users' });
await fastify.register(topicRoutes, { prefix: '/topics' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Protected route example
fastify.get('/me', { preHandler: authenticate }, async (request) => {
  const user = await prisma.user.findUnique({
    where: { id: (request.user as any).userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      professorProfile: {
        select: {
          specialties: true,
          verified: true,
          links: true,
        },
      },
    },
  });

  return user;
});

// Initialize services
await initializeRedis();
await initializeWebSocket(fastify);

// Graceful shutdown
const gracefulShutdown = async () => {
  fastify.log.info('Shutting down gracefully...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
