import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import egyptianCatBg from '@/assets/egyptian-cat-bg.jpg';

interface ReelsContent {
  id: string;
  title: string;
  title_en: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  view_count: number;
}

export const ReelsCard = () => {
  const [reelsContent, setReelsContent] = useState<ReelsContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReelsContent();
  }, []);

  const fetchReelsContent = async () => {
    try {
      const { data, error } = await supabase
        .from('reels_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(3);

      if (error) throw error;
      setReelsContent(data || []);
    } catch (error) {
      console.error('Error fetching reels content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = async (reel: ReelsContent) => {
    // Increment view count
    try {
      await supabase
        .from('reels_content')
        .update({ view_count: reel.view_count + 1 })
        .eq('id', reel.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }

    // Open video (could be modal or external link)
    if (reel.video_url.startsWith('http')) {
      window.open(reel.video_url, '_blank');
    }
  };

  return (
    <Card className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-300"
        style={{ backgroundImage: `url(${egyptianCatBg})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      
      {/* Content */}
      <div className="relative p-6 min-h-[200px] flex flex-col justify-end">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="flex items-center gap-3 text-2xl group-hover:text-primary transition-colors duration-300">
            <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
              <Video className="w-6 h-6 text-primary" />
            </div>
            الفيديوهات القصيرة
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <p className="text-muted-foreground mb-4 leading-relaxed">
            شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة حول منصة مصر والعملات الرقمية
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
                  onClick={() => handleVideoClick(reel)}
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
        </CardContent>
      </div>
    </Card>
  );
};