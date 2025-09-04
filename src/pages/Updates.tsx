import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('app_content')
        .select('*')
        .eq('content_type', 'text')
        .eq('is_active', true)
        .like('content_key', '%update_%')
        .not('content_key', 'in', '("updates_title","updates_description")')
        .order('position_order', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || contentLoading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>آخر التحديثات | Updates - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content="تابع آخر التحديثات والإعلانات في منصة Crypto-MSR" />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8 arabic-text">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bell className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                {getContent('updates_title', 'آخر التحديثات | Latest Updates')}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {getContent('updates_description', 'تابع آخر الأخبار والتحديثات في منصة Crypto-MSR')}
            </p>
          </div>

          {/* Updates Content */}
          <div className="space-y-6">
            {updates.length > 0 ? (
              updates.map((update, index) => (
                <Card key={update.id} className="arabic-content">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 arabic-content">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-right">
                          {update.content_key.includes('title') ? update.text_content : 'تحديث جديد'}
                        </span>
                      </CardTitle>
                      {index === 0 && <Badge variant="secondary">جديد</Badge>}
                    </div>
                    <CardDescription className="text-right arabic-content">
                      {new Date(update.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="arabic-content">
                    <p className="text-muted-foreground mb-4 text-right leading-relaxed">
                      {update.text_content}
                    </p>
                    <div className="flex items-center gap-2 text-primary justify-end">
                      <span className="text-sm">اقرأ المزيد</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 border-primary/30 arabic-content">
                <CardContent className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-primary/60" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد تحديثات حالياً</h3>
                  <p className="text-muted-foreground">سيتم إضافة التحديثات هنا عند توفرها</p>
                </CardContent>
              </Card>
            )}

            {/* Coming Soon Section */}
            <Card className="border-dashed border-2 border-primary/30 arabic-content">
              <CardContent className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-primary/60" />
                <h3 className="text-xl font-semibold mb-2">
                  {getContent('coming_soon_title', 'المزيد من التحديثات قريباً')}
                </h3>
                <p className="text-muted-foreground">
                  {getContent('coming_soon_description', 'نعمل باستمرار على تطوير المنصة وإضافة ميزات جديدة')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default Updates;