import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { useNotifications } from '../hooks/useNotifications';
import { Save, RefreshCw, DollarSign, Shield, Check, X } from 'lucide-react';

interface ProductPrice {
  id: string;
  product_id: number;
  variant_id: string;
  currency: string;
  custom_price: number;
  is_active: boolean;
}

interface WarrantyPrice {
  id: string;
  product_id: number;
  variant_id: string;
  months: number;
  currency: string;
  custom_price: number;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  variants: {
    id: string;
    length: number;
    price: number;
    stockStatus: string;
  }[];
}

export function PriceManager() {
  const { formatPrice, currency } = useLocale();
  const { showNotification } = useNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]); 
  const [warrantyPrices, setWarrantyPrices] = useState<WarrantyPrice[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('rgb-5');
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [editedWarrantyPrices, setEditedWarrantyPrices] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'success' | 'error' | null>>({});
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  // Fetch products and prices
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('id');

        if (productsError) throw productsError;
        setProducts(productsData || []);

        if (productsData && productsData.length > 0) {
          setSelectedProduct(productsData[0].id);
        }

        // Fetch product prices
        const { data: pricesData, error: pricesError } = await supabase
          .rpc('get_product_prices', {
            p_currency: 'CZK'
          });

        if (pricesError) throw pricesError;
        setProductPrices(pricesData || []);

        // Fetch warranty prices
        const { data: warrantyData, error: warrantyError } = await supabase
          .rpc('get_warranty_prices_with_variant', {
            p_currency: 'CZK',
            p_variant_id: 'rgb-5'
          });

        if (warrantyError) throw warrantyError;
        // Filter to only include 60-month warranties
        setWarrantyPrices((warrantyData || []).filter(wp => wp.months === 60));
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('error', 'Ошибка при загрузке данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  // Handle price change
  const handlePriceChange = (productId: number, variantId: string, newPrice: number) => {
    const key = `${productId}-${variantId}`;
    setEditedPrices(prev => ({
      ...prev,
      [key]: newPrice
    }));
  };

  // Handle warranty price change
  const handleWarrantyPriceChange = (productId: number, variantId: string, months: number, newPrice: number) => {
    const key = `${productId}-${variantId}-${months}`;
    setEditedWarrantyPrices(prev => ({
      ...prev,
      [key]: newPrice
    }));
  };

  // Fetch price history for a product variant
  const fetchPriceHistory = async (productId: number, variantId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_price_history', {
          p_product_id: productId,
          p_variant_id: variantId,
          p_currency: 'CZK',
          p_limit: 10
        });

      if (error) throw error;
      setPriceHistory(data || []);
      setShowPriceHistory(true);
    } catch (error) {
      console.error('Error fetching price history:', error);
      showNotification('error', 'Ошибка при загрузке истории цен');
    }
  };

  // Save changes
  const saveChanges = async () => {
    setIsSaving(true);
    setSaveStatus({}); 
    
    try {
      // Save product prices
      for (const [key, price] of Object.entries(editedPrices)) {
        const [productId, variantId] = key.split('-');
        
        try {
          console.log(`Updating product price: ${productId}, ${variantId}, ${price}`); 
          
          // Используем update_product_variant_price вместо update_product_price_direct
          const { data, error } = await supabase.rpc('update_product_variant_price', {
            p_product_id: parseInt(productId), 
            p_variant_id: variantId,
            p_price: price
          });
          
          if (error) {
            console.error(`Error response:`, error);
            throw error;
          }
          
          console.log(`Update successful:`, data); 
          
          setSaveStatus(prev => ({
            ...prev,
            [key]: 'success'
          }));
        } catch (error) {
          console.error(`Error saving price for ${key}:`, error);
          setSaveStatus(prev => ({
            ...prev,
            [key]: 'error'
          }));
        }
      }
      
      // Save warranty prices
      for (const [key, price] of Object.entries(editedWarrantyPrices)) {
        const [productId, variantId, months] = key.split('-');
        
        try {
          console.log(`Updating warranty price: ${productId}, ${variantId}, ${months}, ${price}`);
          const { data, error } = await supabase.rpc('update_warranty_price_with_variant', {
            p_product_id: parseInt(productId),
            p_months: parseInt(months),
            p_currency: 'CZK',
            p_price: price,
            p_variant_id: variantId
          });
          
          if (error) {
            console.error(`Error response:`, error);
            throw error;
          }
          
          console.log(`Update successful:`, data);
          
          setSaveStatus(prev => ({
            ...prev,
            [key]: 'success'
          }));
        } catch (error) {
          console.error(`Error saving warranty price for ${key}:`, error);
          setSaveStatus(prev => ({
            ...prev,
            [key]: 'error'
          }));
        }
      }
      
      // Refresh data
      const { data: pricesData } = await supabase.rpc('get_product_prices', {
        p_currency: 'CZK'
      });
      
      setProductPrices(pricesData || []);
      
      const { data: warrantyData } = await supabase.rpc('get_warranty_prices_with_variant', {
        p_currency: 'CZK',
        p_variant_id: selectedVariant
      });
      
      // Filter to only include 60-month warranties
      setWarrantyPrices((warrantyData || []).filter(wp => wp.months === 60));
      
      // Clear edited prices
      setEditedPrices({});
      setEditedWarrantyPrices({});

      // Обновляем локальное состояние продуктов, чтобы отразить изменения
      const { data: updatedProductsData } = await supabase
        .from('products')
        .select('*')
        .order('id');
      
      if (updatedProductsData) {
        setProducts(updatedProductsData);
      }
      
      showNotification('success', 'Цены успешно обновлены');
    } catch (error) {
      console.error('Error saving changes:', error);
      showNotification('error', 'Ошибка при сохранении изменений');
    } finally {
      setIsSaving(false);
    }
  };

  // Get current price for a product variant
  const getCurrentPrice = (productId: number, variantId: string): number => {
    const key = `${productId}-${variantId}`;
    
    // First check if we have an edited price
    if (editedPrices[key] !== undefined) {
      return editedPrices[key];
    }
    
    // Then check if we have a price in the database
    const price = productPrices.find(p => 
      p.product_id === productId && 
      p.variant_id === variantId
    );
    
    if (price) {
      console.log(`Found price in database for ${variantId}: ${price.custom_price}`);
      return price.custom_price;
    }
    
    // Fallback to product variants
    const product = products.find(p => p.id === productId);
    if (product) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        console.log(`Using price from product variants for ${variantId}: ${variant.price}`);
        return variant.price;
      }
    }
    
    console.log(`No price found for ${variantId}, returning 0`);
    return 0;
  };

  // Get current warranty price
  const getCurrentWarrantyPrice = (productId: number, variantId: string, months: number): number => {
    const key = `${productId}-${variantId}-${months}`;
    
    // First check if we have an edited price
    if (editedWarrantyPrices[key] !== undefined) {
      return editedWarrantyPrices[key];
    }
    
    // Then check if we have a price in the database
    const price = warrantyPrices.find(p => 
      p.product_id === productId && 
      p.variant_id === variantId &&
      p.months === months
    );
    
    if (price) {
      console.log(`Found warranty price in database for ${variantId}, ${months} months: ${price.custom_price}`);
      return price.custom_price;
    }
    
    console.log(`No warranty price found for ${variantId}, ${months} months, returning 0`);
    return 0;
  };

  // Get save status icon
  const getSaveStatusIcon = (key: string) => {
    if (!(key in saveStatus)) return null;
    
    if (saveStatus[key] === 'success') {
      return <Check size={16} className="text-green-500" />;
    } else if (saveStatus[key] === 'error') {
      return <X size={16} className="text-red-500" />;
    }
    
    return null;
  };

  // Get product variants
  const getProductVariants = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    return product.variants;
  };

  // Get variant prefix (rgb or cct)
  const getVariantPrefix = (variantId: string) => {
    return variantId.split('-')[0];
  };

  // Get available variant prefixes for a product
  const getVariantPrefixes = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    const prefixes = new Set<string>();
    product.variants.forEach(variant => {
      prefixes.add(getVariantPrefix(variant.id));
    });
    
    return Array.from(prefixes);
  };

  // Handle variant prefix change
  const handleVariantPrefixChange = (prefix: string) => {
    // Find a variant with this prefix
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;
      
      const variant = product.variants.find(v => getVariantPrefix(v.id) === prefix);
      if (variant) {
        setSelectedVariant(variant.id);
        
        // Reload warranty prices for this variant
        const fetchWarrantyPrices = async () => {
          try {
            const { data, error } = await supabase.rpc('get_warranty_prices_with_variant', {
              p_currency: 'CZK',
              p_variant_id: variant.id
            });
            
            if (error) throw error;
            
            // Filter to only include 60-month warranties
            setWarrantyPrices((data || []).filter(wp => wp.months === 60));
          } catch (error) {
            console.error('Error fetching warranty prices:', error);
          }
        };
        
        fetchWarrantyPrices();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="text-cyan-600" />
            Управление ценами
          </h2>
          <button
            onClick={saveChanges}
            disabled={isSaving || (Object.keys(editedPrices).length === 0 && Object.keys(editedWarrantyPrices).length === 0)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save size={18} />
                Сохранить изменения
              </>
            )}
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Выберите продукт:
          </label>
          <select
            value={selectedProduct || ''}
            onChange={(e) => setSelectedProduct(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Выберите тип:
            </label>
            <div className="flex gap-2">
              {getVariantPrefixes(selectedProduct).map(prefix => (
                <button
                  key={prefix}
                  onClick={() => handleVariantPrefixChange(prefix)}
                  className={`px-4 py-2 rounded-lg ${
                    getVariantPrefix(selectedVariant) === prefix
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {prefix.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedProduct && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border">Метраж</th>
                  <th className="px-4 py-2 text-left border">Цена товара (CZK)</th>
                  <th className="px-4 py-2 text-left border">Цена гарантии 5 лет (CZK)</th>
                </tr>
              </thead>
              <tbody>
                {getProductVariants(selectedProduct)
                  .filter(variant => getVariantPrefix(variant.id) === getVariantPrefix(selectedVariant))
                  .sort((a, b) => a.length - b.length)
                  .map(variant => {
                    const productPriceKey = `${selectedProduct}-${variant.id}`;
                    const warrantyPriceKey = `${selectedProduct}-${variant.id}-60`;
                    
                    // Get current prices with proper fallbacks
                    let productPrice = getCurrentPrice(selectedProduct, variant.id);
                    let warrantyPrice = getCurrentWarrantyPrice(selectedProduct, variant.id, 60);
                    
                    // For warranty prices, if we don't have a price for this variant, calculate it based on the 5m price
                    if (warrantyPrice === 0 && variant.id !== 'rgb-5' && variant.id !== 'cct-5') {
                      const baseVariantId = variant.id.startsWith('rgb') ? 'rgb-5' : 'cct-5';
                      const basePrice = getCurrentWarrantyPrice(selectedProduct, baseVariantId, 60);
                      if (basePrice > 0) {
                        const ratio = variant.length / 5;
                        warrantyPrice = Math.round(basePrice * ratio);
                      }
                    }
                    
                    return (
                      <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">
                          {variant.length} метров
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="50"
                              value={editedPrices[productPriceKey] !== undefined ? editedPrices[productPriceKey] : productPrice}
                              onChange={(e) => handlePriceChange(selectedProduct, variant.id, Number(e.target.value))}
                              className="w-32 px-2 py-1 border rounded focus:ring-2 focus:ring-cyan-500"
                              onBlur={(e) => {
                                // Проверяем, изменилась ли цена
                                const newPrice = Number(e.target.value);
                                if (newPrice !== productPrice) {
                                  console.log(`Price changed for ${variant.id}: ${productPrice} -> ${newPrice}`);
                                  handlePriceChange(selectedProduct, variant.id, newPrice);
                                }
                              }}
                            />
                            {getSaveStatusIcon(productPriceKey)}
                            <button
                              onClick={() => fetchPriceHistory(selectedProduct, variant.id)}
                              className="text-gray-500 hover:text-gray-700 ml-2"
                              title="Показать историю изменений цены"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8v4l3 3"></path>
                                <circle cx="12" cy="12" r="10"></circle>
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={warrantyPrice || 0}
                              onChange={(e) => handleWarrantyPriceChange(selectedProduct, variant.id, 60, Number(e.target.value))}
                              onBlur={(e) => {
                                // Проверяем, изменилась ли цена гарантии
                                const newPrice = Number(e.target.value);
                                if (newPrice !== warrantyPrice) {
                                  console.log(`Warranty price changed for ${variant.id}: ${warrantyPrice} -> ${newPrice}`);
                                  handleWarrantyPriceChange(selectedProduct, variant.id, 60, newPrice);
                                }
                              }}
                              className="w-32 px-2 py-1 border rounded focus:ring-2 focus:ring-cyan-500"
                            />
                            {getSaveStatusIcon(warrantyPriceKey)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 bg-cyan-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="text-cyan-600" size={18} />
            Информация о ценах гарантии:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Стандартная гарантия (24 месяца) всегда включена в стоимость товара</li>
            <li>• Премиум гарантия (60 месяцев) является дополнительной опцией</li>
            <li>• Цены на гарантию автоматически масштабируются в зависимости от метража</li>
            <li>• Изменения цен вступают в силу немедленно</li>
          </ul>
        </div>
      </div>
      
      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">История изменений цены</h3>
              <button 
                onClick={() => setShowPriceHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left border">Дата</th>
                    <th className="px-4 py-2 text-left border">Операция</th>
                    <th className="px-4 py-2 text-left border">Старая цена</th>
                    <th className="px-4 py-2 text-left border">Новая цена</th>
                    <th className="px-4 py-2 text-left border">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.length > 0 ? (
                    priceHistory.map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 border">
                          {new Date(entry.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border">
                          {entry.operation_type === 'update_price' ? 'Обновление цены' : 
                           entry.operation_type === 'sync_price' ? 'Синхронизация' : 
                           entry.operation_type}
                        </td>
                        <td className="px-4 py-2 border">
                          {entry.old_price ? formatPrice(entry.old_price) : '-'}
                        </td>
                        <td className="px-4 py-2 border">
                          {formatPrice(entry.new_price)}
                        </td>
                        <td className="px-4 py-2 border">
                          {entry.success ? (
                            <span className="text-green-500 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"></path>
                              </svg>
                              Успешно
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              Ошибка
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 border text-center">
                        История изменений отсутствует
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPriceHistory(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}