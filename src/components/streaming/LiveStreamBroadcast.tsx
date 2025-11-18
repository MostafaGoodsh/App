import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Play, Square, Users, Maximize, Minimize, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WebRTCBroadcaster } from "@/utils/webrtc";
import { BroadcasterInteractions } from "./BroadcasterInteractions";

const LiveStreamBroadcast = () => {
  const { toast } = useToast();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const broadcasterRef = useRef<WebRTCBroadcaster | null>(null);
  const currentStreamIdRef = useRef<string | null>(null);

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
      // التحقق من دعم المتصفح لمشاركة الشاشة
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast({
          title: "مشاركة الشاشة غير مدعومة",
          description: "المتصفح لا يدعم مشاركة الشاشة أو يتطلب HTTPS. الرجاء استخدام متصفح حديث والتأكد من أن الموقع يعمل على HTTPS.",
          variant: "destructive"
        });
        return;
      }

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

      // حفظ البث في قاعدة البيانات live_streams
      const streamKey = `stream_${Date.now()}`;
      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          user_id: userData.data.user.id,
          title: streamTitle,
          description: 'بث مباشر',
          stream_key: streamKey,
          status: 'active',
          started_at: new Date().toISOString(),
          viewer_count: 0,
          likes_count: 0,
          total_views: 0
        })
        .select()
        .single();

      if (error) throw error;

      currentStreamIdRef.current = data.id;
      setIsStreaming(true);
      
      console.log('تم إنشاء البث بنجاح:', data.id);
      console.log('البث الآن مرئي في صفحة البثوث المباشرة');
      
      // بدء البث عبر WebRTC
      const activeStream = screenStreamRef.current || streamRef.current;
      if (activeStream) {
        console.log('Active stream tracks:', activeStream.getTracks().length);
        activeStream.getTracks().forEach(track => {
          console.log(`Broadcast track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        });
        
        broadcasterRef.current = new WebRTCBroadcaster(
          data.id, 
          userData.data.user.id,
          (count) => setViewerCount(count)
        );
        await broadcasterRef.current.start(activeStream);
        console.log('WebRTC broadcaster بدأ بنجاح');
      } else {
        console.error('No active stream available for broadcasting!');
      }

      toast({
        title: "بدأ البث المباشر",
        description: "أنت الآن على الهواء مباشرة! المشاهدون يمكنهم رؤية بثك الآن."
      });
    } catch (error: any) {
      console.error('Error starting broadcast:', error);
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

    // تحديث حالة البث إلى "ended"
    if (currentStreamIdRef.current) {
      try {
        await supabase
          .from('live_streams')
          .update({ 
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', currentStreamIdRef.current);
        
        console.log('البث تم إيقافه وتحديث حالته في قاعدة البيانات');
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
        {isStreaming && (
          <BroadcasterInteractions 
            streamId={currentStreamIdRef.current}
            viewerCount={viewerCount}
          />
        )}
      </div>
    </div>
  );
};

export default LiveStreamBroadcast;
