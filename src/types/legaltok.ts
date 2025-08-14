export interface Professor {
  id: string;
  nome: string;
  handle: string;
  avatarUrl: string;
  bioCurta: string;
  areas: string[];
  rating?: number;
  seguidores: number;
  ctas: {
    contratarUrl?: string;
    cursosUrl?: string;
    mensagemUrl?: string;
    agendarUrl?: string;
  };
}

export interface Clip {
  id: string;
  professorId: string;
  videoUrl: string;
  thumbnailUrl: string;
  titulo: string;
  duracaoSeg: number;
  hashtags: string[];
  createdAt: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
    shares: number;
  };
  professor: Professor;
}

export interface Engajamento {
  userId: string;
  clipId: string;
  liked: boolean;
  saved: boolean;
  followingProfessorIds: string[];
}

export interface FeedResponse {
  clips: Clip[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface AnalyticsEvent {
  event: string;
  clipId?: string;
  professorId?: string;
  position?: number;
  durationWatchedMs?: number;
  timestamp: string;
}