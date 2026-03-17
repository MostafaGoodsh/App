import { Link } from "react-router-dom";
import { getTypographyStyles, useTypography } from "@/hooks/useTypography";
import { buildHomeCardTypographyStyles, getCardTypographySectionKey } from "@/utils/homeCardTypography";
import { useLanguage } from "@/contexts/LanguageContext";
import type { HomePageCard } from "@/types/homeCards";

const LiveStreamCard = ({ card }: { card?: HomePageCard }) => {
  const { getSetting } = useTypography();
  const { language, t } = useLanguage();
  const homeSetting = getSetting(getCardTypographySectionKey(card?.card_type ?? "live_stream")) || getSetting("home_cards") || getSetting("general");

  const isArabic = language === "ar" || language === "both";

  const title = (!isArabic && card?.title_en) 
    ? card.title_en 
    : (card?.title || t("البث المباشر", "Live Stream"));
  const desc = (!isArabic && card?.description_en) 
    ? card.description_en 
    : (card?.description ?? t("للأعضاء المعتمدين والمؤثرين", "For verified members and influencers"));

  const backgroundImage = card?.background_image || "/lovable-uploads/egyptian-cat-wings-live.jpg";

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

  return (
    <Link to={card?.route_path || "/live-stream"} className="group">
      <article
        className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm"
        style={gradientStyle}
      >
        {hasValidImage && (
          <img
            src={backgroundImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300"
            loading="lazy"
          />
        )}
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end items-stretch bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <h2 className="font-cairo mb-3 text-primary transition-colors duration-300 font-bold w-full" style={titleStyle}>
            {title}
          </h2>
          {!!desc && (
            <p className="font-cairo text-white/90 leading-relaxed w-full" style={descStyle}>
              {desc}
            </p>
          )}
          <p className="font-cairo text-xs text-white/70 mt-2 w-full" style={descStyle}>
            {t("يتطلب دعوة أو موافقة إدارية", "Requires invitation or admin approval")}
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-l from-primary to-primary/50 group-hover:w-20 transition-all duration-300" />
        </div>
      </article>
    </Link>
  );
};

export default LiveStreamCard;
