import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Sparkles, Upload, Loader2 } from "lucide-react";

export default function AnubisCardManagement() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data: titleData } = await supabase
        .from('app_content')
        .select('*')
        .eq('content_key', 'anubis_card_title')
        .eq('is_active', true)
        .maybeSingle();

      const { data: descData } = await supabase
        .from('app_content')
        .select('*')
        .eq('content_key', 'anubis_card_description')
        .eq('is_active', true)
        .maybeSingle();

      const { data: introData } = await supabase
        .from('app_content')
        .select('*')
        .eq('content_key', 'anubis_card_introduction')
        .eq('is_active', true)
        .maybeSingle();

      const { data: bgData } = await supabase
        .from('app_content')
        .select('*')
        .eq('content_key', 'anubis_card_background')
        .eq('is_active', true)
        .maybeSingle();

      setTitle(titleData?.text_content || 'أنوبيس - حامي الأسرار');
      setDescription(descData?.text_content || 'اضغط لاكتشاف أسرار أنوبيس القديمة');
      setIntroduction(introData?.text_content || '');
      setBackgroundImage(bgData?.image_url || '/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png');
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المحتوى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

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
      const fileName = `anubis-bg-${Date.now()}.${fileExt}`;
      const filePath = `anubis/${fileName}`;

      if (backgroundImage && backgroundImage.includes('content-backgrounds')) {
        const oldPath = backgroundImage.split('/').slice(-2).join('/');
        await supabase.storage.from('content-backgrounds').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('content-backgrounds')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw new Error(uploadError.message || 'فشل في رفع الصورة');

      const { data: { publicUrl } } = supabase.storage
        .from('content-backgrounds')
        .getPublicUrl(filePath);

      setBackgroundImage(publicUrl);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('app_content').upsert({
        content_key: 'anubis_card_title',
        content_type: 'text',
        text_content: title,
        is_active: true,
        position_order: 0
      }, { onConflict: 'content_key' });

      await supabase.from('app_content').upsert({
        content_key: 'anubis_card_description',
        content_type: 'text',
        text_content: description,
        is_active: true,
        position_order: 0
      }, { onConflict: 'content_key' });

      await supabase.from('app_content').upsert({
        content_key: 'anubis_card_introduction',
        content_type: 'text',
        text_content: introduction,
        is_active: true,
        position_order: 0
      }, { onConflict: 'content_key' });

      await supabase.from('app_content').upsert({
        content_key: 'anubis_card_background',
        content_type: 'image',
        image_url: backgroundImage,
        is_active: true,
        position_order: 0
      }, { onConflict: 'content_key' });

      toast({
        title: "تم الحفظ",
        description: "تم حفظ محتوى كارت أنوبيس بنجاح",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            إدارة محتوى كارت أنوبيس
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="arabic-text">العنوان الخارجي</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="arabic-text"
              placeholder="أنوبيس - حامي الأسرار"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="arabic-text">الوصف الخارجي</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="arabic-text min-h-[80px]"
              placeholder="وصف مختصر يظهر على الكارت"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="introduction" className="arabic-text">المقدمة الداخلية (تظهر عند الضغط)</Label>
            <Textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="arabic-text min-h-[200px]"
              placeholder="نص مفصل يظهر في النافذة المنبثقة"
            />
            <p className="text-xs text-muted-foreground">
              يمكنك استخدام سطر فارغ بين الفقرات لتقسيم النص
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background" className="arabic-text">صورة الخلفية</Label>
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
            {backgroundImage && (
              <div className="mt-2">
                <img 
                  src={backgroundImage} 
                  alt="معاينة الخلفية"
                  className="w-32 h-20 object-cover rounded border"
                />
              </div>
            )}
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