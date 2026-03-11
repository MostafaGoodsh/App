
-- Add accepts_msra flag to market_locations
ALTER TABLE public.market_locations 
ADD COLUMN IF NOT EXISTS accepts_msra BOOLEAN NOT NULL DEFAULT false;

-- Add cooperation_note for business to describe their acceptance terms
ALTER TABLE public.market_locations 
ADD COLUMN IF NOT EXISTS cooperation_note TEXT;
