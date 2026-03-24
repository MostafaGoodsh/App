import { useState, useEffect, useRef, useCallback } from 'react';
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

export const usePodcast = () => {
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

  // Initialize audio element
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
        playNext();
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
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
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

  return {
    episodes,
    loading,
    currentEpisode,
    isPlaying,
    isMuted,
    progress,
    duration,
    play,
    pause,
    togglePlay,
    toggleMute,
    seek,
    playNext,
    playPrev,
    refetch: fetchEpisodes,
  };
};
