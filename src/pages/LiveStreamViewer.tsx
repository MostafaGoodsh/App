import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Video, Users, Heart, Send, ArrowLeft, UserPlus, UserCheck, MessageCircle, Gift, X } from "lucide-react";
import { useLiveStream } from "@/hooks/useLiveStream";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { WebRTCViewer } from "@/utils/webrtc";
import { useToast } from "@/hooks/use-toast";

const LiveStreamViewer = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [showComments, setShowComments] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<WebRTCViewer | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = async () => {
    if (!comment.trim() || !streamId) return;
    
    setSending(true);
    await addComment(streamId, comment);
    setComment("");
    setSending(false);
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للمتابعة",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentStream) return;
    
    setFollowLoading(true);
    try {
      await toggleFollow(currentStream.user_id);
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (!currentStream) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-full h-full" />
          <p className="text-white/60 mt-4 font-cairo">جاري تحميل البث...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Container - Full Screen */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
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

        {/* Waiting for stream overlay */}
        {!hasRemoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <Video className="w-20 h-20 opacity-30 text-white mb-4 animate-pulse" />
            <p className="text-white/80 font-cairo text-lg">في انتظار اتصال البث...</p>
          </div>
        )}

        {/* Play button overlay */}
        {hasRemoteStream && !isVideoPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <Button
              variant="outline"
              size="lg"
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

        {/* Top Bar - Header with back button and stats */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/live-streams')}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 text-white animate-pulse px-3 py-1 rounded-full">
              ● مباشر
            </Badge>
            <Badge className="bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full">
              <Users className="w-4 h-4 ml-1" />
              {currentStream.viewer_count || 0}
            </Badge>
          </div>
        </div>

        {/* Comments Overlay - Left side like TikTok */}
        {showComments && (
          <div className="absolute left-0 bottom-32 w-[70%] max-w-[350px] max-h-[50%] p-4 overflow-hidden">
            <div className="space-y-3 overflow-y-auto max-h-full scrollbar-hide">
              {comments.slice(-15).map((comment) => (
                <div 
                  key={comment.id} 
                  className="flex items-start gap-2 bg-black/30 backdrop-blur-sm rounded-xl p-2 pr-3 animate-fade-in"
                >
                  <Avatar className="w-8 h-8 shrink-0 border border-white/20">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/50 text-white text-xs">
                      {comment.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-white/80 font-cairo font-semibold text-sm block">
                      {comment.profiles?.full_name || 'مستخدم'}
                    </span>
                    <p className="text-white text-sm break-words leading-relaxed">{comment.comment}</p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          </div>
        )}

        {/* Toggle Comments Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowComments(!showComments)}
          className="absolute left-4 bottom-[calc(8rem+55%)] text-white/70 hover:text-white hover:bg-white/10 rounded-full"
        >
          {showComments ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </Button>

        {/* Right Side Actions - Like and Gift */}
        <div className="absolute right-4 bottom-36 flex flex-col items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => streamId && toggleLike(streamId)}
            disabled={!user}
            className={`rounded-full w-12 h-12 ${isLiked ? 'text-red-500 bg-red-500/20' : 'text-white bg-black/30'} hover:scale-110 transition-transform`}
          >
            <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-white text-sm font-bold">{currentStream.likes_count || 0}</span>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 text-white bg-black/30 hover:scale-110 transition-transform"
          >
            <Gift className="w-7 h-7" />
          </Button>
          <span className="text-white text-xs">هدية</span>
        </div>
      </div>

      {/* Bottom Bar - Broadcaster info & Comment input */}
      <div className="bg-gradient-to-t from-black via-black/95 to-transparent p-4 pb-6 space-y-4">
        {/* Broadcaster Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary ring-2 ring-primary/30">
            <AvatarImage src={currentStream.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-white text-lg">
              {currentStream.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-cairo font-bold text-lg truncate">
              {currentStream.profiles?.full_name || 'مستخدم'}
            </h3>
            <p className="text-white/60 text-sm truncate">
              {currentStream.title}
            </p>
          </div>
          
          {user && user.id !== currentStream.user_id && (
            <Button 
              size="sm"
              variant={isFollowing ? "secondary" : "default"}
              onClick={handleFollow}
              disabled={followLoading}
              className={`rounded-full px-5 ${isFollowing ? 'bg-white/20 text-white' : 'bg-primary text-white'}`}
            >
              {followLoading ? (
                <span className="animate-spin">⏳</span>
              ) : isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 ml-1" />
                  متابَع
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 ml-1" />
                  متابعة
                </>
              )}
            </Button>
          )}
        </div>

        {/* Comment Input */}
        <div className="flex gap-2">
          {user ? (
            <>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تعليقاً..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                disabled={sending}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 font-cairo rounded-full px-5"
              />
              <Button 
                onClick={handleSendComment}
                disabled={!comment.trim() || sending}
                size="icon"
                className="bg-primary hover:bg-primary/80 rounded-full shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Button 
              className="w-full rounded-full" 
              onClick={() => navigate('/auth')}
            >
              سجل الدخول للتعليق
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewer;
