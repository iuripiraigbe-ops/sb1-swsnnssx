import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import type { Clip } from '../../types/legaltok';

interface ClipPlayerProps {
  clip: Clip;
  isActive: boolean;
  isPaused: boolean;
  onTogglePlay: () => void;
  className?: string;
}

export const ClipPlayer: React.FC<ClipPlayerProps> = ({
  clip,
  isActive,
  isPaused,
  onTogglePlay,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isPaused) {
      video.play();
    } else {
      video.pause();
    }
  }, [isActive, isPaused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  const handleVideoClick = () => {
    onTogglePlay();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={clip.videoUrl}
        poster={clip.thumbnailUrl}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        aria-label={`Vídeo: ${clip.titulo}`}
      />

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
        <div 
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Play/Pause Overlay */}
      {(showControls || isPaused) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-4 transition-opacity duration-200">
            {isPaused ? (
              <Play className="w-12 h-12 text-white fill-current" />
            ) : (
              <Pause className="w-12 h-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Volume Control */}
      <button
        onClick={toggleMute}
        className={`absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white transition-opacity duration-200 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Duration */}
      <div className={`absolute top-4 left-4 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded transition-opacity duration-200 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {formatDuration(clip.duracaoSeg)}
      </div>
    </div>
  );
};