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
import { ExternalReelsCard } from "@/components/reels/ExternalReelsCard";
import sphinxBg from "@/assets/sphinx-bg.jpg";
import pharaohStatueBg from "@/assets/pharaoh-statue-bg.jpg";

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
        <section className="relative min-h-[85vh] flex items-end justify-center bg-background">
          <img
            src={getContent('hero_background', '/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png')}
            alt={getAltText('hero_background', 'هرم مصري عند الغروب - خلفية أسود وذهبي')}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="relative z-10 container mx-auto px-4 text-center pb-24 md:pb-32">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <h1 className="font-cairo text-3xl md:text-6xl lg:text-7xl font-bold text-primary mb-1 md:mb-2">
                  {getContent('app_name', 'Crypto-MSR')}
                </h1>
                <p className="font-cairo text-xl md:text-3xl lg:text-4xl text-white/90 mb-8 md:mb-12">
                  {getContent('hero_subtitle', 'منصة مصر الرقمية')}
                </p>
                <div className="text-3xl md:text-5xl lg:text-6xl text-primary/80 mb-6">
                  𓂀
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-4 flex flex-col gap-8 max-w-lg">
          {/* Learning Card - First Card */}
          {[
            { 
              imageKey: 'learning_card_image',
              titleKey: 'learning_card_title', 
              descriptionKey: 'learning_card_description',
              href: "/learning"
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
                  <h2 className="font-cairo text-2xl md:text-3xl mb-3 text-primary transition-colors duration-300 font-bold">
                    {getContent(card.titleKey, 'عنوان البطاقة')}
                  </h2>
                  <p className="font-cairo text-sm md:text-base text-white/90 leading-relaxed">
                    {getContent(card.descriptionKey, 'وصف البطاقة')}
                  </p>
                  <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </article>
            </Link>
          ))}

          {/* Reels Card - Second Card */}
          <ExternalReelsCard />
          
          {/* Updates Card - Third Card */}
          <Link to="/updates" className="group">
            <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
              <img 
                src={pharaohStatueBg} 
                alt="تمثال فرعوني - آخر التحديثات" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
                loading="lazy" 
              />
              <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
                <h2 className="font-cairo text-2xl md:text-3xl mb-3 text-primary transition-colors duration-300 font-bold">
                  {getContent('hero_cta_2', 'Updates | آخر التحديثات')}
                </h2>
                <p className="font-cairo text-sm md:text-base text-white/90 leading-relaxed">
                  تابع آخر التحديثات والأخبار حول المنصة
                </p>
                <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
              </div>
            </article>
          </Link>
          
          {/* Daily Tasks Card - Fourth Card */}
          <DailyTasksCard />

          {/* Call Out Card - Fifth Card */}
          <Link to="/call-out" className="group">
            <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
              <img 
                src={sphinxBg} 
                alt="أبو الهول - الاستدعاء الشرفي" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
                loading="lazy" 
              />
              <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
                <h2 className="font-cairo text-2xl md:text-3xl mb-3 text-primary transition-colors duration-300 font-bold">
                  {getContent('hero_cta_5', 'Call out | إستدعاء شرفي')}
                </h2>
                <p className="font-cairo text-sm md:text-base text-white/90 leading-relaxed">
                  استدعاء شرفي للمشاركة في بناء مستقبل مصر الرقمي
                </p>
                <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
              </div>
            </article>
          </Link>
          
          {/* Identity and Wallet Cards */}
          {[
            { 
              imageKey: 'identity_card_image',
              titleKey: 'identity_card_title', 
              descriptionKey: 'identity_card_description',
              href: "/identity"
            },
            { 
              imageKey: 'wallet_card_image',
              titleKey: 'wallet_card_title', 
              descriptionKey: 'wallet_card_description',
              href: "/wallet"
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
                  <h2 className="font-cairo text-2xl md:text-3xl mb-3 text-primary transition-colors duration-300 font-bold">
                    {getContent(card.titleKey, 'عنوان البطاقة')}
                  </h2>
                  <p className="font-cairo text-sm md:text-base text-white/90 leading-relaxed">
                    {getContent(card.descriptionKey, 'وصف البطاقة')}
                  </p>
                  <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </article>
            </Link>
          ))}

          {/* Anubis Card - Last Card */}
          <AnubisCard />

          {/* Action Buttons Section */}
          <div className="flex flex-col items-center justify-center gap-4 mt-8">
            <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px]">
              <Link to="/early-access">{getContent('hero_cta', 'Join Now | انضم الآن')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px]">
              <Link to="/rwa">{getContent('hero_cta_4', 'MSR-RWA (قريبا)')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px]">
              <Link to="/stable-coin">{getContent('hero_cta_3', 'MSR-Stable coin (قريبا)')}</Link>
            </Button>
          </div>
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
