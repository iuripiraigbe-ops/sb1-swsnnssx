import React from 'react';
import { Star, UserPlus, UserCheck, MessageSquare, Calendar, GraduationCap, Briefcase } from 'lucide-react';
import { useLegalTokStore } from '../../store/legaltokStore';
import { legaltokAPI } from '../../services/legaltokAPI';
import { analytics } from '../../services/analytics';
import type { Professor } from '../../types/legaltok';

interface ProfessorBadgeProps {
  professor: Professor;
  clipId: string;
  className?: string;
}

export const ProfessorBadge: React.FC<ProfessorBadgeProps> = ({
  professor,
  clipId,
  className = ''
}) => {
  const { followingProfessors, toggleFollow, currentIndex } = useLegalTokStore();
  const isFollowing = followingProfessors.has(professor.id);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollow(professor.id);
    await legaltokAPI.followProfessor(professor.id);
    
    analytics.track('legaltok_follow', {
      clipId,
      professorId: professor.id,
      position: currentIndex
    });
  };

  const handleCTAClick = (ctaType: string, url?: string) => {
    if (!url) return;
    
    analytics.track('legaltok_cta_click', {
      clipId,
      professorId: professor.id,
      position: currentIndex
    });
    
    // In real app, would navigate to the URL
    console.log(`CTA clicked: ${ctaType} -> ${url}`);
    alert(`Redirecionando para: ${ctaType}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className={`bg-black bg-opacity-50 backdrop-blur-sm rounded-2xl p-4 ${className}`}>
      {/* Professor Info */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={professor.avatarUrl}
          alt={professor.nome}
          className="w-12 h-12 rounded-full object-cover border-2 border-white"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {professor.nome}
          </h3>
          <p className="text-gray-300 text-xs truncate">
            {professor.handle}
          </p>
          
          {professor.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-yellow-400 text-xs font-medium">
                {professor.rating}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleFollow}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
            isFollowing
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label={isFollowing ? 'Deixar de seguir' : 'Seguir'}
        >
          {isFollowing ? (
            <UserCheck className="w-4 h-4" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
      </div>

      {/* Bio and Stats */}
      <div className="mb-3">
        <p className="text-gray-300 text-xs mb-2">{professor.bioCurta}</p>
        
        {/* Areas */}
        <div className="flex flex-wrap gap-1 mb-2">
          {professor.areas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="px-2 py-1 bg-blue-500 bg-opacity-50 text-blue-200 text-xs rounded-full"
            >
              #{area}
            </span>
          ))}
        </div>

        <p className="text-gray-400 text-xs">
          {formatNumber(professor.seguidores)} seguidores
        </p>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-2">
        {professor.ctas.contratarUrl && (
          <button
            onClick={() => handleCTAClick('contratar', professor.ctas.contratarUrl)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            <Briefcase className="w-3 h-3" />
            Contratar
          </button>
        )}
        
        {professor.ctas.cursosUrl && (
          <button
            onClick={() => handleCTAClick('cursos', professor.ctas.cursosUrl)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors duration-200"
          >
            <GraduationCap className="w-3 h-3" />
            Cursos
          </button>
        )}
        
        {professor.ctas.mensagemUrl && (
          <button
            onClick={() => handleCTAClick('mensagem', professor.ctas.mensagemUrl)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <MessageSquare className="w-3 h-3" />
            Mensagem
          </button>
        )}
        
        {professor.ctas.agendarUrl && (
          <button
            onClick={() => handleCTAClick('agendar', professor.ctas.agendarUrl)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            <Calendar className="w-3 h-3" />
            Agendar
          </button>
        )}
      </div>
    </div>
  );
};