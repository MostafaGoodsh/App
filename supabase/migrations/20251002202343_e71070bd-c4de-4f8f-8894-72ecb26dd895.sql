-- Add image fields and admin notes to quran_pages table
ALTER TABLE public.quran_pages 
ADD COLUMN IF NOT EXISTS arabic_image_url TEXT,
ADD COLUMN IF NOT EXISTS translation_image_url TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create storage bucket for Quran page images if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quran-pages',
  'quran-pages',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for uploading Quran page images (admins only)
CREATE POLICY "Admins can upload Quran page images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quran-pages' AND
  is_admin(auth.uid())
);

-- Create storage policy for updating Quran page images (admins only)
CREATE POLICY "Admins can update Quran page images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'quran-pages' AND
  is_admin(auth.uid())
);

-- Create storage policy for deleting Quran page images (admins only)
CREATE POLICY "Admins can delete Quran page images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'quran-pages' AND
  is_admin(auth.uid())
);

-- Create storage policy for viewing Quran page images (public)
CREATE POLICY "Anyone can view Quran page images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'quran-pages');