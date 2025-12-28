import { useState, useEffect, useCallback, useRef } from "react";
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
  const [likesCount, setLikesCount] = useState(0);
  
  // Use refs to track subscription state
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  // Fetch all active streams
  const fetchActiveStreams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('active_live_streams')
        .select('*')
        .eq('is_active', true)
        .order('started_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(data?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const streamsWithProfiles = data?.map(stream => ({
        ...stream,
        total_views: 0,
        status: 'active',
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
  }, []);

  // Fetch specific stream
  const fetchStream = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('active_live_streams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('user_id', data.user_id)
        .single();

      const streamWithProfile = {
        ...data,
        total_views: 0,
        status: 'active',
        profiles: profile || {
          full_name: 'مستخدم',
          avatar_url: null
        }
      };

      setCurrentStream(streamWithProfile);
      setLikesCount(data.likes_count || 0);

      // Check if user liked this stream
      if (user) {
        const { data: likeData } = await supabase
          .from('live_stream_likes')
          .select('id')
          .eq('stream_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsLiked(!!likeData);

        // Check if user follows the streamer
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', data.user_id)
          .maybeSingle();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
    }
  }, [user]);

  // Fetch comments with optimized query
  const fetchComments = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('live_stream_comments')
        .select('*')
        .eq('stream_id', id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

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
  }, []);

  // Add comment - optimistic update
  const addComment = useCallback(async (streamId: string, comment: string) => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للتعليق",
        variant: "destructive"
      });
      return;
    }

    // Optimistic update
    const tempComment: Comment = {
      id: crypto.randomUUID(),
      stream_id: streamId,
      user_id: user.id,
      comment,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: 'أنت',
        avatar_url: null
      }
    };
    
    setComments(prev => [...prev, tempComment]);

    try {
      const { error } = await supabase
        .from('live_stream_comments')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          comment
        });

      if (error) throw error;
    } catch (error: any) {
      // Rollback on error
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Toggle like - optimistic update
  const toggleLike = useCallback(async (streamId: string) => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للإعجاب",
        variant: "destructive"
      });
      return;
    }

    const wasLiked = isLiked;
    
    // Optimistic update
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('live_stream_likes')
          .delete()
          .eq('stream_id', streamId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('live_stream_likes')
          .insert({
            stream_id: streamId,
            user_id: user.id
          });

        if (error) throw error;
      }
    } catch (error: any) {
      // Rollback on error
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, isLiked, toast]);

  // Toggle follow - with proper error handling
  const toggleFollow = useCallback(async (targetUserId: string) => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للمتابعة",
        variant: "destructive"
      });
      return;
    }

    if (user.id === targetUserId) {
      toast({
        title: "خطأ",
        description: "لا يمكنك متابعة نفسك",
        variant: "destructive"
      });
      return;
    }

    const wasFollowing = isFollowing;
    
    // Optimistic update
    setIsFollowing(!wasFollowing);

    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        toast({ title: "تم إلغاء المتابعة" });
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;
        toast({ title: "تمت المتابعة بنجاح" });
      }
    } catch (error: any) {
      // Rollback on error
      setIsFollowing(wasFollowing);
      console.error('Follow error:', error);
      toast({
        title: "خطأ في المتابعة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  }, [user, isFollowing, toast]);

  // Record view
  const recordView = useCallback(async (streamId: string) => {
    try {
      await supabase.from('live_stream_views').insert({
        stream_id: streamId,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }, [user]);

  // Cleanup function for channels
  const cleanupChannels = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  }, []);

  // Subscribe to realtime updates for specific stream
  useEffect(() => {
    if (!streamId) return;

    fetchStream(streamId);
    fetchComments(streamId);
    recordView(streamId);

    // Subscribe to comments with immediate update
    const commentsChannel = supabase
      .channel(`viewer-comments-${streamId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_comments',
          filter: `stream_id=eq.${streamId}`
        },
        async (payload) => {
          console.log('New comment received:', payload);
          // Fetch profile for new comment
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .maybeSingle();
          
          const newComment: Comment = {
            id: payload.new.id,
            stream_id: payload.new.stream_id,
            user_id: payload.new.user_id,
            comment: payload.new.comment,
            created_at: payload.new.created_at,
            profiles: profile || { full_name: 'مستخدم', avatar_url: null }
          };
          
          setComments(prev => {
            // Avoid duplicates
            if (prev.some(c => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });
        }
      )
      .subscribe();

    // Subscribe to likes updates
    const likesChannel = supabase
      .channel(`viewer-likes-${streamId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_stream_likes',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          console.log('Likes update:', payload);
          if (payload.eventType === 'INSERT') {
            setLikesCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setLikesCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // Subscribe to stream updates
    const streamChannel = supabase
      .channel(`viewer-stream-${streamId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_live_streams',
          filter: `id=eq.${streamId}`
        },
        (payload) => {
          console.log('Stream update:', payload);
          setCurrentStream(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    channelsRef.current = [commentsChannel, likesChannel, streamChannel];

    return () => {
      cleanupChannels();
    };
  }, [streamId, fetchStream, fetchComments, recordView, cleanupChannels]);

  // Fetch active streams on mount (when no streamId)
  useEffect(() => {
    if (streamId) return;

    fetchActiveStreams();

    const channel = supabase
      .channel(`active-streams-list-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_live_streams'
        },
        () => {
          fetchActiveStreams();
        }
      )
      .subscribe();

    channelsRef.current = [channel];

    return () => {
      cleanupChannels();
    };
  }, [streamId, fetchActiveStreams, cleanupChannels]);

  return {
    activeStreams,
    currentStream,
    comments,
    isLiked,
    isFollowing,
    likesCount,
    loading,
    addComment,
    toggleLike,
    toggleFollow,
    recordView,
    refreshStreams: fetchActiveStreams
  };
};
