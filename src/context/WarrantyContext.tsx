import React, { createContext, useContext, useState, useEffect } from 'react';
import { WarrantyPolicy } from '../types';
import { supabase } from '../lib/supabase';

interface WarrantyContextType {
  policies: Record<number, WarrantyPolicy[]>;
  loadPolicies: (productId: number) => Promise<WarrantyPolicy[]>;
  calculateWarrantyCost: (basePrice: number, policyMultiplier: number) => number;
}

const WarrantyContext = createContext<WarrantyContextType | undefined>(undefined);

export function WarrantyProvider({ children }: { children: React.ReactNode }) {
  const [policies, setPolicies] = useState<Record<number, WarrantyPolicy[]>>({});

  const loadPolicies = async (productId: number): Promise<WarrantyPolicy[]> => {
    // Check if we already have policies for this product
    if (policies[productId]) {
      return policies[productId];
    }

    try {
      const { data, error } = await supabase
        .from('warranty_policies')
        .select('*')
        .eq('product_id', productId)
        .order('months', { ascending: true });

      if (error) {
        console.error('Error fetching warranty policies:', error);
        return [];
      }

      // Update the policies state
      setPolicies(prev => ({
        ...prev,
        [productId]: data || []
      }));

      return data || [];
    } catch (error) {
      console.error('Error in loadPolicies:', error);
      return [];
    }
  };

  const calculateWarrantyCost = (basePrice: number, policyMultiplier: number): number => {
    return Math.round(basePrice * policyMultiplier);
  };

  return (
    <WarrantyContext.Provider value={{
      policies,
      loadPolicies,
      calculateWarrantyCost
    }}>
      {children}
    </WarrantyContext.Provider>
  );
}

function useWarranty() {
  const context = useContext(WarrantyContext);
  if (context === undefined) {
    throw new Error('useWarranty must be used within a WarrantyProvider');
  }
  return context;
}