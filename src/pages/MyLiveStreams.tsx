import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS, ru } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  status: string;
  viewer_count: number;
  total_views: number;
  likes_count: number;
  started_at: string;
  ended_at: string | null;
}

export default function MyLiveStreams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  const dateLocale = language === "ru" ? ru : (language === "ar" || language === "both") ? ar : enUS;

  const fetchMyStreams = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('live_streams').select('*').eq('user_id', user.id).order('started_at', { ascending: false });
      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error(t("فشل تحميل البثوث"));
    } finally { setLoading(false); }
  };

  const deleteStream = async (streamId: string) => {
    try {
      const { error } = await supabase.from('live_streams').delete().eq('id', streamId);
      if (error) throw error;
      setStreams(streams.filter(s => s.id !== streamId));
      toast.success(t("تم حذف البث"));
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast.error(t("فشل حذف البث"));
    }
  };

  useEffect(() => { fetchMyStreams(); }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-6" dir={dir}>
        <Card><CardContent className="p-6"><p className="text-center">{t("يجب تسجيل الدخول لعرض بثوثك")}</p></CardContent></Card>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('نشط');
      case 'ended': return t('منتهي');
      default: return t('محذوف');
    }
  };

  return (
    <div className="container mx-auto p-6" dir={dir}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("بثوثي المباشرة")}</h1>
        <Button onClick={() => navigate('/live-stream')}>{t("بدء بث جديد")}</Button>
      </div>

      {loading ? (
        <div className="text-center">{t("جاري التحميل...")}</div>
      ) : streams.length === 0 ? (
        <Card><CardContent className="p-6"><p className="text-center text-muted-foreground">{t("لا يوجد بثوث حتى الآن")}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {streams.map((stream) => (
            <Card key={stream.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{stream.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{stream.description}</p>
                  </div>
                  <Badge variant={stream.status === 'active' ? 'default' : stream.status === 'ended' ? 'secondary' : 'destructive'}>
                    {getStatusLabel(stream.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1"><Eye className="h-4 w-4" /><span>{t("إجمالي المشاهدات:")} {stream.total_views}</span></div>
                  <div>{t("المشاهدون الحاليون:")} {stream.viewer_count}</div>
                  <div>{t("الإعجابات:")} {stream.likes_count}</div>
                  <div>{t("بدأ")} {formatDistanceToNow(new Date(stream.started_at), { addSuffix: true, locale: dateLocale })}</div>
                  {stream.ended_at && <div>{t("انتهى")} {formatDistanceToNow(new Date(stream.ended_at), { addSuffix: true, locale: dateLocale })}</div>}
                </div>
                <div className="flex gap-2">
                  {stream.status === 'active' && <Button onClick={() => navigate(`/live-stream/watch/${stream.id}`)} size="sm">{t("مشاهدة البث")}</Button>}
                  <Button onClick={() => deleteStream(stream.id)} variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" />{t("حذف")}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
