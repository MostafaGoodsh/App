import React, { useState, useEffect } from 'react';
import { Play, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { VideoModal } from './VideoModal';
import egyptianCatBg from '@/assets/egyptian-cat-bg.jpg';

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

interface ReelsCardContent {
  id: string;
  title: string;
  description: string;
  background_image_url: string;
  is_active: boolean;
}

export const ReelsCard = ({ onClick }: { onClick?: () => void }) => {
  const [reelsContent, setReelsContent] = useState<ReelsContent[]>([]);
  const [cardContent, setCardContent] = useState<ReelsCardContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ReelsContent | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch reels content
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(3);

      if (reelsError) throw reelsError;
      setReelsContent(reelsData || []);

      // Fetch card content
      const { data: cardData, error: cardError } = await supabase
        .from('reels_card_content')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (cardError) throw cardError;
      setCardContent(cardData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = async (reel: ReelsContent, e: React.MouseEvent) => {
    e.stopPropagation();
    // Increment view count
    try {
      await supabase
        .from('reels_content')
        .update({ view_count: reel.view_count + 1 })
        .eq('id', reel.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }

    // Open video in modal
    setSelectedVideo(reel);
    setVideoModalOpen(true);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to full reels viewer
      window.location.href = '/reels';
    }
  };

  return (
    <article 
      className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm"
      onClick={handleCardClick}
    >
      {/* Background Image */}
      <img 
        src={cardContent?.background_image_url || egyptianCatBg}
        alt="خلفية الفيديوهات القصيرة"
        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
        loading="lazy" 
      />
      
      {/* Content */}
      <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
        <h2 className="font-cairo text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-300 font-bold flex items-center gap-3">
          <Video className="w-6 h-6 text-primary" />
          {cardContent?.title || 'الفيديوهات القصيرة'}
        </h2>
        
        <p className="font-cairo text-sm md:text-base text-muted-foreground/90 leading-relaxed mb-4">
          {cardContent?.description || 'شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة حول منصة مصر والعملات الرقمية'}
        </p>
        
        {/* Video thumbnails */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {loading ? (
            // Loading state
            [1, 2, 3].map((i) => (
              <div key={i} className="relative bg-muted/20 rounded-lg aspect-video animate-pulse" />
            ))
          ) : reelsContent.length > 0 ? (
            // Actual content
            reelsContent.map((reel) => (
              <div 
                key={reel.id} 
                className="relative bg-muted/20 rounded-lg aspect-video flex items-center justify-center border border-border/30 group-hover:border-primary/30 transition-colors duration-300 cursor-pointer"
                onClick={(e) => handleVideoClick(reel, e)}
                title={reel.title}
              >
                {reel.thumbnail_url ? (
                  <img 
                    src={reel.thumbnail_url} 
                    alt={reel.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="absolute inset-0 bg-black/10 rounded-lg" />
                )}
                <Play className="w-4 h-4 text-primary relative z-10" />
              </div>
            ))
          ) : (
            // Empty state
            [1, 2, 3].map((i) => (
              <div key={i} className="relative bg-muted/20 rounded-lg aspect-video flex items-center justify-center border border-border/30">
                <Play className="w-4 h-4 text-muted-foreground" />
              </div>
            ))
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{reelsContent.length} فيديو متاح</span>
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            شاهد الآن
          </span>
        </div>
        <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
      </div>
      
      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          videoUrl={selectedVideo.video_url}
          title={selectedVideo.title}
          description={selectedVideo.description}
        />
      )}
    </article>
  );
};