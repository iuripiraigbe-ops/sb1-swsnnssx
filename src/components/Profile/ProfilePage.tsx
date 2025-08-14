import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit, 
  MessageCircle, 
  UserPlus, 
  UserCheck,
  Star,
  Play,
  Heart,
  Eye,
  Settings,
  Share
} from 'lucide-react';
import { Header } from '../Layout/Header';
import { userAPI } from '../../services/userAPI';
import type { UserProfile } from '../../types/user';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'saved'>('videos');

  const isOwnProfile = !userId || userId === 'current-user';

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const [profileData, currentUserData] = await Promise.all([
          isOwnProfile ? userAPI.getCurrentUser() : userAPI.getUserProfile(userId!),
          userAPI.getCurrentUser()
        ]);
        
        setProfile(profileData);
        setCurrentUser(currentUserData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, isOwnProfile]);

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(profile.id);
      } else {
        await userAPI.followUser(profile.id);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack={!isOwnProfile} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack />
        <div className="text-center py-20">
          <p className="text-gray-600">Perfil não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header 
        showBack={!isOwnProfile}
        title={isOwnProfile ? undefined : profile.nome}
        rightAction={
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Share className="w-5 h-5" />
          </button>
        }
      />

      <div className="bg-white">
        {/* Profile Header */}
        <div className="px-4 py-6">
          <div className="flex items-start gap-4">
            <img
              src={profile.avatarUrl}
              alt={profile.nome}
              className="w-20 h-20 rounded-full object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {profile.nome}
                </h1>
                {profile.verificado && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-2">{profile.handle}</p>
              
              {profile.isProfessor && profile.rating && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {profile.rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({formatNumber(profile.seguidores)} avaliações)
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {formatNumber(profile.videosCount)}
                  </div>
                  <div className="text-gray-600">Vídeos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {formatNumber(profile.seguidores)}
                  </div>
                  <div className="text-gray-600">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {formatNumber(profile.seguindo)}
                  </div>
                  <div className="text-gray-600">Seguindo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-800 text-sm mt-4 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Areas */}
          {profile.areas && profile.areas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.areas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          )}

          {/* Location & Website */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Website
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Desde {new Date(profile.joinedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {isOwnProfile ? (
              <>
                <Link
                  to="/profile/edit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar Perfil
                </Link>
                <Link
                  to="/settings"
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Seguir
                    </>
                  )}
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Professor CTAs */}
          {profile.isProfessor && profile.ctas && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {profile.ctas.contratarUrl && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                  Contratar Aula
                </button>
              )}
              {profile.ctas.cursosUrl && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  Ver Cursos
                </button>
              )}
            </div>
          )}

          {/* Stats for professors */}
          {profile.isProfessor && (
            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Eye className="w-4 h-4 text-gray-600" />
                </div>
                <div className="font-semibold text-gray-900">
                  {formatNumber(profile.totalViews)}
                </div>
                <div className="text-xs text-gray-600">Visualizações</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="w-4 h-4 text-gray-600" />
                </div>
                <div className="font-semibold text-gray-900">
                  {formatNumber(profile.totalLikes)}
                </div>
                <div className="text-xs text-gray-600">Curtidas</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Play className="w-4 h-4 text-gray-600" />
                </div>
                <div className="font-semibold text-gray-900">
                  {formatNumber(profile.videosCount)}
                </div>
                <div className="text-xs text-gray-600">Vídeos</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex">
            {['videos', 'liked', 'saved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'videos' && 'Vídeos'}
                {tab === 'liked' && 'Curtidos'}
                {tab === 'saved' && 'Salvos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">
            {activeTab === 'videos' && 'Nenhum vídeo ainda'}
            {activeTab === 'liked' && 'Nenhum vídeo curtido'}
            {activeTab === 'saved' && 'Nenhum vídeo salvo'}
          </p>
        </div>
      </div>
    </div>
  );
};