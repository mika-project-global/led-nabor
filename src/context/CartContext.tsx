import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateWarranty: (productId: number, warrantyId: string | null) => void;
  updateAdapter: (productId: number, adapter: boolean) => void;
  updatePlugType: (productId: number, plugType: 'EU' | 'UK') => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  hasItem: (productId: number) => boolean;
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

  const hasItem = (productId: number) => {
    return items.some(item => item.id === productId);
  };

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems(currentItems => {
      if (quantity === 0) {
        return currentItems.filter(item => item.id !== productId);
      }
      
      return currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const updateAdapter = (productId: number, adapter: boolean) => {
    setItems(currentItems => {
      return currentItems.map(item =>
        item.id === productId ? { ...item, adapter } : item
      );
    });
  };

  const updatePlugType = (productId: number, plugType: 'EU' | 'UK') => {
    setItems(currentItems => {
      return currentItems.map(item =>
        item.id === productId ? { ...item, plugType } : item
      );
    });
  };

  const updateWarranty = (productId: number, warrantyId: string | null) => {
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === productId) {
          if (warrantyId === null) {
            // Remove warranty
            const { warranty, ...itemWithoutWarranty } = item;
            return itemWithoutWarranty;
          } else {
            // Get the warranty policy details from the item's warrantyPolicies array
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