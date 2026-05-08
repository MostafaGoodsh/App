import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dices, Gem, Save } from "lucide-react";

interface GameRow {
  id: string;
  game_key: string;
  title: string;
  is_active: boolean;
  spin_cost_xp: number;
  rewards: Record<string, number>;
}

const REWARD_LABELS: Record<string, Record<string, string>> = {
  lucky_dice: {
    double_six: "دبل 6 (مجموع 12)",
    lucky_seven: "Lucky 7",
    any_double: "أي دبل",
    ten_plus: "مجموع 10+",
  },
  lucky_slots: {
    five_super: "5× رمز خارق",
    five_mid_super: "5× خارق صف الوسط",
    five_any: "5× أي رمز",
    five_mid: "5× صف الوسط",
    four_match: "4× تطابق",
    three_match: "3× تطابق",
  },
};

const GamesAdmin = () => {
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("game_settings" as any)
      .select("*")
      .order("game_key");
    if (error) toast.error("خطأ في تحميل الإعدادات");
    setGames(((data as any) || []) as GameRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const updateGame = (idx: number, patch: Partial<GameRow>) => {
    setGames((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const updateReward = (idx: number, key: string, value: number) => {
    setGames((prev) =>
      prev.map((g, i) =>
        i === idx ? { ...g, rewards: { ...g.rewards, [key]: value } } : g
      )
    );
  };

  const save = async (game: GameRow) => {
    setSaving(game.id);
    const { error } = await supabase
      .from("game_settings" as any)
      .update({
        is_active: game.is_active,
        spin_cost_xp: game.spin_cost_xp,
        rewards: game.rewards,
      })
      .eq("id", game.id);
    setSaving(null);
    if (error) toast.error("خطأ في الحفظ");
    else toast.success("تم الحفظ");
  };

  return (
    <>
      <Helmet>
        <title>إدارة الألعاب - لوحة التحكم</title>
      </Helmet>
      <AdminPageShell withContainer>
        <div className="space-y-4" dir="rtl">
          <h1 className="text-2xl font-bold">إدارة الألعاب</h1>

          {loading ? (
            <p className="text-muted-foreground">جاري التحميل...</p>
          ) : (
            games.map((g, idx) => {
              const labels = REWARD_LABELS[g.game_key] || {};
              const Icon = g.game_key === "lucky_dice" ? Dices : Gem;
              return (
                <Card key={g.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {g.title}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Label>مفعّلة</Label>
                        <Switch
                          checked={g.is_active}
                          onCheckedChange={(v) => updateGame(idx, { is_active: v })}
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>تكلفة المحاولة (XP)</Label>
                      <Input
                        type="number"
                        value={g.spin_cost_xp}
                        onChange={(e) =>
                          updateGame(idx, { spin_cost_xp: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>قيم الجوائز (XP)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(g.rewards).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <Label className="w-40 text-xs text-muted-foreground">
                              {labels[key] || key}
                            </Label>
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) =>
                                updateReward(idx, key, parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => save(g)}
                      disabled={saving === g.id}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saving === g.id ? "جارٍ الحفظ..." : "حفظ"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </AdminPageShell>
    </>
  );
};

export default GamesAdmin;
