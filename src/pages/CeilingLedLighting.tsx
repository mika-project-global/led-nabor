import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, CheckCircle, Sparkles, Home } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { ImageWithFallback } from '../components/ImageWithFallback';
import Accordion from '../components/Accordion';
import CTASection from '../components/CTASection';

const CeilingLedLighting: React.FC = () => {
  const { t, locale } = useTranslation();

  const ceilingProducts = products.filter(p => [1, 2].includes(p.id));

  const benefits = [
    {
      icon: Lightbulb,
      titleKey: 'ceiling_lighting.benefits.uniform_light.title',
      descKey: 'ceiling_lighting.benefits.uniform_light.description'
    },
    {
      icon: Sparkles,
      titleKey: 'ceiling_lighting.benefits.no_dots.title',
      descKey: 'ceiling_lighting.benefits.no_dots.description'
    },
    {
      icon: Home,
      titleKey: 'ceiling_lighting.benefits.modern_design.title',
      descKey: 'ceiling_lighting.benefits.modern_design.description'
    },
    {
      icon: CheckCircle,
      titleKey: 'ceiling_lighting.benefits.stretch_ceilings.title',
      descKey: 'ceiling_lighting.benefits.stretch_ceilings.description'
    }
  ];

  const designIdeas = [
    {
      image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop',
      titleKey: 'ceiling_lighting.ideas.living_room'
    },
    {
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop',
      titleKey: 'ceiling_lighting.ideas.bedroom'
    },
    {
      image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&auto=format&fit=crop',
      titleKey: 'ceiling_lighting.ideas.kitchen'
    },
    {
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop',
      titleKey: 'ceiling_lighting.ideas.hallway'
    }
  ];

  const faqItems = [
    {
      questionKey: 'ceiling_lighting.faq.q1.question',
      answerKey: 'ceiling_lighting.faq.q1.answer'
    },
    {
      questionKey: 'ceiling_lighting.faq.q2.question',
      answerKey: 'ceiling_lighting.faq.q2.answer'
    },
    {
      questionKey: 'ceiling_lighting.faq.q3.question',
      answerKey: 'ceiling_lighting.faq.q3.answer'
    },
    {
      questionKey: 'ceiling_lighting.faq.q4.question',
      answerKey: 'ceiling_lighting.faq.q4.answer'
    },
    {
      questionKey: 'ceiling_lighting.faq.q5.question',
      answerKey: 'ceiling_lighting.faq.q5.answer'
    }
  ];

  return (
    <>
      <SEO
        title={t('ceiling_lighting.seo.title')}
        description={t('ceiling_lighting.seo.description')}
        keywords="LED ceiling lighting, COB LED strips, ceiling lights, LED strip lights, modern ceiling lighting"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-5 md:py-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                {t('ceiling_lighting.hero.title')}
              </h1>
              <p className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
                {t('ceiling_lighting.hero.subtitle')}
              </p>
              <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/${locale}/led-ceiling-lighting-kit`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base md:text-lg font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t('ceiling_lighting.hero.cta_primary')}
                </Link>
                <Link
                  to={`/${locale}/installation-guide`}
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base md:text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-700 transition-all duration-200"
                >
                  {t('ceiling_lighting.hero.cta_secondary')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-6 md:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {t('ceiling_lighting.products.title')}
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                {t('ceiling_lighting.products.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 md:gap-8">
              {ceilingProducts.map((product) => (
                <div
                  key={product.id}
                  className="premium-card overflow-hidden group"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={t(`products.${product.id}.name`)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={800}
                        height={600}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Lightbulb className="w-24 h-24 text-blue-400 opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {t(`products.${product.id}.name`)}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm md:text-base">
                      {t(`products.${product.id}.description`)}
                    </p>

                    <div className="space-y-2 mb-4">
                      {t(`products.${product.id}.features`, { returnObjects: true }) &&
                        (t(`products.${product.id}.features`, { returnObjects: true }) as string[])
                          .slice(0, 3)
                          .map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                    </div>

                    <div className="mb-4 pb-4 border-t pt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-500 text-sm">{t('ceiling_lighting.products.price_from')}</span>
                        <span className="text-2xl md:text-3xl font-bold text-gray-900">
                          {Math.min(...product.variants.map(v => v.price)).toLocaleString('cs-CZ')}
                        </span>
                        <span className="text-lg md:text-xl text-gray-600">Kč</span>
                      </div>
                    </div>

                    <Link
                      to={`/${locale}/product/${product.id}`}
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      {t('ceiling_lighting.products.view_product')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {t('ceiling_lighting.benefits.title')}
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                {t('ceiling_lighting.benefits.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="premium-card-compact text-center p-5 md:p-6"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                    <benefit.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {t(benefit.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Usage Section - SEO */}
        <section className="py-4 md:py-6 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                {t('ceiling_lighting.usage.title')}
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p className="text-sm md:text-base">
                  {t('ceiling_lighting.usage.text_1')}
                </p>
                <p className="text-sm md:text-base">
                  {t('ceiling_lighting.usage.text_2')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Design Ideas Section */}
        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {t('ceiling_lighting.ideas.title')}
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                {t('ceiling_lighting.ideas.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              {designIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <ImageWithFallback
                      src={idea.image}
                      alt={t(idea.titleKey)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      width={800}
                      height={600}
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                    <div className="p-4 md:p-5">
                      <h3 className="text-base md:text-lg font-bold text-white">
                        {t(idea.titleKey)}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 md:mt-8">
              <Link
                to={`/${locale}/blog`}
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                {t('ceiling_lighting.ideas.view_more')}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {t('ceiling_lighting.faq.title')}
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                {t('ceiling_lighting.faq.subtitle')}
              </p>
            </div>

            <Accordion
              items={faqItems.map(item => ({
                question: t(item.questionKey),
                answer: t(item.answerKey)
              }))}
            />
          </div>
        </section>

        {/* CTA Section */}
        <CTASection
          title={t('ceiling_lighting.cta.title')}
          subtitle={t('ceiling_lighting.cta.subtitle')}
          primaryButton={{
            text: t('ceiling_lighting.cta.button_primary'),
            to: `/${locale}/catalog`
          }}
          secondaryButton={{
            text: t('ceiling_lighting.cta.button_secondary'),
            to: `/${locale}/support`
          }}
          variant="blue"
        />
      </div>
    </>
  );
};

export default CeilingLedLighting;
