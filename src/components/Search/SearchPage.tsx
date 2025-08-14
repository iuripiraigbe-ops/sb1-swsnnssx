import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Hash, User, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../Layout/Header';
import { userAPI } from '../../services/userAPI';
import { legaltokAPI } from '../../services/legaltokAPI';
import type { UserProfile } from '../../types/user';
import type { Clip } from '../../types/legaltok';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'videos' | 'hashtags'>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches] = useState(['Direito Trabalhista', 'CLT', '@anasilva_adv']);
  const [trendingHashtags] = useState([
    'Trabalhista', 'Penal', 'Consumidor', 'Civil', 'Constitucional', 
    'Tributário', 'Previdenciário', 'Empresarial'
  ]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const [usersResult, videosResult] = await Promise.all([
        userAPI.searchUsers(searchQuery),
        legaltokAPI.getFeed() // In real app, would search videos
      ]);
      
      setUsers(usersResult);
      setVideos(videosResult.clips);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        handleSearch(query);
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    } else {
      setUsers([]);
      setVideos([]);
    }
  }, [query]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const filteredUsers = activeTab === 'all' || activeTab === 'users' ? users : [];
  const filteredVideos = activeTab === 'all' || activeTab === 'videos' ? videos : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header title="Buscar" />

      <div className="p-4">
        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar professores, vídeos, hashtags..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        {query && (
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { key: 'all', label: 'Tudo' },
              { key: 'users', label: 'Usuários' },
              { key: 'videos', label: 'Vídeos' },
              { key: 'hashtags', label: 'Hashtags' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Buscando...</p>
          </div>
        )}

        {/* Search Results */}
        {query && !isLoading && (
          <div className="space-y-6">
            {/* Users */}
            {filteredUsers.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Usuários</h3>
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.nome}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {user.nome}
                          </h4>
                          {user.verificado && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{user.handle}</p>
                        <p className="text-xs text-gray-500">
                          {formatNumber(user.seguidores)} seguidores
                        </p>
                      </div>
                      <User className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {filteredVideos.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Vídeos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {filteredVideos.slice(0, 9).map((video) => (
                    <Link
                      key={video.id}
                      to={`/legaltok?video=${video.id}`}
                      className="relative aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden group"
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-colors flex items-center justify-center">
                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium line-clamp-2">
                          {video.titulo}
                        </p>
                        <p className="text-gray-300 text-xs">
                          {formatNumber(video.stats.views)} views
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && filteredUsers.length === 0 && filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-600">
                  Tente buscar por outros termos
                </p>
              </div>
            )}
          </div>
        )}

        {/* Default Content */}
        {!query && (
          <div className="space-y-6">
            {/* Recent Searches */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Buscas Recentes</h3>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="flex items-center gap-3 w-full p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{search}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Hashtags em Alta
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {trendingHashtags.map((hashtag) => (
                  <button
                    key={hashtag}
                    onClick={() => setQuery(`#${hashtag}`)}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Hash className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-900">#{hashtag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Area */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Explorar por Área</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { area: 'Direito Trabalhista', count: '1.2K vídeos', color: 'bg-blue-500' },
                  { area: 'Direito Penal', count: '890 vídeos', color: 'bg-red-500' },
                  { area: 'Direito do Consumidor', count: '756 vídeos', color: 'bg-green-500' },
                  { area: 'Direito Civil', count: '634 vídeos', color: 'bg-purple-500' }
                ].map(({ area, count, color }) => (
                  <Link
                    key={area}
                    to={`/area/${area.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{area}</h4>
                      <p className="text-sm text-gray-600">{count}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};