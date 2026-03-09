import type { CSSProperties } from "react";
import type { HomePageCard } from "@/types/homeCards";
import { resolveFontSize, resolveFontWeight } from "@/utils/typography";

const CARD_TYPE_SECTION_KEY: Record<string, string> = {
  callout: "callout",
  learning: "learning",
  reels: "reels",
  roadmap: "roadmap",
  surveys: "surveys",
  tasks: "daily_tasks",
  updates: "updates",
  wallet: "wallet",
};

export function getCardTypographySectionKey(cardType?: string) {
  if (!cardType) return "home_cards";
  return CARD_TYPE_SECTION_KEY[cardType] ?? "home_cards";
}

export function buildHomeCardTypographyStyles(
  card: HomePageCard | undefined,
  baseTitleStyle: CSSProperties,
  baseContentStyle: CSSProperties,
) {
  const titleStyle: CSSProperties = {
    ...baseTitleStyle,
    textAlign: (baseTitleStyle.textAlign ?? card?.title_text_align ?? "center") as CSSProperties["textAlign"],
    fontFamily: (baseTitleStyle.fontFamily ??
      (card?.font_family ? `'${card.font_family}', sans-serif` : undefined)) as CSSProperties["fontFamily"],
    color: (baseTitleStyle.color ?? card?.text_color ?? undefined) as CSSProperties["color"],
    fontSize: (baseTitleStyle.fontSize ?? resolveFontSize(card?.title_font_size, "1.5rem")) as CSSProperties["fontSize"],
    fontWeight: (baseTitleStyle.fontWeight ??
      resolveFontWeight(card?.font_weight, 700)) as CSSProperties["fontWeight"],
  };

  const descStyle: CSSProperties = {
    ...baseContentStyle,
    textAlign: (baseContentStyle.textAlign ?? card?.description_text_align ?? "center") as CSSProperties["textAlign"],
    fontFamily: (baseContentStyle.fontFamily ??
      (card?.font_family ? `'${card.font_family}', sans-serif` : undefined)) as CSSProperties["fontFamily"],
    color: (baseContentStyle.color ?? card?.text_color ?? undefined) as CSSProperties["color"],
    fontSize: (baseContentStyle.fontSize ??
      resolveFontSize(card?.content_font_size || card?.font_size, "1rem")) as CSSProperties["fontSize"],
    fontWeight: (baseContentStyle.fontWeight ??
      resolveFontWeight(card?.font_weight, 400)) as CSSProperties["fontWeight"],
  };

  return { titleStyle, descStyle };
}
