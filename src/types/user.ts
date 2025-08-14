export interface User {
  id: string;
  nome: string;
  email: string;
  handle: string;
  avatarUrl: string;
  bio?: string;
  isProfessor: boolean;
  areas?: string[];
  rating?: number;
  seguidores: number;
  seguindo: number;
  videosCount: number;
  createdAt: string;
  verificado: boolean;
  ctas?: {
    contratarUrl?: string;
    cursosUrl?: string;
    mensagemUrl?: string;
    agendarUrl?: string;
    pixKey?: string;
  };
}

export interface UserProfile extends User {
  totalViews: number;
  totalLikes: number;
  joinedDate: string;
  location?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface VideoUpload {
  id?: string;
  titulo: string;
  descricao?: string;
  hashtags: string[];
  areas: string[];
  videoFile?: File;
  thumbnailFile?: File;
  duracaoSeg?: number;
  isPublic: boolean;
  scheduledFor?: string;
}