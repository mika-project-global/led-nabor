import { useLocale } from '../context/LocaleContext';
import i18next from 'i18next';

export function useTranslation() {
  const { language } = useLocale();

  const t = (key: string, params?: Record<string, string | number>): string => {
    try {
      // Use i18next's built-in translation functionality
      // i18next already handles fallback to English when translations are missing
      return i18next.t(key, params);
    } catch (error) {
      console.error('Translation error:', error);
      // If all else fails, return the key itself
      return key;
    }
  };

  return { t };
}