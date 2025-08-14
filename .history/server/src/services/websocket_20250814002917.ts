import { FastifyInstance } from 'fastify';
import { WebSocketServer, WebSocket as WS } from 'ws';
import { WebSocketEvent } from '../types/index.js';

const connections = new Map<string, Set<WS>>();
let wss: WebSocketServer;

export async function initializeWebSocket(fastify: FastifyInstance) {
  // Create WebSocket server
  wss = new WebSocketServer({ 
    server: fastify.server,
    path: '/ws'
  });

  wss.on('connection', (ws: WS, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const videoId = url.searchParams.get('videoId');
    
    if (!videoId) {
      ws.close();
      return;
    }
    
    if (!connections.has(videoId)) {
      connections.set(videoId, new Set());
    }
    
    connections.get(videoId)!.add(ws);
    
    ws.on('close', () => {
      connections.get(videoId)?.delete(ws);
      if (connections.get(videoId)?.size === 0) {
        connections.delete(videoId);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.get(videoId)?.delete(ws);
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
