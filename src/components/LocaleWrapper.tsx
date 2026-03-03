import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LOCALES = ['en', 'de', 'pl', 'cz', 'ru'];
const DEFAULT_LOCALE = 'en';

/**
 * LocaleWrapper - URL is the source of truth
 *
 * This component ensures that:
 * 1. The :locale param from URL is ALWAYS synced with i18n language
 * 2. Invalid locales are redirected to default locale
 * 3. User's choice is saved to localStorage (for LanguageRedirect)
 * 4. Every URL change triggers language update (no stale state)
 */
export function LocaleWrapper({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLocale } = useLocale();
  const { i18n } = useTranslation();

  useEffect(() => {
    console.log(`[LocaleWrapper] pathname="${location.pathname}", locale="${locale}", i18n.language="${i18n.language}"`);

    // Redirect invalid locales to default
    if (locale && !SUPPORTED_LOCALES.includes(locale)) {
      console.log(`[LocaleWrapper] Invalid locale "${locale}", redirecting to ${DEFAULT_LOCALE}`);
      const newPath = location.pathname.replace(`/${locale}`, `/${DEFAULT_LOCALE}`);
      navigate(newPath, { replace: true });
      return;
    }

    // URL is the source of truth - ALWAYS sync i18n with URL locale
    if (locale && SUPPORTED_LOCALES.includes(locale)) {
      // Update i18n language if it's different
      if (i18n && i18n.changeLanguage && i18n.language !== locale) {
        console.log(`[LocaleWrapper] Syncing i18n: "${i18n.language}" → "${locale}"`);
        i18n.changeLanguage(locale);
      }

      // Update LocaleContext
      setLocale(locale);

      // Update document language attribute
      if (document.documentElement.lang !== locale) {
        document.documentElement.lang = locale;
      }

      // Save to localStorage (for future visits via LanguageRedirect)
      localStorage.setItem('preferredLocale', locale);
    }
  }, [locale, navigate, location.pathname, setLocale, i18n]);

  return <>{children}</>;
}
