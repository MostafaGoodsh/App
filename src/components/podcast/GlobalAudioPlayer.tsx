import { usePodcastContext } from '@/contexts/PodcastContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, ListMusic, Minimize2, Maximize2, Music } from 'lucide-react';
import { useState } from 'react';

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

type PlayerMode = 'full' | 'mini' | 'bubble';

const GlobalAudioPlayer = () => {
  const {
    currentEpisode, currentTrack, playlistTracks,
    isPlaying, isMuted, progress, duration,
    togglePlay, toggleMute, playNext, playPrev, seek, playTrack,
  } = usePodcastContext();

  const [dismissed, setDismissed] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [mode, setMode] = useState<PlayerMode>('full');

  if (!currentEpisode || dismissed) return null;

  const displayTitle = currentTrack ? currentTrack.title : currentEpisode.title;
  const progressPct = duration ? (progress / duration) * 100 : 0;

  // Floating bubble mode
  if (mode === 'bubble') {
    return (
      <div className="fixed bottom-20 right-4 z-50 animate-[fadeIn_0.3s_ease-out]">
        <button
          onClick={togglePlay}
          onDoubleClick={() => setMode('full')}
          className="relative w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform duration-200 animate-[glow_2s_ease-in-out_infinite]"
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
            <circle
              cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          {isPlaying ? <Pause className="h-5 w-5 relative z-10" /> : <Play className="h-5 w-5 relative z-10 ml-0.5" />}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => setMode('full')}
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Mini bar mode
  if (mode === 'mini') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-lg animate-[fadeIn_0.2s_ease-out]">
        <div className="w-full h-0.5 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Music className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-xs truncate flex-1">{displayTitle}</p>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMode('full')}>
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMode('bubble')}>
            <span className="text-xs">●</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Full bar mode
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl animate-[fadeIn_0.2s_ease-out]">
      {/* Playlist panel */}
      {showPlaylist && playlistTracks.length > 0 && (
        <div className="max-w-screen-lg mx-auto px-3 pb-1 max-h-48 overflow-y-auto border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground py-1.5">قائمة التشغيل</p>
          {playlistTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              className={`w-full text-right px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors flex items-center gap-2 ${
                currentTrack?.id === track.id ? 'bg-primary/10 text-primary font-medium' : ''
              }`}
            >
              <span className="text-muted-foreground w-4 text-center">{track.track_order + 1}</span>
              <span className="truncate flex-1">{track.title}</span>
              {currentTrack?.id === track.id && isPlaying && (
                <span className="text-primary">♪</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-screen-lg mx-auto px-3 py-2">
        <div 
          className="w-full h-1 bg-muted rounded-full mb-2 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seek(pct * duration);
          }}
        >
          <div 
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          {currentEpisode.thumbnail_url && (
            <img src={currentEpisode.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{displayTitle}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatTime(progress)} / {formatTime(duration)}
              {playlistTracks.length > 0 && currentTrack && (
                <span> • {playlistTracks.findIndex(t => t.id === currentTrack.id) + 1}/{playlistTracks.length}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {playlistTracks.length > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPlaylist(!showPlaylist)}>
                <ListMusic className={`h-3.5 w-3.5 ${showPlaylist ? 'text-primary' : ''}`} />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playPrev}>
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playNext}>
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMode('mini')}>
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMode('bubble')}>
              <span className="text-[10px]">●</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDismissed(true)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;
