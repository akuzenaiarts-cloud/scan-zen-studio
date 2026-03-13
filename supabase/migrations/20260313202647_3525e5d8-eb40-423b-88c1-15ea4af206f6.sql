
-- Fix search path on set_free_release_at
CREATE OR REPLACE FUNCTION public.set_free_release_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.auto_free_days IS NOT NULL AND NEW.premium = true THEN
    NEW.free_release_at := NEW.created_at + (NEW.auto_free_days || ' days')::interval;
  ELSE
    NEW.free_release_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;
