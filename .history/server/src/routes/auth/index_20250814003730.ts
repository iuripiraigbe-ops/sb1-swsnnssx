import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { RegisterSchema, LoginSchema } from '../../types/index.js';
import { prisma } from '../../lib/db.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const body = RegisterSchema.parse(request.body);
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });
      
      if (existingUser) {
        return reply.status(400).send({
          error: 'Email já cadastrado',
          message: 'Este email já está sendo usado',
        });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(body.password, 12);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          passwordHash,
          role: body.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      
      // Generate tokens
      const accessToken = await reply.jwtSign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );
      
      const refreshToken = await reply.jwtSign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );
      
      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: 'Verifique os campos obrigatórios',
          details: (error as any).errors,
        });
      }
      
      fastify.log.error('Registration error: %s', error instanceof Error ? error.message : String(error));
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao criar conta',
      });
    }
  });
  
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const body = LoginSchema.parse(request.body);
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          role: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      
      if (!user) {
        return reply.status(401).send({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos',
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);
      
      if (!isValidPassword) {
        return reply.status(401).send({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos',
        });
      }
      
      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;
      
      // Generate tokens
      const accessToken = await reply.jwtSign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );
      
      const refreshToken = await reply.jwtSign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );
      
      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: 'Verifique os campos obrigatórios',
          details: error.errors,
        });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao fazer login',
      });
    }
  });
  
  // Refresh token
  fastify.post('/refresh', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return reply.status(401).send({
          error: 'Token não fornecido',
          message: 'Authorization header é obrigatório',
        });
      }
      
      const decoded = await reply.jwtVerify(token);
      
      // Generate new tokens
      const accessToken = await reply.jwtSign(
        { userId: decoded.userId, email: decoded.email, role: decoded.role },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );
      
      const refreshToken = await reply.jwtSign(
        { userId: decoded.userId, email: decoded.email, role: decoded.role },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );
      
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      return reply.status(401).send({
        error: 'Token inválido',
        message: 'Token expirado ou malformado',
      });
    }
  });
}
