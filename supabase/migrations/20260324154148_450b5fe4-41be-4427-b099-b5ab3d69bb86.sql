
CREATE TABLE public.playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES public.podcast_episodes(id) ON DELETE CASCADE,
  title text NOT NULL,
  audio_url text NOT NULL,
  duration_seconds integer,
  track_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_playlist_tracks_episode ON public.playlist_tracks(episode_id, track_order);

ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read playlist tracks"
  ON public.playlist_tracks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage playlist tracks"
  ON public.playlist_tracks FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
