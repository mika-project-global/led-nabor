import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const COMPANY_NAME = 'LED Nabor';
const COMPANY_EMAIL = 'info@led-nabor.com';

interface FeedbackForm {
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
}

export default function Support() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FeedbackForm>({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setForm({ name: '', email: '', phone: '', city: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 className="text-3xl font-bold mb-6">{t('support.title')}</h1>
          <p className="text-gray-600 mb-8">
            {t('support.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('support.form.your_name')}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('support.form.email')}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('support.form.phone')}
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('support.form.city')}
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('support.form.message')}
              </label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {submitStatus === 'success' && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                {t('support.form.success')}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                {t('support.form.error')}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                t('support.form.sending')
              ) : (
                <>
                  <Send size={20} />
                  {t('support.form.send')}
                </>
              )}
            </button>
          </form>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{t('support.contact_info')}</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-4">{t('support.email_for_files')}</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="text-cyan-600" />
                  <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-cyan-600">
                    {COMPANY_EMAIL}
                  </a>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {t('support.email_for_files_desc')}
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-4">{t('support.phone')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="text-cyan-600" />
                    <div>
                      <a href="tel:+420777888999" className="hover:text-cyan-600">
                        +420 777 888 999
                      </a>
                      <span className="text-sm ml-2">{t('support.prague')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">{t('support.our_location')}</h3>
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="text-cyan-600 mt-1" />
                  <p>
                    Prague, 14000
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">{t('support.working_hours')}</h3>
                <div className="space-y-2 text-gray-600">
                  <p>{t('support.weekdays')}</p>
                  <p>{t('support.weekends')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
