-- Relax users table to work with Supabase Auth profiles
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- RLS policies for users table
DROP POLICY IF EXISTS "Users selectable by everyone" ON users;
DROP POLICY IF EXISTS "Insert own user row" ON users;
DROP POLICY IF EXISTS "Update own user row" ON users;
DROP POLICY IF EXISTS "Delete own user row" ON users;

CREATE POLICY "Users selectable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Insert own user row" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Update own user row" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Delete own user row" ON users
  FOR DELETE USING (auth.uid() = id);
