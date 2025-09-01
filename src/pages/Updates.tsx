import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ExternalLink } from "lucide-react";

const Updates = () => {
  const { getContent, loading } = useAppContent();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>آخر التحديثات | Updates - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content="تابع آخر التحديثات والإعلانات في منصة Crypto-MSR" />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {getContent('update_1_title', 'تحديث المنصة v2.0')}
                  </CardTitle>
                  <Badge variant="secondary">جديد</Badge>
                </div>
                <CardDescription>
                  {getContent('update_1_date', '1 سبتمبر 2025')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {getContent('update_1_content', 'تم إطلاق التحديث الجديد للمنصة مع تحسينات في الأداء وواجهة المستخدم الجديدة.')}
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">اقرأ المزيد</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {getContent('update_2_title', 'إضافة ميزات جديدة للتعدين')}
                </CardTitle>
                <CardDescription>
                  {getContent('update_2_date', '25 أغسطس 2025')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {getContent('update_2_content', 'تحسينات جديدة على نظام التعدين مع إضافة مؤشرات أداء محسّنة.')}
                </p>
              </CardContent>
            </Card>

            {/* Coming Soon Section */}
            <Card className="border-dashed border-2 border-primary/30">
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