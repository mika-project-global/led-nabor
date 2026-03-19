import { useState, useEffect } from 'react';
import { useLocale } from '../context/LocaleContext';
import { products } from '../data/products';
import { supabase } from '../lib/supabase';

type PriceMap = Record<number, number>;

function getCzkMinPrices(productIds: number[]): PriceMap {
  const map: PriceMap = {};
  for (const id of productIds) {
    const product = products.find(p => p.id === id);
    if (product && product.variants.length > 0) {
      map[id] = Math.min(...product.variants.map(v => v.price));
    }
  }
  return map;
}

export function useProductMinPrices(productIds: number[]) {
  const { currency, formatPrice } = useLocale();
  const [priceMap, setPriceMap] = useState<PriceMap>(() => getCzkMinPrices(productIds));
  const [isLoading, setIsLoading] = useState(currency !== 'CZK');

  useEffect(() => {
    if (currency === 'CZK') {
      setPriceMap(getCzkMinPrices(productIds));
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const { data } = await supabase
          .from('product_prices')
          .select('product_id, custom_price')
          .in('product_id', productIds)
          .eq('currency', currency);

        if (cancelled) return;

        if (data && data.length > 0) {
          const map: PriceMap = {};
          for (const id of productIds) {
            const rows = data.filter(r => r.product_id === id);
            if (rows.length > 0) {
              map[id] = Math.min(...rows.map(r => Number(r.custom_price)));
            }
          }
          const fallback = getCzkMinPrices(productIds);
          setPriceMap({ ...fallback, ...map });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currency, productIds.join(',')]);

  return { priceMap, isLoading, formatPrice };
}
