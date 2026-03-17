import { useAppContent } from "@/hooks/useAppContent";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAnubisSubscription } from "@/hooks/useAnubisSubscription";
import { useState } from "react";
import { getTypographyStyles, useTypography } from "@/hooks/useTypography";
import { buildHomeCardTypographyStyles, getCardTypographySectionKey } from "@/utils/homeCardTypography";
import { useLanguage } from "@/contexts/LanguageContext";
import type { HomePageCard } from "@/types/homeCards";

const AnubisCard = ({ card }: { card?: HomePageCard }) => {
  const { getContent, getAltText, loading } = useAppContent();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { createSubscription, hasAccess } = useAnubisSubscription();
  const [registering, setRegistering] = useState(false);
  const { language, t } = useLanguage();

  const { getSetting } = useTypography();
  const homeSetting = getSetting(getCardTypographySectionKey(card?.card_type ?? "anubis")) || getSetting("home_cards") || getSetting("general");

  const isArabic = language === "ar" || language === "both";

  if (loading && !card) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80" />;
  }

  const titleFromContent = getContent("anubis_card_title", "");
  const descriptionFromContent = getContent("anubis_card_description", "");
  const backgroundFromContent = getContent(
    "anubis_card_background",
    "/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png",
  );

  const displayTitle = (!isArabic && card?.title_en) 
    ? card.title_en 
    : (card?.title || titleFromContent || t("أنوبيس - حامي الأسرار", "Anubis - Guardian of Secrets"));
  const displayDescription = (!isArabic && card?.description_en) 
    ? card.description_en 
    : (card?.description ?? (descriptionFromContent || t("اضغط لاكتشاف أسرار أنوبيس القديمة", "Tap to discover the ancient secrets of Anubis")));
  const backgroundImage = card?.background_image || backgroundFromContent;

  const baseTitleStyle = getTypographyStyles(homeSetting, "title") as React.CSSProperties;
  const baseContentStyle = getTypographyStyles(homeSetting, "content") as React.CSSProperties;
  const { titleStyle, descStyle } = buildHomeCardTypographyStyles(card, baseTitleStyle, baseContentStyle);

  const hasValidImage = !!backgroundImage && !backgroundImage.includes("placeholder");
  const gradientStyle =
    !hasValidImage && card?.background_gradient
      ? ({ background: card.background_gradient } as React.CSSProperties)
      : !hasValidImage && card?.background_color
        ? ({ backgroundColor: card.background_color } as React.CSSProperties)
        : undefined;

  const handleClick = async () => {
    if (!user) { navigate("/auth"); return; }
    if (isAdmin || hasAccess) { navigate("/anubis"); return; }
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
      dir={isArabic ? "rtl" : "ltr"}
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
