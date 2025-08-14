# Arquitetura do LegalTok

## Visão Geral

O LegalTok é uma aplicação distribuída com arquitetura de microserviços, seguindo princípios de Clean Architecture e Domain-Driven Design. O sistema é composto por um frontend React e um backend Fastify, com infraestrutura containerizada.

## Diagrama de Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Infrastructure │
│   (React)       │    │   (Fastify)     │    │   (Docker)      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Components    │    │ • Routes        │    │ • PostgreSQL    │
│ • Hooks         │    │ • Services      │    │ • Redis         │
│ • Store         │    │ • Middleware    │    │ • pgAdmin       │
│ • API Client    │    │ • Queues        │    │ • FFmpeg        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   WebSocket     │
                    │   (Real-time)   │
                    └─────────────────┘
```

## Camadas da Aplicação

### 1. Frontend (React + TypeScript)

#### Estrutura de Pastas
```
src/
├── components/          # Componentes React reutilizáveis
│   ├── LegalTok/       # Componentes específicos do feed
│   ├── Layout/         # Componentes de layout
│   ├── Profile/        # Componentes de perfil
│   └── Upload/         # Componentes de upload
├── hooks/              # Custom hooks
├── lib/                # Utilitários e clientes
│   └── api.ts          # Cliente API tipado
├── services/           # Serviços (legacy - mockados)
├── store/              # Estado global (Zustand)
└── types/              # Tipos TypeScript
```

#### Padrões Utilizados
- **Component Composition**: Componentes pequenos e reutilizáveis
- **Custom Hooks**: Lógica de negócio reutilizável
- **State Management**: Zustand para estado global
- **Type Safety**: TypeScript rigoroso
- **API Client**: Cliente tipado com interceptors

### 2. Backend (Fastify + TypeScript)

#### Estrutura de Pastas
```
server/src/
├── routes/             # Rotas da API
│   ├── auth/           # Autenticação
│   ├── videos/         # Vídeos e feed
│   ├── users/          # Usuários e perfis
│   └── topics/         # Tópicos
├── services/           # Serviços de domínio
│   ├── redis.ts        # Cache e estatísticas
│   ├── websocket.ts    # Comunicação real-time
│   └── transcoder.ts   # Processamento de vídeo
├── middleware/         # Middlewares
├── types/              # Tipos e schemas
├── queues/             # Filas de processamento
└── index.ts            # Ponto de entrada
```

#### Padrões Utilizados
- **Clean Architecture**: Separação clara de responsabilidades
- **Dependency Injection**: Inversão de dependências
- **Repository Pattern**: Abstração do banco de dados
- **Service Layer**: Lógica de negócio isolada
- **Middleware Chain**: Processamento em pipeline

## Fluxo de Dados

### 1. Autenticação
```
1. Frontend → POST /auth/login
2. Backend → Valida credenciais
3. Backend → Gera JWT tokens
4. Frontend → Armazena tokens
5. Frontend → Inclui token em requests
```

### 2. Upload de Vídeo
```
1. Frontend → POST /videos (multipart)
2. Backend → Valida arquivo
3. Backend → Salva arquivo temporário
4. Backend → Cria registro no banco
5. Backend → Adiciona job na fila
6. Worker → Processa transcodificação
7. Worker → Atualiza status do vídeo
```

### 3. Feed de Vídeos
```
1. Frontend → GET /videos/feed
2. Backend → Consulta banco com ranking
3. Backend → Inclui dados de autor
4. Backend → Calcula estatísticas
5. Frontend → Renderiza vídeos
6. WebSocket → Atualiza contadores
```

## Banco de Dados

### Schema Principal
```sql
-- Usuários
users (id, name, email, password_hash, role, bio, avatar_url)

-- Perfis de Professor
professor_profiles (id, user_id, specialties[], verified, links)

-- Vídeos
videos (id, author_id, title, description, tags[], duration_sec, 
        file_url, thumb_url, status, views, created_at)

-- Relacionamentos
follows (follower_id, following_id)
likes (user_id, video_id)
comments (id, video_id, author_id, text)
video_topics (video_id, topic_id)

-- Tópicos
topics (id, slug, title)

-- Moderação
reports (id, video_id, reporter_id, reason)
```

### Índices Estratégicos
- `videos(author_id, status, created_at)` - Feed por autor
- `videos(status, created_at, views)` - Ranking de vídeos
- `follows(follower_id, following_id)` - Relacionamentos
- `likes(video_id, user_id)` - Verificação de likes

## Cache e Performance

### Redis
- **Cache de Estatísticas**: Views e likes por vídeo
- **Fila de Jobs**: Transcodificação assíncrona
- **Rate Limiting**: Controle de requisições
- **Session Store**: Tokens de refresh

### Estratégias de Cache
```typescript
// Cache de vídeos populares
const cacheKey = `video:${videoId}:stats`;
await redis.setex(cacheKey, 3600, JSON.stringify(stats));

// Cache de feed
const feedKey = `feed:${userId}:${cursor}`;
await redis.setex(feedKey, 300, JSON.stringify(videos));
```

## Processamento de Vídeo

### Pipeline de Transcodificação
```
1. Upload → Validação de formato
2. Validação → Verificação de duração (≤90s)
3. Processamento → FFmpeg (720p, H.264, AAC)
4. Thumbnail → Screenshot automático
5. Limpeza → Remove arquivo original
6. Atualização → Status READY no banco
```

### Interface para Serviços Externos
```typescript
interface TranscoderService {
  transcode(inputPath: string, outputDir: string, filename: string): Promise<TranscodeResult>;
  validate(inputPath: string): Promise<boolean>;
}

// Implementação local atual
class LocalTranscoder implements TranscoderService { ... }

// Interface para Mux/Cloudflare Stream (futuro)
class CloudTranscoder implements TranscoderService { ... }
```

## WebSocket e Real-time

### Estrutura de Eventos
```typescript
interface WebSocketEvent {
  type: 'view' | 'like' | 'comment';
  videoId: string;
  data: any;
}
```

### Gerenciamento de Conexões
```typescript
// Mapa de conexões por vídeo
const connections = new Map<string, Set<WebSocket>>();

// Broadcast para vídeo específico
function broadcastToVideo(videoId: string, event: WebSocketEvent) {
  const videoConnections = connections.get(videoId);
  if (!videoConnections) return;
  
  videoConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  });
}
```

## Segurança

### Autenticação
- **JWT Access Token**: 15 minutos
- **JWT Refresh Token**: 7 dias
- **bcrypt**: Hash de senhas (12 rounds)

### Validação
- **Zod**: Schemas de validação
- **Rate Limiting**: 100 requests/15min por IP
- **CORS**: Configurado para frontend
- **File Upload**: Validação de tipo e tamanho

### Middleware de Segurança
```typescript
// Autenticação obrigatória
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return reply.status(401).send({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = await request.jwtVerify<JWTPayload>();
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido' });
  }
}
```

## Monitoramento e Observabilidade

### Logs
- **Structured Logging**: JSON format
- **Request Tracing**: Correlation IDs
- **Error Tracking**: Stack traces detalhados

### Métricas
- **Performance**: Tempo de resposta por endpoint
- **Business**: Uploads, views, likes por período
- **Infrastructure**: CPU, memória, disco

### Health Checks
```typescript
// Health check endpoint
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      ffmpeg: await checkFFmpeg()
    }
  };
});
```

## Escalabilidade

### Estratégias de Escala
1. **Horizontal Scaling**: Múltiplas instâncias do backend
2. **Load Balancing**: Distribuição de carga
3. **Database Sharding**: Particionamento por usuário
4. **CDN**: Distribuição de vídeos
5. **Microservices**: Separação por domínio

### Pontos de Escala
- **Vídeos**: CDN + Cloud Storage
- **Transcodificação**: Serviços especializados (Mux, Cloudflare)
- **Cache**: Redis Cluster
- **Database**: Read replicas + Connection pooling

## Deploy e DevOps

### Containerização
```dockerfile
# Backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### CI/CD Pipeline
```yaml
# GitHub Actions
name: Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: docker-compose up -d
```

## Considerações de Produção

### Variáveis de Ambiente
```env
# Produção
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=super-secret-production-key
UPLOAD_DIR=/var/uploads
CDN_URL=https://cdn.legaltok.com
```

### Backup e Recuperação
- **Database**: Backup diário + Point-in-time recovery
- **Vídeos**: Replicação cross-region
- **Configurações**: Versionamento em Git

### Monitoramento
- **APM**: New Relic / DataDog
- **Logs**: ELK Stack / CloudWatch
- **Alerts**: PagerDuty / Slack

## Próximos Passos Arquiteturais

1. **Microservices**: Separação por domínio
2. **Event Sourcing**: Auditoria completa
3. **CQRS**: Separação de leitura/escrita
4. **GraphQL**: API mais flexível
5. **gRPC**: Comunicação inter-serviços
6. **Kubernetes**: Orquestração de containers
7. **Service Mesh**: Istio para networking
8. **Observability**: Distributed tracing

---

Esta arquitetura foi projetada para ser escalável, mantível e preparada para crescimento futuro, seguindo as melhores práticas de desenvolvimento de software moderno.
