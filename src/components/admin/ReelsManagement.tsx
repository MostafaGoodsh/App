import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Video, Eye, EyeOff } from 'lucide-react';

interface ReelsContent {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  display_order: number;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export const ReelsManagement = () => {
  const { toast } = useToast();
  const [reelsContent, setReelsContent] = useState<ReelsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelsContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchReelsContent();
  }, []);

  const fetchReelsContent = async () => {
    try {
      const { data, error } = await supabase
        .from('reels_content')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setReelsContent(data || []);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل محتوى الريلز',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReel) {
        // Update existing reel
        const { error } = await supabase
          .from('reels_content')
          .update(formData)
          .eq('id', editingReel.id);

        if (error) throw error;

        toast({
          title: 'تم التحديث',
          description: 'تم تحديث محتوى الريلز بنجاح'
        });
      } else {
        // Create new reel
        const { error } = await supabase
          .from('reels_content')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'تم الإنشاء',
          description: 'تم إنشاء محتوى الريلز بنجاح'
        });
      }

      setDialogOpen(false);
      setEditingReel(null);
      resetForm();
      fetchReelsContent();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: editingReel ? 'فشل في تحديث الريلز' : 'فشل في إنشاء الريلز',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (reel: ReelsContent) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title,
      title_en: reel.title_en || '',
      description: reel.description || '',
      description_en: reel.description_en || '',
      video_url: reel.video_url,
      thumbnail_url: reel.thumbnail_url || '',
      duration: reel.duration || 0,
      display_order: reel.display_order,
      is_active: reel.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الريلز؟')) return;

    try {
      const { error } = await supabase
        .from('reels_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الريلز بنجاح'
      });

      fetchReelsContent();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الريلز',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reels_content')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الريلز`
      });

      fetchReelsContent();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الريلز',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      video_url: '',
      thumbnail_url: '',
      duration: 0,
      display_order: 0,
      is_active: true
    });
  };

  const openDialog = () => {
    setEditingReel(null);
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            إدارة محتوى الريلز
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openDialog}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة ريلز
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingReel ? 'تعديل الريلز' : 'إضافة ريلز جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">العنوان (عربي)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title_en">العنوان (إنجليزي)</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">الوصف (عربي)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="description_en">الوصف (إنجليزي)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="video_url">رابط الفيديو</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnail_url">رابط الصورة المصغرة</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">المدة (ثانية)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="display_order">ترتيب العرض</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                    />
                  </div>
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
                    {editingReel ? 'تحديث' : 'إنشاء'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reelsContent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد محتوى ريلز
          </div>
        ) : (
          <div className="space-y-4">
            {reelsContent.map((reel) => (
              <div key={reel.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{reel.title}</h3>
                      <Badge variant={reel.is_active ? 'default' : 'secondary'}>
                        {reel.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    {reel.title_en && (
                      <p className="text-sm text-muted-foreground mb-1">{reel.title_en}</p>
                    )}
                    {reel.description && (
                      <p className="text-sm text-muted-foreground mb-2">{reel.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>ترتيب: {reel.display_order}</span>
                      {reel.duration > 0 && <span>المدة: {reel.duration}ث</span>}
                      <span>المشاهدات: {reel.view_count}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(reel.id, reel.is_active)}
                    >
                      {reel.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(reel)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(reel.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};