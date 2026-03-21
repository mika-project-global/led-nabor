import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Brain, Zap, Eye, CheckCircle, ArrowRight, BookOpen, Star, Home } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, getStaticPageAlternateUrls } from '../lib/urls';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';
import { useProductMinPrices } from '../hooks/useProductMinPrices';

export default function LedCeilingLightingOffice() {
  const { t, locale } = useTranslation();
  const { priceMap, formatPrice } = useProductMinPrices([1, 2]);

  const roomProducts = useMemo(() => products.filter(p => [1, 2].includes(p.id)), []);
  const alternateUrls = useMemo(() => getStaticPageAlternateUrls('/led-ceiling-lighting-office'), []);

  const blogArticles = [
    {
      slug: 'led-ceiling-lighting-guide',
      title: t('office_lighting.articles.article1_title', 'LED Ceiling Lighting Guide'),
      desc: t('office_lighting.articles.article1_desc', 'Complete reference guide to LED ceiling lighting technology, planning, and installation for home offices and workspaces.'),
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop'
    },
    {
      slug: 'how-many-lumens-for-ceiling-lighting',
      title: t('office_lighting.articles.article2_title', 'How Many Lumens for Ceiling Lighting?'),
      desc: t('office_lighting.articles.article2_desc', 'Lumen requirements by room type including office spaces — learn how to calculate the right brightness for focused work.'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop'
    },
    {
      slug: 'smart-led-ceiling-lighting',
      title: t('office_lighting.articles.article3_title', 'Smart LED Ceiling Lighting'),
      desc: t('office_lighting.articles.article3_desc', 'How smart LED systems with scheduling and automation improve productivity and reduce eye strain in home offices.'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
    }
  ];

  const benefits = [
    { icon: Brain, titleKey: 'office_lighting.benefits.focus.title', descKey: 'office_lighting.benefits.focus.desc' },
    { icon: Eye, titleKey: 'office_lighting.benefits.eyestrain.title', descKey: 'office_lighting.benefits.eyestrain.desc' },
    { icon: Zap, titleKey: 'office_lighting.benefits.energy.title', descKey: 'office_lighting.benefits.energy.desc' },
    { icon: Monitor, titleKey: 'office_lighting.benefits.glare.title', descKey: 'office_lighting.benefits.glare.desc' }
  ];

  const featuresList = [
    { titleKey: 'office_lighting.features.cct.title', descKey: 'office_lighting.features.cct.desc' },
    { titleKey: 'office_lighting.features.flicker.title', descKey: 'office_lighting.features.flicker.desc' },
    { titleKey: 'office_lighting.features.schedule.title', descKey: 'office_lighting.features.schedule.desc' },
    { titleKey: 'office_lighting.features.cri.title', descKey: 'office_lighting.features.cri.desc' },
    { titleKey: 'office_lighting.features.uniform.title', descKey: 'office_lighting.features.uniform.desc' }
  ];

  const setupRows = [
    { labelKey: 'office_lighting.setup.temp_label', valueKey: 'office_lighting.setup.temp_value' },
    { labelKey: 'office_lighting.setup.brightness_label', valueKey: 'office_lighting.setup.brightness_value' },
    { labelKey: 'office_lighting.setup.length_label', valueKey: 'office_lighting.setup.length_value' },
    { labelKey: 'office_lighting.setup.control_label', valueKey: 'office_lighting.setup.control_value' },
    { labelKey: 'office_lighting.setup.install_label', valueKey: 'office_lighting.setup.install_value' }
  ];

  const faqItems = [
    { question: t('office_lighting.faq.q1.question'), answer: t('office_lighting.faq.q1.answer') },
    { question: t('office_lighting.faq.q2.question'), answer: t('office_lighting.faq.q2.answer') },
    { question: t('office_lighting.faq.q3.question'), answer: t('office_lighting.faq.q3.answer') },
    { question: t('office_lighting.faq.q4.question'), answer: t('office_lighting.faq.q4.answer') },
    { question: t('office_lighting.faq.q5.question'), answer: t('office_lighting.faq.q5.answer') },
    { question: 'How many lumens do I need for a home office ceiling?', answer: 'Office work requires 300–500 lux at desk level — roughly 3–5× more than a bedroom needs. For a 9 m² home office, use LED strips delivering 1000–1200 lm/m around the perimeter, supplemented by a desk task lamp. This ensures you are not straining your eyes during video calls or extended document work throughout the day.' },
    { question: 'What color temperature promotes focus and productivity in a home office?', answer: '4000K–5000K (neutral to cool white) is the scientifically-backed range for focused cognitive work, mimicking midday daylight that supports alertness and concentration. Avoid harsh 6500K+ for extended sessions as it becomes fatiguing. CCT-adjustable strips let you run 5000K in the morning and shift to 4000K in the afternoon to reduce accumulated fatigue.' },
    { question: 'Can ceiling LED lighting cause eye strain during computer work?', answer: 'Poorly chosen LEDs can cause eye strain, but high-quality strips avoid it. Use flicker-free strips (PWM frequency >1000 Hz or constant-current DC drivers), position strips so they do not reflect directly in your monitor screen, and choose 4000K–5000K rather than warm 2700K. Our office-rated strips are tested flicker-free and designed for prolonged screen work.' },
    { question: 'Is LED ceiling lighting better than a desk lamp alone for a home office?', answer: 'Use both together for the best result. LED ceiling strips provide even ambient illumination that eliminates the harsh contrast between a bright desk lamp and a dark surrounding environment — a major cause of eye fatigue on video calls. Ceiling perimeter strips at 60–70% brightness combined with a focused desk lamp gives the most comfortable and productive working environment.' }
  ];

  return (
    <>
      <SEO
        title={t('office_lighting.seo.title')}
        description={t('office_lighting.seo.description')}
        keywords="LED ceiling lighting office, home office LED strips, flicker-free office lighting, best LED color temperature home office, how many lumens office ceiling, COB LED workspace, eye strain LED office"
        alternateUrls={alternateUrls}
      />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-25" style={{
            backgroundImage: 'radial-gradient(circle at 70% 35%, #1d4ed8 0%, transparent 55%), radial-gradient(circle at 10% 75%, #1e3a8a 0%, transparent 50%)'
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">{t('office_lighting.badge')}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {t('office_lighting.hero.title_line1')}<br />
                  <span className="text-blue-400">{t('office_lighting.hero.title_line2')}</span>
                </h1>
                <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
                  {t('office_lighting.hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/${locale}/catalog`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    {t('office_lighting.hero.cta_primary')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to={`/${locale}/installation-guide`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-blue-700 hover:border-blue-400 text-blue-200 hover:text-blue-400 font-semibold rounded-xl transition-all duration-200"
                  >
                    {t('office_lighting.hero.cta_secondary')}
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl hidden lg:block">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop"
                  alt="Modern office with LED ceiling lighting"
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
              {t('office_lighting.intro.title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{t('office_lighting.intro.p1')}</p>
              <p>{t('office_lighting.intro.p2')}</p>
              <p>{t('office_lighting.intro.p3')}</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('office_lighting.benefits.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('office_lighting.benefits.subtitle')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
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
                  {t('office_lighting.features.title')}
                </h2>
                <div className="space-y-5">
                  {featuresList.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-900">{t(item.titleKey)}: </span>
                        <span className="text-gray-600">{t(item.descKey)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{t('office_lighting.setup.title')}</h3>
                  <div className="space-y-3">
                    {setupRows.map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-blue-100 last:border-0">
                        <span className="text-gray-500">{t(row.labelKey)}</span>
                        <span className="font-medium text-gray-900">{t(row.valueKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop"
                    alt="Home office with LED ceiling lighting"
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
                {t('office_lighting.products.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('office_lighting.products.subtitle')}
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
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-500">{t('office_lighting.products.from')}</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(priceMap[product.id] ?? Math.min(...product.variants.map(v => v.price)))}
                        </div>
                      </div>
                      <Link
                        to={getProductUrl(locale, product)}
                        className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors duration-200"
                      >
                        {t('office_lighting.products.view_kit')}
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
                {t('office_lighting.products.view_all')}
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
                <div className="text-2xl md:text-3xl font-bold text-gray-900">4000K–5000K</div>
                <div className="text-sm text-gray-500 mt-1">{t('office_lighting.stats.temp_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">CRI 90+</div>
                <div className="text-sm text-gray-500 mt-1">{t('office_lighting.stats.cri_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('office_lighting.stats.lifespan_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('office_lighting.stats.lifespan_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('office_lighting.stats.warranty_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('office_lighting.stats.warranty_label')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Articles */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t('office_lighting.articles.title')}</h2>
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
                    <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-2">
                      <Star className="w-3.5 h-3.5" />
                      {t('office_lighting.articles.badge')}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{article.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-blue-600 text-sm font-medium">
                      {t('office_lighting.articles.read_more')} <ArrowRight className="w-4 h-4" />
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
              How to Choose LED Ceiling Lighting for Your Home Office
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>Home office lighting has a direct, measurable impact on productivity, focus, and eye health. Unlike residential spaces, a home office requires near-professional lighting standards — high brightness, neutral color temperature, and zero flicker — to support sustained cognitive work throughout the day.</p>
              <p><strong>Brightness Requirements:</strong> Office work requires 300–500 lux at desk level — three to five times more than a comfortable bedroom. For a 9–12 m² office, this means LED strips delivering 1000–1200 lm/m around the ceiling perimeter, supplemented by a desk task lamp for direct work surface illumination. Video call setups additionally benefit from front-facing lighting to eliminate facial shadows on camera.</p>
              <p><strong>Color Temperature for Concentration:</strong> 4000K–5000K (neutral to cool white) is the scientifically-validated range for office lighting. It mimics midday natural light, supporting alertness and sustained concentration. The human body responds to cool-neutral light with reduced melatonin production and increased cortisol — exactly the right state for focused work. Avoid 2700K warm white, which creates a relaxing atmosphere incompatible with productivity.</p>
              <p><strong>Flicker-Free Operation:</strong> LED flicker is invisible to the naked eye but detectable by the brain's visual processing system, contributing significantly to eye fatigue, headaches, and difficulty concentrating during extended screen use. Always specify strips with constant-current drivers or high-frequency PWM dimming (&gt;1000 Hz). Our office-rated strips are explicitly tested and certified as flicker-free.</p>
              <p><strong>Screen Glare Prevention:</strong> Position ceiling strips so they do not create reflections in monitor screens. In a typical office, this means mounting strips on the side walls and the wall behind you, rather than the wall behind the monitor. Test the placement by sitting at your desk and checking for reflections across different screen angles before finalizing the installation.</p>
              <p><strong>Common Mistakes:</strong> Using warm 2700K makes afternoon work sessions feel progressively more sluggish. Non-dimmable strips prevent adaptation to changing daylight throughout the day. Placing a single bright strip directly in your line of sight creates glare that forces your eyes to constantly readjust — a leading cause of digital eye strain during video calls and screen work.</p>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 bg-blue-50 border-t border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">LED Ceiling Lighting for Other Rooms</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { to: `/${locale}/led-ceiling-lighting-kitchen`, label: 'LED Ceiling Lighting for Kitchen' },
                { to: `/${locale}/led-ceiling-lighting-bedroom`, label: 'LED Ceiling Lighting for Bedroom' },
                { to: `/${locale}/led-ceiling-lighting-living-room`, label: 'LED Ceiling Lighting for Living Room' },
                { to: `/${locale}/led-ceiling-lighting-bathroom`, label: 'LED Ceiling Lighting for Bathroom' },
                { to: `/${locale}/led-ceiling-lighting-hallway`, label: 'LED Ceiling Lighting for Hallway' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 group"
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-blue-500" />
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
              {t('office_lighting.faq.title')}
            </h2>
            <Accordion items={faqItems} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-blue-950 to-blue-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('office_lighting.cta.title')}
            </h2>
            <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
              {t('office_lighting.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30 text-lg"
              >
                {t('office_lighting.cta.primary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={`/${locale}/support`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-blue-700 hover:border-blue-400 text-blue-300 hover:text-blue-400 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                {t('office_lighting.cta.secondary')}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
