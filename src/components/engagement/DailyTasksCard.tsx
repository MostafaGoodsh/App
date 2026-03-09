import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTypographyStyles, useTypography } from "@/hooks/useTypography";
import { resolveFontSize, resolveFontWeight } from "@/utils/typography";
import type { HomePageCard } from "@/types/homeCards";

interface DailyTasksCardContent {
  id: string;
  title: string;
  description: string;
  background_image_url: string;
  is_active: boolean;
}

const DailyTasksCard = ({ card }: { card?: HomePageCard }) => {
  const [content, setContent] = useState<DailyTasksCardContent | null>(null);
  const [loading, setLoading] = useState(!card);
  const { getSetting } = useTypography();
  const homeSetting = getSetting("home_cards");

  useEffect(() => {
    if (card) return;

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from("daily_tasks_card_content")
          .select("*")
          .eq("is_active", true)
          .maybeSingle();

        if (error) console.error("Error fetching content:", error);
        if (data) setContent(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [card]);

  if (loading) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80" />;
  }

  const displayTitle = card?.title || content?.title || "Tasks | المهام";
  const displayDescription = card?.description ?? (content?.description || "أكمل المهام اليومية واحصل على النقاط وقم ببناء سلسلة حضورك المتتالي");
  const backgroundImage =
    card?.background_image ||
    content?.background_image_url ||
    "/lovable-uploads/70f695e0-7133-47ea-82e8-7cca2196e7f4.png";

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

  const href = card?.route_path || "/daily-tasks";

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
            alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300"
            loading="lazy"
          />
        )}
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end items-stretch bg-gradient-to-t from-background/90 via-background/60 to-transparent">
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
    </Link>
  );
};

export default DailyTasksCard;
