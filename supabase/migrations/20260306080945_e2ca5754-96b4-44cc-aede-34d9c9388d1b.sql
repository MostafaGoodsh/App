
-- Create market_locations table
CREATE TABLE public.market_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  location_type TEXT NOT NULL DEFAULT 'store',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_locations ENABLE ROW LEVEL SECURITY;

-- Everyone can see approved locations
CREATE POLICY "Anyone can view approved locations"
ON public.market_locations FOR SELECT
USING (status = 'approved');

-- Admins can see all locations
CREATE POLICY "Admins can view all locations"
ON public.market_locations FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Authenticated users can submit locations
CREATE POLICY "Authenticated users can insert locations"
ON public.market_locations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can update any location
CREATE POLICY "Admins can update locations"
ON public.market_locations FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can delete locations
CREATE POLICY "Admins can delete locations"
ON public.market_locations FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Add index for geolocation queries
CREATE INDEX idx_market_locations_coords ON public.market_locations (latitude, longitude);
CREATE INDEX idx_market_locations_status ON public.market_locations (status);
