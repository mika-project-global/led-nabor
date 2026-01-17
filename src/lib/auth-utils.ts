import { supabase } from './supabase';

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking admin status:', profileError);
      return false;
    }

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
}

export async function getUserRole(): Promise<'admin' | 'user' | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error getting user role:', profileError);
      return null;
    }

    return (profile?.role as 'admin' | 'user') || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}
