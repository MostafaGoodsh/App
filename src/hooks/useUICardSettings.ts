import { useState, useEffect, useCallback, CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UICardSetting {
  id: string;
  card_key: string;
  card_label: string;
  card_label_en: string | null;
  page_name: string;
  background_image: string | null;
  background_color: string | null;
  background_gradient: string | null;
  text_color: string | null;
  title_color: string | null;
  font_family: string | null;
  font_size: string | null;
  font_weight: string | null;
  title_font_size: string | null;
  title_font_weight: string | null;
  title_text_align: string | null;
  description_text_align: string | null;
  icon_url: string | null;
  overlay_opacity: number | null;
  border_color: string | null;
  border_radius: string | null;
  is_active: boolean;
  display_order: number;
}

const fontSizeMap: Record<string, string> = {
  small: "0.875rem",
  medium: "1rem",
  large: "1.25rem",
  xlarge: "1.5rem",
};

const titleFontSizeMap: Record<string, string> = {
  small: "1rem",
  medium: "1.25rem",
  large: "1.5rem",
  xlarge: "2rem",
};

const borderRadiusMap: Record<string, string> = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
};

export const useUICardSettings = () => {
  const [settings, setSettings] = useState<Record<string, UICardSetting>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("ui_card_settings")
      .select("*")
      .order("display_order");
    if (!error && data) {
      const map: Record<string, UICardSetting> = {};
      (data as any[]).forEach((s) => { map[s.card_key] = s; });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
    const channel = supabase
      .channel("ui_card_settings_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ui_card_settings" }, fetchSettings)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchSettings]);

  const getCardSetting = (key: string) => settings[key];

  const getCardStyle = (key: string): CSSProperties => {
    const s = settings[key];
    if (!s) return {};
    const style: CSSProperties = {};
    if (s.background_image) {
      style.backgroundImage = `url(${s.background_image})`;
      style.backgroundSize = "cover";
      style.backgroundPosition = "center";
    } else if (s.background_gradient) {
      style.background = s.background_gradient;
    } else if (s.background_color) {
      style.backgroundColor = s.background_color;
    }
    if (s.text_color) style.color = s.text_color;
    if (s.font_family) style.fontFamily = s.font_family;
    if (s.font_size) style.fontSize = fontSizeMap[s.font_size] || s.font_size;
    if (s.font_weight) style.fontWeight = s.font_weight;
    if (s.border_color) style.borderColor = s.border_color;
    if (s.border_radius) style.borderRadius = borderRadiusMap[s.border_radius] || s.border_radius;
    return style;
  };

  const getTitleStyle = (key: string): CSSProperties => {
    const s = settings[key];
    if (!s) return {};
    const style: CSSProperties = {};
    if (s.title_color) style.color = s.title_color;
    if (s.font_family) style.fontFamily = s.font_family;
    if (s.title_font_size) style.fontSize = titleFontSizeMap[s.title_font_size] || s.title_font_size;
    if (s.title_font_weight) style.fontWeight = s.title_font_weight;
    if (s.title_text_align) style.textAlign = s.title_text_align as any;
    return style;
  };

  const getDescriptionStyle = (key: string): CSSProperties => {
    const s = settings[key];
    if (!s) return {};
    const style: CSSProperties = {};
    if (s.text_color) style.color = s.text_color;
    if (s.font_family) style.fontFamily = s.font_family;
    if (s.font_size) style.fontSize = fontSizeMap[s.font_size] || s.font_size;
    if (s.font_weight) style.fontWeight = s.font_weight;
    if (s.description_text_align) style.textAlign = s.description_text_align as any;
    return style;
  };

  return { settings, loading, getCardSetting, getCardStyle, getTitleStyle, getDescriptionStyle, refetch: fetchSettings };
};
