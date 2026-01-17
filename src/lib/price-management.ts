import { supabase } from './supabase';
import { PriceData, WarrantyPriceData } from '../types';

/**
 * Refreshes product data from the database
 * @param productId The product ID
 * @returns The product data or null if an error occurred
 */
export async function refreshProductData(productId: number) {
  try {
    console.log(`Refreshing product data for product ID: ${productId}`);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    console.log(`Successfully refreshed product data: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Error refreshing product data:', error);
    return null;
  }
}

/**
 * Fetches product prices from the database
 * @param currency The currency to fetch prices for
 * @returns Array of product prices
 */
async function getProductPrices(currency: string = 'CZK'): Promise<PriceData[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_product_prices', {
        p_currency: currency
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching product prices:', error);
    return [];
  }
}

/**
 * Fetches warranty prices from the database
 * @param currency The currency to fetch prices for
 * @param variantId The variant ID to fetch prices for
 * @returns Array of warranty prices
 */
async function getWarrantyPrices(currency: string = 'CZK', variantId: string = 'rgb-5'): Promise<WarrantyPriceData[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_warranty_prices_with_variant', {
        p_currency: currency,
        p_variant_id: variantId
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching warranty prices:', error);
    return [];
  }
}

/**
 * Updates a product price
 * @param productId The product ID
 * @param variantId The variant ID
 * @param currency The currency
 * @param price The new price
 * @returns The updated price or null if an error occurred
 */
async function updateProductPrice(
  productId: number,
  variantId: string,
  currency: string,
  price: number
): Promise<number | null> {
  try {
    console.log(`Updating product price: ${productId}, ${variantId}, ${currency}, ${price}`);
    const { data, error } = await supabase
      .rpc('update_product_variant_price', {
        p_product_id: productId,
        p_variant_id: variantId,
        p_price: price
      });

    if (error) throw error;
    console.log(`Price update successful: ${data}`);
    return data;
  } catch (error) {
    console.error('Error updating product price:', error);
    return null;
  }
}

/**
 * Updates a warranty price
 * @param productId The product ID
 * @param months The warranty duration in months
 * @param currency The currency
 * @param price The new price
 * @param variantId The variant ID
 * @returns True if the update was successful, false otherwise
 */
async function updateWarrantyPrice(
  productId: number,
  months: number,
  currency: string,
  price: number,
  variantId: string = 'rgb-5'
): Promise<boolean> {
  try {
    console.log(`Updating warranty price: ${productId}, ${months}, ${currency}, ${price}, ${variantId}`);
    const { data, error } = await supabase
      .rpc('update_warranty_price_with_variant', {
        p_product_id: productId,
        p_months: months,
        p_currency: currency,
        p_price: price,
        p_variant_id: variantId
      });

    if (error) throw error;
    console.log(`Warranty price update successful`);
    return true;
  } catch (error) {
    console.error('Error updating warranty price:', error);
    return false;
  }
}

/**
 * Fetches products from the database
 * @returns Array of products
 */
async function getProducts() {
  try {
    const { data, error } = await supabase      
      .from('products')
      .select('*')
      .order('id');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetches debug information for a warranty price
 * @param productId The product ID
 * @param months The warranty duration in months
 * @param currency The currency
 * @param variantId The variant ID
 * @returns Debug information
 */
async function debugWarrantyPrice(
  productId: number,
  months: number,
  currency: string = 'CZK',
  variantId: string = 'rgb-5'
) {
  try {
    const { data, error } = await supabase
      .rpc('debug_warranty_price', {
        p_product_id: productId,
        p_months: months,
        p_currency: currency,
        p_variant_id: variantId
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error debugging warranty price:', error);
    return null;
  }
}

/**
 * Fetches debug information for a product price
 * @param productId The product ID
 * @param variantId The variant ID
 * @param currency The currency
 * @returns Debug information
 */
async function debugProductPrice(
  productId: number,
  variantId: string,
  currency: string = 'CZK'
) {
  try {
    const { data, error } = await supabase
      .rpc('debug_product_price', {
        p_product_id: productId,
        p_variant_id: variantId,
        p_currency: currency
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error debugging product price:', error);
    return null;
  }
}

/**
 * Directly updates a product variant price in both tables
 * @param productId The product ID
 * @param variantId The variant ID
 * @param price The new price
 * @returns True if successful, false otherwise
 */
async function updateProductVariantPrice(
  productId: number,
  variantId: string,
  price: number
): Promise<boolean> {
  try {
    console.log(`Directly updating product variant price: ${productId}, ${variantId}, ${price}`);
    const { data, error } = await supabase
      .rpc('update_product_variant_price', {
        p_product_id: productId,
        p_variant_id: variantId,
        p_price: price
      });

    if (error) throw error;
    console.log(`Direct price update successful: ${data}`);
    return !!data;
  } catch (error) {
    console.error('Error updating product variant price:', error);
    return false;
  }
}