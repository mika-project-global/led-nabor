import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Eye, ThumbsUp, Cpu, CheckCircle, ArrowRight, BookOpen, Star } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, getStaticPageAlternateUrls } from '../lib/urls';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';

const kitchenBlogArticles = [
  {
    slug: 'led-ceiling-ideas-for-every-room',
    titleEn: 'LED Ceiling Ideas for Every Room',
    descEn: 'Practical design ideas for using LED ceiling lighting in the kitchen and other key areas of your home.',
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&auto=format&fit=crop'
  },
  {
    slug: 'how-many-lumens-do-you-need',
    titleEn: 'How Many Lumens Do You Need for Your Room?',
    descEn: 'Calculate the correct brightness for your kitchen ceiling lighting based on room size and usage.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop'
  },
  {
    slug: 'best-led-ceiling-lighting-guide',
    titleEn: 'Best LED Ceiling Lighting — Complete Guide',
    descEn: 'Everything you need to know about choosing the best LED ceiling light system for your kitchen.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
  }
];

const faqItems = [
  {
    question: 'What brightness (lumens) do I need for kitchen LED ceiling lighting?',
    answer: 'Kitchens require higher brightness than other rooms. Plan for at least 300–500 lux at counter level. For a standard kitchen (10–15 m²), 800–1200 lumens per meter of LED strip is recommended. Our COB LED strips deliver 800–1200 lm/m depending on the model, providing excellent task lighting for cooking and food preparation.'
  },
  {
    question: 'What color temperature is best for kitchen lighting?',
    answer: 'Cool white or neutral white (4000K–5000K) is best for kitchens — it improves color perception of food, reduces eye strain during food preparation, and provides a clean, modern appearance. Our CCT kits let you switch between warm (2700K) for dining ambiance and cool (5000K+) for cooking tasks.'
  },
  {
    question: 'Is LED strip lighting waterproof / moisture resistant for kitchens?',
    answer: 'Our LED strips have an IP20 rating, suitable for normal kitchen environments away from direct water splash. For areas directly above the sink or stovetop, keep strips at least 60cm away from steam sources. The sealed driver units are designed for humid environments typical in kitchens.'
  },
  {
    question: 'Can I install LED strips under kitchen cabinets as well as the ceiling?',
    answer: 'Yes, absolutely. Our kits work perfectly for both ceiling perimeter lighting and under-cabinet task lighting. You can run the same strip system for both areas using splitters and additional connectors (available separately), creating a layered kitchen lighting design.'
  },
  {
    question: 'How difficult is it to install LED ceiling lighting in a kitchen?',
    answer: 'Installation is straightforward with our complete kits — no special tools required. The LED strip has 3M adhesive backing, and all components (power supply, controller, remote) are pre-wired and tested. Most kitchens can be completed in 2–3 hours. We provide step-by-step video guides for each kit.'
  }
];

export default function LedCeilingLightingKitchen() {
  const { t, locale } = useTranslation();

  const kitchenProducts = useMemo(() => products.filter(p => [1, 2].includes(p.id)), []);

  const alternateUrls = useMemo(() => getStaticPageAlternateUrls('/led-ceiling-lighting-kitchen'), []);

  const benefits = [
    {
      icon: Zap,
      title: 'Bright Task Lighting',
      desc: 'High-lumen COB strips deliver the brightness needed for safe food preparation and cooking.'
    },
    {
      icon: Eye,
      title: 'True Color Rendering (CRI 90+)',
      desc: 'See food colors accurately — essential for cooking, checking freshness, and plating.'
    },
    {
      icon: Cpu,
      title: 'Wi-Fi & Voice Control',
      desc: 'Hands-free control via app or voice — ideal when your hands are busy in the kitchen.'
    },
    {
      icon: ThumbsUp,
      title: 'Energy Efficient',
      desc: 'Use 60–80% less energy than traditional kitchen lights. LED strips pay for themselves in months.'
    }
  ];

  return (
    <>
      <SEO
        title="LED Ceiling Lighting for Kitchen — Bright, Functional, Easy Install"
        description="Upgrade your kitchen with professional LED ceiling lighting. High-brightness COB strips, cool white light for cooking, Wi-Fi control. Complete kits with free shipping."
        keywords="LED ceiling lighting kitchen, kitchen LED strips, kitchen ceiling lights, COB LED kitchen, bright kitchen lighting"
        alternateUrls={alternateUrls}
      />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 70% 50%, #0891b2 0%, transparent 60%), radial-gradient(circle at 10% 80%, #164e63 0%, transparent 50%)'
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-6">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-medium">Kitchen LED Lighting</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  LED Ceiling Lighting<br />
                  <span className="text-cyan-400">for Your Kitchen</span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Bright, functional, and energy-efficient LED ceiling lighting designed for kitchens. High-lumen COB strips with accurate color rendering — see your food in its true colors and cook with confidence.
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
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 font-semibold rounded-xl transition-all duration-200"
                  >
                    How to Install
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl hidden lg:block">
                <img
                  src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=900&auto=format&fit=crop"
                  alt="Modern kitchen with LED ceiling lighting"
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
              Why Your Kitchen Needs Modern LED Ceiling Lighting
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>
                The kitchen is the hardest-working room in your home. It's where you prepare food, eat, entertain, and often work — all of which demand different types of lighting. Traditional overhead fixtures leave shadows on countertops and give flat, unattractive light that makes cooking difficult and food look unappetizing.
              </p>
              <p>
                LED ceiling strip lighting solves this elegantly. Running along the perimeter or in a cove design, COB LED strips provide wide, even illumination that eliminates shadows completely. The high CRI (90+) means food looks exactly as it should — colors are vivid and accurate, which matters when you're judging whether meat is cooked or fruit is ripe.
              </p>
              <p>
                With adjustable color temperature, you can switch from bright cool-white (5000K) for cooking and food preparation to warm neutral (3000K) for a relaxed dinner atmosphere. Voice control and app automation mean you don't need to touch a switch when your hands are full.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Benefits of LED Kitchen Lighting
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Professional-grade features at an accessible price.
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

        {/* Kitchen-specific features */}
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Features That Matter in a Kitchen
                </h2>
                <div className="space-y-5">
                  {[
                    {
                      title: 'Shadow-Free Work Surfaces',
                      desc: 'Perimeter LED strips cast even light across all counter surfaces, eliminating the shadows that traditional overhead fixtures create when you\'re standing at the counter.'
                    },
                    {
                      title: 'Dining Mode',
                      desc: 'Instantly switch to warm, dimmed lighting for dinner. The same system that illuminated your cooking can create a warm, intimate dining atmosphere in seconds.'
                    },
                    {
                      title: 'Easy to Clean Design',
                      desc: 'LED strips sit flush against the ceiling with no exposed bulbs, shades, or crevices to collect grease or dust — far easier to maintain than traditional kitchen light fixtures.'
                    },
                    {
                      title: 'Heat-Resistant Components',
                      desc: 'Kitchen environments get warm. Our drivers and strips are rated for continuous operation in ambient temperatures up to 40°C — no performance degradation near the stove or oven.'
                    },
                    {
                      title: 'Compatible with Any Kitchen Style',
                      desc: 'From minimalist modern to rustic farmhouse — indirect LED lighting adapts to any kitchen aesthetic. The light source itself is hidden, only the glow is visible.'
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-900">{item.title}: </span>
                        <span className="text-gray-600">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Recommended Setup for Kitchen</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Color temperature', value: '3000K–5000K (adjustable CCT)' },
                      { label: 'Brightness', value: '800–1200 lm/m (high output)' },
                      { label: 'Strip length (10–15 m²)', value: '5–10 meters' },
                      { label: 'Control', value: 'App + remote + voice' },
                      { label: 'Installation', value: 'Ceiling perimeter + optional under-cabinet' }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-cyan-100 last:border-0">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-medium text-gray-900">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop"
                    alt="Kitchen ceiling with LED strip lighting"
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
                LED Kits for Kitchen Ceilings
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Everything included in one box — LED strip, driver, controller, remote, and connectors.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {kitchenProducts.map(product => (
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

        {/* Stats */}
        <section className="py-10 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: 'CRI 90+', label: 'Color Rendering Index' },
                { value: '800–1200', label: 'Lumens per meter' },
                { value: '60–80%', label: 'Energy savings vs halogen' },
                { value: '24 months', label: 'Warranty included' }
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
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-cyan-500" />
              <h2 className="text-2xl font-bold text-gray-900">Helpful Articles on Kitchen Lighting</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {kitchenBlogArticles.map(article => (
                <Link
                  key={article.slug}
                  to={`/${locale}/blog/${article.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
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
        <section className="py-12 md:py-16 bg-white">
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
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Upgrade Your Kitchen Lighting Today
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Professional LED kits with free shipping. Better light, lower energy bills, and a kitchen you'll enjoy spending time in.
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
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                Get Expert Advice
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
