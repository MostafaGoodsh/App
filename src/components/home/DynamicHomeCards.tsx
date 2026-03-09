import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DailyTasksCard from "@/components/engagement/DailyTasksCard";
import AnubisCard from "@/components/AnubisCard";
import { ExternalReelsCard } from "@/components/reels/ExternalReelsCard";
import LiveStreamCard from "@/components/engagement/LiveStreamCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getTypographyStyles, useTypography } from "@/hooks/useTypography";
import { resolveFontSize, resolveFontWeight } from "@/utils/typography";

interface HomePageCard {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  slug: string;
  card_type: string;
  display_order: number;
  is_active: boolean;
  background_image: string | null;
  background_color: string | null;
  background_gradient: string | null;
  icon_url: string | null;
  route_path: string | null;
  is_coming_soon: boolean;
  title_text_align: string | null;
  description_text_align: string | null;
  font_family: string | null;
  font_size: string | null;
  font_weight: string | null;
  text_color: string | null;
  title_font_size: string | null;
  content_font_size: string | null;
}

const SpecialCardComponents: Record<string, React.FC<{ card: HomePageCard }>> = {
  tasks: DailyTasksCard,
  anubis: AnubisCard,
  reels: ExternalReelsCard,
  live_stream: LiveStreamCard,
};

const LinkCard = ({ card }: { card: HomePageCard }) => {
  const [imgError, setImgError] = useState(false);
  const { getSetting } = useTypography();
  const homeSetting = getSetting("home_cards");

  const hasValidImage =
    card.background_image && !card.background_image.includes("placeholder") && !imgError;

  const gradientStyle =
    !hasValidImage && card.background_gradient
      ? ({ background: card.background_gradient } as React.CSSProperties)
      : !hasValidImage && card.background_color
        ? ({ backgroundColor: card.background_color } as React.CSSProperties)
        : undefined;

  const baseTitleStyle = getTypographyStyles(homeSetting, "title") as React.CSSProperties;
  const baseContentStyle = getTypographyStyles(homeSetting, "content") as React.CSSProperties;

  // Apply card-level overrides, then fall back to typography settings
  const titleStyle: React.CSSProperties = {
    ...baseTitleStyle,
    textAlign: (card.title_text_align || (baseTitleStyle.textAlign as any) || "center") as any,
    fontFamily: card.font_family ? `'${card.font_family}', sans-serif` : baseTitleStyle.fontFamily,
    color: card.text_color || (baseTitleStyle.color as any) || undefined,
    fontSize: resolveFontSize(card.title_font_size, baseTitleStyle.fontSize as any),
    fontWeight: resolveFontWeight(card.font_weight, baseTitleStyle.fontWeight as any),
  };

  const descStyle: React.CSSProperties = {
    ...baseContentStyle,
    textAlign: (card.description_text_align || (baseContentStyle.textAlign as any) || "center") as any,
    fontFamily: card.font_family ? `'${card.font_family}', sans-serif` : baseContentStyle.fontFamily,
    color: card.text_color || (baseContentStyle.color as any) || undefined,
    fontSize: resolveFontSize(card.content_font_size || card.font_size, baseContentStyle.fontSize as any),
    fontWeight: resolveFontWeight(card.font_weight, baseContentStyle.fontWeight as any),
  };

  return (
    <Link to={card.route_path || `/${card.slug}`} className="group">
      <article
        className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm"
        style={gradientStyle}
      >
        {hasValidImage && (
          <img
            src={card.background_image!}
            alt={card.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end items-stretch bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <h2
            className="font-cairo mb-3 text-primary transition-colors duration-300 font-bold w-full"
            style={titleStyle}
          >
            {card.title}
          </h2>
          {card.description && (
            <p className="font-cairo text-white/90 leading-relaxed w-full" style={descStyle}>
              {card.description}
            </p>
          )}
          {card.is_coming_soon && (
            <span className="mt-2 inline-block text-xs bg-primary/20 text-primary px-3 py-1 rounded-full w-fit">
              قريباً
            </span>
          )}
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
      .channel("home_page_cards_changes")
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
