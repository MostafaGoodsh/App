import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Users, MessageCircle, Send, Star, Award, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CalloutPersonality {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  is_featured: boolean;
  display_order: number;
}

const CallOut = () => {
  const { getContent, loading } = useAppContent();
  const [personalities, setPersonalities] = useState<CalloutPersonality[]>([]);
  const [personalitiesLoading, setPersonalitiesLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalities = async () => {
      try {
        const { data, error } = await supabase
          .from('callout_personalities')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setPersonalities(data || []);
      } catch (error) {
        console.error('Error fetching personalities:', error);
      } finally {
        setPersonalitiesLoading(false);
      }
    };

    fetchPersonalities();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scientist':
        return <Award className="w-5 h-5" />;
      case 'artist':
        return <Sparkles className="w-5 h-5" />;
      case 'intellectual':
        return <Users className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scientist':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'artist':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'intellectual':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (loading || personalitiesLoading) {
    return <div className="flex justify-center items-center min-h-screen arabic-text">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>قائمة الاستدعاء الشرفية - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content="قائمة استدعاء شرفية للشخصيات العامة المصرية والعربية المتسقة مع قيم وأهداف المنصة" />
      </Helmet>
      
      <main className="container mx-auto px-4 py-8 arabic-content">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Megaphone className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold arabic-text">
                Call out | استدعاء شرفي 
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3
              العقيدة و الأخلاق هي نقطة تميزنا و تفردنا ، لذلك انشأنا هذا القسم خصيصا لارسال دعوات استدعاء شرفي لكل انسان مؤثر حول العالم و كل من يتبني و يخدم عقيدتنا و أهدافنا ،،، سعدنا بوضعك في قائمة الاستدعاء الشرفيه و يثرينا قبولك.
            Faith and morals are our point of distinction and uniqueness, so we created this section specifically to send invitations for honorary summons to every influential person around the world and everyone who adopts and serves our faith and goals. We are happy to have you on the honorary summons list and we are honored by your acceptance.
            </p>
          </div>

          {/* Honor Personalities Grid */}
          {personalities.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 arabic-text flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                الشخصيات المكرمة
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalities.map((personality) => (
                  <Card key={personality.id} className="personality-card overflow-hidden">
                    <div className="relative">
                      {personality.image_url && (
                        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <img 
                            src={personality.image_url} 
                            alt={personality.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                          />
                        </div>
                      )}
                      {personality.is_featured && (
                        <Badge className="absolute top-2 right-2 bg-primary/90">
                          <Star className="w-3 h-3 mr-1" />
                          مميز
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getCategoryColor(personality.category)}>
                          {getCategoryIcon(personality.category)}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 arabic-text">{personality.name}</h3>
                      
                      {personality.title && (
                        <p className="text-primary font-medium mb-3 arabic-text">{personality.title}</p>
                      )}
                      
                      {personality.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed arabic-text">
                          {personality.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Community Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="text-center pt-6">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground arabic-text">أعضاء المجتمع</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center pt-6">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">3,856</div>
                <p className="text-sm text-muted-foreground arabic-text">الرسائل والمقترحات</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center pt-6">
                <Megaphone className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{personalities.length}</div>
                <p className="text-sm text-muted-foreground arabic-text">الشخصيات المكرمة</p>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="arabic-text">
                {getContent('feedback_title', 'شارك رأيك وأفكارك')}
              </CardTitle>
              <CardDescription className="arabic-text">
                {getContent('feedback_description', 'نحن نقدر ملاحظاتك ومقترحاتك لتحسين المنصة')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium arabic-text">الاسم</label>
                  <Input placeholder="اسمك الكامل" className="arabic-text" />
                </div>
                <div>
                  <label className="text-sm font-medium arabic-text">البريد الإلكتروني</label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium arabic-text">عنوان المقترح</label>
                <Input placeholder="عنوان مقترحك أو فكرتك" className="arabic-text" />
              </div>
              
              <div>
                <label className="text-sm font-medium arabic-text">التفاصيل</label>
                <Textarea 
                  placeholder="اكتب تفاصيل مقترحك أو ملاحظاتك هنا..."
                  rows={5}
                  className="arabic-text"
                />
              </div>

              <Button className="w-full md:w-auto">
                <Send className="w-4 h-4 mr-2" />
                <span className="arabic-text">إرسال المقترح</span>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Suggestions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="arabic-text">
                {getContent('recent_suggestions_title', 'المقترحات الحديثة')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium arabic-text">تحسين واجهة التعدين</h4>
                  <Badge variant="secondary">قيد المراجعة</Badge>
                </div>
                <p className="text-sm text-muted-foreground arabic-text">
                  اقتراح بإضافة مؤشرات أكثر تفصيلاً لعملية التعدين...
                </p>
                <p className="text-xs text-muted-foreground mt-2 arabic-text">أحمد محمد - منذ 3 أيام</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium arabic-text">دعم اللغة الإنجليزية</h4>
                  <Badge variant="default">تم التنفيذ</Badge>
                </div>
                <p className="text-sm text-muted-foreground arabic-text">
                  إضافة خيار تبديل اللغة بين العربية والإنجليزية...
                </p>
                <p className="text-xs text-muted-foreground mt-2 arabic-text">سارة علي - منذ أسبوع</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium arabic-text">تطبيق الهاتف المحمول</h4>
                  <Badge variant="outline">تحت الدراسة</Badge>
                </div>
                <p className="text-sm text-muted-foreground arabic-text">
                  اقتراح بتطوير تطبيق للهاتف المحمول للمنصة...
                </p>
                <p className="text-xs text-muted-foreground mt-2 arabic-text">محمد حسن - منذ أسبوعين</p>
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="border-dashed border-2 border-primary/30">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-center arabic-text">
                {getContent('community_guidelines_title', 'إرشادات المجتمع')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground arabic-text">
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