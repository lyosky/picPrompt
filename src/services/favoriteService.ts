import { supabase } from '../lib/supabase';
import type { Favorite } from '../../shared/types';

export async function addFavorite(imageId: string, _userId: string): Promise<Favorite> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('User not authenticated');
  const u = auth.user;
  const username = (u.user_metadata as any)?.username ?? (u.email?.split('@')[0] ?? 'user');
  await supabase
    .from('users')
    .upsert(
      { id: u.id, email: u.email ?? '', username, role: 'user' },
      { onConflict: 'id' }
    );

  const { data, error } = await supabase
    .from('favorites')
    .insert({ image_id: imageId, user_id: u.id })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeFavorite(imageId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('image_id', imageId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function isFavorited(imageId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('image_id', imageId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return !!data;
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      image:images(*, user:users(id, username, avatar_url), category:categories(id, name))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
