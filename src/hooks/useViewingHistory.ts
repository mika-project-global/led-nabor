import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ViewingHistoryItem {
  id: string;
  product_id: number;
  viewed_at: string;
}

const SESSION_KEY = 'viewing_session_id';

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useViewingHistory() {
  const [history, setHistory] = useState<ViewingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getOrCreateSessionId();

      let query = supabase
        .from('viewing_history')
        .select('*')
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId).is('user_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async (productId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getOrCreateSessionId();

      let existingQuery = supabase
        .from('viewing_history')
        .select('id, viewed_at')
        .eq('product_id', productId);

      if (user) {
        existingQuery = existingQuery.eq('user_id', user.id);
      } else {
        existingQuery = existingQuery.eq('session_id', sessionId).is('user_id', null);
      }

      const { data: existing } = await existingQuery.limit(1);

      if (existing && existing.length > 0) {
        const lastViewedAt = new Date(existing[0].viewed_at);
        const now = new Date();
        const hoursSinceLastView = (now.getTime() - lastViewedAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastView < 1) {
          return;
        }

        await supabase
          .from('viewing_history')
          .delete()
          .eq('id', existing[0].id);
      }

      const insertData: any = {
        product_id: productId,
        session_id: sessionId
      };

      if (user) {
        insertData.user_id = user.id;
      }

      const { error } = await supabase
        .from('viewing_history')
        .insert(insertData);

      if (error) throw error;

      await loadHistory();
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getOrCreateSessionId();

      let query = supabase.from('viewing_history').delete();

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId).is('user_id', null);
      }

      const { error } = await query;

      if (error) throw error;

      await loadHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getRecentlyViewed = (limit: number = 5): ViewingHistoryItem[] => {
    return history.slice(0, limit);
  };

  return {
    history,
    loading,
    addToHistory,
    clearHistory,
    getRecentlyViewed,
    refresh: loadHistory
  };
}
