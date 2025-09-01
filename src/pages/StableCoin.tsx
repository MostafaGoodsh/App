import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Shield, ExternalLink } from "lucide-react";

const StableCoin = () => {
  const { getContent, loading } = useAppContent();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>MSR Stable Coin - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content="تعرف على عملة MSR الثابتة المدعومة بالأصول المصرية" />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coins className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                {getContent('stable_coin_title', 'MSR Stable Coin')}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {getContent('stable_coin_description', 'العملة المستقرة المدعومة بالأصول المصرية')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {getContent('stability_title', 'الاستقرار والثبات')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {getContent('stability_content', 'عملة مستقرة مدعومة بالأصول الحقيقية في مصر لضمان الثبات والأمان')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {getContent('growth_title', 'النمو المستدام')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {getContent('growth_content', 'نموذج اقتصادي مبتكر يدعم النمو المستدام للاقتصاد المحلي')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {getContent('msr_coin_title', 'ما هو MSR Stable Coin؟')}
                </CardTitle>
                <Badge variant="outline">قريباً</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {getContent('msr_coin_intro', 'MSR Stable Coin هو عملة رقمية مستقرة مدعومة بالأصول الحقيقية في مصر، مصممة لتوفير الاستقرار والثقة في النظام المالي الرقمي.')}
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-3">الميزات الرئيسية:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• مدعوم بأصول حقيقية في مصر</li>
                  <li>• استقرار في القيمة مقابل الجنيه المصري</li>
                  <li>• شفافية كاملة في الاحتياطيات</li>
                  <li>• سهولة في التحويل والاستخدام</li>
                  <li>• دعم للاقتصاد المحلي المصري</li>
                </ul>
              </div>

              <div className="text-center pt-6">
                <Button disabled className="mr-2">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  الورقة البيضاء (قريباً)
                </Button>
                <Button variant="outline" disabled>
                  احصل على MSR (قريباً)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Section */}
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="text-center py-12">
              <Coins className="w-16 h-16 mx-auto mb-4 text-primary/60" />
              <h3 className="text-xl font-semibold mb-2">
                {getContent('coming_soon_title', 'قريباً')}
              </h3>
              <p className="text-muted-foreground">
                {getContent('coming_soon_description', 'نعمل على إطلاق MSR Stable Coin قريباً مع الشركاء المحليين')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default StableCoin;