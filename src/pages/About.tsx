import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Award, Clock, MapPin, Mail, Phone, Star, PenTool as Tool, Shield } from 'lucide-react';

const COMPANY_NAME = 'LED Nabor';
const COMPANY_EMAIL = 'info@led-nabor.com';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-cyan-600" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">{t('about.stats.customers')}</h3>
          <p className="text-gray-600">{t('about.stats.customers_count')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="text-cyan-600" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">{t('about.stats.experience')}</h3>
          <p className="text-gray-600">{t('about.stats.experience_count')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-cyan-600" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">{t('about.stats.quality')}</h3>
          <p className="text-gray-600">{t('about.stats.quality_value')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-cyan-600" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">{t('about.stats.warranty')}</h3>
          <p className="text-gray-600">{t('about.stats.warranty_value')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('about.how_we_work')}</h2>
          <div className="space-y-6 text-gray-600">
            <p>
              {t('about.how_we_work_desc')}
            </p>
            <div className="bg-cyan-50 p-6 rounded-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Tool className="text-cyan-600" />
                {t('about.no_tools_needed')}
              </h3>
              <p>
                {t('about.no_tools_desc')}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('about.advantages')}</h2>
          <div className="space-y-6 text-gray-600">
            <div>
              <h3 className="font-bold mb-2">{t('about.advantage_1_title')}</h3>
              <p>
                {t('about.advantage_1_desc')}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">{t('about.advantage_2_title')}</h3>
              <p>
                {t('about.advantage_2_desc')}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">{t('about.advantage_3_title')}</h3>
              <p>
                {t('about.advantage_3_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">{t('about.contact_info')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-cyan-600" />
              <span>{COMPANY_EMAIL}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-cyan-600" />
              <span>+420 777 888 999</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-cyan-600" />
              <span>Prague, 14000</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold">{t('about.working_hours')}</h3>
            <div>
              <p>{t('about.weekdays')}</p>
              <p>{t('about.weekends')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
