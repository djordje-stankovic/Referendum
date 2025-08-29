-- Simple ALTER TABLE commands to add missing fields
-- Run these in Supabase SQL Editor one by one

-- 1. Add bio field
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Add avatar field  
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);

-- 3. Add updated_at field if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('bio', 'avatar', 'updated_at')
ORDER BY column_name;
