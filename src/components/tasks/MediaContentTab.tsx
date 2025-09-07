import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Coins, Play, FileText, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import MediaModal from "./MediaModal";

interface MediaContent {
  id: string;
  title: string;
  description: string | null;
  media_type: string;
  media_url: string | null;
  article_content: string | null;
  points_reward: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MediaContentTab = () => {
  const { user } = useAuth();
  const [mediaContent, setMediaContent] = useState<MediaContent[]>([]);
  const [completedContent, setCompletedContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMediaContent();
      fetchCompletedContent();
    }
  }, [user]);

  const fetchMediaContent = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_media_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setMediaContent(data || []);
    } catch (error) {
      console.error('Error fetching media content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedContent = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_media_completions')
        .select('media_id')
        .eq('user_id', user.id)
        .eq('completed_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setCompletedContent(data?.map(completion => completion.media_id) || []);
    } catch (error) {
      console.error('Error fetching completed content:', error);
    }
  };

  const completeMediaContent = async (contentId: string, pointsReward: number) => {
    if (!user) return;

    const isCompleted = completedContent.includes(contentId);
    
    if (isCompleted) {
      // إلغاء إكمال المحتوى
      try {
        setCompletedContent(prev => prev.filter(id => id !== contentId));
        
        const { error } = await supabase
          .from('user_media_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', contentId)
          .eq('completed_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        toast.success('تم إلغاء إكمال المحتوى');
      } catch (error) {
        console.error('Error uncompleting media content:', error);
        setCompletedContent(prev => [...prev, contentId]);
        toast.error('حدث خطأ أثناء إلغاء إكمال المحتوى');
      }
    } else {
      // إكمال المحتوى
      try {
        setCompletedContent(prev => [...prev, contentId]);
        
        const { error } = await supabase
          .from('user_media_completions')
          .insert({
            user_id: user.id,
            media_id: contentId,
            points_earned: pointsReward
          });

        if (error) throw error;

        toast.success(`تم إكمال المحتوى! حصلت على ${pointsReward} نقطة`);
      } catch (error) {
        console.error('Error completing media content:', error);
        setCompletedContent(prev => prev.filter(id => id !== contentId));
        toast.error('حدث خطأ أثناء إكمال المحتوى');
      }
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getMediaTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'فيديو';
      case 'article': return 'مقال';
      case 'image': return 'صورة';
      default: return 'محتوى';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mediaContent.map((content) => {
        const isCompleted = completedContent.includes(content.id);
        
        return (
          <div 
            key={content.id}
            className="rounded-lg border bg-background border-border hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => completeMediaContent(content.id, content.points_reward)}
                  className="flex-shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary animate-scale-in" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">
                    {content.title}
                  </h4>
                  
                  {content.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {content.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span>{content.points_reward}</span>
                </div>
                
                {isCompleted && (
                  <span className="text-primary text-lg font-bold">✓</span>
                )}
              </div>
            </div>

            {/* عرض الوسائط */}
            {content.media_url && (content.media_type === 'image' || content.media_type === 'video') && (
              <div className="px-4 pb-4">
                <MediaModal 
                  media_url={content.media_url} 
                  media_type={content.media_type}
                  title={content.title}
                >
                  {content.media_type === 'image' ? (
                    <img 
                      src={content.media_url} 
                      alt={content.title}
                      className="w-full max-h-48 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <video 
                      src={content.media_url}
                      className="w-full max-h-48 rounded-lg border hover:opacity-90 transition-opacity"
                      preload="metadata"
                    >
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  )}
                </MediaModal>
              </div>
            )}

            {/* رابط للملفات الأخرى */}
            {content.media_url && content.media_type !== 'image' && content.media_type !== 'video' && (
              <div className="px-4 pb-4">
                <a 
                  href={content.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  {getMediaIcon(content.media_type)}
                  عرض المحتوى
                </a>
              </div>
            )}

            {/* عرض محتوى المقال */}
            {content.article_content && content.media_type === 'article' && (
              <div className="px-4 pb-4 prose prose-sm max-w-none">
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {content.article_content.length > 200 
                    ? content.article_content.substring(0, 200) + '...'
                    : content.article_content
                  }
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {mediaContent.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا يوجد محتوى وسائط متاح حالياً</p>
        </div>
      )}
    </div>
  );
};

export default MediaContentTab;