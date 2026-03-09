-- Add content_warnings and discord_webhook_url columns to manga table
ALTER TABLE public.manga 
ADD COLUMN IF NOT EXISTS content_warnings text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS discord_webhook_url text;