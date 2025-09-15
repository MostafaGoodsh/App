import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Tags, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReelsCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const iconOptions = [
  { value: 'GraduationCap', label: 'تعليم' },
  { value: 'Newspaper', label: 'أخبار' },
  { value: 'TrendingUp', label: 'تحليل' },
  { value: 'AlertTriangle', label: 'تحذير' },
  { value: 'BookOpen', label: 'كتاب' },
  { value: 'Video', label: 'فيديو' },
  { value: 'Coins', label: 'عملات' },
  { value: 'Lightbulb', label: 'فكرة' },
  { value: 'Shield', label: 'أمان' },
  { value: 'Target', label: 'هدف' }
];

export const ReelsCategoriesManagement = () => {
  const [categories, setCategories] = useState<ReelsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ReelsCategory | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'GraduationCap',
    display_order: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reels_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('خطأ في جلب الأقسام');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان القسم');
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('reels_categories')
          .update({
            title: formData.title,
            description: formData.description,
            icon: formData.icon,
            display_order: formData.display_order
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('تم تحديث القسم بنجاح');
      } else {
        // Create new category
        const { error } = await supabase
          .from('reels_categories')
          .insert([{
            title: formData.title,
            description: formData.description,
            icon: formData.icon,
            display_order: formData.display_order
          }]);

        if (error) throw error;
        toast.success('تم إضافة القسم بنجاح');
      }

      fetchCategories();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('خطأ في حفظ القسم');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: ReelsCategory) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description || '',
      icon: category.icon,
      display_order: category.display_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    try {
      const { error } = await supabase
        .from('reels_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف القسم بنجاح');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('خطأ في حذف القسم');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reels_categories')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} القسم`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('خطأ في تغيير حالة القسم');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'GraduationCap',
      display_order: 0
    });
    setEditingCategory(null);
  };

  const openDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              إدارة أقسام الريلز ({categories.length})
            </div>
            <Button onClick={openDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة قسم
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">لا توجد أقسام حتى الآن</p>
              <Button onClick={openDialog} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة أول قسم
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <Card key={category.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{category.title}</h3>
                          <Badge 
                            variant={category.is_active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {category.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            الترتيب: {category.display_order}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-muted-foreground text-sm mb-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>الأيقونة: {category.icon}</span>
                          <span>•</span>
                          <span>تم الإنشاء: {new Date(category.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => toggleActive(category.id, category.is_active)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          تعديل
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان القسم</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان القسم"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصف القسم"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="icon">الأيقونة</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="display_order">ترتيب العرض</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'جاري الحفظ...' : editingCategory ? 'تحديث' : 'إضافة'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};