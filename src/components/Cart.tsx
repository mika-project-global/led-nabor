import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { X, ShoppingBag, Power, Shield, ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { getWarrantyPolicies } from '../lib/warranty';
import { getImageUrl } from '../lib/supabase-storage'; 

interface CartProps {
  items: CartItem[];
  onRemoveFromCart: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onUpdatePlugType?: (id: number, plugType: 'EU' | 'UK') => void;
  onUpdateAdapter?: (id: number, adapter: boolean) => void;
  onUpdateWarranty: (id: number, warrantyId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ 
  items, 
  onRemoveFromCart, 
  onUpdateQuantity, 
  onUpdatePlugType,
  onUpdateAdapter,
  onUpdateWarranty,
  isOpen, 
  onClose 
}: CartProps) {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const { t } = useTranslation();
  const [warrantyPolicies, setWarrantyPolicies] = useState<Record<number, any[]>>({});
  const [showWarrantyOptions, setShowWarrantyOptions] = useState<Record<number, boolean>>({});

  const total = items.reduce((sum, item) => {
    let itemTotal = (item.variant.price + (item.warranty?.additionalCost || 0)) * item.quantity;
    if (item.adapter) {
      itemTotal += 200 * item.quantity; // 200 CZK per adapter (or equivalent in other currencies)
    }
    return sum + itemTotal;
  }, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  // Load warranty policies for all items
  useEffect(() => {
    const loadWarrantyPolicies = async () => {
      const policies: Record<number, any[]> = {};
      for (const item of items) {
        try {
          policies[item.id] = await getWarrantyPolicies(item.id);
        } catch (error) {
          console.error(`Error loading warranty policies for product ${item.id}:`, error);
        }
      }
      setWarrantyPolicies(policies);
    };
    
    if (isOpen) {
      loadWarrantyPolicies();
    }
  }, [items, isOpen]);

  const toggleWarrantyOptions = (itemId: number) => {
    setShowWarrantyOptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag />
            {t('cart.title')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center">{t('cart.empty')}</p>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/80x80?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                      {formatPrice(item.variant.price + (item.warranty?.additionalCost || 0))} × {item.quantity}
                    </p>
                    
                    {/* Warranty Selection */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Shield size={14} />
                      <div className="relative">
                        <button
                          onClick={() => toggleWarrantyOptions(item.id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                          type="button"
                          disabled={warrantyPolicies[item.id]?.length <= 1}
                        >
                          <span>
                            {item.warranty
                              ? `${item.warranty.months} ${t('cart.months')}`
                              : t('cart.select_warranty')}
                          </span>
                          {warrantyPolicies[item.id]?.length > 1 && <ChevronDown 
                            size={14} 
                            className={`transform transition-transform ${showWarrantyOptions[item.id] ? 'rotate-180' : ''}`} 
                          />}
                        </button>
                        
                        {showWarrantyOptions[item.id] && warrantyPolicies[item.id]?.length > 0 && (
                          <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px]">
                            {warrantyPolicies[item.id].sort((a, b) => a.months - b.months).map(policy => {
                              // Get the appropriate price for this variant
                              let additionalCost = 0;
                              
                              // For 60-month warranty, use variant-specific prices
                              if (policy.months === 60) {
                                // Extract variant length
                                const variantLength = parseInt(item.variant.id.split('-')[1], 10);
                                if (!isNaN(variantLength) && policy.fixed_price) {
                                  // Scale the price based on variant length
                                  additionalCost = Math.round(policy.fixed_price * (variantLength / 5));
                                }
                              } else if (policy.fixed_price !== undefined && policy.fixed_price !== null) {
                                additionalCost = policy.fixed_price;
                              } else {
                                additionalCost = Math.round(item.variant.price * policy.price_multiplier);
                              }
                              
                              return (
                                <button
                                  key={policy.id}
                                  onClick={() => {                                  
                                    // Calculate the additional cost
                                    // Store the warranty policy in the item
                                    item.warrantyPolicies = warrantyPolicies[item.id];
                                    
                                    // Update the warranty
                                    onUpdateWarranty(item.id, policy.id);
                                    
                                    // Close the dropdown
                                    toggleWarrantyOptions(item.id);
                                  }}
                                  type="button"
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                                >
                                  <span className="flex items-center gap-1">
                                    <Shield size={14} className="text-cyan-500" />
                                    {policy.months} {t('cart.months')}
                                    {policy.is_default && <span className="text-xs text-green-600">★</span>}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {item.warranty?.additionalCost > 0 && (
                        <span className="text-cyan-600 ml-1">
                          (+{formatPrice(item.warranty.additionalCost)})
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemoveFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 ml-auto"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('cart.checkout')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}