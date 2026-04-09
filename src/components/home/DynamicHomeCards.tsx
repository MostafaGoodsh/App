import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DailyTasksCard from "@/components/engagement/DailyTasksCard";
import AnubisCard from "@/components/AnubisCard";
import { ExternalReelsCard } from "@/components/reels/ExternalReelsCard";
import LiveStreamCard from "@/components/engagement/LiveStreamCard";
import PodcastCard from "@/components/podcast/PodcastCard";
import WheelOfFortune from "@/components/tasks/WheelOfFortune";
import { Skeleton } from "@/components/ui/skeleton";
import { getTypographyStyles, useTypography } from "@/hooks/useTypography";
import { buildHomeCardTypographyStyles, getCardTypographySectionKey } from "@/utils/homeCardTypography";
import { useLanguage } from "@/contexts/LanguageContext";
import type { HomePageCard } from "@/types/homeCards";

const SpecialCardComponents: Record<string, React.ComponentType<{ card?: HomePageCard }>> = {
  tasks: DailyTasksCard,
  anubis: AnubisCard,
  reels: ExternalReelsCard,
  live_stream: LiveStreamCard,
  podcast: PodcastCard,
  wheel: WheelOfFortune as React.ComponentType<{ card?: HomePageCard }>,
};

const getShapeClasses = (shape: string) => {
  switch (shape) {
    case 'square': return 'rounded-none';
    case 'circle': return 'rounded-full';
    case 'pill': return 'rounded-[9999px]';
    default: return 'rounded-xl';
  }
};

const getAnimationClasses = (animation: string) => {
  switch (animation) {
    case 'pulse': return 'animate-pulse';
    case 'bounce': return 'animate-bounce';
    case 'slide': return 'animate-[slideIn_0.6s_ease-out]';
    case 'fade': return 'animate-[fadeIn_0.8s_ease-out]';
    case 'glow': return 'animate-[glow_2s_ease-in-out_infinite]';
    default: return '';
  }
};

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'small': return 'min-h-[160px] md:min-h-[180px]';
    case 'medium': return 'min-h-[220px] md:min-h-[250px]';
    case 'full': return 'min-h-[350px] md:min-h-[400px]';
    default: return 'min-h-[280px] md:min-h-[320px]';
  }
};

const LinkCard = ({ card }: { card: HomePageCard }) => {
  const [imgError, setImgError] = useState(false);
  const [vidError, setVidError] = useState(false);
  const { getSetting } = useTypography();
  const { language, t } = useLanguage();
  const sectionKey = getCardTypographySectionKey(card.card_type);
  const sectionSetting = getSetting(sectionKey) || getSetting("home_cards") || getSetting("general");

  const isArabic = language === "ar" || language === "both";
  const displayTitle = (!isArabic && card.title_en) ? card.title_en : card.title;
  const displayDesc = (!isArabic && card.description_en) ? card.description_en : card.description;

  const hasValidImage =
    card.background_image && !card.background_image.includes("placeholder") && !imgError;
  const hasValidVideo = card.background_video && !vidError;
  const gradientStyle =
    !hasValidImage && card.background_gradient
      ? ({ background: card.background_gradient } as React.CSSProperties)
      : !hasValidImage && card.background_color
        ? ({ backgroundColor: card.background_color } as React.CSSProperties)
        : undefined;

  const baseTitleStyle = getTypographyStyles(sectionSetting, "title") as React.CSSProperties;
  const baseContentStyle = getTypographyStyles(sectionSetting, "content") as React.CSSProperties;
  const { titleStyle, descStyle } = buildHomeCardTypographyStyles(card, baseTitleStyle, baseContentStyle);

  const shapeClass = getShapeClasses(card.card_shape || 'rounded');
  const animationClass = getAnimationClasses(card.card_animation || 'none');
  const sizeClass = getSizeClasses(card.card_size || 'large');
  const opacity = card.card_opacity ?? 1;
  const customMinHeight = card.min_height || undefined;

  // Coming soon → not clickable
  if (card.is_coming_soon) {
    return (
      <div className="group">
        <article
          dir={isArabic ? "rtl" : "ltr"}
          className={`relative overflow-hidden ${shapeClass} border border-border/50 bg-card/30 backdrop-blur-sm ${animationClass} cursor-default opacity-70`}
          style={{ ...gradientStyle, minHeight: customMinHeight }}
        >
          {hasValidImage && (
            <img src={card.background_image!} alt={displayTitle}
              className="absolute inset-0 w-full h-full object-cover opacity-25" loading="lazy" onError={() => setImgError(true)} />
          )}
          <div className={`relative p-8 ${sizeClass} flex flex-col justify-end items-stretch bg-gradient-to-t from-background/90 via-background/60 to-transparent`} style={{ minHeight: customMinHeight }}>
            <h2 className="font-cairo mb-3 text-primary/60 font-bold w-full" style={titleStyle}>{displayTitle}</h2>
            {displayDesc && <p className="font-cairo text-white/60 leading-relaxed w-full" style={descStyle}>{displayDesc}</p>}
            <span className="mt-2 inline-block text-xs bg-primary/20 text-primary px-3 py-1 rounded-full w-fit animate-pulse">{t("قريباً")}</span>
          </div>
        </article>
      </div>
    );
  }

  // Use route_path if set, otherwise /card/:slug for internal pages
  const linkTo = card.route_path || `/card/${card.slug}`;

  return (
    <Link to={linkTo} className="group">
      <article
        dir={isArabic ? "rtl" : "ltr"}
        className={`relative overflow-hidden ${shapeClass} border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm ${animationClass}`}
        style={{ ...gradientStyle, opacity, minHeight: customMinHeight }}
      >
        {hasValidImage && (
          <img src={card.background_image!} alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300"
            loading="lazy" onError={() => setImgError(true)} />
        )}
        <div className={`relative p-8 ${sizeClass} flex flex-col justify-end items-stretch bg-gradient-to-t from-background/90 via-background/60 to-transparent`} style={{ minHeight: customMinHeight }}>
          <h2 className="font-cairo mb-3 text-primary transition-colors duration-300 font-bold w-full" style={titleStyle}>{displayTitle}</h2>
          {displayDesc && <p className="font-cairo text-white/90 leading-relaxed w-full" style={descStyle}>{displayDesc}</p>}
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 group-hover:w-20 transition-all duration-300" />
        </div>
      </article>
    </Link>
  );
};

const DynamicHomeCards = () => {
  const [cards, setCards] = useState<HomePageCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("home_page_cards")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Error fetching home page cards:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();

    const channel = supabase
      .channel(`home_page_cards_changes_${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "home_page_cards" }, fetchCards)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCards]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="w-full h-[280px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {cards.map((card) => {
        const SpecialComponent = SpecialCardComponents[card.card_type];
        if (SpecialComponent) {
          return <SpecialComponent key={card.id} card={card} />;
        }
        return <LinkCard key={card.id} card={card} />;
      })}
    </>
  );
};

export default DynamicHomeCards;
