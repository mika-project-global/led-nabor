import { Navigate } from 'react-router-dom';

const SUPPORTED_LOCALES = ['en', 'de', 'pl', 'cz', 'ru', 'uk'];
const DEFAULT_LOCALE = 'en';

/**
 * Redirects from root "/" to the appropriate locale-based path
 * Priority:
 * 1. localStorage preferredLocale (user's previous choice)
 * 2. navigator.language (browser language)
 * 3. DEFAULT_LOCALE (fallback to 'en')
 */
export function LanguageRedirect() {
  let targetLocale = DEFAULT_LOCALE;

  // Priority 1: Check localStorage for user's preferred language
  const savedLocale = localStorage.getItem('preferredLocale');
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    targetLocale = savedLocale;
  } else {
    // Priority 2: Check browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();

    // Map browser locale to our supported locales
    const localeMap: Record<string, string> = {
      'cs': 'cz', // Czech
      'ru': 'ru',
      'uk': 'uk', // Ukrainian
      'de': 'de',
      'pl': 'pl',
      'en': 'en'
    };

    const mappedLocale = localeMap[browserLang];
    if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
      targetLocale = mappedLocale;
    }
  }

  return <Navigate to={`/${targetLocale}/`} replace />;
}
