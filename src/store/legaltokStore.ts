import { create } from 'zustand';
import type { Clip, Engajamento } from '../types/legaltok';

interface LegalTokState {
  clips: Clip[];
  currentIndex: number;
  isLoading: boolean;
  hasMore: boolean;
  nextCursor?: string;
  engajamento: Record<string, Partial<Engajamento>>;
  followingProfessors: Set<string>;
  
  // Actions
  setClips: (clips: Clip[]) => void;
  addClips: (clips: Clip[]) => void;
  setCurrentIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setNextCursor: (cursor?: string) => void;
  toggleLike: (clipId: string) => void;
  toggleSave: (clipId: string) => void;
  toggleFollow: (professorId: string) => void;
  incrementViews: (clipId: string) => void;
  incrementShares: (clipId: string) => void;
}

export const useLegalTokStore = create<LegalTokState>((set, get) => ({
  clips: [],
  currentIndex: 0,
  isLoading: false,
  hasMore: true,
  nextCursor: undefined,
  engajamento: {},
  followingProfessors: new Set(),

  setClips: (clips) => set({ clips }),
  
  addClips: (newClips) => set((state) => ({ 
    clips: [...state.clips, ...newClips] 
  })),
  
  setCurrentIndex: (index) => set({ currentIndex: index }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  setNextCursor: (nextCursor) => set({ nextCursor }),
  
  toggleLike: (clipId) => set((state) => {
    const currentLiked = state.engajamento[clipId]?.liked || false;
    const newEngajamento = {
      ...state.engajamento,
      [clipId]: {
        ...state.engajamento[clipId],
        liked: !currentLiked
      }
    };
    
    // Update clip stats
    const updatedClips = state.clips.map(clip => 
      clip.id === clipId 
        ? { 
            ...clip, 
            stats: { 
              ...clip.stats, 
              likes: clip.stats.likes + (currentLiked ? -1 : 1) 
            }
          }
        : clip
    );
    
    return {
      engajamento: newEngajamento,
      clips: updatedClips
    };
  }),
  
  toggleSave: (clipId) => set((state) => {
    const currentSaved = state.engajamento[clipId]?.saved || false;
    const newEngajamento = {
      ...state.engajamento,
      [clipId]: {
        ...state.engajamento[clipId],
        saved: !currentSaved
      }
    };
    
    const updatedClips = state.clips.map(clip => 
      clip.id === clipId 
        ? { 
            ...clip, 
            stats: { 
              ...clip.stats, 
              saves: clip.stats.saves + (currentSaved ? -1 : 1) 
            }
          }
        : clip
    );
    
    return {
      engajamento: newEngajamento,
      clips: updatedClips
    };
  }),
  
  toggleFollow: (professorId) => set((state) => {
    const newFollowing = new Set(state.followingProfessors);
    const isFollowing = newFollowing.has(professorId);
    
    if (isFollowing) {
      newFollowing.delete(professorId);
    } else {
      newFollowing.add(professorId);
    }
    
    // Update professor follower count in clips
    const updatedClips = state.clips.map(clip => 
      clip.professor.id === professorId 
        ? { 
            ...clip, 
            professor: { 
              ...clip.professor, 
              seguidores: clip.professor.seguidores + (isFollowing ? -1 : 1) 
            }
          }
        : clip
    );
    
    return {
      followingProfessors: newFollowing,
      clips: updatedClips
    };
  }),
  
  incrementViews: (clipId) => set((state) => ({
    clips: state.clips.map(clip => 
      clip.id === clipId 
        ? { ...clip, stats: { ...clip.stats, views: clip.stats.views + 1 }}
        : clip
    )
  })),
  
  incrementShares: (clipId) => set((state) => ({
    clips: state.clips.map(clip => 
      clip.id === clipId 
        ? { ...clip, stats: { ...clip.stats, shares: clip.stats.shares + 1 }}
        : clip
    )
  }))
}));