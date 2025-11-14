import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface LiveStream {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stream_key: string;
  viewer_count: number;
  likes_count: number;
  total_views: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  stream_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useLiveStream = (streamId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeStreams, setActiveStreams] = useState<LiveStream[]>([]);
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all active streams
  const fetchActiveStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const streamsWithProfiles = data?.map(stream => ({
        ...stream,
        profiles: profiles?.find(p => p.user_id === stream.user_id) || {
          full_name: 'مستخدم',
          avatar_url: null
        }
      })) || [];

      setActiveStreams(streamsWithProfiles);
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific stream
  const fetchStream = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('user_id', data.user_id)
        .single();

      const streamWithProfile = {
        ...data,
        profiles: profile || {
          full_name: 'مستخدم',
          avatar_url: null
        }
      };

      setCurrentStream(streamWithProfile);

      // Check if user liked this stream
      if (user) {
        const { data: likeData } = await supabase
          .from('live_stream_likes')
          .select('id')
          .eq('stream_id', id)
          .eq('user_id', user.id)
          .single();

        setIsLiked(!!likeData);

        // Check if user follows the streamer
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', data.user_id)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
    }
  };

  // Fetch comments
  const fetchComments = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('live_stream_comments')
        .select('*')
        .eq('stream_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const commentsWithProfiles = data?.map(comment => ({
        ...comment,
        profiles: profiles?.find(p => p.user_id === comment.user_id) || {
          full_name: 'مستخدم',
          avatar_url: null
        }
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add comment
  const addComment = async (streamId: string, comment: string) => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للتعليق",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('live_stream_comments')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          comment
        });

      if (error) throw error;

      toast({
        title: "تم إضافة التعليق",
        description: "تم نشر تعليقك بنجاح"
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Toggle like
  const toggleLike = async (streamId: string) => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للإعجاب",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('live_stream_likes')
          .delete()
          .eq('stream_id', streamId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
      } else {
        const { error } = await supabase
          .from('live_stream_likes')
          .insert({
            stream_id: streamId,
            user_id: user.id
          });

        if (error) throw error;
        setIsLiked(true);
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Toggle follow
  const toggleFollow = async (targetUserId: string) => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للمتابعة",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        setIsFollowing(false);
        toast({ title: "تم إلغاء المتابعة" });
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;
        setIsFollowing(true);
        toast({ title: "تمت المتابعة بنجاح" });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Record view
  const recordView = async (streamId: string) => {
    try {
      await supabase.from('live_stream_views').insert({
        stream_id: streamId,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!streamId) return;

    fetchStream(streamId);
    fetchComments(streamId);
    recordView(streamId);

    // Subscribe to comments
    const commentsChannel = supabase
      .channel(`comments-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_comments',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          fetchComments(streamId);
        }
      )
      .subscribe();

    // Subscribe to stream updates
    const streamChannel = supabase
      .channel(`stream-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_streams',
          filter: `id=eq.${streamId}`
        },
        (payload) => {
          console.log('تحديث البث:', payload);
          fetchStream(streamId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(streamChannel);
    };
  }, [streamId]);

  // Fetch active streams on mount
  useEffect(() => {
    if (!streamId) {
      fetchActiveStreams();

      // Subscribe to new streams
      const channel = supabase
        .channel('active-streams')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_streams'
          },
          (payload) => {
            console.log('تغيير في البثوث:', payload);
            fetchActiveStreams();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [streamId]);

  return {
    activeStreams,
    currentStream,
    comments,
    isLiked,
    isFollowing,
    loading,
    addComment,
    toggleLike,
    toggleFollow,
    recordView,
    refreshStreams: fetchActiveStreams
  };
};
