import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, ShieldCheck, Zap, Sparkles, CheckCircle, ArrowRight, BookOpen, Star } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, getStaticPageAlternateUrls } from '../lib/urls';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';
import { useProductMinPrices } from '../hooks/useProductMinPrices';

export default function LedCeilingLightingBathroom() {
  const { t, locale } = useTranslation();
  const { priceMap, formatPrice } = useProductMinPrices([1, 2]);

  const roomProducts = useMemo(() => products.filter(p => [1, 2].includes(p.id)), []);
  const alternateUrls = useMemo(() => getStaticPageAlternateUrls('/led-ceiling-lighting-bathroom'), []);

  const blogArticles = [
    {
      slug: 'led-ceiling-lighting-guide',
      title: t('bathroom_lighting.articles.article1_title', 'LED Ceiling Lighting Guide'),
      desc: t('bathroom_lighting.articles.article1_desc', 'Complete LED ceiling lighting reference guide covering technology basics, planning, installation methods, and smart integration.'),
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop'
    },
    {
      slug: 'warm-vs-cool-led-lighting',
      title: t('bathroom_lighting.articles.article2_title', 'Warm or Cool LED Light: Complete Color Temperature Guide'),
      desc: t('bathroom_lighting.articles.article2_desc', 'How to choose the right LED color temperature for every room — including bathrooms.'),
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&auto=format&fit=crop'
    },
    {
      slug: 'how-to-install-led-strip-lights',
      title: t('bathroom_lighting.articles.article3_title', 'How to Install LED Strip Lights'),
      desc: t('bathroom_lighting.articles.article3_desc', 'Step-by-step installation guide for LED strip ceiling lighting with tips for moisture-prone areas.'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
    }
  ];

  const benefits = [
    { icon: Droplets, titleKey: 'bathroom_lighting.benefits.moisture.title', descKey: 'bathroom_lighting.benefits.moisture.desc' },
    { icon: ShieldCheck, titleKey: 'bathroom_lighting.benefits.safe.title', descKey: 'bathroom_lighting.benefits.safe.desc' },
    { icon: Zap, titleKey: 'bathroom_lighting.benefits.bright.title', descKey: 'bathroom_lighting.benefits.bright.desc' },
    { icon: Sparkles, titleKey: 'bathroom_lighting.benefits.uniform.title', descKey: 'bathroom_lighting.benefits.uniform.desc' }
  ];

  const featuresList = [
    { titleKey: 'bathroom_lighting.features.mirror.title', descKey: 'bathroom_lighting.features.mirror.desc' },
    { titleKey: 'bathroom_lighting.features.shadow.title', descKey: 'bathroom_lighting.features.shadow.desc' },
    { titleKey: 'bathroom_lighting.features.spa.title', descKey: 'bathroom_lighting.features.spa.desc' },
    { titleKey: 'bathroom_lighting.features.cri.title', descKey: 'bathroom_lighting.features.cri.desc' },
    { titleKey: 'bathroom_lighting.features.lowvoltage.title', descKey: 'bathroom_lighting.features.lowvoltage.desc' }
  ];

  const setupRows = [
    { labelKey: 'bathroom_lighting.setup.temp_label', valueKey: 'bathroom_lighting.setup.temp_value' },
    { labelKey: 'bathroom_lighting.setup.brightness_label', valueKey: 'bathroom_lighting.setup.brightness_value' },
    { labelKey: 'bathroom_lighting.setup.length_label', valueKey: 'bathroom_lighting.setup.length_value' },
    { labelKey: 'bathroom_lighting.setup.ip_label', valueKey: 'bathroom_lighting.setup.ip_value' },
    { labelKey: 'bathroom_lighting.setup.install_label', valueKey: 'bathroom_lighting.setup.install_value' }
  ];

  const faqItems = [
    { question: t('bathroom_lighting.faq.q1.question'), answer: t('bathroom_lighting.faq.q1.answer') },
    { question: t('bathroom_lighting.faq.q2.question'), answer: t('bathroom_lighting.faq.q2.answer') },
    { question: t('bathroom_lighting.faq.q3.question'), answer: t('bathroom_lighting.faq.q3.answer') },
    { question: t('bathroom_lighting.faq.q4.question'), answer: t('bathroom_lighting.faq.q4.answer') },
    { question: t('bathroom_lighting.faq.q5.question'), answer: t('bathroom_lighting.faq.q5.answer') }
  ];

  return (
    <>
      <SEO
        title={t('bathroom_lighting.seo.title')}
        description={t('bathroom_lighting.seo.description')}
        keywords="LED ceiling lighting bathroom, bathroom LED strips, moisture resistant LED, COB LED bathroom, bathroom ceiling lights"
        alternateUrls={alternateUrls}
      />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-25" style={{
            backgroundImage: 'radial-gradient(circle at 70% 40%, #0d9488 0%, transparent 55%), radial-gradient(circle at 10% 80%, #134e4a 0%, transparent 50%)'
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-4 py-1.5 mb-6">
                  <Droplets className="w-4 h-4 text-teal-400" />
                  <span className="text-teal-300 text-sm font-medium">{t('bathroom_lighting.badge')}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {t('bathroom_lighting.hero.title_line1')}<br />
                  <span className="text-teal-400">{t('bathroom_lighting.hero.title_line2')}</span>
                </h1>
                <p className="text-lg text-teal-100/80 mb-8 leading-relaxed">
                  {t('bathroom_lighting.hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/${locale}/catalog`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
                  >
                    {t('bathroom_lighting.hero.cta_primary')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to={`/${locale}/installation-guide`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-teal-700 hover:border-teal-400 text-teal-200 hover:text-teal-400 font-semibold rounded-xl transition-all duration-200"
                  >
                    {t('bathroom_lighting.hero.cta_secondary')}
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl hidden lg:block">
                <img
                  src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&auto=format&fit=crop"
                  alt="Modern bathroom with LED ceiling lighting"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {t('bathroom_lighting.intro.title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{t('bathroom_lighting.intro.p1')}</p>
              <p>{t('bathroom_lighting.intro.p2')}</p>
              <p>{t('bathroom_lighting.intro.p3')}</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('bathroom_lighting.benefits.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('bathroom_lighting.benefits.subtitle')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-xl mb-4">
                    <benefit.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{t(benefit.titleKey)}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(benefit.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features + Setup */}
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {t('bathroom_lighting.features.title')}
                </h2>
                <div className="space-y-5">
                  {featuresList.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-900">{t(item.titleKey)}: </span>
                        <span className="text-gray-600">{t(item.descKey)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{t('bathroom_lighting.setup.title')}</h3>
                  <div className="space-y-3">
                    {setupRows.map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-teal-100 last:border-0">
                        <span className="text-gray-500">{t(row.labelKey)}</span>
                        <span className="font-medium text-gray-900">{t(row.valueKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&auto=format&fit=crop"
                    alt="Bathroom LED ceiling lighting detail"
                    className="w-full h-56 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('bathroom_lighting.products.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('bathroom_lighting.products.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {roomProducts.map(product => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {product.images?.[0] && (
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={800}
                        height={450}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <div className="space-y-2 mb-5">
                      {product.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-500">{t('bathroom_lighting.products.from')}</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(priceMap[product.id] ?? Math.min(...product.variants.map(v => v.price)))}
                        </div>
                      </div>
                      <Link
                        to={getProductUrl(locale, product)}
                        className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors duration-200"
                      >
                        {t('bathroom_lighting.products.view_kit')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to={`/${locale}/catalog`}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold rounded-xl transition-all duration-200"
              >
                {t('bathroom_lighting.products.view_all')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">CRI 90+</div>
                <div className="text-sm text-gray-500 mt-1">{t('bathroom_lighting.stats.cri_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">12V/24V</div>
                <div className="text-sm text-gray-500 mt-1">{t('bathroom_lighting.stats.voltage_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('bathroom_lighting.stats.lifespan_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('bathroom_lighting.stats.lifespan_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('bathroom_lighting.stats.warranty_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('bathroom_lighting.stats.warranty_label')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Articles */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-teal-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t('bathroom_lighting.articles.title')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogArticles.map(article => (
                <Link
                  key={article.slug}
                  to={`/${locale}/blog/${article.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-medium mb-2">
                      <Star className="w-3.5 h-3.5" />
                      {t('bathroom_lighting.articles.badge')}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{article.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-teal-600 text-sm font-medium">
                      {t('bathroom_lighting.articles.read_more')} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              {t('bathroom_lighting.faq.title')}
            </h2>
            <Accordion items={faqItems} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('bathroom_lighting.cta.title')}
            </h2>
            <p className="text-teal-200 text-lg mb-8 max-w-2xl mx-auto">
              {t('bathroom_lighting.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-teal-50 text-teal-900 font-bold rounded-xl transition-all duration-200 shadow-lg text-lg"
              >
                {t('bathroom_lighting.cta.primary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={`/${locale}/support`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-teal-600 hover:border-white text-teal-200 hover:text-white font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                {t('bathroom_lighting.cta.secondary')}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
