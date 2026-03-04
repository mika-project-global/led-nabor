import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { getImageUrl } from '../lib/supabase-storage';
import { RecentReviews } from '../components/RecentReviews';
import { CategoryGridSkeleton } from '../components/SkeletonLoader';
import { getProductUrl, getCategoryUrl, getStaticPageAlternateUrls, SITE_URL } from '../lib/urls';
import { SEO } from '../components/SEO';

export default function Catalog() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CategoryGridSkeleton count={categories.length} />
      </main>
    );
  }

  const homeAlternateUrls = getStaticPageAlternateUrls('');
  const canonicalUrl = `${SITE_URL}/${locale}/`;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="LED Nabor - LED Strip Lights for Ceiling Lighting"
        description="Professional LED strip lights for ceiling lighting. RGB+CCT and adjustable white options. Easy installation, WiFi control, 10-year lifespan. Free shipping across Europe."
        type="website"
        alternateUrls={homeAlternateUrls}
        canonicalUrl={canonicalUrl}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(category => {
          // Находим все товары в данной категории
          const categoryProducts = products.filter(p => p.category === category.id);

          // Определяем URL для ссылки
          const linkUrl = categoryProducts.length === 1
            ? getProductUrl(locale, categoryProducts[0])
            : getCategoryUrl(locale, category.id);
          
          return (
            <Link 
              key={category.id}
              to={linkUrl}
              className="group block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <img
                  src={category.image}
                  alt={t(`categories.${category.id}.name`)}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                  <h3 className="text-4xl font-bold mb-3 group-hover:translate-y-[-5px] transition-transform">
                    {t(`categories.${category.id}.name`)}
                  </h3>
                  <p className="text-lg text-gray-100 group-hover:translate-y-[-5px] transition-transform delay-75">
                    {t(`categories.${category.id}.description`)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* LED Ceiling Lighting Kit CTA */}
      <div className="mt-16 mb-8">
        <Link
          to={`/${locale}/led-ceiling-lighting-kit`}
          className="block bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02]"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-white">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {t('menu.ceiling_lighting_kit')}
              </h2>
              <p className="text-lg md:text-xl text-white/90">
                {locale === 'ru'
                  ? 'Готовые комплекты COB LED подсветки для вашего потолка. Простая установка и профессиональный результат.'
                  : 'Complete COB LED ceiling lighting kits for your home. Easy installation and professional results.'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
                {locale === 'ru' ? 'Подробнее' : 'Learn More'}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Reviews Section */}
      <RecentReviews />
    </main>
  );
}