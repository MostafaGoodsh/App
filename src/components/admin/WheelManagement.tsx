import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Settings, Palette, Circle, Upload, Image as ImageIcon, X } from "lucide-react";

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
  image_url: string | null;
}

interface OuterSegment {
  id: string;
  label: string;
  label_en: string | null;
  reward_value: number;
  color: string;
  probability: number;
  display_order: number;
  is_active: boolean;
  image_url: string | null;
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
  note_text: string | null;
  note_text_en: string | null;
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
  badge_outer_font_size: string | null;
  badge_middle_font_size: string | null;
  badge_inner_font_size: string | null;
  ring_outer_ratio: number | null;
  ring_middle_ratio: number | null;
  ring_inner_ratio: number | null;
  segment_font_size: string | null;
  segment_font_family: string | null;
  wheel_background_image: string | null;
  wheel_border_color: string | null;
  wheel_border_width: number | null;
  center_icon: string | null;
  center_bg_color: string | null;
  center_text_color: string | null;
  center_size: number | null;
  divider_color: string | null;
  outer_ring_stroke_color: string | null;
  middle_ring_stroke_color: string | null;
  inner_ring_stroke_color: string | null;
  pointer_color: string | null;
  inner_ring_bg_image: string | null;
  middle_ring_bg_image: string | null;
  outer_ring_bg_image: string | null;
}

interface UpgradeSegment {
  id: string;
  label: string;
  label_en: string | null;
  reward_type: string;
  reward_value: number;
  color: string;
  probability: number;
  display_order: number;
  is_active: boolean;
  image_url: string | null;
}

const FONT_SIZE_OPTIONS = [
  { value: '10px', label: '10px - صغير جداً' },
  { value: '11px', label: '11px' },
  { value: '12px', label: '12px - صغير' },
  { value: '13px', label: '13px' },
  { value: '14px', label: '14px - متوسط' },
  { value: '15px', label: '15px' },
  { value: '16px', label: '16px - عادي' },
  { value: '18px', label: '18px - كبير' },
  { value: '20px', label: '20px' },
  { value: '22px', label: '22px - كبير جداً' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px - ضخم' },
];

const FONT_FAMILY_OPTIONS = [
  { value: 'Cairo, sans-serif', label: 'Cairo (عربي)' },
  { value: 'Tajawal, sans-serif', label: 'Tajawal (عربي)' },
  { value: 'Amiri, serif', label: 'Amiri (عربي كلاسيكي)' },
  { value: 'Noto Kufi Arabic, sans-serif', label: 'Noto Kufi (كوفي)' },
  { value: 'sans-serif', label: 'Sans Serif (افتراضي)' },
  { value: 'serif', label: 'Serif (كلاسيكي)' },
  { value: 'monospace', label: 'Monospace (ثابت العرض)' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Impact, sans-serif', label: 'Impact (عريض)' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

const CENTER_ICON_OPTIONS = [
  { value: '𓂀', label: '𓂀 عين حورس' },
  { value: '☥', label: '☥ أنخ' },
  { value: '𓆣', label: '𓆣 جعران' },
  { value: '𓅃', label: '𓅃 حورس' },
  { value: '𓁢', label: '𓁢 فرعون' },
  { value: '𓊽', label: '𓊽 عمود' },
  { value: '🎰', label: '🎰 سلوت' },
  { value: '⭐', label: '⭐ نجمة' },
  { value: '💎', label: '💎 ماس' },
  { value: '🏆', label: '🏆 كأس' },
];

const uploadWheelImage = async (file: File, folder: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const { data, error } = await supabase.functions.invoke('upload-wheel-image', {
      body: formData,
    });

    if (error || !data?.url) {
      console.error('Upload error:', error || data);
      toast.error(data?.error || error?.message || 'فشل رفع الصورة');
      return null;
    }

    return data.url;
  } catch (e) {
    console.error('Upload error:', e);
    toast.error('فشل رفع الصورة');
    return null;
  }
};

const ImageUploadField = ({ label, value, onChange, folder }: { label: string; value: string | null; onChange: (url: string | null) => void; folder: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadWheelImage(file, folder);
    if (url) onChange(url);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {value && (
        <div className="relative w-full h-16 rounded-md overflow-hidden border border-border/50">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-5 w-5" onClick={() => onChange(null)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Upload className="w-3 h-3 ml-1" />}
          {uploading ? 'جاري الرفع...' : 'رفع صورة'}
        </Button>
      </div>
    </div>
  );
};

const WheelManagement = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [outerSegments, setOuterSegments] = useState<OuterSegment[]>([]);
  const [upgradeSegments, setUpgradeSegments] = useState<UpgradeSegment[]>([]);
  const [settings, setSettings] = useState<WSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [segRes, outerRes, upgradeRes, setRes] = await Promise.all([
        supabase.from("wheel_segments").select("*").order("display_order"),
        supabase.from("wheel_outer_segments").select("*").order("display_order"),
        supabase.from("wheel_upgrade_segments").select("*").order("display_order"),
        supabase.from("wheel_settings").select("*").limit(1).single(),
      ]);

      if (segRes.error) throw segRes.error;
      if (outerRes.error) throw outerRes.error;
      if (upgradeRes.error) throw upgradeRes.error;
      if (setRes.error) throw setRes.error;

      setSegments(segRes.data as unknown as Segment[]);
      setOuterSegments(outerRes.data as unknown as OuterSegment[]);
      setUpgradeSegments(upgradeRes.data as unknown as UpgradeSegment[]);
      setSettings(setRes.data as unknown as WSettings);
    } catch (error: any) {
      console.error("Wheel fetch failed:", error);
      toast.error(error.message || "فشل تحميل بيانات العجلة");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error, data } = await supabase
        .from("wheel_settings")
        .update({
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
          note_text: settings.note_text,
          note_text_en: settings.note_text_en,
          background_color: settings.background_color,
          badge_outer_label: settings.badge_outer_label,
          badge_middle_label: settings.badge_middle_label,
          badge_inner_label: settings.badge_inner_label,
          badge_outer_bg: settings.badge_outer_bg,
          badge_outer_text_color: settings.badge_outer_text_color,
          badge_outer_border_color: settings.badge_outer_border_color,
          badge_middle_bg: settings.badge_middle_bg,
          badge_middle_text_color: settings.badge_middle_text_color,
          badge_middle_border_color: settings.badge_middle_border_color,
          badge_inner_bg: settings.badge_inner_bg,
          badge_inner_text_color: settings.badge_inner_text_color,
          badge_inner_border_color: settings.badge_inner_border_color,
          badge_font_size: settings.badge_font_size,
          badge_outer_top: settings.badge_outer_top,
          badge_middle_top: settings.badge_middle_top,
          badge_inner_top: settings.badge_inner_top,
          badge_outer_font_size: settings.badge_outer_font_size,
          badge_middle_font_size: settings.badge_middle_font_size,
          badge_inner_font_size: settings.badge_inner_font_size,
          ring_outer_ratio: settings.ring_outer_ratio,
          ring_middle_ratio: settings.ring_middle_ratio,
          ring_inner_ratio: settings.ring_inner_ratio,
          segment_font_size: settings.segment_font_size,
          segment_font_family: settings.segment_font_family,
          wheel_background_image: settings.wheel_background_image,
          wheel_border_color: settings.wheel_border_color,
          wheel_border_width: settings.wheel_border_width,
          center_icon: settings.center_icon,
          center_bg_color: settings.center_bg_color,
          center_text_color: settings.center_text_color,
          center_size: settings.center_size,
          divider_color: settings.divider_color,
          outer_ring_stroke_color: settings.outer_ring_stroke_color,
          middle_ring_stroke_color: settings.middle_ring_stroke_color,
          inner_ring_stroke_color: settings.inner_ring_stroke_color,
          pointer_color: settings.pointer_color,
          inner_ring_bg_image: settings.inner_ring_bg_image,
          middle_ring_bg_image: settings.middle_ring_bg_image,
          outer_ring_bg_image: settings.outer_ring_bg_image,
        } as any)
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data as unknown as WSettings);
      toast.success("تم حفظ الإعدادات");
      await fetchAll();
    } catch (error: any) {
      console.error("Wheel settings save failed:", error);
      toast.error(error.message || "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  // Inner segments CRUD
  const saveSegment = async (seg: Segment) => {
    try {
      const { error, data } = await supabase.from("wheel_segments").update({
        label: seg.label, label_en: seg.label_en, reward_type: seg.reward_type,
        reward_value: seg.reward_value, reward_description: seg.reward_description,
        color: seg.color, probability: seg.probability, display_order: seg.display_order, is_active: seg.is_active,
        image_url: seg.image_url,
      } as any).eq("id", seg.id).select().single();
      if (error) throw error;
      setSegments((prev) => prev.map((item) => item.id === seg.id ? data as unknown as Segment : item));
      toast.success("تم حفظ القسم");
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || "فشل حفظ القسم");
    }
  };

  const addSegment = async () => {
    try {
      const { error } = await supabase.from("wheel_segments").insert({
        label: "جائزة جديدة", label_en: "New Prize", reward_type: "xp",
        reward_value: 10, color: "#D4AF37", probability: 10, display_order: segments.length + 1,
      });
      if (error) throw error;
      toast.success("تم الإضافة");
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || "فشل الإضافة");
    }
  };

  const deleteSegment = async (id: string) => {
    try {
      const { error } = await supabase.from("wheel_segments").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم الحذف");
      setSegments((s) => s.filter((x) => x.id !== id));
    } catch (error: any) {
      toast.error(error.message || "فشل الحذف");
    }
  };

  const updateSegment = (id: string, field: string, value: any) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  // Outer segments CRUD
  const saveOuterSegment = async (seg: OuterSegment) => {
    try {
      const { error, data } = await supabase.from("wheel_outer_segments").update({
        label: seg.label, label_en: seg.label_en, reward_value: seg.reward_value,
        color: seg.color, probability: seg.probability, display_order: seg.display_order, is_active: seg.is_active,
        image_url: seg.image_url,
      } as any).eq("id", seg.id).select().single();
      if (error) throw error;
      setOuterSegments((prev) => prev.map((item) => item.id === seg.id ? data as unknown as OuterSegment : item));
      toast.success("تم حفظ القسم");
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || "فشل حفظ القسم");
    }
  };

  const addOuterSegment = async () => {
    try {
      const { error } = await supabase.from("wheel_outer_segments").insert({
        label: "1 $MS-RA", label_en: "1 $MS-RA", reward_value: 1,
        color: "#D4AF37", probability: 10, display_order: outerSegments.length + 1,
      });
      if (error) throw error;
      toast.success("تم الإضافة");
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || "فشل الإضافة");
    }
  };

  const deleteOuterSegment = async (id: string) => {
    try {
      const { error } = await supabase.from("wheel_outer_segments").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم الحذف");
      setOuterSegments((s) => s.filter((x) => x.id !== id));
    } catch (error: any) {
      toast.error(error.message || "فشل الحذف");
    }
  };

  const updateOuterSegment = (id: string, field: string, value: any) => {
    setOuterSegments((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  // Upgrade segments CRUD
  const saveUpgradeSegment = async (seg: UpgradeSegment) => {
    try {
      const { error, data } = await supabase.from("wheel_upgrade_segments").update({
        label: seg.label, label_en: seg.label_en, reward_type: seg.reward_type,
        reward_value: seg.reward_value, color: seg.color, probability: seg.probability,
        display_order: seg.display_order, is_active: seg.is_active,
        image_url: seg.image_url,
      } as any).eq("id", seg.id).select().single();
      if (error) throw error;
      setUpgradeSegments((prev) => prev.map((item) => item.id === seg.id ? data as unknown as UpgradeSegment : item));
      toast.success("تم حفظ القسم");
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || "فشل حفظ القسم");
    }
  };

  const addUpgradeSegment = async () => {
    try {
      const { error } = await supabase.from("wheel_upgrade_segments").insert({
        label: "ترقية جديدة", label_en: "New Upgrade", reward_type: "mining_upgrade",
        reward_value: 1, color: "#2E8B57", probability: 10, display_order: upgradeSegments.length + 1,
      });
      if (error) throw error;
      toast.success("تم الإضافة");
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || "فشل الإضافة");
    }
  };

  const deleteUpgradeSegment = async (id: string) => {
    try {
      const { error } = await supabase.from("wheel_upgrade_segments").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم الحذف");
      setUpgradeSegments((s) => s.filter((x) => x.id !== id));
    } catch (error: any) {
      toast.error(error.message || "فشل الحذف");
    }
  };

  const updateUpgradeSegment = (id: string, field: string, value: any) => {
    setUpgradeSegments((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const renderSegmentCard = (seg: Segment) => (
    <Card key={seg.id} className="border-border/50">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0" style={{ backgroundColor: seg.color }} />
            <Input value={seg.label} onChange={(e) => updateSegment(seg.id, "label", e.target.value)} placeholder="الاسم" className="flex-1 min-w-0" />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Switch checked={seg.is_active} onCheckedChange={(v) => updateSegment(seg.id, "is_active", v)} />
            <Button size="icon" variant="ghost" onClick={() => deleteSegment(seg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div><Label className="text-xs">الاسم EN</Label><Input value={seg.label_en || ""} onChange={(e) => updateSegment(seg.id, "label_en", e.target.value)} /></div>
          <div>
            <Label className="text-xs">النوع</Label>
            <Select value={seg.reward_type} onValueChange={(v) => updateSegment(seg.id, "reward_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="xp">XP</SelectItem>
                <SelectItem value="tokens">توكنز</SelectItem>
                <SelectItem value="badge">بادج</SelectItem>
                <SelectItem value="nothing">بونص (تدوير خارجي)</SelectItem>
                <SelectItem value="upgrade">ترقية (تدوير ترقيات)</SelectItem>
                <SelectItem value="free_spin">لفات مجانية</SelectItem>
                <SelectItem value="custom">مخصص</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">القيمة</Label><Input type="number" value={seg.reward_value} onChange={(e) => updateSegment(seg.id, "reward_value", +e.target.value)} /></div>
          <div><Label className="text-xs">الاحتمال %</Label><Input type="number" value={seg.probability} onChange={(e) => updateSegment(seg.id, "probability", +e.target.value)} /></div>
          <div><Label className="text-xs">اللون</Label><Input type="color" value={seg.color} onChange={(e) => updateSegment(seg.id, "color", e.target.value)} className="h-9 p-1" /></div>
          <div><Label className="text-xs">الترتيب</Label><Input type="number" value={seg.display_order} onChange={(e) => updateSegment(seg.id, "display_order", +e.target.value)} /></div>
        </div>
        {/* Segment image upload */}
        <ImageUploadField
          label="صورة القسم (اختياري)"
          value={seg.image_url}
          onChange={(url) => updateSegment(seg.id, "image_url", url)}
          folder="inner-segments"
        />
        <Button size="sm" onClick={() => saveSegment(seg)} className="w-full"><Save className="w-4 h-4 ml-1" /> حفظ القسم</Button>
      </CardContent>
    </Card>
  );

  const renderOuterSegmentCard = (seg: OuterSegment) => (
    <Card key={seg.id} className="border-border/50">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0" style={{ backgroundColor: seg.color }} />
            <Input value={seg.label} onChange={(e) => updateOuterSegment(seg.id, "label", e.target.value)} placeholder="الاسم" className="flex-1 min-w-0" />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Switch checked={seg.is_active} onCheckedChange={(v) => updateOuterSegment(seg.id, "is_active", v)} />
            <Button size="icon" variant="ghost" onClick={() => deleteOuterSegment(seg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div><Label className="text-xs">الاسم EN</Label><Input value={seg.label_en || ""} onChange={(e) => updateOuterSegment(seg.id, "label_en", e.target.value)} /></div>
          <div><Label className="text-xs">القيمة ($MS-RA)</Label><Input type="number" step="0.1" value={seg.reward_value} onChange={(e) => updateOuterSegment(seg.id, "reward_value", +e.target.value)} /></div>
          <div><Label className="text-xs">الاحتمال %</Label><Input type="number" value={seg.probability} onChange={(e) => updateOuterSegment(seg.id, "probability", +e.target.value)} /></div>
          <div><Label className="text-xs">اللون</Label><Input type="color" value={seg.color} onChange={(e) => updateOuterSegment(seg.id, "color", e.target.value)} className="h-9 p-1" /></div>
          <div><Label className="text-xs">الترتيب</Label><Input type="number" value={seg.display_order} onChange={(e) => updateOuterSegment(seg.id, "display_order", +e.target.value)} /></div>
        </div>
        {/* Segment image upload */}
        <ImageUploadField
          label="صورة القسم (اختياري)"
          value={seg.image_url}
          onChange={(url) => updateOuterSegment(seg.id, "image_url", url)}
          folder="outer-segments"
        />
        <Button size="sm" onClick={() => saveOuterSegment(seg)} className="w-full"><Save className="w-4 h-4 ml-1" /> حفظ القسم</Button>
      </CardContent>
    </Card>
  );

  // Ring size visual preview
  const outerR = settings?.ring_outer_ratio ?? 0.74;
  const middleR = settings?.ring_middle_ratio ?? 0.50;
  const innerR = settings?.ring_inner_ratio ?? 0.48;

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden" dir="rtl">
      <Tabs defaultValue="segments">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="segments" className="text-[10px] sm:text-xs px-1"><Palette className="w-3 h-3 ml-1 hidden sm:inline" /> داخلية</TabsTrigger>
          <TabsTrigger value="outer" className="text-[10px] sm:text-xs px-1"><Circle className="w-3 h-3 ml-1 hidden sm:inline" /> $MS-RA</TabsTrigger>
          <TabsTrigger value="upgrade" className="text-[10px] sm:text-xs px-1">⬆ ترقيات</TabsTrigger>
          <TabsTrigger value="display" className="text-[10px] sm:text-xs px-1">🎨 العرض</TabsTrigger>
          <TabsTrigger value="settings" className="text-[10px] sm:text-xs px-1"><Settings className="w-3 h-3 ml-1 hidden sm:inline" /> إعدادات</TabsTrigger>
        </TabsList>

        {/* Inner Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base">أقسام الحلقة الداخلية ({segments.length})</h3>
            <Button size="sm" onClick={addSegment}><Plus className="w-4 h-4 ml-1" /> إضافة قسم</Button>
          </div>
          {segments.map(renderSegmentCard)}
        </TabsContent>

        {/* Outer Segments Tab */}
        <TabsContent value="outer" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base">أقسام الحلقة الخارجية - $MS-RA ({outerSegments.length})</h3>
            <Button size="sm" onClick={addOuterSegment}><Plus className="w-4 h-4 ml-1" /> إضافة قسم</Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">هذه الأقسام تظهر في الحلقة الخارجية وتُفعّل عند وقوف السهم الداخلي على "بونص"</p>
          {outerSegments.map(renderOuterSegmentCard)}
        </TabsContent>

        {/* Upgrade Segments Tab */}
        <TabsContent value="upgrade" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base">أقسام حلقة الترقيات ({upgradeSegments.length})</h3>
            <Button size="sm" onClick={addUpgradeSegment}><Plus className="w-4 h-4 ml-1" /> إضافة قسم</Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">هذه الأقسام تظهر في الحلقة الخارجية (الثالثة) وتُفعّل عند وقوف السهم الداخلي على "ترقية"</p>
          {upgradeSegments.map((seg) => (
            <Card key={seg.id} className="border-border/50">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0" style={{ backgroundColor: seg.color }} />
                    <Input value={seg.label} onChange={(e) => updateUpgradeSegment(seg.id, "label", e.target.value)} placeholder="الاسم" className="flex-1 min-w-0" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch checked={seg.is_active} onCheckedChange={(v) => updateUpgradeSegment(seg.id, "is_active", v)} />
                    <Button size="icon" variant="ghost" onClick={() => deleteUpgradeSegment(seg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div><Label className="text-xs">الاسم EN</Label><Input value={seg.label_en || ""} onChange={(e) => updateUpgradeSegment(seg.id, "label_en", e.target.value)} /></div>
                  <div>
                    <Label className="text-xs">النوع</Label>
                    <Select value={seg.reward_type} onValueChange={(v) => updateUpgradeSegment(seg.id, "reward_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mining_upgrade">ترقية تعدين</SelectItem>
                        <SelectItem value="rate_boost">زيادة معدل %</SelectItem>
                        <SelectItem value="strength_boost">زيادة قوة الحساب</SelectItem>
                        <SelectItem value="xp_boost">مضاعفة XP</SelectItem>
                        <SelectItem value="double_points">نقاط مضاعفة</SelectItem>
                        <SelectItem value="free_upgrade">ترقية مجانية</SelectItem>
                        <SelectItem value="quick_upgrade">ترقية سريعة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">القيمة</Label><Input type="number" step="0.1" value={seg.reward_value} onChange={(e) => updateUpgradeSegment(seg.id, "reward_value", +e.target.value)} /></div>
                  <div><Label className="text-xs">الاحتمال %</Label><Input type="number" value={seg.probability} onChange={(e) => updateUpgradeSegment(seg.id, "probability", +e.target.value)} /></div>
                  <div><Label className="text-xs">اللون</Label><Input type="color" value={seg.color} onChange={(e) => updateUpgradeSegment(seg.id, "color", e.target.value)} className="h-9 p-1" /></div>
                  <div><Label className="text-xs">الترتيب</Label><Input type="number" value={seg.display_order} onChange={(e) => updateUpgradeSegment(seg.id, "display_order", +e.target.value)} /></div>
                </div>
                {/* Segment image upload */}
                <ImageUploadField
                  label="صورة القسم (اختياري)"
                  value={seg.image_url}
                  onChange={(url) => updateUpgradeSegment(seg.id, "image_url", url)}
                  folder="upgrade-segments"
                />
                <Button size="sm" onClick={() => saveUpgradeSegment(seg)} className="w-full"><Save className="w-4 h-4 ml-1" /> حفظ القسم</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Display Settings Tab */}
        <TabsContent value="display" className="space-y-4">
          {settings && (
            <>
              {/* === Ring Sizes === */}
              <Card>
                <CardHeader><CardTitle className="text-base">📐 أحجام الحلقات</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex justify-center">
                    <div className="relative" style={{ width: 160, height: 160 }}>
                      <div className="absolute rounded-full border-2 border-emerald-500/50" style={{ width: 160, height: 160, top: 0, left: 0 }} />
                      <div className="absolute rounded-full border-2 border-amber-500/50" style={{ width: `${outerR * 100}%`, height: `${outerR * 100}%`, top: `${(1 - outerR) * 50}%`, left: `${(1 - outerR) * 50}%` }} />
                      <div className="absolute rounded-full border-2 border-amber-700/50" style={{ width: `${middleR * 100}%`, height: `${middleR * 100}%`, top: `${(1 - middleR) * 50}%`, left: `${(1 - middleR) * 50}%` }} />
                      <div className="absolute rounded-full border-2 border-amber-900/50" style={{ width: `${innerR * 100}%`, height: `${innerR * 100}%`, top: `${(1 - innerR) * 50}%`, left: `${(1 - innerR) * 50}%` }} />
                      <span className="absolute text-[8px] text-emerald-400" style={{ top: 2, left: '50%', transform: 'translateX(-50%)' }}>ترقيات</span>
                      <span className="absolute text-[8px] text-amber-400" style={{ top: `${(1 - outerR) * 50 + 4}%`, left: '50%', transform: 'translateX(-50%)' }}>$MS-RA</span>
                      <span className="absolute text-[8px] text-amber-600" style={{ top: `${(1 - middleR) * 50 + 4}%`, left: '50%', transform: 'translateX(-50%)' }}>XP</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs">🟢 فاصل الحلقة الخارجية (ترقيات)</Label>
                        <span className="text-xs font-mono text-muted-foreground">{(outerR * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[outerR * 100]} min={50} max={95} step={1} onValueChange={([v]) => setSettings({ ...settings, ring_outer_ratio: v / 100 })} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs">🟡 فاصل الحلقة الوسطى ($MS-RA)</Label>
                        <span className="text-xs font-mono text-muted-foreground">{(middleR * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[middleR * 100]} min={25} max={70} step={1} onValueChange={([v]) => setSettings({ ...settings, ring_middle_ratio: v / 100 })} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs">🟠 حد الحلقة الداخلية (XP)</Label>
                        <span className="text-xs font-mono text-muted-foreground">{(innerR * 100).toFixed(0)}%</span>
                      </div>
                      <Slider value={[innerR * 100]} min={20} max={60} step={1} onValueChange={([v]) => setSettings({ ...settings, ring_inner_ratio: v / 100 })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* === Ring Background Images === */}
              <Card>
                <CardHeader><CardTitle className="text-base">🖼️ خلفيات الحلقات</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ImageUploadField
                      label="🟢 خلفية حلقة الترقيات"
                      value={settings.outer_ring_bg_image}
                      onChange={(url) => setSettings({ ...settings, outer_ring_bg_image: url })}
                      folder="ring-backgrounds"
                    />
                    <ImageUploadField
                      label="🟡 خلفية حلقة $MS-RA"
                      value={settings.middle_ring_bg_image}
                      onChange={(url) => setSettings({ ...settings, middle_ring_bg_image: url })}
                      folder="ring-backgrounds"
                    />
                    <ImageUploadField
                      label="🟠 خلفية حلقة XP"
                      value={settings.inner_ring_bg_image}
                      onChange={(url) => setSettings({ ...settings, inner_ring_bg_image: url })}
                      folder="ring-backgrounds"
                    />
                  </div>
                  <ImageUploadField
                    label="خلفية العجلة الكاملة"
                    value={settings.wheel_background_image}
                    onChange={(url) => setSettings({ ...settings, wheel_background_image: url })}
                    folder="wheel-background"
                  />
                </CardContent>
              </Card>

              {/* === Segment Typography === */}
              <Card>
                <CardHeader><CardTitle className="text-base">🔤 خط الكتابة على الأقسام</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">حجم الخط</Label>
                      <Select value={settings.segment_font_size || "15px"} onValueChange={(v) => setSettings({ ...settings, segment_font_size: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_SIZE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">نوع الخط</Label>
                      <Select value={settings.segment_font_family || "sans-serif"} onValueChange={(v) => setSettings({ ...settings, segment_font_family: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <span style={{ fontSize: settings.segment_font_size || '15px', fontFamily: settings.segment_font_family || 'sans-serif', fontWeight: 'bold' }}>
                      عينة نص - Sample Text 123
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* === Badges === */}
              <Card>
                <CardHeader><CardTitle className="text-base">🏷️ يافطات الحلقات</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Outer badge */}
                  <div className="border border-emerald-500/20 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-sm text-emerald-400">الحلقة الخارجية (ترقيات)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div><Label className="text-xs">النص</Label><Input value={settings.badge_outer_label || ""} onChange={(e) => setSettings({ ...settings, badge_outer_label: e.target.value })} /></div>
                      <div>
                        <Label className="text-xs">الموقع (%)</Label>
                        <Slider value={[parseFloat(settings.badge_outer_top || '2')]} min={0} max={45} step={1} onValueChange={([v]) => setSettings({ ...settings, badge_outer_top: String(v) })} />
                      </div>
                      <div><Label className="text-xs">لون الخلفية</Label><Input type="color" value={settings.badge_outer_bg || "#1a1a2e"} onChange={(e) => setSettings({ ...settings, badge_outer_bg: e.target.value })} className="h-9 p-1" /></div>
                      <div><Label className="text-xs">لون النص</Label><Input type="color" value={settings.badge_outer_text_color || "#fbbf24"} onChange={(e) => setSettings({ ...settings, badge_outer_text_color: e.target.value })} className="h-9 p-1" /></div>
                      <div><Label className="text-xs">لون الحدود</Label><Input type="color" value={settings.badge_outer_border_color || "#f59e0b"} onChange={(e) => setSettings({ ...settings, badge_outer_border_color: e.target.value })} className="h-9 p-1" /></div>
                    </div>
                  </div>

                  {/* Middle badge */}
                  <div className="border border-amber-500/20 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-sm text-amber-300">الحلقة الوسطى ($MS-RA)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div><Label className="text-xs">النص</Label><Input value={settings.badge_middle_label || ""} onChange={(e) => setSettings({ ...settings, badge_middle_label: e.target.value })} /></div>
                      <div>
                        <Label className="text-xs">الموقع (%)</Label>
                        <Slider value={[parseFloat(settings.badge_middle_top || '15')]} min={0} max={45} step={1} onValueChange={([v]) => setSettings({ ...settings, badge_middle_top: String(v) })} />
                      </div>
                      <div><Label className="text-xs">لون الخلفية</Label><Input type="color" value={settings.badge_middle_bg || "#8B6914"} onChange={(e) => setSettings({ ...settings, badge_middle_bg: e.target.value })} className="h-9 p-1" /></div>
                      <div><Label className="text-xs">لون النص</Label><Input type="color" value={settings.badge_middle_text_color || "#ffffff"} onChange={(e) => setSettings({ ...settings, badge_middle_text_color: e.target.value })} className="h-9 p-1" /></div>
                      <div><Label className="text-xs">لون الحدود</Label><Input type="color" value={settings.badge_middle_border_color || "#fcd34d"} onChange={(e) => setSettings({ ...settings, badge_middle_border_color: e.target.value })} className="h-9 p-1" /></div>
                    </div>
                  </div>

                  {/* Inner badge */}
                  <div className="border border-amber-600/20 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-sm text-amber-500">الحلقة الداخلية (XP)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div><Label className="text-xs">النص</Label><Input value={settings.badge_inner_label || ""} onChange={(e) => setSettings({ ...settings, badge_inner_label: e.target.value })} /></div>
                      <div>
                        <Label className="text-xs">الموقع (%)</Label>
                        <Slider value={[parseFloat(settings.badge_inner_top || '28')]} min={0} max={48} step={1} onValueChange={([v]) => setSettings({ ...settings, badge_inner_top: String(v) })} />
                      </div>
                      <div><Label className="text-xs">لون الخلفية</Label><Input type="color" value={settings.badge_inner_bg || "#1a1a2e"} onChange={(e) => setSettings({ ...settings, badge_inner_bg: e.target.value })} className="h-9 p-1" /></div>
                      <div><Label className="text-xs">لون النص</Label><Input type="color" value={settings.badge_inner_text_color || "#34d399"} onChange={(e) => setSettings({ ...settings, badge_inner_text_color: e.target.value })} className="h-9 p-1" /></div>
                      <div><Label className="text-xs">لون الحدود</Label><Input type="color" value={settings.badge_inner_border_color || "#10b981"} onChange={(e) => setSettings({ ...settings, badge_inner_border_color: e.target.value })} className="h-9 p-1" /></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* === Wheel Appearance === */}
              <Card>
                <CardHeader><CardTitle className="text-base">🎡 مظهر العجلة</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">لون خلفية الكارد</Label>
                      <Input type="color" value={settings.background_color || "#1a1a2e"} onChange={(e) => setSettings({ ...settings, background_color: e.target.value })} className="h-9 p-1" />
                    </div>
                    <div>
                      <Label className="text-xs">لون حدود العجلة</Label>
                      <Input type="color" value={settings.wheel_border_color || "#D4AF37"} onChange={(e) => setSettings({ ...settings, wheel_border_color: e.target.value })} className="h-9 p-1" />
                    </div>
                    <div>
                      <Label className="text-xs">سمك حدود العجلة</Label>
                      <Slider value={[settings.wheel_border_width ?? 3]} min={0} max={8} step={0.5} onValueChange={([v]) => setSettings({ ...settings, wheel_border_width: v })} />
                      <span className="text-[10px] text-muted-foreground">{settings.wheel_border_width ?? 3}px</span>
                    </div>
                    <div>
                      <Label className="text-xs">لون السهم</Label>
                      <Input type="color" value={settings.pointer_color || "#f59e0b"} onChange={(e) => setSettings({ ...settings, pointer_color: e.target.value })} className="h-9 p-1" />
                    </div>
                    <div>
                      <Label className="text-xs">لون الفواصل</Label>
                      <Input type="color" value={settings.divider_color || "#D4AF37"} onChange={(e) => setSettings({ ...settings, divider_color: e.target.value })} className="h-9 p-1" />
                    </div>
                  </div>
                  <div className="border border-border/50 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-xs">ألوان حدود الأقسام</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[10px]">خارجية</Label>
                        <Input type="color" value={settings.outer_ring_stroke_color || "#2E8B57"} onChange={(e) => setSettings({ ...settings, outer_ring_stroke_color: e.target.value })} className="h-8 p-1" />
                      </div>
                      <div>
                        <Label className="text-[10px]">وسطى</Label>
                        <Input type="color" value={settings.middle_ring_stroke_color || "#D4AF37"} onChange={(e) => setSettings({ ...settings, middle_ring_stroke_color: e.target.value })} className="h-8 p-1" />
                      </div>
                      <div>
                        <Label className="text-[10px]">داخلية</Label>
                        <Input type="color" value={settings.inner_ring_stroke_color || "#D4AF37"} onChange={(e) => setSettings({ ...settings, inner_ring_stroke_color: e.target.value })} className="h-8 p-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* === Center Circle === */}
              <Card>
                <CardHeader><CardTitle className="text-base">⭕ الدائرة المركزية</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">الأيقونة</Label>
                      <Select value={settings.center_icon || "𓂀"} onValueChange={(v) => setSettings({ ...settings, center_icon: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CENTER_ICON_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">لون الخلفية</Label><Input type="color" value={settings.center_bg_color || "#D4AF37"} onChange={(e) => setSettings({ ...settings, center_bg_color: e.target.value })} className="h-9 p-1" /></div>
                    <div><Label className="text-xs">لون الأيقونة</Label><Input type="color" value={settings.center_text_color || "#1a1a2e"} onChange={(e) => setSettings({ ...settings, center_text_color: e.target.value })} className="h-9 p-1" /></div>
                    <div>
                      <Label className="text-xs">حجم المركز</Label>
                      <Slider value={[settings.center_size ?? 28]} min={15} max={50} step={1} onValueChange={([v]) => setSettings({ ...settings, center_size: v })} />
                      <span className="text-[10px] text-muted-foreground">{settings.center_size ?? 28}px</span>
                    </div>
                  </div>
                  <div className="flex justify-center py-2">
                    <div className="rounded-full flex items-center justify-center" style={{
                      width: (settings.center_size ?? 28) * 2,
                      height: (settings.center_size ?? 28) * 2,
                      background: `radial-gradient(circle, ${settings.center_bg_color || '#D4AF37'}, ${settings.center_bg_color || '#D4AF37'}88)`,
                    }}>
                      <span style={{ color: settings.center_text_color || '#1a1a2e', fontSize: (settings.center_size ?? 28) * 0.8 }}>{settings.center_icon || '𓂀'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={saveSettings} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Save className="w-4 h-4 ml-1" />}
                حفظ إعدادات العرض
              </Button>
            </>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">إعدادات العجلة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>العنوان</Label><Input value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} /></div>
                  <div><Label>العنوان EN</Label><Input value={settings.title_en || ""} onChange={(e) => setSettings({ ...settings, title_en: e.target.value })} /></div>
                  <div className="sm:col-span-2">
                    <Label>الوصف (يظهر تحت العنوان)</Label>
                    <Textarea value={settings.description || ""} onChange={(e) => setSettings({ ...settings, description: e.target.value })} rows={3} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>الوصف EN</Label>
                    <Textarea value={settings.description_en || ""} onChange={(e) => setSettings({ ...settings, description_en: e.target.value })} rows={3} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>نص المقدمة (في إطار منفصل)</Label>
                    <Textarea value={settings.intro_text || ""} onChange={(e) => setSettings({ ...settings, intro_text: e.target.value })} rows={3} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>المقدمة EN</Label>
                    <Textarea value={settings.intro_text_en || ""} onChange={(e) => setSettings({ ...settings, intro_text_en: e.target.value })} rows={3} />
                  </div>
                  <div className="sm:col-span-2 border-t border-border/50 pt-3">
                    <Label>📝 تعليق أسفل العجلة</Label>
                    <Textarea value={settings.note_text || ""} onChange={(e) => setSettings({ ...settings, note_text: e.target.value })} rows={3} placeholder="تعليق أو ملاحظة تظهر أسفل العجلة..." />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>التعليق EN</Label>
                    <Textarea value={settings.note_text_en || ""} onChange={(e) => setSettings({ ...settings, note_text_en: e.target.value })} rows={3} placeholder="Note displayed below the wheel..." />
                  </div>
                  <div><Label>تكلفة اللفة (XP)</Label><Input type="number" value={settings.spin_cost_xp} onChange={(e) => setSettings({ ...settings, spin_cost_xp: +e.target.value })} /></div>
                  <div><Label>اللفات المجانية يومياً</Label><Input type="number" value={settings.free_spins_per_day} onChange={(e) => setSettings({ ...settings, free_spins_per_day: +e.target.value })} /></div>
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
