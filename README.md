# LegalTok MVP

Uma plataforma de vídeos curtos para o mercado jurídico brasileiro, inspirada no TikTok.

## 🚀 Sobre o Projeto

LegalTok é uma plataforma onde professores de direito podem compartilhar conhecimento jurídico através de vídeos curtos (máximo 90 segundos), criando uma comunidade educacional e profissional.

### ✨ Funcionalidades Principais

- **Feed Infinito**: Vídeos em formato vertical com scroll infinito
- **Perfis de Professores**: Verificação de credenciais e áreas de especialização
- **Sistema de Seguir**: Conecte-se com outros profissionais
- **Upload de Vídeos**: Sistema de transcodificação automática (720p)
- **Interações**: Likes, comentários e visualizações em tempo real
- **Tópicos**: Categorização por áreas do direito
- **Autenticação**: JWT com refresh tokens

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Zustand** (state management)
- **TanStack Query** (data fetching)
- **React Hook Form** + **Yup** (forms/validation)
- **Framer Motion** (animations)

### Backend
- **Node.js 20** + **TypeScript**
- **Fastify** (web framework)
- **Prisma** (ORM)
- **PostgreSQL** (database)
- **Redis** (cache/queue)
- **BullMQ** (job queue)
- **JWT** (authentication)
- **FFmpeg** (video processing)
- **WebSocket** (real-time)

### Infraestrutura
- **Docker** (containerization)
- **Railway** (deployment)
- **Neon** (PostgreSQL cloud)
- **Upstash** (Redis cloud)

## 📁 Estrutura do Projeto

```
legaltok-mvp/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários
│   ├── services/          # APIs e serviços
│   ├── store/             # Estado global
│   └── types/             # Tipos TypeScript
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── lib/           # Clientes (DB, Redis)
│   │   ├── middleware/    # Middlewares
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Lógica de negócio
│   │   ├── queues/        # Filas de processamento
│   │   └── types/         # Tipos e schemas
│   ├── prisma/            # Schema e migrações
│   └── uploads/           # Arquivos de vídeo
├── docs/                  # Documentação
└── README_DEPLOY.md       # Guia de deploy
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20.x
- Docker (opcional)
- FFmpeg (para processamento de vídeo)

### Frontend
```bash
cd legaltok-mvp
npm install
npm run dev
```

### Backend
```bash
cd legaltok-mvp/server
npm install
npm run dev
```

### Banco de Dados
```bash
cd legaltok-mvp/server
npx prisma migrate dev
npx prisma db seed
```

## 📚 Documentação

- [Arquitetura](./docs/ARCHITECTURE.md)
- [API](./docs/API.md)
- [Deploy](./README_DEPLOY.md)

## 🔧 Configuração

### Variáveis de Ambiente

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
```

#### Backend (server/.env)
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/legaltok"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Server
PORT=3001
NODE_ENV=development

# Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=100000000
```

## 🧪 Testes

```bash
# Frontend
npm run test

# Backend
cd server
npm run test
```

## 📦 Deploy

Veja o guia completo de deploy no [README_DEPLOY.md](./README_DEPLOY.md).

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Savant Armorer** - *Desenvolvimento inicial* - [savantarmorer](https://github.com/savantarmorer)

## 🙏 Agradecimentos

- Inspirado no TikTok para criar uma plataforma educacional
- Comunidade jurídica brasileira
- StackBlitz para o ambiente de desenvolvimento inicial