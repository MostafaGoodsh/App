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
  contact_link: string;
  contact_button_text: string;
}

interface CalloutCardContent {
  id: string;
  title: string;
  description: string;
  fixed_image_url: string;
  contact_button_text: string;
  contact_link: string;
}

const CallOut = () => {
  const { getContent, loading } = useAppContent();
  const [personalities, setPersonalities] = useState<CalloutPersonality[]>([]);
  const [personalitiesLoading, setPersonalitiesLoading] = useState(true);
  const [cardContent, setCardContent] = useState<CalloutCardContent | null>(null);
  const [activeCallout, setActiveCallout] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch personalities for archive
        const { data: personalitiesData, error: personalitiesError } = await supabase
          .from('callout_personalities')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (personalitiesError) throw personalitiesError;
        setPersonalities(personalitiesData || []);
        
        // Fetch active callout
        const { data: activeCalloutData, error: activeCalloutError } = await supabase
          .from('active_callouts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (activeCalloutError && activeCalloutError.code !== 'PGRST116') {
          throw activeCalloutError;
        }
        setActiveCallout(activeCalloutData);
        
        // Fetch card content
        const { data: cardData, error: cardError } = await supabase
          .from('callout_card_content')
          .select('*')
          .eq('is_active', true)
          .single();
        
        if (cardError) throw cardError;
        setCardContent(cardData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setPersonalitiesLoading(false);
      }
    };

    fetchData();
    
    // إعداد تحديث دوري للبيانات كل 30 ثانية
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
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

  if (loading || personalitiesLoading || !cardContent) {
    return <div className="flex justify-center items-center min-h-screen arabic-text">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{cardContent.title} - {getContent('app_name', 'Crypto-MSR')}</title>
        <meta name="description" content="قائمة استدعاء شرفية للشخصيات العامة المصرية والعربية المتسقة مع قيم وأهداف المنصة" />
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
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 arabic-content">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6">
            {/* العنوان */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold arabic-text">
                {cardContent.title}
              </h1>
            </div>
            
            {/* المقدمة التعريفية تحت العنوان مباشرة */}
            <div className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-full mx-auto arabic-text mb-6 px-2 sm:px-4">
              <p className="whitespace-pre-wrap leading-relaxed">
                {activeCallout?.callout_text || cardContent?.description || 'العقيدة و الأخلاق هي نقطة تميزنا و تفردنا'}
              </p>
            </div>
            
            {/* الدوائر */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mb-6">
              {/* الدائرة اليمنى - صورة الاستدعاء النشط */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 sm:border-3 border-primary/30 flex items-center justify-center overflow-hidden shadow-lg">
                  {activeCallout?.personality_image_url ? (
                    <img 
                      src={activeCallout.personality_image_url} 
                      alt={activeCallout.personality_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-full">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary/60" />
                    </div>
                  )}
                </div>
                {activeCallout?.personality_name && (
                  <p className="mt-1.5 text-xs sm:text-sm font-medium arabic-text text-center max-w-[80px] sm:max-w-[100px] truncate">
                    {activeCallout.personality_name}
                  </p>
                )}
              </div>
              
              {/* الدائرة اليسرى - الصورة الثابتة (أكبر) */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 border-3 sm:border-4 border-secondary/30 flex items-center justify-center overflow-hidden shadow-xl">
                  {cardContent.fixed_image_url ? (
                    <img 
                      src={cardContent.fixed_image_url} 
                      alt="شعار التكريم"
                      className="w-3/4 h-3/4 object-contain rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-full">
                      <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-secondary/60" />
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm md:text-base font-medium arabic-text text-center max-w-[100px] sm:max-w-[140px]">
                  شعار التكريم
                </p>
              </div>
            </div>
            
            {/* منطقة وصف الشخصية والمحتوى الإضافي */}
            {activeCallout && (
              <Card className="mb-6 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 px-3 sm:px-6">
                  <CardTitle className="arabic-text text-base sm:text-lg md:text-xl text-center">
                    {activeCallout.personality_title && `${activeCallout.personality_name} - ${activeCallout.personality_title}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  {activeCallout.personality_description && (
                    <div className="arabic-text text-center mb-4">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {activeCallout.personality_description}
                      </p>
                    </div>
                  )}
                  
                  {/* منطقة للصور أو الفيديوهات الإضافية - قابلة للتطوير في المستقبل */}
                  <div className="text-center text-xs sm:text-sm text-muted-foreground arabic-text">
                    <p className="italic">
                      * يمكن إضافة صور أو فيديوهات تعريفية عن الشخصية من خلال لوحة الإدارة *
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* زر التواصل */}
            {activeCallout && activeCallout.contact_link !== '#' && (
              <div className="mb-6">
                <a 
                  href={activeCallout.contact_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors arabic-text text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4" />
                  {activeCallout.contact_button_text || cardContent?.contact_button_text}
                </a>
              </div>
            )}
          </div>

          {/* Personalities Archive Table */}
          {personalities.length > 0 && (
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="arabic-text flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  أرشيف الشخصيات المكرمة
                </CardTitle>
                <CardDescription className="arabic-text text-xs sm:text-sm">
                  جدول أرشيفي للشخصيات التي تم تكريمها على المنصة
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-2 sm:p-3 arabic-text text-xs sm:text-sm">الاسم</th>
                        <th className="text-right p-2 sm:p-3 arabic-text text-xs sm:text-sm hidden sm:table-cell">اللقب</th>
                        <th className="text-right p-2 sm:p-3 arabic-text text-xs sm:text-sm">التصنيف</th>
                        <th className="text-right p-2 sm:p-3 arabic-text text-xs sm:text-sm hidden md:table-cell">الحالة</th>
                        <th className="text-right p-2 sm:p-3 arabic-text text-xs sm:text-sm">التواصل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personalities.map((personality) => (
                        <tr key={personality.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 sm:p-3">
                            <div className="flex items-center gap-2">
                              {personality.image_url ? (
                                <img 
                                  src={personality.image_url} 
                                  alt={personality.name}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium arabic-text text-xs sm:text-sm truncate">{personality.name}</span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 arabic-text text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{personality.title}</td>
                          <td className="p-2 sm:p-3">
                            <Badge variant="outline" className={`${getCategoryColor(personality.category)} text-xs`}>
                              <span className="hidden sm:inline">{getCategoryIcon(personality.category)}</span>
                              <span className="sm:mr-1">
                                {personality.category === 'scientist' ? 'عالم' : 
                                 personality.category === 'artist' ? 'فنان' : 
                                 personality.category === 'intellectual' ? 'مفكر' : 'عامة'}
                              </span>
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-3 hidden md:table-cell">
                            {personality.is_featured && (
                              <Badge className="bg-primary/90 text-xs">
                                <Star className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                                مميز
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 sm:p-3">
                            {personality.contact_link && personality.contact_link !== '#' ? (
                              <a 
                                href={personality.contact_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-xs sm:text-sm arabic-text"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span className="hidden sm:inline">{personality.contact_button_text || 'تواصل'}</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs arabic-text">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CallOut;