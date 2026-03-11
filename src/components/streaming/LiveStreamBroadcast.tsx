import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Play, Square, Users, Maximize, Minimize, Copy, Heart, MessageSquare, Gift, SwitchCamera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WebRTCBroadcaster } from "@/utils/webrtc";
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

interface StreamGift {
  id: string;
  gift_type: string;
  gift_value: number;
  created_at: string;
  sender_id: string;
}

const GIFT_EMOJIS: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  fire: '🔥',
  diamond: '💎',
  crown: '👑',
  rocket: '🚀'
};

const LiveStreamBroadcast = () => {
  const { toast } = useToast();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [streamTitle, setStreamTitle] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [gifts, setGifts] = useState<StreamGift[]>([]);
  const [totalGiftValue, setTotalGiftValue] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const broadcasterRef = useRef<WebRTCBroadcaster | null>(null);
  const currentStreamIdRef = useRef<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  // Cleanup channels
  const cleanupChannels = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  }, []);

  // Fetch comments function
  const fetchComments = useCallback(async (streamId: string) => {
    const { data } = await supabase
      .from('live_stream_comments')
      .select('id, comment, created_at, user_id')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      const userIds = data.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const commentsWithProfiles = data.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        created_at: comment.created_at,
        profiles: profilesMap.get(comment.user_id) || null
      }));
      
      setComments(commentsWithProfiles);
    }
  }, []);

  // Fetch likes count
  const fetchLikes = useCallback(async (streamId: string) => {
    const { count } = await supabase
      .from('live_stream_likes')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', streamId);

    setLikesCount(count || 0);
  }, []);

  // Fetch gifts
  const fetchGifts = useCallback(async (streamId: string) => {
    const { data } = await supabase
      .from('live_stream_gifts')
      .select('*')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setGifts(data);
      const total = data.reduce((sum, g) => sum + g.gift_value, 0);
      setTotalGiftValue(total);
    }
  }, []);

  // Subscribe to real-time updates when streaming
  useEffect(() => {
    if (!isStreaming || !currentStreamIdRef.current) return;

    const streamId = currentStreamIdRef.current;
    fetchComments(streamId);
    fetchLikes(streamId);
    fetchGifts(streamId);

    // Subscribe to comments
    const commentsChannel = supabase
      .channel(`broadcaster-comments-${streamId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_comments',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          console.log('New comment for broadcaster:', payload);
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .maybeSingle();
          
          const newComment: Comment = {
            id: payload.new.id,
            comment: payload.new.comment,
            created_at: payload.new.created_at,
            profiles: profile || null
          };
          
          setComments(prev => {
            if (prev.some(c => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });
        }
      )
      .subscribe();

    // Subscribe to likes
    const likesChannel = supabase
      .channel(`broadcaster-likes-${streamId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_stream_likes',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          console.log('Likes update for broadcaster:', payload);
          if (payload.eventType === 'INSERT') {
            setLikesCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setLikesCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // Subscribe to gifts
    const giftsChannel = supabase
      .channel(`broadcaster-gifts-${streamId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_gifts',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          console.log('New gift received:', payload);
          const newGift = payload.new as StreamGift;
          setGifts(prev => [newGift, ...prev].slice(0, 20));
          setTotalGiftValue(prev => prev + newGift.gift_value);
          
          // Show toast for new gift
          toast({
            title: `${GIFT_EMOJIS[newGift.gift_type] || '🎁'} هدية جديدة!`,
            description: `تلقيت ${newGift.gift_value} نقطة`
          });
        }
      )
      .subscribe();

    channelsRef.current = [commentsChannel, likesChannel, giftsChannel];

    return () => {
      cleanupChannels();
    };
  }, [isStreaming, fetchComments, fetchLikes, fetchGifts, cleanupChannels, toast]);

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      stopAllStreams();
      cleanupChannels();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [cleanupChannels]);

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
  };

  const startCamera = async (mode?: 'user' | 'environment') => {
    try {
      const currentMode = mode || facingMode;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: currentMode
        },
        audio: isMicOn
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCameraOn(true);
      toast({
        title: "تم تشغيل الكاميرا",
        description: "يمكنك الآن بدء البث المباشر"
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "خطأ في الوصول للكاميرا",
        description: "تأكد من السماح بالوصول للكاميرا والميكروفون",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isCameraOn) {
      // Stop current camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      // Start with new facing mode
      await startCamera(newMode);
    }
  };

  const toggleMicrophone = async () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      screenStreamRef.current = screenStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }
      
      setIsScreenSharing(true);
      setIsCameraOn(false);
      
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      toast({
        title: "بدأ مشاركة الشاشة",
        description: "يتم الآن بث شاشتك"
      });
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: "خطأ في مشاركة الشاشة",
        description: "تأكد من السماح بمشاركة الشاشة",
        variant: "destructive"
      });
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
  };

  const startBroadcast = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: "العنوان مطلوب",
        description: "يرجى إضافة عنوان للبث المباشر",
        variant: "destructive"
      });
      return;
    }

    if (!isCameraOn && !isScreenSharing) {
      toast({
        title: "تشغيل الكاميرا أو مشاركة الشاشة",
        description: "يجب تشغيل الكاميرا أو مشاركة الشاشة أولاً",
        variant: "destructive"
      });
      return;
    }

    try {
      const userData = await supabase.auth.getUser();
      if (!userData.data.user?.id) {
        throw new Error("User not authenticated");
      }

      const streamId = crypto.randomUUID();
      const streamKey = `stream_${Date.now()}`;
      
      currentStreamIdRef.current = streamId;
      
      const activeStream = screenStreamRef.current || streamRef.current;
      if (!activeStream) {
        throw new Error('No active stream available for broadcasting!');
      }
      
      broadcasterRef.current = new WebRTCBroadcaster(
        streamId, 
        userData.data.user.id,
        (count) => setViewerCount(count)
      );
      
      await broadcasterRef.current.start(activeStream);
      
      setIsStreaming(true);
      
      // Save to live_streams
      await supabase.from('live_streams').insert({
        id: streamId,
        user_id: userData.data.user.id,
        title: streamTitle,
        description: 'بث مباشر',
        stream_key: streamKey,
        status: 'active',
        started_at: new Date().toISOString(),
        viewer_count: 0,
        likes_count: 0,
        total_views: 0
      });

      // Save to active_live_streams
      await supabase.from('active_live_streams').insert({
        id: streamId,
        user_id: userData.data.user.id,
        title: streamTitle,
        description: 'بث مباشر',
        stream_key: streamKey,
        is_active: true,
        started_at: new Date().toISOString(),
        viewer_count: 0,
        likes_count: 0
      });

      toast({
        title: "بدأ البث المباشر",
        description: "أنت الآن على الهواء مباشرة!"
      });
    } catch (error: any) {
      console.error('Error starting broadcast:', error);
      setIsStreaming(false);
      broadcasterRef.current?.stop();
      broadcasterRef.current = null;
      currentStreamIdRef.current = null;
      
      toast({
        title: "خطأ",
        description: error.message || "فشل في بدء البث",
        variant: "destructive"
      });
    }
  };

  const stopBroadcast = async () => {
    setIsStreaming(false);
    
    broadcasterRef.current?.stop();
    broadcasterRef.current = null;

    if (currentStreamIdRef.current) {
      try {
        await supabase.from('live_streams').update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        }).eq('id', currentStreamIdRef.current);
        
        await supabase.from('active_live_streams').delete().eq('id', currentStreamIdRef.current);
      } catch (error) {
        console.error('Error updating stream status:', error);
      }
    }

    setViewerCount(0);
    setComments([]);
    setLikesCount(0);
    setGifts([]);
    setTotalGiftValue(0);
    stopAllStreams();
    setIsCameraOn(false);
    setIsScreenSharing(false);
    currentStreamIdRef.current = null;
    cleanupChannels();
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    toast({
      title: "انتهى البث المباشر",
      description: "تم إيقاف البث بنجاح"
    });
  };

  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-[100vw] overflow-x-hidden" dir="rtl">
      <div className="lg:col-span-2 space-y-6">
        {/* Stream Settings */}
        <Card>
          <CardHeader className="text-right">
            <CardTitle className="font-cairo text-lg">
              إعدادات البث المباشر
              <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Live Stream Settings</span>
            </CardTitle>
            <CardDescription className="font-cairo">
              قم بإعداد بثك المباشر قبل البدء
              <span className="text-xs block opacity-70" dir="ltr">Set up your broadcast before starting</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stream_title" className="font-cairo">عنوان البث * <span className="text-xs text-muted-foreground opacity-70">Stream Title</span></Label>
              <Input
                id="stream_title"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="مثال: جلسة أسئلة وأجوبة مباشرة"
                disabled={isStreaming}
                className="font-cairo"
              />
            </div>

            {isStreaming && (
              <>
                <Alert>
                  <Users className="w-4 h-4" />
                  <AlertDescription className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-500 text-white animate-pulse">
                      على الهواء
                    </Badge>
                    <span className="font-cairo">{viewerCount} مشاهد <span className="text-xs opacity-70">Viewers</span></span>
                  </AlertDescription>
                </Alert>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/live-stream/watch/${currentStreamIdRef.current}`;
                    navigator.clipboard.writeText(url);
                    toast({
                      title: "✓ تم نسخ رابط المشاهدة",
                      description: "شارك الرابط مع المشاهدين",
                    });
                  }}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  <span className="font-cairo">نسخ رابط المشاهدة <span className="text-xs opacity-70">Copy Link</span></span>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Video Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-cairo">
              معاينة البث
              <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Broadcast Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={videoContainerRef}
              className="relative bg-black rounded-lg overflow-hidden group"
              style={{ minHeight: '400px', aspectRatio: '4/3' }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isCameraOn && !isScreenSharing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-white">
                    <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="font-cairo">الكاميرا غير مفعلة</p>
                    <p className="text-xs opacity-70" dir="ltr">Camera is off</p>
                  </div>
                </div>
              )}
              {isStreaming && (
                <div className="absolute top-4 left-4 pointer-events-none">
                  <Badge className="bg-red-500 text-white animate-pulse">● على الهواء</Badge>
                </div>
              )}
              
              {/* Fullscreen button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 bg-black/60 text-white hover:bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>

              {/* Stats overlay in fullscreen */}
              {isFullscreen && isStreaming && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm">
                    <Users className="w-4 h-4 mr-1" /> {viewerCount}
                  </Badge>
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm">
                    <Heart className="w-4 h-4 mr-1" /> {likesCount}
                  </Badge>
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm">
                    <Gift className="w-4 h-4 mr-1" /> {totalGiftValue}
                  </Badge>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <Button
                onClick={isCameraOn ? stopCamera : () => startCamera()}
                variant={isCameraOn ? "default" : "outline"}
                disabled={isStreaming || isScreenSharing}
                className="w-full"
              >
                {isCameraOn ? <Video className="w-4 h-4 ml-2" /> : <VideoOff className="w-4 h-4 ml-2" />}
                <span className="font-cairo">{isCameraOn ? "إيقاف" : "الكاميرا"}</span>
              </Button>

              <Button
                onClick={toggleMicrophone}
                variant={isMicOn ? "default" : "outline"}
                className="w-full"
              >
                {isMicOn ? <Mic className="w-4 h-4 ml-2" /> : <MicOff className="w-4 h-4 ml-2" />}
                <span className="font-cairo">{isMicOn ? "كتم" : "الصوت"}</span>
              </Button>

              <Button
                onClick={switchCamera}
                variant="outline"
                disabled={!isCameraOn || isStreaming}
                className="w-full"
              >
                <SwitchCamera className="w-4 h-4 ml-2" />
                <span className="font-cairo">{facingMode === 'user' ? "خلفية" : "أمامية"}</span>
              </Button>

              <Button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                variant={isScreenSharing ? "default" : "outline"}
                disabled={isStreaming || isCameraOn}
                className="w-full"
              >
                {isScreenSharing ? <Monitor className="w-4 h-4 ml-2" /> : <MonitorOff className="w-4 h-4 ml-2" />}
                <span className="font-cairo">{isScreenSharing ? "إيقاف" : "الشاشة"}</span>
              </Button>

              {!isStreaming ? (
                <Button
                  onClick={startBroadcast}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <Play className="w-4 h-4 ml-2" />
                  <span className="font-cairo">بدء البث <span className="text-xs opacity-70">Go Live</span></span>
                </Button>
              ) : (
                <Button
                  onClick={stopBroadcast}
                  variant="destructive"
                  className="w-full"
                >
                  <Square className="w-4 h-4 ml-2" />
                  <span className="font-cairo">إيقاف <span className="text-xs opacity-70">Stop</span></span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        {!isStreaming && (
          <Card>
            <CardHeader>
              <CardTitle className="font-cairo text-lg">
                نصائح للبث المباشر
                <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Broadcasting Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc mr-4 font-cairo">
                <li>تأكد من وجود إضاءة جيدة قبل البدء <span className="text-xs opacity-70" dir="ltr">• Good lighting</span></li>
                <li>اختبر الصوت والصورة قبل بدء البث <span className="text-xs opacity-70" dir="ltr">• Test audio/video</span></li>
                <li>استخدم اتصال إنترنت مستقر <span className="text-xs opacity-70" dir="ltr">• Stable internet</span></li>
                <li>تفاعل مع المشاهدين في التعليقات <span className="text-xs opacity-70" dir="ltr">• Engage viewers</span></li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Live Interactions Panel */}
      <div className="lg:col-span-1">
        {isStreaming && currentStreamIdRef.current && (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="font-cairo text-lg">
                التفاعل المباشر
                <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Live Interactions</span>
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {viewerCount}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Heart className="w-3 h-3" />
                  {likesCount}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {comments.length}
                </Badge>
                <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-600">
                  <Gift className="w-3 h-3" />
                  {totalGiftValue}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pr-2 space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-cairo">لا توجد تعليقات بعد</p>
                    <p className="text-sm font-cairo">سيظهر التفاعل هنا <span className="text-xs opacity-70" dir="ltr">No comments yet</span></p>
                  </div>
                ) : (
                  <>
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-muted/50 p-3 rounded-lg animate-fade-in">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-white text-sm">
                            {comment.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-cairo font-semibold truncate">
                              {comment.profiles?.full_name || 'مستخدم'}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ar })}
                            </span>
                          </div>
                          <p className="text-sm break-words">{comment.comment}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LiveStreamBroadcast;
