import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lightbulb, Ruler, Settings } from 'lucide-react';
import { Product } from '../types';
import { useLocale } from '../context/LocaleContext';
import { ImageWithFallback } from './ImageWithFallback';
import { getImageUrl } from '../lib/supabase-storage';

interface ProductRecommendationsProps {
  currentProduct?: Product;
  roomType?: string;
  area?: number;
  products: Product[];
}

export function ProductRecommendations({ currentProduct, roomType, area, products }: ProductRecommendationsProps) {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();

  // Логика рекомендаций
  const getRecommendations = () => {
    let recommendations = [...products];

    // Фильтрация по типу комнаты
    if (roomType) {
      recommendations = recommendations.filter(product => {
        if (roomType === 'living') return product.type === 'retail' && product.name.includes('Яркий');
        if (roomType === 'bedroom') return product.type === 'retail' && !product.name.includes('Яркий');
        if (roomType === 'office') return product.type === 'b2b' && product.segment === 'office';
        return true;
      });
    }

    // Фильтрация по площади
    if (area) {
      recommendations = recommendations.filter(product => {
        const variant = product.variants.find(v => v.length >= Math.ceil(area * 0.8));
        return variant !== undefined;
      });
    }

    // Если смотрим конкретный продукт, показываем похожие
    if (currentProduct) {
      recommendations = recommendations.filter(product => 
        product.id !== currentProduct.id && 
        product.category === currentProduct.category
      );
    }

    // Сортировка по релевантности
    recommendations.sort((a, b) => {
      if (a.type === 'b2b' && b.type !== 'b2b') return -1;
      if (a.type !== 'b2b' && b.type === 'b2b') return 1;
      return 0;
    });

    return recommendations.slice(0, 3);
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="text-cyan-600" />
        Рекомендуемые товары
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map(product => (
          <div 
            key={product.id}
            className="group cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
              <ImageWithFallback
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="font-medium mb-2 group-hover:text-cyan-600 transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Lightbulb size={16} />
                <span>{product.type === 'b2b' ? 'Коммерческое' : 'Бытовое'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Ruler size={16} />
                <span>{product.variants[0].length}м</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold">
                от {formatPrice(product.variants[0].price)}
              </span>
              <button className="text-cyan-600 hover:text-cyan-700">
                Подробнее →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}