import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Video, Image as ImageIcon, Link, Send } from 'lucide-react';

interface ContentSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ContentSubmissionForm = ({ open, onOpenChange, onSuccess }: ContentSubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    content_type: 'article',
    category: 'crypto',
    language: 'ar',
    text_direction: 'rtl',
    difficulty_level: 'beginner',
    tags: '',
    submission_notes: '',
    media_urls: '',
    author_name: ''
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "غير مصرح",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء العنوان والمحتوى على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const mediaUrls = formData.media_urls ? formData.media_urls.split('\n').map(url => url.trim()).filter(Boolean) : [];

      const { error } = await supabase
        .from('learning_content')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          content_type: formData.content_type,
          category: formData.category,
          language: formData.language,
          text_direction: formData.text_direction,
          difficulty_level: formData.difficulty_level,
          tags: tagsArray,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          submission_notes: formData.submission_notes.trim() || null,
          author_name: formData.author_name.trim() || null,
          created_by: user.id,
          approval_status: 'pending',
          is_published: false
        });

      if (error) throw error;

      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال المحتوى للمراجعة، ستصلك موافقة الإدارة قريباً"
      });

      // إعادة تعيين النموذج
      setFormData({
        title: '',
        content: '',
        content_type: 'article',
        category: 'crypto',
        language: 'ar',
        text_direction: 'rtl',
        difficulty_level: 'beginner',
        tags: '',
        submission_notes: '',
        media_urls: '',
        author_name: ''
      });

      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error submitting content:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال المحتوى، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-center">
            <FileText className="w-6 h-6 text-primary" />
            إضافة محتوى تعليمي جديد
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات أساسية */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">معلومات أساسية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان المحتوى *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="أدخل عنوان المحتوى..."
                    className="w-full"
                    dir={formData.text_direction}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_name">اسم المؤلف (اختياري)</Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) => handleInputChange('author_name', e.target.value)}
                    placeholder="اسمك أو اسم مستعار..."
                    className="w-full"
                    dir={formData.text_direction}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">محتوى المقال *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="اكتب محتوى المقال هنا..."
                  className="min-h-[200px] w-full"
                  dir={formData.text_direction}
                />
              </div>
            </CardContent>
          </Card>

          {/* إعدادات المحتوى */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">إعدادات المحتوى</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>نوع المحتوى</Label>
                  <Select value={formData.content_type} onValueChange={(value) => handleInputChange('content_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">مقال</SelectItem>
                      <SelectItem value="tutorial">درس تعليمي</SelectItem>
                      <SelectItem value="guide">دليل</SelectItem>
                      <SelectItem value="news">أخبار</SelectItem>
                      <SelectItem value="analysis">تحليل</SelectItem>
                      <SelectItem value="video">فيديو</SelectItem>
                      <SelectItem value="podcast">بودكاست</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>القسم</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">مالي Crypto</SelectItem>
                      <SelectItem value="general">عام General</SelectItem>
                      <SelectItem value="divine">ديني Divine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>مستوى الصعوبة</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                      <SelectItem value="expert">خبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اللغة</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">عربي</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="both">ثنائي اللغة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>اتجاه النص</Label>
                  <Select value={formData.text_direction} onValueChange={(value) => handleInputChange('text_direction', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rtl">يمين إلى يسار (عربي)</SelectItem>
                      <SelectItem value="ltr">يسار إلى يمين (إنجليزي)</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">الكلمات المفتاحية (مفصولة بفواصل)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="مثال: بيتكوين، تداول، استثمار"
                  className="w-full"
                  dir={formData.text_direction}
                />
              </div>
            </CardContent>
          </Card>

          {/* وسائط إضافية */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                وسائط إضافية (اختياري)
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="media_urls">روابط الصور أو الفيديوهات (رابط واحد في كل سطر)</Label>
                <Textarea
                  id="media_urls"
                  value={formData.media_urls}
                  onChange={(e) => handleInputChange('media_urls', e.target.value)}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/video1.mp4"
                  className="min-h-[100px] w-full font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  يمكنك إضافة روابط للصور والفيديوهات لتحسين المحتوى
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submission_notes">ملاحظات للإدارة (اختياري)</Label>
                <Textarea
                  id="submission_notes"
                  value={formData.submission_notes}
                  onChange={(e) => handleInputChange('submission_notes', e.target.value)}
                  placeholder="أي ملاحظات أو طلبات خاصة للإدارة..."
                  className="min-h-[80px] w-full"
                  dir={formData.text_direction}
                />
              </div>
            </CardContent>
          </Card>

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال للمراجعة
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};