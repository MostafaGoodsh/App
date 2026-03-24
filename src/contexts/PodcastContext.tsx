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

export interface PlaylistTrack {
  id: string;
  episode_id: string;
  title: string;
  audio_url: string;
  duration_seconds: number | null;
  track_order: number;
}

interface PodcastContextValue {
  episodes: PodcastEpisode[];
  loading: boolean;
  currentEpisode: PodcastEpisode | null;
  currentTrack: PlaylistTrack | null;
  playlistTracks: PlaylistTrack[];
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
  playTrack: (track: PlaylistTrack) => void;
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
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { fetchEpisodes(); }, []);

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
        loadEpisode(bgEpisode);
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

  const fetchTracks = async (episodeId: string): Promise<PlaylistTrack[]> => {
    const { data } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('episode_id', episodeId)
      .order('track_order');
    return (data as PlaylistTrack[]) || [];
  };

  const playAudio = (url: string) => {
    if (!audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const loadEpisode = async (episode: PodcastEpisode) => {
    setCurrentEpisode(episode);
    const tracks = await fetchTracks(episode.id);
    setPlaylistTracks(tracks);
    
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      playAudio(tracks[0].audio_url);
    } else {
      setCurrentTrack(null);
      playAudio(episode.audio_url);
    }
  };

  const play = useCallback((episode?: PodcastEpisode) => {
    if (!audioRef.current) return;
    if (episode && episode.id !== currentEpisode?.id) {
      loadEpisode(episode);
      return;
    }
    const ep = currentEpisode;
    if (!ep) return;
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

  const playTrack = useCallback((track: PlaylistTrack) => {
    setCurrentTrack(track);
    playAudio(track.audio_url);
  }, []);

  const playNext = useCallback(() => {
    // If we have playlist tracks, navigate within them first
    if (playlistTracks.length > 0 && currentTrack) {
      const idx = playlistTracks.findIndex(t => t.id === currentTrack.id);
      if (idx < playlistTracks.length - 1) {
        const next = playlistTracks[idx + 1];
        setCurrentTrack(next);
        playAudio(next.audio_url);
        return;
      }
    }
    // Otherwise go to next episode
    if (!currentEpisode || episodes.length === 0) return;
    const idx = episodes.findIndex(e => e.id === currentEpisode.id);
    const next = episodes[(idx + 1) % episodes.length];
    if (next) loadEpisode(next);
  }, [currentEpisode, episodes, playlistTracks, currentTrack]);

  const playPrev = useCallback(() => {
    if (playlistTracks.length > 0 && currentTrack) {
      const idx = playlistTracks.findIndex(t => t.id === currentTrack.id);
      if (idx > 0) {
        const prev = playlistTracks[idx - 1];
        setCurrentTrack(prev);
        playAudio(prev.audio_url);
        return;
      }
    }
    if (!currentEpisode || episodes.length === 0) return;
    const idx = episodes.findIndex(e => e.id === currentEpisode.id);
    const prev = episodes[(idx - 1 + episodes.length) % episodes.length];
    if (prev) loadEpisode(prev);
  }, [currentEpisode, episodes, playlistTracks, currentTrack]);

  const playNextRef = useRef(playNext);
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);

  return (
    <PodcastContext.Provider value={{
      episodes, loading, currentEpisode, currentTrack, playlistTracks,
      isPlaying, isMuted, progress, duration,
      play, pause, togglePlay, toggleMute, seek, playNext, playPrev, playTrack,
      refetch: fetchEpisodes,
    }}>
      {children}
    </PodcastContext.Provider>
  );
};
