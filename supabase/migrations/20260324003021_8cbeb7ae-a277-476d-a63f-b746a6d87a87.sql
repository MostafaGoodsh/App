CREATE TABLE public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  description text,
  description_en text,
  audio_url text NOT NULL,
  thumbnail_url text,
  episode_type text NOT NULL DEFAULT 'podcast',
  duration_seconds integer,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_background_audio boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active episodes" ON public.podcast_episodes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage episodes" ON public.podcast_episodes
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('podcast-audio', 'podcast-audio', true, 52428800);

CREATE POLICY "Anyone can view podcast audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'podcast-audio');

CREATE POLICY "Admins can upload podcast audio" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'podcast-audio' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete podcast audio" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'podcast-audio' AND public.is_admin(auth.uid()));