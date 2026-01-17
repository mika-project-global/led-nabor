import React, { useState } from 'react';
import { Calculator, Lightbulb, Ruler, PaintBucket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CalculationResult {
  stripLength: number;
  totalPower: number;
  recommendedProducts: Array<{
    id: number;
    name: string;
    reason: string;
  }>;
}

export function LightingCalculator() {
  const { t } = useTranslation();
  const [roomDimensions, setRoomDimensions] = useState({
    length: 0,
    width: 0,
    height: 0
  });
  const [roomType, setRoomType] = useState<'living' | 'bedroom' | 'kitchen' | 'other'>('living');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateLighting = () => {
    const perimeter = 2 * (roomDimensions.length + roomDimensions.width);
    const roomArea = roomDimensions.length * roomDimensions.width;
    
    // Базовая длина ленты (периметр)
    let stripLength = perimeter;
    
    // Корректировка в зависимости от типа комнаты
    const powerPerMeter = roomType === 'living' ? 25 : 22; // Вт/м для RGB+CCT и CCT соответственно
    
    // Расчёт общей мощности
    const totalPower = stripLength * powerPerMeter;
    
    // Подбор рекомендуемых продуктов
    const recommendedProducts = [];
    
    // Рекомендации на основе типа комнаты
    if (stripLength <= 5) {
      recommendedProducts.push({
        id: 1,
        name: roomType === 'living' ? `${t('calculator.rgb_kit')} 5 ${t('calculator.meters')}` : `${t('calculator.cct_kit')} 5 ${t('calculator.meters')}`,
        reason: roomType === 'living'
          ? t('calculator.perfect_for_living')
          : t('calculator.comfortable_white')
      });
    } else if (stripLength <= 10) {
      recommendedProducts.push({
        id: 2,
        name: roomType === 'living' ? `${t('calculator.rgb_kit')} 10 ${t('calculator.meters')}` : `${t('calculator.cct_kit')} 10 ${t('calculator.meters')}`,
        reason: roomType === 'living'
          ? t('calculator.optimal_rgb')
          : t('calculator.quality_white')
      });
    }

    setResult({
      stripLength,
      totalPower,
      recommendedProducts
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
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
              onChange={(e) => setRoomDimensions({
                ...roomDimensions,
                length: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              aria-describedby="length-hint"
            />
            <p id="length-hint" className="mt-1 text-sm text-gray-500">
              {t('calculator.room_length_hint')}
            </p>
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
              onChange={(e) => setRoomDimensions({
                ...roomDimensions,
                width: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              aria-describedby="width-hint"
            />
            <p id="width-hint" className="mt-1 text-sm text-gray-500">
              {t('calculator.room_width_hint')}
            </p>
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
              onChange={(e) => setRoomDimensions({
                ...roomDimensions,
                height: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('calculator.room_type')}
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as any)}
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
            className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
            aria-label="Calculate required strip length"
          >
            {t('calculator.calculate')}
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6" role="region" aria-label="Calculation Results">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Ruler className="text-cyan-600" aria-hidden="true" />
                  {t('calculator.required_strip_length')}
                </h3>
                <p className="text-2xl font-bold text-cyan-600" aria-live="polite">
                  {result.stripLength.toFixed(1)} m
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="text-cyan-600" aria-hidden="true" />
                  {t('calculator.total_power')}
                </h3>
                <p className="text-2xl font-bold text-cyan-600" aria-live="polite">
                  {result.totalPower.toFixed(1)} W
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <PaintBucket className="text-cyan-600" />
                  {t('calculator.recommended_kits')}
                </h3>
                <div className="space-y-4">
                  {result.recommendedProducts.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-cyan-600">{product.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{product.reason}</p>
                      <a
                        href={`/product/${product.id}`}
                        className="inline-block mt-2 text-sm text-cyan-600 hover:text-cyan-700"
                      >
                        {t('calculator.more_details')} →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}