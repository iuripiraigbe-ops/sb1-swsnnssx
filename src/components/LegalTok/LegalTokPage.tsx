import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClipPlayer } from './ClipPlayer';
import { ActionBar } from './ActionBar';
import { ProfessorBadge } from './ProfessorBadge';
import { HashtagList } from './HashtagList';
import { CommentsSheet } from './CommentsSheet';
import { useFeedController } from '../../hooks/useFeedController';

export const LegalTokPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    clips,
    currentIndex,
    isLoading,
    currentClip,
    loadInitialFeed,
    goToNext,
    goToPrevious
  } = useFeedController();

  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    loadInitialFeed();
  }, [loadInitialFeed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(!isPaused);
          break;
        case 'Escape':
          if (showComments) {
            setShowComments(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, isPaused, showComments]);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext(); // Swipe up
      } else {
        goToPrevious(); // Swipe down
      }
    }

    setTouchStart(null);
  };

  const handleTogglePlay = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleOpenComments = useCallback(() => {
    setIsPaused(true);
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
    setIsPaused(false);
  }, []);

  if (isLoading && clips.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Carregando feed...</p>
        </div>
      </div>
    );
  }

  if (!currentClip) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p>Nenhum vídeo disponível</p>
          <button
            onClick={loadInitialFeed}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors duration-200"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-white font-semibold text-lg">LegalTok</h1>
          <p className="text-gray-300 text-xs">
            {currentIndex + 1} de {clips.length}
          </p>
        </div>

        <div className="w-9 h-9" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div 
        className="relative w-full h-screen"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video Player */}
        <ClipPlayer
          clip={currentClip}
          isActive={true}
          isPaused={isPaused || showComments}
          onTogglePlay={handleTogglePlay}
          className="absolute inset-0"
        />

        {/* Mobile Layout */}
        <div className="md:hidden absolute inset-0 flex">
          {/* Left side - Video info */}
          <div className="flex-1 flex flex-col justify-end p-4 pb-20">
            <div className="space-y-3">
              <HashtagList 
                hashtags={currentClip.hashtags} 
                className="mb-2"
              />
              
              <h2 className="text-white font-semibold text-base leading-tight">
                {currentClip.titulo}
              </h2>
              
              <ProfessorBadge 
                professor={currentClip.professor} 
                clipId={currentClip.id}
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="w-20 flex items-end justify-center pb-32">
            <ActionBar
              clip={currentClip}
              onOpenComments={handleOpenComments}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex absolute inset-0">
          {/* Left Sidebar */}
          <div className="w-80 bg-black bg-opacity-50 p-6 flex flex-col justify-center">
            <div className="space-y-6">
              <ProfessorBadge 
                professor={currentClip.professor} 
                clipId={currentClip.id}
                className="bg-opacity-70"
              />
              
              <div>
                <h2 className="text-white font-semibold text-xl mb-3">
                  {currentClip.titulo}
                </h2>
                
                <HashtagList 
                  hashtags={currentClip.hashtags} 
                  className="mb-4"
                />
                
                <div className="text-gray-300 text-sm space-y-1">
                  <p>{currentClip.stats.views.toLocaleString()} visualizações</p>
                  <p>{new Date(currentClip.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Video */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm aspect-[9/16] relative">
              <ClipPlayer
                clip={currentClip}
                isActive={true}
                isPaused={isPaused || showComments}
                onTogglePlay={handleTogglePlay}
                className="rounded-2xl overflow-hidden"
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-black bg-opacity-50 p-6 flex flex-col justify-center">
            <ActionBar
              clip={currentClip}
              onOpenComments={handleOpenComments}
              className="items-center"
            />
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-16 right-4 z-20">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}

        {/* Navigation hint */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs text-center opacity-50 pointer-events-none">
          <p className="md:hidden">Deslize para navegar</p>
          <p className="hidden md:block">Use ↑↓ ou clique para navegar</p>
        </div>
      </div>

      {/* Comments Sheet */}
      <CommentsSheet
        isOpen={showComments}
        onClose={handleCloseComments}
        clipTitle={currentClip.titulo}
        comments={[]}
      />
    </div>
  );
};