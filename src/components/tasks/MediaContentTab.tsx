import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Coins, Play, FileText, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

    try {
      const { error } = await supabase
        .from('user_media_completions')
        .insert({
          user_id: user.id,
          media_id: contentId,
          points_earned: pointsReward
        });

      if (error) throw error;

      setCompletedContent(prev => [...prev, contentId]);
      toast.success(`تم إكمال المحتوى! حصلت على ${pointsReward} نقطة`);
    } catch (error) {
      console.error('Error completing media content:', error);
      toast.error('حدث خطأ أثناء إكمال المحتوى');
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
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              isCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-card border-border hover:border-primary/20'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getMediaIcon(content.media_type)}
                  <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {content.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {getMediaTypeLabel(content.media_type)}
                  </Badge>
                </div>
                
                {content.description && (
                  <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {content.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Coins className="h-4 w-4" />
                <span>{content.points_reward}</span>
              </div>
              
              {!isCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => completeMediaContent(content.id, content.points_reward)}
                  className="text-xs"
                >
                  إكمال
                </Button>
              )}
              
              {isCompleted && (
                <Badge variant="default" className="bg-green-600 text-white">
                  مكتملة
                </Badge>
              )}
            </div>
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