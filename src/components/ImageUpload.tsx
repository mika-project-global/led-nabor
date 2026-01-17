import React, { useState } from 'react';
import { Upload, X, Sparkles } from 'lucide-react';
import { uploadImage, addCacheBuster } from '../lib/supabase-storage';
import { useTranslation } from '../hooks/useTranslation';
import { AIImageEditor } from './AIImageEditor';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  folder?: string;
  buttonText?: string;
}

export function ImageUpload({ onImageUploaded, currentImage, folder = 'products', buttonText }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIEditor, setShowAIEditor] = useState(false);
  const { t } = useTranslation();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    if (!file.type.startsWith('image/')) {
      setError(t('error_invalid_image'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t('error_image_too_large'));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('Uploading image to folder:', folder);
      const imageUrl = await uploadImage(file, folder);
      console.log('Image uploaded successfully:', imageUrl);

      if (imageUrl) {
        onImageUploaded(imageUrl);
        console.log('onImageUploaded callback called with:', imageUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : t('error_upload_failed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {buttonText ? (
          <label
            htmlFor={`image-upload-${folder}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : buttonText}
          </label>
        ) : currentImage ? (
          <div className="relative">
            <img
              src={addCacheBuster(currentImage)}
              alt={t('current_image')}
              className="w-full h-48 object-cover rounded-lg"
            />
            <label
              htmlFor={`image-upload-${folder}`}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
            >
              <div className="text-white text-center">
                <Upload className="mx-auto mb-2" />
                <span>{t('change_image')}</span>
              </div>
            </label>
          </div>
        ) : (
          <label
            htmlFor={`image-upload-${folder}`}
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">{t('click_to_upload')}</span>
              </p>
              <p className="text-xs text-gray-500">{t('image_requirements')}</p>
            </div>
          </label>
        )}

        <input
          id={`image-upload-${folder}`}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="mt-2 text-center text-sm text-gray-600">
          {t('uploading')}...
        </div>
      )}

      {error && (
        <div className="mt-2 text-center text-sm text-red-600 flex items-center justify-center gap-1">
          <X size={16} />
          {error}
        </div>
      )}

      {currentImage && !isUploading && (
        <button
          onClick={() => setShowAIEditor(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
        >
          <Sparkles size={18} />
          <span className="font-medium">AI Редактор</span>
        </button>
      )}

      {showAIEditor && currentImage && (
        <AIImageEditor
          imageUrl={currentImage}
          onImageProcessed={onImageUploaded}
          onClose={() => setShowAIEditor(false)}
        />
      )}
    </div>
  );
}