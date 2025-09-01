import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Landmark, Home, ExternalLink } from "lucide-react";

const RWA = () => {
  const { getContent, loading } = useAppContent();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>MSR-RWA Real World Assets - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content="استثمر في الأصول الحقيقية المرموزة من مصر" />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                {getContent('rwa_title', 'MSR-RWA Real World Assets')}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {getContent('rwa_description', 'استثمر في الأصول الحقيقية المرموزة من مصر')}
            </p>
          </div>

          {/* Asset Types Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  {getContent('real_estate_title', 'العقارات')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {getContent('real_estate_content', 'استثمر في العقارات المصرية المرموزة')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-primary" />
                  {getContent('cultural_assets_title', 'التراث الثقافي')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {getContent('cultural_assets_content', 'أصول تراثية وثقافية مصرية مرموزة')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  {getContent('commercial_title', 'التجاري')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {getContent('commercial_content', 'المشاريع التجارية والصناعية')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {getContent('rwa_main_title', 'ما هو MSR-RWA؟')}
                </CardTitle>
                <Badge variant="outline">قريباً</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {getContent('rwa_intro', 'MSR-RWA يتيح لك الاستثمار في الأصول الحقيقية المصرية من خلال التكنولوجيا البلوك تشين، مما يوفر فرص استثمارية آمنة ومربحة.')}
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-3">الفوائد الرئيسية:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ملكية جزئية للأصول الحقيقية المصرية</li>
                  <li>• شفافية كاملة في قيم الأصول</li>
                  <li>• سيولة عالية مقارنة بالاستثمار التقليدي</li>
                  <li>• عوائد منتظمة من الأصول</li>
                  <li>• حماية من التضخم</li>
                  <li>• دعم التنمية الاقتصادية المحلية</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">كيف يعمل؟</h4>
                  <p className="text-sm text-muted-foreground">
                    يتم ترميز الأصول الحقيقية المصرية وتقسيمها إلى وحدات قابلة للتداول، مما يتيح للمستثمرين شراء حصص صغيرة من أصول كبيرة.
                  </p>
                </div>
                
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">الأمان والثقة</h4>
                  <p className="text-sm text-muted-foreground">
                    جميع الأصول محققة قانونياً ومدققة من قبل جهات خارجية مستقلة لضمان الشفافية والأمان.
                  </p>
                </div>
              </div>

              <div className="text-center pt-6">
                <Button disabled className="mr-2">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  استكشف الأصول (قريباً)
                </Button>
                <Button variant="outline" disabled>
                  ابدأ الاستثمار (قريباً)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Section */}
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="text-center py-12">
              <Building className="w-16 h-16 mx-auto mb-4 text-primary/60" />
              <h3 className="text-xl font-semibold mb-2">
                {getContent('coming_soon_title', 'قريباً')}
              </h3>
              <p className="text-muted-foreground">
                {getContent('coming_soon_description', 'نعمل على إطلاق منصة MSR-RWA مع شركاء عقاريين وقانونيين موثوقين')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default RWA;