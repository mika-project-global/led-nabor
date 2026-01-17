import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadLogo } from '../lib/supabase-storage';
import { getImageUrl } from '../lib/supabase-storage';
import { useSite } from '../context/SiteContext';

interface LogoUploaderProps {
  onLogoUploaded: (url: string) => void;
  currentLogo?: string;
}

export function LogoUploader({ onLogoUploaded, currentLogo }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSiteLogo } = useSite();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (allow PNG, JPEG, WebP, SVG)
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setError('Неверный формат файла. Поддерживаются PNG, JPEG, WebP и SVG');
      event.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > 1024 * 1024) {
      const sizeInKB = Math.round(file.size / 1024);
      setError(`Размер файла (${sizeInKB}KB) превышает лимит в 1MB`);
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Skip dimension check for SVG files
      if (file.type !== 'image/svg+xml') {
        // Check image dimensions using FileReader
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.onerror = () => {
              reject(new Error('Не удалось проверить изображение. Убедитесь, что файл не поврежден'));
            };
            img.src = e.target?.result as string;
          };
          reader.onerror = () => {
            reject(new Error('Ошибка при чтении файла'));
          };
          reader.readAsDataURL(file);
        });

        // Recommended size but not strict
        if (dimensions.width < 256 || dimensions.height < 256) {
          console.warn(`Изображение меньше рекомендуемого размера. Текущий: ${dimensions.width}x${dimensions.height}, рекомендуемый: 512x512`);
        }
      }

      const logoUrl = await uploadLogo(file);
      if (!logoUrl) {
        throw new Error('Не удалось загрузить логотип');
      }

      // Update both local and global state
      onLogoUploaded(logoUrl);
      setSiteLogo(logoUrl);
      console.log('Logo uploaded successfully:', logoUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке логотипа');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {currentLogo ? (
          <div className="relative">
            <img
              src={currentLogo}
              alt="Текущий логотип"
              className="w-32 h-32 object-contain rounded-lg"
            />
            <label
              htmlFor="logo-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
            >
              <div className="text-white text-center">
                <Upload className="mx-auto mb-2" />
                <span>Изменить логотип</span>
              </div>
            </label>
          </div>
        ) : (
          <label
            htmlFor="logo-upload"
            className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              error ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className={`mb-2 ${error ? 'text-red-400' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Загрузить логотип</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPEG, WebP, SVG до 1MB</p>
            </div>
          </label>
        )}

        <input
          id="logo-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="mt-2 text-center text-sm text-gray-600">
          Загрузка...
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