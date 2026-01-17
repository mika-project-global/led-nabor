import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotifications } from './useNotifications';

interface WishlistItem {
  id: string;
  product_id: number;
  created_at: string;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.some(item => item.product_id === productId);
  };

  const addToWishlist = async (productId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        addNotification('Please sign in to add items to wishlist', 'error');
        return false;
      }

      if (isInWishlist(productId)) {
        addNotification('Item already in wishlist', 'info');
        return false;
      }

      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;

      await loadWishlist();
      addNotification('Added to wishlist', 'success');
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      addNotification('Failed to add to wishlist', 'error');
      return false;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await loadWishlist();
      addNotification('Removed from wishlist', 'success');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      addNotification('Failed to remove from wishlist', 'error');
      return false;
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  return {
    wishlist,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refresh: loadWishlist
  };
}
