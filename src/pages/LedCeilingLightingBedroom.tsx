import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sparkles, Thermometer, Sliders, Star, CheckCircle, ArrowRight, BookOpen, Home } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, getStaticPageAlternateUrls } from '../lib/urls';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';
import { useProductMinPrices } from '../hooks/useProductMinPrices';

export default function LedCeilingLightingBedroom() {
  const { t, locale } = useTranslation();
  const { priceMap, formatPrice } = useProductMinPrices([1, 2]);

  const bedroomProducts = useMemo(() => products.filter(p => [1, 2].includes(p.id)), []);
  const alternateUrls = useMemo(() => getStaticPageAlternateUrls('/led-ceiling-lighting-bedroom'), []);

  const blogArticles = [
    {
      slug: 'led-lighting-for-bedroom-ceiling',
      title: t('bedroom_lighting.articles.article1_title', 'LED Lighting for Bedroom Ceiling — Ambiance Guide'),
      desc: t('bedroom_lighting.articles.article1_desc', 'Complete guide to LED bedroom ceiling lighting including ambiance creation, sleep-friendly color temperatures, and smart automation for restful spaces.'),
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop'
    },
    {
      slug: 'warm-vs-cool-led-lighting',
      title: t('bedroom_lighting.articles.article2_title', 'Warm or Cool LED Light: Complete Color Temperature Guide'),
      desc: t('bedroom_lighting.articles.article2_desc', 'Complete guide to LED light color temperature: health effects, room-by-room recommendations, and how to choose the right warmth for your bedroom.'),
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop'
    },
    {
      slug: 'smart-led-ceiling-lighting',
      title: t('bedroom_lighting.articles.article3_title', 'Smart LED Ceiling Lighting'),
      desc: t('bedroom_lighting.articles.article3_desc', 'Complete guide to smart LED ceiling lighting: Wi-Fi, voice control, automation, circadian rhythms, and whole-home integration for your bedroom.'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
    }
  ];

  const benefits = [
    { icon: Moon, titleKey: 'bedroom_lighting.benefits.ambient.title', descKey: 'bedroom_lighting.benefits.ambient.desc' },
    { icon: Thermometer, titleKey: 'bedroom_lighting.benefits.temperature.title', descKey: 'bedroom_lighting.benefits.temperature.desc' },
    { icon: Sliders, titleKey: 'bedroom_lighting.benefits.dimming.title', descKey: 'bedroom_lighting.benefits.dimming.desc' },
    { icon: Sparkles, titleKey: 'bedroom_lighting.benefits.uniform.title', descKey: 'bedroom_lighting.benefits.uniform.desc' }
  ];

  const featuresList = [
    { titleKey: 'bedroom_lighting.features.circadian.title', descKey: 'bedroom_lighting.features.circadian.desc' },
    { titleKey: 'bedroom_lighting.features.wakeup.title', descKey: 'bedroom_lighting.features.wakeup.desc' },
    { titleKey: 'bedroom_lighting.features.scenes.title', descKey: 'bedroom_lighting.features.scenes.desc' },
    { titleKey: 'bedroom_lighting.features.flicker.title', descKey: 'bedroom_lighting.features.flicker.desc' },
    { titleKey: 'bedroom_lighting.features.silent.title', descKey: 'bedroom_lighting.features.silent.desc' }
  ];

  const faqItems = [
    { question: t('bedroom_lighting.faq.q1.question'), answer: t('bedroom_lighting.faq.q1.answer') },
    { question: t('bedroom_lighting.faq.q2.question'), answer: t('bedroom_lighting.faq.q2.answer') },
    { question: t('bedroom_lighting.faq.q3.question'), answer: t('bedroom_lighting.faq.q3.answer') },
    { question: t('bedroom_lighting.faq.q4.question'), answer: t('bedroom_lighting.faq.q4.answer') },
    { question: t('bedroom_lighting.faq.q5.question'), answer: t('bedroom_lighting.faq.q5.answer') },
    { question: 'What color temperature of LED light is best for sleep in a bedroom?', answer: 'For good sleep, use warm white LED light at 2700K–3000K in the evening. This spectrum minimizes blue light, which suppresses melatonin production. With a CCT-adjustable LED strip, you can use 5000K–6500K in the morning for an energizing wake-up, then gradually transition to 2700K about an hour before bedtime.' },
    { question: 'What LED brightness is comfortable for a bedroom ceiling?', answer: 'Bedroom ambient lighting should be 100–200 lux for relaxation and 30–50 lux for pre-sleep wind-down. For a typical 12–16 m² bedroom, this means roughly 300–500 lm/m of LED strip on the perimeter. Dimming capability is essential — being able to reduce to 5–10% allows you to create a true sleep-ready environment without turning lights fully off.' },
    { question: 'Can I dim LED ceiling lights in the bedroom with a standard dimmer switch?', answer: 'Standard wall dimmers are not compatible with LED strips — they require a PWM or constant-voltage LED dimmer controller. Our bedroom LED kits include a compatible remote-controlled dimmer, and CCT+RGB models integrate with smart home systems like Alexa or Google Home for hands-free voice dimming and automated sleep schedules.' },
    { question: 'How do I install LED strip lighting in a bedroom ceiling cove?', answer: 'Measure your ceiling perimeter and cut the strip at the marked cut points. Mount the strip inside a plasterboard or aluminium cove profile so only the reflected light is visible, creating a soft glow. Connect to a 12V or 24V driver placed inside a wardrobe or above a false ceiling panel. The warm indirect light this creates is ideal for a relaxing bedroom atmosphere.' }
  ];

  return (
    <>
      <SEO
        title={t('bedroom_lighting.seo.title')}
        description={t('bedroom_lighting.seo.description')}
        keywords="LED ceiling lighting bedroom, bedroom LED strips, warm white LED bedroom, what color temperature for bedroom LED, dimmable bedroom ceiling lights, LED strip sleep lighting, COB LED bedroom"
        alternateUrls={alternateUrls}
      />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, #0891b2 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0e7490 0%, transparent 50%)'
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-6">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300 text-sm font-medium">{t('bedroom_lighting.badge')}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {t('bedroom_lighting.hero.title_line1')}<br />
                <span className="text-cyan-400">{t('bedroom_lighting.hero.title_line2')}</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                {t('bedroom_lighting.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/${locale}/catalog`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                >
                  {t('bedroom_lighting.hero.cta_primary')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to={`/${locale}/installation-guide`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-500 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-semibold rounded-xl transition-all duration-200"
                >
                  {t('bedroom_lighting.hero.cta_secondary')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {t('bedroom_lighting.intro.title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{t('bedroom_lighting.intro.p1')}</p>
              <p>{t('bedroom_lighting.intro.p2')}</p>
              <p>{t('bedroom_lighting.intro.p3')}</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('bedroom_lighting.benefits.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('bedroom_lighting.benefits.subtitle')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-xl mb-4">
                    <benefit.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{t(benefit.titleKey)}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(benefit.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:py-16 bg-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  {t('bedroom_lighting.features.title')}
                </h2>
                <div className="space-y-5">
                  {featuresList.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">{t(item.titleKey)}: </span>
                        <span className="text-slate-300">{t(item.descKey)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop"
                  alt="Bedroom LED ceiling lighting with warm ambient glow"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('bedroom_lighting.products.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('bedroom_lighting.products.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {bedroomProducts.map(product => (
                <div key={product.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
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
                          <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-500">{t('bedroom_lighting.products.from')}</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(priceMap[product.id] ?? Math.min(...product.variants.map(v => v.price)))}
                        </div>
                      </div>
                      <Link
                        to={getProductUrl(locale, product)}
                        className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
                      >
                        {t('bedroom_lighting.products.view_kit')}
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
                {t('bedroom_lighting.products.view_all')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">2700K–6500K</div>
                <div className="text-sm text-gray-500 mt-1">{t('bedroom_lighting.stats.temp_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-500 mt-1">{t('bedroom_lighting.stats.dimming_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('bedroom_lighting.stats.lifespan_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('bedroom_lighting.stats.lifespan_label')}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{t('bedroom_lighting.stats.warranty_value')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('bedroom_lighting.stats.warranty_label')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Articles */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-cyan-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t('bedroom_lighting.articles.title')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogArticles.map(article => (
                <Link
                  key={article.slug}
                  to={`/${locale}/blog/${article.slug}`}
                  className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-cyan-600 font-medium mb-2">
                      <Star className="w-3.5 h-3.5" />
                      {t('bedroom_lighting.articles.badge')}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{article.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-cyan-600 text-sm font-medium">
                      {t('bedroom_lighting.articles.read_more')} <ArrowRight className="w-4 h-4" />
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
              How to Choose LED Ceiling Lighting for Your Bedroom
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>The bedroom demands lighting that adapts to very different needs: bright and energizing in the morning, warm and relaxing in the evening, and dim enough not to interfere with sleep. LED ceiling strips with CCT (color temperature) adjustment and full dimming are the ideal solution.</p>
              <p><strong>Color Temperature for Sleep:</strong> Use 2700K–3000K (warm white) in the hours before bedtime. This spectrum suppresses blue light that inhibits melatonin production, making it easier to fall asleep naturally. For morning wake-up, a CCT-adjustable strip can shift to 5000K–6500K to mimic bright daylight and help you feel alert faster.</p>
              <p><strong>Brightness and Dimming:</strong> Bedroom ambient lighting should reach 100–200 lux for normal evening activity and 30–50 lux for pre-sleep relaxation. For a 12–16 m² bedroom, this means 300–500 lm/m of perimeter strip. Full 0–100% dimming is essential — the ability to set lights to 5% or lower is crucial for creating a true sleep environment without full darkness.</p>
              <p><strong>Placement for Soft Ambient Light:</strong> Mount strips inside a ceiling cove or plasterboard recess facing upward or outward so you see reflected light, not the LED strip directly. This indirect lighting eliminates glare and creates an even, shadow-free glow that feels significantly more relaxing than direct lighting. A full perimeter installation ensures no dark corners.</p>
              <p><strong>Smart Automation:</strong> Set a circadian rhythm schedule so lights automatically shift from bright-cool in the morning to warm-dim in the evening. Connect to Alexa, Google Home, or a bedside switch panel for hands-free control when you are already in bed. A gentle 30-minute sunset dimming sequence is particularly effective for sleep quality.</p>
              <p><strong>Common Mistakes:</strong> Installing cool 4000K+ lighting in a bedroom makes it feel like an office. Using non-dimmable strips removes the ability to create a sleep-friendly environment. Mounting strips too close to the bed headwall can create visual glare when lying down — always position them on all four sides for balanced, glare-free light.</p>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-5 h-5 text-cyan-500" />
              <h2 className="text-xl font-bold text-gray-900">LED Ceiling Lighting for Other Rooms</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { to: `/${locale}/led-ceiling-lighting-kitchen`, label: 'LED Ceiling Lighting for Kitchen' },
                { to: `/${locale}/led-ceiling-lighting-living-room`, label: 'LED Ceiling Lighting for Living Room' },
                { to: `/${locale}/led-ceiling-lighting-bathroom`, label: 'LED Ceiling Lighting for Bathroom' },
                { to: `/${locale}/led-ceiling-lighting-hallway`, label: 'LED Ceiling Lighting for Hallway' },
                { to: `/${locale}/led-ceiling-lighting-office`, label: 'LED Ceiling Lighting for Office' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-cyan-400 hover:text-cyan-600 transition-all duration-200 group"
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-cyan-500" />
                  <span className="leading-tight">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              {t('bedroom_lighting.faq.title')}
            </h2>
            <Accordion items={faqItems} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('bedroom_lighting.cta.title')}
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              {t('bedroom_lighting.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 text-lg"
              >
                {t('bedroom_lighting.cta.primary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={`/${locale}/support`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                {t('bedroom_lighting.cta.secondary')}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
