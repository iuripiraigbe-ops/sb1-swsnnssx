import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, X, Plus } from 'lucide-react';
import { Header } from '../Layout/Header';
import { userAPI } from '../../services/userAPI';
import type { UserProfile } from '../../types/user';

interface EditProfileForm {
  nome: string;
  handle: string;
  bio: string;
  location: string;
  website: string;
  areas: string[];
}

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newArea, setNewArea] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditProfileForm>();
  const watchedAreas = watch('areas') || [];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await userAPI.getCurrentUser();
        setProfile(profileData);
        
        // Populate form
        setValue('nome', profileData.nome);
        setValue('handle', profileData.handle);
        setValue('bio', profileData.bio || '');
        setValue('location', profileData.location || '');
        setValue('website', profileData.website || '');
        setValue('areas', profileData.areas || []);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: EditProfileForm) => {
    if (!profile) return;

    setIsSaving(true);
    try {
      await userAPI.updateProfile(profile.id, {
        ...data,
        handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}`
      });
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const addArea = () => {
    if (newArea.trim() && !watchedAreas.includes(newArea.trim())) {
      setValue('areas', [...watchedAreas, newArea.trim()]);
      setNewArea('');
    }
  };

  const removeArea = (areaToRemove: string) => {
    setValue('areas', watchedAreas.filter(area => area !== areaToRemove));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack title="Editar Perfil" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack title="Editar Perfil" />
        <div className="text-center py-20">
          <p className="text-gray-600">Erro ao carregar perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header 
        showBack 
        title="Editar Perfil"
        rightAction={
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        {/* Avatar */}
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Toque para alterar foto</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Informações Básicas</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              {...register('nome', { required: 'Nome é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Seu nome completo"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Handle
            </label>
            <input
              {...register('handle', { required: 'Handle é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="@seuhandle"
            />
            {errors.handle && (
              <p className="text-red-500 text-sm mt-1">{errors.handle.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Conte um pouco sobre você..."
            />
          </div>
        </div>

        {/* Location & Website */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Localização & Links</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localização
            </label>
            <input
              {...register('location')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Cidade, Estado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              {...register('website')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://seusite.com"
            />
          </div>
        </div>

        {/* Areas de Atuação */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Áreas de Interesse</h3>
          
          <div className="flex gap-2">
            <input
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Direito Civil"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
            />
            <button
              type="button"
              onClick={addArea}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {watchedAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {area}
                <button
                  type="button"
                  onClick={() => removeArea(area)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Professor Settings */}
        {profile.isProfessor && (
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Configurações de Professor</h3>
            <p className="text-sm text-gray-600">
              Configure seus links de contratação, cursos e outras opções profissionais.
            </p>
            <button
              type="button"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Configurar Perfil Profissional
            </button>
          </div>
        )}
      </form>
    </div>
  );
};