import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Loader2, Upload, ImageIcon, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

interface WalletCardSetting {
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

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const WalletCardManagement = () => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<WalletCardSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<WalletCardSetting | null>(null);
  const [form, setForm] = useState<Partial<WalletCardSetting>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchCards = async () => {
    const { data, error } = await supabase.from("wallet_card_settings").select("*").order("display_order");
    if (!error) setCards((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const handleEdit = (card: WalletCardSetting) => {
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
      const fileName = `wallet-${editingCard?.card_key}-${Date.now()}.jpg`;
      
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", compressed, fileName);
      formData.append("fileName", fileName);

      const res = await supabase.functions.invoke("upload-content-background", { body: formData });
      if (res.error) throw res.error;
      
      const url = res.data?.url || res.data?.publicUrl;
      if (url) {
        setForm((prev) => ({ ...prev, background_image: url }));
        toast.success(t("تم رفع الصورة بنجاح"));
      }
    } catch (err: any) {
      toast.error(err.message || t("فشل رفع الصورة"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingCard) return;
    setSaving(true);
    const { id, card_key, ...updates } = form;
    const { error } = await supabase.from("wallet_card_settings").update(updates as any).eq("id", editingCard.id);
    if (error) { toast.error(error.message); } else {
      toast.success(t("تم التحديث بنجاح"));
      setDialogOpen(false);
      fetchCards();
    }
    setSaving(false);
  };

  const cardKeyLabel = (key: string) => {
    const map: Record<string, string> = { solana: "🟣 Solana", pi: "🟡 Pi Network", ton: "💎 TON" };
    return map[key] || key;
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("إدارة كروت المحافظ")}</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("الشبكة")}</TableHead>
                <TableHead>{t("العنوان")}</TableHead>
                <TableHead>{t("الخلفية")}</TableHead>
                <TableHead>{t("الحالة")}</TableHead>
                <TableHead>{t("إجراءات")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold">{cardKeyLabel(c.card_key)}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>
                    {c.background_image ? (
                      <img src={c.background_image} alt="" className="w-16 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-10 rounded" style={{ background: c.background_gradient || c.background_color || "#333" }} />
                    )}
                  </TableCell>
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

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingCard(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("تعديل كرت")} - {editingCard ? cardKeyLabel(editingCard.card_key) : ""}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Preview */}
            {(form.background_image || form.background_gradient || form.background_color) && (
              <div className="relative rounded-xl overflow-hidden h-32">
                {form.background_image ? (
                  <img src={form.background_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: form.background_gradient || form.background_color || "#333" }} />
                )}
                <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${form.overlay_opacity || 0.6})` }} />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="text-lg font-bold" style={{ color: form.text_color || "white", fontFamily: form.font_family || "Cairo" }}>
                    {form.title || "معاينة"}
                  </span>
                </div>
              </div>
            )}

            {/* Titles */}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("العنوان (عربي)")}</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>{t("العنوان (إنجليزي)")}</Label><Input value={form.title_en || ""} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("الوصف (عربي)")}</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div><Label>{t("الوصف (إنجليزي)")}</Label><Textarea value={form.description_en || ""} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={2} /></div>
            </div>

            {/* Background */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t("الخلفية")}</Label>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label>{t("صورة خلفية")}</Label>
                  <div className="flex gap-2">
                    <Input value={form.background_image || ""} onChange={(e) => setForm({ ...form, background_image: e.target.value })} placeholder="URL..." className="flex-1" />
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
                <div><Label>{t("لون الخلفية")}</Label><Input value={form.background_color || ""} onChange={(e) => setForm({ ...form, background_color: e.target.value })} placeholder="#1a1a2e" /></div>
                <div><Label>{t("تدرج الخلفية")}</Label><Input value={form.background_gradient || ""} onChange={(e) => setForm({ ...form, background_gradient: e.target.value })} placeholder="linear-gradient(...)" /></div>
              </div>
              <div>
                <Label>{t("شفافية الطبقة العلوية")}: {((form.overlay_opacity || 0.6) * 100).toFixed(0)}%</Label>
                <Slider value={[form.overlay_opacity || 0.6]} min={0} max={1} step={0.05} onValueChange={([v]) => setForm({ ...form, overlay_opacity: v })} />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t("الخطوط والألوان")}</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t("الخط")}</Label>
                  <Select value={form.font_family || "Cairo"} onValueChange={(v) => setForm({ ...form, font_family: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Cairo", "Tajawal", "Amiri", "Noto Sans Arabic", "Inter", "Poppins", "Roboto"].map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("حجم الخط")}</Label>
                  <Select value={form.font_size || "medium"} onValueChange={(v) => setForm({ ...form, font_size: v })}>
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
                  <Label>{t("وزن الخط")}</Label>
                  <Select value={form.font_weight || "normal"} onValueChange={(v) => setForm({ ...form, font_weight: v })}>
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
                <div><Label>{t("لون النص")}</Label><Input type="color" value={form.text_color || "#ffffff"} onChange={(e) => setForm({ ...form, text_color: e.target.value })} /></div>
                <div><Label>{t("لون الحدود")}</Label><Input value={form.border_color || ""} onChange={(e) => setForm({ ...form, border_color: e.target.value })} placeholder="amber-500/20" /></div>
                <div><Label>{t("رابط الأيقونة")}</Label><Input value={form.icon_url || ""} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} /></div>
              </div>
            </div>

            {/* Alignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("محاذاة العنوان")}</Label>
                <Select value={form.title_text_align || "right"} onValueChange={(v) => setForm({ ...form, title_text_align: v })}>
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
                <Select value={form.description_text_align || "right"} onValueChange={(v) => setForm({ ...form, description_text_align: v })}>
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
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("ترتيب العرض")}</Label><Input type="number" value={form.display_order || 0} onChange={(e) => setForm({ ...form, display_order: +e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>{t("مفعّل")}</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
            {t("حفظ التغييرات")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletCardManagement;
