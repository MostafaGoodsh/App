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
import { Plus, Edit, Trash2, Video, Eye, EyeOff, Upload } from 'lucide-react';

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('reels-videos')
      .upload(path, file, {
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('reels-videos')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploading(true);
    
    try {
      let finalFormData = { ...formData };

      // Upload video file if provided
      if (videoFile) {
        const videoPath = `videos/${Date.now()}-${videoFile.name}`;
        const videoUrl = await uploadFile(videoFile, videoPath);
        finalFormData.video_url = videoUrl;
      }

      // Upload thumbnail file if provided
      if (thumbnailFile) {
        const thumbnailPath = `thumbnails/${Date.now()}-${thumbnailFile.name}`;
        const thumbnailUrl = await uploadFile(thumbnailFile, thumbnailPath);
        finalFormData.thumbnail_url = thumbnailUrl;
      }

      if (editingReel) {
        // Update existing reel
        const updateData = { ...finalFormData };
        // Don't remove empty strings for optional fields, but ensure we have title
        if (!updateData.title) {
          throw new Error('العنوان مطلوب');
        }
        
        const { error } = await supabase
          .from('reels_content')
          .update(updateData)
          .eq('id', editingReel.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast({
          title: 'تم التحديث',
          description: 'تم تحديث محتوى الريلز بنجاح'
        });
      } else {
        // Create new reel - ensure required fields are present
        if (!finalFormData.title) {
          throw new Error('العنوان العربي مطلوب');
        }
        if (!finalFormData.video_url && !videoFile) {
          throw new Error('الفيديو مطلوب');
        }
        
        const { error } = await supabase
          .from('reels_content')
          .insert([finalFormData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

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
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'خطأ',
        description: error.message || (editingReel ? 'فشل في تحديث الريلز' : 'فشل في إنشاء الريلز'),
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
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
    setVideoFile(null);
    setThumbnailFile(null);
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
               <Button onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 openDialog();
               }}>
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
                  <Label htmlFor="video_file">رفع الفيديو</Label>
                  <Input
                    id="video_file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {videoFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      تم اختيار: {videoFile.name}
                    </p>
                  )}
                  {formData.video_url && !videoFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      الفيديو الحالي موجود
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="thumbnail_file">رفع الصورة المصغرة</Label>
                  <Input
                    id="thumbnail_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {thumbnailFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      تم اختيار: {thumbnailFile.name}
                    </p>
                  )}
                  {formData.thumbnail_url && !thumbnailFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      الصورة المصغرة الحالية موجودة
                    </p>
                  )}
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
                  <Button type="submit" className="flex-1" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      editingReel ? 'تحديث' : 'إنشاء'
                    )}
                  </Button>
                   <Button 
                     type="button" 
                     variant="outline" 
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setDialogOpen(false);
                     }}
                     className="flex-1"
                     disabled={uploading}
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
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4 text-lg">
              لا يوجد محتوى ريلز حالياً
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              ابدأ بإضافة أول مقطع فيديو قصير للمنصة
            </p>
            <Button onClick={openDialog} className="font-cairo">
              إضافة ريلز جديد
            </Button>
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
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         toggleActive(reel.id, reel.is_active);
                       }}
                     >
                      {reel.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         handleEdit(reel);
                       }}
                     >
                      <Edit className="w-4 h-4" />
                    </Button>
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         handleDelete(reel.id);
                       }}
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