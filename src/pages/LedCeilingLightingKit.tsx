import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Lightbulb } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { SEO } from '../components/SEO';
import { getStaticPageAlternateUrls, SITE_URL, getProductUrl } from '../lib/urls';
import { products } from '../data/products';
import { getImageUrl } from '../lib/supabase-storage';

export default function LedCeilingLightingKit() {
  const { t } = useTranslation();
  const { locale, formatPrice } = useLocale();

  const alternateUrls = getStaticPageAlternateUrls('/led-ceiling-lighting-kit');
  const canonicalUrl = `${SITE_URL}/${locale}/led-ceiling-lighting-kit/`;

  const universalRgb = products.find(p => p.id === 1);
  const adjustableWhite = products.find(p => p.id === 2);

  const featuredProducts = [universalRgb, adjustableWhite].filter(Boolean);

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop',
      title: 'Modern Living Room'
    },
    {
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop',
      title: 'Contemporary Bedroom'
    },
    {
      url: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&auto=format&fit=crop',
      title: 'Elegant Kitchen'
    },
    {
      url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop',
      title: 'Luxury Dining Room'
    }
  ];

  const installationSteps = [
    { number: 1, text: t('led_ceiling_kit.installation_step_1') },
    { number: 2, text: t('led_ceiling_kit.installation_step_2') },
    { number: 3, text: t('led_ceiling_kit.installation_step_3') }
  ];

  const faqItems = [
    { question: t('led_ceiling_kit.faq_q1'), answer: t('led_ceiling_kit.faq_a1') },
    { question: t('led_ceiling_kit.faq_q2'), answer: t('led_ceiling_kit.faq_a2') },
    { question: t('led_ceiling_kit.faq_q3'), answer: t('led_ceiling_kit.faq_a3') },
    { question: t('led_ceiling_kit.faq_q4'), answer: t('led_ceiling_kit.faq_a4') }
  ];

  return (
    <>
      <SEO
        title={t('led_ceiling_kit.seo_title')}
        description={t('led_ceiling_kit.seo_description')}
        type="website"
        alternateUrls={alternateUrls}
        canonicalUrl={canonicalUrl}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative py-8 md:py-14 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 opacity-60"></div>
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center space-y-4 md:space-y-5">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {t('led_ceiling_kit.hero_title')}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {t('led_ceiling_kit.hero_subtitle')}
              </p>
              <div className="pt-3">
                <a
                  href="#kits"
                  className="inline-flex items-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-cyan-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('led_ceiling_kit.hero_cta')}
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why LED Ceiling Lighting */}
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 border border-gray-100">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-2xl font-bold text-gray-900 mb-3">
                    {t('led_ceiling_kit.why_title')}
                  </h2>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('led_ceiling_kit.why_text')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Kits Section */}
        <section id="kits" className="py-8 md:py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              {t('led_ceiling_kit.kits_title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-5 md:gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="text-xl md:text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    {product.id === 1 && (
                      <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full">
                        <span className="text-xs font-medium text-amber-700">
                          {t('led_ceiling_kit.popular_badge')}
                        </span>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm md:text-base mb-3 line-clamp-2">
                      {product.description.split('\n')[2]}
                    </p>
                    <div className="mb-3">
                      <div className="text-sm text-gray-500 mb-1">
                        {t('product.from')}
                      </div>
                      <div className="text-2xl md:text-2xl font-bold text-cyan-600">
                        {formatPrice(product.variants[0].price)}
                      </div>
                    </div>
                    <Link
                      to={getProductUrl(locale, product)}
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors w-full justify-center"
                    >
                      {t('led_ceiling_kit.view_product')}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('led_ceiling_kit.gallery_title')}
              </h2>
              <p className="text-lg md:text-lg text-gray-600">
                {t('led_ceiling_kit.gallery_subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="text-lg font-semibold">{image.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Installation Steps */}
        <section className="py-8 md:py-12 px-4 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              {t('led_ceiling_kit.installation_title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-5 md:gap-6">
              {installationSteps.map((step) => (
                <div key={step.number} className="relative">
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg h-full">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 mx-auto">
                      {step.number}
                    </div>
                    <p className="text-center text-base text-gray-700 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                  {step.number < installationSteps.length && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-cyan-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              {t('led_ceiling_kit.faq_title')}
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 md:p-5 border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.question}
                      </h3>
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-12 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-3xl font-bold mb-4">
              {locale === 'ru' ? 'Готовы преобразить ваш интерьер?' : 'Ready to Transform Your Space?'}
            </h2>
            <p className="text-lg md:text-lg mb-6 text-gray-300">
              {locale === 'ru'
                ? 'Выберите идеальный комплект LED подсветки для вашего потолка'
                : 'Choose the perfect LED ceiling lighting kit for your home'}
            </p>
            <a
              href="#kits"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg text-base md:text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              {t('led_ceiling_kit.hero_cta')}
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-6 md:py-8 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <Link
                to={`/${locale}/installation-guide`}
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5">{t('menu.installation_guide')}</h3>
                <p className="text-sm text-gray-600">{locale === 'ru' ? 'Узнайте как установить' : 'Learn how to install'}</p>
              </Link>
              <Link
                to={`/${locale}/blog`}
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5">{t('menu.blog')}</h3>
                <p className="text-sm text-gray-600">{locale === 'ru' ? 'Полезные статьи' : 'Helpful articles'}</p>
              </Link>
              <Link
                to={`/${locale}/support`}
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5">{t('menu.support')}</h3>
                <p className="text-sm text-gray-600">{locale === 'ru' ? 'Нужна помощь?' : 'Need help?'}</p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
