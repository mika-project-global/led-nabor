import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImage } from '../lib/supabase-storage';
import { useTranslation } from '../hooks/useTranslation';

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void;
  currentVideo?: string;
  folder?: string;
}

export function VideoUpload({ onVideoUploaded, currentVideo, folder = 'products' }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Неверный формат файла. Поддерживается только MP4');
      event.target.value = '';
      return;
    }

    // Validate file size (max 100MB for Pro plan)
    if (file.size > 100 * 1024 * 1024) {
      const sizeInMB = Math.round(file.size / 1024 / 1024);
      setError(`Размер файла (${sizeInMB}MB) превышает лимит в 100MB`);
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const videoUrl = await uploadImage(file, folder);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!videoUrl) {
        throw new Error('Не удалось загрузить видео');
      }
      
      onVideoUploaded(videoUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке видео');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset input after upload attempt
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {currentVideo ? (
          <div className="relative">
            <video
              src={currentVideo}
              className="w-full h-48 object-cover rounded-lg"
              controls
            />
            <label
              htmlFor="video-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
            >
              <div className="text-white text-center">
                <Upload className="mx-auto mb-2" />
                <span>Изменить видео</span>
              </div>
            </label>
          </div>
        ) : (
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Нажмите для загрузки видео</span>
              </p>
              <p className="text-xs text-gray-500">MP4 до 100MB (Pro план)</p>
            </div>
          </label>
        )}

        <input
          id="video-upload"
          type="file"
          className="hidden"
          accept="video/mp4"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-1">
            Загрузка: {progress}%
          </p>
        </div>
      )}

      {error && (
        <div className="mt-2 text-center text-sm text-red-600 flex items-center justify-center gap-1">
          <X size={16} />
          {error}
        </div>
      )}
    </div>
  );
}