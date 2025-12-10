export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  description?: string;
  created_by?: string;
  created_at: string;
}

export interface Image {
  id: string;
  title: string;
  imgbb_url: string;
  imgbb_delete_url: string;
  prompt: string;
  user_id: string;
  category_id?: string;
  category?: Category;
  user?: User;
  view_count: number;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  image_id: string;
  image?: Image;
  created_at: string;
}

export interface CreateImageRequest {
  title: string;
  prompt: string;
  category_id?: string;
  visibility: 'public' | 'private';
  image_file: File;
}

export interface UpdateImageRequest {
  title?: string;
  prompt?: string;
  category_id?: string;
  visibility?: 'public' | 'private';
}

export interface ImageFilters {
  category?: string;
  search?: string;
  visibility?: 'public' | 'private' | 'all';
  page?: number;
  limit?: number;
  userId?: string;
}
