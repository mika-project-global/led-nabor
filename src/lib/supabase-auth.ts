import { supabase } from './supabase';
import { getURL } from './utils';

const handleAuthError = (error: any) => {
  if (error.message && error.message.includes('refresh_token_not_found')) {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.expires_at');
    localStorage.removeItem('supabase.auth.provider');
    window.location.href = '/auth';
    return;
  }
  throw error;
};

export async function signInWithFacebook() {
  const redirectTo = `${getURL()}/auth/v1/callback`;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    handleAuthError(error);
    return { data: null, error };
  }
}

export async function signInWithApple() {
  const baseUrl = getURL();
  const redirectTo = `${baseUrl}/auth/v1/callback?provider=apple`;

  if (!redirectTo.startsWith('http')) {
    throw new Error('Invalid redirect URL');
  }

  try {
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    localStorage.setItem('apple_auth_state', state);
    localStorage.setItem('apple_auth_nonce', nonce);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
        scopes: ['name', 'email'],
        queryParams: {
          response_mode: 'fragment',
          response_type: 'code id_token',
          state,
          nonce,
          client_id: 'app.led-nabor.auth'
        }
      }
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleAuthError(error);
    return { data: null, error: error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      if (error.message.includes('Auth session missing')) {
        return { user: null, error: null };
      }
      return { user: null, error };
    }

    if (!user) {
      return { user: null, error: null };
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { user: { ...user, profile }, error: null };
    } catch (profileError) {
      return { user, error: null };
    }
  } catch (error) {
    return { user: null, error: null };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    handleAuthError(error);
    return { data: null, error };
  }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getURL()}/auth/v1/callback`
    }
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const redirectTo = `${getURL()}/auth/v1/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });
  return { data, error };
}

export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getURL()}/auth/reset-password`
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.expires_at');
    localStorage.removeItem('supabase.auth.provider');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    handleAuthError(error);
    return { error };
  }
}
