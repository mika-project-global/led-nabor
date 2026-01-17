import { Link, useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useViewingHistory } from '../hooks/useViewingHistory';
import { products } from '../data/products';
import { useTranslation } from 'react-i18next';

export function RecentlyViewed() {
  const { history, loading } = useViewingHistory();
  const { productId } = useParams<{ productId: string }>();
  const currentProductId = productId ? Number(productId) : null;
  const { t } = useTranslation();

  if (loading || history.length === 0) {
    return null;
  }

  const uniqueProductIds = Array.from(
    new Set(history.map(item => item.product_id))
  ).filter(id => id !== currentProductId);

  const recentProducts = uniqueProductIds
    .slice(0, 4)
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-16 border-t border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900">
          {t('product.recently_viewed')}
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentProducts.map((product) => {
          if (!product) return null;

          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  от {product.variants[0].price.toLocaleString()} Kč
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
