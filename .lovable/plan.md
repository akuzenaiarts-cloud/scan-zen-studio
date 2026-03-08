

## Root Cause

The error **"function public.update_updated_at_column() does not exist"** indicates that:
1. A trigger on one of your tables (likely `site_settings` or `manga`) is trying to call `update_updated_at_column()` on UPDATE operations
2. The function exists in the project schema definition but wasn't actually deployed to the database

## Fix

Run a migration to create (or recreate) the missing function:

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

After this migration runs, any triggers referencing this function will work correctly, and the internal error should be resolved.

