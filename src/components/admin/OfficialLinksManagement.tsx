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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface OfficialLink {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  url: string;
  icon_name: string | null;
  icon_url: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyForm = {
  title: "",
  title_en: "",
  description: "",
  description_en: "",
  url: "",
  icon_name: "",
  icon_url: "",
  category: "social",
  display_order: 0,
  is_active: true,
};

const OfficialLinksManagement = () => {
  const { t } = useLanguage();
  const [links, setLinks] = useState<OfficialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("official_links")
      .select("*")
      .order("display_order");
    if (!error) setLinks((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.url) { toast.error(t("العنوان والرابط مطلوبان")); return; }
    setSaving(true);
    const payload = {
      ...form,
      icon_name: form.icon_name || null,
      icon_url: form.icon_url || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("official_links").update(payload as any).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("official_links").insert(payload as any));
    }

    if (error) { toast.error(error.message); } else {
      toast.success(editingId ? t("تم التحديث") : t("تمت الإضافة"));
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchLinks();
    }
    setSaving(false);
  };

  const handleEdit = (l: OfficialLink) => {
    setEditingId(l.id);
    setForm({
      title: l.title,
      title_en: l.title_en || "",
      description: l.description || "",
      description_en: l.description_en || "",
      url: l.url,
      icon_name: l.icon_name || "",
      icon_url: l.icon_url || "",
      category: l.category || "social",
      display_order: l.display_order,
      is_active: l.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("هل أنت متأكد من الحذف؟"))) return;
    await supabase.from("official_links").delete().eq("id", id);
    toast.success(t("تم الحذف"));
    fetchLinks();
  };

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      social: "📱 " + t("تواصل اجتماعي"),
      website: "🌐 " + t("موقع"),
      document: "📄 " + t("مستند"),
      community: "👥 " + t("مجتمع"),
      other: "📌 " + t("أخرى"),
    };
    return map[cat] || cat;
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("إدارة الروابط الرسمية")}</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t("إضافة رابط")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("تعديل رابط") : t("إضافة رابط جديد")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("العنوان (عربي)")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>{t("العنوان (إنجليزي)")}</Label><Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
              </div>
              <div><Label>{t("الرابط (URL)")}</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("الوصف (عربي)")}</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
                <div><Label>{t("الوصف (إنجليزي)")}</Label><Textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={2} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("اسم الأيقونة")}</Label><Input value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} placeholder="twitter, telegram..." /></div>
                <div><Label>{t("رابط الأيقونة")}</Label><Input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="https://..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("التصنيف")}</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">{t("تواصل اجتماعي")}</SelectItem>
                      <SelectItem value="website">{t("موقع")}</SelectItem>
                      <SelectItem value="document">{t("مستند")}</SelectItem>
                      <SelectItem value="community">{t("مجتمع")}</SelectItem>
                      <SelectItem value="other">{t("أخرى")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t("ترتيب العرض")}</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: +e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>{t("مفعّل")}</Label>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
              {editingId ? t("تحديث") : t("إضافة")}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("العنوان")}</TableHead>
                <TableHead>{t("الرابط")}</TableHead>
                <TableHead>{t("التصنيف")}</TableHead>
                <TableHead>{t("الحالة")}</TableHead>
                <TableHead>{t("إجراءات")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((l) => (
                <TableRow key={l.id} className={!l.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 text-xs truncate max-w-[150px]">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" /> {l.url}
                    </a>
                  </TableCell>
                  <TableCell><Badge variant="outline">{categoryLabel(l.category || "other")}</Badge></TableCell>
                  <TableCell><Badge variant={l.is_active ? "default" : "secondary"}>{l.is_active ? t("مفعّل") : t("معطّل")}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(l)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(l.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {links.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("لا توجد روابط رسمية")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficialLinksManagement;
