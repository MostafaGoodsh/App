import { useState, useEffect } from "react";
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

  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/live-streams')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للبثوث
        </Button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Video Area */}
          <div>
            <Card className="overflow-hidden mb-4">
              <div className="relative aspect-video bg-black">
                {currentStream.thumbnail_url ? (
                  <img 
                    src={currentStream.thumbnail_url} 
                    alt={currentStream.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-24 h-24 opacity-50 text-white" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white animate-pulse text-lg px-4 py-2">
                    ● مباشر
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Badge className="bg-black/60 backdrop-blur-sm text-white text-lg px-4 py-2">
                    <Users className="w-5 h-5 ml-2" />
                    {currentStream.viewer_count} مشاهد
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Stream Info */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl lg:text-3xl font-cairo font-bold mb-4">
                  {currentStream.title}
                </h1>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={currentStream.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {currentStream.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-cairo font-semibold">
                        {currentStream.profiles?.full_name || 'مستخدم'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        بدأ منذ {formatDistanceToNow(new Date(currentStream.started_at), { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </p>
                    </div>
                  </div>

                  {user && user.id !== currentStream.user_id && (
                    <Button 
                      variant={isFollowing ? "secondary" : "default"}
                      onClick={() => toggleFollow(currentStream.user_id)}
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

                {currentStream.description && (
                  <p className="text-muted-foreground mb-4">
                    {currentStream.description}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={() => streamId && toggleLike(streamId)}
                    disabled={!user}
                  >
                    <Heart className={`w-4 h-4 ml-2 ${isLiked ? 'fill-current' : ''}`} />
                    {currentStream.likes_count} إعجاب
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <Card className="lg:h-[calc(100vh-120px)] flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-cairo font-bold text-lg">الدردشة المباشرة</h2>
              <p className="text-sm text-muted-foreground">
                {comments.length} تعليق
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {comment.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-cairo font-semibold text-sm">
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
            </ScrollArea>

            <Separator />

            <div className="p-4">
              {user ? (
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="اكتب تعليقاً..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                    disabled={sending}
                    className="font-cairo"
                  />
                  <Button 
                    onClick={handleSendComment}
                    disabled={!comment.trim() || sending}
                    size="icon"
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewer;
