import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Users, MessageCircle, Send } from "lucide-react";

const CallOut = () => {
  const { getContent, loading } = useAppContent();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Call Out - انضم للمجتمع - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content="انضم إلى مجتمع Crypto-MSR وشارك أفكارك ومقترحاتك" />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Megaphone className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                {getContent('call_out_title', 'Call Out - انضم للمجتمع')}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {getContent('call_out_description', 'شارك أفكارك ومقترحاتك لتطوير منصة Crypto-MSR')}
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="text-center pt-6">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">أعضاء المجتمع</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center pt-6">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">3,856</div>
                <p className="text-sm text-muted-foreground">الرسائل والمقترحات</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center pt-6">
                <Megaphone className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">127</div>
                <p className="text-sm text-muted-foreground">المبادرات المنفذة</p>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {getContent('feedback_title', 'شارك رأيك وأفكارك')}
              </CardTitle>
              <CardDescription>
                {getContent('feedback_description', 'نحن نقدر ملاحظاتك ومقترحاتك لتحسين المنصة')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">الاسم</label>
                  <Input placeholder="اسمك الكامل" />
                </div>
                <div>
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">عنوان المقترح</label>
                <Input placeholder="عنوان مقترحك أو فكرتك" />
              </div>
              
              <div>
                <label className="text-sm font-medium">التفاصيل</label>
                <Textarea 
                  placeholder="اكتب تفاصيل مقترحك أو ملاحظاتك هنا..."
                  rows={5}
                />
              </div>

              <Button className="w-full md:w-auto">
                <Send className="w-4 h-4 mr-2" />
                إرسال المقترح
              </Button>
            </CardContent>
          </Card>

          {/* Recent Suggestions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {getContent('recent_suggestions_title', 'المقترحات الحديثة')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">تحسين واجهة التعدين</h4>
                  <Badge variant="secondary">قيد المراجعة</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  اقتراح بإضافة مؤشرات أكثر تفصيلاً لعملية التعدين...
                </p>
                <p className="text-xs text-muted-foreground mt-2">أحمد محمد - منذ 3 أيام</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">دعم اللغة الإنجليزية</h4>
                  <Badge variant="default">تم التنفيذ</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  إضافة خيار تبديل اللغة بين العربية والإنجليزية...
                </p>
                <p className="text-xs text-muted-foreground mt-2">سارة علي - منذ أسبوع</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">تطبيق الهاتف المحمول</h4>
                  <Badge variant="outline">تحت الدراسة</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  اقتراح بتطوير تطبيق للهاتف المحمول للمنصة...
                </p>
                <p className="text-xs text-muted-foreground mt-2">محمد حسن - منذ أسبوعين</p>
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-center">
                {getContent('community_guidelines_title', 'إرشادات المجتمع')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• كن محترماً ومهذباً في تعاملك مع الآخرين</li>
                <li>• اكتب مقترحات واضحة ومفصلة</li>
                <li>• تجنب المحتوى المسيء أو غير المناسب</li>
                <li>• شارك أفكاراً بناءة لتطوير المنصة</li>
                <li>• كن صبوراً في انتظار الردود والتحديثات</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default CallOut;