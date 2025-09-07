import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AnubisCardContent {
  title: string;
  description: string;
}

const AnubisCardManagement = () => {
  const [content, setContent] = useState<AnubisCardContent>({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from('app_content')
        .select('content_key, text_content')
        .in('content_key', ['anubis_card_title', 'anubis_card_description'])
        .eq('is_active', true);

      if (data) {
        const contentMap = data.reduce((acc, item) => {
          acc[item.content_key] = item.text_content || '';
          return acc;
        }, {} as Record<string, string>);

        setContent({
          title: contentMap['anubis_card_title'] || '',
          description: contentMap['anubis_card_description'] || ''
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المحتوى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const updates = [
        {
          content_key: 'anubis_card_title',
          text_content: content.title,
          content_type: 'text'
        },
        {
          content_key: 'anubis_card_description', 
          text_content: content.description,
          content_type: 'text'
        }
      ];

      for (const update of updates) {
        await supabase
          .from('app_content')
          .upsert({
            ...update,
            is_active: true,
            position_order: 0
          }, {
            onConflict: 'content_key'
          });
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ محتوى كارت أنوبيس بنجاح",
      });

      // Trigger content refresh
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المحتوى",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>إدارة كارت أنوبيس</CardTitle>
          <CardDescription>
            قم بتحرير عنوان ووصف كارت أنوبيس المعروض في الصفحة الرئيسية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">العنوان</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="أدخل عنوان الكارت"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="أدخل وصف الكارت"
              rows={4}
            />
          </div>

          <Button 
            onClick={saveContent} 
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnubisCardManagement;