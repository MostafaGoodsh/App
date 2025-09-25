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
  const [featuredPersonality, setFeaturedPersonality] = useState<CalloutPersonality | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch personalities
        const { data: personalitiesData, error: personalitiesError } = await supabase
          .from('callout_personalities')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (personalitiesError) throw personalitiesError;
        setPersonalities(personalitiesData || []);
        
        // Find featured personality for the circle
        const featured = personalitiesData?.find(p => p.is_featured);
        setFeaturedPersonality(featured || null);
        
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
          <main className="container mx-auto px-4 py-8 arabic-content">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Megaphone className="w-6 h-6 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold arabic-text">
                {cardContent.title}
              </h1>
            </div>
            
            {/* Profile Cards Section */}
            <div className="flex items-center justify-center gap-12 mb-8">
              {/* Right Circle - Personality Image */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/30 flex items-center justify-center overflow-hidden shadow-lg">
                  {featuredPersonality?.image_url ? (
                    <img 
                      src={featuredPersonality.image_url} 
                      alt={featuredPersonality.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-full">
                      <Star className="w-12 h-12 text-primary/60" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Left Circle - Fixed Image */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 border-4 border-secondary/30 flex items-center justify-center overflow-hidden shadow-lg">
                  {cardContent.fixed_image_url ? (
                    <img 
                      src={cardContent.fixed_image_url} 
                      alt="شعار التكريم"
                      className="w-4/5 h-4/5 object-contain rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-full">
                      <Award className="w-12 h-12 text-secondary/60" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Button */}
            {featuredPersonality && featuredPersonality.contact_link !== '#' && (
              <div className="mb-8">
                <a 
                  href={featuredPersonality.contact_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors arabic-text"
                >
                  <MessageCircle className="w-4 h-4" />
                  {featuredPersonality.contact_button_text || cardContent.contact_button_text}
                </a>
              </div>
            )}
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto arabic-text">
              {cardContent.description}
            </p>
          </div>

          {/* Personalities Archive Table */}
          {personalities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text flex items-center gap-2">
                  <Star className="w-6 h-6 text-primary" />
                  أرشيف الشخصيات المكرمة
                </CardTitle>
                <CardDescription className="arabic-text">
                  جدول أرشيفي للشخصيات التي تم تكريمها على المنصة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-4 arabic-text">الاسم</th>
                        <th className="text-right p-4 arabic-text">اللقب</th>
                        <th className="text-right p-4 arabic-text">التصنيف</th>
                        <th className="text-right p-4 arabic-text">الحالة</th>
                        <th className="text-right p-4 arabic-text">التواصل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personalities.map((personality) => (
                        <tr key={personality.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {personality.image_url ? (
                                <img 
                                  src={personality.image_url} 
                                  alt={personality.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <Star className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium arabic-text">{personality.name}</span>
                            </div>
                          </td>
                          <td className="p-4 arabic-text text-muted-foreground">{personality.title}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={getCategoryColor(personality.category)}>
                              {getCategoryIcon(personality.category)}
                              <span className="mr-1">
                                {personality.category === 'scientist' ? 'عالم' : 
                                 personality.category === 'artist' ? 'فنان' : 
                                 personality.category === 'intellectual' ? 'مفكر' : 'شخصية عامة'}
                              </span>
                            </Badge>
                          </td>
                          <td className="p-4">
                            {personality.is_featured && (
                              <Badge className="bg-primary/90">
                                <Star className="w-3 h-3 ml-1" />
                                مميز
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            {personality.contact_link && personality.contact_link !== '#' ? (
                              <a 
                                href={personality.contact_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm arabic-text"
                              >
                                <MessageCircle className="w-3 h-3" />
                                {personality.contact_button_text || 'تواصل'}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm arabic-text">غير متاح</span>
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