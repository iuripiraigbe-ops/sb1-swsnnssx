# Deploy no Railway

Este guia explica como fazer o deploy do backend no Railway usando Docker.

## Pré-requisitos

- Conta no Railway (https://railway.app)
- Conta no Neon (PostgreSQL) - https://neon.tech
- Conta no Upstash (Redis) - https://upstash.com
- Repositório Git configurado

## 1. Configuração do Railway

### 1.1 Criar Projeto
1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório do projeto
5. **Importante**: Configure o Root Directory como `/server`

### 1.2 Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no Railway Dashboard:

```bash
# Database (Neon)
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Redis (Upstash)
REDIS_URL="rediss://[user]:[password]@[host]:[port]"

# JWT Secrets (GERE NOVOS!)
JWT_SECRET="[sua-chave-super-secreta-jwt-32-chars]"
JWT_REFRESH_SECRET="[sua-chave-super-secreta-refresh-32-chars]"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=100000000

# CORS (ajuste para seu domínio)
CORS_ORIGIN="https://seu-frontend.vercel.app"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### 1.3 Configurar Health Check
- Health Check URL: `/health`
- Port: `3001`

## 2. Configuração do Neon (PostgreSQL)

### 2.1 Criar Banco
1. Acesse https://neon.tech
2. Crie um novo projeto
3. Copie a connection string
4. Use o formato: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### 2.2 Aplicar Migrações
O Railway executará automaticamente:
```bash
npx prisma migrate deploy
```

## 3. Configuração do Upstash (Redis)

### 3.1 Criar Database
1. Acesse https://upstash.com
2. Crie um novo Redis database
3. Copie a URL TLS (formato `rediss://`)
4. Use para `REDIS_URL`

## 4. Deploy

### 4.1 Push do Código
```bash
git add .
git commit -m "chore(deploy): Railway + Neon + Upstash + Dockerfile"
git push origin main
```

### 4.2 Verificar Deploy
1. Acompanhe o build no Railway Dashboard
2. Verifique se o Dockerfile está sendo usado
3. Confirme que o FFmpeg está instalado
4. Verifique os logs para erros

## 5. Testes Pós-Deploy

### 5.1 Health Check
```bash
curl https://seu-app.railway.app/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "db": "ok",
  "redis": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5.2 Teste de Registro
```bash
curl -X POST https://seu-app.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 5.3 Teste de Login
```bash
curl -X POST https://seu-app.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 6. URLs para Frontend

### 6.1 API Base URL
```
https://seu-app.railway.app
```

### 6.2 WebSocket URL
```
wss://seu-app.railway.app/ws
```

## 7. Troubleshooting

### 7.1 Erro de Conexão com Neon
- Verifique se `sslmode=require` está na DATABASE_URL
- Confirme que o IP do Railway está liberado no Neon

### 7.2 Erro de Conexão com Upstash
- Verifique se está usando `rediss://` (TLS)
- Confirme que a URL está correta

### 7.3 Build Falha
- Verifique se o Dockerfile está correto
- Confirme que todas as dependências estão no package.json
- Verifique os logs do build

### 7.4 Health Check Falha
- Verifique se as variáveis de ambiente estão corretas
- Confirme que Neon e Upstash estão acessíveis
- Verifique os logs da aplicação

## 8. Monitoramento

### 8.1 Logs
- Acesse os logs no Railway Dashboard
- Configure alertas para erros

### 8.2 Métricas
- Monitore uso de CPU/Memory
- Acompanhe requests/minuto
- Verifique latência

## 9. Segurança

### 9.1 Rotação de Secrets
- Troque JWT_SECRET e JWT_REFRESH_SECRET regularmente
- Use variáveis de ambiente seguras
- Não commite secrets no Git

### 9.2 Rate Limiting
- Configure rate limits apropriados
- Monitore tentativas de abuso
- Implemente blacklist se necessário

## 10. Backup

### 10.1 Database
- Configure backup automático no Neon
- Teste restauração regularmente

### 10.2 Uploads
- Configure backup dos arquivos
- Considere usar CDN para produção

---

**Nota**: Este é um setup básico para MVP. Para produção, considere:
- Load balancer
- CDN para vídeos
- Monitoramento avançado
- Backup automático
- CI/CD pipeline
- Testes automatizados
