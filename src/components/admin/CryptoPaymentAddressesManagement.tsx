import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

interface CryptoPaymentAddressForm {
  id: string;
  network_key: string;
  network_name: string;
  supported_assets: string;
  address: string;
  memo_tag: string;
  warnings: string;
  warnings_en: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm: CryptoPaymentAddressForm = {
  id: "",
  network_key: "",
  network_name: "",
  supported_assets: "",
  address: "",
  memo_tag: "",
  warnings: "",
  warnings_en: "",
  display_order: 1,
  is_active: true,
};

export default function CryptoPaymentAddressesManagement() {
  const { toast } = useToast();
  const [items, setItems] = useState<CryptoPaymentAddressForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CryptoPaymentAddressForm>(emptyForm);

  const nextDisplayOrder = useMemo(() => {
    if (!items.length) return 1;
    return Math.max(...items.map((item) => item.display_order || 0)) + 1;
  }, [items]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("crypto_payment_addresses")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setItems((data || []) as CryptoPaymentAddressForm[]);
    } catch (error: any) {
      console.error("Failed to load crypto payment addresses:", error);
      toast({ title: "خطأ", description: error.message || "فشل تحميل العناوين", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => setForm({ ...emptyForm, display_order: nextDisplayOrder });

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (item: CryptoPaymentAddressForm) => {
    setForm({
      ...item,
      supported_assets: item.supported_assets || "",
      memo_tag: item.memo_tag || "",
      warnings: item.warnings || "",
      warnings_en: item.warnings_en || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.network_key.trim() || !form.network_name.trim() || !form.address.trim()) {
      toast({ title: "خطأ", description: "أدخل مفتاح الشبكة واسمها والعنوان", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        network_key: form.network_key.trim().toLowerCase(),
        network_name: form.network_name.trim(),
        supported_assets: form.supported_assets.trim() || null,
        address: form.address.trim(),
        memo_tag: form.memo_tag.trim() || null,
        warnings: form.warnings.trim() || null,
        warnings_en: form.warnings_en.trim() || null,
        display_order: Number.isFinite(form.display_order) ? form.display_order : nextDisplayOrder,
        is_active: form.is_active,
      };

      const query = (supabase as any).from("crypto_payment_addresses");
      const result = form.id
        ? await query.update(payload).eq("id", form.id)
        : await query.insert(payload);

      if (result.error) throw result.error;

      toast({ title: form.id ? "تم التحديث" : "تمت الإضافة" });
      setOpen(false);
      resetForm();
      await loadItems();
    } catch (error: any) {
      console.error("Failed to save crypto payment address:", error);
      toast({ title: "خطأ", description: error.message || "فشل حفظ العنوان", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("crypto_payment_addresses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "تم الحذف" });
      await loadItems();
    } catch (error: any) {
      console.error("Failed to delete crypto payment address:", error);
      toast({ title: "خطأ", description: error.message || "فشل حذف العنوان", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    try {
      const { error } = await (supabase as any).from("crypto_payment_addresses").update({ is_active }).eq("id", id);
      if (error) throw error;
      await loadItems();
    } catch (error: any) {
      console.error("Failed to toggle crypto payment address:", error);
      toast({ title: "خطأ", description: error.message || "فشل تحديث الحالة", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>إدارة عناوين الدفع بالكريبتو</CardTitle>
            <p className="text-sm text-muted-foreground">أضف الشبكات التي ستظهر للمستخدم عند اختيار الدفع بالكريبتو.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadItems}>
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              إضافة شبكة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الترتيب</TableHead>
                    <TableHead>الشبكة</TableHead>
                    <TableHead>الأصول المدعومة</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.display_order}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.network_name}</p>
                          <p className="text-xs text-muted-foreground" dir="ltr">{item.network_key}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.supported_assets || "—"}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="truncate text-sm" dir="ltr">{item.address}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={item.is_active} onCheckedChange={(value) => handleToggle(item.id, value)} />
                          <span className="text-xs text-muted-foreground">{item.is_active ? "مفعّل" : "معطّل"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "تعديل شبكة كريبتو" : "إضافة شبكة كريبتو"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>مفتاح الشبكة</Label>
                <Input value={form.network_key} onChange={(e) => setForm((prev) => ({ ...prev, network_key: e.target.value }))} placeholder="solana" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>اسم الشبكة</Label>
                <Input value={form.network_name} onChange={(e) => setForm((prev) => ({ ...prev, network_name: e.target.value }))} placeholder="Solana" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الأصول المدعومة</Label>
                <Input value={form.supported_assets} onChange={(e) => setForm((prev) => ({ ...prev, supported_assets: e.target.value }))} placeholder="SOL, USDT (SPL)" />
              </div>
              <div className="space-y-2">
                <Label>الترتيب</Label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm((prev) => ({ ...prev, display_order: Number(e.target.value) || 1 }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>العنوان</Label>
              <Textarea value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} rows={3} dir="ltr" />
            </div>

            <div className="space-y-2">
              <Label>Memo / Tag</Label>
              <Input value={form.memo_tag} onChange={(e) => setForm((prev) => ({ ...prev, memo_tag: e.target.value }))} dir="ltr" />
            </div>

            <div className="space-y-2">
              <Label>تحذيرات بالعربية</Label>
              <Textarea value={form.warnings} onChange={(e) => setForm((prev) => ({ ...prev, warnings: e.target.value }))} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Warnings in English</Label>
              <Textarea value={form.warnings_en} onChange={(e) => setForm((prev) => ({ ...prev, warnings_en: e.target.value }))} rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(value) => setForm((prev) => ({ ...prev, is_active: value }))} />
              <Label>تفعيل هذه الشبكة للمستخدمين</Label>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {form.id ? "حفظ التعديلات" : "إضافة الشبكة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
