import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { RichContentEditor } from "@/components/admin/RichContentEditor";

interface PlatformMessage {
  id: string;
  content_key: string;
  text_content: string | null;
  position_order: number | null;
  is_active: boolean | null;
  created_at: string;
}

export default function PlatformMessageManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<PlatformMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<PlatformMessage | null>(null);
  const [formData, setFormData] = useState({
    content_key: '',
    text_content: '',
    position_order: 0,
    is_active: true,
  });

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_content')
      .select('*')
      .eq('content_type', 'platform_message')
      .order('position_order', { ascending: true });
    if (error) console.error(error);
    setMessages(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ content_key: '', text_content: '', position_order: 0, is_active: true });
    setEditing(null);
  };

  const handleEdit = (msg: PlatformMessage) => {
    setEditing(msg);
    setFormData({
      content_key: msg.content_key,
      text_content: msg.text_content || '',
      position_order: msg.position_order || 0,
      is_active: msg.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      content_key: formData.content_key,
      content_type: 'platform_message',
      text_content: formData.text_content,
      position_order: formData.position_order,
      is_active: formData.is_active,
      created_by: user.id,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('app_content').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast({ title: "تم التحديث", description: "تم تحديث رسالة المنصة بنجاح" });
      } else {
        const { error } = await supabase.from('app_content').insert([payload]);
        if (error) throw error;
        toast({ title: "تم الإنشاء", description: "تم إنشاء رسالة المنصة بنجاح" });
      }
      setShowDialog(false);
      resetForm();
      fetchMessages();
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ في الحفظ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from('app_content').delete().eq('id', id);
    if (error) {
      toast({ title: "خطأ", description: "حدث خطأ في الحذف", variant: "destructive" });
    } else {
      toast({ title: "تم الحذف" });
      fetchMessages();
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    const { error } = await supabase.from('app_content').update({ is_active: !current }).eq('id', id);
    if (!error) {
      fetchMessages();
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    }
  };

  if (loading) return <div className="text-center p-8">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold arabic-text">إدارة رسالة المنصة</h1>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />إضافة رسالة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="arabic-text">{editing ? 'تعديل الرسالة' : 'إضافة رسالة جديدة'}</DialogTitle>
              <DialogDescription className="arabic-text">إدارة محتوى رسالة المنصة في صفحة التعلم</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>عنوان/مفتاح الرسالة</Label>
                <Input value={formData.content_key} onChange={(e) => setFormData({...formData, content_key: e.target.value})} placeholder="مثال: رسالة المنصة" required />
              </div>
              <div>
                <Label>محتوى الرسالة</Label>
                <RichContentEditor
                  value={formData.text_content}
                  onChange={(v) => setFormData({...formData, text_content: v})}
                  placeholder="اكتب محتوى رسالة المنصة..."
                  rows={6}
                />
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input type="number" value={formData.position_order} onChange={(e) => setFormData({...formData, position_order: parseInt(e.target.value) || 0})} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} />
                <Label>نشط</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">{editing ? 'تحديث' : 'إضافة'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <Card><CardContent className="text-center py-12 arabic-text"><MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p>لا توجد رسائل منصة</p></CardContent></Card>
        ) : messages.map((msg) => (
          <Card key={msg.id} className={!msg.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg arabic-text">{msg.content_key}</CardTitle>
                <Badge variant={msg.is_active ? 'default' : 'secondary'}>{msg.is_active ? 'نشط' : 'غير نشط'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap arabic-text">{msg.text_content}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => toggleStatus(msg.id, msg.is_active ?? true)}>
                  {msg.is_active ? <><EyeOff className="w-4 h-4 ml-1" />إخفاء</> : <><Eye className="w-4 h-4 ml-1" />إظهار</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(msg)}><Pencil className="w-4 h-4 ml-1" />تعديل</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(msg.id)}><Trash2 className="w-4 h-4 ml-1" />حذف</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
