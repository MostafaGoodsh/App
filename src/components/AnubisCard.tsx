import { useAppContent } from "@/hooks/useAppContent";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAnubisSubscription } from "@/hooks/useAnubisSubscription";
import { useState } from "react";
import { getTypographyStyles, useTypography } from "@/hooks/useTypography";
import { buildHomeCardTypographyStyles, getCardTypographySectionKey } from "@/utils/homeCardTypography";
import type { HomePageCard } from "@/types/homeCards";

const AnubisCard = ({ card }: { card?: HomePageCard }) => {
  const { getContent, getAltText, loading } = useAppContent();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { createSubscription, hasAccess } = useAnubisSubscription();
  const [registering, setRegistering] = useState(false);

  const { getSetting } = useTypography();
  const homeSetting = getSetting("home_cards");

  if (loading && !card) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80" />;
  }

  const titleFromContent = getContent("anubis_card_title", "");
  const descriptionFromContent = getContent("anubis_card_description", "");
  const backgroundFromContent = getContent(
    "anubis_card_background",
    "/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png",
  );

  const displayTitle = card?.title || titleFromContent || "أنوبيس - حامي الأسرار";
  const displayDescription = card?.description ?? (descriptionFromContent || "اضغط لاكتشاف أسرار أنوبيس القديمة");
  const backgroundImage = card?.background_image || backgroundFromContent;

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

  const hasValidImage = !!backgroundImage && !backgroundImage.includes("placeholder");
  const gradientStyle =
    !hasValidImage && card?.background_gradient
      ? ({ background: card.background_gradient } as React.CSSProperties)
      : !hasValidImage && card?.background_color
        ? ({ backgroundColor: card.background_color } as React.CSSProperties)
        : undefined;

  const handleClick = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Admin has direct access without subscription
    if (isAdmin) {
      navigate("/anubis");
      return;
    }

    // If user already has access, go directly
    if (hasAccess) {
      navigate("/anubis");
      return;
    }

    // Otherwise, create subscription first
    try {
      setRegistering(true);
      await createSubscription.mutateAsync({ subscription_type: "free_trial" });
      navigate("/anubis");
    } catch (error) {
      console.error("Error registering:", error);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <article
      onClick={handleClick}
      className="relative overflow-hidden rounded-xl border border-border/50 cursor-pointer bg-card/30 backdrop-blur-sm group hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ pointerEvents: registering ? "none" : "auto", ...(gradientStyle || {}) }}
    >
      {hasValidImage && (
        <img
          src={backgroundImage}
          alt={getAltText("anubis_card_image", "تمثال أنوبيس المصري الذهبي")}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-300"
          loading="lazy"
        />
      )}
      <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end items-stretch bg-gradient-to-t from-background/95 via-background/70 to-transparent">
        <h2 className="font-cairo mb-3 text-primary transition-colors duration-300 font-bold w-full" style={titleStyle}>
          {displayTitle}
        </h2>
        {!!displayDescription && (
          <p className="text-white/90 leading-relaxed w-full" style={descStyle}>
            {displayDescription}
          </p>
        )}
        <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300" />
      </div>
    </article>
  );
};

export default AnubisCard;
