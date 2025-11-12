import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface BroadcasterInteractionsProps {
  streamId: string | null;
  viewerCount: number;
}

export const BroadcasterInteractions = ({ streamId, viewerCount }: BroadcasterInteractionsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!streamId) return;

    // Fetch initial data
    fetchComments();
    fetchLikes();

    // Subscribe to new comments
    const commentsChannel = supabase
      .channel(`stream-comments-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_comments',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          setComments(prev => [{
            id: payload.new.id,
            comment: payload.new.comment,
            created_at: payload.new.created_at,
            profiles: profile
          }, ...prev]);
        }
      )
      .subscribe();

    // Subscribe to likes
    const likesChannel = supabase
      .channel(`stream-likes-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_stream_likes',
          filter: `stream_id=eq.${streamId}`,
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    return () => {
      commentsChannel.unsubscribe();
      likesChannel.unsubscribe();
    };
  }, [streamId]);

  const fetchComments = async () => {
    if (!streamId) return;

    const { data } = await supabase
      .from('live_stream_comments')
      .select(`
        id,
        comment,
        created_at,
        user_id
      `)
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      // Fetch profiles separately
      const userIds = data.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const commentsWithProfiles = data.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        created_at: comment.created_at,
        profiles: profilesMap.get(comment.user_id) || null
      }));
      
      setComments(commentsWithProfiles);
    }
  };

  const fetchLikes = async () => {
    if (!streamId) return;

    const { count } = await supabase
      .from('live_stream_likes')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', streamId);

    setLikesCount(count || 0);
  };

  if (!streamId) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="font-cairo text-lg">التفاعل المباشر</CardTitle>
        <div className="flex gap-4 mt-2">
          <Badge variant="secondary" className="gap-2">
            <Users className="w-4 h-4" />
            {viewerCount} مشاهد
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <Heart className="w-4 h-4" />
            {likesCount} إعجاب
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            {comments.length} تعليق
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-cairo">لا توجد تعليقات بعد</p>
              <p className="text-sm">سيظهر التفاعل من المشاهدين هنا</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-white">
                      {comment.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-cairo font-semibold">
                        {comment.profiles?.full_name || 'مستخدم'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </span>
                    </div>
                    <p className="text-sm break-words">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
