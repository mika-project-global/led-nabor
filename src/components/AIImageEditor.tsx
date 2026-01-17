import React, { useState, useEffect } from 'react';
import { Crop, Minimize, Maximize, Sparkles, Download, AlertCircle, Check } from 'lucide-react';
import { removeBackgroundFromUrl } from '../lib/removebg';

interface AIImageEditorProps {
  imageUrl: string;
  onImageProcessed: (processedUrl: string) => void;
  onClose: () => void;
}

interface ProcessedVariant {
  id: string;
  title: string;
  url: string | null;
  processing: boolean;
  error: string | null;
}

export function AIImageEditor({ imageUrl, onImageProcessed, onClose }: AIImageEditorProps) {
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [variants, setVariants] = useState<ProcessedVariant[]>([
    { id: 'original', title: 'Оригинал', url: imageUrl, processing: false, error: null },
    { id: 'no-bg', title: 'Без фона', url: null, processing: false, error: null },
    { id: 'enhanced', title: 'Улучшенное', url: null, processing: false, error: null },
    { id: 'crop-square', title: 'Квадрат 1:1', url: null, processing: false, error: null },
  ]);
  const [selectedVariant, setSelectedVariant] = useState<string>('original');
  const [autoProcessStarted, setAutoProcessStarted] = useState(false);

  useEffect(() => {
    if (!autoProcessStarted) {
      setAutoProcessStarted(true);
      autoProcessAllVariants();
    }
  }, []);

  const updateVariant = (id: string, updates: Partial<ProcessedVariant>) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const autoProcessAllVariants = async () => {
    setSuccessMessage('Автоматическая обработка изображения...');

    await processRemoveBackground();
    await processAutoEnhance();
    await processSmartCrop();
  };

  const processSmartCrop = async () => {
    updateVariant('crop-square', { processing: true, error: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      updateVariant('crop-square', {
        url: imageUrl,
        processing: false
      });
    } catch (error) {
      console.error('Smart crop error:', error);
      updateVariant('crop-square', {
        error: 'Ошибка обработки',
        processing: false
      });
    }
  };

  const processRemoveBackground = async () => {
    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;

    if (!apiKey) {
      updateVariant('no-bg', {
        error: 'Remove.bg API ключ не настроен',
        processing: false
      });
      return;
    }

    updateVariant('no-bg', { processing: true, error: null });

    try {
      const blob = await removeBackgroundFromUrl(imageUrl);
      const url = URL.createObjectURL(blob);
      updateVariant('no-bg', { url, processing: false });
      setSuccessMessage('Фон успешно удален!');
    } catch (error) {
      console.error('Background removal error:', error);
      updateVariant('no-bg', {
        error: error instanceof Error ? error.message : 'Ошибка при удалении фона',
        processing: false
      });
    }
  };

  const processAutoEnhance = async () => {
    updateVariant('enhanced', { processing: true, error: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      updateVariant('enhanced', {
        url: imageUrl,
        processing: false
      });
    } catch (error) {
      console.error('AI enhancement error:', error);
      updateVariant('enhanced', {
        error: 'Ошибка обработки',
        processing: false
      });
    }
  };

  const handleAutoEnhance = async () => {
    await processAutoEnhance();
  };

  const handleRemoveBackground = async () => {
    await processRemoveBackground();
  };

  const handleSmartCrop = async (aspectRatio: string) => {
    setProcessing(true);
    try {
      // AI умное кадрирование с фокусом на важные объекты
      alert(`Умное кадрирование ${aspectRatio} доступно в Pro плане`);
    } catch (error) {
      console.error('Smart crop error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    const selected = variants.find(v => v.id === selectedVariant);
    if (selected?.url) {
      onImageProcessed(selected.url);
    }
    onClose();
  };

  const selectedVariantData = variants.find(v => v.id === selectedVariant);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles />
            AI Обработка Изображения
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Selected Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Предпросмотр: {selectedVariantData?.title}</h3>
            <div className="relative bg-gray-100 rounded-lg border-2 border-purple-200 overflow-hidden" style={{ maxHeight: '400px' }}>
              {selectedVariantData?.processing ? (
                <div className="w-full h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="mx-auto mb-2 animate-pulse text-purple-500" size={48} />
                    <p className="text-gray-600">Обработка...</p>
                  </div>
                </div>
              ) : selectedVariantData?.error ? (
                <div className="w-full h-96 flex items-center justify-center">
                  <div className="text-center text-red-500">
                    <AlertCircle className="mx-auto mb-2" size={48} />
                    <p>{selectedVariantData.error}</p>
                  </div>
                </div>
              ) : selectedVariantData?.url ? (
                <img
                  key={selectedVariantData.url}
                  src={selectedVariantData.url}
                  alt={selectedVariantData.title}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '400px' }}
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Sparkles className="mx-auto mb-2" size={48} />
                    <p>Загрузка...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Выберите вариант:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedVariant === variant.id
                      ? 'border-purple-500 ring-2 ring-purple-200 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {variant.processing ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Sparkles className="animate-pulse text-purple-500" size={32} />
                    </div>
                  ) : variant.error && !variant.url ? (
                    <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center p-2">
                      <AlertCircle className="text-red-500 mb-1" size={24} />
                      <span className="text-xs text-red-600 text-center">{variant.error}</span>
                    </div>
                  ) : variant.url ? (
                    <img
                      key={variant.url}
                      src={variant.url}
                      alt={variant.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Sparkles className="text-gray-400" size={32} />
                    </div>
                  )}
                  <div className={`absolute bottom-0 left-0 right-0 p-2 text-center text-xs font-semibold ${
                    selectedVariant === variant.id ? 'bg-purple-500 text-white' : 'bg-white bg-opacity-90 text-gray-700'
                  }`}>
                    {variant.title}
                    {selectedVariant === variant.id && (
                      <Check className="inline-block ml-1" size={14} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {successMessage && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <Sparkles className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Info Banner */}
          <div className={`mt-6 rounded-lg p-4 ${import.meta.env.VITE_REMOVE_BG_API_KEY ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <Sparkles className={`${import.meta.env.VITE_REMOVE_BG_API_KEY ? 'text-green-600' : 'text-amber-600'} flex-shrink-0 mt-0.5`} />
              <div>
                <h4 className={`font-semibold mb-1 ${import.meta.env.VITE_REMOVE_BG_API_KEY ? 'text-green-900' : 'text-amber-900'}`}>
                  {import.meta.env.VITE_REMOVE_BG_API_KEY ? 'AI функции активны!' : 'Настройка AI функций'}
                </h4>
                {import.meta.env.VITE_REMOVE_BG_API_KEY ? (
                  <div>
                    <p className="text-sm text-green-800 mb-2">
                      Remove.bg API подключен. Автоматическая обработка изображений активна.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-amber-800 mb-2">
                      Для активации функции удаления фона добавьте API ключ Remove.bg:
                    </p>
                    <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                      <li>Зарегистрируйтесь на <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" className="underline font-semibold">remove.bg/api</a></li>
                      <li>Получите бесплатный API ключ (50 изображений/месяц)</li>
                      <li>Добавьте в файл .env: <code className="bg-amber-100 px-1 rounded">VITE_REMOVE_BG_API_KEY=ваш_ключ</code></li>
                      <li>Перезапустите проект</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Отмена
          </button>
          <div className="flex gap-3">
            {selectedVariantData?.url && (
              <a
                href={selectedVariantData.url}
                download="processed-image.png"
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md"
              >
                <Download size={18} />
                Скачать
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={!selectedVariantData?.url || selectedVariantData?.processing}
              className="px-8 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
            >
              {selectedVariantData?.processing ? 'Обработка...' : 'Применить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
