import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/db.js';

export async function topicRoutes(fastify: FastifyInstance) {
  // Get all topics
  fastify.get('/', async (request, reply) => {
    try {
      const topics = await prisma.topic.findMany({
        orderBy: { title: 'asc' },
        include: {
          _count: {
            select: {
              videos: true,
            },
          },
        },
      });
      
      return topics.map(topic => ({
        ...topic,
        videoCount: topic._count.videos,
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar tópicos',
      });
    }
  });
  
  // Get topic by slug
  fastify.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      
      const topic = await prisma.topic.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              videos: true,
            },
          },
        },
      });
      
      if (!topic) {
        return reply.status(404).send({
          error: 'Tópico não encontrado',
          message: 'O tópico solicitado não existe',
        });
      }
      
      return {
        ...topic,
        videoCount: topic._count.videos,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar tópico',
      });
    }
  });
  
  // Get videos by topic
  fastify.get('/:slug/videos', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const { cursor, limit = 20 } = request.query as { cursor?: string; limit?: number };
      
      const topic = await prisma.topic.findUnique({
        where: { slug },
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
          video: {
            status: 'READY',
          },
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
        message: 'Erro ao buscar vídeos do tópico',
      });
    }
  });
  
  // Get trending topics
  fastify.get('/trending/list', async (request, reply) => {
    try {
      const { limit = 10 } = request.query as { limit?: number };
      
      const topics = await prisma.topic.findMany({
        take: limit,
        include: {
          _count: {
            select: {
              videos: {
                where: {
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                  },
                },
              },
            },
          },
        },
        orderBy: {
          videos: {
            _count: 'desc',
          },
        },
      });
      
      const topicsWithVideos = await Promise.all(
        topics.map(async (topic) => {
          const videos = await prisma.video.findMany({
            where: {
              topics: {
                some: {
                  topicId: topic.id,
                },
              },
              status: 'READY',
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  professorProfile: {
                    select: {
                      verified: true,
                    },
                  },
                },
              },
              topics: {
                include: {
                  topic: true,
                },
              },
            },
          });

          return {
            ...topic,
            recentVideoCount: videos.length,
            recentVideos: videos,
          };
        })
      );

      return topicsWithVideos;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar tópicos em alta',
      });
    }
  });
}
