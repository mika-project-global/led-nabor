import React, { useState, useEffect } from 'react';
import { Shield, Info } from 'lucide-react';
import { WarrantyPolicy, WarrantySelection } from '../types';
import { useLocale } from '../context/LocaleContext';
import { calculateWarrantyCost } from '../lib/warranty';

interface WarrantySelectorProps {
  productId: number;
  basePrice: number;
  policies: WarrantyPolicy[];
  selectedWarranty: WarrantySelection | null;
  onWarrantyChange: (warranty: WarrantySelection | null) => void;
  compact?: boolean;
}

// Helper function to sort policies by months
const sortPoliciesByMonths = (policies: WarrantyPolicy[]) => {
  return [...policies].sort((a, b) => a.months - b.months);
};

export function WarrantySelector({
  productId,
  basePrice,
  policies,
  selectedWarranty,
  onWarrantyChange,
  compact = false
}: WarrantySelectorProps) {
  const { formatPrice } = useLocale();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Calculate warranty cost with proper handling of fixed prices
  const getWarrantyCost = (policy: WarrantyPolicy) => {
    // Get the variant-specific price if available
    // Fallback to fixed price if available
    if (policy.fixed_price !== undefined && policy.fixed_price !== null && policy.fixed_price > 0) {
      console.log(`Using fixed price for warranty: ${policy.fixed_price}`);
      return policy.fixed_price;
    }
    
    // Fallback to calculated price
    console.log(`Calculating warranty cost from multiplier: ${basePrice} * ${policy.price_multiplier}`);
    return calculateWarrantyCost(basePrice, policy.price_multiplier);
  };

  // Set default warranty if none is selected
  useEffect(() => {
    if (!selectedWarranty && policies.length > 0) {
      // Always select the default policy
      const defaultPolicy = policies.find(p => p.is_default) || policies.find(p => p.months === 24);
      if (defaultPolicy) {
        onWarrantyChange({
          policyId: defaultPolicy.id,
          months: defaultPolicy.months,
          stripePriceId: defaultPolicy.stripe_price_id,
          additionalCost: getWarrantyCost(defaultPolicy),
          description: defaultPolicy.description,
          terms: defaultPolicy.terms
        });
      }
    }
  }, [policies, selectedWarranty, onWarrantyChange]);

  if (policies.length === 0) {
    return null;
  }

  // Sort policies by months for consistent display
  const sortedPolicies = sortPoliciesByMonths(policies);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {sortedPolicies.map((policy) => {
          const additionalCost = getWarrantyCost(policy);
          return (
            <label
              key={policy.id}
              className={`flex items-center gap-1.5 p-2 bg-white rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                selectedWarranty?.policyId === policy.id
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`warranty-${productId}`}
                checked={selectedWarranty?.policyId === policy.id}
                onChange={() => onWarrantyChange({
                  policyId: policy.id,
                  months: policy.months,
                  stripePriceId: policy.stripe_price_id,
                  additionalCost,
                  description: policy.description,
                  terms: policy.terms
                })}
                className="text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <div className="flex items-center gap-1">
                  <Shield size={14} className="text-cyan-500" />
                  <span className="font-medium">{policy.months} мес</span>
                  {policy.is_default && <span className="text-xs text-green-600">★</span>}
                </div>
                {additionalCost > 0 && (
                  <div className="text-xs text-cyan-600">
                    +{formatPrice(additionalCost)}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Shield className="text-cyan-600" size={18} />
        Выберите гарантию:
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedPolicies.map((policy) => {
          const additionalCost = getWarrantyCost(policy);
          return (
            <label
              key={policy.id}
              className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-all ${
                selectedWarranty?.policyId === policy.id
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  name={`warranty-${productId}-${selectedVariant?.id || 'default'}`}
                  checked={selectedWarranty?.policyId === policy.id}
                  onChange={() => onWarrantyChange({
                    policyId: policy.id,
                    months: policy.months,
                    stripePriceId: policy.stripe_price_id,
                    additionalCost,
                    description: policy.description || '',
                    terms: policy.terms || ''
                  })}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                <span className="font-medium">
                  {policy.months === 24 ? 'Стандартная' : 
                   policy.months === 36 ? 'Расширенная' : 
                   'Премиум'} гарантия
                </span>
                {(policy.is_default || policy.months === 24) && (
                  <span className="text-xs text-green-600">★</span>
                )}
              </div>
              
              <div className="ml-5 space-y-1">
                <div className="text-lg font-bold text-cyan-600">{policy.months} мес</div>
                <p className="text-xs text-gray-600 line-clamp-2 relative">
                  {policy.description}
                </p>
                
                {additionalCost > 0 && (
                  <div className="text-sm text-cyan-600 font-medium">
                    +{formatPrice(additionalCost)}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  {policy.months === 24 ? 'Включено в стоимость' : 'Бесплатно при регистрации'}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}