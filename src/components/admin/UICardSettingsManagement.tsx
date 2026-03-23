import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Loader2, Upload, LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UICardSetting {
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

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed')), 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const PAGES: Record<string, string> = {
  profile: "البروفايل",
  daily_tasks: "المهام اليومية",
  mining: "التعدين",
  learning: "التعلم",
  wallet: "المحفظة",
  reels: "الريلز",
  surveys: "الاستبيانات",
  general: "عام",
};

const FONTS = ["Cairo", "Tajawal", "Amiri", "Noto Sans Arabic", "Inter", "Poppins", "Roboto"];

const UICardSettingsManagement = () => {
  const { t, language } = useLanguage();
  const [cards, setCards] = useState<UICardSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<UICardSetting | null>(null);
  const [form, setForm] = useState<Partial<UICardSetting>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({ card_key: "", card_label: "", card_label_en: "", page_name: "general" });

  const fetchCards = async () => {
    const { data, error } = await supabase.from("ui_card_settings").select("*").order("display_order");
    if (!error) setCards((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const handleEdit = (card: UICardSetting) => {
    setEditingCard(card);
    setForm({ ...card });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fileName = `ui-card-${editingCard?.card_key}-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append("file", compressed, fileName);
      formData.append("fileName", fileName);
      const res = await supabase.functions.invoke("upload-content-background", { body: formData });
      if (res.error) throw res.error;
      const url = res.data?.url || res.data?.publicUrl;
      if (url) {
        setForm(prev => ({ ...prev, background_image: url }));
        toast.success(t("تم رفع الصورة بنجاح"));
      }
    } catch (err: any) {
      toast.error(err.message || t("فشل رفع الصورة"));
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!editingCard) return;
    setSaving(true);
    const { id, card_key, created_at, ...updates } = form as any;
    const { error } = await supabase.from("ui_card_settings").update(updates).eq("id", editingCard.id);
    if (error) toast.error(error.message);
    else { toast.success(t("تم التحديث بنجاح")); setDialogOpen(false); fetchCards(); }
    setSaving(false);
  };

  const handleAddCard = async () => {
    if (!newCard.card_key || !newCard.card_label) return;
    const { error } = await supabase.from("ui_card_settings").insert(newCard as any);
    if (error) toast.error(error.message);
    else { toast.success(t("تمت الإضافة")); setAddDialogOpen(false); setNewCard({ card_key: "", card_label: "", card_label_en: "", page_name: "general" }); fetchCards(); }
  };

  const pages = [...new Set(cards.map(c => c.page_name))];

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("إدارة تصميم الكروت")}</h1>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} size="sm"><Plus className="w-4 h-4 mr-1" />{t("إضافة كارت")}</Button>
      </div>

      <Tabs defaultValue={pages[0] || "profile"}>
        <TabsList className="flex-wrap h-auto gap-1">
          {pages.map(p => (
            <TabsTrigger key={p} value={p} className="text-xs">{PAGES[p] || p}</TabsTrigger>
          ))}
        </TabsList>
        {pages.map(page => (
          <TabsContent key={page} value={page}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("الكارت")}</TableHead>
                      <TableHead>{t("المعاينة")}</TableHead>
                      <TableHead>{t("الخط")}</TableHead>
                      <TableHead>{t("الحالة")}</TableHead>
                      <TableHead>{t("إجراءات")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.filter(c => c.page_name === page).map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold text-sm">
                          {language === "en" ? (c.card_label_en || c.card_label) : c.card_label}
                        </TableCell>
                        <TableCell>
                          {c.background_image ? (
                            <img src={c.background_image} alt="" className="w-16 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-10 rounded border" style={{ background: c.background_gradient || c.background_color || "var(--card)" }} />
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{c.font_family || "Cairo"}</TableCell>
                        <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? t("مفعّل") : t("معطّل")}</Badge></TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(c)}><Pencil className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditingCard(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("تعديل كارت")} - {editingCard ? (language === "en" ? editingCard.card_label_en || editingCard.card_label : editingCard.card_label) : ""}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden h-28 border" style={{
              background: form.background_image ? `url(${form.background_image}) center/cover` : form.background_gradient || form.background_color || "var(--card)"
            }}>
              {form.background_image && <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${form.overlay_opacity || 0.6})` }} />}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-3">
                <span style={{ color: form.title_color || form.text_color || "inherit", fontFamily: form.font_family || "Cairo", fontSize: form.title_font_size === "xlarge" ? "1.5rem" : form.title_font_size === "large" ? "1.25rem" : "1rem", fontWeight: form.title_font_weight || "bold" }}>
                  {editingCard?.card_label || "معاينة"}
                </span>
                <span className="text-xs mt-1" style={{ color: form.text_color || "inherit", fontFamily: form.font_family || "Cairo" }}>وصف الكارت</span>
              </div>
            </div>

            {/* Background */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t("الخلفية")}</Label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>{t("صورة خلفية")}</Label>
                  <div className="flex gap-2">
                    <Input value={form.background_image || ""} onChange={e => setForm({ ...form, background_image: e.target.value })} placeholder="URL..." className="flex-1" />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      <Button variant="outline" size="icon" asChild disabled={uploading}>
                        <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("لون الخلفية")}</Label><Input value={form.background_color || ""} onChange={e => setForm({ ...form, background_color: e.target.value })} placeholder="#1a1a2e" /></div>
                <div><Label>{t("تدرج الخلفية")}</Label><Input value={form.background_gradient || ""} onChange={e => setForm({ ...form, background_gradient: e.target.value })} placeholder="linear-gradient(...)" /></div>
              </div>
              {form.background_image && (
                <div>
                  <Label>{t("شفافية الطبقة العلوية")}: {((form.overlay_opacity || 0.6) * 100).toFixed(0)}%</Label>
                  <Slider value={[form.overlay_opacity || 0.6]} min={0} max={1} step={0.05} onValueChange={([v]) => setForm({ ...form, overlay_opacity: v })} />
                </div>
              )}
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t("الخطوط والألوان")}</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t("الخط")}</Label>
                  <Select value={form.font_family || "Cairo"} onValueChange={v => setForm({ ...form, font_family: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("حجم النص")}</Label>
                  <Select value={form.font_size || "medium"} onValueChange={v => setForm({ ...form, font_size: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{t("صغير")}</SelectItem>
                      <SelectItem value="medium">{t("متوسط")}</SelectItem>
                      <SelectItem value="large">{t("كبير")}</SelectItem>
                      <SelectItem value="xlarge">{t("كبير جداً")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("وزن النص")}</Label>
                  <Select value={form.font_weight || "normal"} onValueChange={v => setForm({ ...form, font_weight: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t("عادي")}</SelectItem>
                      <SelectItem value="bold">{t("غامق")}</SelectItem>
                      <SelectItem value="600">Semi-Bold</SelectItem>
                      <SelectItem value="800">Extra-Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t("حجم العنوان")}</Label>
                  <Select value={form.title_font_size || "large"} onValueChange={v => setForm({ ...form, title_font_size: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{t("صغير")}</SelectItem>
                      <SelectItem value="medium">{t("متوسط")}</SelectItem>
                      <SelectItem value="large">{t("كبير")}</SelectItem>
                      <SelectItem value="xlarge">{t("كبير جداً")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("وزن العنوان")}</Label>
                  <Select value={form.title_font_weight || "bold"} onValueChange={v => setForm({ ...form, title_font_weight: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t("عادي")}</SelectItem>
                      <SelectItem value="bold">{t("غامق")}</SelectItem>
                      <SelectItem value="600">Semi-Bold</SelectItem>
                      <SelectItem value="800">Extra-Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("انحناء الحواف")}</Label>
                  <Select value={form.border_radius || "xl"} onValueChange={v => setForm({ ...form, border_radius: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("بدون")}</SelectItem>
                      <SelectItem value="sm">{t("صغير")}</SelectItem>
                      <SelectItem value="md">{t("متوسط")}</SelectItem>
                      <SelectItem value="lg">{t("كبير")}</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                      <SelectItem value="2xl">2XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{t("لون النص")}</Label><Input type="color" value={form.text_color || "#ffffff"} onChange={e => setForm({ ...form, text_color: e.target.value })} /></div>
                <div><Label>{t("لون العنوان")}</Label><Input type="color" value={form.title_color || "#ffffff"} onChange={e => setForm({ ...form, title_color: e.target.value })} /></div>
                <div><Label>{t("لون الحدود")}</Label><Input value={form.border_color || ""} onChange={e => setForm({ ...form, border_color: e.target.value })} placeholder="#333" /></div>
              </div>
            </div>

            {/* Alignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("محاذاة العنوان")}</Label>
                <Select value={form.title_text_align || "right"} onValueChange={v => setForm({ ...form, title_text_align: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">{t("يمين")}</SelectItem>
                    <SelectItem value="center">{t("وسط")}</SelectItem>
                    <SelectItem value="left">{t("يسار")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("محاذاة الوصف")}</Label>
                <Select value={form.description_text_align || "right"} onValueChange={v => setForm({ ...form, description_text_align: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">{t("يمين")}</SelectItem>
                    <SelectItem value="center">{t("وسط")}</SelectItem>
                    <SelectItem value="left">{t("يسار")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-4">
              <div><Label>{t("ترتيب العرض")}</Label><Input type="number" value={form.display_order || 0} onChange={e => setForm({ ...form, display_order: +e.target.value })} /></div>
              <div><Label>{t("القسم")}</Label>
                <Select value={form.page_name || "general"} onValueChange={v => setForm({ ...form, page_name: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PAGES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_active ?? true} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>{t("مفعّل")}</Label>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}{t("حفظ التغييرات")}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("إضافة كارت جديد")}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>{t("المفتاح (بالإنجليزية)")}</Label><Input value={newCard.card_key} onChange={e => setNewCard({ ...newCard, card_key: e.target.value })} placeholder="e.g. mining_chart" /></div>
            <div><Label>{t("الاسم (عربي)")}</Label><Input value={newCard.card_label} onChange={e => setNewCard({ ...newCard, card_label: e.target.value })} /></div>
            <div><Label>{t("الاسم (إنجليزي)")}</Label><Input value={newCard.card_label_en} onChange={e => setNewCard({ ...newCard, card_label_en: e.target.value })} /></div>
            <div><Label>{t("القسم")}</Label>
              <Select value={newCard.page_name} onValueChange={v => setNewCard({ ...newCard, page_name: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PAGES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddCard}>{t("إضافة")}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UICardSettingsManagement;
