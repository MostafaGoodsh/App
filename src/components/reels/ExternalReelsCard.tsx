import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAppContent } from "@/hooks/useAppContent";
import { getTypographyStyles, useTypography } from "@/hooks/useTypography";
import { buildHomeCardTypographyStyles, getCardTypographySectionKey } from "@/utils/homeCardTypography";
import type { HomePageCard } from "@/types/homeCards";

interface ReelsCardContent {
  id: string;
  title: string;
  description: string;
  background_image_url: string;
  is_active: boolean;
}

export const ExternalReelsCard = ({ card }: { card?: HomePageCard }) => {
  const [cardContent, setCardContent] = useState<ReelsCardContent | null>(null);
  const [loading, setLoading] = useState(!card);
  const { getContent, getAltText } = useAppContent();
  const { getSetting } = useTypography();
  const homeSetting = getSetting("home_cards");

  useEffect(() => {
    if (card) return;

    const fetchCardContent = async () => {
      try {
        setLoading(true);

        const { data: cardData } = await supabase
          .from("reels_card_content")
          .select("*")
          .eq("is_active", true)
          .single();

        if (cardData) setCardContent(cardData);
      } catch (error) {
        console.error("Error fetching reels card content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardContent();
  }, [card]);

  if (loading) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80" />;
  }

  const displayTitle = card?.title || cardContent?.title || getContent("reels_card_title", "Reels | فيديو قصير");
  const displayDescription =
    card?.description ??
    (cardContent?.description || getContent("reels_card_description", "شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة"));

  const fallbackImage = "/lovable-uploads/egyptian-ankh-reels-bg.jpg";
  const backgroundImage =
    card?.background_image ||
    (cardContent?.background_image_url && cardContent.background_image_url.trim() !== ""
      ? cardContent.background_image_url
      : fallbackImage);

  const baseTitleStyle = getTypographyStyles(homeSetting, "title") as React.CSSProperties;
  const baseContentStyle = getTypographyStyles(homeSetting, "content") as React.CSSProperties;

  const titleStyle: React.CSSProperties = {
    ...baseTitleStyle,
    textAlign: (card?.title_text_align || (baseTitleStyle.textAlign as any) || "center") as any,
    fontFamily: card?.font_family ? `'${card.font_family}', sans-serif` : baseTitleStyle.fontFamily,
    color: card?.text_color || (baseTitleStyle.color as any) || undefined,
    fontSize: resolveFontSize(card?.title_font_size, baseTitleStyle.fontSize as any),
    fontWeight: resolveFontWeight(card?.font_weight, baseTitleStyle.fontWeight as any),
  };

  const descStyle: React.CSSProperties = {
    ...baseContentStyle,
    textAlign: (card?.description_text_align || (baseContentStyle.textAlign as any) || "center") as any,
    fontFamily: card?.font_family ? `'${card.font_family}', sans-serif` : baseContentStyle.fontFamily,
    color: card?.text_color || (baseContentStyle.color as any) || undefined,
    fontSize: resolveFontSize(card?.content_font_size || card?.font_size, baseContentStyle.fontSize as any),
    fontWeight: resolveFontWeight(card?.font_weight, baseContentStyle.fontWeight as any),
  };

  const href = card?.route_path || "/reels-categories";

  const hasValidImage = !!backgroundImage && !backgroundImage.includes("placeholder");
  const gradientStyle =
    !hasValidImage && card?.background_gradient
      ? ({ background: card.background_gradient } as React.CSSProperties)
      : !hasValidImage && card?.background_color
        ? ({ backgroundColor: card.background_color } as React.CSSProperties)
        : undefined;

  return (
    <Link to={href} className="group">
      <article
        className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm"
        style={gradientStyle}
      >
        {hasValidImage && (
          <img
            src={backgroundImage}
            alt={getAltText("reels_card_image", "خلفية كارت الريلز")}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300"
            loading="lazy"
          />
        )}
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end items-stretch bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <h2 className="font-cairo mb-3 text-primary transition-colors duration-300 font-bold w-full" style={titleStyle}>
            {displayTitle}
          </h2>
          {!!displayDescription && (
            <p className="font-cairo text-white/90 leading-relaxed w-full" style={descStyle}>
              {displayDescription}
            </p>
          )}
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300" />
        </div>
      </article>
    </Link>
  );
};
