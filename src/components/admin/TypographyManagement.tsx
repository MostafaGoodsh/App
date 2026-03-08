import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, RefreshCw, Edit, Type, AlignRight, AlignCenter, AlignLeft } from "lucide-react";

interface TypographySetting {
  id: string;
  section_key: string;
  section_label: string;
  section_label_en: string | null;
  font_family: string;
  font_size: string;
  font_weight: string;
  text_color: string;
  text_align: string;
  title_font_family: string;
  title_font_size: string;
  title_font_weight: string;
  title_text_color: string;
  title_text_align: string;
  line_height: string;
  letter_spacing: string;
  is_active: boolean;
}

const FONT_OPTIONS = [
  { value: "Cairo", label: "Cairo" },
  { value: "Amiri", label: "Amiri" },
  { value: "Tajawal", label: "Tajawal" },
  { value: "Noto Sans Arabic", label: "Noto Sans Arabic" },
  { value: "Arial", label: "Arial" },
  { value: "Playfair Display", label: "Playfair Display" },
];

const SIZE_OPTIONS = [
  { value: "xs", label: "صغير جداً (XS)" },
  { value: "small", label: "صغير (S)" },
  { value: "medium", label: "متوسط (M)" },
  { value: "large", label: "كبير (L)" },
  { value: "xl", label: "كبير جداً (XL)" },
  { value: "2xl", label: "ضخم (2XL)" },
];

const WEIGHT_OPTIONS = [
  { value: "light", label: "خفيف (Light)" },
  { value: "normal", label: "عادي (Normal)" },
  { value: "medium", label: "وسط (Medium)" },
  { value: "semibold", label: "شبه عريض (Semibold)" },
  { value: "bold", label: "عريض (Bold)" },
];

const ALIGN_OPTIONS = [
  { value: "right", label: "يمين", icon: AlignRight },
  { value: "center", label: "وسط", icon: AlignCenter },
  { value: "left", label: "يسار", icon: AlignLeft },
];

const LINE_HEIGHT_OPTIONS = [
  { value: "tight", label: "ضيق (Tight)" },
  { value: "normal", label: "عادي (Normal)" },
  { value: "relaxed", label: "مرن (Relaxed)" },
  { value: "loose", label: "واسع (Loose)" },
];

export default function TypographyManagement() {
  const [settings, setSettings] = useState<TypographySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<TypographySetting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_typography_settings")
        .select("*")
        .order("section_key");

      if (error) throw error;
      setSettings((data as any[]) || []);
    } catch (error) {
      console.error("Error fetching typography settings:", error);
      toast({ title: "خطأ", description: "فشل في تحميل إعدادات الخطوط", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("app_typography_settings")
        .update({
          font_family: editingItem.font_family,
          font_size: editingItem.font_size,
          font_weight: editingItem.font_weight,
          text_color: editingItem.text_color,
          text_align: editingItem.text_align,
          title_font_family: editingItem.title_font_family,
          title_font_size: editingItem.title_font_size,
          title_font_weight: editingItem.title_font_weight,
          title_text_color: editingItem.title_text_color,
          title_text_align: editingItem.title_text_align,
          line_height: editingItem.line_height,
          letter_spacing: editingItem.letter_spacing,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingItem.id);

      if (error) throw error;
      toast({ title: "تم الحفظ", description: "تم حفظ إعدادات الخطوط بنجاح" });
      setDialogOpen(false);
      await fetchSettings();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getAlignIcon = (align: string) => {
    const opt = ALIGN_OPTIONS.find((a) => a.value === align);
    return opt ? <opt.icon className="h-4 w-4" /> : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cairo text-base sm:text-lg">
            <Type className="h-5 w-5" />
            إدارة الخطوط والمحاذاة | Typography Management
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">القسم</TableHead>
                <TableHead className="text-xs">خط العنوان</TableHead>
                <TableHead className="text-xs">محاذاة العنوان</TableHead>
                <TableHead className="text-xs">خط المحتوى</TableHead>
                <TableHead className="text-xs">محاذاة المحتوى</TableHead>
                <TableHead className="text-xs">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs font-cairo">
                    <div>{s.section_label}</div>
                    <div className="text-muted-foreground">{s.section_label_en}</div>
                  </TableCell>
                  <TableCell className="text-xs">{s.title_font_family} / {s.title_font_weight}</TableCell>
                  <TableCell>{getAlignIcon(s.title_text_align)}</TableCell>
                  <TableCell className="text-xs">{s.font_family} / {s.font_weight}</TableCell>
                  <TableCell>{getAlignIcon(s.text_align)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setEditingItem(s);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo">
              تعديل خطوط: {editingItem?.section_label} | {editingItem?.section_label_en}
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6">
              {/* Title Typography */}
              <div className="space-y-3 border rounded-lg p-4">
                <h3 className="font-cairo font-semibold text-sm text-primary">إعدادات العنوان | Title Settings</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">الخط</Label>
                    <Select value={editingItem.title_font_family} onValueChange={(v) => setEditingItem({ ...editingItem, title_font_family: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الحجم</Label>
                    <Select value={editingItem.title_font_size} onValueChange={(v) => setEditingItem({ ...editingItem, title_font_size: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">السمك</Label>
                    <Select value={editingItem.title_font_weight} onValueChange={(v) => setEditingItem({ ...editingItem, title_font_weight: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WEIGHT_OPTIONS.map((w) => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">المحاذاة</Label>
                    <Select value={editingItem.title_text_align} onValueChange={(v) => setEditingItem({ ...editingItem, title_text_align: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALIGN_OPTIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">لون العنوان</Label>
                  <Input type="color" className="h-8 w-20" value={editingItem.title_text_color} onChange={(e) => setEditingItem({ ...editingItem, title_text_color: e.target.value })} />
                </div>
              </div>

              {/* Content Typography */}
              <div className="space-y-3 border rounded-lg p-4">
                <h3 className="font-cairo font-semibold text-sm text-primary">إعدادات المحتوى | Content Settings</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">الخط</Label>
                    <Select value={editingItem.font_family} onValueChange={(v) => setEditingItem({ ...editingItem, font_family: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الحجم</Label>
                    <Select value={editingItem.font_size} onValueChange={(v) => setEditingItem({ ...editingItem, font_size: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">السمك</Label>
                    <Select value={editingItem.font_weight} onValueChange={(v) => setEditingItem({ ...editingItem, font_weight: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WEIGHT_OPTIONS.map((w) => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">المحاذاة</Label>
                    <Select value={editingItem.text_align} onValueChange={(v) => setEditingItem({ ...editingItem, text_align: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALIGN_OPTIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">لون النص</Label>
                    <Input type="color" className="h-8 w-20" value={editingItem.text_color} onChange={(e) => setEditingItem({ ...editingItem, text_color: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ارتفاع السطر</Label>
                    <Select value={editingItem.line_height} onValueChange={(v) => setEditingItem({ ...editingItem, line_height: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LINE_HEIGHT_OPTIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">تباعد الأحرف</Label>
                    <Select value={editingItem.letter_spacing} onValueChange={(v) => setEditingItem({ ...editingItem, letter_spacing: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">ضيق</SelectItem>
                        <SelectItem value="normal">عادي</SelectItem>
                        <SelectItem value="wide">واسع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-background/50 space-y-2">
                <h3 className="font-cairo font-semibold text-sm text-muted-foreground">معاينة | Preview</h3>
                <div style={{ textAlign: editingItem.title_text_align as any }}>
                  <p
                    style={{
                      fontFamily: `'${editingItem.title_font_family}', sans-serif`,
                      fontWeight: editingItem.title_font_weight === "bold" ? 700 : editingItem.title_font_weight === "semibold" ? 600 : editingItem.title_font_weight === "medium" ? 500 : editingItem.title_font_weight === "light" ? 300 : 400,
                      color: editingItem.title_text_color,
                      fontSize: editingItem.title_font_size === "2xl" ? "2rem" : editingItem.title_font_size === "xl" ? "1.5rem" : editingItem.title_font_size === "large" ? "1.25rem" : editingItem.title_font_size === "medium" ? "1rem" : "0.875rem",
                    }}
                  >
                    نموذج عنوان | Sample Title
                  </p>
                </div>
                <div style={{ textAlign: editingItem.text_align as any }}>
                  <p
                    style={{
                      fontFamily: `'${editingItem.font_family}', sans-serif`,
                      fontWeight: editingItem.font_weight === "bold" ? 700 : editingItem.font_weight === "semibold" ? 600 : editingItem.font_weight === "medium" ? 500 : editingItem.font_weight === "light" ? 300 : 400,
                      color: editingItem.text_color,
                      fontSize: editingItem.font_size === "2xl" ? "1.5rem" : editingItem.font_size === "xl" ? "1.25rem" : editingItem.font_size === "large" ? "1.125rem" : editingItem.font_size === "medium" ? "1rem" : editingItem.font_size === "small" ? "0.875rem" : "0.75rem",
                    }}
                  >
                    هذا نص تجريبي لمعاينة الخط والمحاذاة. This is a sample text for preview.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                  حفظ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
