import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Users, MessageCircle, Star, Award, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, dir } = useLanguage();
  const [personalities, setPersonalities] = useState<CalloutPersonality[]>([]);
  const [personalitiesLoading, setPersonalitiesLoading] = useState(true);
  const [cardContent, setCardContent] = useState<CalloutCardContent | null>(null);
  const [activeCallout, setActiveCallout] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: personalitiesData, error: personalitiesError } = await supabase
          .from('callout_personalities')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (personalitiesError) throw personalitiesError;
        setPersonalities(personalitiesData || []);
        
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scientist': return <Award className="w-5 h-5" />;
      case 'artist': return <Sparkles className="w-5 h-5" />;
      case 'intellectual': return <Users className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scientist': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'artist': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'intellectual': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'scientist': return t('عالم');
      case 'artist': return t('فنان');
      case 'intellectual': return t('مفكر');
      default: return t('عامة (تصنيف)');
    }
  };

  if (loading || personalitiesLoading || !cardContent) {
    return <div className="flex justify-center items-center min-h-screen">{t("جاري التحميل...")}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{cardContent.title} - {getContent('app_name', 'Crypto-MSR')}</title>
      </Helmet>
      
      <div className="min-h-screen" style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="min-h-screen bg-background/90">
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6" dir={dir}>
            <div className="max-w-2xl mx-auto">
              <div className="mb-6" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                <div className="flex items-center gap-2 mb-3" style={{ justifyContent: dir === "rtl" ? "flex-start" : "flex-start" }}>
                  <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{cardContent.title}</h1>
                </div>
                
                <div className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-full mb-6 px-2 sm:px-4">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {activeCallout?.callout_text || cardContent?.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 sm:border-3 border-primary/30 flex items-center justify-center overflow-hidden shadow-lg">
                      {activeCallout?.personality_image_url ? (
                        <img src={activeCallout.personality_image_url} alt={activeCallout.personality_name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-full">
                          <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary/60" />
                        </div>
                      )}
                    </div>
                    {activeCallout?.personality_name && (
                      <p className="mt-1.5 text-xs sm:text-sm font-medium text-center max-w-[80px] sm:max-w-[100px] truncate">{activeCallout.personality_name}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 border-3 sm:border-4 border-secondary/30 flex items-center justify-center overflow-hidden shadow-xl">
                      {cardContent.fixed_image_url ? (
                        <img src={cardContent.fixed_image_url} alt="" className="w-3/4 h-3/4 object-contain rounded-full" />
                      ) : (
                        <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-full">
                          <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-secondary/60" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {activeCallout && (
                  <Card className="mb-6 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3 px-3 sm:px-6">
                      <CardTitle className="text-base sm:text-lg md:text-xl text-center">
                        {activeCallout.personality_title && `${activeCallout.personality_name} - ${activeCallout.personality_title}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      {activeCallout.personality_description && (
                        <div className="text-center">
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{activeCallout.personality_description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {activeCallout && activeCallout.contact_link !== '#' && (
                  <div className="mb-6">
                    <a href={activeCallout.contact_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base">
                      <MessageCircle className="w-4 h-4" />
                      {activeCallout.contact_button_text || cardContent?.contact_button_text}
                    </a>
                  </div>
                )}
              </div>

              {personalities.length > 0 && (
                <Card>
                  <CardHeader className="px-3 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      {t("أرشيف الشخصيات المكرمة")}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {t("تايم لاين الشخصيات التي تم تكريمها على المنصة")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <div className="relative">
                      <div className="absolute right-[19px] sm:right-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />
                      <div className="space-y-6">
                        {personalities.map((personality) => (
                          <div key={personality.id} className="relative flex gap-4 sm:gap-6">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary bg-background overflow-hidden shadow-lg">
                                {personality.image_url ? (
                                  <img src={personality.image_url} alt={personality.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              {personality.is_featured && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
                                  <Star className="w-2 h-2 sm:w-3 sm:h-3 text-primary-foreground fill-current" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 pb-4">
                              <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                                <CardContent className="p-3 sm:p-4">
                                  <div className="space-y-2">
                                    <div>
                                      <h3 className="font-bold text-sm sm:text-base">{personality.name}</h3>
                                      {personality.title && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{personality.title}</p>}
                                    </div>
                                    {personality.description && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{personality.description}</p>}
                                    <div className="flex items-center justify-between gap-2 pt-2">
                                      <Badge variant="outline" className={`${getCategoryColor(personality.category)} text-xs`}>
                                        <span className="flex items-center gap-1">
                                          {getCategoryIcon(personality.category)}
                                          <span>{getCategoryLabel(personality.category)}</span>
                                        </span>
                                      </Badge>
                                      {personality.contact_link && personality.contact_link !== '#' && (
                                        <a href={personality.contact_link} target="_blank" rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-xs sm:text-sm">
                                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                          <span>{personality.contact_button_text || t('تواصل')}</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        ))}
                      </div>
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
