
-- Create a public-safe view excluding phone numbers and admin notes
CREATE OR REPLACE VIEW public.market_locations_public AS
SELECT 
  id, user_id, name, name_en, description, bio,
  location_type, latitude, longitude, address,
  logo_url, cover_image_url, website, accepts_msra,
  cooperation_note, status, created_at, updated_at
FROM public.market_locations
WHERE status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.market_locations_public TO anon, authenticated;
