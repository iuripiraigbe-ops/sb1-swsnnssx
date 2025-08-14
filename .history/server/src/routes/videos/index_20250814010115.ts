import { FastifyInstance } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  CreateVideoSchema, 
  CreateCommentSchema, 
  CreateReportSchema,
  FeedQuerySchema 
} from '../../types/index.js';
import { authenticate, requireProfessor, optionalAuth } from '../../middleware/auth.js';
import { LocalTranscoder } from '../../services/transcoder.js';
import { addTranscodeJob } from '../../queues/transcode.js';
import { broadcastView, broadcastLike, broadcastComment } from '../../services/websocket.js';
import { incrementVideoViews, incrementVideoLikes, decrementVideoLikes } from '../../services/redis.js';
import { prisma } from '../../lib/db.js';
const transcoder = new LocalTranscoder();

export async function videoRoutes(fastify: FastifyInstance) {
  // Import and register feed routes
  const { feedRoutes } = await import('./feed.js');
  await feedRoutes(fastify);
  // Upload video
  fastify.post('/', { preHandler: [authenticate, requireProfessor] }, async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({
          error: 'Arquivo não fornecido',
          message: 'Envie um arquivo de vídeo',
        });
      }
      
      const body = CreateVideoSchema.parse({
        title: (data.fields.title as any)?.value,
        description: (data.fields.description as any)?.value,
        tags: (data.fields.tags as any)?.value ? JSON.parse((data.fields.tags as any).value) : [],
      });
      
      // Validate file type
      if (!data.mimetype.startsWith('video/')) {
        return reply.status(400).send({
          error: 'Tipo de arquivo inválido',
          message: 'Apenas arquivos de vídeo são aceitos',
        });
      }
      
      // Save uploaded file
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filename = `${Date.now()}_${data.filename}`;
      const filePath = path.join(uploadDir, filename);
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, await data.toBuffer());
      
      // Validate video duration using ffprobe
      const isValid = await transcoder.validate(filePath);
      if (!isValid) {
        await fs.unlink(filePath);
        return reply.status(400).send({
          error: 'Vídeo muito longo',
          message: 'O vídeo deve ter no máximo 90 segundos',
        });
      }
      
      // Create video record
      const video = await prisma.video.create({
        data: {
          authorId: request.user.userId,
          title: body.title,
          description: body.description,
          tags: body.tags,
          durationSec: 0, // Will be updated after transcoding
          fileUrl: filePath,
          status: 'UPLOADING',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              professorProfile: {
                select: {
                  specialties: true,
                  verified: true,
                },
              },
            },
          },
        },
      });
      
      // Add to transcode queue
      await addTranscodeJob(video.id, filePath);
      
      return video;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao fazer upload do vídeo',
      });
    }
  });
  
  // Get video by ID
  fastify.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const video = await prisma.video.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              professorProfile: {
                select: {
                  specialties: true,
                  verified: true,
                },
              },
            },
          },
          likes: {
            where: { userId: request.user.userId },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });
      
      if (!video) {
        return reply.status(404).send({
          error: 'Vídeo não encontrado',
          message: 'O vídeo solicitado não existe',
        });
      }
      
      // Increment views
      const viewCount = await incrementVideoViews(id);
      broadcastView(id, viewCount);
      
      return {
        ...video,
        isLiked: video.likes.length > 0,
        stats: {
          views: viewCount,
          likes: video._count.likes,
          comments: video._count.comments,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar vídeo',
      });
    }
  });
  
  // Get video file
  fastify.get('/:id/file', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const video = await prisma.video.findUnique({
        where: { id },
        select: { fileUrl: true, status: true },
      });
      
      if (!video || video.status !== 'READY') {
        return reply.status(404).send({
          error: 'Vídeo não disponível',
          message: 'O vídeo ainda está sendo processado',
        });
      }
      
      return reply.sendFile(path.basename(video.fileUrl), path.dirname(video.fileUrl));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao servir vídeo',
      });
    }
  });
  
  // Get video thumbnail
  fastify.get('/:id/thumbnail', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const video = await prisma.video.findUnique({
        where: { id },
        select: { thumbUrl: true },
      });
      
      if (!video?.thumbUrl) {
        return reply.status(404).send({
          error: 'Thumbnail não encontrada',
          message: 'Thumbnail não disponível',
        });
      }
      
      return reply.sendFile(path.basename(video.thumbUrl), path.dirname(video.thumbUrl));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao servir thumbnail',
      });
    }
  });
  
  // Like/Unlike video
  fastify.post('/:id/like', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;
      
      const existingLike = await prisma.like.findUnique({
        where: { userId_videoId: { userId, videoId: id } },
      });
      
      if (existingLike) {
        // Unlike
        await prisma.like.delete({
          where: { userId_videoId: { userId, videoId: id } },
        });
        
        const likeCount = await decrementVideoLikes(id);
        broadcastLike(id, likeCount, false);
        
        return { liked: false, likeCount };
      } else {
        // Like
        await prisma.like.create({
          data: { userId, videoId: id },
        });
        
        const likeCount = await incrementVideoLikes(id);
        broadcastLike(id, likeCount, true);
        
        return { liked: true, likeCount };
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao processar like',
      });
    }
  });
  
  // Get video comments
  fastify.get('/:id/comments', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { cursor, limit = 20 } = request.query as { cursor?: string; limit?: number };
      
      const comments = await prisma.comment.findMany({
        where: { videoId: id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
      
      const hasMore = comments.length > limit;
      const nextCursor = hasMore ? comments[limit - 1].id : null;
      
      return {
        comments: comments.slice(0, limit),
        nextCursor,
        hasMore,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar comentários',
      });
    }
  });
  
  // Add comment
  fastify.post('/:id/comments', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = CreateCommentSchema.parse(request.body);
      
      const comment = await prisma.comment.create({
        data: {
          videoId: id,
          authorId: request.user.userId,
          text: body.text,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
      
      // Update comment count
      const commentCount = await prisma.comment.count({
        where: { videoId: id },
      });
      
      broadcastComment(id, commentCount);
      
      return comment;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao adicionar comentário',
      });
    }
  });
  
  // Report video
  fastify.post('/:id/report', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = CreateReportSchema.parse(request.body);
      
      const report = await prisma.report.create({
        data: {
          videoId: id,
          reporterId: request.user.userId,
          reason: body.reason,
        },
      });
      
      return report;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao reportar vídeo',
      });
    }
  });
  
  // Get related videos
  fastify.get('/:id/related', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { limit = 10 } = request.query as { limit?: number };
      
      const video = await prisma.video.findUnique({
        where: { id },
        select: { tags: true, authorId: true },
      });
      
      if (!video) {
        return reply.status(404).send({
          error: 'Vídeo não encontrado',
          message: 'O vídeo solicitado não existe',
        });
      }
      
      const relatedVideos = await prisma.video.findMany({
        where: {
          id: { not: id },
          status: 'READY',
          OR: [
            { tags: { hasSome: video.tags } },
            { authorId: video.authorId },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              professorProfile: {
                select: {
                  specialties: true,
                  verified: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });
      
      return relatedVideos.map(video => ({
        ...video,
        stats: {
          views: video.views,
          likes: video._count.likes,
          comments: video._count.comments,
        },
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar vídeos relacionados',
      });
    }
  });
}
