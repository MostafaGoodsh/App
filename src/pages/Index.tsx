import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAppContent } from "@/hooks/useAppContent";
import { MsRaCurrencyCard } from "@/components/wallet/MsRaCurrencyCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import DailyTasksCard from "@/components/engagement/DailyTasksCard";
import AnubisCard from "@/components/AnubisCard";

const Index = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/";
  const { user } = useAuth();
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const { getContent, getAltText, loading } = useAppContent();

  // Check identity verification status
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('identity_verification')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .single();
        
        setIsIdentityVerified(!!data);
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    checkVerificationStatus();
  }, [user]);

  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{getContent('app_name', 'Crypto-MSR')} | محفظة العملات الرقمية</title>
        <meta name="description" content={getContent('page_description', 'منصة بسيطة للعملات الرقمية مع محفظة آمنة وتوثيق الهوية | Simple crypto platform with secure wallet and identity verification')} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main>
        <section className="relative min-h-[85vh] flex items-center justify-center bg-background">
          <img
            src={getContent('hero_background', '/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png')}
            alt={getAltText('hero_background', 'هرم مصري عند الغروب - خلفية أسود وذهبي')}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-white/90 mb-4">
                  {getContent('app_name', 'Crypto-MSR')}
                </h1>
                <p className="font-cairo text-2xl md:text-3xl lg:text-4xl text-primary mb-4">
                  {getContent('hero_subtitle', 'منصة مصر الرقمية')}
                </p>
                <div className="text-4xl md:text-5xl lg:text-6xl text-primary/80 mb-6">
                  𓂀
                </div>
                
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px] bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20">
                <Link to="/early-access">{getContent('hero_cta', 'انضم الآن | Join Now')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px] bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20">
                <Link to="/updates">{getContent('hero_cta_2', 'آخر التحديثات | Updates')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px] bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20">
                <Link to="/call-out">{getContent('hero_cta_5', 'Call out | إستدعاء شرفي')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px] bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20">
                <Link to="/rwa">{getContent('hero_cta_4', 'MSR-RWA (قريبا)')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px] bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20">
                <Link to="/stable-coin">{getContent('hero_cta_3', 'MSR-Stable coin (قريبا)')}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-4 flex flex-col gap-8 max-w-lg">
          {/* Daily Tasks Card - First Card */}
          <DailyTasksCard />
          
          {/* Anubis Card */}
          <AnubisCard />
          
          {[
            { 
              imageKey: 'learning_card_image',
              titleKey: 'learning_card_title', 
              descriptionKey: 'learning_card_description',
              href: "/learning"
            },
            { 
              imageKey: 'wallet_card_image',
              titleKey: 'wallet_card_title', 
              descriptionKey: 'wallet_card_description',
              href: "/wallet"
            },
            { 
              imageKey: 'identity_card_image',
              titleKey: 'identity_card_title', 
              descriptionKey: 'identity_card_description',
              href: "/identity"
            },
          ].map((card) => (
            <Link key={card.titleKey} to={card.href} className="group">
              <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
                <img 
                  src={getContent(card.imageKey, '/lovable-uploads/placeholder.png')} 
                  alt={getAltText(card.imageKey, 'صورة البطاقة')} 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
                  loading="lazy" 
                />
                <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
                  <h2 className="font-cairo text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-300 font-bold">
                    {getContent(card.titleKey, 'عنوان البطاقة')}
                  </h2>
                  <p className="font-cairo text-sm md:text-base text-muted-foreground/90 leading-relaxed">
                    {getContent(card.descriptionKey, 'وصف البطاقة')}
                  </p>
                  <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </article>
            </Link>
          ))}
        </section>
        
        {/* Ms-Ra Currency Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <MsRaCurrencyCard isVerified={isIdentityVerified} />
          </div>
        </section>

        <div className="sr-only">
          <img src="/lovable-uploads/45e37627-8629-45b2-ae38-13d37fbeb015.png" alt="عنخ ذهبي" loading="lazy" />
          <img src="/lovable-uploads/b4199737-2df3-4243-bac6-a8b461a4d62e.png" alt="خنفساء مجنحة لازوردية" loading="lazy" />
          <img src="/lovable-uploads/5965d679-8a52-49ee-9711-9c3a04f7368d.png" alt="رمز العنخ الذهبي اللامع" loading="lazy" />
        </div>
      </main>
    </>
  );
};

export default Index;
