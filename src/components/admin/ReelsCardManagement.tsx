import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, Eye } from 'lucide-react';

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
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الكارت",
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
        // Update existing
        const { error } = await supabase
          .from('reels_card_content')
          .update({
            title: content.title,
            description: content.description,
            background_image_url: content.background_image_url,
          })
          .eq('id', content.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('reels_card_content')
          .insert({
            title: content.title,
            description: content.description,
            background_image_url: content.background_image_url,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `reels-card-bg-${Date.now()}.${fileExt}`;
      const filePath = `reels-card/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('learning-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('learning-media')
        .getPublicUrl(filePath);

      setContent(prev => ({ ...prev, background_image_url: data.publicUrl }));

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم تحديث صورة خلفية الكارت",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          إدارة كارت الريلز
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">العنوان</label>
          <Input
            value={content.title}
            onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="العنوان الرئيسي للكارت"
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">المقدمة</label>
          <Textarea
            value={content.description}
            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="وصف الكارت والمحتوى"
            rows={3}
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">صورة الخلفية</label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          {content.background_image_url && (
            <div className="mt-2">
              <img
                src={content.background_image_url}
                alt="صورة الخلفية"
                className="w-32 h-20 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};