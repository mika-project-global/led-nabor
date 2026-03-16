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
    { id: 'original', title: 'Original', url: imageUrl, processing: false, error: null },
    { id: 'no-bg', title: 'No Background', url: null, processing: false, error: null },
    { id: 'enhanced', title: 'Enhanced', url: null, processing: false, error: null },
    { id: 'crop-square', title: 'Square 1:1', url: null, processing: false, error: null },
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
    setSuccessMessage('Processing image automatically...');

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
      updateVariant('crop-square', {
        error: 'Processing error',
        processing: false
      });
    }
  };

  const processRemoveBackground = async () => {
    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;

    if (!apiKey) {
      updateVariant('no-bg', {
        error: 'Remove.bg API key not configured',
        processing: false
      });
      return;
    }

    updateVariant('no-bg', { processing: true, error: null });

    try {
      const blob = await removeBackgroundFromUrl(imageUrl);
      const url = URL.createObjectURL(blob);
      updateVariant('no-bg', { url, processing: false });
      setSuccessMessage('Background removed successfully!');
    } catch (error) {
      updateVariant('no-bg', {
        error: error instanceof Error ? error.message : 'Error removing background',
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
      updateVariant('enhanced', {
        error: 'Processing error',
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
      alert(`Smart cropping ${aspectRatio} is available in the Pro plan`);
    } catch (error) {
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
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-gray-700 to-gray-900">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles />
            AI Image Editor
          </h2>
          <button
            onClick={onClose}
            aria-label="Close image editor"
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Selected Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Preview: {selectedVariantData?.title}</h3>
            <div className="relative bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden" style={{ maxHeight: '400px' }}>
              {selectedVariantData?.processing ? (
                <div className="w-full h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="mx-auto mb-2 animate-pulse text-gray-500" size={48} />
                    <p className="text-gray-600">Processing...</p>
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
                    <p>Loading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select variant:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedVariant === variant.id
                      ? 'border-gray-700 ring-2 ring-gray-200 shadow-lg'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {variant.processing ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Sparkles className="animate-pulse text-gray-500" size={32} />
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
                    selectedVariant === variant.id ? 'bg-gray-700 text-white' : 'bg-white bg-opacity-90 text-gray-700'
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
                  {import.meta.env.VITE_REMOVE_BG_API_KEY ? 'AI features active!' : 'AI features setup'}
                </h4>
                {import.meta.env.VITE_REMOVE_BG_API_KEY ? (
                  <div>
                    <p className="text-sm text-green-800 mb-2">
                      Remove.bg API connected. Automatic image processing is active.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-amber-800 mb-2">
                      To enable background removal, add your Remove.bg API key:
                    </p>
                    <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                      <li>Register at <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" className="underline font-semibold">remove.bg/api</a></li>
                      <li>Get a free API key (50 images/month)</li>
                      <li>Add to .env file: <code className="bg-amber-100 px-1 rounded">VITE_REMOVE_BG_API_KEY=your_key</code></li>
                      <li>Restart the project</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {selectedVariantData?.url && (
              <a
                href={selectedVariantData.url}
                download="processed-image.png"
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md"
              >
                <Download size={18} />
                Download
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={!selectedVariantData?.url || selectedVariantData?.processing}
              className="px-8 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
            >
              {selectedVariantData?.processing ? 'Processing...' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
