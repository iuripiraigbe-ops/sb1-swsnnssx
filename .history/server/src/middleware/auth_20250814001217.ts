import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../types/index.js';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        error: 'Token não fornecido',
        message: 'Authorization header é obrigatório',
      });
    }

    const decoded = await request.jwtVerify<JWTPayload>();
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({
      error: 'Token inválido',
      message: 'Token expirado ou malformado',
    });
  }
}

export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = await request.jwtVerify<JWTPayload>();
      request.user = decoded;
    }
  } catch (error) {
    // Silently fail for optional auth
    request.user = null;
  }
}

export async function requireProfessor(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Não autenticado',
      message: 'Login necessário',
    });
  }

  if (request.user.role !== 'PROFESSOR') {
    return reply.status(403).send({
      error: 'Acesso negado',
      message: 'Apenas professores podem acessar este recurso',
    });
  }
}
