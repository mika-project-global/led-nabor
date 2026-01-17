import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function LoadingState({ message = 'Загрузка...', size = 'medium', className = '' }: LoadingStateProps) {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`} role="status" aria-live="polite">
      <div className={`${sizes[size]} border-4 border-cyan-500 border-t-transparent rounded-full animate-spin`} />
      {message && (
        <p className="mt-4 text-gray-600" aria-label={message}>{message}</p>
      )}
    </div>
  );
}