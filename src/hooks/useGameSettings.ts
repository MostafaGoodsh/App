import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GameSettings {
  id: string;
  game_key: string;
  title: string;
  is_active: boolean;
  spin_cost_xp: number;
  rewards: Record<string, number>;
}

export function useGameSettings(gameKey: "lucky_dice" | "lucky_slots") {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("game_settings" as any)
        .select("*")
        .eq("game_key", gameKey)
        .maybeSingle();
      if (mounted) {
        setSettings((data as any) || null);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [gameKey]);

  return { settings, loading };
}
