-- Fix search_path for update_live_streams_updated_at function
-- First drop the trigger
DROP TRIGGER IF EXISTS update_live_streams_updated_at_trigger ON public.live_streams;

-- Then drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS update_live_streams_updated_at();

CREATE OR REPLACE FUNCTION update_live_streams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_live_streams_updated_at_trigger
BEFORE UPDATE ON public.live_streams
FOR EACH ROW
EXECUTE FUNCTION update_live_streams_updated_at();