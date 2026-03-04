import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transform transition-all duration-500 backdrop-blur-sm border border-cyan-400/30 group ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
      }`}
      aria-label={t('common.scroll_to_top')}
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
    </button>
  );
}
