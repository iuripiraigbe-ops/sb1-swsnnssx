import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Play, Scale, Home } from 'lucide-react';
import { LegalTokPage } from './components/LegalTok/LegalTokPage';
import { BottomNavigation } from './components/Layout/BottomNavigation';
import { ProfilePage } from './components/Profile/ProfilePage';
import { EditProfilePage } from './components/Profile/EditProfilePage';
import { UploadPage } from './components/Upload/UploadPage';
import { SearchPage } from './components/Search/SearchPage';
import { AreaPage } from './components/Area/AreaPage';
import { ActivityPage } from './components/Activity/ActivityPage';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Scale className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Legal<span className="text-yellow-400">Tok</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Aprenda Direito com os melhores professores em vídeos curtos e dinâmicos
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/legaltok"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <Play className="w-6 h-6" />
            Começar a Assistir
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Vídeos Curtos</h3>
              <p className="text-gray-300 text-sm">Aprenda conceitos complexos em poucos minutos</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Professores Especialistas</h3>
              <p className="text-gray-300 text-sm">Conteúdo criado por profissionais qualificados</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Estude Onde Quiser</h3>
              <p className="text-gray-300 text-sm">Acesse de qualquer dispositivo, a qualquer hora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/legaltok" element={<LegalTokPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/area/:areaSlug" element={<AreaPage />} />
          <Route path="/activity" element={<ActivityPage />} />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;