import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuranPage {
  id: string;
  page_number: number;
  juz_number: number;
  surah_name: string;
  arabic_text: string;
  translation_text: string | null;
  points_reward: number;
  is_active: boolean;
  display_order: number;
}

const QuranPagesManagement = () => {
  const [pages, setPages] = useState<QuranPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<QuranPage | null>(null);
  const [formData, setFormData] = useState({
    page_number: "",
    juz_number: "",
    surah_name: "",
    arabic_text: "",
    translation_text: "",
    points_reward: "10",
    display_order: "0",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('quran_pages')
        .select('*')
        .order('page_number');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('حدث خطأ أثناء تحميل الصفحات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const pageData = {
        page_number: parseInt(formData.page_number),
        juz_number: parseInt(formData.juz_number),
        surah_name: formData.surah_name,
        arabic_text: formData.arabic_text,
        translation_text: formData.translation_text || null,
        points_reward: parseInt(formData.points_reward),
        display_order: parseInt(formData.display_order),
      };

      if (editingPage) {
        const { error } = await supabase
          .from('quran_pages')
          .update(pageData)
          .eq('id', editingPage.id);

        if (error) throw error;
        toast.success('تم تحديث الصفحة بنجاح');
      } else {
        const { error } = await supabase
          .from('quran_pages')
          .insert([pageData]);

        if (error) throw error;
        toast.success('تم إضافة الصفحة بنجاح');
      }

      resetForm();
      fetchPages();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('حدث خطأ أثناء حفظ الصفحة');
    }
  };

  const handleEdit = (page: QuranPage) => {
    setEditingPage(page);
    setFormData({
      page_number: page.page_number.toString(),
      juz_number: page.juz_number.toString(),
      surah_name: page.surah_name,
      arabic_text: page.arabic_text,
      translation_text: page.translation_text || "",
      points_reward: page.points_reward.toString(),
      display_order: page.display_order.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return;

    try {
      const { error } = await supabase
        .from('quran_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف الصفحة بنجاح');
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('حدث خطأ أثناء حذف الصفحة');
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setFormData({
      page_number: "",
      juz_number: "",
      surah_name: "",
      arabic_text: "",
      translation_text: "",
      points_reward: "10",
      display_order: "0",
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setDialogOpen(open);
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6 arabic-content">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            إدارة صفحات القرآن
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة صفحة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? 'تعديل صفحة القرآن' : 'إضافة صفحة قرآن جديدة'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="page_number">رقم الصفحة</Label>
                    <Input
                      id="page_number"
                      type="number"
                      value={formData.page_number}
                      onChange={(e) => setFormData({...formData, page_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="juz_number">رقم الجزء</Label>
                    <Input
                      id="juz_number"
                      type="number"
                      value={formData.juz_number}
                      onChange={(e) => setFormData({...formData, juz_number: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="surah_name">اسم السورة</Label>
                  <Input
                    id="surah_name"
                    value={formData.surah_name}
                    onChange={(e) => setFormData({...formData, surah_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="arabic_text">النص العربي</Label>
                  <Textarea
                    id="arabic_text"
                    value={formData.arabic_text}
                    onChange={(e) => setFormData({...formData, arabic_text: e.target.value})}
                    rows={6}
                    className="font-arabic"
                    dir="rtl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="translation_text">الترجمة (اختياري)</Label>
                  <Textarea
                    id="translation_text"
                    value={formData.translation_text}
                    onChange={(e) => setFormData({...formData, translation_text: e.target.value})}
                    rows={6}
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points_reward">النقاط</Label>
                    <Input
                      id="points_reward"
                      type="number"
                      value={formData.points_reward}
                      onChange={(e) => setFormData({...formData, points_reward: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_order">ترتيب العرض</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingPage ? 'تحديث' : 'إضافة'}
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
                <TableHead>رقم الصفحة</TableHead>
                <TableHead>الجزء</TableHead>
                <TableHead>السورة</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>{page.page_number}</TableCell>
                  <TableCell>{page.juz_number}</TableCell>
                  <TableCell>{page.surah_name}</TableCell>
                  <TableCell>{page.points_reward}</TableCell>
                  <TableCell>
                    {page.is_active ? '✓ نشط' : '✗ غير نشط'}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuranPagesManagement;