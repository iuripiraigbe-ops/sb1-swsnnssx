import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Users, TrendingUp, Filter } from 'lucide-react';
import { Header } from '../Layout/Header';
import { legaltokAPI } from '../../services/legaltokAPI';
import type { Clip } from '../../types/legaltok';

export const AreaPage: React.FC = () => {
  const { areaSlug } = useParams();
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');

  const areaName = areaSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  useEffect(() => {
    const loadAreaContent = async () => {
      setIsLoading(true);
      try {
        const response = await legaltokAPI.getFeed();
        // In real app, would filter by area
        setClips(response.clips);
      } catch (error) {
        console.error('Failed to load area content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAreaContent();
  }, [areaSlug]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getAreaStats = () => {
    const totalViews = clips.reduce((sum, clip) => sum + clip.stats.views, 0);
    const totalCreators = new Set(clips.map(clip => clip.professorId)).size;
    
    return {
      videos: clips.length,
      views: totalViews,
      creators: totalCreators
    };
  };

  const stats = getAreaStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack title={areaName} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header showBack title={areaName} />

      {/* Area Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{areaName}</h1>
          <p className="text-blue-100 mb-4">
            Aprenda com os melhores professores especializados
          </p>
          
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-semibold">{formatNumber(stats.videos)}</div>
              <div className="text-blue-200">Vídeos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{formatNumber(stats.views)}</div>
              <div className="text-blue-200">Visualizações</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{formatNumber(stats.creators)}</div>
              <div className="text-blue-200">Professores</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Vídeos</h2>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Mais Recentes</option>
              <option value="popular">Mais Populares</option>
              <option value="trending">Em Alta</option>
            </select>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {clips.map((clip) => (
            <Link
              key={clip.id}
              to={`/legaltok?video=${clip.id}`}
              className="relative aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden group"
            >
              <img
                src={clip.thumbnailUrl}
                alt={clip.titulo}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 rounded-full p-3">
                  <Play className="w-6 h-6 text-white fill-current" />
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                  {clip.titulo}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={clip.professor.avatarUrl}
                    alt={clip.professor.nome}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-gray-300 text-xs truncate">
                    {clip.professor.nome}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>{formatNumber(clip.stats.views)} views</span>
                  <span>{Math.floor(clip.duracaoSeg / 60)}:{(clip.duracaoSeg % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Trending Badge */}
              {clip.stats.views > 10000 && (
                <div className="absolute top-2 left-2">
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Em Alta
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Carregar Mais Vídeos
          </button>
        </div>

        {/* Top Professors in Area */}
        <div className="mt-12">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Principais Professores em {areaName}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clips.slice(0, 4).map((clip) => (
              <Link
                key={clip.professor.id}
                to={`/profile/${clip.professor.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={clip.professor.avatarUrl}
                  alt={clip.professor.nome}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {clip.professor.nome}
                    </h4>
                    {clip.professor.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600">
                          {clip.professor.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {clip.professor.bioCurta}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(clip.professor.seguidores)} seguidores
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};