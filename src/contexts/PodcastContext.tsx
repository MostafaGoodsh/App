import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PodcastEpisode {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  audio_url: string;
  thumbnail_url: string | null;
  episode_type: string;
  duration_seconds: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_background_audio: boolean;
  display_order: number;
  created_at: string;
}

interface PodcastContextValue {
  episodes: PodcastEpisode[];
  loading: boolean;
  currentEpisode: PodcastEpisode | null;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  duration: number;
  play: (episode?: PodcastEpisode) => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  playNext: () => void;
  playPrev: () => void;
  refetch: () => void;
}

const PodcastContext = createContext<PodcastContextValue | null>(null);

export const usePodcastContext = () => {
  const ctx = useContext(PodcastContext);
  if (!ctx) throw new Error('usePodcastContext must be used within PodcastProvider');
  return ctx;
};

export const PodcastProvider = ({ children }: { children: ReactNode }) => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
        }
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        // auto-play next
        setTimeout(() => playNextRef.current?.(), 100);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-play background audio
  useEffect(() => {
    if (episodes.length > 0 && !currentEpisode) {
      const bgEpisode = episodes.find(e => e.is_background_audio);
      if (bgEpisode) {
        setCurrentEpisode(bgEpisode);
        if (audioRef.current) {
          audioRef.current.src = bgEpisode.audio_url;
          audioRef.current.load();
          // Try to auto-play (may be blocked by browser)
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    }
  }, [episodes]);

  const fetchEpisodes = async () => {
    const { data } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    setEpisodes((data as PodcastEpisode[]) || []);
    setLoading(false);
  };

  const play = useCallback((episode?: PodcastEpisode) => {
    if (!audioRef.current) return;
    const ep = episode || currentEpisode;
    if (!ep) return;
    if (episode && episode.id !== currentEpisode?.id) {
      setCurrentEpisode(episode);
      audioRef.current.src = episode.audio_url;
      audioRef.current.load();
    }
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);
  }, [currentEpisode]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause(); else play();
  }, [isPlaying, play, pause]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const playNext = useCallback(() => {
    if (!currentEpisode || episodes.length === 0) return;
    const idx = episodes.findIndex(e => e.id === currentEpisode.id);
    const next = episodes[(idx + 1) % episodes.length];
    if (next) play(next);
  }, [currentEpisode, episodes, play]);

  const playPrev = useCallback(() => {
    if (!currentEpisode || episodes.length === 0) return;
    const idx = episodes.findIndex(e => e.id === currentEpisode.id);
    const prev = episodes[(idx - 1 + episodes.length) % episodes.length];
    if (prev) play(prev);
  }, [currentEpisode, episodes, play]);

  // Ref to allow ended callback to call playNext
  const playNextRef = useRef(playNext);
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);

  return (
    <PodcastContext.Provider value={{
      episodes, loading, currentEpisode, isPlaying, isMuted, progress, duration,
      play, pause, togglePlay, toggleMute, seek, playNext, playPrev, refetch: fetchEpisodes,
    }}>
      {children}
    </PodcastContext.Provider>
  );
};
