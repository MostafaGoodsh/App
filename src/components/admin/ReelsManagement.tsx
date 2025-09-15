import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Video, Upload, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReelsContent {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  display_order: number;
  is_active: boolean;
  view_count: number;
  created_at: string;
  category_id?: string;
}

interface ReelsCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export const ReelsManagement = () => {
  const [reelsContent, setReelsContent] = useState<ReelsContent[]>([]);
  const [categories, setCategories] = useState<ReelsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelsContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    display_order: 0,
    category_id: ''
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReelsContent();
    fetchCategories();
  }, []);

  const fetchReelsContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reels_content')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setReelsContent(data || []);
    } catch (error) {
      console.error('Error fetching reels content:', error);
      toast.error('خطأ في جلب محتوى الريلز');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('reels_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Upload file function
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('reels-videos')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('reels-videos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان الريل');
      return;
    }

    try {
      setSaving(true);
      let videoUrl = editingReel?.video_url || '';
      let thumbnailUrl = editingReel?.thumbnail_url || '';

      // Upload files if selected
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'videos');
      }
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails');
      }

      if (editingReel) {
        // Update existing reel
        const { error } = await supabase
          .from('reels_content')
          .update({
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            display_order: formData.display_order,
            category_id: formData.category_id || null,
            video_url: videoUrl || editingReel.video_url,
            thumbnail_url: thumbnailUrl || editingReel.thumbnail_url
          })
          .eq('id', editingReel.id);

        if (error) throw error;
        toast.success('تم تحديث الريل بنجاح');
      } else {
        // Create new reel
        if (!videoFile) {
          toast.error('يرجى اختيار ملف فيديو');
          return;
        }

        const { error } = await supabase
          .from('reels_content')
          .insert([{
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            display_order: formData.display_order,
            category_id: formData.category_id || null,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl
          }]);

        if (error) throw error;
        toast.success('تم إضافة الريل بنجاح');
      }

      fetchReelsContent();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving reel:', error);
      toast.error('خطأ في حفظ الريل');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reel: ReelsContent) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title,
      description: reel.description,
      duration: reel.duration || 0,
      display_order: reel.display_order,
      category_id: reel.category_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الريل؟')) return;

    try {
      const { error } = await supabase
        .from('reels_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف الريل بنجاح');
      fetchReelsContent();
    } catch (error) {
      console.error('Error deleting reel:', error);
      toast.error('خطأ في حذف الريل');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reels_content')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الريل`);
      fetchReelsContent();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('خطأ في تغيير حالة الريل');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 0,
      display_order: 0,
      category_id: ''
    });
    setEditingReel(null);
    setVideoFile(null);
    setThumbnailFile(null);
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
              <Video className="h-5 w-5" />
              إدارة محتوى الريلز ({reelsContent.length})
            </div>
            <Button onClick={openDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة ريل
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reelsContent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">لا توجد ريلز حتى الآن</p>
              <Button onClick={openDialog} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة أول ريل
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reelsContent.map((reel) => (
                <Card key={reel.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{reel.title}</h3>
                          <Badge 
                            variant={reel.is_active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {reel.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            المشاهدات: {reel.view_count}
                          </Badge>
                          {reel.category_id && (
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(cat => cat.id === reel.category_id)?.title || 'قسم غير محدد'}
                            </Badge>
                          )}
                        </div>
                        {reel.description && (
                          <p className="text-muted-foreground text-sm mb-2">
                            {reel.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>الترتيب: {reel.display_order}</span>
                          <span>•</span>
                          <span>المدة: {reel.duration || 0}ث</span>
                          <span>•</span>
                          <span>تم الإنشاء: {new Date(reel.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reel.is_active}
                          onCheckedChange={() => toggleActive(reel.id, reel.is_active)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(reel)}
                          className="gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          تعديل
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(reel.id)}
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
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReel ? 'تعديل الريل' : 'إضافة ريل جديد'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان الريل</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان الريل"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصف الريل"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">القسم</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر قسم (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون قسم</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="video">ملف الفيديو {!editingReel && '*'}</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
              {videoFile && (
                <p className="text-sm text-green-600 mt-1">تم اختيار: {videoFile.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="thumbnail">الصورة المصغرة (اختياري)</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
              {thumbnailFile && (
                <p className="text-sm text-green-600 mt-1">تم اختيار: {thumbnailFile.name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">المدة (ثانية)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="0"
                />
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
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'جاري الحفظ...' : editingReel ? 'تحديث' : 'إضافة'}
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