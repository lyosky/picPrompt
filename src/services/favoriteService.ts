import { supabase } from '../lib/supabase';
import type { Favorite } from '../../shared/types';

export async function addFavorite(imageId: string, userId: string): Promise<Favorite> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ image_id: imageId, user_id: userId })
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