
ALTER TABLE public.wheel_segments ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.wheel_outer_segments ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.wheel_upgrade_segments ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.wheel_settings 
  ADD COLUMN IF NOT EXISTS note_text text,
  ADD COLUMN IF NOT EXISTS note_text_en text,
  ADD COLUMN IF NOT EXISTS inner_ring_bg_image text,
  ADD COLUMN IF NOT EXISTS middle_ring_bg_image text,
  ADD COLUMN IF NOT EXISTS outer_ring_bg_image text;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('wheel-images', 'wheel-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read wheel images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'wheel-images');

CREATE POLICY "Auth upload wheel images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'wheel-images');

CREATE POLICY "Auth delete wheel images" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'wheel-images');
