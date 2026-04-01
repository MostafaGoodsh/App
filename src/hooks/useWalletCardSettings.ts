import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WalletCardSetting {
  id: string;
  card_key: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  background_image: string | null;
  background_color: string | null;
  background_gradient: string | null;
  text_color: string | null;
  font_family: string | null;
  font_size: string | null;
  font_weight: string | null;
  title_font_size: string | null;
  title_text_align: string | null;
  description_text_align: string | null;
  icon_url: string | null;
  overlay_opacity: number | null;
  border_color: string | null;
  is_active: boolean;
  display_order: number;
}

export const useWalletCardSettings = () => {
  const [settings, setSettings] = useState<Record<string, WalletCardSetting>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("wallet_card_settings")
      .select("*")
      .order("display_order");
    if (!error && data) {
      const map: Record<string, WalletCardSetting> = {};
      (data as any[]).forEach((s) => { map[s.card_key] = s; });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel(`wallet_card_settings_changes_${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "wallet_card_settings" }, fetchSettings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const getCardSetting = (key: string) => settings[key];

  return { settings, loading, getCardSetting, refetch: fetchSettings };
};
