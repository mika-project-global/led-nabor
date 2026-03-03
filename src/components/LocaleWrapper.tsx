import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LOCALES = ['en', 'de', 'pl', 'cz', 'ru'];
const DEFAULT_LOCALE = 'en';

export function LocaleWrapper({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLocale } = useLocale();
  const { i18n } = useTranslation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!locale) return;

    if (!SUPPORTED_LOCALES.includes(locale)) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        const newPath = location.pathname.replace(`/${locale}`, `/${DEFAULT_LOCALE}`);
        navigate(newPath, { replace: true });
      }
      return;
    }

    hasRedirectedRef.current = false;

    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }

    setLocale(locale);

    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }

    const saved = localStorage.getItem('preferredLocale');
    if (saved !== locale) {
      localStorage.setItem('preferredLocale', locale);
    }
  }, [locale]);

  return <>{children}</>;
}
