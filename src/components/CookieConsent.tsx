import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../context/LocaleContext';

export function CookieConsent() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-200 p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {t('cookie_consent.message')}{' '}
          <Link to={`/${locale}/privacy-policy`} className="text-cyan-600 hover:text-cyan-700">
            {t('cookie_consent.privacy_policy')}
          </Link>{' '}
          {t('cookie_consent.and')}{' '}
          <Link to={`/${locale}/terms`} className="text-cyan-600 hover:text-cyan-700">
            {t('cookie_consent.terms')}
          </Link>.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleReject}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('cookie_consent.reject')}
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-sm font-medium bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            {t('cookie_consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
