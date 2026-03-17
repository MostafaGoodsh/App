import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAppContent } from "@/hooks/useAppContent";
import { MsRaCurrencyCard } from "@/components/wallet/MsRaCurrencyCard";
import { TotalMiningDisplay } from "@/components/mining/TotalMiningDisplay";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import RoadmapCardsGrid from "@/components/roadmap/RoadmapCardsGrid";
import DynamicHomeCards from "@/components/home/DynamicHomeCards";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/";
  const { user } = useAuth();
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const { getContent, getAltText, loading } = useAppContent();
  const { t } = useLanguage();

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
    return <div className="flex justify-center items-center min-h-screen">{t("جاري التحميل...")}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{getContent('app_name', 'Crypto-MSR')} | {t("محفظة العملات الرقمية", "Digital Crypto Wallet")}</title>
        <meta name="description" content={getContent('page_description', 'منصة بسيطة للعملات الرقمية مع محفظة آمنة وتوثيق الهوية')} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main>
        <section className="relative min-h-[85vh] flex items-end justify-center bg-background">
          <img
            src={getContent('hero_background', '/lovable-uploads/horus-statue-bg.jpg')}
            alt={getAltText('hero_background', 'تمثال حورس الذهبي - خلفية المنصة')}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="relative z-10 container mx-auto px-4 text-center pb-24 md:pb-32">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <h1 className="font-playfair text-3xl md:text-6xl lg:text-7xl font-bold text-primary mb-1 md:mb-2">
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
          <DynamicHomeCards />
          <div className="flex flex-col items-center justify-center gap-4 mt-8">
            <Button asChild size="lg" variant="outline" className="font-cairo w-full sm:w-auto min-w-[180px]">
              <Link to="/early-access">{getContent('hero_cta', 'Join Now | انضم الآن')}</Link>
            </Button>
          </div>
          <RoadmapCardsGrid />
        </section>
        
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-full px-2 sm:max-w-2xl md:max-w-4xl lg:max-w-5xl space-y-6">
            <MsRaCurrencyCard isVerified={isIdentityVerified} />
            <TotalMiningDisplay />
            <ReferralCard />
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
