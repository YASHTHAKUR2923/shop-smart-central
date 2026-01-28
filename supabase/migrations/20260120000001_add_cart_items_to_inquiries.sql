-- Add cart_items column to inquiries table
ALTER TABLE inquiries ADD COLUMN cart_items JSONB;
