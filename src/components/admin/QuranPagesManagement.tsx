import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen, AlertTriangle } from "lucide-react";
import QuranBulkImport from "./QuranBulkImport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  surah_name: string;
  juz_number: number;
  arabic_text: string;
  arabic_image_url?: string;
  translation_image_url?: string;
  is_active: boolean;
}

const QuranPagesManagement = () => {
  const [pages, setPages] = useState<QuranPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<QuranPage | null>(null);
  const [formData, setFormData] = useState({
    page_number: "",
    surah_name: "",
    juz_number: "",
    arabic_text: "",
    arabic_image_url: "",
    translation_image_url: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quran_pages')
        .select('*')
        .order('page_number');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('خطأ في تحميل الصفحات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const pageData = {
        page_number: parseInt(formData.page_number),
        surah_name: formData.surah_name,
        juz_number: parseInt(formData.juz_number),
        arabic_text: formData.arabic_text,
        arabic_image_url: formData.arabic_image_url || null,
        translation_image_url: formData.translation_image_url || null,
      };

      if (editingPage) {
        const { error } = await supabase
          .from('quran_pages')
          .update(pageData)
          .eq('id', editingPage.id);
        if (error) throw error;
        toast.success('تم تحديث الصفحة');
      } else {
        const { error } = await supabase
          .from('quran_pages')
          .insert([pageData]);
        if (error) throw error;
        toast.success('تم إضافة الصفحة');
      }

      setDialogOpen(false);
      resetForm();
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('خطأ في حفظ الصفحة');
    }
  };

  const handleEdit = (page: QuranPage) => {
    setEditingPage(page);
    setFormData({
      page_number: String(page.page_number),
      surah_name: page.surah_name,
      juz_number: String(page.juz_number),
      arabic_text: page.arabic_text,
      arabic_image_url: page.arabic_image_url || "",
      translation_image_url: page.translation_image_url || "",
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
      toast.success('تم حذف الصفحة');
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('خطأ في حذف الصفحة');
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setFormData({
      page_number: "",
      surah_name: "",
      juz_number: "",
      arabic_text: "",
      arabic_image_url: "",
      translation_image_url: "",
    });
  };

  const handleDeleteAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الصفحات؟ لا يمكن التراجع عن هذا الإجراء!')) return;
    if (!confirm('تأكيد نهائي: سيتم حذف جميع صفحات القرآن المستوردة')) return;
    try {
      const { error } = await supabase
        .from('quran_pages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      toast.success('تم حذف جميع الصفحات');
      fetchPages();
    } catch (error) {
      console.error('Error deleting all pages:', error);
      toast.error('خطأ في حذف الصفحات');
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          إدارة صفحات القرآن ({pages.length} صفحة)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <QuranBulkImport onImportComplete={fetchPages} />
          {pages.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteAll} className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              حذف جميع الصفحات ({pages.length})
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة صفحة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPage ? 'تعديل الصفحة' : 'إضافة صفحة جديدة'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>رقم الصفحة</Label>
                    <Input type="number" value={formData.page_number} onChange={(e) => setFormData({...formData, page_number: e.target.value})} />
                  </div>
                  <div>
                    <Label>اسم السورة</Label>
                    <Input value={formData.surah_name} onChange={(e) => setFormData({...formData, surah_name: e.target.value})} />
                  </div>
                  <div>
                    <Label>رقم الجزء</Label>
                    <Input type="number" value={formData.juz_number} onChange={(e) => setFormData({...formData, juz_number: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>النص العربي</Label>
                  <Textarea value={formData.arabic_text} onChange={(e) => setFormData({...formData, arabic_text: e.target.value})} dir="rtl" rows={4} />
                </div>
                <div>
                  <Label>رابط صورة المصحف</Label>
                  <Input value={formData.arabic_image_url} onChange={(e) => setFormData({...formData, arabic_image_url: e.target.value})} dir="ltr" />
                </div>
                <div>
                  <Label>رابط صورة الترجمة</Label>
                  <Input value={formData.translation_image_url} onChange={(e) => setFormData({...formData, translation_image_url: e.target.value})} dir="ltr" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit}>{editingPage ? 'تحديث' : 'إضافة'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصفحة</TableHead>
                  <TableHead>السورة</TableHead>
                  <TableHead>الجزء</TableHead>
                  <TableHead>صورة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.slice(0, 50).map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>{page.page_number}</TableCell>
                    <TableCell>{page.surah_name}</TableCell>
                    <TableCell>{page.juz_number}</TableCell>
                    <TableCell>{page.arabic_image_url ? '✅' : '❌'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(page)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(page.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pages.length > 50 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                يتم عرض أول 50 صفحة من {pages.length}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuranPagesManagement;
