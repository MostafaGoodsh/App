import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Settings, Palette } from "lucide-react";

interface Segment {
  id: string;
  label: string;
  label_en: string | null;
  reward_type: string;
  reward_value: number;
  reward_description: string | null;
  color: string;
  probability: number;
  display_order: number;
  is_active: boolean;
}

interface WSettings {
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

const WheelManagement = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [settings, setSettings] = useState<WSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [segRes, setRes] = await Promise.all([
      supabase.from("wheel_segments").select("*").order("display_order"),
      supabase.from("wheel_settings").select("*").limit(1).single(),
    ]);
    if (segRes.data) setSegments(segRes.data as unknown as Segment[]);
    if (setRes.data) setSettings(setRes.data as unknown as WSettings);
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from("wheel_settings").update({
      title: settings.title,
      title_en: settings.title_en,
      description: settings.description,
      description_en: settings.description_en,
      spin_cost_xp: settings.spin_cost_xp,
      free_spins_per_day: settings.free_spins_per_day,
      is_visible: settings.is_visible,
      is_active: settings.is_active,
      intro_text: settings.intro_text,
      intro_text_en: settings.intro_text_en,
      background_color: settings.background_color,
    }).eq("id", settings.id);
    setSaving(false);
    if (error) toast.error("فشل الحفظ");
    else toast.success("تم حفظ الإعدادات");
  };

  const saveSegment = async (seg: Segment) => {
    const { error } = await supabase.from("wheel_segments").update({
      label: seg.label,
      label_en: seg.label_en,
      reward_type: seg.reward_type,
      reward_value: seg.reward_value,
      reward_description: seg.reward_description,
      color: seg.color,
      probability: seg.probability,
      display_order: seg.display_order,
      is_active: seg.is_active,
    }).eq("id", seg.id);
    if (error) toast.error("فشل حفظ القسم");
    else toast.success("تم حفظ القسم");
  };

  const addSegment = async () => {
    const { error } = await supabase.from("wheel_segments").insert({
      label: "جائزة جديدة",
      label_en: "New Prize",
      reward_type: "xp",
      reward_value: 10,
      color: "#D4AF37",
      probability: 10,
      display_order: segments.length + 1,
    });
    if (error) toast.error("فشل الإضافة");
    else { toast.success("تم الإضافة"); fetchAll(); }
  };

  const deleteSegment = async (id: string) => {
    const { error } = await supabase.from("wheel_segments").delete().eq("id", id);
    if (error) toast.error("فشل الحذف");
    else { toast.success("تم الحذف"); setSegments((s) => s.filter((x) => x.id !== id)); }
  };

  const updateSegment = (id: string, field: string, value: any) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs defaultValue="segments">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="segments"><Palette className="w-4 h-4 ml-1" /> الأقسام</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 ml-1" /> الإعدادات</TabsTrigger>
        </TabsList>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">أقسام العجلة ({segments.length})</h3>
            <Button size="sm" onClick={addSegment}><Plus className="w-4 h-4 ml-1" /> إضافة قسم</Button>
          </div>
          {segments.map((seg) => (
            <Card key={seg.id} className="border-border/50">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: seg.color }} />
                    <Input value={seg.label} onChange={(e) => updateSegment(seg.id, "label", e.target.value)} placeholder="الاسم" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={seg.is_active} onCheckedChange={(v) => updateSegment(seg.id, "is_active", v)} />
                    <Button size="icon" variant="ghost" onClick={() => deleteSegment(seg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">الاسم EN</Label>
                    <Input value={seg.label_en || ""} onChange={(e) => updateSegment(seg.id, "label_en", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">النوع</Label>
                    <Select value={seg.reward_type} onValueChange={(v) => updateSegment(seg.id, "reward_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xp">XP</SelectItem>
                        <SelectItem value="tokens">توكنز</SelectItem>
                        <SelectItem value="badge">بادج</SelectItem>
                        <SelectItem value="nothing">لا شيء</SelectItem>
                        <SelectItem value="custom">مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">القيمة</Label>
                    <Input type="number" value={seg.reward_value} onChange={(e) => updateSegment(seg.id, "reward_value", +e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">الاحتمال %</Label>
                    <Input type="number" value={seg.probability} onChange={(e) => updateSegment(seg.id, "probability", +e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">اللون</Label>
                    <Input type="color" value={seg.color} onChange={(e) => updateSegment(seg.id, "color", e.target.value)} className="h-9 p-1" />
                  </div>
                  <div>
                    <Label className="text-xs">الترتيب</Label>
                    <Input type="number" value={seg.display_order} onChange={(e) => updateSegment(seg.id, "display_order", +e.target.value)} />
                  </div>
                </div>
                <Button size="sm" onClick={() => saveSegment(seg)} className="w-full">
                  <Save className="w-4 h-4 ml-1" /> حفظ القسم
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <Card>
              <CardHeader><CardTitle>إعدادات العجلة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>العنوان</Label>
                    <Input value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>العنوان EN</Label>
                    <Input value={settings.title_en || ""} onChange={(e) => setSettings({ ...settings, title_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>الوصف</Label>
                    <Textarea value={settings.description || ""} onChange={(e) => setSettings({ ...settings, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>الوصف EN</Label>
                    <Textarea value={settings.description_en || ""} onChange={(e) => setSettings({ ...settings, description_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>نص المقدمة</Label>
                    <Textarea value={settings.intro_text || ""} onChange={(e) => setSettings({ ...settings, intro_text: e.target.value })} />
                  </div>
                  <div>
                    <Label>المقدمة EN</Label>
                    <Textarea value={settings.intro_text_en || ""} onChange={(e) => setSettings({ ...settings, intro_text_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>تكلفة اللفة (XP)</Label>
                    <Input type="number" value={settings.spin_cost_xp} onChange={(e) => setSettings({ ...settings, spin_cost_xp: +e.target.value })} />
                  </div>
                  <div>
                    <Label>اللفات المجانية يومياً</Label>
                    <Input type="number" value={settings.free_spins_per_day} onChange={(e) => setSettings({ ...settings, free_spins_per_day: +e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={settings.is_visible} onCheckedChange={(v) => setSettings({ ...settings, is_visible: v })} />
                    <Label>مرئية</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={settings.is_active} onCheckedChange={(v) => setSettings({ ...settings, is_active: v })} />
                    <Label>نشطة</Label>
                  </div>
                </div>
                <Button onClick={saveSettings} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Save className="w-4 h-4 ml-1" />}
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WheelManagement;
