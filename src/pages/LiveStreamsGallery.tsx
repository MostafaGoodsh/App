import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Users, Eye, Heart } from "lucide-react";
import { useLiveStream } from "@/hooks/useLiveStream";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

const LiveStreamsGallery = () => {
  const { activeStreams, loading } = useLiveStream();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  if (loading) {
    return (
      <div className="container mx-auto p-6" dir={dir}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="aspect-video mb-4" /><Skeleton className="h-6 mb-2" /><Skeleton className="h-4" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeStreams.length === 0) {
    return (
      <div className="container mx-auto p-6" dir={dir}>
        <Card className="p-12">
          <div className="text-center">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">{t("لا توجد بثوث نشطة حالياً")}</h2>
            <p className="text-muted-foreground mb-6">{t("تابع المؤثرين المفضلين لديك لتلقي إشعار عند بدء البث")}</p>
            <Button onClick={() => navigate('/live-stream')}>
              <Video className="w-4 h-4 ml-2" />{t("ابدأ بثك الخاص")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir={dir}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("البثوث المباشرة")}</h1>
            <p className="text-muted-foreground">{activeStreams.length} {t("بث نشط الآن")}</p>
          </div>
          <Button onClick={() => navigate('/live-stream')}>
            <Video className="w-4 h-4 ml-2" />{t("ابدأ البث")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeStreams.map((stream) => (
          <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/live-stream/watch/${stream.id}`)}>
            <div className="relative aspect-video bg-black">
              {stream.thumbnail_url ? (
                <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Video className="w-16 h-16 opacity-50 text-white" /></div>
              )}
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-500 text-white animate-pulse">{t("● مباشر")}</Badge>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <Badge className="bg-black/60 backdrop-blur-sm text-white"><Users className="w-3 h-3 ml-1" />{stream.viewer_count}</Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={stream.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{stream.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground">{stream.profiles?.full_name || t('مستخدم')}</p>
                </div>
              </div>
              {stream.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{stream.description}</p>}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>{stream.viewer_count} {t("مشاهد")}</span></div>
                <div className="flex items-center gap-1"><Heart className="w-4 h-4" /><span>{stream.likes_count} {t("إعجاب")}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveStreamsGallery;
