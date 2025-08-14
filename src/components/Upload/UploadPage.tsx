import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, Play, Pause, Volume2, VolumeX, Plus } from 'lucide-react';
import { Header } from '../Layout/Header';
import { userAPI } from '../../services/userAPI';
import type { VideoUpload } from '../../types/user';

interface UploadForm extends Omit<VideoUpload, 'videoFile' | 'thumbnailFile'> {
  newHashtag: string;
}

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UploadForm>({
    defaultValues: {
      hashtags: [],
      areas: [],
      isPublic: true
    }
  });

  const watchedHashtags = watch('hashtags') || [];
  const watchedAreas = watch('areas') || [];
  const newHashtag = watch('newHashtag') || '';

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Get video duration
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setValue('duracaoSeg', Math.floor(video.duration));
      };
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const addHashtag = () => {
    const hashtag = newHashtag.trim().replace('#', '');
    if (hashtag && !watchedHashtags.includes(hashtag)) {
      setValue('hashtags', [...watchedHashtags, hashtag]);
      setValue('newHashtag', '');
    }
  };

  const removeHashtag = (hashtagToRemove: string) => {
    setValue('hashtags', watchedHashtags.filter(tag => tag !== hashtagToRemove));
  };

  const addArea = (area: string) => {
    if (!watchedAreas.includes(area)) {
      setValue('areas', [...watchedAreas, area]);
    }
  };

  const removeArea = (areaToRemove: string) => {
    setValue('areas', watchedAreas.filter(area => area !== areaToRemove));
  };

  const onSubmit = async (data: UploadForm) => {
    if (!videoFile) {
      alert('Selecione um vídeo para fazer upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const uploadData: VideoUpload = {
        ...data,
        videoFile,
        hashtags: data.hashtags.filter(Boolean)
      };

      const result = await userAPI.uploadVideo(uploadData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erro no upload. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const suggestedAreas = [
    'Direito Civil', 'Direito Penal', 'Direito Trabalhista', 
    'Direito Tributário', 'Direito Constitucional', 'Direito Administrativo',
    'Direito do Consumidor', 'Direito Empresarial', 'Direito Previdenciário'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header 
        showBack 
        title="Novo Vídeo"
        rightAction={
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isUploading || !videoFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isUploading ? 'Enviando...' : 'Publicar'}
          </button>
        }
      />

      {isUploading && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Fazendo upload...
            </span>
            <span className="text-sm text-blue-700">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        {/* Video Upload */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Vídeo</h3>
          
          {!videoFile ? (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Toque para selecionar um vídeo</p>
              <p className="text-sm text-gray-500">MP4, MOV até 100MB</p>
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-[9/16] max-w-xs mx-auto bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  muted={isMuted}
                  loop
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Video Controls */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoUrl('');
                      if (videoInputRef.current) {
                        videoInputRef.current.value = '';
                      }
                    }}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Trocar Vídeo
              </button>
            </div>
          )}
          
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Informações do Vídeo</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              {...register('titulo', { required: 'Título é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva seu vídeo em poucas palavras"
              maxLength={100}
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              {...register('descricao')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Conte mais detalhes sobre o conteúdo..."
              maxLength={500}
            />
          </div>
        </div>

        {/* Hashtags */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Hashtags</h3>
          
          <div className="flex gap-2">
            <input
              {...register('newHashtag')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: trabalhista"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
            />
            <button
              type="button"
              onClick={addHashtag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {watchedHashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                #{hashtag}
                <button
                  type="button"
                  onClick={() => removeHashtag(hashtag)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Areas */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Áreas do Direito</h3>
          
          <div className="grid grid-cols-2 gap-2">
            {suggestedAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => 
                  watchedAreas.includes(area) ? removeArea(area) : addArea(area)
                }
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  watchedAreas.includes(area)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Privacidade</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                {...register('isPublic')}
                type="radio"
                value="true"
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Público</div>
                <div className="text-sm text-gray-600">
                  Qualquer pessoa pode ver seu vídeo
                </div>
              </div>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                {...register('isPublic')}
                type="radio"
                value="false"
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Apenas seguidores</div>
                <div className="text-sm text-gray-600">
                  Somente quem te segue pode ver
                </div>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};