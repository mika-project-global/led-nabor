import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

const SUPPORTED_LOCALES = ['en', 'de', 'pl', 'cz', 'ru'];
const DEFAULT_LOCALE = 'en';

export function LocaleWrapper({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLocale();
  const hasSetLanguage = useRef(false);

  useEffect(() => {
    if (locale && !SUPPORTED_LOCALES.includes(locale)) {
      const newPath = location.pathname.replace(`/${locale}`, `/${DEFAULT_LOCALE}`);
      navigate(newPath, { replace: true });
      return;
    }

    if (locale && locale !== language && !hasSetLanguage.current) {
      hasSetLanguage.current = true;
      setLanguage(locale);
    }
  }, [locale, language, setLanguage, navigate, location.pathname]);

  return <>{children}</>;
}
