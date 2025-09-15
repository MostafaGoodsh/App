import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';

interface ReelsCardContent {
  id: string;
  title: string;
  description: string;
  background_image_url: string;
  is_active: boolean;
}

export const ReelsCardManagement = () => {
  const [content, setContent] = useState<ReelsCardContent>({
    id: '',
    title: 'الفيديوهات القصيرة',
    description: 'شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة حول منصة مصر والعملات الرقمية',
    background_image_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('reels_card_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (content.id) {
        const { error } = await supabase
          .from('reels_card_content')
          .update({
            title: content.title,
            description: content.description,
            background_image_url: content.background_image_url
          })
          .eq('id', content.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('reels_card_content')
          .insert({
            title: content.title,
            description: content.description,
            background_image_url: content.background_image_url
          })
          .select()
          .single();

        if (error) throw error;
        setContent(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث محتوى كارت الريلز",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يجب اختيار ملف صورة",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `reels-bg-${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      // Delete old image if exists
      if (content.background_image_url) {
        const oldPath = content.background_image_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('reels-content')
            .remove([`backgrounds/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('reels-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'فشل في رفع الصورة');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('reels-content')
        .getPublicUrl(filePath);

      setContent(prev => ({
        ...prev,
        background_image_url: publicUrl
      }));

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          إدارة كارت الريلز
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">العنوان</Label>
          <Input
            id="title"
            value={content.title}
            onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
            dir="rtl"
            placeholder="عنوان الكارت"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">المقدمة</Label>
          <Textarea
            id="description"
            value={content.description}
            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            dir="rtl"
            placeholder="وصف مختصر للكارت"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="background">صورة الخلفية</Label>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button 
              size="sm" 
              variant="outline"
              disabled={uploading}
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              رفع صورة
            </Button>
          </div>
          {content.background_image_url && (
            <div className="mt-2">
              <img 
                src={content.background_image_url} 
                alt="معاينة الخلفية"
                className="w-32 h-20 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};