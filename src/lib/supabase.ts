import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables using constants defined in vite.config.ts
const supabaseUrl = __SUPABASE_URL__ || '';
const supabaseAnonKey = __SUPABASE_ANON_KEY__ || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Required environment variables are missing. Please check your .env file.');
}

// Add cache control headers to prevent caching
const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
      debug: import.meta.env.DEV
    },
    global: {
      headers
    }
  }
);