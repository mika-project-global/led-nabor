import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

export default function BuildYourKit() {
  const navigate = useNavigate();
  const { locale } = useLocale();

  useEffect(() => {
    navigate(`/${locale}/led-ceiling-lighting-kit`, { replace: true });
  }, [navigate, locale]);

  return null;
}
