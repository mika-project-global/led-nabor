import React, { useState } from 'react';
import { Calculator, Lightbulb, Ruler, PaintBucket, ShoppingCart, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../context/LocaleContext';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { getProductUrl } from '../lib/urls';
import { CartItem } from '../types';

interface CalculationResult {
  stripLength: number;
  totalPower: number;
  recommendedProducts: Array<{
    id: number;
    variantId: string;
    variantLength: number;
    name: string;
    reason: string;
    price: number;
  }>;
}

function getRecommendedVariant(productId: number, length: number) {
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  const sorted = [...product.variants].sort((a, b) => a.length - b.length);
  return sorted.find(v => v.length >= length) || sorted[sorted.length - 1];
}

export function LightingCalculator() {
  const { t } = useTranslation();
  const { locale, formatPrice } = useLocale();
  const { addToCart } = useCart();
  const [roomDimensions, setRoomDimensions] = useState({ length: 0, width: 0, height: 0 });
  const [roomType, setRoomType] = useState<'living' | 'bedroom' | 'kitchen' | 'other'>('living');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const calculateLighting = () => {
    const perimeter = 2 * (roomDimensions.length + roomDimensions.width);
    const stripLength = perimeter;
    const powerPerMeter = roomType === 'living' ? 25 : 22;
    const totalPower = stripLength * powerPerMeter;

    const recommendedProducts: CalculationResult['recommendedProducts'] = [];

    if (roomType === 'living') {
      const variant = getRecommendedVariant(1, stripLength);
      if (variant) {
        recommendedProducts.push({
          id: 1,
          variantId: variant.id,
          variantLength: variant.length,
          name: `${t('calculator.rgb_kit')} ${variant.length} ${t('calculator.meters')}`,
          reason: stripLength <= 5 ? t('calculator.perfect_for_living') : t('calculator.optimal_rgb'),
          price: variant.price,
        });
      }
    } else {
      const variant = getRecommendedVariant(2, stripLength);
      if (variant) {
        recommendedProducts.push({
          id: 2,
          variantId: variant.id,
          variantLength: variant.length,
          name: `${t('calculator.cct_kit')} ${variant.length} ${t('calculator.meters')}`,
          reason: stripLength <= 5 ? t('calculator.comfortable_white') : t('calculator.quality_white'),
          price: variant.price,
        });
      }
    }

    setResult({ stripLength, totalPower, recommendedProducts });
    setAddedIds(new Set());
  };

  const handleAddToCart = (rec: CalculationResult['recommendedProducts'][0]) => {
    const product = products.find(p => p.id === rec.id);
    const variant = product?.variants.find(v => v.id === rec.variantId);
    if (!product || !variant) return;
    addToCart({ ...product, variant } as CartItem);
    setAddedIds(prev => new Set([...prev, rec.variantId]));
  };

  return (
    <div className="premium-card p-5 md:p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calculator className="text-cyan-600" aria-hidden="true" />
        {t('calculator.title')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="room-length" className="block text-sm font-medium text-gray-700 mb-1">
              {t('calculator.room_length')}
            </label>
            <input
              id="room-length"
              type="number"
              min="0"
              step="0.1"
              value={roomDimensions.length || ''}
              onChange={(e) => setRoomDimensions({ ...roomDimensions, length: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              aria-describedby="length-hint"
            />
            <p id="length-hint" className="mt-1 text-sm text-gray-500">{t('calculator.room_length_hint')}</p>
          </div>

          <div>
            <label htmlFor="room-width" className="block text-sm font-medium text-gray-700 mb-1">
              {t('calculator.room_width')}
            </label>
            <input
              id="room-width"
              type="number"
              min="0"
              step="0.1"
              value={roomDimensions.width || ''}
              onChange={(e) => setRoomDimensions({ ...roomDimensions, width: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              aria-describedby="width-hint"
            />
            <p id="width-hint" className="mt-1 text-sm text-gray-500">{t('calculator.room_width_hint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('calculator.ceiling_height')}
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={roomDimensions.height || ''}
              onChange={(e) => setRoomDimensions({ ...roomDimensions, height: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('calculator.room_type')}
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as typeof roomType)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="living">{t('calculator.living_room')}</option>
              <option value="bedroom">{t('calculator.bedroom')}</option>
              <option value="kitchen">{t('calculator.kitchen')}</option>
              <option value="other">{t('calculator.other')}</option>
            </select>
          </div>

          <button
            onClick={calculateLighting}
            className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors font-medium"
          >
            {t('calculator.calculate')}
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-xl p-6 space-y-6" role="region" aria-label="Calculation Results">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Ruler size={14} />
                  {t('calculator.required_strip_length')}
                </div>
                <p className="text-2xl font-bold text-cyan-600" aria-live="polite">
                  {result.stripLength.toFixed(1)} m
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Lightbulb size={14} />
                  {t('calculator.total_power')}
                </div>
                <p className="text-2xl font-bold text-cyan-600" aria-live="polite">
                  {result.totalPower.toFixed(0)} W
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <PaintBucket size={16} className="text-cyan-600" />
                {t('calculator.recommended_kits')}
              </h3>
              <div className="space-y-3">
                {result.recommendedProducts.map((rec) => {
                  const fullProduct = products.find(p => p.id === rec.id);
                  if (!fullProduct) return null;
                  const isAdded = addedIds.has(rec.variantId);

                  return (
                    <div key={rec.variantId} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{rec.name}</h4>
                        <span className="text-base font-bold text-cyan-600 whitespace-nowrap">
                          {formatPrice(rec.price)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{rec.reason}</p>
                      <div className="flex gap-2">
                        <a
                          href={getProductUrl(locale, fullProduct)}
                          className="flex-1 text-center text-xs font-medium py-2 px-3 border border-gray-200 rounded-lg text-gray-600 hover:border-cyan-400 hover:text-cyan-600 transition-colors"
                        >
                          {t('calculator.more_details')}
                        </a>
                        <button
                          onClick={() => handleAddToCart(rec)}
                          disabled={isAdded}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg transition-all ${
                            isAdded
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-cyan-500 text-white hover:bg-cyan-600'
                          }`}
                        >
                          {isAdded ? (
                            <><Check size={13} /> {t('product.added', 'Added')}</>
                          ) : (
                            <><ShoppingCart size={13} /> {t('product.add_to_cart', 'Add to cart')}</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
