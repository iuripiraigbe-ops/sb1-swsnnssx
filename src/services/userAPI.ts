import type { User, UserProfile, VideoUpload } from '../types/user';
import type { Clip } from '../types/legaltok';

// Mock data
const mockUsers: UserProfile[] = [
  {
    id: '1',
    nome: 'Dr. Ana Silva',
    email: 'ana@exemplo.com',
    handle: '@anasilva_adv',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'Especialista em Direito Trabalhista com 15 anos de experiência. Professora universitária e advogada militante.',
    isProfessor: true,
    areas: ['Trabalhista', 'Previdenciário'],
    rating: 4.8,
    seguidores: 12500,
    seguindo: 234,
    videosCount: 89,
    createdAt: '2023-01-15T10:00:00Z',
    verificado: true,
    totalViews: 1250000,
    totalLikes: 89000,
    joinedDate: '2023-01-15',
    location: 'São Paulo, SP',
    website: 'https://anasilva.adv.br',
    socialLinks: {
      instagram: '@anasilva_adv',
      linkedin: 'ana-silva-advogada'
    },
    ctas: {
      contratarUrl: '/contratar/ana-silva',
      cursosUrl: '/cursos/ana-silva',
      mensagemUrl: '/chat/ana-silva',
      agendarUrl: '/agenda/ana-silva',
      pixKey: 'ana@exemplo.com'
    }
  },
  {
    id: 'current-user',
    nome: 'João Santos',
    email: 'joao@exemplo.com',
    handle: '@joaosantos',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'Estudante de Direito apaixonado por aprender',
    isProfessor: false,
    areas: [],
    seguidores: 45,
    seguindo: 123,
    videosCount: 0,
    createdAt: '2024-01-01T10:00:00Z',
    verificado: false,
    totalViews: 0,
    totalLikes: 0,
    joinedDate: '2024-01-01',
    location: 'Rio de Janeiro, RJ'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userAPI = {
  async getCurrentUser(): Promise<UserProfile> {
    await delay(200);
    return mockUsers.find(u => u.id === 'current-user') || mockUsers[1];
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    await delay(300);
    return mockUsers.find(u => u.id === userId) || null;
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await delay(500);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
      return mockUsers[userIndex];
    }
    throw new Error('User not found');
  },

  async getUserVideos(userId: string, cursor?: string): Promise<{ clips: Clip[], hasMore: boolean, nextCursor?: string }> {
    await delay(400);
    // Mock implementation - would fetch user's videos
    return { clips: [], hasMore: false };
  },

  async uploadVideo(videoData: VideoUpload): Promise<{ success: boolean, videoId?: string }> {
    await delay(2000); // Simulate upload time
    console.log('Uploading video:', videoData);
    return { success: true, videoId: Date.now().toString() };
  },

  async searchUsers(query: string): Promise<UserProfile[]> {
    await delay(300);
    return mockUsers.filter(user => 
      user.nome.toLowerCase().includes(query.toLowerCase()) ||
      user.handle.toLowerCase().includes(query.toLowerCase())
    );
  },

  async followUser(userId: string): Promise<void> {
    await delay(200);
    console.log(`Following user ${userId}`);
  },

  async unfollowUser(userId: string): Promise<void> {
    await delay(200);
    console.log(`Unfollowing user ${userId}`);
  }
};