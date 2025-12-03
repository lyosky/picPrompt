import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../../shared/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const toAppUser = (u: SupabaseUser): User => {
    const username = (u.user_metadata as any)?.username ?? (u.email?.split('@')[0] ?? 'user');
    return {
      id: u.id,
      email: u.email ?? '',
      username,
      role: 'user',
      avatar_url: (u.user_metadata as any)?.avatar_url,
      created_at: u.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toAppUser(session.user) : null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAppUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
