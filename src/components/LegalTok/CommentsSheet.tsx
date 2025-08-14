import React, { useState } from 'react';
import { X, Send, Heart, MoreHorizontal } from 'lucide-react';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    handle: string;
  };
  text: string;
  likes: number;
  timestamp: string;
  isLiked?: boolean;
}

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  clipTitle: string;
  comments: Comment[];
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '1',
    user: {
      name: 'João Silva',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60',
      handle: '@joaosilva'
    },
    text: 'Muito esclarecedor! Estava com essa dúvida há tempos.',
    likes: 12,
    timestamp: '2h',
    isLiked: false
  },
  {
    id: '2',
    user: {
      name: 'Maria Santos',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60',
      handle: '@mariasantos'
    },
    text: 'Professora, e no caso de trabalho remoto? As regras são as mesmas?',
    likes: 8,
    timestamp: '1h',
    isLiked: true
  },
  {
    id: '3',
    user: {
      name: 'Pedro Costa',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60',
      handle: '@pedrocosta'
    },
    text: 'Incrível como você explica de forma simples! 👏',
    likes: 23,
    timestamp: '30min',
    isLiked: false
  }
];

export const CommentsSheet: React.FC<CommentsSheetProps> = ({
  isOpen,
  onClose,
  clipTitle,
  comments = mockComments
}) => {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'Você',
        avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=60',
        handle: '@voce'
      },
      text: newComment,
      likes: 0,
      timestamp: 'agora',
      isLiked: false
    };

    setLocalComments([comment, ...localComments]);
    setNewComment('');
  };

  const toggleLike = (commentId: string) => {
    setLocalComments(localComments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl md:max-h-[80vh] max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Comentários
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Fechar comentários"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm text-gray-600 truncate">
            {clipTitle}
          </p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {localComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user.avatar}
                alt={comment.user.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {comment.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-gray-800 mb-2">
                  {comment.text}
                </p>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center gap-1 text-xs ${
                      comment.isLiked ? 'text-red-500' : 'text-gray-500'
                    } hover:text-red-500 transition-colors duration-200`}
                  >
                    <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                    {comment.likes > 0 && comment.likes}
                  </button>
                  
                  <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    Responder
                  </button>
                  
                  <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <img
              src="https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=60"
              alt="Seu avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Enviar comentário"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};