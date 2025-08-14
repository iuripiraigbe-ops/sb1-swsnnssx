import { useEffect, useCallback, useRef } from 'react';
import { useLegalTokStore } from '../store/legaltokStore';
import { legaltokAPI } from '../services/legaltokAPI';
import { analytics } from '../services/analytics';

export const useFeedController = () => {
  const {
    clips,
    currentIndex,
    isLoading,
    hasMore,
    nextCursor,
    setClips,
    addClips,
    setCurrentIndex,
    setLoading,
    setHasMore,
    setNextCursor,
    incrementViews
  } = useLegalTokStore();

  const viewTimeoutRef = useRef<NodeJS.Timeout>();
  const viewStartTimeRef = useRef<number>();

  const loadInitialFeed = useCallback(async () => {
    if (clips.length > 0) return;
    
    setLoading(true);
    try {
      const response = await legaltokAPI.getFeed();
      setClips(response.clips);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      
      analytics.track('legaltok_feed_loaded', {
        clipId: undefined,
        professorId: undefined,
        position: 0
      });
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  }, [clips.length, setClips, setHasMore, setNextCursor, setLoading]);

  const loadMoreClips = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    setLoading(true);
    try {
      const response = await legaltokAPI.getFeed(nextCursor);
      addClips(response.clips);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load more clips:', error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, isLoading, nextCursor, addClips, setHasMore, setNextCursor, setLoading]);

  const goToNext = useCallback(() => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(currentIndex + 1);
      
      // Load more clips when near the end
      if (currentIndex >= clips.length - 2) {
        loadMoreClips();
      }
    }
  }, [currentIndex, clips.length, setCurrentIndex, loadMoreClips]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, setCurrentIndex]);

  const trackViewStart = useCallback((clipId: string, professorId: string) => {
    viewStartTimeRef.current = Date.now();
    
    // Track view after 1 second
    viewTimeoutRef.current = setTimeout(() => {
      incrementViews(clipId);
      analytics.track('legaltok_view_start', {
        clipId,
        professorId,
        position: currentIndex
      });
    }, 1000);
  }, [currentIndex, incrementViews]);

  const trackViewEnd = useCallback((clipId: string, professorId: string) => {
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
    }

    if (viewStartTimeRef.current) {
      const durationWatchedMs = Date.now() - viewStartTimeRef.current;
      
      if (durationWatchedMs > 1000) {
        analytics.track('legaltok_view_complete', {
          clipId,
          professorId,
          position: currentIndex,
          durationWatchedMs
        });
      }
    }
  }, [currentIndex]);

  // Preload next video
  useEffect(() => {
    if (clips[currentIndex + 1]) {
      const nextVideo = document.createElement('video');
      nextVideo.preload = 'metadata';
      nextVideo.src = clips[currentIndex + 1].videoUrl;
    }
  }, [clips, currentIndex]);

  // Track current clip view
  useEffect(() => {
    const currentClip = clips[currentIndex];
    if (currentClip) {
      trackViewStart(currentClip.id, currentClip.professorId);
      
      return () => {
        trackViewEnd(currentClip.id, currentClip.professorId);
      };
    }
  }, [currentIndex, clips, trackViewStart, trackViewEnd]);

  return {
    clips,
    currentIndex,
    isLoading,
    hasMore,
    currentClip: clips[currentIndex],
    loadInitialFeed,
    loadMoreClips,
    goToNext,
    goToPrevious
  };
};