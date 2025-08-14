import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import { prisma } from '../../lib/db.js';

export async function userRoutes(fastify: FastifyInstance) {
  // Get user profile
  fastify.get('/:userId', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const currentUserId = (request.user as any)?.userId;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          professorProfile: {
            select: {
              specialties: true,
              verified: true,
              links: true,
            },
          },
          _count: {
            select: {
              followers: true,
              following: true,
              videos: {
                where: { status: 'READY' },
              },
            },
          },
        },
      });
      
      if (!user) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
          message: 'O usuário solicitado não existe',
        });
      }
      
      // Check if current user is following this user
      let isFollowing = false;
      if (currentUserId && currentUserId !== userId) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: userId,
            },
          },
        });
        isFollowing = !!follow;
      }
      
      return {
        ...user,
        isFollowing,
        stats: {
          followers: user._count.followers,
          following: user._count.following,
          videos: user._count.videos,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar perfil do usuário',
      });
    }
  });
  
  // Get user videos
  fastify.get('/:userId/videos', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const { cursor, limit = 20 } = request.query as { cursor?: string; limit?: number };
      
      let cursorCondition = {};
      if (cursor) {
        cursorCondition = {
          id: { lt: cursor },
        };
      }
      
      const videos = await prisma.video.findMany({
        where: {
          authorId: userId,
          status: 'READY',
          ...cursorCondition,
        },
        take: limit + 1,
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
      
      const hasMore = videos.length > limit;
      const nextCursor = hasMore ? videos[limit - 1].id : null;
      
      return {
        videos: videos.slice(0, limit).map(video => ({
          ...video,
          stats: {
            views: video.views,
            likes: video._count.likes,
            comments: video._count.comments,
          },
        })),
        nextCursor,
        hasMore,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar vídeos do usuário',
      });
    }
  });
  
  // Follow user
  fastify.post('/follow/:userId', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const followerId = (request.user as any).userId;
      
      if (followerId === userId) {
        return reply.status(400).send({
          error: 'Operação inválida',
          message: 'Você não pode seguir a si mesmo',
        });
      }
      
      // Check if user exists
      const userToFollow = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!userToFollow) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
          message: 'O usuário que você está tentando seguir não existe',
        });
      }
      
      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userId,
          },
        },
      });
      
      if (existingFollow) {
        return reply.status(400).send({
          error: 'Já seguindo',
          message: 'Você já está seguindo este usuário',
        });
      }
      
      // Create follow relationship
      await prisma.follow.create({
        data: {
          followerId,
          followingId: userId,
        },
      });
      
      return { success: true, following: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao seguir usuário',
      });
    }
  });
  
  // Unfollow user
  fastify.delete('/follow/:userId', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const followerId = request.user.userId;
      
      // Delete follow relationship
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userId,
          },
        },
      });
      
      return { success: true, following: false };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao deixar de seguir usuário',
      });
    }
  });
  
  // Get user followers
  fastify.get('/:userId/followers', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const { cursor, limit = 20 } = request.query as { cursor?: string; limit?: number };
      
      let cursorCondition = {};
      if (cursor) {
        cursorCondition = {
          follower: {
            id: { lt: cursor },
          },
        };
      }
      
      const followers = await prisma.follow.findMany({
        where: {
          followingId: userId,
          ...cursorCondition,
        },
        take: limit + 1,
        orderBy: {
          follower: {
            name: 'asc',
          },
        },
        include: {
          follower: {
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
      
      const hasMore = followers.length > limit;
      const nextCursor = hasMore ? followers[limit - 1].follower.id : null;
      
      return {
        followers: followers.slice(0, limit).map(f => f.follower),
        nextCursor,
        hasMore,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar seguidores',
      });
    }
  });
  
  // Get user following
  fastify.get('/:userId/following', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const { cursor, limit = 20 } = request.query as { cursor?: string; limit?: number };
      
      let cursorCondition = {};
      if (cursor) {
        cursorCondition = {
          following: {
            id: { lt: cursor },
          },
        };
      }
      
      const following = await prisma.follow.findMany({
        where: {
          followerId: userId,
          ...cursorCondition,
        },
        take: limit + 1,
        orderBy: {
          following: {
            name: 'asc',
          },
        },
        include: {
          following: {
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
      
      const hasMore = following.length > limit;
      const nextCursor = hasMore ? following[limit - 1].following.id : null;
      
      return {
        following: following.slice(0, limit).map(f => f.following),
        nextCursor,
        hasMore,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao buscar usuários seguidos',
      });
    }
  });
}
