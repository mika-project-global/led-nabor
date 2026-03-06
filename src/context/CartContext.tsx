import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number, variantId: string) => void;
  updateQuantity: (productId: number, variantId: string, quantity: number) => void;
  updateWarranty: (productId: number, variantId: string, warrantyId: string | null) => void;
  updateAdapter: (productId: number, variantId: string, adapter: boolean) => void;
  updatePlugType: (productId: number, variantId: string, plugType: 'EU' | 'UK') => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  hasItem: (productId: number, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse cart data:', error);
      return [];
    }
  });

  // Sync cart state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart data:', error);
    }
  }, [items]);

  // Sync cart between tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cart' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setItems(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error('Failed to sync cart data:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => {
      let itemTotal = item.variant.price * item.quantity;
      return sum + itemTotal;
    }, 0);
  };

  const hasItem = (productId: number, variantId?: string) => {
    if (variantId) {
      return items.some(item => item.id === productId && item.variant.id === variantId);
    }
    return items.some(item => item.id === productId);
  };

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(
        item => item.id === product.id && item.variant.id === product.variant.id
      );

      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id && item.variant.id === product.variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number, variantId: string) => {
    setItems(currentItems => currentItems.filter(
      item => !(item.id === productId && item.variant.id === variantId)
    ));
  };

  const updateQuantity = (productId: number, variantId: string, quantity: number) => {
    setItems(currentItems => {
      if (quantity === 0) {
        return currentItems.filter(
          item => !(item.id === productId && item.variant.id === variantId)
        );
      }

      return currentItems.map(item =>
        item.id === productId && item.variant.id === variantId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const updateAdapter = (productId: number, variantId: string, adapter: boolean) => {
    setItems(currentItems => {
      return currentItems.map(item =>
        item.id === productId && item.variant.id === variantId
          ? { ...item, adapter }
          : item
      );
    });
  };

  const updatePlugType = (productId: number, variantId: string, plugType: 'EU' | 'UK') => {
    setItems(currentItems => {
      return currentItems.map(item =>
        item.id === productId && item.variant.id === variantId
          ? { ...item, plugType }
          : item
      );
    });
  };

  const updateWarranty = (productId: number, variantId: string, warrantyId: string | null) => {
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === productId && item.variant.id === variantId) {
          if (warrantyId === null) {
            const { warranty, ...itemWithoutWarranty } = item;
            return itemWithoutWarranty;
          } else {
            const warrantyPolicy = item.warrantyPolicies?.find(p => p.id === warrantyId);

            if (warrantyPolicy) {
              return {
                ...item,
                warranty: {
                  policyId: warrantyId,
                  months: warrantyPolicy.months,
                  stripePriceId: warrantyPolicy.stripe_price_id,
                  additionalCost: warrantyPolicy.fixed_price || 0,
                  description: warrantyPolicy.description,
                  terms: warrantyPolicy.terms
                }
              };
            }
            return item;
          }
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ 
      items,
      setItems,
      addToCart, 
      removeFromCart, 
      updateQuantity,
      updateWarranty,
      updateAdapter,
      updatePlugType,
      clearCart,
      getTotalItems,
      getTotalPrice,
      hasItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}