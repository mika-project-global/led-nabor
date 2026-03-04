import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { getStaticPageAlternateUrls, SITE_URL } from '../lib/urls';
import { Check, Shield, Truck, ChevronDown, ChevronUp, X, Package } from 'lucide-react';
import { products } from '../data/products';
import { Product } from '../types';

type Length = 5 | 10 | 15 | 20 | 25 | 30;
type LightType = 'rgb_cct' | 'adjustable_white';

interface KitConfig {
  lightType: LightType | null;
  length: Length | null;
}

export default function BuildYourKit() {
  const { t } = useTranslation();
  const { locale, formatPrice } = useLocale();
  const { addToCart } = useCart();

  const [config, setConfig] = useState<KitConfig>({
    lightType: null,
    length: null,
  });

  const [showNotification, setShowNotification] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-scroll
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  const lengths: Length[] = [5, 10, 15, 20, 25, 30];

  // Find matching product from catalog
  const findProduct = (): { product: Product; variantIndex: number } | null => {
    if (!config.lightType || !config.length) return null;

    const product = products.find(p => {
      if (config.lightType === 'rgb_cct') {
        return p.id === 1; // Universal RGB+CCT
      } else {
        return p.id === 2; // Adjustable White
      }
    });

    if (!product) return null;

    const variantIndex = product.variants.findIndex(v => v.length === config.length);
    if (variantIndex === -1) return null;

    return { product, variantIndex };
  };

  const selectedProduct = findProduct();
  const price = selectedProduct
    ? selectedProduct.product.variants[selectedProduct.variantIndex].price
    : 0;
  const isComplete = config.lightType && config.length;

  // Auto-scroll to next step
  const scrollToStep = (stepRef: React.RefObject<HTMLDivElement>) => {
    if (stepRef.current) {
      const headerOffset = 100;
      const elementPosition = stepRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Highlight add to cart button
  const highlightAddToCartButton = () => {
    setHighlightButton(true);
    setTimeout(() => setHighlightButton(false), 2000);

    if (window.innerWidth < 1024 && addToCartButtonRef.current) {
      setTimeout(() => {
        addToCartButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  };

  const handleLightTypeSelect = (lightType: LightType) => {
    setConfig({ ...config, lightType });
    setTimeout(() => scrollToStep(step2Ref), 100);
  };

  const handleLengthSelect = (length: Length) => {
    setConfig({ ...config, length });
    setTimeout(() => highlightAddToCartButton(), 100);
  };

  const handleAddToCart = () => {
    if (!isComplete || !selectedProduct) {
      setError(t('build_your_kit.select_all'));
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { product } = selectedProduct;

      // Add REAL product to cart (not virtual)
      addToCart(product);

      setShowNotification(true);

      // Trigger cart drawer to open in Header
      setTimeout(() => {
        setShowNotification(false);
        // Click on cart button in header to open drawer
        const cartButton = document.querySelector('.cart-button') as HTMLButtonElement;
        if (cartButton) {
          cartButton.click();
        }
      }, 800);

    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(t('build_your_kit.add_to_cart_error') || 'Failed to add to cart');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getCompletedSteps = () => {
    let completed = 0;
    if (config.lightType) completed++;
    if (config.length) completed++;
    return completed;
  };

  const completedSteps = getCompletedSteps();
  const totalSteps = 2;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const showMotivation = () => completedSteps > 0 && completedSteps < totalSteps;

  const getMissingSteps = () => {
    const missing = [];
    if (!config.lightType) missing.push(t('build_your_kit.missing.light_type'));
    if (!config.length) missing.push(t('build_your_kit.missing.length'));
    return missing;
  };

  const missingSteps = getMissingSteps();

  const alternateUrls = getStaticPageAlternateUrls('build-your-kit');
  const canonicalUrl = `${SITE_URL}/${locale}/build-your-kit`;

  return (
    <main className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <SEO
        title={t('build_your_kit.title')}
        description={t('build_your_kit.subtitle')}
        alternateUrls={alternateUrls}
        canonicalUrl={canonicalUrl}
      />

      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-semibold">{t('build_your_kit.added_to_cart')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-20 right-4 bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5" />
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t('build_your_kit.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('build_your_kit.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pb-32 lg:pb-0">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Light Type */}
            <div ref={step1Ref} className="bg-white rounded-xl shadow-md p-4 md:p-6" style={{ scrollMarginTop: '100px' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('build_your_kit.step1')}: {t('build_your_kit.choose_light_type')}
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                <button
                  onClick={() => handleLightTypeSelect('rgb_cct')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    config.lightType === 'rgb_cct'
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-lg"></div>
                    {config.lightType === 'rgb_cct' && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {t('build_your_kit.light_type.rgb_cct')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('build_your_kit.light_type.rgb_cct_desc')}
                  </p>
                </button>

                <button
                  onClick={() => handleLightTypeSelect('adjustable_white')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    config.lightType === 'adjustable_white'
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-200 to-blue-200 rounded-lg"></div>
                    {config.lightType === 'adjustable_white' && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {t('build_your_kit.light_type.adjustable_white')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('build_your_kit.light_type.adjustable_white_desc')}
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: Length */}
            <div ref={step2Ref} className="bg-white rounded-xl shadow-md p-4 md:p-6" style={{ scrollMarginTop: '100px' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('build_your_kit.step2')}: {t('build_your_kit.choose_length')}
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {lengths.map((length) => (
                  <button
                    key={length}
                    onClick={() => handleLengthSelect(length)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      config.length === length
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">
                        {length}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('build_your_kit.meters')}
                      </div>
                    </div>
                    {config.length === length && (
                      <div className="mt-1 flex justify-center">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* What's Included */}
            {isComplete && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-md p-4 md:p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {locale === 'ru' ? 'Что входит в комплект' : "What's included"}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {locale === 'ru' ? 'COB LED лента' : 'COB LED Strip'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {config.length}м, {config.lightType === 'rgb_cct' ? 'RGB+CCT' : locale === 'ru' ? 'Регулируемый белый' : 'Adjustable White'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {locale === 'ru' ? 'Wi-Fi контроллер' : 'Wi-Fi Controller'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {locale === 'ru' ? 'Управление через приложение' : 'App control'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {locale === 'ru' ? 'Блок питания' : 'Power Supply'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {locale === 'ru' ? 'Компактный, надежный' : 'Compact, reliable'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {locale === 'ru' ? 'Пульт управления' : 'Remote Control'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {locale === 'ru' ? 'Для удобного управления' : 'Convenient control'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {locale === 'ru' ? 'Кабели и коннекторы' : 'Cables & Connectors'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {locale === 'ru' ? 'Всё для подключения' : 'Everything to connect'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 sticky top-20 hidden lg:block">
              {/* Progress */}
              <div className="mb-5 pb-5 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {locale === 'ru' ? `Шаг ${completedSteps} из ${totalSteps}` : `Step ${completedSteps} of ${totalSteps}`}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {showMotivation() && (
                  <p className="text-xs text-green-600 mt-2 text-center font-medium">
                    {locale === 'ru'
                      ? `Осталось ${totalSteps - completedSteps} ${totalSteps - completedSteps === 1 ? 'шаг' : 'шага'}!`
                      : `${totalSteps - completedSteps} step${totalSteps - completedSteps === 1 ? '' : 's'} left!`
                    }
                  </p>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {locale === 'ru' ? 'Итого' : 'Total'}
              </h2>

              <div className="mb-5">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-gray-900">{locale === 'ru' ? 'Цена' : 'Price'}</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {isComplete ? formatPrice(price) : '—'}
                  </span>
                </div>
              </div>

              <button
                ref={addToCartButtonRef}
                onClick={handleAddToCart}
                disabled={!isComplete}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                  isComplete
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } ${highlightButton ? 'animate-pulse ring-4 ring-blue-300' : ''}`}
              >
                {locale === 'ru' ? 'Добавить в корзину' : 'Add to Cart'}
              </button>

              {!isComplete && missingSteps.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium mb-1">
                    {locale === 'ru' ? 'Выберите:' : 'Please select:'}
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {missingSteps.map((step, i) => (
                      <li key={i}>• {step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">{locale === 'ru' ? 'Гарантия' : 'Warranty'}</div>
                  <div className="text-xs text-gray-600">{locale === 'ru' ? '2 года' : '2 years'}</div>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">{locale === 'ru' ? 'Доставка' : 'Delivery'}</div>
                  <div className="text-xs text-gray-600">{locale === 'ru' ? '1-3 дня' : '1-3 days'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-30">
          {mobileExpanded && (
            <div className="border-b border-gray-200 p-3 space-y-2 animate-slide-up">
              {/* Progress */}
              <div className="pb-2 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">
                    {locale === 'ru' ? `Шаг ${completedSteps} из ${totalSteps}` : `Step ${completedSteps} of ${totalSteps}`}
                  </span>
                  <span className="text-xs font-semibold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>{locale === 'ru' ? 'Гарантия 2 года' : '2-year warranty'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>{locale === 'ru' ? 'Доставка 1-3 дня' : 'Delivery 1-3 days'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-3">
            {!mobileExpanded && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">
                    {locale === 'ru' ? `Шаг ${completedSteps}/${totalSteps}` : `Step ${completedSteps}/${totalSteps}`}
                  </span>
                  <span className="text-xs font-semibold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setMobileExpanded(!mobileExpanded)}
                className="flex items-center gap-2 min-w-0"
              >
                <div className="text-left">
                  <div className="text-xs text-gray-500">{locale === 'ru' ? 'Цена' : 'Price'}</div>
                  <div className="text-xl font-bold text-blue-600">
                    {isComplete ? formatPrice(price) : '—'}
                  </div>
                </div>
                {mobileExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={!isComplete}
                className={`px-5 py-2.5 rounded-lg font-bold text-base transition-all flex-shrink-0 ${
                  isComplete
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } ${highlightButton ? 'animate-pulse ring-4 ring-blue-300' : ''}`}
              >
                {locale === 'ru' ? 'В корзину' : 'Add to Cart'}
              </button>
            </div>

            {!isComplete && missingSteps.length > 0 && !mobileExpanded && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                {missingSteps.join(' • ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
