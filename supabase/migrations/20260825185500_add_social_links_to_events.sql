ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tiktok_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS whatsapp_url text;
