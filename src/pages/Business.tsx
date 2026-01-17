import React from 'react';
import { useTranslation } from 'react-i18next';
import { B2BCalculator } from '../components/B2BCalculator';
import { SEO } from '../components/SEO';

export default function Business() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={t('business_page.title')}
        description={t('business_page.description')}
      />

      <h1 className="text-4xl font-bold mb-12">{t('business_page.title')}</h1>

      <div className="space-y-12">
        <B2BCalculator />
      </div>
    </div>
  );
}
