import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { getStaticPageAlternateUrls, SITE_URL } from '../lib/urls';
import { Check, Zap, Wifi, Home, Radio, Shield, Truck, CreditCard, Headphones as HeadphonesIcon, ChevronDown, ChevronUp } from 'lucide-react';

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

  const [config, setConfig] = useState<KitConfig>({
    length: null,
    lightType: null,
    controlType: null,
    powerSupply: null,
  });

  const [showNotification, setShowNotification] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const lengths: Length[] = ['5m', '10m', '15m', '20m', '25m', '30m'];

  const prices = {
    led_strip: {
      rgb_cct: { '5m': 79, '10m': 139, '15m': 199, '20m': 259, '25m': 319, '30m': 379 },
      adjustable_white: { '5m': 59, '10m': 109, '15m': 159, '20m': 209, '25m': 259, '30m': 309 },
    },
    control: {
      remote: 0,
      wifi: 25,
      smart_home: 45,
    },
    power: {
      standard: 29,
      premium: 49,
    },
  };

  const calculatePrice = () => {
    if (!config.length || !config.lightType || !config.controlType || !config.powerSupply) {
      return { ledStrip: 0, control: 0, power: 0, total: 0 };
    }

    const ledStrip = prices.led_strip[config.lightType][config.length];
    const control = prices.control[config.controlType];
    const power = prices.power[config.powerSupply];
    const total = ledStrip + control + power;

    return { ledStrip, control, power, total };
  };

  const handleAddToCart = () => {
    if (!config.length || !config.lightType || !config.controlType || !config.powerSupply) {
      alert(t('build_your_kit.select_all'));
      return;
    }

    const price = calculatePrice();
    const kitName = `Custom LED Kit - ${config.length} ${t(`build_your_kit.light_type.${config.lightType}`)}`;

    addToCart({
      id: `custom-kit-${Date.now()}`,
      name: kitName,
      price: price.total,
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop',
      quantity: 1,
    });

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
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

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('build_your_kit.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('build_your_kit.subtitle')}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
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
              <p className="text-sm text-green-600 mt-3 text-center font-medium">
                {4 - completedSteps === 1
                  ? t('build_your_kit.progress.almost_done', { remaining: 4 - completedSteps })
                  : t('build_your_kit.progress.almost_done_plural', { remaining: 4 - completedSteps })
                }
              </p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-32 lg:pb-0">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step1')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lengths.map((length) => (
                  <button
                    key={length}
                    onClick={() => setConfig({ ...config, length })}
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

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step2')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setConfig({ ...config, lightType: 'rgb_cct' })}
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
                  onClick={() => setConfig({ ...config, lightType: 'adjustable_white' })}
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

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step3')}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setConfig({ ...config, controlType: 'remote' })}
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
                  onClick={() => setConfig({ ...config, controlType: 'wifi' })}
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
                    +€{prices.control.wifi}
                  </div>
                  {config.controlType === 'wifi' && (
                    <div className="mt-3 flex justify-center">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setConfig({ ...config, controlType: 'smart_home' })}
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
                    +€{prices.control.smart_home}
                  </div>
                  {config.controlType === 'smart_home' && (
                    <div className="mt-3 flex justify-center">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.step4')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setConfig({ ...config, powerSupply: 'standard' })}
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
                    €{prices.power.standard}
                  </div>
                </button>

                <button
                  onClick={() => setConfig({ ...config, powerSupply: 'premium' })}
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
                    €{prices.power.premium}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-24 hidden lg:block">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('build_your_kit.price_summary')}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{t('build_your_kit.led_strip')}</span>
                  <span className="font-semibold text-gray-900">
                    {isComplete ? `€${price.ledStrip}` : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{t('build_your_kit.control')}</span>
                  <span className="font-semibold text-gray-900">
                    {isComplete ? `€${price.control}` : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">{t('build_your_kit.power')}</span>
                  <span className="font-semibold text-gray-900">
                    {isComplete ? `€${price.power}` : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-xl font-bold text-gray-900">{t('build_your_kit.total')}</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {isComplete ? `€${price.total}` : '—'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isComplete}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isComplete
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
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
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('build_your_kit.led_strip')}</span>
                <span className="font-semibold text-gray-900">
                  {isComplete ? `€${price.ledStrip}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('build_your_kit.control')}</span>
                <span className="font-semibold text-gray-900">
                  {isComplete ? `€${price.control}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('build_your_kit.power')}</span>
                <span className="font-semibold text-gray-900">
                  {isComplete ? `€${price.power}` : '—'}
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
                    {isComplete ? `€${price.total}` : '—'}
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
                }`}
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
