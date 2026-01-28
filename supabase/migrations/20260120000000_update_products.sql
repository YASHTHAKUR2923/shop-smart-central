ALTER TABLE products ADD COLUMN IF NOT EXISTS model_no TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;
-- Ensure price is numeric if not already (it is, but good to be safe or just skip)
-- ALTER TABLE products ALTER COLUMN price TYPE numeric;
