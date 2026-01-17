import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';

const COMPANY_NAME = 'LED Nabor';
const COMPANY_EMAIL = 'info@led-nabor.com';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-gradient-to-b from-white to-gray-50">
      <SEO
        title={t('terms_page.title')}
        description={t('terms_page.description')}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('terms_page.title')}</h1>
        <p className="text-gray-600">
          {t('terms_page.last_updated')} {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-12">
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">1.</span> {t('terms_page.section_1_title')}
          </h2>
          <p>{t('terms_page.section_1_desc')}</p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">2.</span> {t('terms_page.section_2_title')}
          </h2>
          <p>{t('terms_page.section_2_desc')}</p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">3.</span> {t('terms_page.section_3_title')}
          </h2>
          <p>{t('terms_page.section_3_desc')}</p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">4.</span> {t('terms_page.section_4_title')}
          </h2>
          <p>{t('terms_page.section_4_desc')}</p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">5.</span> {t('terms_page.section_5_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">5.1. {t('terms_page.section_5_1_title')}</h3>
              <p>{t('terms_page.section_5_1_desc')}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">5.2. {t('terms_page.section_5_2_title')}</h3>
              <p>{t('terms_page.section_5_2_desc')}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">5.3. {t('terms_page.section_5_3_title')}</h3>
              <p>{t('terms_page.section_5_3_desc')}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">6.</span> {t('terms_page.section_6_title')}
          </h2>
          <p>{t('terms_page.section_6_desc')}</p>
          <p className="mt-6">
            {t('terms_page.section_6_link')}{' '}
            <Link to="/privacy-policy" className="text-cyan-600 hover:text-cyan-700">
              {t('privacy_policy')}
            </Link>.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">7.</span> {t('terms_page.section_7_title')}
          </h2>
          <p>{t('terms_page.section_7_desc')}</p>
          <ul className="mt-4 space-y-2 pl-6">
            <li>{t('terms_page.section_7_item_1')}</li>
            <li>{t('terms_page.section_7_item_2')}</li>
            <li>{t('terms_page.section_7_item_3')}</li>
            <li>{t('terms_page.section_7_item_4')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">8.</span> {t('terms_page.section_8_title')}
          </h2>
          <p>{t('terms_page.section_8_desc')}</p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">9.</span> {t('terms_page.section_9_title')}
          </h2>
          <p>{t('terms_page.section_9_desc')}</p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>{t('terms_page.section_9_email')}</li>
            <li>{t('terms_page.section_9_phone')}</li>
            <li>{t('terms_page.section_9_address')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">10.</span> {t('terms_page.section_10_title')}
          </h2>
          <p>{t('terms_page.section_10_desc')}</p>
        </section>
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-bold mb-4">{t('terms_page.additional_info')}</h2>
        <p className="text-gray-600 mb-4">
          {t('terms_page.additional_info_desc')}{' '}
          <Link to="/privacy-policy" className="text-cyan-600 hover:text-cyan-700">
            {t('privacy_policy')}
          </Link>
          , {t('terms_page.additional_info_link')}
        </p>
        <p className="text-gray-600">
          {t('terms_page.additional_info_questions')}{' '}
          <Link to="/support" className="text-cyan-600 hover:text-cyan-700">
            {t('terms_page.support_team')}
          </Link>.
        </p>
      </div>
    </div>
  );
}
