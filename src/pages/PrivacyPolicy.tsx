import React from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const COMPANY_NAME = 'LED Nabor';
const COMPANY_EMAIL = 'info@led-nabor.com';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-gradient-to-b from-white to-gray-50">
      <SEO
        title={t('privacy_page.title')}
        description={t('privacy_page.description')}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('privacy_page.title')}</h1>
        <p className="text-gray-600">
          {t('privacy_page.last_updated')} {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-12">
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">1.</span> {t('privacy_page.section_1_title')}
          </h2>
          <p>
            {t('privacy_page.section_1_desc')}
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">2.</span> {t('privacy_page.section_2_title')}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">{t('privacy_page.section_2_1_title')}</h3>
              <p>{t('privacy_page.section_2_1_desc')}</p>
              <ul className="mt-4 space-y-4">
                <li>
                  <strong>{t('privacy_page.contact_information')}</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 ml-6">
                    <li>{t('privacy_page.email_address')}</li>
                    <li>{t('privacy_page.name')}</li>
                    <li>{t('privacy_page.phone_number')}</li>
                  </ul>
                </li>
                <li>
                  <strong>{t('privacy_page.address_information')}</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 ml-6">
                    <li>{t('privacy_page.delivery_address')}</li>
                    <li>{t('privacy_page.city')}</li>
                    <li>{t('privacy_page.postal_code')}</li>
                    <li>{t('privacy_page.country')}</li>
                  </ul>
                </li>
                <li>
                  <strong>{t('privacy_page.technical_data')}</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 ml-6">
                    <li>{t('privacy_page.ip_address')}</li>
                    <li>{t('privacy_page.device_type')}</li>
                    <li>{t('privacy_page.browser_type')}</li>
                    <li>{t('privacy_page.language_preferences')}</li>
                  </ul>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">{t('privacy_page.section_2_2_title')}</h3>
              <p>{t('privacy_page.section_2_2_desc')}</p>
              <ul className="mt-4 space-y-2 text-gray-600 ml-6">
                <li>{t('privacy_page.use_item_1')}</li>
                <li>{t('privacy_page.use_item_2')}</li>
                <li>{t('privacy_page.use_item_3')}</li>
                <li>{t('privacy_page.use_item_4')}</li>
                <li>{t('privacy_page.use_item_5')}</li>
                <li>{t('privacy_page.use_item_6')}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">3.</span> {t('privacy_page.section_3_title')}
          </h2>
          <p>
            {t('privacy_page.section_3_desc')}
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 ml-6">
            <li>{t('privacy_page.security_item_1')}</li>
            <li>{t('privacy_page.security_item_2')}</li>
            <li>{t('privacy_page.security_item_3')}</li>
            <li>{t('privacy_page.security_item_4')}</li>
            <li>{t('privacy_page.security_item_5')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">4.</span> {t('privacy_page.section_4_title')}
          </h2>
          <p>
            {t('privacy_page.section_4_desc')}
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 ml-6">
            <li>{t('privacy_page.disclosure_item_1')}</li>
            <li>{t('privacy_page.disclosure_item_2')}</li>
            <li>{t('privacy_page.disclosure_item_3')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">5.</span> {t('privacy_page.section_5_title')}
          </h2>
          <p>
            {t('privacy_page.section_5_desc')}
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 ml-6">
            <li>{t('privacy_page.rights_item_1')}</li>
            <li>{t('privacy_page.rights_item_2')}</li>
            <li>{t('privacy_page.rights_item_3')}</li>
            <li>{t('privacy_page.rights_item_4')}</li>
            <li>{t('privacy_page.rights_item_5')}</li>
            <li>{t('privacy_page.rights_item_6')}</li>
          </ul>
          <p className="mt-4">
            {t('privacy_page.section_5_footer')}
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">6.</span> {t('privacy_page.section_6_title')}
          </h2>
          <p>
            {t('privacy_page.section_6_desc')}
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 ml-6">
            <li>{t('privacy_page.cookies_item_1')}</li>
            <li>{t('privacy_page.cookies_item_2')}</li>
            <li>{t('privacy_page.cookies_item_3')}</li>
            <li>{t('privacy_page.cookies_item_4')}</li>
          </ul>
          <p className="mt-4">
            {t('privacy_page.section_6_footer')}
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">7.</span> {t('privacy_page.section_7_title')}
          </h2>
          <p>
            {t('privacy_page.section_7_desc')}
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>{t('privacy_page.section_7_email')} {COMPANY_EMAIL}</li>
            <li>{t('privacy_page.section_7_phone')}</li>
            <li>{t('privacy_page.section_7_address')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-cyan-600">8.</span> {t('privacy_page.section_8_title')}
          </h2>
          <p>
            {t('privacy_page.section_8_desc')}
          </p>
          <p className="mt-6 text-gray-600">
            {t('privacy_page.section_8_footer')}
          </p>
        </section>

        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-4">{t('privacy_page.additional_info')}</h2>
          <p className="mb-4">
            {t('privacy_page.additional_info_desc')}{' '}
            <Link to="/terms" className="text-cyan-600 hover:text-cyan-700">
              {t('terms_of_use')}
            </Link>
            {t('privacy_page.additional_info_link')}
          </p>
          <p>
            {t('privacy_page.additional_info_questions')}{' '}
            <Link to="/support" className="text-cyan-600 hover:text-cyan-700">
              {t('terms_page.support_team')}
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
