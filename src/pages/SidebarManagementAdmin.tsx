import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSidebarItems, SidebarItemRow } from "@/hooks/useSidebarItems";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save } from "lucide-react";

const ACCESS_LEVELS = [
  { value: "none", label: "متاح للجميع (none)" },
  { value: "early_access", label: "وصول مبكر معتمد" },
  { value: "kyc_verified", label: "بعد KYC" },
  { value: "admin", label: "أدمن فقط" },
];

const SidebarManagementAdmin = () => {
  const { items, loading, refetch } = useSidebarItems(true);
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, Partial<SidebarItemRow>>>({});

  const update = (id: string, patch: Partial<SidebarItemRow>) => {
    setEdits((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  };

  const save = async (item: SidebarItemRow) => {
    const patch = edits[item.id];
    if (!patch) return;
    const { error } = await supabase.from("sidebar_items").update(patch).eq("id", item.id);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: "تم الحفظ" });
    setEdits((p) => { const c = { ...p }; delete c[item.id]; return c; });
    refetch();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا العنصر؟")) return;
    await supabase.from("sidebar_items").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    refetch();
  };

  const addItem = async () => {
    const key = prompt("مفتاح فريد (بالإنجليزي)");
    if (!key) return;
    const title_ar = prompt("الاسم بالعربي") || key;
    const url = prompt("الرابط (مثال: /wallet)") || "/";
    const { error } = await supabase.from("sidebar_items").insert({
      key, title_ar, url, icon_name: "Circle", display_order: items.length * 10 + 100,
    });
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    refetch();
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Helmet><title>إدارة الشريط الجانبي</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة الشريط الجانبي</h1>
        <Button onClick={addItem}><Plus className="h-4 w-4 ml-1" /> إضافة عنصر</Button>
      </div>
      <p className="text-muted-foreground mb-4 text-sm">
        تحكّم في ظهور كل عنصر بالشريط الجانبي حسب مستوى وصول المستخدم.
      </p>

      {loading ? <p>جاري التحميل...</p> : (
        <div className="space-y-3">
          {items.map((item) => {
            const e = edits[item.id] || {};
            const v = (k: keyof SidebarItemRow) => (e[k] !== undefined ? e[k] : (item as any)[k]);
            return (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{item.title_ar} <span className="text-xs text-muted-foreground">({item.key})</span></span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={Boolean(v("is_visible"))}
                        onCheckedChange={(c) => update(item.id, { is_visible: c })}
                      />
                      <Button size="icon" variant="ghost" onClick={() => remove(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><Label>العنوان (عربي)</Label>
                    <Input value={String(v("title_ar") ?? "")} onChange={(ev) => update(item.id, { title_ar: ev.target.value })} />
                  </div>
                  <div><Label>الرابط</Label>
                    <Input value={String(v("url") ?? "")} onChange={(ev) => update(item.id, { url: ev.target.value })} />
                  </div>
                  <div><Label>الأيقونة (lucide)</Label>
                    <Input value={String(v("icon_name") ?? "")} onChange={(ev) => update(item.id, { icon_name: ev.target.value })} />
                  </div>
                  <div><Label>ترتيب العرض</Label>
                    <Input type="number" value={Number(v("display_order") ?? 0)} onChange={(ev) => update(item.id, { display_order: Number(ev.target.value) })} />
                  </div>
                  <div><Label>الحد الأدنى للوصول</Label>
                    <Select value={String(v("min_access_level"))} onValueChange={(val) => update(item.id, { min_access_level: val as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACCESS_LEVELS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={Boolean(v("require_auth"))} onCheckedChange={(c) => update(item.id, { require_auth: c })} />
                      <Label>يتطلب تسجيل دخول</Label>
                    </div>
                  </div>
                  {edits[item.id] && (
                    <div className="md:col-span-2">
                      <Button onClick={() => save(item)} className="w-full"><Save className="h-4 w-4 ml-1" /> حفظ التغييرات</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarManagementAdmin;
