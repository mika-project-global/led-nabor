import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Eye, Zap, Shield, CheckCircle, ArrowRight, BookOpen, Star, Home } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, getStaticPageAlternateUrls } from '../lib/urls';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';
import { useProductMinPrices } from '../hooks/useProductMinPrices';

export default function LedCeilingLightingHallway() {
  const { t, locale } = useTranslation();
  const { priceMap, formatPrice } = useProductMinPrices([1, 2]);

  const roomProducts = useMemo(() => products.filter(p => [1, 2].includes(p.id)), []);
  const alternateUrls = useMemo(() => getStaticPageAlternateUrls('/led-ceiling-lighting-hallway'), []);

  const blogArticles = [
    {
      slug: 'led-ceiling-lighting-guide',
      title: t('hallway_lighting.articles.article1_title', 'LED Ceiling Lighting Guide'),
      desc: t('hallway_lighting.articles.article1_desc', 'Complete LED ceiling lighting guide with planning, installation, and design tips for every room including hallways and corridors.'),
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop'
    },
    {
      slug: 'how-to-install-led-strip-lights',
      title: t('hallway_lighting.articles.article2_title', 'How to Install LED Strip Lights'),
      desc: t('hallway_lighting.articles.article2_desc', 'Step-by-step guide for installing LED strips on ceilings — perfect for narrow hallways and corridors.'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
    },
    {
      slug: 'led-ceiling-ideas-for-every-room',
      title: t('hallway_lighting.articles.article3_title', 'LED Ceiling Ideas for Every Room'),
      desc: t('hallway_lighting.articles.article3_desc', 'Inspiring design ideas for LED ceiling lighting across all room types, including hallways and entryways.'),
      image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop'
    }
  ];

  const benefits = [
    { icon: Eye, titleKey: 'hallway_lighting.benefits.visibility.title', descKey: 'hallway_lighting.benefits.visibility.desc' },
    { icon: ArrowLeftRight, titleKey: 'hallway_lighting.benefits.space.title', descKey: 'hallway_lighting.benefits.space.desc' },
    { icon: Zap, titleKey: 'hallway_lighting.benefits.energy.title', descKey: 'hallway_lighting.benefits.energy.desc' },
    { icon: Shield, titleKey: 'hallway_lighting.benefits.safety.title', descKey: 'hallway_lighting.benefits.safety.desc' }
  ];

  const featuresList = [
    { titleKey: 'hallway_lighting.features.linear.title', descKey: 'hallway_lighting.features.linear.desc' },
    { titleKey: 'hallway_lighting.features.motion.title', descKey: 'hallway_lighting.features.motion.desc' },
    { titleKey: 'hallway_lighting.features.night.title', descKey: 'hallway_lighting.features.night.desc' },
    { titleKey: 'hallway_lighting.features.narrow.title', descKey: 'hallway_lighting.features.narrow.desc' },
    { titleKey: 'hallway_lighting.features.instant.title', descKey: 'hallway_lighting.features.instant.desc' }
  ];

  const setupRows = [
    { labelKey: 'hallway_lighting.setup.temp_label', valueKey: 'hallway_lighting.setup.temp_value' },
    { labelKey: 'hallway_lighting.setup.brightness_label', valueKey: 'hallway_lighting.setup.brightness_value' },
    { labelKey: 'hallway_lighting.setup.length_label', valueKey: 'hallway_lighting.setup.length_value' },
    { labelKey: 'hallway_lighting.setup.control_label', valueKey: 'hallway_lighting.setup.control_value' },
    { labelKey: 'hallway_lighting.setup.install_label', valueKey: 'hallway_lighting.setup.install_value' }
  ];

  const faqItems = [
    { question: t('hallway_lighting.faq.q1.question'), answer: t('hallway_lighting.faq.q1.answer') },
    { question: t('hallway_lighting.faq.q2.question'), answer: t('hallway_lighting.faq.q2.answer') },
    { question: t('hallway_lighting.faq.q3.question'), answer: t('hallway_lighting.faq.q3.answer') },
    { question: t('hallway_lighting.faq.q4.question'), answer: t('hallway_lighting.faq.q4.answer') },
    { question: t('hallway_lighting.faq.q5.question'), answer: t('hallway_lighting.faq.q5.answer') },
    { question: t('hallway_lighting.faq.q6.question'), answer: t('hallway_lighting.faq.q6.answer') },
    { question: t('hallway_lighting.faq.q7.question'), answer: t('hallway_lighting.faq.q7.answer') },
    { question: t('hallway_lighting.faq.q8.question'), answer: t('hallway_lighting.faq.q8.answer') },
    { question: t('hallway_lighting.faq.q9.question'), answer: t('hallway_lighting.faq.q9.answer') }
  ];

  return (
    <>
      <SEO
        title={t('hallway_lighting.seo.title')}
        description={t('hallway_lighting.seo.description')}
        keywords="LED ceiling lighting hallway, hallway LED strips, narrow corridor LED lighting, motion sensor LED hallway, COB LED corridor, how to light a long hallway, hallway ceiling LED strip"
        alternateUrls={alternateUrls}
      />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-gray-900 via-zinc-800 to-gray-900 text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 80% 30%, #6b7280 0%, transparent 55%), radial-gradient(circle at 10% 70%, #374151 0%, transparent 50%)'
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-gray-500/20 border border-gray-500/30 rounded-full px-4 py-1.5 mb-6">
                <ArrowLeftRight className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300 text-sm font-medium">{t('hallway_lighting.badge')}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {t('hallway_lighting.hero.title_line1')}<br />
                <span className="text-gray-300">{t('hallway_lighting.hero.title_line2')}</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                {t('hallway_lighting.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/${locale}/catalog`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all duration-200 shadow-lg"
                >
                  {t('hallway_lighting.hero.cta_primary')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to={`/${locale}/installation-guide`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-600 hover:border-gray-300 text-gray-400 hover:text-gray-200 font-semibold rounded-xl transition-all duration-200"
                >
                  {t('hallway_lighting.hero.cta_secondary')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {t('hallway_lighting.intro.title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{t('hallway_lighting.intro.p1')}</p>
              <p>{t('hallway_lighting.intro.p2')}</p>
              <p>{t('hallway_lighting.intro.p3')}</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('hallway_lighting.benefits.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('hallway_lighting.benefits.subtitle')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl mb-4">
                    <benefit.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{t(benefit.titleKey)}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(benefit.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features + Setup */}
        <section className="py-12 md:py-16 bg-zinc-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  {t('hallway_lighting.features.title')}
                </h2>
                <div className="space-y-5">
                  {featuresList.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-gray-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">{t(item.titleKey)}: </span>
                        <span className="text-zinc-400">{t(item.descKey)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-3 text-lg">{t('hallway_lighting.setup.title')}</h3>
                  <div className="space-y-3">
                    {setupRows.map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-zinc-700 last:border-0">
                        <span className="text-zinc-400">{t(row.labelKey)}</span>
                        <span className="font-medium text-white">{t(row.valueKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop"
                    alt="Hallway LED ceiling lighting"
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
                {t('hallway_lighting.products.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('hallway_lighting.products.subtitle')}
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
                          <CheckCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-500">{t('hallway_lighting.products.from')}</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(priceMap[product.id] ?? Math.min(...product.variants.map(v => v.price)))}
                        </div>
                      </div>
                      <Link
                        to={getProductUrl(locale, product)}
                        className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors duration-200"
                      >
                        {t('hallway_lighting.products.view_kit')}
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
                {t('hallway_lighting.products.view_all')}
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
                <div className="text-2xl md:text-3xl font-bold text-gray-900">2–5 m</div>
                <div className="text-sm text-gray-500 mt-1">{t('hallway_lighting.stats.length_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">60–80%</div>
                <div className="text-sm text-gray-500 mt-1">{t('hallway_lighting.stats.savings_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('hallway_lighting.stats.lifespan_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('hallway_lighting.stats.lifespan_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('hallway_lighting.stats.warranty_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('hallway_lighting.stats.warranty_label')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Articles */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">{t('hallway_lighting.articles.title')}</h2>
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
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium mb-2">
                      <Star className="w-3.5 h-3.5" />
                      {t('hallway_lighting.articles.badge')}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{article.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-gray-600 text-sm font-medium">
                      {t('hallway_lighting.articles.read_more')} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Guide */}
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {t('hallway_lighting.seo_guide.title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{t('hallway_lighting.seo_guide.p1')}</p>
              <p dangerouslySetInnerHTML={{ __html: t('hallway_lighting.seo_guide.p2') }} />
              <p dangerouslySetInnerHTML={{ __html: t('hallway_lighting.seo_guide.p3') }} />
              <p dangerouslySetInnerHTML={{ __html: t('hallway_lighting.seo_guide.p4') }} />
              <p dangerouslySetInnerHTML={{ __html: t('hallway_lighting.seo_guide.p5') }} />
              <p dangerouslySetInnerHTML={{ __html: t('hallway_lighting.seo_guide.p6') }} />
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">{t('room_links.section_title')}</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { to: `/${locale}/led-ceiling-lighting-kitchen`, label: t('room_links.kitchen') },
                { to: `/${locale}/led-ceiling-lighting-bedroom`, label: t('room_links.bedroom') },
                { to: `/${locale}/led-ceiling-lighting-living-room`, label: t('room_links.living_room') },
                { to: `/${locale}/led-ceiling-lighting-bathroom`, label: t('room_links.bathroom') },
                { to: `/${locale}/led-ceiling-lighting-office`, label: t('room_links.office') },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 group"
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                  <span className="leading-tight">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              {t('hallway_lighting.faq.title')}
            </h2>
            <Accordion items={faqItems} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-zinc-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('hallway_lighting.cta.title')}
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              {t('hallway_lighting.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all duration-200 shadow-lg text-lg"
              >
                {t('hallway_lighting.cta.primary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={`/${locale}/support`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-600 hover:border-gray-300 text-gray-400 hover:text-gray-200 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                {t('hallway_lighting.cta.secondary')}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
