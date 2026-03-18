import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sparkles, Thermometer, Sliders, Star, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, getStaticPageAlternateUrls } from '../lib/urls';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';

const SITE_URL = 'https://led-nabor.com';

const bedroomBlogArticles = [
  {
    slug: 'bedroom-ceiling-lighting-ideas',
    titleEn: 'Bedroom Ceiling Lighting Ideas',
    descEn: 'Discover inspiring ideas for creating a cozy and romantic atmosphere in your bedroom with LED strips.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop'
  },
  {
    slug: 'warm-vs-cool-white-led',
    titleEn: 'Warm vs Cool White LED — Which to Choose?',
    descEn: 'A complete guide to choosing the right color temperature for your bedroom lighting.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop'
  },
  {
    slug: 'smart-led-ceiling-lighting',
    titleEn: 'Smart LED Ceiling Lighting',
    descEn: 'How smart LED systems transform your bedroom into a fully automated, comfortable space.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
  }
];

const faqItems = [
  {
    question: 'What color temperature is best for bedroom LED lighting?',
    answer: 'For bedrooms, warm white (2700K–3000K) is ideal for evening relaxation and sleep preparation. If you want versatility, choose a CCT or RGB+CCT kit that lets you adjust from warm to cool white depending on your activity — reading, relaxing, or waking up.'
  },
  {
    question: 'Can LED strips be used on a stretch ceiling in the bedroom?',
    answer: 'Yes, our COB LED strips are specifically designed for stretch ceilings. They produce uniform, dot-free light that looks beautiful on stretched surfaces. The slim profile makes installation easy without damaging the ceiling material.'
  },
  {
    question: 'How many meters of LED strip do I need for a bedroom?',
    answer: 'For a standard bedroom (12–20 m²), 5–10 meters of LED strip is usually sufficient for perimeter lighting. For larger rooms or if you want brighter illumination, opt for 10–15 meters. Our kits come in 5m increments from 5m to 30m.'
  },
  {
    question: 'Can I control bedroom LED lighting from my phone?',
    answer: 'Yes. Our RGB+CCT kits include Wi-Fi control via a mobile app. You can adjust brightness, color temperature, and set scenes or schedules directly from your smartphone without a hub.'
  },
  {
    question: 'Is LED ceiling lighting safe for a bedroom — does it emit UV or flicker?',
    answer: 'Our COB LED strips have zero UV emission and are engineered for flicker-free operation, making them completely safe for bedrooms including children\'s rooms. They operate at low voltage (12V/24V DC) which is inherently safe.'
  }
];

export default function LedCeilingLightingBedroom() {
  const { t, locale } = useTranslation();

  const bedroomProducts = useMemo(() => products.filter(p => [1, 2].includes(p.id)), []);

  const alternateUrls = useMemo(() => getStaticPageAlternateUrls('/led-ceiling-lighting-bedroom'), []);

  const benefits = [
    {
      icon: Moon,
      title: 'Ambient & Relaxing Atmosphere',
      desc: 'Create the perfect wind-down environment with warm, dimmable light that promotes restful sleep.'
    },
    {
      icon: Thermometer,
      title: 'Adjustable Color Temperature',
      desc: 'Switch between warm white for evenings and cool white for morning routines — all from one system.'
    },
    {
      icon: Sliders,
      title: 'Smooth Dimming',
      desc: 'Full 0–100% dimming range lets you set the exact brightness for reading, romance, or sleep.'
    },
    {
      icon: Sparkles,
      title: 'Uniform Dot-Free Light',
      desc: 'COB technology delivers smooth, even illumination with no visible dots — ideal for stretch ceilings.'
    }
  ];

  return (
    <>
      <SEO
        title="LED Ceiling Lighting for Bedroom — Ambient, Dimmable, Wi-Fi Control"
        description="Transform your bedroom with premium LED ceiling lighting. COB strips with warm light, smooth dimming, and Wi-Fi control. Perfect for stretch ceilings. Free shipping."
        keywords="LED ceiling lighting bedroom, bedroom LED strips, ambient bedroom lighting, COB LED bedroom, dimmable bedroom lights"
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
                <span className="text-cyan-300 text-sm font-medium">Bedroom LED Lighting</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                LED Ceiling Lighting<br />
                <span className="text-cyan-400">for Your Bedroom</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                Create the perfect bedroom atmosphere with premium COB LED ceiling lighting. Warm, dimmable, flicker-free light that transforms your space from morning energizing to evening relaxation — all controlled from your phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/${locale}/catalog`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                >
                  Shop LED Kits
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to={`/${locale}/installation-guide`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-500 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-semibold rounded-xl transition-all duration-200"
                >
                  Installation Guide
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Why LED Ceiling Lighting is Perfect for Bedrooms
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>
                The bedroom is the most personal room in your home — it's where you sleep, rest, and recharge. Lighting plays a crucial role in how well you relax and sleep. Harsh overhead lights can disrupt your circadian rhythm, while the right LED system creates a calming, warm environment that signals your body it's time to rest.
              </p>
              <p>
                Modern LED ceiling strip lighting, especially COB (Chip-on-Board) technology, provides uniform, dot-free illumination that looks elegant on any ceiling type — plasterboard, stretch, or suspended. Unlike traditional spotlights or panel lights, LED strips run along the ceiling perimeter, creating indirect ambient light that's both functional and beautiful.
              </p>
              <p>
                With adjustable color temperature and full dimming control, a single installation adapts to every moment: bright cool-white for morning routines, neutral white for reading, and warm amber for winding down before sleep. Add Wi-Fi control and you can automate the whole routine from your bedside or phone.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Benefits of Bedroom LED Lighting
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Everything you need for perfect bedroom ambiance — in one complete kit.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-xl mb-4">
                    <benefit.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bedroom-specific features */}
        <section className="py-12 md:py-16 bg-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Designed for Bedroom Use
                </h2>
                <div className="space-y-5">
                  {[
                    {
                      title: 'Circadian-Friendly Light',
                      desc: 'Warm white (2700K) light in the evenings supports natural melatonin production, helping you fall asleep faster and sleep better.'
                    },
                    {
                      title: 'Wake-Up Light Feature',
                      desc: 'Program gradual brightness increase in the morning to simulate sunrise. Start your day naturally without harsh alarms.'
                    },
                    {
                      title: 'Scene Automation',
                      desc: 'Set "Relax", "Sleep", and "Morning" scenes that activate automatically based on time of day or voice command.'
                    },
                    {
                      title: 'Flicker-Free for Better Sleep',
                      desc: 'Our COB strips operate at high frequency with zero flicker — no eye strain, no headaches, no sleep disruption.'
                    },
                    {
                      title: 'Silent Operation',
                      desc: 'No buzz, no hum. LED technology operates in complete silence, essential for a peaceful bedroom environment.'
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">{item.title}: </span>
                        <span className="text-slate-300">{item.desc}</span>
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
                LED Kits for Bedroom Ceilings
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Complete kits with everything included — LED strip, power supply, controller, and connectors.
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
                        <span className="text-xs text-gray-500">From</span>
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.min(...product.variants.map(v => v.price)).toLocaleString('de-DE')} Kč
                        </div>
                      </div>
                      <Link
                        to={getProductUrl(locale, product)}
                        className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
                      >
                        View Kit
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
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats / Trust */}
        <section className="py-10 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '2700K–6500K', label: 'Color Temperature Range' },
                { value: '100%', label: 'Dimming Range' },
                { value: '10 years', label: 'LED Lifespan' },
                { value: '24 months', label: 'Warranty' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Articles */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-cyan-500" />
              <h2 className="text-2xl font-bold text-gray-900">Helpful Articles on Bedroom Lighting</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {bedroomBlogArticles.map(article => (
                <Link
                  key={article.slug}
                  to={`/${locale}/blog/${article.slug}`}
                  className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-cyan-600 font-medium mb-2">
                      <Star className="w-3.5 h-3.5" />
                      Featured Article
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                      {article.titleEn}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{article.descEn}</p>
                    <div className="mt-3 flex items-center gap-1 text-cyan-600 text-sm font-medium">
                      Read article <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion
              items={faqItems.map(item => ({
                question: item.question,
                answer: item.answer
              }))}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Bedroom?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Complete LED kits with free shipping. Professional quality, easy installation, 24-month warranty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 text-lg"
              >
                Shop LED Kits
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={`/${locale}/support`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
