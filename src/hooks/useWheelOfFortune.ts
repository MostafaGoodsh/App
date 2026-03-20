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
  badge_outer_label: string | null;
  badge_middle_label: string | null;
  badge_inner_label: string | null;
  badge_outer_bg: string | null;
  badge_outer_text_color: string | null;
  badge_outer_border_color: string | null;
  badge_middle_bg: string | null;
  badge_middle_text_color: string | null;
  badge_middle_border_color: string | null;
  badge_inner_bg: string | null;
  badge_inner_text_color: string | null;
  badge_inner_border_color: string | null;
  badge_font_size: string | null;
  badge_outer_top: string | null;
  badge_middle_top: string | null;
  badge_inner_top: string | null;
  ring_outer_ratio: number | null;
  ring_middle_ratio: number | null;
  ring_inner_ratio: number | null;
  segment_font_size: string | null;
  segment_font_family: string | null;
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

      // Record spin in history
      const { error } = await supabase.from("wheel_spin_history").insert({
        user_id: user.id,
        segment_id: winner.id,
        reward_type: winner.reward_type,
        reward_value: winner.reward_value,
        xp_cost: costXp,
      });

      if (error) throw error;

      // Process reward distribution (80/20 split + liquidity pool)
      const { data: rewardResult, error: rewardError } = await supabase.rpc('process_wheel_reward', {
        p_user_id: user.id,
        p_reward_type: winner.reward_type,
        p_reward_value: winner.reward_value,
        p_spin_cost: costXp,
        p_is_bonus: false,
      });

      if (rewardError) {
        console.error('Reward processing error:', rewardError);
      }

      setTodaySpins((p) => p + 1);
      return { ...winner, _rewardResult: rewardResult } as any;
    } catch (e: any) {
      toast.error("حدث خطأ أثناء تدوير العجلة");
      console.error(e);
      return null;
    } finally {
      setSpinning(false);
    }
  }, [user, settings, segments, spinning, isFree]);

  // Process bonus ring MS-RA reward
  const processBonusReward = useCallback(async (msraValue: number) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.rpc('process_wheel_reward', {
        p_user_id: user.id,
        p_reward_type: 'msra',
        p_reward_value: msraValue,
        p_spin_cost: 0,
        p_is_bonus: true,
      });
      if (error) {
        console.error('Bonus reward error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.error('Bonus reward error:', e);
      return null;
    }
  }, [user]);

  return { segments, settings, todaySpins, setTodaySpins, spinning, loading, canSpin, isFree, spinWheel, processBonusReward, refetch: fetchData };
}
