import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Plus, Pencil, Trash2, AlertTriangle, Eye, EyeOff, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", message: "", is_active: true, is_urgent: false });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setAnnouncements(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", message: "", is_active: true, is_urgent: false });
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, message: a.message, is_active: a.is_active, is_urgent: a.is_urgent });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.message) {
      toast({ title: "خطأ", description: "العنوان والرسالة مطلوبان", variant: "destructive" });
      return;
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('platform_announcements')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: "تم التحديث" });
      } else {
        const { error } = await supabase
          .from('platform_announcements')
          .insert({ ...form, created_by: user?.id });
        if (error) throw error;
        toast({ title: "تم الإنشاء" });
      }
      setDialogOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    const { error } = await supabase.from('platform_announcements').delete().eq('id', id);
    if (!error) { toast({ title: "تم الحذف" }); fetchAnnouncements(); }
  };

  const toggleActive = async (a: Announcement) => {
    // If activating this one, deactivate others first
    if (!a.is_active) {
      await supabase.from('platform_announcements').update({ is_active: false }).neq('id', a.id);
    }
    const { error } = await supabase
      .from('platform_announcements')
      .update({ is_active: !a.is_active })
      .eq('id', a.id);
    if (!error) { toast({ title: a.is_active ? "تم إلغاء التفعيل" : "تم التفعيل" }); fetchAnnouncements(); }
  };

  if (loading) return <div className="flex justify-center p-8">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-cairo">إدارة إعلانات المنصة</h1>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 ml-1" />
          إعلان جديد
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4 font-cairo">
        الإعلان النشط سيظهر تلقائياً عند تسجيل الدخول أو فتح التطبيق. يمكن تفعيل إعلان واحد فقط في نفس الوقت.
      </p>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2 font-cairo">لا توجد إعلانات</h3>
            </CardContent>
          </Card>
        ) : (
          announcements.map((a) => (
            <Card key={a.id} className={!a.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg font-cairo flex items-center gap-2">
                    {a.is_urgent && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {a.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {a.is_urgent && <Badge variant="destructive">عاجل</Badge>}
                    <Badge variant={a.is_active ? "default" : "secondary"}>
                      {a.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 font-cairo whitespace-pre-wrap">
                  {a.message}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString('ar-EG')}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleActive(a)}>
                      {a.is_active ? <EyeOff className="h-4 w-4 ml-1" /> : <Eye className="h-4 w-4 ml-1" />}
                      {a.is_active ? 'إلغاء' : 'تفعيل'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                      <Pencil className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cairo">{editing ? 'تعديل الإعلان' : 'إعلان جديد'}</DialogTitle>
            <DialogDescription className="font-cairo">
              سيظهر هذا الإعلان لجميع المستخدمين عند تسجيل الدخول
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-cairo">العنوان</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان الإعلان" />
            </div>
            <div>
              <Label className="font-cairo">الرسالة</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="نص الإعلان..." rows={6} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label className="font-cairo">نشط</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_urgent} onCheckedChange={(v) => setForm({ ...form, is_urgent: v })} />
                <Label className="font-cairo">عاجل</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 font-cairo">حفظ</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-cairo">إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
