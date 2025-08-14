# API Documentation - LegalTok

## Base URL
```
http://localhost:3001
```

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header `Authorization`:

```
Authorization: Bearer <access_token>
```

### Endpoints de Autenticação

#### POST /auth/register
Registra um novo usuário.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "role": "ALUNO" // opcional, padrão: "ALUNO"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clx1234567890",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "ALUNO",
    "bio": null,
    "avatarUrl": null,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
Faz login do usuário.

**Request Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clx1234567890",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "ALUNO",
    "bio": null,
    "avatarUrl": null,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/refresh
Renova o access token usando o refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /me
Retorna o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "clx1234567890",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "ALUNO",
  "bio": "Estudante de Direito",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "professorProfile": {
    "specialties": ["Penal", "Civil"],
    "verified": true,
    "links": {
      "website": "https://joao.adv.br",
      "instagram": "@joao_adv"
    }
  }
}
```

## Vídeos

### GET /videos/feed
Retorna o feed de vídeos.

**Query Parameters:**
- `for` (string, opcional): "home" ou "following" (padrão: "home")
- `cursor` (string, opcional): Cursor para paginação
- `limit` (number, opcional): Número de vídeos (padrão: 10, máximo: 50)

**Headers:**
```
Authorization: Bearer <access_token> // opcional
```

**Response (200):**
```json
{
  "videos": [
    {
      "id": "clx1234567890",
      "title": "Como calcular horas extras",
      "description": "Aprenda a calcular horas extras corretamente",
      "tags": ["Trabalhista", "HorasExtras", "CLT"],
      "durationSec": 45,
      "fileUrl": "/uploads/video123.mp4",
      "thumbUrl": "/uploads/video123_thumb.jpg",
      "status": "READY",
      "views": 15420,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "author": {
        "id": "clx1234567891",
        "name": "Dra. Ana Silva",
        "avatarUrl": "https://example.com/avatar.jpg",
        "professorProfile": {
          "specialties": ["Trabalhista"],
          "verified": true
        }
      },
      "isLiked": false,
      "stats": {
        "views": 15420,
        "likes": 1240,
        "comments": 89
      }
    }
  ],
  "nextCursor": "clx1234567890",
  "hasMore": true
}
```

### POST /videos
Faz upload de um novo vídeo (apenas professores).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (file): Arquivo de vídeo (máximo 100MB)
- `title` (string): Título do vídeo
- `description` (string, opcional): Descrição
- `tags` (string): Array JSON de tags

**Response (201):**
```json
{
  "id": "clx1234567890",
  "title": "Como calcular horas extras",
  "description": "Aprenda a calcular horas extras corretamente",
  "tags": ["Trabalhista", "HorasExtras", "CLT"],
  "durationSec": 0,
  "fileUrl": "/uploads/temp_video.mp4",
  "thumbUrl": null,
  "status": "UPLOADING",
  "views": 0,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "author": {
    "id": "clx1234567891",
    "name": "Dra. Ana Silva",
    "avatarUrl": "https://example.com/avatar.jpg",
    "professorProfile": {
      "specialties": ["Trabalhista"],
      "verified": true
    }
  }
}
```

### GET /videos/:id
Retorna detalhes de um vídeo específico.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "clx1234567890",
  "title": "Como calcular horas extras",
  "description": "Aprenda a calcular horas extras corretamente",
  "tags": ["Trabalhista", "HorasExtras", "CLT"],
  "durationSec": 45,
  "fileUrl": "/uploads/video123.mp4",
  "thumbUrl": "/uploads/video123_thumb.jpg",
  "status": "READY",
  "views": 15420,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "author": {
    "id": "clx1234567891",
    "name": "Dra. Ana Silva",
    "avatarUrl": "https://example.com/avatar.jpg",
    "professorProfile": {
      "specialties": ["Trabalhista"],
      "verified": true
    }
  },
  "isLiked": false,
  "stats": {
    "views": 15420,
    "likes": 1240,
    "comments": 89
  }
}
```

### GET /videos/:id/file
Retorna o arquivo de vídeo.

**Response (200):**
```
Binary file stream
```

### GET /videos/:id/thumbnail
Retorna a thumbnail do vídeo.

**Response (200):**
```
Binary image stream
```

### POST /videos/:id/like
Like/Unlike um vídeo.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "liked": true,
  "likeCount": 1241
}
```

### GET /videos/:id/comments
Retorna comentários de um vídeo.

**Query Parameters:**
- `cursor` (string, opcional): Cursor para paginação
- `limit` (number, opcional): Número de comentários (padrão: 20)

**Response (200):**
```json
{
  "comments": [
    {
      "id": "clx1234567890",
      "text": "Excelente explicação!",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "author": {
        "id": "clx1234567891",
        "name": "João Silva",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    }
  ],
  "nextCursor": "clx1234567890",
  "hasMore": false
}
```

### POST /videos/:id/comments
Adiciona um comentário a um vídeo.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "text": "Excelente explicação!"
}
```

**Response (201):**
```json
{
  "id": "clx1234567890",
  "text": "Excelente explicação!",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "author": {
    "id": "clx1234567891",
    "name": "João Silva",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### GET /videos/:id/related
Retorna vídeos relacionados.

**Query Parameters:**
- `limit` (number, opcional): Número de vídeos (padrão: 10)

**Response (200):**
```json
[
  {
    "id": "clx1234567891",
    "title": "Direitos trabalhistas",
    "description": "Conheça seus direitos",
    "tags": ["Trabalhista", "Direitos"],
    "durationSec": 52,
    "fileUrl": "/uploads/video124.mp4",
    "thumbUrl": "/uploads/video124_thumb.jpg",
    "status": "READY",
    "views": 8920,
    "createdAt": "2024-01-14T15:30:00.000Z",
    "author": {
      "id": "clx1234567892",
      "name": "Prof. Carlos Santos",
      "avatarUrl": "https://example.com/avatar2.jpg",
      "professorProfile": {
        "specialties": ["Trabalhista"],
        "verified": true
      }
    },
    "stats": {
      "views": 8920,
      "likes": 890,
      "comments": 45
    }
  }
]
```

### POST /videos/:id/report
Reporta um vídeo.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "reason": "Conteúdo inadequado"
}
```

**Response (201):**
```json
{
  "id": "clx1234567890",
  "videoId": "clx1234567891",
  "reporterId": "clx1234567892",
  "reason": "Conteúdo inadequado",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "resolvedAt": null
}
```

## Usuários

### GET /users/:id
Retorna perfil de um usuário.

**Headers:**
```
Authorization: Bearer <access_token> // opcional
```

**Response (200):**
```json
{
  "id": "clx1234567890",
  "name": "Dra. Ana Silva",
  "email": "ana@legaltok.com",
  "role": "PROFESSOR",
  "bio": "Especialista em Direito Trabalhista",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "professorProfile": {
    "specialties": ["Trabalhista", "Previdenciário"],
    "verified": true,
    "links": {
      "website": "https://anasilva.adv.br",
      "instagram": "@anasilva_adv"
    }
  },
  "isFollowing": false,
  "stats": {
    "followers": 12500,
    "following": 45,
    "videos": 23
  }
}
```

### GET /users/:id/videos
Retorna vídeos de um usuário.

**Query Parameters:**
- `cursor` (string, opcional): Cursor para paginação
- `limit` (number, opcional): Número de vídeos (padrão: 20)

**Response (200):**
```json
{
  "videos": [
    {
      "id": "clx1234567890",
      "title": "Como calcular horas extras",
      "description": "Aprenda a calcular horas extras corretamente",
      "tags": ["Trabalhista", "HorasExtras", "CLT"],
      "durationSec": 45,
      "fileUrl": "/uploads/video123.mp4",
      "thumbUrl": "/uploads/video123_thumb.jpg",
      "status": "READY",
      "views": 15420,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "author": {
        "id": "clx1234567891",
        "name": "Dra. Ana Silva",
        "avatarUrl": "https://example.com/avatar.jpg",
        "professorProfile": {
          "specialties": ["Trabalhista"],
          "verified": true
        }
      },
      "stats": {
        "views": 15420,
        "likes": 1240,
        "comments": 89
      }
    }
  ],
  "nextCursor": "clx1234567890",
  "hasMore": false
}
```

### POST /users/follow/:id
Segue um usuário.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "following": true
}
```

### DELETE /users/follow/:id
Deixa de seguir um usuário.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "following": false
}
```

### GET /users/:id/followers
Retorna seguidores de um usuário.

**Query Parameters:**
- `cursor` (string, opcional): Cursor para paginação
- `limit` (number, opcional): Número de seguidores (padrão: 20)

**Response (200):**
```json
{
  "followers": [
    {
      "id": "clx1234567890",
      "name": "João Silva",
      "avatarUrl": "https://example.com/avatar.jpg",
      "professorProfile": {
        "specialties": ["Penal"],
        "verified": false
      }
    }
  ],
  "nextCursor": "clx1234567890",
  "hasMore": false
}
```

### GET /users/:id/following
Retorna usuários seguidos.

**Query Parameters:**
- `cursor` (string, opcional): Cursor para paginação
- `limit` (number, opcional): Número de usuários (padrão: 20)

**Response (200):**
```json
{
  "following": [
    {
      "id": "clx1234567890",
      "name": "Dra. Ana Silva",
      "avatarUrl": "https://example.com/avatar.jpg",
      "professorProfile": {
        "specialties": ["Trabalhista"],
        "verified": true
      }
    }
  ],
  "nextCursor": "clx1234567890",
  "hasMore": false
}
```

## Tópicos

### GET /topics
Retorna lista de tópicos.

**Response (200):**
```json
[
  {
    "id": "clx1234567890",
    "slug": "penal",
    "title": "Direito Penal",
    "videoCount": 45
  },
  {
    "id": "clx1234567891",
    "slug": "civil",
    "title": "Direito Civil",
    "videoCount": 32
  }
]
```

### GET /topics/:slug
Retorna detalhes de um tópico.

**Response (200):**
```json
{
  "id": "clx1234567890",
  "slug": "penal",
  "title": "Direito Penal",
  "videoCount": 45
}
```

### GET /topics/:slug/videos
Retorna vídeos de um tópico.

**Query Parameters:**
- `cursor` (string, opcional): Cursor para paginação
- `limit` (number, opcional): Número de vídeos (padrão: 20)

**Response (200):**
```json
{
  "topic": {
    "id": "clx1234567890",
    "slug": "penal",
    "title": "Direito Penal"
  },
  "videos": [
    {
      "id": "clx1234567890",
      "title": "Diferença entre crime doloso e culposo",
      "description": "Entenda as principais diferenças",
      "tags": ["Penal", "Crime", "Dolo"],
      "durationSec": 60,
      "fileUrl": "/uploads/video123.mp4",
      "thumbUrl": "/uploads/video123_thumb.jpg",
      "status": "READY",
      "views": 8920,
      "createdAt": "2024-01-14T15:30:00.000Z",
      "author": {
        "id": "clx1234567891",
        "name": "Prof. Carlos Santos",
        "avatarUrl": "https://example.com/avatar.jpg",
        "professorProfile": {
          "specialties": ["Penal"],
          "verified": true
        }
      },
      "stats": {
        "views": 8920,
        "likes": 890,
        "comments": 45
      }
    }
  ],
  "nextCursor": "clx1234567890",
  "hasMore": false
}
```

### GET /topics/trending/list
Retorna tópicos em alta.

**Query Parameters:**
- `limit` (number, opcional): Número de tópicos (padrão: 10)

**Response (200):**
```json
[
  {
    "id": "clx1234567890",
    "slug": "penal",
    "title": "Direito Penal",
    "recentVideoCount": 12
  }
]
```

## WebSocket

### Conexão
```
ws://localhost:3001/ws?videoId=<video_id>
```

### Eventos

#### View Update
```json
{
  "type": "view",
  "videoId": "clx1234567890",
  "data": {
    "viewCount": 15421
  }
}
```

#### Like Update
```json
{
  "type": "like",
  "videoId": "clx1234567890",
  "data": {
    "likeCount": 1241,
    "liked": true
  }
}
```

#### Comment Update
```json
{
  "type": "comment",
  "videoId": "clx1234567890",
  "data": {
    "commentCount": 90
  }
}
```

## Códigos de Erro

### 400 - Bad Request
```json
{
  "error": "Dados inválidos",
  "message": "Verifique os campos obrigatórios",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "error": "Token não fornecido",
  "message": "Authorization header é obrigatório"
}
```

### 403 - Forbidden
```json
{
  "error": "Acesso negado",
  "message": "Apenas professores podem acessar este recurso"
}
```

### 404 - Not Found
```json
{
  "error": "Vídeo não encontrado",
  "message": "O vídeo solicitado não existe"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno",
  "message": "Erro ao processar requisição"
}
```

## Rate Limiting

A API implementa rate limiting de 100 requisições por 15 minutos por IP. Quando o limite é excedido:

**Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Muitas requisições. Tente novamente em alguns minutos."
}
```

## Paginação

Endpoints que retornam listas usam cursor-based paginação:

- Use o `nextCursor` da resposta anterior como parâmetro `cursor`
- Quando `hasMore` for `false`, não há mais itens
- O parâmetro `limit` controla o número de itens por página

## Upload de Arquivos

### Validações
- **Tipo**: Apenas arquivos de vídeo (MIME type: video/*)
- **Tamanho**: Máximo 100MB
- **Duração**: Máximo 90 segundos
- **Formatos**: MP4, MOV, AVI, etc.

### Processamento
1. Arquivo é salvo temporariamente
2. Validação de duração com FFmpeg
3. Job de transcodificação é adicionado à fila
4. Vídeo é processado para 720p + thumbnail
5. Status é atualizado para "READY"

## Autenticação

### JWT Tokens
- **Access Token**: 15 minutos de duração
- **Refresh Token**: 7 dias de duração
- **Algoritmo**: HS256

### Refresh Flow
1. Access token expira
2. Use refresh token para obter novo access token
3. Se refresh token expirar, faça login novamente

---

Para mais informações, consulte a documentação da arquitetura em `docs/ARCHITECTURE.md`.
