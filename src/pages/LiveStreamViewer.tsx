import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Video, Users, Heart, Send, ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { useLiveStream } from "@/hooks/useLiveStream";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { WebRTCViewer } from "@/utils/webrtc";

const LiveStreamViewer = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentStream,
    comments,
    isLiked,
    isFollowing,
    addComment,
    toggleLike,
    toggleFollow
  } = useLiveStream(streamId);

  // معرف فريد للمشاهد حتى بدون تسجيل دخول
  const [viewerId] = useState(() => {
    const existing = localStorage.getItem("live_viewer_id");
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem("live_viewer_id", id);
    return id;
  });

  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<WebRTCViewer | null>(null);

  useEffect(() => {
    if (streamId && currentStream) {
      console.log('Starting WebRTC viewer for stream:', streamId, 'as viewer:', viewerId);
      viewerRef.current = new WebRTCViewer(streamId, viewerId, (stream) => {
        console.log('Received remote stream, tracks:', stream.getTracks().length);
        stream.getTracks().forEach(track => {
          console.log(`Remote track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        });

        setHasRemoteStream(true);
        setIsVideoPlaying(false);
        setPlayError(null);
        
        if (videoRef.current) {
          console.log('Setting srcObject on video element');
          videoRef.current.srcObject = stream;
          
          // Try to autoplay
          videoRef.current.play().then(() => {
            console.log('Video playing successfully');
          }).catch(err => {
            console.error('Error playing video:', err);
            setPlayError('يتطلب تشغيل الفيديو الضغط على زر التشغيل بسبب إعدادات المتصفح');
          });
        } else {
          console.error('Video element ref is null!');
        }
      });
      
      viewerRef.current.start();

      return () => {
        console.log('Stopping WebRTC viewer');
        viewerRef.current?.stop();
      };
    }
  }, [streamId, currentStream, viewerId]);

  const handleSendComment = async () => {
    if (!comment.trim() || !streamId) return;
    
    setSending(true);
    await addComment(streamId, comment);
    setComment("");
    setSending(false);
  };

  if (!currentStream) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="aspect-video mb-6" />
        <Skeleton className="h-8 mb-4" />
        <Skeleton className="h-4 mb-2" />
        <Skeleton className="h-4" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/live-streams')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>
        
        <div className="flex items-center gap-4">
          <Badge className="bg-red-500 text-white animate-pulse px-3 py-1">
            ● مباشر
          </Badge>
          <Badge className="bg-white/10 backdrop-blur-sm text-white px-3 py-1">
            <Users className="w-4 h-4 ml-2" />
            {currentStream.viewer_count}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video Area - Full Screen */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
            onLoadedMetadata={() => console.log('Video metadata loaded')}
            onCanPlay={() => console.log('Video can play')}
            onPlay={() => {
              console.log('Video started playing');
              setIsVideoPlaying(true);
              setPlayError(null);
            }}
            onPause={() => {
              setIsVideoPlaying(false);
            }}
            onError={(e) => {
              console.error('Video error:', e);
              setPlayError('حدث خطأ أثناء تشغيل الفيديو');
            }}
          />
          {!hasRemoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Video className="w-20 h-20 opacity-30 text-white mb-4" />
              <p className="text-white/80 font-cairo">في انتظار اتصال البث...</p>
            </div>
          )}

          {hasRemoteStream && !isVideoPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/40 font-cairo"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    videoRef.current
                      .play()
                      .then(() => {
                        setIsVideoPlaying(true);
                        setPlayError(null);
                      })
                      .catch((err) => {
                        console.error('Manual play failed:', err);
                        setPlayError('تعذر تشغيل الفيديو، تحقق من إعدادات المتصفح');
                      });
                  }
                }}
              >
                اضغط لتشغيل البث
              </Button>
              {playError && (
                <p className="mt-2 text-sm text-red-400 text-center max-w-xs">
                  {playError}
                </p>
              )}
            </div>
          )}
          
          {/* Stream Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h1 className="text-white text-2xl font-cairo font-bold mb-2">
              {currentStream.title}
            </h1>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={currentStream.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-white">
                  {currentStream.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-cairo font-semibold">
                  {currentStream.profiles?.full_name || 'مستخدم'}
                </h3>
                <p className="text-white/70 text-sm">
                  بدأ منذ {formatDistanceToNow(new Date(currentStream.started_at), { 
                    addSuffix: true, 
                    locale: ar 
                  })}
                </p>
              </div>
              {user && user.id !== currentStream.user_id && (
                <Button 
                  size="sm"
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={() => toggleFollow(currentStream.user_id)}
                  className="mr-auto"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 ml-2" />
                      متابَع
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 ml-2" />
                      متابعة
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={isLiked ? "default" : "outline"}
                onClick={() => streamId && toggleLike(streamId)}
                disabled={!user}
                className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white border-white/20"}
              >
                <Heart className={`w-4 h-4 ml-2 ${isLiked ? 'fill-current' : ''}`} />
                {currentStream.likes_count}
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-full lg:w-96 bg-black/90 backdrop-blur-sm border-t lg:border-t-0 lg:border-r border-white/10 flex flex-col max-h-[40vh] lg:max-h-none">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-cairo font-bold text-lg">الدردشة المباشرة</h2>
            <p className="text-white/60 text-sm">
              {comments.length} تعليق
            </p>
          </div>

          <ScrollArea className="flex-1 p-4">
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
                      <span className="text-white font-cairo font-semibold text-sm">
                        {comment.profiles?.full_name || 'مستخدم'}
                      </span>
                      <span className="text-white/50 text-xs">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm break-words">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/10">
            {user ? (
              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="اكتب تعليقاً..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  disabled={sending}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-cairo"
                />
                <Button 
                  onClick={handleSendComment}
                  disabled={!comment.trim() || sending}
                  size="icon"
                  className="bg-primary hover:bg-primary/80"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => navigate('/auth')}
              >
                سجل الدخول للتعليق
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewer;
