import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RoadmapCard from "./RoadmapCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoadmapCardData {
  id: string;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  background_gradient: string;
  slug: string;
  display_order: number;
  is_coming_soon?: boolean;
}

const RoadmapCardsGrid = () => {
  const [cards, setCards] = useState<RoadmapCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  const isArabic = language === "ar" || language === "both";

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmap_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching roadmap cards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 justify-items-center my-12">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-40 h-40 md:w-48 md:h-48 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <section className="my-16">
      <div className="text-center mb-10">
        <h2 className="font-cairo text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t("خريطة الطريق", "Roadmap")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("تابع تطورات المشروع والخطوات القادمة", "Follow the project development and upcoming steps")}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 justify-items-center">
        {cards.map((card) => (
          <RoadmapCard
            key={card.id}
            title={isArabic ? card.title : (card.title_en || card.title)}
            titleEn={isArabic ? card.title_en : undefined}
            description={isArabic ? card.description : (card.description_en || card.description)}
            descriptionEn={isArabic ? card.description_en : undefined}
            gradient={card.background_gradient}
            slug={card.slug}
            isComingSoon={card.is_coming_soon || false}
          />
        ))}
      </div>
    </section>
  );
};

export default RoadmapCardsGrid;
