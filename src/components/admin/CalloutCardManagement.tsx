import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Upload, Loader2, ImageIcon } from "lucide-react";

interface CalloutCardContent {
  id: string;
  title: string;
  description: string;
  fixed_image_url: string;
  contact_button_text: string;
  contact_link: string;
}

export default function CalloutCardManagement() {
  const [content, setContent] = useState<CalloutCardContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('callout_card_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل محتوى البطاقة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('callout_card_content')
        .update({
          title: content.title,
          description: content.description,
          fixed_image_url: content.fixed_image_url,
          contact_button_text: content.contact_button_text,
          contact_link: content.contact_link,
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ محتوى البطاقة بنجاح",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ المحتوى",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CalloutCardContent, value: string) => {
    if (!content) return;
    setContent({ ...content, [field]: value });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !content) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يجب اختيار ملف صورة",
        variant: "destructive",
      });
      return;
    }

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
      const fileName = `callout-${Date.now()}.${fileExt}`;
      const filePath = `callout/${fileName}`;

      // Delete old image if exists
      if (content.fixed_image_url && content.fixed_image_url.includes('content-backgrounds')) {
        const oldPath = content.fixed_image_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('content-backgrounds')
            .remove([`callout/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('content-backgrounds')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'فشل في رفع الصورة');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('content-backgrounds')
        .getPublicUrl(filePath);

      setContent(prev => prev ? {
        ...prev,
        fixed_image_url: publicUrl
      } : null);

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
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground arabic-text">لا يوجد محتوى للعرض</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">إدارة محتوى بطاقة Call Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="arabic-text">العنوان</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="arabic-text"
              placeholder="العنوان الرئيسي للبطاقة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="arabic-text">الوصف</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="arabic-text min-h-[120px]"
              placeholder="وصف تفصيلي للبطاقة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixed_image_url" className="arabic-text">صورة الخلفية</Label>
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
            <div className="text-xs text-muted-foreground">
              أو أدخل رابط الصورة مباشرة:
            </div>
            <Input
              id="fixed_image_url"
              value={content.fixed_image_url}
              onChange={(e) => handleInputChange('fixed_image_url', e.target.value)}
              placeholder="/lovable-uploads/image.png"
            />
            {content.fixed_image_url && (
              <div className="mt-2">
                <img 
                  src={content.fixed_image_url} 
                  alt="معاينة الصورة" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_button_text" className="arabic-text">نص زر التواصل</Label>
            <Input
              id="contact_button_text"
              value={content.contact_button_text}
              onChange={(e) => handleInputChange('contact_button_text', e.target.value)}
              className="arabic-text"
              placeholder="تواصل مع الشخصية المكرمة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_link" className="arabic-text">رابط التواصل الافتراضي</Label>
            <Input
              id="contact_link"
              value={content.contact_link}
              onChange={(e) => handleInputChange('contact_link', e.target.value)}
              placeholder="https://wa.me/1234567890"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="arabic-text"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              حفظ التغييرات
            </Button>
            
            <Button 
              variant="outline" 
              onClick={fetchContent}
              className="arabic-text"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة تحميل
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}