import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ViewingHistoryItem {
  id: string;
  product_id: number;
  viewed_at: string;
}

const SESSION_KEY = 'viewing_session_id';
const CLEANUP_KEY = 'viewing_history_last_cleanup';

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function shouldRunCleanup(): boolean {
  const lastCleanup = localStorage.getItem(CLEANUP_KEY);
  if (!lastCleanup) return true;
  const daysSinceCleanup = (Date.now() - parseInt(lastCleanup)) / (1000 * 60 * 60 * 24);
  return daysSinceCleanup > 1;
}

async function runPeriodicCleanup() {
  if (!shouldRunCleanup()) return;
  try {
    await supabase.rpc('cleanup_viewing_history');
    localStorage.setItem(CLEANUP_KEY, Date.now().toString());
  } catch {
  }
}

export function useViewingHistory() {
  const [history, setHistory] = useState<ViewingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    runPeriodicCleanup();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getOrCreateSessionId();

      let query = supabase
        .from('viewing_history')
        .select('id, product_id, viewed_at')
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
    } catch {
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
        const hoursSinceLastView = (Date.now() - new Date(existing[0].viewed_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastView < 1) return;
        await supabase.from('viewing_history').delete().eq('id', existing[0].id);
      }

      const insertData: Record<string, unknown> = {
        product_id: productId,
        session_id: sessionId
      };

      if (user) {
        insertData.user_id = user.id;
      }

      const { error } = await supabase.from('viewing_history').insert(insertData);
      if (error) throw error;

      await loadHistory();
    } catch {
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
    } catch {
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
