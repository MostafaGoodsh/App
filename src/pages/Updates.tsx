import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpdateItem {
  id: string;
  content_key: string;
  text_content: string;
  position_order: number;
  created_at: string;
  is_active: boolean;
}

const Updates = () => {
  const { getContent, loading: contentLoading } = useAppContent();
  const { t, dir } = useLanguage();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dateLocale = dir === 'rtl' ? 'ar-EG' : 'en-US';

  useEffect(() => { fetchUpdates(); }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase.from('app_content').select('*').eq('content_type', 'updates_content').eq('is_active', true).order('position_order', { ascending: false });
      if (error) throw error;
      setUpdates(data || []);
    } catch (error) { console.error('Error fetching updates:', error); }
    finally { setLoading(false); }
  };

  if (loading || contentLoading) {
    return <div className="flex justify-center items-center min-h-screen">{t("جاري التحميل...")}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{t("آخر التحديثات")} | Updates - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content={t("تابع آخر الأخبار والتحديثات في منصة Crypto-MSR")} />
      </Helmet>
      
      <div className="min-h-screen" style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="min-h-screen bg-background/90">
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Bell className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {getContent('updates_title', t('آخر التحديثات'))}
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground">
                  {getContent('updates_description', t('تابع آخر الأخبار والتحديثات في منصة Crypto-MSR'))}
                </p>
              </div>

              <div className="space-y-6">
                {updates.length > 0 ? (
                  updates.map((update, index) => (
                    <Card key={update.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <span>{update.content_key.includes('title') ? update.text_content : t('تحديث جديد')}</span>
                          </CardTitle>
                          {index === 0 && <Badge variant="secondary">{t("جديد")}</Badge>}
                        </div>
                        <CardDescription>
                          {new Date(update.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 leading-relaxed">{update.text_content}</p>
                        <div className="flex items-center gap-2 text-primary">
                          <span className="text-sm">{t("اقرأ المزيد")}</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-dashed border-2 border-primary/30">
                    <CardContent className="text-center py-12">
                      <Bell className="w-16 h-16 mx-auto mb-4 text-primary/60" />
                      <h3 className="text-xl font-semibold mb-2">{t("لا توجد تحديثات حالياً")}</h3>
                      <p className="text-muted-foreground">{t("سيتم إضافة التحديثات هنا عند توفرها")}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-dashed border-2 border-primary/30">
                  <CardContent className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-primary/60" />
                    <h3 className="text-xl font-semibold mb-2">
                      {getContent('coming_soon_title', t('المزيد من التحديثات قريباً'))}
                    </h3>
                    <p className="text-muted-foreground">
                      {getContent('coming_soon_description', t('نعمل باستمرار على تطوير المنصة وإضافة ميزات جديدة'))}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Updates;
