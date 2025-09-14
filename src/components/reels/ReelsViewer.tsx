import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, MessageCircle, Share, Volume2, VolumeX, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReelsContent {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  video_url: string;
  thumbnail_url: string;
  view_count: number;
}

export const ReelsViewer = () => {
  const [reelsContent, setReelsContent] = useState<ReelsContent[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReelsContent();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart(touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      
      const touch = e.changedTouches[0];
      const diff = touchStart - touch.clientY;
      
      if (Math.abs(diff) > 50) { // minimum swipe distance
        if (diff > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
      setTouchStart(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentVideoIndex, reelsContent.length, touchStart]);

  const fetchReelsContent = async () => {
    try {
      const { data, error } = await supabase
        .from('reels_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setReelsContent(data || []);
    } catch (error) {
      console.error('Error fetching reels content:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    if (currentVideoIndex < reelsContent.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      incrementViewCount(reelsContent[currentVideoIndex + 1]);
    }
  };

  const goToPrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const incrementViewCount = async (reel: ReelsContent) => {
    try {
      await supabase
        .from('reels_content')
        .update({ view_count: reel.view_count + 1 })
        .eq('id', reel.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleVideoClick = () => {
    togglePlayPause();
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reelsContent.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">لا توجد فيديوهات متاحة</p>
      </div>
    );
  }

  const currentReel = reelsContent[currentVideoIndex];

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-black overflow-hidden relative"
    >
      {/* Video Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={currentReel.video_url}
          className="h-full w-full object-cover"
          onClick={handleVideoClick}
          onLoadedData={handleVideoLoad}
          onEnded={goToNext}
          autoPlay
          muted={isMuted}
          playsInline
          loop={false}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 flex">
          {/* Left side - tap to go back */}
          <div 
            className="flex-1 flex items-center justify-start pl-4 cursor-pointer"
            onClick={goToPrevious}
            style={{ background: 'transparent' }}
          >
            {currentVideoIndex > 0 && (
              <ArrowUp className="w-8 h-8 text-white/60 opacity-0 hover:opacity-100 transition-opacity" />
            )}
          </div>

          {/* Center - play/pause */}
          <div 
            className="flex-1 flex items-center justify-center cursor-pointer"
            onClick={togglePlayPause}
          >
            {!isPlaying && (
              <Play className="w-16 h-16 text-white/80 fill-white/80" />
            )}
          </div>

          {/* Right side - tap to go forward */}
          <div 
            className="flex-1 flex items-center justify-end pr-4 cursor-pointer"
            onClick={goToNext}
            style={{ background: 'transparent' }}
          >
            {currentVideoIndex < reelsContent.length - 1 && (
              <ArrowDown className="w-8 h-8 text-white/60 opacity-0 hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </div>

      {/* Side Controls */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40"
        >
          <Heart className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40"
        >
          <Share className="w-6 h-6" />
        </Button>
      </div>

      {/* Video Info */}
      <div className="absolute bottom-4 left-4 right-20 text-white">
        <h3 className="font-bold text-lg mb-2 font-cairo">
          {currentReel.title}
        </h3>
        <p className="text-sm opacity-80 font-cairo leading-relaxed">
          {currentReel.description}
        </p>
        <div className="mt-2 text-xs opacity-60">
          {currentReel.view_count} مشاهدة
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4">
        <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full">
          {currentVideoIndex + 1} / {reelsContent.length}
        </div>
      </div>

      {/* Navigation Hints */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/40 text-xs">
        {currentVideoIndex > 0 && "انقر للسابق"}
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white/40 text-xs">
        {currentVideoIndex < reelsContent.length - 1 && "انقر للتالي"}
      </div>
    </div>
  );
};