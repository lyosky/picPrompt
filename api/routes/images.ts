import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase';
import type { ImageFilters } from '../../shared/types';

const router = Router();

/**
 * Get images with filtering
 * GET /api/images
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: ImageFilters = {
      category: req.query.category as string,
      search: req.query.search as string,
      visibility: req.query.visibility as 'public' | 'private' | 'all',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    let query = supabase
      .from('images')
      .select(`
        *,
        user:users(id, username, avatar_url),
        category:categories(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply visibility filter
    if (filters.visibility && filters.visibility !== 'all') {
      query = query.eq('visibility', filters.visibility);
    }

    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,prompt.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({
      images: data || [],
      total: count || 0,
      page: filters.page,
      limit: filters.limit,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get single image
 * GET /api/images/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select(`
        *,
        user:users(id, username, avatar_url),
        category:categories(id, name)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    res.json({ image: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create new image
 * POST /api/images
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, prompt, category_id, visibility, imgbb_url, imgbb_delete_url } = req.body;

    if (!title || !prompt || !imgbb_url || !imgbb_delete_url) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const { data, error } = await supabase
      .from('images')
      .insert({
        title,
        prompt,
        category_id,
        visibility: visibility || 'public',
        imgbb_url,
        imgbb_delete_url,
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ image: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update image
 * PUT /api/images/:id
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, prompt, category_id, visibility } = req.body;

    const { data, error } = await supabase
      .from('images')
      .update({
        title,
        prompt,
        category_id,
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ image: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete image
 * DELETE /api/images/:id
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Increment view count
 * POST /api/images/:id/view
 */
router.post('/:id/view', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase
      .from('images')
      .update({ view_count: supabase.rpc('increment_view_count', { image_id: req.params.id }) })
      .eq('id', req.params.id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'View count incremented' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;