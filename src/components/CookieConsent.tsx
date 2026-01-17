import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function CookieConsent() {
  const { t } = useTranslation();
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

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-gray-600">
          {t('cookie_consent.message')}{' '}
          <Link to="/privacy-policy" className="text-cyan-600 hover:text-cyan-700">
            {t('cookie_consent.privacy_policy')}
          </Link>{' '}
          {t('cookie_consent.and')}{' '}
          <Link to="/terms" className="text-cyan-600 hover:text-cyan-700">
            {t('cookie_consent.terms')}
          </Link>.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAccept}
            className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            {t('cookie_consent.accept')}
          </button>
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
