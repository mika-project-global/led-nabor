import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { useBlogTranslations } from '../context/BlogTranslationsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cz', name: 'Čeština', flag: '🇨🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export function LocaleSwitcher() {
  const { language, setLanguage } = useLocale();
  const { translations } = useBlogTranslations();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  const handleLanguageChange = (langCode: string) => {
    // If we have blog translations (on blog post page), use them
    if (translations && Object.keys(translations).length > 0) {
      const translatedUrl = translations[langCode];

      if (translatedUrl) {
        // Navigate to the translated post
        localStorage.setItem('preferredLocale', langCode);
        navigate(translatedUrl);
        setIsOpen(false);
        return;
      } else {
        // Translation not available, go to blog list
        localStorage.setItem('preferredLocale', langCode);
        navigate(`/${langCode}/blog/`);
        setIsOpen(false);
        return;
      }
    }

    // Default behavior: replace locale in path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const hasTrailingSlash = location.pathname.endsWith('/');

    let newPath: string;
    if (pathSegments.length > 0 && LANGUAGES.some(l => l.code === pathSegments[0])) {
      pathSegments[0] = langCode;
      newPath = '/' + pathSegments.join('/');
      // Preserve trailing slash
      if (hasTrailingSlash && !newPath.endsWith('/')) {
        newPath += '/';
      }
      newPath += location.search;
    } else {
      newPath = `/${langCode}/`;
    }

    // Save user's choice to localStorage (for LanguageRedirect on next visit)
    localStorage.setItem('preferredLocale', langCode);

    // Navigate to new URL - LocaleWrapper will handle the rest
    navigate(newPath);

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                language === lang.code ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}