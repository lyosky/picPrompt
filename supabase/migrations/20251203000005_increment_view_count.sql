-- Create RPC function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(image_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.images
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = image_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated;
