import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PresaleRound {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  token_price: number;
  currency: string;
  total_supply: number;
  sold_amount: number;
  min_purchase: number;
  max_purchase: number | null;
  stage: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyForm = {
  title: "",
  title_en: "",
  description: "",
  description_en: "",
  token_price: 0.01,
  currency: "USD",
  total_supply: 0,
  sold_amount: 0,
  min_purchase: 1,
  max_purchase: null as number | null,
  stage: "seed",
  status: "upcoming",
  start_date: "",
  end_date: "",
  display_order: 0,
  is_active: true,
};

const PresaleManagement = () => {
  const { t } = useLanguage();
  const [rounds, setRounds] = useState<PresaleRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRounds = async () => {
    const { data, error } = await supabase
      .from("presale_rounds")
      .select("*")
      .order("display_order");
    if (!error) setRounds((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRounds(); }, []);

  const handleSave = async () => {
    if (!form.title) { toast.error(t("العنوان مطلوب")); return; }
    setSaving(true);
    const payload = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      max_purchase: form.max_purchase || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("presale_rounds").update(payload as any).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("presale_rounds").insert(payload as any));
    }

    if (error) { toast.error(error.message); } else {
      toast.success(editingId ? t("تم التحديث") : t("تمت الإضافة"));
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchRounds();
    }
    setSaving(false);
  };

  const handleEdit = (r: PresaleRound) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      title_en: r.title_en || "",
      description: r.description || "",
      description_en: r.description_en || "",
      token_price: r.token_price,
      currency: r.currency,
      total_supply: r.total_supply,
      sold_amount: r.sold_amount,
      min_purchase: r.min_purchase,
      max_purchase: r.max_purchase,
      stage: r.stage,
      status: r.status,
      start_date: r.start_date?.slice(0, 16) || "",
      end_date: r.end_date?.slice(0, 16) || "",
      display_order: r.display_order,
      is_active: r.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("هل أنت متأكد من الحذف؟"))) return;
    await supabase.from("presale_rounds").delete().eq("id", id);
    toast.success(t("تم الحذف"));
    fetchRounds();
  };

  const stageBadge = (stage: string) => {
    const map: Record<string, string> = { seed: "🌱 Seed", private: "🔒 Private", public: "🌐 Public" };
    return map[stage] || stage;
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      upcoming: "outline", active: "default", ended: "secondary", cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("إدارة البيع المبكر")}</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t("إضافة جولة")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("تعديل جولة") : t("إضافة جولة جديدة")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("العنوان (عربي)")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>{t("العنوان (إنجليزي)")}</Label><Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("الوصف (عربي)")}</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>{t("الوصف (إنجليزي)")}</Label><Textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{t("سعر التوكن")}</Label><Input type="number" step="0.001" value={form.token_price} onChange={(e) => setForm({ ...form, token_price: +e.target.value })} /></div>
                <div><Label>{t("العملة")}</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
                <div><Label>{t("إجمالي المعروض")}</Label><Input type="number" value={form.total_supply} onChange={(e) => setForm({ ...form, total_supply: +e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{t("الكمية المباعة")}</Label><Input type="number" value={form.sold_amount} onChange={(e) => setForm({ ...form, sold_amount: +e.target.value })} /></div>
                <div><Label>{t("أقل شراء")}</Label><Input type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: +e.target.value })} /></div>
                <div><Label>{t("أقصى شراء")}</Label><Input type="number" value={form.max_purchase || ""} onChange={(e) => setForm({ ...form, max_purchase: e.target.value ? +e.target.value : null })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("المرحلة")}</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("الحالة")}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">{t("قادمة")}</SelectItem>
                      <SelectItem value="active">{t("نشطة")}</SelectItem>
                      <SelectItem value="ended">{t("منتهية")}</SelectItem>
                      <SelectItem value="cancelled">{t("ملغية")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("تاريخ البداية")}</Label><Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><Label>{t("تاريخ النهاية")}</Label><Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("ترتيب العرض")}</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: +e.target.value })} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>{t("مفعّلة")}</Label>
                </div>
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
                <TableHead>{t("المرحلة")}</TableHead>
                <TableHead>{t("الحالة")}</TableHead>
                <TableHead>{t("السعر")}</TableHead>
                <TableHead>{t("المباع / المعروض")}</TableHead>
                <TableHead>{t("إجراءات")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rounds.map((r) => (
                <TableRow key={r.id} className={!r.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{stageBadge(r.stage)}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell>{r.token_price} {r.currency}</TableCell>
                  <TableCell>{r.sold_amount.toLocaleString()} / {r.total_supply.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(r)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rounds.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("لا توجد جولات بيع مبكر")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PresaleManagement;
