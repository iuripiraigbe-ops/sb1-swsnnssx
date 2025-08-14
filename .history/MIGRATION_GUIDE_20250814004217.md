# Guia de Migração para Neon e Upstash

## Objetivo
Migrar o PostgreSQL local para Neon e o Redis local para Upstash.

## 1. Configuração das Variáveis de Ambiente

### Neon (PostgreSQL)
1. Acesse o dashboard do Neon
2. Copie a URL de conexão fornecida (já com SSL)
3. Configure no seu PaaS:
```env
DATABASE_URL="postgresql://neondb_owner:npg_QpSkd4Au3eYB@ep-wild-river-aco3dik3-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Upstash (Redis)
1. Acesse o dashboard do Upstash
2. Copie o "Redis URL" (formato `rediss://...`)
3. Configure no seu PaaS:
```env
REDIS_URL="rediss://:SUA_SENHA@SEU-HOST.upstash.io:PORTA"
```

### Outras Variáveis
```env
JWT_SECRET="troque-por-uma-string-bem-grande"
JWT_REFRESH_SECRET="troque-por-outra-bem-grande"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=100000000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

## 2. Comandos de Migração

### Desenvolvimento
```bash
# Gerar cliente Prisma
npx prisma generate

# Fazer push do schema (desenvolvimento)
npx prisma db push

# Executar seed
npm run db:seed
```

### Produção
```bash
# Executar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

## 3. Mudanças Implementadas

### Clientes Singleton
- `server/src/lib/db.ts` - Cliente Prisma singleton
- `server/src/lib/redis.ts` - Cliente Redis para Upstash

### Validação de Vídeo
- Implementada validação de duração ≤90s usando `ffprobe`
- Validação acontece antes de enfileirar o job de transcodificação

### Healthcheck Real
- `/health` agora testa conexão real com banco e Redis
- Retorna status detalhado de cada serviço

### Dockerfile
- Instala FFmpeg automaticamente
- Configurado para produção
- Executa migrações antes de iniciar

## 4. Testes Pós-Migração

1. **Healthcheck**: `GET /health`
   - Deve retornar: `{ status: "ok", db: "ok", redis: "ok" }`

2. **Registro/Login**: 
   - `POST /auth/register`
   - `POST /auth/login`
   - Deve gerar tokens válidos

3. **Upload de Vídeo**:
   - `POST /videos` (multipart)
   - Deve validar duração ≤90s
   - Deve criar job de transcodificação

4. **Feed e Interações**:
   - `GET /videos` - deve retornar vídeos
   - `POST /videos/:id/like` - deve persistir likes
   - `POST /videos/:id/comments` - deve persistir comentários

5. **Rate Limit**:
   - Deve retornar 429 quando extrapolar limite

## 5. Limpezas Realizadas

- ✅ Removido `REDIS_HOST`/`REDIS_PORT` do código
- ✅ Atualizado BullMQ para usar cliente Redis singleton
- ✅ Implementado healthcheck real
- ✅ Configurado Dockerfile com FFmpeg
- ✅ Atualizado tsconfig.json para NodeNext
- ✅ Criados clientes singleton para Prisma e Redis

## 6. Observações Importantes

### BullMQ + Upstash
- BullMQ usa o protocolo Redis TCP (não REST)
- Necessário usar `REDIS_URL` com formato `rediss://`
- Upstash REST é opcional para contadores simples

### Segurança
- Não commitar variáveis de ambiente
- Após configurar, girar credenciais no Neon/Upstash
- Usar secrets no PaaS

### Escalabilidade
- WebSocket: rota única `/ws`
- Para escalar horizontalmente, considerar pub/sub no Redis
