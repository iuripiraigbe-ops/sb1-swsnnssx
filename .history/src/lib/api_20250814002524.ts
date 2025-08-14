import { z } from 'zod';

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PROFESSOR' | 'ALUNO';
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  professorProfile?: {
    specialties: string[];
    verified: boolean;
    links: Record<string, string>;
  };
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  durationSec: number;
  fileUrl: string;
  thumbUrl?: string;
  status: 'UPLOADING' | 'READY' | 'FAILED';
  views: number;
  createdAt: string;
  author: User;
  isLiked?: boolean;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  videoCount?: number;
}

export interface FeedResponse {
  videos: Video[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// API Client
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: 'PROFESSOR' | 'ALUNO';
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.accessToken);
    return response;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.accessToken);
    return response;
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    
    this.setToken(response.accessToken);
    return response;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/me');
  }

  // Video methods
  async getFeed(params?: {
    for?: 'home' | 'following';
    cursor?: string;
    limit?: number;
  }): Promise<FeedResponse> {
    const searchParams = new URLSearchParams();
    if (params?.for) searchParams.append('for', params.for);
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request<FeedResponse>(`/videos/feed?${searchParams}`);
  }

  async getVideo(id: string): Promise<Video> {
    return this.request<Video>(`/videos/${id}`);
  }

  async likeVideo(id: string): Promise<{ liked: boolean; likeCount: number }> {
    return this.request<{ liked: boolean; likeCount: number }>(`/videos/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikeVideo(id: string): Promise<{ liked: boolean; likeCount: number }> {
    return this.request<{ liked: boolean; likeCount: number }>(`/videos/${id}/like`, {
      method: 'POST',
    });
  }

  async getVideoComments(id: string, params?: {
    cursor?: string;
    limit?: number;
  }): Promise<{
    comments: Comment[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request(`/videos/${id}/comments?${searchParams}`);
  }

  async addComment(videoId: string, text: string): Promise<Comment> {
    return this.request<Comment>(`/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async uploadVideo(data: FormData): Promise<Video> {
    const url = `${this.baseUrl}/videos`;
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User methods
  async getUser(id: string): Promise<User & { isFollowing: boolean; stats: any }> {
    return this.request(`/users/${id}`);
  }

  async followUser(id: string): Promise<{ success: boolean; following: boolean }> {
    return this.request(`/users/follow/${id}`, {
      method: 'POST',
    });
  }

  async unfollowUser(id: string): Promise<{ success: boolean; following: boolean }> {
    return this.request(`/users/follow/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserVideos(id: string, params?: {
    cursor?: string;
    limit?: number;
  }): Promise<{
    videos: Video[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request(`/users/${id}/videos?${searchParams}`);
  }

  // Topic methods
  async getTopics(): Promise<Topic[]> {
    return this.request<Topic[]>('/topics');
  }

  async getTopic(slug: string): Promise<Topic> {
    return this.request<Topic>(`/topics/${slug}`);
  }

  async getTopicVideos(slug: string, params?: {
    cursor?: string;
    limit?: number;
  }): Promise<{
    topic: Topic;
    videos: Video[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request(`/topics/${slug}/videos?${searchParams}`);
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export API instance
export const api = new ApiClient(API_BASE);

// Export types
export type { User, Video, Comment, Topic, FeedResponse, AuthResponse };
