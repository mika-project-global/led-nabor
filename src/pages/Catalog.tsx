import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/supabase-storage';
import { RecentReviews } from '../components/RecentReviews';
import { CategoryGridSkeleton } from '../components/SkeletonLoader';

export default function Catalog() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CategoryGridSkeleton count={categories.length} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(category => {
          // Находим все товары в данной категории
          const categoryProducts = products.filter(p => p.category === category.id);
          
          // Определяем URL для ссылки
          const linkUrl = categoryProducts.length === 1 
            ? `/product/${categoryProducts[0].id}` 
            : `/category/${category.id}`;
          
          return (
            <Link 
              key={category.id}
              to={linkUrl}
              className="group block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <img
                  src={category.image}
                  alt={t(`categories.${category.id}.name`)}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                  <h3 className="text-4xl font-bold mb-3 group-hover:translate-y-[-5px] transition-transform">
                    {t(`categories.${category.id}.name`)}
                  </h3>
                  <p className="text-lg text-gray-100 group-hover:translate-y-[-5px] transition-transform delay-75">
                    {t(`categories.${category.id}.description`)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Reviews Section */}
      <RecentReviews />
    </main>
  );
}