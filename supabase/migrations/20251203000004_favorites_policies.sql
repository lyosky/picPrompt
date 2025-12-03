-- RLS policies for favorites table
DROP POLICY IF EXISTS "Select own favorites" ON favorites;
DROP POLICY IF EXISTS "Insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Delete own favorites" ON favorites;

CREATE POLICY "Select own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);
