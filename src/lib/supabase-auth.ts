import { supabase } from './supabase';
import { getURL } from './utils';

const handleAuthError = (error: any) => {
  console.error('Auth error:', error);
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
  console.log('Starting Facebook sign in...');
  const redirectTo = `${getURL()}/auth/v1/callback`;
  console.log('Redirect URL:', redirectTo);

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
    console.log('Facebook sign in response:', { data });
    return { data, error: null };
  } catch (error) {
    handleAuthError(error);
    return { data: null, error };
  }
}

export async function signInWithApple() {
  console.log('Starting Apple sign in...');
  const baseUrl = getURL();
  const redirectTo = `${baseUrl}/auth/v1/callback?provider=apple`;
  
  if (!redirectTo.startsWith('http')) {
    throw new Error('Invalid redirect URL');
  }
  console.log('Apple Sign In - Redirect URL:', redirectTo);

  try {
    // Generate state and nonce
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    
    // Store state in localStorage for verification
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
      console.error('Apple Sign In Error:', error);
      return { data: null, error };
    }
    
    console.log('Apple Sign In - Success:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Apple Sign In - Caught Error:', error);
    handleAuthError(error);
    return { data: null, error: error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('getCurrentUser response:', { user, error });
    
    if (error) {
      // If the error is due to missing auth session, return null without error
      if (error.message.includes('Auth session missing')) {
        console.log('No auth session found');
        return { user: null, error: null };
      }
      console.error('getCurrentUser error:', error);
      return { user: null, error };
    }

    if (!user) {
      console.log('No user found');
      return { user: null, error: null };
    }

    // Get user profile
    try {
      console.log('Fetching user profile for ID:', user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('User profile:', profile);
      return { user: { ...user, profile }, error: null };
    } catch (profileError) {
      console.warn('Profile fetch failed:', profileError);
      return { user, error: null }; // Return user without profile
    }
  } catch (error) {
    console.error('getCurrentUser caught error:', error);
    return { user: null, error: null }; // Return null without error for any other errors
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
  console.log('Starting Google sign in...');
  const redirectTo = `${getURL()}/auth/v1/callback`;
  console.log('Redirect URL:', redirectTo);

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
  console.log('Google sign in response:', { data, error });
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
    console.error('Reset password error:', error);
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