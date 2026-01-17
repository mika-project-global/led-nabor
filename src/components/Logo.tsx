import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Logo({ className = '', size = 'medium' }: LogoProps) {
  const { siteLogo } = useSite();
  const { t } = useTranslation();
  const [logoError, setLogoError] = useState(false);

  const handleLogoError = () => {
    console.error('Logo failed to load:', siteLogo);
    setLogoError(true);
  };

  const isValidLogoUrl = siteLogo && typeof siteLogo === 'string';

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {isValidLogoUrl && !logoError ? (
          <img
            src={siteLogo}
            alt="LED Nabor Logo"
            className="w-full h-full object-contain"
            onError={handleLogoError}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <span className="text-3xl font-bold text-transparent relative">
              <span className="absolute inset-0 blur-[2px] text-cyan-400">N</span>
              <span className="absolute inset-0 text-cyan-300">N</span>
              <span className="relative text-white shadow-[0_0_10px_rgba(6,182,212,0.5),0_0_20px_rgba(6,182,212,0.3)]">N</span>
            </span>
          </div>
        )}
      </div>
      <div>
        <h1 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            LED Nabor
          </span>
        </h1>
        <span className="text-sm text-gray-500 block -mt-1">
          {t('site.tagline')}
        </span>
      </div>
    </div>
  );
}