-- Add visibility field to images table
ALTER TABLE images ADD COLUMN visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private'));

-- Update existing rows to have public visibility
UPDATE images SET visibility = 'public' WHERE visibility IS NULL;

-- Make visibility field not nullable
ALTER TABLE images ALTER COLUMN visibility SET NOT NULL;

-- Create index for visibility filtering
CREATE INDEX idx_images_visibility ON images(visibility);
CREATE INDEX idx_images_visibility_created_at ON images(visibility, created_at DESC);

-- Update RLS policies to respect visibility
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON images;

-- New policy: Public images are viewable by everyone, private images only by owner
CREATE POLICY "Images visibility policy" ON images
    FOR SELECT USING (
        visibility = 'public' 
        OR (visibility = 'private' AND auth.uid() = user_id)
    );

-- Keep existing policies for insert, update, delete
-- Users can insert their own images
CREATE POLICY "Users can insert their own images" ON images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own images  
CREATE POLICY "Users can update their own images" ON images
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete their own images" ON images
    FOR DELETE USING (auth.uid() = user_id);