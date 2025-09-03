import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pencil, Plus, Calendar, Bell, X, Trash2, Eye, EyeOff } from "lucide-react";

interface UpdateContent {
  id: string;
  content_key: string;
  content_type: string;
  text_content?: string;
  position_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function UpdatesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<UpdateContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<UpdateContent | null>(null);
  
  const [formData, setFormData] = useState({
    content_key: "",
    text_content: "",
    position_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_content')
        .select('*')
        .eq('content_type', 'updates_content')
        .order('position_order', { ascending: true });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب التحديثات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updateData = {
        content_key: formData.content_key,
        content_type: 'updates_content',
        text_content: formData.text_content,
        position_order: formData.position_order,
        is_active: formData.is_active,
        created_by: user.id
      };

      if (editingUpdate) {
        const { error } = await supabase
          .from('app_content')
          .update(updateData)
          .eq('id', editingUpdate.id);

        if (error) throw error;
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث التحديث بنجاح"
        });
      } else {
        const { error } = await supabase
          .from('app_content')
          .insert([updateData]);

        if (error) throw error;
        
        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء التحديث بنجاح"
        });
      }

      setShowDialog(false);
      resetForm();
      await fetchUpdates();
      
      // Force refresh of app content
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    } catch (error) {
      console.error('Error saving update:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ التحديث",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      content_key: "",
      text_content: "",
      position_order: 0,
      is_active: true
    });
    setEditingUpdate(null);
  };

  const handleEdit = (update: UpdateContent) => {
    setEditingUpdate(update);
    setFormData({
      content_key: update.content_key,
      text_content: update.text_content || "",
      position_order: update.position_order,
      is_active: update.is_active
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحديث؟')) return;

    try {
      const { error } = await supabase
        .from('app_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف التحديث بنجاح"
      });
      
      await fetchUpdates();
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    } catch (error) {
      console.error('Error deleting update:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف التحديث",
        variant: "destructive"
      });
    }
  };

  const toggleUpdateStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('app_content')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "تم التحديث",
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} التحديث`
      });
      
      await fetchUpdates();
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    } catch (error) {
      console.error('Error toggling update status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث حالة التحديث",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">إدارة محتوى التحديثات</h1>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة تحديث جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUpdate ? 'تعديل التحديث' : 'إضافة تحديث جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingUpdate ? 'تعديل تحديث موجود' : 'إضافة تحديث جديد لصفحة التحديثات'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="content_key">مفتاح المحتوى</Label>
                <Input
                  id="content_key"
                  value={formData.content_key}
                  onChange={(e) => setFormData({...formData, content_key: e.target.value})}
                  placeholder="مثال: update_1_title, update_1_content, update_1_date"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  استخدم أسماء مثل: update_1_title, update_1_content, update_1_date
                </p>
              </div>

              <div>
                <Label htmlFor="text_content">المحتوى</Label>
                <Textarea
                  id="text_content"
                  value={formData.text_content}
                  onChange={(e) => setFormData({...formData, text_content: e.target.value})}
                  placeholder="اكتب محتوى التحديث هنا..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="position_order">ترتيب العرض</Label>
                <Input
                  id="position_order"
                  type="number"
                  value={formData.position_order}
                  onChange={(e) => setFormData({...formData, position_order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingUpdate ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {updates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">لا توجد تحديثات</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإضافة تحديثات جديدة لعرضها للمستخدمين
              </p>
            </CardContent>
          </Card>
        ) : (
          updates.map((update) => (
            <Card key={update.id} className={!update.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{update.content_key}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={update.is_active ? "default" : "secondary"}>
                      {update.is_active ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          نشط
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          غير نشط
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline">ترتيب: {update.position_order}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {update.text_content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    تم الإنشاء: {new Date(update.created_at).toLocaleDateString('ar-EG')}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUpdateStatus(update.id, update.is_active)}
                    >
                      {update.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          إخفاء
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          إظهار
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(update)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(update.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}