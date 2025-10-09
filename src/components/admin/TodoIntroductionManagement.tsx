import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface TodoIntroduction {
  id: string;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  text_direction: string;
  is_active: boolean;
}

const TodoIntroductionManagement = () => {
  const [introduction, setIntroduction] = useState<TodoIntroduction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntroduction();
  }, []);

  const fetchIntroduction = async () => {
    try {
      const { data, error } = await supabase
        .from('todo_list_introduction')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIntroduction(data);
      } else {
        // Create default if not exists
        const { data: newData, error: insertError } = await supabase
          .from('todo_list_introduction')
          .insert({
            title: 'قائمة مهامي',
            content: 'نظم مهامك اليومية وحقق أهدافك',
            is_active: true
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setIntroduction(newData);
      }
    } catch (error) {
      console.error('Error fetching introduction:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المقدمة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!introduction) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('todo_list_introduction')
        .update({
          title: introduction.title,
          title_en: introduction.title_en,
          content: introduction.content,
          content_en: introduction.content_en,
          text_direction: introduction.text_direction,
          is_active: introduction.is_active,
        })
        .eq('id', introduction.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ التغييرات بنجاح",
      });
    } catch (error) {
      console.error('Error saving introduction:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!introduction) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة مقدمة قائمة الأعمال</CardTitle>
        <CardDescription>
          تحكم في النص التعريفي الذي يظهر أعلى قائمة المهام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">العنوان (عربي)</Label>
          <Input
            id="title"
            value={introduction.title}
            onChange={(e) => setIntroduction({ ...introduction, title: e.target.value })}
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title_en">العنوان (إنجليزي)</Label>
          <Input
            id="title_en"
            value={introduction.title_en || ''}
            onChange={(e) => setIntroduction({ ...introduction, title_en: e.target.value })}
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">المحتوى (عربي)</Label>
          <Textarea
            id="content"
            value={introduction.content}
            onChange={(e) => setIntroduction({ ...introduction, content: e.target.value })}
            dir="rtl"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_en">المحتوى (إنجليزي)</Label>
          <Textarea
            id="content_en"
            value={introduction.content_en || ''}
            onChange={(e) => setIntroduction({ ...introduction, content_en: e.target.value })}
            dir="ltr"
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            id="is_active"
            checked={introduction.is_active}
            onCheckedChange={(checked) => setIntroduction({ ...introduction, is_active: checked })}
          />
          <Label htmlFor="is_active">تفعيل المقدمة</Label>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodoIntroductionManagement;