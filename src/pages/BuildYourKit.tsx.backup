import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { getStaticPageAlternateUrls, SITE_URL } from '../lib/urls';
import { Check, Zap, Wifi, Home, Radio, Shield, Truck, CreditCard, Headphones as HeadphonesIcon, ChevronDown, ChevronUp, X } from 'lucide-react';
import { KIT_CONFIG, formatKitPrice, calculateKitPrice } from '../config/kit-prices';
import { Product } from '../types';

type Length = '5m' | '10m' | '15m' | '20m' | '25m' | '30m';
type LightType = 'rgb_cct' | 'adjustable_white';
type ControlType = 'remote' | 'wifi' | 'smart_home';
type PowerSupply = 'standard' | 'premium';

interface KitConfig {
  length: Length | null;
  lightType: LightType | null;
  controlType: ControlType | null;
  powerSupply: PowerSupply | null;
}

export default function BuildYourKit() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [config, setConfig] = useState<KitConfig>({
    length: null,
    lightType: null,
    controlType: null,
    powerSupply: null,
  });

  const [showNotification, setShowNotification] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-scroll
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  const lengths: Length[] = ['5m', '10m', '15m', '20m', '25m', '30m'];

  const calculatePrice = () => {
    return calculateKitPrice(
      config.length,
      config.lightType,
      config.controlType,
      config.powerSupply
    );
  };

  const handleAddToCart = () => {
    if (!config.length || !config.lightType || !config.controlType || !config.powerSupply) {
      setError(t('build_your_kit.select_all'));
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const price = calculatePrice();

      // Build kit name with selected options
      const lightTypeName = t(`build_your_kit.light_type.${config.lightType}`);
      const controlTypeName = t(`build_your_kit.control_type.${config.controlType}`);
      const powerTypeName = t(`build_your_kit.power_supply.${config.powerSupply}`);

      const kitName = locale === 'ru'
        ? `LED комплект ${config.length} - ${lightTypeName}`
        : `LED Kit ${config.length} - ${lightTypeName}`;

      // Create a proper Product object for the cart
      const customKit: Product = {
        id: Date.now(), // Unique ID for custom kit
        name: kitName,
        slugs: {
          en: 'custom-led-kit',
          ru: 'custom-led-kit',
          cz: 'custom-led-kit',
          de: 'custom-led-kit',
          pl: 'custom-led-kit',
        },
        type: 'retail',
        basePrice: price.total,
        description: locale === 'ru'
          ? `Индивидуальный LED комплект: ${config.length}, ${lightTypeName}, ${controlTypeName}, ${powerTypeName}`
          : `Custom LED Kit: ${config.length}, ${lightTypeName}, ${controlTypeName}, ${powerTypeName}`,
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop'],
        category: 'custom-kits',
        variants: [
          {
            id: `kit-${config.length}-${config.lightType}-${config.controlType}-${config.powerSupply}`,
            length: parseInt(config.length),
            price: price.total,
            stockStatus: 'in_stock',
          },
        ],
        features: [
          `${config.length} LED ${lightTypeName}`,
          controlTypeName,
          powerTypeName,
        ],
        controlOptions: [controlTypeName],
      };

      addToCart(customKit);

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        // Navigate to checkout after notification
        navigate(`/${locale}/checkout`);
      }, 1000);

    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(t('build_your_kit.add_to_cart_error') || 'Failed to add to cart');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Auto-scroll to next step
  const scrollToStep = (stepRef: React.RefObject<HTMLDivElement>) => {
    if (stepRef.current) {
      const headerOffset = 120; // Account for sticky header + some padding
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

    // Also scroll to button on mobile
    if (window.innerWidth < 1024 && addToCartButtonRef.current) {
      setTimeout(() => {
        addToCartButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  };

  // Update handlers with auto-scroll
  const handleLengthSelect = (length: Length) => {
    setConfig({ ...config, length });
    setTimeout(() => scrollToStep(step2Ref), 100);
  };

  const handleLightTypeSelect = (lightType: LightType) => {
    setConfig({ ...config, lightType });
    setTimeout(() => scrollToStep(step3Ref), 100);
  };

  const handleControlTypeSelect = (controlType: ControlType) => {
    setConfig({ ...config, controlType });
    setTimeout(() => scrollToStep(step4Ref), 100);
  };

  const handlePowerSupplySelect = (powerSupply: PowerSupply) => {
    setConfig({ ...config, powerSupply });
    setTimeout(() => highlightAddToCartButton(), 100);
  };

  const price = calculatePrice();
  const isComplete = config.length && config.lightType && config.controlType && config.powerSupply;

  const getCompletedSteps = () => {
    let completed = 0;
    if (config.length) completed++;
    if (config.lightType) completed++;
    if (config.controlType) completed++;
    if (config.powerSupply) completed++;
    return completed;
  };

  const getMissingSteps = () => {
    const missing: string[] = [];
    if (!config.length) missing.push(t('build_your_kit.missing.length'));
    if (!config.lightType) missing.push(t('build_your_kit.missing.light_type'));
    if (!config.controlType) missing.push(t('build_your_kit.missing.control_type'));
    if (!config.powerSupply) missing.push(t('build_your_kit.missing.power_supply'));
    return missing;
  };

  const getProgressPercentage = () => {
    return (getCompletedSteps() / 4) * 100;
  };

  const showMotivation = () => {
    const completed = getCompletedSteps();
    const remaining = 4 - completed;
    return completed >= 2 && completed < 4 && remaining > 0;
  };

  const completedSteps = getCompletedSteps();
  const missingSteps = getMissingSteps();
  const progressPercentage = getProgressPercentage();

  const alternateUrls = getStaticPageAlternateUrls('build-your-kit');
  const canonicalUrl = `${SITE_URL}/${locale}/build-your-kit`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <SEO
        title={t('build_your_kit.title')}
        description={t('build_your_kit.subtitle')}
        type="website"
        alternateUrls={alternateUrls}
        canonicalUrl={canonicalUrl}
      />

      {showNotification && (
        <div className="fixed top-24 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-semibold">{t('build_your_kit.added_to_cart')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-24 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5" />
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('build_your_kit.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('build_your_kit.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-32 lg:pb-0">
          <div className="lg:col-span-2 space-y-8">
            <div ref={step1Ref} className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ scrollMarginTop: '120px' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step1')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lengths.map((length) => (
                  <button
                    key={length}
                    onClick={() => handleLengthSelect(length)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      config.length === length
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {length.replace('m', '')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t(`build_your_kit.length.${length}`)}
                      </div>
                    </div>
                    {config.length === length && (
                      <div className="mt-2 flex justify-center">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div ref={step2Ref} className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ scrollMarginTop: '120px' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step2')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleLightTypeSelect('rgb_cct')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    config.lightType === 'rgb_cct'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-lg"></div>
                    {config.lightType === 'rgb_cct' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('build_your_kit.light_type.rgb_cct')}
                  </h3>
                  <p className="text-gray-600">
                    {t('build_your_kit.light_type.rgb_cct_desc')}
                  </p>
                </button>

                <button
                  onClick={() => handleLightTypeSelect('adjustable_white')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    config.lightType === 'adjustable_white'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-200 to-blue-200 rounded-lg"></div>
                    {config.lightType === 'adjustable_white' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('build_your_kit.light_type.adjustable_white')}
                  </h3>
                  <p className="text-gray-600">
                    {t('build_your_kit.light_type.adjustable_white_desc')}
                  </p>
                </button>
              </div>
            </div>

            <div ref={step3Ref} className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ scrollMarginTop: '120px' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step3')}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleControlTypeSelect('remote')}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    config.controlType === 'remote'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Radio className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('build_your_kit.control_type.remote')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('build_your_kit.control_type.remote_desc')}
                  </p>
                  <div className="text-sm font-semibold text-green-600">
                    {locale === 'ru' ? 'Включено' : 'Included'}
                  </div>
                  {config.controlType === 'remote' && (
                    <div className="mt-3 flex justify-center">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleControlTypeSelect('wifi')}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    config.controlType === 'wifi'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('build_your_kit.control_type.wifi')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('build_your_kit.control_type.wifi_desc')}
                  </p>
                  <div className="text-sm font-semibold text-blue-600">
                    +{formatKitPrice(KIT_CONFIG.control.wifi, locale)}
                  </div>
                  {config.controlType === 'wifi' && (
                    <div className="mt-3 flex justify-center">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleControlTypeSelect('smart_home')}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    config.controlType === 'smart_home'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Home className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('build_your_kit.control_type.smart_home')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('build_your_kit.control_type.smart_home_desc')}
                  </p>
                  <div className="text-sm font-semibold text-blue-600">
                    +{formatKitPrice(KIT_CONFIG.control.smart_home, locale)}
                  </div>
                  {config.controlType === 'smart_home' && (
                    <div className="mt-3 flex justify-center">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div ref={step4Ref} className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ scrollMarginTop: '120px' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step4')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => handlePowerSupplySelect('standard')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    config.powerSupply === 'standard'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-gray-700" />
                    </div>
                    {config.powerSupply === 'standard' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('build_your_kit.power_supply.standard')}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {t('build_your_kit.power_supply.standard_desc')}
                  </p>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatKitPrice(KIT_CONFIG.power.standard, locale)}
                  </div>
                </button>

                <button
                  onClick={() => handlePowerSupplySelect('premium')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    config.powerSupply === 'premium'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    {config.powerSupply === 'premium' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('build_your_kit.power_supply.premium')}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {t('build_your_kit.power_supply.premium_desc')}
                  </p>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatKitPrice(KIT_CONFIG.power.premium, locale)}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-24 hidden lg:block">
              {/* Progress Indicator - now inside sticky block */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {t('build_your_kit.progress.step_of', { current: completedSteps, total: 4 })}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t('build_your_kit.progress.step_of', { current: completedSteps, total: 4 })}
                  />
                </div>
                {showMotivation() && (
                  <p className="text-xs text-green-600 mt-2 text-center font-medium">
                    {4 - completedSteps === 1
                      ? t('build_your_kit.progress.almost_done', { remaining: 4 - completedSteps })
                      : t('build_your_kit.progress.almost_done_plural', { remaining: 4 - completedSteps })
                    }
                  </p>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.price_summary')}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{t('build_your_kit.led_strip')}</span>
                  <span className="font-semibold text-gray-900">
                    {isComplete ? formatKitPrice(price.ledStrip, locale) : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{t('build_your_kit.control')}</span>
                  <span className="font-semibold text-gray-900">
                    {isComplete ? formatKitPrice(price.control, locale) : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{t('build_your_kit.power')}</span>
                  <span className="font-semibold text-gray-900">
                    {isComplete ? formatKitPrice(price.power, locale) : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-xl font-bold text-gray-900">{t('build_your_kit.total')}</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {isComplete ? formatKitPrice(price.total, locale) : '—'}
                  </span>
                </div>
              </div>

              <button
                ref={addToCartButtonRef}
                onClick={handleAddToCart}
                disabled={!isComplete}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isComplete
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } ${highlightButton ? 'animate-pulse ring-4 ring-blue-300' : ''}`}
                aria-label={isComplete ? t('build_your_kit.add_to_cart') : t('build_your_kit.select_all')}
              >
                {t('build_your_kit.add_to_cart')}
              </button>

              {!isComplete && missingSteps.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    {t('build_your_kit.select_all')}:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {missingSteps.map((step, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>{t('build_your_kit.trust_badges.warranty')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>{t('build_your_kit.trust_badges.delivery')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>{t('build_your_kit.trust_badges.payment')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <HeadphonesIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>{t('build_your_kit.trust_badges.support')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40">
          {/* Expandable Details */}
          {mobileExpanded && (
            <div className="border-b border-gray-200 p-4 space-y-3 animate-slide-up">
              {/* Progress in mobile expanded */}
              <div className="pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">
                    {t('build_your_kit.progress.step_of', { current: completedSteps, total: 4 })}
                  </span>
                  <span className="text-xs font-semibold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('build_your_kit.led_strip')}</span>
                <span className="font-semibold text-gray-900">
                  {isComplete ? formatKitPrice(price.ledStrip, locale) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('build_your_kit.control')}</span>
                <span className="font-semibold text-gray-900">
                  {isComplete ? formatKitPrice(price.control, locale) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('build_your_kit.power')}</span>
                <span className="font-semibold text-gray-900">
                  {isComplete ? formatKitPrice(price.power, locale) : '—'}
                </span>
              </div>
              {/* Trust Badges Mobile */}
              <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>{t('build_your_kit.trust_badges.warranty')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>{t('build_your_kit.trust_badges.delivery')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>{t('build_your_kit.trust_badges.payment')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <HeadphonesIcon className="w-4 h-4 text-blue-600" />
                  <span>{t('build_your_kit.trust_badges.support')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Bar */}
          <div className="p-4">
            {/* Compact progress when collapsed */}
            {!mobileExpanded && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">
                    {t('build_your_kit.progress.step_of', { current: completedSteps, total: 4 })}
                  </span>
                  <span className="text-xs font-semibold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-1 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setMobileExpanded(!mobileExpanded)}
                className="flex items-center gap-2 min-w-0"
                aria-label={mobileExpanded ? 'Hide details' : 'Show details'}
                aria-expanded={mobileExpanded}
              >
                <div className="text-left">
                  <div className="text-xs text-gray-500">{t('build_your_kit.total')}</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {isComplete ? formatKitPrice(price.total, locale) : '—'}
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
                className={`px-6 py-3 rounded-xl font-bold text-base transition-all flex-shrink-0 ${
                  isComplete
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } ${highlightButton ? 'animate-pulse ring-4 ring-blue-300' : ''}`}
                aria-label={isComplete ? t('build_your_kit.add_to_cart') : t('build_your_kit.select_all')}
              >
                {t('build_your_kit.add_to_cart')}
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
