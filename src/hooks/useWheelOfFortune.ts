import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface WheelSegment {
  id: string;
  label: string;
  label_en: string | null;
  reward_type: string;
  reward_value: number;
  reward_description: string | null;
  color: string;
  probability: number;
  display_order: number;
}

interface WheelSettings {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  spin_cost_xp: number;
  free_spins_per_day: number;
  is_visible: boolean;
  is_active: boolean;
  background_color: string | null;
  intro_text: string | null;
  intro_text_en: string | null;
}

export function useWheelOfFortune() {
  const { user } = useAuth();
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [settings, setSettings] = useState<WheelSettings | null>(null);
  const [todaySpins, setTodaySpins] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [segRes, setRes] = await Promise.all([
        supabase.from("wheel_segments").select("*").eq("is_active", true).order("display_order"),
        supabase.from("wheel_settings").select("*").limit(1).single(),
      ]);
      if (segRes.data) setSegments(segRes.data);
      if (setRes.data) setSettings(setRes.data as unknown as WheelSettings);

      // Count today's spins
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const { count } = await supabase
          .from("wheel_spin_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("spin_date", today);
        setTodaySpins(count || 0);
      }
    } catch (e) {
      console.error("Wheel data error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const canSpin = useCallback(() => {
    if (!settings || !user) return false;
    if (!settings.is_active) return false;
    if (todaySpins < settings.free_spins_per_day) return true;
    // Can spin with XP cost
    return settings.spin_cost_xp > 0;
  }, [settings, user, todaySpins]);

  const isFree = useCallback(() => {
    if (!settings) return false;
    return todaySpins < settings.free_spins_per_day;
  }, [settings, todaySpins]);

  const spinWheel = useCallback(async (): Promise<WheelSegment | null> => {
    if (!user || !settings || spinning) return null;

    setSpinning(true);
    try {
      // Weighted random selection
      const totalProb = segments.reduce((s, seg) => s + seg.probability, 0);
      let rand = Math.random() * totalProb;
      let winner = segments[0];
      for (const seg of segments) {
        rand -= seg.probability;
        if (rand <= 0) {
          winner = seg;
          break;
        }
      }

      const costXp = isFree() ? 0 : settings.spin_cost_xp;

      // Record spin
      const { error } = await supabase.from("wheel_spin_history").insert({
        user_id: user.id,
        segment_id: winner.id,
        reward_type: winner.reward_type,
        reward_value: winner.reward_value,
        xp_cost: costXp,
      });

      if (error) throw error;

      setTodaySpins((p) => p + 1);
      return winner;
    } catch (e: any) {
      toast.error("حدث خطأ أثناء تدوير العجلة");
      console.error(e);
      return null;
    } finally {
      setSpinning(false);
    }
  }, [user, settings, segments, spinning, isFree]);

  return { segments, settings, todaySpins, spinning, loading, canSpin, isFree, spinWheel, refetch: fetchData };
}
