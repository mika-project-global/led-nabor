import { supabase } from './supabase';
import { WarrantyPolicy } from '../types';

/**
 * Fetches warranty policies for a specific product
 * @param productId The ID of the product
 * @returns Array of warranty policies
 */
export async function getWarrantyPolicies(productId: number): Promise<WarrantyPolicy[]> {
  const { data, error } = await supabase
    .from('warranty_policies')
    .select('*')    
    .eq('is_default', true)
    .eq('product_id', productId)
    .order('months', { ascending: true });

  if (error) {
    console.error('Error fetching warranty policies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Calculates the additional cost for a warranty based on the base price and policy multiplier
 * If a fixed price is provided, it will be used instead of calculating from the multiplier
 * @param basePrice The base price of the product
 * @param policyMultiplier The multiplier from the warranty policy (e.g., 0.15 for 15%)
 * @param fixedPrice Optional fixed price for the warranty
 * @returns The calculated additional cost
 */
export function calculateWarrantyCost(
  basePrice: number,
  policyMultiplier: number = 0,
  fixedPrice?: number | null
): number {
  // If a fixed price is provided, use it
  if (fixedPrice !== undefined && fixedPrice !== null && fixedPrice > 0) {
    return fixedPrice;
  }
  
  // Ensure we're working with valid numbers
  if (typeof basePrice !== 'number' || isNaN(basePrice) || 
      typeof policyMultiplier !== 'number' || isNaN(policyMultiplier)) {
    console.warn('Invalid inputs for calculateWarrantyCost:', { basePrice, policyMultiplier });
    return 0;
  }
  
  return Math.round(basePrice * policyMultiplier);
}
