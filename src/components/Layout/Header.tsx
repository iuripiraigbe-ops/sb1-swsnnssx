import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, Scale } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showSearch = false,
  rightAction,
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <header className={`bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <Link to="/legaltok" className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">LegalTok</span>
          </Link>
        )}
        
        {title && (
          <h1 className="font-semibold text-lg text-gray-900 truncate">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showSearch && (
          <Link
            to="/search"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </Link>
        )}
        
        {rightAction || (
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};