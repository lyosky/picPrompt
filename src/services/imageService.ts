import { supabase } from '../lib/supabase';
import type { Image, CreateImageRequest, ImageFilters } from '../../shared/types';

export async function getImages(filters: ImageFilters = {}): Promise<Image[]> {
  let query = supabase
    .from('images')
    .select(`
      *,
      user:users(id, username, avatar_url),
      category:categories(id, name)
    `)
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,prompt.ilike.%${filters.search}%`);
  }

  if (filters.visibility && filters.visibility !== 'all') {
    query = query.eq('visibility', filters.visibility);
  }

  const { data, error } = await query;
  
  if (error) {
    throw error;
  }

  return data || [];
}

export async function getImage(id: string): Promise<Image> {
  const { data, error } = await supabase
    .from('images')
    .select(`
      *,
      user:users(id, username, avatar_url),
      category:categories(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createImage(request: CreateImageRequest): Promise<Image> {
  // First upload image to ImgBB
  const formData = new FormData();
  formData.append('image', request.image_file);
  
  const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!imgbbResponse.ok) {
    throw new Error('Failed to upload image to ImgBB');
  }

  const imgbbData = await imgbbResponse.json();
  
  if (!imgbbData.success) {
    throw new Error('ImgBB upload failed');
  }

  // Then create image record in database
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('images')
    .insert({
      title: request.title,
      prompt: request.prompt,
      category_id: request.category_id,
      visibility: request.visibility,
      imgbb_url: imgbbData.data.url,
      imgbb_delete_url: imgbbData.data.delete_url,
      user_id: userData.user.id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateImage(id: string, updates: Partial<Image>): Promise<Image> {
  const { data, error } = await supabase
    .from('images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteImage(id: string): Promise<void> {
  // First get the image to get the delete URL
  const { data: image } = await supabase
    .from('images')
    .select('imgbb_delete_url')
    .eq('id', id)
    .single();

  if (image?.imgbb_delete_url) {
    // Delete from ImgBB
    try {
      await fetch(image.imgbb_delete_url);
    } catch (error) {
      console.error('Failed to delete from ImgBB:', error);
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase
    .from('images')
    .update({ view_count: supabase.rpc('increment_view_count', { image_id: id }) })
    .eq('id', id);

  if (error) {
    console.error('Failed to increment view count:', error);
  }
}