import { FastifyInstance } from 'fastify';
import { WebSocketEvent } from '../types/index.js';

const connections = new Map<string, Set<WebSocket>>();

export async function initializeWebSocket(fastify: FastifyInstance) {
  fastify.get('/ws/:videoId', { websocket: true }, (connection, req) => {
    const { videoId } = req.params as { videoId: string };
    
    if (!connections.has(videoId)) {
      connections.set(videoId, new Set());
    }
    
    connections.get(videoId)!.add(connection.socket);
    
    connection.socket.on('close', () => {
      connections.get(videoId)?.delete(connection.socket);
      if (connections.get(videoId)?.size === 0) {
        connections.delete(videoId);
      }
    });
    
    connection.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.get(videoId)?.delete(connection.socket);
    });
  });
}

export function broadcastToVideo(videoId: string, event: WebSocketEvent) {
  const videoConnections = connections.get(videoId);
  if (!videoConnections) return;
  
  const message = JSON.stringify(event);
  
  videoConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

export function broadcastView(videoId: string, viewCount: number) {
  broadcastToVideo(videoId, {
    type: 'view',
    videoId,
    data: { viewCount },
  });
}

export function broadcastLike(videoId: string, likeCount: number, liked: boolean) {
  broadcastToVideo(videoId, {
    type: 'like',
    videoId,
    data: { likeCount, liked },
  });
}

export function broadcastComment(videoId: string, commentCount: number) {
  broadcastToVideo(videoId, {
    type: 'comment',
    videoId,
    data: { commentCount },
  });
}
