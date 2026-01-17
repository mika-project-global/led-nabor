import React, { useState } from 'react';
import { getOptimizedImageUrl, generateSrcSet } from '../lib/image-loader';
import { getImageUrl } from '../lib/supabase-storage';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  sizes = '100vw'
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fullSrc = getImageUrl(src);
  const optimizedSrc = getOptimizedImageUrl(fullSrc, width, height);
  const srcSet = generateSrcSet(fullSrc);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  const handleError = () => {
    if (!error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        return;
      }
      setError(true);
      setLoaded(true);
      console.error(`Failed to load image: ${fullSrc}`);
    }
  };

  const handleLoad = () => {
    if (!error) {
      setLoaded(true);
    }
  };

  if (error) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center text-center p-4 ${className}`}
        style={{ width, height }}
        role="img"
        aria-label="Изображение недоступно"
      >
        <span className="text-gray-400">Изображение недоступно</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {!loaded && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ aspectRatio: width && height ? `${width}/${height}` : 'auto' }}
        />
      )}
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        width={width}
        height={height}
        loading={loading}
        fetchpriority={loading === 'eager' ? 'high' : 'auto'}
        onError={handleError}
        onLoad={handleLoad}
        decoding="async"
        key={`${fullSrc}-${retryCount}`}
      />
    </div>
  );
}