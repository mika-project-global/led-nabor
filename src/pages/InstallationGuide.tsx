import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PenTool as Tool, AlertTriangle, CheckCircle, Lightbulb, Package } from 'lucide-react';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { getStaticPageAlternateUrls } from '../lib/urls';
import { useLocale } from '../context/LocaleContext';

interface InstallationVideo {
  video_url: string;
  step: number;
}

export default function InstallationGuide() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [videos, setVideos] = useState<InstallationVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from('installation_videos')
        .select('video_url, step_number')
        .eq('is_active', true)
        .order('order_position');

      if (error) throw error;

      const videoMap = (data || []).map(v => ({
        video_url: v.video_url,
        step: v.step_number
      }));

      setVideos(videoMap);
    } catch (error) {
      console.error('Error loading installation videos:', error);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    {
      number: 1,
      titleKey: 'installation_guide.step_1_title',
      descKey: 'installation_guide.step_1_desc',
      tips: ['installation_guide.step_1_tip_1', 'installation_guide.step_1_tip_2'],
      warnings: ['installation_guide.step_1_warning_1']
    },
    {
      number: 2,
      titleKey: 'installation_guide.step_2_title',
      descKey: 'installation_guide.step_2_desc',
      tips: ['installation_guide.step_2_tip_1', 'installation_guide.step_2_tip_2'],
      warnings: []
    },
    {
      number: 3,
      titleKey: 'installation_guide.step_3_title',
      descKey: 'installation_guide.step_3_desc',
      tips: ['installation_guide.step_3_tip_1', 'installation_guide.step_3_tip_2'],
      warnings: ['installation_guide.step_3_warning_1', 'installation_guide.step_3_warning_2']
    }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-5 md:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 md:py-8">
      <SEO
        title={t('installation_guide.title')}
        description={t('installation_guide.subtitle')}
        alternateUrls={getStaticPageAlternateUrls('/installation-guide')}
      />

      <div className="text-center mb-8 md:mb-10">
        <h1 className="heading-h1 mb-3">{t('installation_guide.title')}</h1>
        <p className="text-body-lg">{t('installation_guide.subtitle')}</p>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 md:p-5 mb-8 md:mb-10">
        <h2 className="heading-h3 mb-4 flex items-center gap-2">
          <Tool className="text-cyan-600" />
          {t('installation_guide.required_tools')}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-cyan-600" />
            {t('installation_guide.scissors')}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-cyan-600" />
            {t('installation_guide.measuring_tape')}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-cyan-600" />
            {t('installation_guide.pencil')}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-cyan-600" />
            {t('installation_guide.cleaning_supplies')}
          </li>
        </ul>
      </div>

      <div className="space-y-16">
        {steps.map((step) => {
          const videoData = videos.find(v => v.step === step.number);

          return (
            <div key={step.number} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {videoData && (
                <div>
                  <div className="relative h-64 rounded-lg shadow-lg overflow-hidden">
                    <video
                      src={videoData.video_url}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </div>
                </div>
              )}
              <div className={!videoData ? 'lg:col-span-2' : ''}>
                <h2 className="text-2xl font-bold mb-4">
                  <span className="text-cyan-600">{step.number}.</span> {t(step.titleKey)}
                </h2>
                <p className="text-gray-600 mb-6">{t(step.descKey)}</p>

                {step.tips.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                      <Lightbulb className="text-yellow-500" />
                      {t('installation_guide.helpful_tips')}
                    </h3>
                    <ul className="space-y-2">
                      {step.tips.map((tipKey, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-green-500 mt-1" />
                          <span>{t(tipKey)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {step.warnings.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                      <AlertTriangle className="text-red-500" />
                      {t('installation_guide.important_notes')}
                    </h3>
                    <ul className="space-y-2">
                      {step.warnings.map((warningKey, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle size={16} className="text-red-500 mt-1" />
                          <span className="text-red-600">{t(warningKey)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-10 border border-blue-100">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('installation_guide.cta_title')}
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            {t('installation_guide.cta_subtitle')}
          </p>
          <Link
            to={`/${locale}/led-ceiling-lighting-kit`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Package className="w-5 h-5" />
            {t('installation_guide.view_kits_button')}
          </Link>
        </div>
      </div>
    </div>
  );
}
