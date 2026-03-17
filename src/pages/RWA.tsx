import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Landmark, Home, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const RWA = () => {
  const { getContent, loading } = useAppContent();
  const { t, dir } = useLanguage();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">{t("جاري التحميل...")}</div>;
  }

  return (
    <>
      <Helmet>
        <title>MSR-RWA Real World Assets - {getContent('app_name', 'Crypto-MSR')}</title>
      </Helmet>
      
      <div className="min-h-screen" style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="min-h-screen bg-background/90">
          <main className="container mx-auto px-4 py-8" dir={dir}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Building className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {getContent('rwa_title', 'MSR-RWA Real World Assets')}
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground">
                  {getContent('rwa_description', t('استثمر في الأصول الحقيقية المرموزة من مصر'))}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      {getContent('real_estate_title', t('العقارات'))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {getContent('real_estate_content', t('استثمر في العقارات المصرية المرموزة'))}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-primary" />
                      {getContent('cultural_assets_title', t('التراث الثقافي'))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {getContent('cultural_assets_content', t('أصول تراثية وثقافية مصرية مرموزة'))}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      {getContent('commercial_title', t('التجاري'))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {getContent('commercial_content', t('المشاريع التجارية والصناعية'))}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{getContent('rwa_main_title', t('ما هو MSR-RWA؟'))}</CardTitle>
                    <Badge variant="outline">{t("قريباً")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {getContent('rwa_intro', 'MSR-RWA يتيح لك الاستثمار في الأصول الحقيقية المصرية من خلال التكنولوجيا البلوك تشين، مما يوفر فرص استثمارية آمنة ومربحة.')}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-card/50 p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">{t("كيف يعمل؟")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("يتم ترميز الأصول الحقيقية المصرية وتقسيمها إلى وحدات قابلة للتداول، مما يتيح للمستثمرين شراء حصص صغيرة من أصول كبيرة.", "Real Egyptian assets are tokenized and divided into tradable units, allowing investors to buy small shares of large assets.")}
                      </p>
                    </div>
                    
                    <div className="bg-card/50 p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">{t("الأمان والثقة")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("جميع الأصول محققة قانونياً ومدققة من قبل جهات خارجية مستقلة لضمان الشفافية والأمان.", "All assets are legally verified and audited by independent third parties for transparency and security.")}
                      </p>
                    </div>
                  </div>

                  <div className="text-center pt-6 space-y-4">
                    <p className="text-muted-foreground">
                      {getContent('rwa_status', t('المنصة قيد التطوير ويتم العمل على إطلاقها قريباً'))}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button disabled className="mr-2">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t("استكشف الأصول (قريباً)")}
                      </Button>
                      <Button variant="outline" disabled>
                        {t("ابدأ الاستثمار (قريباً)")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-primary/30">
                <CardContent className="text-center py-12">
                  <Building className="w-16 h-16 mx-auto mb-4 text-primary/60" />
                  <h3 className="text-xl font-semibold mb-2">{getContent('coming_soon_title', t('قريباً'))}</h3>
                  <p className="text-muted-foreground">
                    {getContent('coming_soon_description', t('نعمل على إطلاق MSR Stable Coin قريباً مع الشركاء المحليين'))}
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
