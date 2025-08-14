import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/search', icon: Search, label: 'Buscar' },
    { path: '/upload', icon: Plus, label: 'Criar' },
    { path: '/activity', icon: Heart, label: 'Atividade' },
    { path: '/profile', icon: User, label: 'Perfil' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || 
            (path === '/' && location.pathname === '/legaltok');
          
          return (
            <Link
              key={path}
              to={path === '/' ? '/legaltok' : path}
              className={`flex flex-col items-center py-2 px-3 min-w-0 ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 ${path === '/upload' ? 'text-red-500' : ''}`} />
              <span className="text-xs mt-1 truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};