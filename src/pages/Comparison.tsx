import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingCart, ArrowRight, HelpCircle, Zap, Palette, Thermometer, Wifi, Mic, Layers, Wrench } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { useProductMinPrices } from '../hooks/useProductMinPrices';
import { SEO } from '../components/SEO';
import { products } from '../data/products';
import { getProductUrl, SITE_URL } from '../lib/urls';
import { CartItem } from '../types';

const PRODUCT_IDS = [1, 2];

interface VariantState {
  [productId: number]: string;
}

export default function Comparison() {
  const { t } = useTranslation();
  const { locale, formatPrice } = useLocale();
  const { addToCart, hasItem } = useCart();
  const { priceMap, isLoading } = useProductMinPrices(PRODUCT_IDS);
  const [selectedVariants, setSelectedVariants] = useState<VariantState>({ 1: 'rgb-5', 2: 'cct-5' });
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const rgbProduct = products.find(p => p.id === 1)!;
  const cctProduct = products.find(p => p.id === 2)!;

  const getVariantPrice = (productId: number, variantId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.variants.find(v => v.id === variantId)?.price ?? 0;
  };

  const handleAddToCart = (product: typeof rgbProduct) => {
    const variantId = selectedVariants[product.id];
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;
    addToCart({ ...product, variant } as CartItem);
    setAddedIds(prev => new Set([...prev, `${product.id}-${variantId}`]));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(`${product.id}-${variantId}`);
        return next;
      });
    }, 2000);
  };

  const isAdded = (product: typeof rgbProduct) => {
    return addedIds.has(`${product.id}-${selectedVariants[product.id]}`);
  };

  const features = [
    {
      icon: <Palette size={18} className="text-cyan-600" />,
      name: t('comparison.lighting_type'),
      rgb: 'RGB + CCT',
      cct: 'CCT',
      tooltip: 'RGB+CCT — colors + adjustable white. CCT — adjustable white only.',
    },
    {
      icon: <Thermometer size={18} className="text-cyan-600" />,
      name: t('comparison.color_temperature'),
      rgb: '2700K–6500K + RGB',
      cct: '2700K–6500K',
      tooltip: 'Warm to cool white, plus full color for RGB+CCT.',
    },
    {
      icon: <Layers size={18} className="text-cyan-600" />,
      name: t('comparison.strip_type'),
      rgb: t('comparison.cob_without_dots'),
      cct: t('comparison.cob_without_dots'),
      tooltip: 'COB technology delivers uniform light with no visible hotspots.',
    },
    {
      icon: <Zap size={18} className="text-cyan-600" />,
      name: t('comparison.color_rendering_index'),
      rgb: '>90 Ra',
      cct: '>95 Ra',
      tooltip: 'Higher Ra means more accurate color reproduction.',
    },
    {
      icon: <Wifi size={18} className="text-cyan-600" />,
      name: t('comparison.wifi_control'),
      rgb: true,
      cct: true,
      tooltip: 'Full control via smartphone app.',
    },
    {
      icon: <Mic size={18} className="text-cyan-600" />,
      name: t('comparison.voice_control'),
      rgb: true,
      cct: true,
      tooltip: 'Works with Alexa, Google Home, Alice.',
    },
    {
      icon: <Layers size={18} className="text-cyan-600" />,
      name: t('comparison.scenes_automation'),
      rgb: true,
      cct: true,
      tooltip: 'Create lighting schedules and mood scenes.',
    },
    {
      icon: <Wrench size={18} className="text-cyan-600" />,
      name: t('comparison.custom_configuration'),
      rgb: true,
      cct: true,
      tooltip: 'Order any length from 5 to 30 meters.',
    },
  ];

  const canonicalUrl = `${SITE_URL}/${locale}/comparison/`;

  return (
    <>
      <SEO
        title={`${t('comparison.title')} | LED Nabor`}
        description="Compare RGB+CCT and Adjustable White LED ceiling lighting kits. Find the perfect option for your room."
        canonical={canonicalUrl}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('comparison.title')}
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('comparison.characteristics')} — {t('comparison.key_benefits')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[rgbProduct, cctProduct].map((product) => {
              const isRgb = product.id === 1;
              const added = isAdded(product);
              const selectedVariantId = selectedVariants[product.id];
              const variantPrice = getVariantPrice(product.id, selectedVariantId);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${
                    isRgb ? 'border-cyan-400' : 'border-gray-200'
                  }`}
                >
                  {isRgb && (
                    <div className="bg-cyan-500 text-white text-xs font-semibold text-center py-1.5 rounded-t-2xl tracking-wide uppercase">
                      Popular choice
                    </div>
                  )}

                  <div className="p-6">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden mb-5 bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="mb-1">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isRgb ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isRgb ? 'RGB + CCT' : 'CCT'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h2>

                    <ul className="space-y-1.5 mb-5 mt-3">
                      {product.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check size={14} className="text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Strip length
                      </label>
                      <select
                        value={selectedVariants[product.id]}
                        onChange={(e) => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        {product.variants.map(v => (
                          <option key={v.id} value={v.id}>{v.length} m</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {isLoading ? '...' : formatPrice(variantPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          added
                            ? 'bg-green-500 text-white'
                            : isRgb
                            ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                            : 'bg-gray-900 text-white hover:bg-gray-700'
                        }`}
                      >
                        {added ? (
                          <><Check size={16} /> Added</>
                        ) : (
                          <><ShoppingCart size={16} /> {t('product.add_to_cart', 'Add to cart')}</>
                        )}
                      </button>
                      <Link
                        to={getProductUrl(locale, product)}
                        className="flex items-center gap-1 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-colors text-sm"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Detailed comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 w-1/2">Feature</th>
                    <th className="py-3 px-6 text-center text-sm font-semibold text-cyan-600">RGB+CCT</th>
                    <th className="py-3 px-6 text-center text-sm font-semibold text-gray-600">CCT</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          {feature.icon}
                          <span className="text-sm text-gray-700">{feature.name}</span>
                          <div className="group relative">
                            <HelpCircle size={13} className="text-gray-300 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                              {feature.tooltip}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {typeof feature.rgb === 'boolean' ? (
                          feature.rgb
                            ? <Check size={18} className="mx-auto text-green-500" />
                            : <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-sm font-medium text-gray-800">{feature.rgb}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {typeof feature.cct === 'boolean' ? (
                          feature.cct
                            ? <Check size={18} className="mx-auto text-green-500" />
                            : <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-sm font-medium text-gray-800">{feature.cct}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Choose RGB+CCT if you want:</h3>
              <ul className="space-y-2">
                {['Colorful dynamic lighting for living rooms and entertainment spaces', 'Mood-setting with millions of color options', 'Smart scenes synced to music or time of day', 'A "wow" factor for guests'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Choose CCT if you want:</h3>
              <ul className="space-y-2">
                {['Clean, professional white lighting for kitchens and offices', 'Higher color accuracy (Ra >95) for studios or ateliers', 'Simpler setup with no color configuration needed', 'Slightly lower starting price'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-gray-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
