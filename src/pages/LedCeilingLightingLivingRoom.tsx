import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sofa, Palette, Sliders, Sparkles, CheckCircle, ArrowRight, BookOpen, Star, Home } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, getStaticPageAlternateUrls } from '../lib/urls';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';
import { useProductMinPrices } from '../hooks/useProductMinPrices';

export default function LedCeilingLightingLivingRoom() {
  const { t, locale } = useTranslation();
  const { priceMap, formatPrice } = useProductMinPrices([1, 2]);

  const roomProducts = useMemo(() => products.filter(p => [1, 2].includes(p.id)), []);
  const alternateUrls = useMemo(() => getStaticPageAlternateUrls('/led-ceiling-lighting-living-room'), []);

  const blogArticles = [
    {
      slug: 'led-ceiling-lighting-guide',
      title: t('living_room_lighting.articles.article1_title', 'LED Ceiling Lighting Guide'),
      desc: t('living_room_lighting.articles.article1_desc', 'Complete LED ceiling lighting reference guide covering technology basics, planning, installation methods, and smart integration.'),
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop'
    },
    {
      slug: 'smart-led-ceiling-lighting',
      title: t('living_room_lighting.articles.article2_title', 'Smart LED Ceiling Lighting'),
      desc: t('living_room_lighting.articles.article2_desc', 'Complete guide to smart LED ceiling lighting: Wi-Fi, voice control, automation, and whole-home integration.'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
    },
    {
      slug: 'led-ceiling-ideas-for-every-room',
      title: t('living_room_lighting.articles.article3_title', 'LED Ceiling Ideas for Every Room'),
      desc: t('living_room_lighting.articles.article3_desc', 'Inspiring LED ceiling lighting design ideas for living rooms, bedrooms, kitchens, and hallways — with practical installation tips.'),
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=800&auto=format&fit=crop'
    }
  ];

  const benefits = [
    { icon: Sofa, titleKey: 'living_room_lighting.benefits.ambiance.title', descKey: 'living_room_lighting.benefits.ambiance.desc' },
    { icon: Palette, titleKey: 'living_room_lighting.benefits.scenes.title', descKey: 'living_room_lighting.benefits.scenes.desc' },
    { icon: Sliders, titleKey: 'living_room_lighting.benefits.dimming.title', descKey: 'living_room_lighting.benefits.dimming.desc' },
    { icon: Sparkles, titleKey: 'living_room_lighting.benefits.uniform.title', descKey: 'living_room_lighting.benefits.uniform.desc' }
  ];

  const featuresList = [
    { titleKey: 'living_room_lighting.features.entertainment.title', descKey: 'living_room_lighting.features.entertainment.desc' },
    { titleKey: 'living_room_lighting.features.movie.title', descKey: 'living_room_lighting.features.movie.desc' },
    { titleKey: 'living_room_lighting.features.social.title', descKey: 'living_room_lighting.features.social.desc' },
    { titleKey: 'living_room_lighting.features.accent.title', descKey: 'living_room_lighting.features.accent.desc' },
    { titleKey: 'living_room_lighting.features.smart.title', descKey: 'living_room_lighting.features.smart.desc' }
  ];

  const setupRows = [
    { labelKey: 'living_room_lighting.setup.temp_label', valueKey: 'living_room_lighting.setup.temp_value' },
    { labelKey: 'living_room_lighting.setup.brightness_label', valueKey: 'living_room_lighting.setup.brightness_value' },
    { labelKey: 'living_room_lighting.setup.length_label', valueKey: 'living_room_lighting.setup.length_value' },
    { labelKey: 'living_room_lighting.setup.control_label', valueKey: 'living_room_lighting.setup.control_value' },
    { labelKey: 'living_room_lighting.setup.install_label', valueKey: 'living_room_lighting.setup.install_value' }
  ];

  const faqItems = [
    { question: t('living_room_lighting.faq.q1.question'), answer: t('living_room_lighting.faq.q1.answer') },
    { question: t('living_room_lighting.faq.q2.question'), answer: t('living_room_lighting.faq.q2.answer') },
    { question: t('living_room_lighting.faq.q3.question'), answer: t('living_room_lighting.faq.q3.answer') },
    { question: t('living_room_lighting.faq.q4.question'), answer: t('living_room_lighting.faq.q4.answer') },
    { question: t('living_room_lighting.faq.q5.question'), answer: t('living_room_lighting.faq.q5.answer') },
    { question: 'What color temperature is best for a living room LED ceiling?', answer: '2700K–3000K (warm white) creates the most inviting living room atmosphere, mimicking the warmth of incandescent bulbs. For multi-use spaces that serve both relaxing and working purposes, a CCT-adjustable strip (2700K–6500K) lets you dial in the mood: warm amber for movie nights, neutral 4000K for reading, or bright 5000K for daytime activities.' },
    { question: 'How many meters of LED strip do I need for a living room ceiling?', answer: 'Calculate the full perimeter of your room and add 10–15% for corners and overlaps. A 20 m² living room with a 4×5 m footprint needs approximately 18–20 m of LED strip for a full perimeter install. For double-row or cove lighting effects, double this figure. Our LED kits come in 5 m and 10 m lengths that connect in series.' },
    { question: 'Can LED strip lights fully replace a central ceiling light in a living room?', answer: 'Yes, perimeter-mounted LED strips can fully replace a chandelier or central fixture. They deliver even, shadow-free illumination that makes the room feel larger and more sophisticated. You gain dimmability, color temperature control, and the ability to highlight architectural features with indirect cove lighting — advantages a central light cannot offer.' },
    { question: 'How do I create different lighting scenes in a living room with LED strips?', answer: 'Use an RGB+CCT LED strip with multi-channel control. Program scenes such as "Movie" (10% warm 2700K), "Social" (60% 3000K), and "Reading" (100% 4500K). Smart controllers with app control let you save and switch between scenes instantly, or automate them based on time of day or connected devices like TVs and speakers.' }
  ];

  return (
    <>
      <SEO
        title={t('living_room_lighting.seo.title')}
        description={t('living_room_lighting.seo.description')}
        keywords="LED ceiling lighting living room, living room LED strips, how many meters LED strip living room, ambient living room lighting, dimmable LED ceiling lounge, COB LED living room, LED scene lighting"
        alternateUrls={alternateUrls}
      />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-25" style={{
            backgroundImage: 'radial-gradient(circle at 65% 40%, #d97706 0%, transparent 55%), radial-gradient(circle at 15% 75%, #92400e 0%, transparent 50%)'
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
                  <Sofa className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-sm font-medium">{t('living_room_lighting.badge')}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {t('living_room_lighting.hero.title_line1')}<br />
                  <span className="text-amber-400">{t('living_room_lighting.hero.title_line2')}</span>
                </h1>
                <p className="text-lg text-stone-300 mb-8 leading-relaxed">
                  {t('living_room_lighting.hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/${locale}/catalog`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
                  >
                    {t('living_room_lighting.hero.cta_primary')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to={`/${locale}/installation-guide`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-stone-600 hover:border-amber-400 text-stone-300 hover:text-amber-400 font-semibold rounded-xl transition-all duration-200"
                  >
                    {t('living_room_lighting.hero.cta_secondary')}
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl hidden lg:block">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop"
                  alt="Modern living room with LED ceiling lighting"
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
              {t('living_room_lighting.intro.title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{t('living_room_lighting.intro.p1')}</p>
              <p>{t('living_room_lighting.intro.p2')}</p>
              <p>{t('living_room_lighting.intro.p3')}</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('living_room_lighting.benefits.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('living_room_lighting.benefits.subtitle')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-4">
                    <benefit.icon className="w-6 h-6 text-amber-600" />
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
                  {t('living_room_lighting.features.title')}
                </h2>
                <div className="space-y-5">
                  {featuresList.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-900">{t(item.titleKey)}: </span>
                        <span className="text-gray-600">{t(item.descKey)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{t('living_room_lighting.setup.title')}</h3>
                  <div className="space-y-3">
                    {setupRows.map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-amber-100 last:border-0">
                        <span className="text-gray-500">{t(row.labelKey)}</span>
                        <span className="font-medium text-gray-900">{t(row.valueKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=800&auto=format&fit=crop"
                    alt="Living room LED ceiling lighting"
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
                {t('living_room_lighting.products.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('living_room_lighting.products.subtitle')}
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
                          <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-500">{t('living_room_lighting.products.from')}</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(priceMap[product.id] ?? Math.min(...product.variants.map(v => v.price)))}
                        </div>
                      </div>
                      <Link
                        to={getProductUrl(locale, product)}
                        className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors duration-200"
                      >
                        {t('living_room_lighting.products.view_kit')}
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
                {t('living_room_lighting.products.view_all')}
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
                <div className="text-2xl md:text-3xl font-bold text-gray-900">2700K–6500K</div>
                <div className="text-sm text-gray-500 mt-1">{t('living_room_lighting.stats.temp_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-500 mt-1">{t('living_room_lighting.stats.dimming_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('living_room_lighting.stats.lifespan_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('living_room_lighting.stats.lifespan_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('living_room_lighting.stats.warranty_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('living_room_lighting.stats.warranty_label')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Articles */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t('living_room_lighting.articles.title')}</h2>
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
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium mb-2">
                      <Star className="w-3.5 h-3.5" />
                      {t('living_room_lighting.articles.badge')}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{article.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-amber-600 text-sm font-medium">
                      {t('living_room_lighting.articles.read_more')} <ArrowRight className="w-4 h-4" />
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
              How to Choose LED Ceiling Lighting for Your Living Room
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>The living room is a multi-purpose space that benefits most from flexible, dimmable LED ceiling lighting. From bright light for daytime activities to dim warm light for movie nights and entertaining, a well-planned LED system transforms how the room feels throughout the day.</p>
              <p><strong>Color Temperature for Ambiance:</strong> 2700K–3000K (warm white) is the standard for living rooms, creating the inviting, cozy atmosphere associated with traditional incandescent lighting. For spaces that also serve as home offices or play areas, a CCT-adjustable strip (2700K–6500K) provides full flexibility — warm evenings, neutral afternoons, bright mornings.</p>
              <p><strong>Brightness for Zoning:</strong> Divide your living room lighting into zones. Ambient ceiling strips at 400–600 lm/m provide comfortable background light. Accent strips highlighting shelves, alcoves, or artwork can run at lower brightness to create depth. Use independent dimmer channels for each zone to build layered lighting scenes without additional fixtures.</p>
              <p><strong>Scene Programming:</strong> A living room benefits most from preset scenes: "Bright" for cleaning and activities (100%, 4000K), "Social" for guests (60%, 3000K), "Movie" for film watching (10%, 2700K), and "Relax" for evening wind-down (25%, 2700K). Smart LED controllers let you switch between scenes with one tap on a phone or voice command.</p>
              <p><strong>Placement Tips:</strong> Install strips around the full ceiling perimeter for even base illumination. Add strips behind the TV or entertainment unit for bias lighting that reduces eye strain during viewing. Highlight architectural features like beamed ceilings, alcoves, or feature walls with directional accent strips to add visual depth and interest.</p>
              <p><strong>Common Mistakes:</strong> Uniform bright lighting at the same level throughout the room kills atmosphere — always design for multiple brightness levels. Installing strips too close to the wall means you see the LED chip rather than reflected light; leave at least 8–10 cm of clearance for a proper glow. Skipping dimmer control eliminates the room's most important functional advantage.</p>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">LED Ceiling Lighting for Other Rooms</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { to: `/${locale}/led-ceiling-lighting-kitchen`, label: 'LED Ceiling Lighting for Kitchen' },
                { to: `/${locale}/led-ceiling-lighting-bedroom`, label: 'LED Ceiling Lighting for Bedroom' },
                { to: `/${locale}/led-ceiling-lighting-bathroom`, label: 'LED Ceiling Lighting for Bathroom' },
                { to: `/${locale}/led-ceiling-lighting-hallway`, label: 'LED Ceiling Lighting for Hallway' },
                { to: `/${locale}/led-ceiling-lighting-office`, label: 'LED Ceiling Lighting for Office' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-amber-400 hover:text-amber-600 transition-all duration-200 group"
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-amber-500" />
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
              {t('living_room_lighting.faq.title')}
            </h2>
            <Accordion items={faqItems} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-stone-900 to-stone-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('living_room_lighting.cta.title')}
            </h2>
            <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
              {t('living_room_lighting.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/30 text-lg"
              >
                {t('living_room_lighting.cta.primary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={`/${locale}/support`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-stone-600 hover:border-amber-400 text-stone-300 hover:text-amber-400 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                {t('living_room_lighting.cta.secondary')}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
