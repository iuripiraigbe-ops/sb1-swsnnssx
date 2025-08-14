import type { Clip, FeedResponse, Professor } from '../types/legaltok';

// Mock data for demonstration
const mockProfessores: Professor[] = [
  {
    id: '1',
    nome: 'Dr. Ana Silva',
    handle: '@anasilva_adv',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    bioCurta: 'Especialista em Direito Trabalhista',
    areas: ['Trabalhista', 'Previdenciário'],
    rating: 4.8,
    seguidores: 12500,
    ctas: {
      contratarUrl: '/contratar/ana-silva',
      cursosUrl: '/cursos/ana-silva',
      mensagemUrl: '/chat/ana-silva',
      agendarUrl: '/agenda/ana-silva'
    }
  },
  {
    id: '2',
    nome: 'Prof. Carlos Santos',
    handle: '@carlossantos',
    avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    bioCurta: 'Direito Penal e Processo Penal',
    areas: ['Penal', 'Processo Penal'],
    rating: 4.9,
    seguidores: 8900,
    ctas: {
      contratarUrl: '/contratar/carlos-santos',
      cursosUrl: '/cursos/carlos-santos'
    }
  },
  {
    id: '3',
    nome: 'Dra. Maria Costa',
    handle: '@mariacosta_law',
    avatarUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    bioCurta: 'Direito do Consumidor',
    areas: ['Consumidor', 'Civil'],
    rating: 4.7,
    seguidores: 15200,
    ctas: {
      contratarUrl: '/contratar/maria-costa',
      cursosUrl: '/cursos/maria-costa',
      agendarUrl: '/agenda/maria-costa'
    }
  }
];

const mockClips: Clip[] = [
  {
    id: '1',
    professorId: '1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400',
    titulo: 'Como calcular horas extras corretamente',
    duracaoSeg: 45,
    hashtags: ['Trabalhista', 'HorasExtras', 'CLT'],
    createdAt: '2024-01-15T10:00:00Z',
    stats: { views: 15420, likes: 1240, comments: 89, saves: 234, shares: 56 },
    professor: mockProfessores[0]
  },
  {
    id: '2',
    professorId: '2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/5668787/pexels-photo-5668787.jpeg?auto=compress&cs=tinysrgb&w=400',
    titulo: 'Diferença entre crime doloso e culposo',
    duracaoSeg: 60,
    hashtags: ['Penal', 'Crime', 'Dolo'],
    createdAt: '2024-01-14T15:30:00Z',
    stats: { views: 8920, likes: 890, comments: 45, saves: 123, shares: 34 },
    professor: mockProfessores[1]
  },
  {
    id: '3',
    professorId: '3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
    titulo: 'Seus direitos na compra online',
    duracaoSeg: 38,
    hashtags: ['Consumidor', 'CompraOnline', 'CDC'],
    createdAt: '2024-01-13T09:15:00Z',
    stats: { views: 22100, likes: 1890, comments: 156, saves: 445, shares: 89 },
    professor: mockProfessores[2]
  },
  {
    id: '4',
    professorId: '1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=400',
    titulo: 'Quando o patrão pode descontar do salário',
    duracaoSeg: 52,
    hashtags: ['Trabalhista', 'Salario', 'Desconto'],
    createdAt: '2024-01-12T14:20:00Z',
    stats: { views: 11340, likes: 934, comments: 67, saves: 189, shares: 23 },
    professor: mockProfessores[0]
  },
  {
    id: '5',
    professorId: '2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=400',
    titulo: 'Legítima defesa: quando posso usar?',
    duracaoSeg: 65,
    hashtags: ['Penal', 'LegitimaDefesa', 'AutoDefesa'],
    createdAt: '2024-01-11T11:45:00Z',
    stats: { views: 18760, likes: 1456, comments: 234, saves: 567, shares: 145 },
    professor: mockProfessores[1]
  },
  {
    id: '6',
    professorId: '3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/5669688/pexels-photo-5669688.jpeg?auto=compress&cs=tinysrgb&w=400',
    titulo: 'Produto com defeito: o que fazer?',
    duracaoSeg: 43,
    hashtags: ['Consumidor', 'Defeito', 'Garantia'],
    createdAt: '2024-01-10T16:30:00Z',
    stats: { views: 13450, likes: 1123, comments: 78, saves: 234, shares: 56 },
    professor: mockProfessores[2]
  }
];

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const legaltokAPI = {
  async getFeed(cursor?: string): Promise<FeedResponse> {
    await delay(Math.random() * 300 + 200); // 200-500ms delay
    
    const startIndex = cursor ? parseInt(cursor) : 0;
    const pageSize = 3;
    const endIndex = Math.min(startIndex + pageSize, mockClips.length);
    
    const clips = mockClips.slice(startIndex, endIndex);
    const hasMore = endIndex < mockClips.length;
    const nextCursor = hasMore ? endIndex.toString() : undefined;
    
    return {
      clips,
      nextCursor,
      hasMore
    };
  },

  async likeClip(clipId: string): Promise<void> {
    await delay(100);
    // Mock implementation - in real app would update backend
    console.log(`Liked clip ${clipId}`);
  },

  async saveClip(clipId: string): Promise<void> {
    await delay(100);
    console.log(`Saved clip ${clipId}`);
  },

  async followProfessor(professorId: string): Promise<void> {
    await delay(150);
    console.log(`Following professor ${professorId}`);
  },

  async shareClip(clipId: string): Promise<void> {
    await delay(50);
    console.log(`Shared clip ${clipId}`);
  }
};