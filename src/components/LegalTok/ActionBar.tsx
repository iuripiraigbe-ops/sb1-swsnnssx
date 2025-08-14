import React from 'react';
import { Heart, MessageCircle, Bookmark, Share, ExternalLink } from 'lucide-react';
import { useLegalTokStore } from '../../store/legaltokStore';
import { legaltokAPI } from '../../services/legaltokAPI';
import { analytics } from '../../services/analytics';
import type { Clip } from '../../types/legaltok';

interface ActionBarProps {
  clip: Clip;
  onOpenComments: () => void;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  clip,
  onOpenComments,
  className = ''
}) => {
  const { 
    engajamento, 
    toggleLike, 
    toggleSave, 
    incrementShares,
    currentIndex 
  } = useLegalTokStore();

  const isLiked = engajamento[clip.id]?.liked || false;
  const isSaved = engajamento[clip.id]?.saved || false;

  const handleLike = async () => {
    toggleLike(clip.id);
    await legaltokAPI.likeClip(clip.id);
    
    analytics.track('legaltok_like', {
      clipId: clip.id,
      professorId: clip.professorId,
      position: currentIndex
    });
  };

  const handleSave = async () => {
    toggleSave(clip.id);
    await legaltokAPI.saveClip(clip.id);
    
    analytics.track('legaltok_save', {
      clipId: clip.id,
      professorId: clip.professorId,
      position: currentIndex
    });
  };

  const handleShare = async () => {
    incrementShares(clip.id);
    await legaltokAPI.shareClip(clip.id);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.titulo,
          text: `Confira este vídeo do ${clip.professor.nome} sobre ${clip.titulo}`,
          url: `${window.location.origin}/legaltok/clip/${clip.id}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback para desktop
      await navigator.clipboard.writeText(`${window.location.origin}/legaltok/clip/${clip.id}`);
      alert('Link copiado para a área de transferência!');
    }
    
    analytics.track('legaltok_share', {
      clipId: clip.id,
      professorId: clip.professorId,
      position: currentIndex
    });
  };

  const handleComments = () => {
    onOpenComments();
    analytics.track('legaltok_comment_open', {
      clipId: clip.id,
      professorId: clip.professorId,
      position: currentIndex
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Like */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleLike}
          className={`p-3 rounded-full transition-all duration-200 ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-black bg-opacity-50 text-white hover:bg-red-500 hover:bg-opacity-80'
          }`}
          aria-label={isLiked ? 'Descurtir' : 'Curtir'}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        <span className="text-white text-xs font-medium">
          {formatNumber(clip.stats.likes)}
        </span>
      </div>

      {/* Comments */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleComments}
          className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-gray-700 hover:bg-opacity-80 transition-colors duration-200"
          aria-label="Comentários"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <span className="text-white text-xs font-medium">
          {formatNumber(clip.stats.comments)}
        </span>
      </div>

      {/* Save */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleSave}
          className={`p-3 rounded-full transition-all duration-200 ${
            isSaved 
              ? 'bg-yellow-500 text-white' 
              : 'bg-black bg-opacity-50 text-white hover:bg-yellow-500 hover:bg-opacity-80'
          }`}
          aria-label={isSaved ? 'Remover dos salvos' : 'Salvar'}
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <span className="text-white text-xs font-medium">
          {formatNumber(clip.stats.saves)}
        </span>
      </div>

      {/* Share */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleShare}
          className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-blue-500 hover:bg-opacity-80 transition-colors duration-200"
          aria-label="Compartilhar"
        >
          <Share className="w-6 h-6" />
        </button>
        <span className="text-white text-xs font-medium">
          {formatNumber(clip.stats.shares)}
        </span>
      </div>

      {/* External Link */}
      <div className="flex flex-col items-center gap-1">
        <button
          className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-green-500 hover:bg-opacity-80 transition-colors duration-200"
          aria-label="Abrir link"
        >
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};