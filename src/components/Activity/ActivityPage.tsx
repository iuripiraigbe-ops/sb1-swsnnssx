import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Play, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../Layout/Header';

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'video_upload';
  user: {
    id: string;
    nome: string;
    avatarUrl: string;
    handle: string;
  };
  content?: {
    id: string;
    titulo?: string;
    thumbnailUrl?: string;
  };
  timestamp: string;
  message: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'like',
    user: {
      id: '2',
      nome: 'Maria Santos',
      avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60',
      handle: '@mariasantos'
    },
    content: {
      id: '1',
      titulo: 'Como calcular horas extras',
      thumbnailUrl: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    timestamp: '2024-01-15T14:30:00Z',
    message: 'curtiu seu vídeo'
  },
  {
    id: '2',
    type: 'follow',
    user: {
      id: '3',
      nome: 'Pedro Costa',
      avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60',
      handle: '@pedrocosta'
    },
    timestamp: '2024-01-15T12:15:00Z',
    message: 'começou a te seguir'
  },
  {
    id: '3',
    type: 'comment',
    user: {
      id: '4',
      nome: 'Ana Oliveira',
      avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=60',
      handle: '@anaoliveira'
    },
    content: {
      id: '2',
      titulo: 'Direitos do consumidor online',
      thumbnailUrl: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    timestamp: '2024-01-15T10:45:00Z',
    message: 'comentou: "Muito esclarecedor!"'
  },
  {
    id: '4',
    type: 'video_upload',
    user: {
      id: '1',
      nome: 'Dr. Carlos Silva',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60',
      handle: '@carlossilva'
    },
    content: {
      id: '3',
      titulo: 'Novo vídeo sobre contratos',
      thumbnailUrl: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    timestamp: '2024-01-14T16:20:00Z',
    message: 'publicou um novo vídeo'
  }
];

export const ActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'video_upload':
        return <Play className="w-5 h-5 text-purple-500" />;
      default:
        return <Heart className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header title="Atividade" />

      <div className="p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'following'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Seguindo
          </button>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-lg p-4">
              <div className="flex items-start gap-3">
                {/* Activity Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>

                {/* User Avatar */}
                <Link to={`/profile/${activity.user.id}`} className="flex-shrink-0">
                  <img
                    src={activity.user.avatarUrl}
                    alt={activity.user.nome}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <Link 
                          to={`/profile/${activity.user.id}`}
                          className="font-medium hover:underline"
                        >
                          {activity.user.nome}
                        </Link>
                        {' '}
                        <span className="text-gray-600">{activity.message}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>

                    {/* Content Thumbnail */}
                    {activity.content && (
                      <Link
                        to={`/legaltok?video=${activity.content.id}`}
                        className="flex-shrink-0 ml-3"
                      >
                        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={activity.content.thumbnailUrl}
                            alt={activity.content.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    {activity.type === 'follow' && (
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors">
                        Seguir de volta
                      </button>
                    )}
                    {activity.content && (
                      <Link
                        to={`/legaltok?video=${activity.content.id}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                      >
                        Ver vídeo
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockActivities.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma atividade ainda
            </h3>
            <p className="text-gray-600 mb-4">
              Quando alguém curtir ou comentar seus vídeos, você verá aqui
            </p>
            <Link
              to="/legaltok"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Explorar Vídeos
            </Link>
          </div>
        )}

        {/* Load More */}
        {mockActivities.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Carregar Mais
            </button>
          </div>
        )}
      </div>
    </div>
  );
};