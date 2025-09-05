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
      
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <main className="container mx-auto px-4 py-8 arabic-content">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold arabic-text">
                {getContent('rwa_title', 'MSR-RWA Real World Assets')}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground arabic-text">
              {getContent('rwa_description', 'استثمر في الأصول الحقيقية المرموزة من مصر')}
            </p>
          </div>

          {/* Asset Types Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Home className="w-5 h-5 text-primary" />
                  {getContent('real_estate_title', 'العقارات')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm arabic-text">
                  {getContent('real_estate_content', 'استثمر في العقارات المصرية المرموزة')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Landmark className="w-5 h-5 text-primary" />
                  {getContent('cultural_assets_title', 'التراث الثقافي')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm arabic-text">
                  {getContent('cultural_assets_content', 'أصول تراثية وثقافية مصرية مرموزة')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Building className="w-5 h-5 text-primary" />
                  {getContent('commercial_title', 'التجاري')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm arabic-text">
                  {getContent('commercial_content', 'المشاريع التجارية والصناعية')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="arabic-text">
                  {getContent('rwa_main_title', 'ما هو MSR-RWA؟')}
                </CardTitle>
                <Badge variant="outline">قريباً</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground arabic-text">
                {getContent('rwa_intro', 'MSR-RWA يتيح لك الاستثمار في الأصول الحقيقية المصرية من خلال التكنولوجيا البلوك تشين، مما يوفر فرص استثمارية آمنة ومربحة.')}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2 arabic-text">كيف يعمل؟</h4>
                  <p className="text-sm text-muted-foreground arabic-text">
                    يتم ترميز الأصول الحقيقية المصرية وتقسيمها إلى وحدات قابلة للتداول، مما يتيح للمستثمرين شراء حصص صغيرة من أصول كبيرة.
                  </p>
                </div>
                
                <div className="bg-card/50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2 arabic-text">الأمان والثقة</h4>
                  <p className="text-sm text-muted-foreground arabic-text">
                    جميع الأصول محققة قانونياً ومدققة من قبل جهات خارجية مستقلة لضمان الشفافية والأمان.
                  </p>
                </div>
              </div>

              <div className="text-center pt-6 space-y-4">
                <p className="text-muted-foreground arabic-text">
                  {getContent('rwa_status', 'المنصة قيد التطوير ويتم العمل على إطلاقها قريباً')}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button disabled className="mr-2">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    استكشف الأصول (قريباً)
                  </Button>
                  <Button variant="outline" disabled>
                    ابدأ الاستثمار (قريباً)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Section */}
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="text-center py-12">
              <Building className="w-16 h-16 mx-auto mb-4 text-primary/60" />
              <h3 className="text-xl font-semibold mb-2 arabic-text">
                {getContent('coming_soon_title', 'قريباً')}
              </h3>
              <p className="text-muted-foreground arabic-text">
                {getContent('coming_soon_description', 'نعمل على إطلاق منصة MSR-RWA مع شركاء عقاريين وقانونيين موثوقين')}
              </p>
            </CardContent>
          </Card>
        </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default RWA;