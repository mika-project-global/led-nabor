import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart as CartIcon, Heart } from 'lucide-react';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useTranslation } from '../hooks/useTranslation';
import { getWarrantyPolicies, calculateWarrantyCost } from '../lib/warranty';
import { getImageUrl } from '../lib/supabase-storage';
import { useWishlist } from '../hooks/useWishlist';

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories.find(c => c.id === categoryId);
  const categoryProducts = products.filter(p => p.category === categoryId);
  const { addToCart } = useCart();
  const { formatPrice } = useLocale();
  const { t } = useTranslation();
  const [warrantyPolicies, setWarrantyPolicies] = useState<Record<number, any[]>>({});
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Load warranty policies for all products
  useEffect(() => {
    const loadWarrantyPolicies = async () => {
      const policies: Record<number, any[]> = {};
      for (const product of categoryProducts) {
        try {
          policies[product.id] = await getWarrantyPolicies(product.id);
        } catch (error) {
          console.error(`Error loading warranty policies for product ${product.id}:`, error);
        }
      }
      setWarrantyPolicies(policies);
    };
    
    loadWarrantyPolicies();
  }, [categoryProducts]);

  // Function to add product to cart with default warranty
  const handleAddToCart = (product: any) => {
    const policies = warrantyPolicies[product.id] || [];
    const defaultPolicy = policies.find(p => p.is_default);
    
    if (defaultPolicy) {
      const additionalCost = calculateWarrantyCost(product.variants[0].price, defaultPolicy.price_multiplier);
      addToCart({
        ...product,
        warranty: {
          policyId: defaultPolicy.id,
          months: defaultPolicy.months,
          additionalCost
        }
      });
    } else {
      addToCart(product);
    }
  };

  // Group products by series
  const groupedProducts = categoryProducts.reduce((acc, product) => {
    const seriesMatch = product.name.match(/«([^»]+)»/);
    const seriesName = seriesMatch ? seriesMatch[1] : '';
    
    if (!acc[seriesName]) {
      acc[seriesName] = [];
    }
    acc[seriesName].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  if (!category) {
    return <div>{t('category_not_found')}</div>;
  }

  const getSeriesTitle = (series: string, index: number, powerInfo: string) => {
    const titles: Record<string, string> = {
      'Стандарт': `${index + 1}. Набор «Стандарт» (${powerInfo})`,
      'Люкс': `${index + 1}. Набор «Люкс» (${powerInfo})`,
      'Люкс Яркий': `${index + 1}. Набор «Люкс Яркий» (${powerInfo})`
    };
    return titles[series] || series;
  };

  const getSeriesDescription = (series: string) => {
    const descriptions: Record<string, string> = {
      'Стандарт': 'Если вы ищите недорогую подсветку, но боитесь, что вам подсунут некачественный безымянный «Китай», то заказывайте этот набор. Ленты и комплектующие торговой марки «LedsPower» - это оптимальное соотношение цены и качества. Срок службы 3 года. Гарантия 1 год.',
      'Люкс': 'По сравнению с наборами Стандарт, свет намного приятнее. Более яркий, насыщенный, хорошо рассеивается и мягко растекается по потолку. Хочется просто сидеть на диване и любоваться красивым освещением. Высокая надежность за счет светодиодных лент и блоков класса «Люкс». Срок службы 10 лет. Гарантия 2 года.',
      'Люкс Яркий': 'По сравнению с набором Люкс, этот в два раза ярче. На ленте больше светодиодов (Люкс - 30 шт./м., Яркий - 60 шт./м.). Обычно, их заказывают для гостиной комнаты. Когда мы звоним клиентам и интересуемся впечатлениями, то все говорят одно и то же: «Подсветка потрясающая!»'
    };
    return descriptions[series] || '';
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold mb-2">{t(`categories.${category.id}.name`)}</h2>
      <p className="text-xl text-gray-600 mb-8">{t(`categories.${category.id}.description`)}</p>
      
      {Object.entries(groupedProducts).map(([series, seriesProducts], index) => {
        const firstProduct = seriesProducts[0];
        const powerInfo = firstProduct.name.match(/\((.*?)\)/)?.[1] || '';
        
        return (
          <div key={series} className="mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {getSeriesTitle(series, index, powerInfo)}
            </h2>
            <div className="text-lg mb-8">{getSeriesDescription(series)}</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {seriesProducts.map(product => {
                const length = product.name.match(/\d+(?= метров)/)?.[0];
                
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative h-48">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isInWishlist(product.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600'
                            }`}
                          />
                        </button>
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="text-lg font-medium mb-2">
                        {length} {t('meters')}
                      </div>
                      <div className="text-xl font-bold mb-4">
                        {formatPrice(product.price)}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600 transition-colors"
                        >
                          <CartIcon size={20} />
                          {t('add_to_cart')}
                        </button>
                        <Link 
                          to={`/product/${product.id}`}
                          className="w-full text-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          {t('more_details')} ›
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </main>
  );
}