import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle, AlertTriangle, HelpCircle, FileText, Send } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function Warranty() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'register' | 'extend'>('info');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setEmail('');
      setOrderNumber('');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={t('warranty_page.title')}
        description={t('warranty_page.subtitle')}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('warranty_page.title')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('warranty_page.subtitle')}
        </p>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-white rounded-lg p-8 shadow-lg border border-cyan-100 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('warranty_page.standard_warranty')}</h3>
            <p className="text-gray-600">{t('warranty_page.standard_warranty_desc')}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('warranty_page.technical_support')}</h3>
            <p className="text-gray-600">{t('warranty_page.technical_support_desc')}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('warranty_page.service_life')}</h3>
            <p className="text-gray-600">{t('warranty_page.service_life_desc')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-4 font-medium text-center ${
              activeTab === 'info'
                ? 'text-cyan-600 border-b-2 border-cyan-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('warranty_page.tabs.info')}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 font-medium text-center ${
              activeTab === 'register'
                ? 'text-cyan-600 border-b-2 border-cyan-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('warranty_page.tabs.register')}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">{t('warranty_page.what_covered')}</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{t('warranty_page.covered_power_supply')}</h3>
                    <p className="text-gray-600">{t('warranty_page.covered_power_supply_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{t('warranty_page.covered_controller')}</h3>
                    <p className="text-gray-600">{t('warranty_page.covered_controller_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{t('warranty_page.covered_led_strip')}</h3>
                    <p className="text-gray-600">{t('warranty_page.covered_led_strip_desc')}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 mt-8">{t('warranty_page.what_not_covered')}</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{t('warranty_page.not_covered_mechanical')}</h3>
                    <p className="text-gray-600">{t('warranty_page.not_covered_mechanical_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{t('warranty_page.not_covered_installation')}</h3>
                    <p className="text-gray-600">{t('warranty_page.not_covered_installation_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{t('warranty_page.not_covered_wear')}</h3>
                    <p className="text-gray-600">{t('warranty_page.not_covered_wear_desc')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-50 p-6 rounded-lg mt-8">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="text-cyan-600" />
                  {t('warranty_page.important_info')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">•</span>
                    <span>{t('warranty_page.important_1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">•</span>
                    <span>{t('warranty_page.important_2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">•</span>
                    <span>{t('warranty_page.important_3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
          {activeTab === 'register' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">{t('warranty_page.product_registration')}</h2>
              <p className="text-gray-600 mb-6">
                {t('warranty_page.product_registration_desc')}
              </p>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('warranty_page.order_number')}
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder={t('warranty_page.order_number_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('warranty_page.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder={t('warranty_page.email_placeholder')}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    {t('warranty_page.agree_terms')}{' '}
                    <a href="/terms" className="text-cyan-600 hover:text-cyan-700">
                      {t('warranty_page.warranty_terms')}
                    </a>{' '}
                    {t('warranty_page.and')}{' '}
                    <a href="/privacy-policy" className="text-cyan-600 hover:text-cyan-700">
                      {t('warranty_page.privacy_policy')}
                    </a>.
                  </label>
                </div>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                    {t('warranty_page.success_registration')}
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    {t('warranty_page.error_registration')}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('warranty_page.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>{t('warranty_page.register_product')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">{t('warranty_page.faq_title')}</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-2">{t('warranty_page.faq_1_q')}</h3>
            <p className="text-gray-600">
              {t('warranty_page.faq_1_a')}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">{t('warranty_page.faq_2_q')}</h3>
            <p className="text-gray-600">
              {t('warranty_page.faq_2_a')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
