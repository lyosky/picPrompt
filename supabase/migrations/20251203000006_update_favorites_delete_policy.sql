-- Update favorites delete policy to allow cascade by image owner
DROP POLICY IF EXISTS "Delete own favorites" ON favorites;

CREATE POLICY "Delete own favorites or by image owner" ON favorites
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.images i
      WHERE i.id = favorites.image_id AND auth.uid() = i.user_id
    )
  );
