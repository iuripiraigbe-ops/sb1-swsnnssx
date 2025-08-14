import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { FeedQuerySchema } from '../../types/index.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';

const prisma = new PrismaClient();

export async function feedRoutes(fastify: FastifyInstance) {
  // Get feed
  fastify.get('/feed', { preHandler: [optionalAuth] }, async (request, reply) => {
    try {
      const query = FeedQuerySchema.parse(request.query);
      const userId = request.user?.userId;
      
      let whereClause: any = {
        status: 'READY',
      };
      
      // Filter by following if requested
      if (query.for === 'following' && userId) {
        const followingIds = await prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        });
        
        if (followingIds.length > 0) {
          whereClause.authorId = {
            in: followingIds.map(f => f.followingId),
          };
        } else {
          // If not following anyone, return empty feed
          return {
            videos: [],
            nextCursor: null,
            hasMore: false,
          };
        }
      }
      
      // Build cursor condition
      let cursorCondition = {};
      if (query.cursor) {
        cursorCondition = {
          id: { lt: query.cursor },
        };
      }
      
      // Get videos with ranking
      const videos = await prisma.video.findMany({
        where: {
          ...whereClause,
          ...cursorCondition,
        },
        take: query.limit + 1,
        orderBy: [
          // Primary: Recent activity (views in last 24h, likes, recency)
          { createdAt: 'desc' },
          { views: 'desc' },
        ],
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
          likes: userId ? {
            where: { userId },
          } : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });
      
      const hasMore = videos.length > query.limit;
      const nextCursor = hasMore ? videos[query.limit - 1].id : null;
      
      // Transform videos to include stats and like status
      const transformedVideos = videos.slice(0, query.limit).map(video => ({
        ...video,
        isLiked: video.likes ? video.likes.length > 0 : false,
        stats: {
          views: video.views,
          likes: video._count.likes,
          comments: video._count.comments,
        },
      }));
      
      return {
        videos: transformedVideos,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao carregar feed',
      });
    }
  });
  
  // Get trending videos
  fastify.get('/trending', async (request, reply) => {
    try {
      const { limit = 20 } = request.query as { limit?: number };
      
      const videos = await prisma.video.findMany({
        where: {
          status: 'READY',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        take: limit,
        orderBy: [
          { views: 'desc' },
          { createdAt: 'desc' },
        ],
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
      
      return videos.map(video => ({
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
        message: 'Erro ao carregar vídeos em alta',
      });
    }
  });
  
  // Get videos by topic
  fastify.get('/topic/:topicSlug', async (request, reply) => {
    try {
      const { topicSlug } = request.params as { topicSlug: string };
      const { cursor, limit = 20 } = request.query as { cursor?: string; limit?: number };
      
      const topic = await prisma.topic.findUnique({
        where: { slug: topicSlug },
      });
      
      if (!topic) {
        return reply.status(404).send({
          error: 'Tópico não encontrado',
          message: 'O tópico solicitado não existe',
        });
      }
      
      let cursorCondition = {};
      if (cursor) {
        cursorCondition = {
          video: {
            id: { lt: cursor },
          },
        };
      }
      
      const videoTopics = await prisma.videoTopic.findMany({
        where: {
          topicId: topic.id,
          ...cursorCondition,
        },
        take: limit + 1,
        orderBy: {
          video: {
            createdAt: 'desc',
          },
        },
        include: {
          video: {
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
          },
        },
      });
      
      const hasMore = videoTopics.length > limit;
      const nextCursor = hasMore ? videoTopics[limit - 1].video.id : null;
      
      const videos = videoTopics.slice(0, limit).map(vt => ({
        ...vt.video,
        stats: {
          views: vt.video.views,
          likes: vt.video._count.likes,
          comments: vt.video._count.comments,
        },
      }));
      
      return {
        topic,
        videos,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao carregar vídeos do tópico',
      });
    }
  });
}
