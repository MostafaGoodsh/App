import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, FileText } from "lucide-react";

interface TaskIntroduction {
  id: string;
  section_type: string;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  is_active: boolean;
  text_direction: string;
  created_at: string;
  updated_at: string;
}

const TaskIntroductionsManagement = () => {
  const [introductions, setIntroductions] = useState<TaskIntroduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntroduction, setEditingIntroduction] = useState<TaskIntroduction | null>(null);
  const [formData, setFormData] = useState({
    section_type: 'general',
    title: '',
    title_en: '',
    content: '',
    content_en: '',
    is_active: true,
    text_direction: 'rtl'
  });

  useEffect(() => {
    fetchIntroductions();
  }, []);

  const fetchIntroductions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_section_introductions')
        .select('*')
        .order('section_type');

      if (error) throw error;
      setIntroductions(data || []);
    } catch (error) {
      console.error('Error fetching introductions:', error);
      toast.error('خطأ في جلب المقدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingIntroduction) {
        const { error } = await supabase
          .from('task_section_introductions')
          .update(formData)
          .eq('id', editingIntroduction.id);

        if (error) throw error;
        toast.success('تم تحديث المقدمة بنجاح');
      } else {
        const { error } = await supabase
          .from('task_section_introductions')
          .insert([formData]);

        if (error) throw error;
        toast.success('تم إضافة المقدمة بنجاح');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchIntroductions();
    } catch (error) {
      console.error('Error saving introduction:', error);
      toast.error('خطأ في حفظ المقدمة');
    }
  };

  const handleEdit = (introduction: TaskIntroduction) => {
    setEditingIntroduction(introduction);
    setFormData({
      section_type: introduction.section_type,
      title: introduction.title,
      title_en: introduction.title_en || '',
      content: introduction.content,
      content_en: introduction.content_en || '',
      is_active: introduction.is_active,
      text_direction: introduction.text_direction
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingIntroduction(null);
    setFormData({
      section_type: 'general',
      title: '',
      title_en: '',
      content: '',
      content_en: '',
      is_active: true,
      text_direction: 'rtl'
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case 'general': return 'مقدمة عامة';
      case 'daily_tasks': return 'المهام العامة';
      case 'media_content': return 'محتوى الوسائط';
      case 'personality_tasks': return 'مهام تطوير الشخصية';
      case 'quran': return 'قراءة القرآن الكريم';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة مقدمات المهام</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة مقدمة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingIntroduction ? 'تعديل المقدمة' : 'إضافة مقدمة جديدة'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="section_type">نوع القسم</Label>
                  <Select
                    value={formData.section_type}
                    onValueChange={(value: string) => 
                      setFormData(prev => ({ ...prev, section_type: value }))
                    }
                    disabled={!!editingIntroduction}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">مقدمة عامة</SelectItem>
                      <SelectItem value="daily_tasks">المهام العامة</SelectItem>
                      <SelectItem value="media_content">محتوى الوسائط</SelectItem>
                      <SelectItem value="personality_tasks">مهام تطوير الشخصية</SelectItem>
                      <SelectItem value="quran">قراءة القرآن الكريم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="title_en">العنوان (English)</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    placeholder="Title in English"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">المحتوى</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className={formData.text_direction === 'rtl' ? 'text-right' : 'text-left'}
                    dir={formData.text_direction}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="content_en">المحتوى (English)</Label>
                  <Textarea
                    id="content_en"
                    value={formData.content_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                    rows={4}
                    className="text-left"
                    dir="ltr"
                    placeholder="Content in English"
                  />
                </div>
                
                <div>
                  <Label htmlFor="text_direction">اتجاه النص</Label>
                  <Select
                    value={formData.text_direction}
                    onValueChange={(value: string) => 
                      setFormData(prev => ({ ...prev, text_direction: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rtl">من اليمين إلى اليسار (عربي)</SelectItem>
                      <SelectItem value="ltr">من اليسار إلى اليمين (إنجليزي)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingIntroduction ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع القسم</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>المحتوى</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {introductions.map((introduction) => (
                <TableRow key={introduction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {getSectionTypeLabel(introduction.section_type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{introduction.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{introduction.content}</TableCell>
                  <TableCell>
                    <Badge variant={introduction.is_active ? "default" : "secondary"}>
                      {introduction.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(introduction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {introductions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مقدمات متاحة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskIntroductionsManagement;