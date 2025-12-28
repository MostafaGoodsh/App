import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Play, Square, Users, Maximize, Minimize, Copy, Heart, MessageSquare } from "lucide-react";
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

const LiveStreamBroadcast = () => {
  const { toast } = useToast();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const broadcasterRef = useRef<WebRTCBroadcaster | null>(null);
  const currentStreamIdRef = useRef<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Fetch comments function
  const fetchComments = async (streamId: string) => {
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
  };

  // Fetch likes count
  const fetchLikes = async (streamId: string) => {
    const { count } = await supabase
      .from('live_stream_likes')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', streamId);

    setLikesCount(count || 0);
  };

  // Subscribe to comments when streaming
  useEffect(() => {
    if (!isStreaming || !currentStreamIdRef.current) return;

    const streamId = currentStreamIdRef.current;
    fetchComments(streamId);
    fetchLikes(streamId);

    const commentsChannel = supabase
      .channel(`broadcaster-comments-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_comments',
          filter: `stream_id=eq.${streamId}`,
        },
        () => fetchComments(streamId)
      )
      .subscribe();

    const likesChannel = supabase
      .channel(`broadcaster-likes-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_stream_likes',
          filter: `stream_id=eq.${streamId}`,
        },
        () => fetchLikes(streamId)
      )
      .subscribe();

    return () => {
      commentsChannel.unsubscribe();
      likesChannel.unsubscribe();
    };
  }, [isStreaming]);

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useEffect(() => {
    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      stopAllStreams();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
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
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      screenStreamRef.current = screenStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }
      
      setIsScreenSharing(true);
      setIsCameraOn(false);
      
      // Handle when user stops sharing via browser UI
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      toast({
        title: "بدأ مشاركة الشاشة",
        description: "يتم الآن بث شاشتك"
      });
    } catch (error) {
      console.error('Error sharing screen:', error);
      const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ في مشاركة الشاشة",
        description: errorMessage.includes("Permission denied") 
          ? "تم رفض إذن مشاركة الشاشة. الرجاء السماح بمشاركة الشاشة وإعادة المحاولة."
          : "تأكد من السماح بمشاركة الشاشة. قد تحتاج إلى استخدام HTTPS.",
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

      // إنشاء stream ID و stream key
      const streamId = crypto.randomUUID();
      const streamKey = `stream_${Date.now()}`;
      
      currentStreamIdRef.current = streamId;
      
      // بدء WebRTC أولاً قبل حفظ البث في قاعدة البيانات
      const activeStream = screenStreamRef.current || streamRef.current;
      if (!activeStream) {
        throw new Error('No active stream available for broadcasting!');
      }
      
      console.log('Starting WebRTC broadcaster first...');
      console.log('Active stream tracks:', activeStream.getTracks().length);
      activeStream.getTracks().forEach(track => {
        console.log(`Broadcast track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      });
      
      broadcasterRef.current = new WebRTCBroadcaster(
        streamId, 
        userData.data.user.id,
        (count) => setViewerCount(count)
      );
      
      await broadcasterRef.current.start(activeStream);
      console.log('✅ WebRTC broadcaster started successfully');
      
      setIsStreaming(true);
      
      // الآن بعد أن أصبح المذيع جاهزاً، احفظ البث في قاعدة البيانات
      console.log('Saving stream to database...');
      
      // حفظ في live_streams للسجل
      const { error: streamError } = await supabase
        .from('live_streams')
        .insert({
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

      if (streamError) {
        console.error('Error saving to live_streams:', streamError);
      }

      // حفظ في active_live_streams ليكون مرئياً للمشاهدين
      const { error: activeError } = await supabase
        .from('active_live_streams')
        .insert({
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

      if (activeError) {
        console.error('Error adding to active streams:', activeError);
        throw activeError;
      }
      
      console.log('✅ Stream saved to database:', streamId);
      console.log('✅ Stream is now visible to viewers');

      toast({
        title: "بدأ البث المباشر",
        description: "أنت الآن على الهواء مباشرة! المشاهدون يمكنهم رؤية بثك الآن."
      });
    } catch (error: any) {
      console.error('Error starting broadcast:', error);
      
      // إذا فشل، توقف عن البث
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
    
    // إيقاف WebRTC
    broadcasterRef.current?.stop();
    broadcasterRef.current = null;

    // تحديث حالة البث وحذفه من البثوث النشطة
    if (currentStreamIdRef.current) {
      try {
        // تحديث live_streams
        await supabase
          .from('live_streams')
          .update({ 
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', currentStreamIdRef.current);
        
        // حذف من active_live_streams
        await supabase
          .from('active_live_streams')
          .delete()
          .eq('id', currentStreamIdRef.current);
        
        console.log('البث تم إيقافه وحذفه من البثوث النشطة');
      } catch (error) {
        console.error('Error updating stream status:', error);
      }
    }

    setViewerCount(0);
    stopAllStreams();
    setIsCameraOn(false);
    setIsScreenSharing(false);
    currentStreamIdRef.current = null;
    
    // Exit fullscreen if active
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
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast({
        title: "خطأ",
        description: "فشل في تفعيل وضع الشاشة الكاملة",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* عنوان البث */}
        <Card>
        <CardHeader>
          <CardTitle className="font-cairo">إعدادات البث المباشر</CardTitle>
          <CardDescription>قم بإعداد بثك المباشر قبل البدء</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stream_title">عنوان البث *</Label>
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
                  <span>{viewerCount} مشاهد</span>
                </AlertDescription>
              </Alert>
              
              <Button
                variant="outline"
                onClick={() => {
                  const url = `${window.location.origin}/live-stream/watch/${currentStreamIdRef.current}`;
                  navigator.clipboard.writeText(url);
                  toast({
                    title: "✓ تم نسخ رابط المشاهدة",
                    description: "افتح الرابط في نافذة أخرى أو شاركه مع المشاهدين",
                  });
                }}
                className="w-full"
              >
                <Copy className="w-4 h-4 ml-2" />
                نسخ رابط المشاهدة
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* معاينة الفيديو */}
      <Card>
        <CardHeader>
          <CardTitle className="font-cairo">معاينة البث</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={videoContainerRef}
            className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer"
            onClick={toggleFullscreen}
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
                </div>
              </div>
            )}
            {isStreaming && (
              <div className="absolute top-4 left-4 pointer-events-none">
                <Badge className="bg-red-500 text-white animate-pulse">
                  ● على الهواء
                </Badge>
              </div>
            )}
            {/* زر الشاشة الكاملة */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/60 p-2 rounded-lg backdrop-blur-sm">
                {isFullscreen ? (
                  <Minimize className="w-6 h-6 text-white" />
                ) : (
                  <Maximize className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            <Button
              onClick={isCameraOn ? stopCamera : startCamera}
              variant={isCameraOn ? "default" : "outline"}
              disabled={isStreaming || isScreenSharing}
              className="w-full"
            >
              {isCameraOn ? <Video className="w-4 h-4 ml-2" /> : <VideoOff className="w-4 h-4 ml-2" />}
              {isCameraOn ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
            </Button>

            <Button
              onClick={toggleMicrophone}
              variant={isMicOn ? "default" : "outline"}
              className="w-full"
            >
              {isMicOn ? <Mic className="w-4 h-4 ml-2" /> : <MicOff className="w-4 h-4 ml-2" />}
              {isMicOn ? "كتم الصوت" : "تشغيل الصوت"}
            </Button>

            <Button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              variant={isScreenSharing ? "default" : "outline"}
              disabled={isStreaming || isCameraOn}
              className="w-full"
            >
              {isScreenSharing ? <Monitor className="w-4 h-4 ml-2" /> : <MonitorOff className="w-4 h-4 ml-2" />}
              {isScreenSharing ? "إيقاف المشاركة" : "مشاركة الشاشة"}
            </Button>

            {!isStreaming ? (
              <Button
                onClick={startBroadcast}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                <Play className="w-4 h-4 ml-2" />
                بدء البث
              </Button>
            ) : (
              <Button
                onClick={stopBroadcast}
                variant="destructive"
                className="w-full"
              >
                <Square className="w-4 h-4 ml-2" />
                إيقاف البث
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

        {/* نصائح للبث */}
        <Card>
          <CardHeader>
            <CardTitle className="font-cairo text-lg">نصائح للبث المباشر</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc mr-4">
              <li>تأكد من وجود إضاءة جيدة قبل البدء</li>
              <li>اختبر الصوت والصورة قبل بدء البث</li>
              <li>استخدم اتصال إنترنت مستقر</li>
              <li>تفاعل مع المشاهدين في التعليقات</li>
              <li>حضّر محتوى جذاب ومفيد للجمهور</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* التفاعل المباشر */}
      <div className="lg:col-span-1">
        {isStreaming && currentStreamIdRef.current && (
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
              <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-cairo">لا توجد تعليقات بعد</p>
                    <p className="text-sm">سيظهر التفاعل من المشاهدين هنا</p>
                  </div>
                ) : (
                  <>
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-muted/50 p-3 rounded-lg">
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
