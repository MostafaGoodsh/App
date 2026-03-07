import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import QuranBulkImport from "./QuranBulkImport";
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
  arabic_image_url: string | null;
  translation_image_url: string | null;
  admin_notes: string | null;
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
    admin_notes: "",
  });
  const [arabicImageFile, setArabicImageFile] = useState<File | null>(null);
  const [translationImageFile, setTranslationImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('quran-pages')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('quran-pages')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploadingImage(true);

      let arabicImageUrl = editingPage?.arabic_image_url || null;
      let translationImageUrl = editingPage?.translation_image_url || null;

      // Upload Arabic image if provided
      if (arabicImageFile) {
        arabicImageUrl = await uploadImage(arabicImageFile, 'arabic');
      }

      // Upload translation image if provided
      if (translationImageFile) {
        translationImageUrl = await uploadImage(translationImageFile, 'translation');
      }

      const pageData = {
        page_number: parseInt(formData.page_number),
        juz_number: parseInt(formData.juz_number),
        surah_name: formData.surah_name,
        arabic_text: formData.arabic_text,
        translation_text: formData.translation_text || null,
        arabic_image_url: arabicImageUrl,
        translation_image_url: translationImageUrl,
        admin_notes: formData.admin_notes || null,
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
    } finally {
      setUploadingImage(false);
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
      admin_notes: page.admin_notes || "",
    });
    setArabicImageFile(null);
    setTranslationImageFile(null);
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
      admin_notes: "",
    });
    setArabicImageFile(null);
    setTranslationImageFile(null);
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
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* عنوان الصفحة الرئيسي */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-primary/70 p-3 rounded-xl shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          إدارة صفحات القرآن الكريم
        </h1>
        <p className="text-muted-foreground text-lg mr-16">
          إضافة وتعديل وإدارة صفحات القرآن الكريم مع الترجمة والنقاط
        </p>
      </div>

      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">
              قائمة الصفحات
            </CardTitle>
          </div>
          <div className="flex gap-3 flex-wrap">
            <QuranBulkImport onImportComplete={fetchPages} />
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة صفحة جديدة
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  {editingPage ? 'تعديل صفحة القرآن' : 'إضافة صفحة قرآن جديدة'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="page_number" className="text-base font-semibold">رقم الصفحة</Label>
                    <Input
                      id="page_number"
                      type="number"
                      value={formData.page_number}
                      onChange={(e) => setFormData({...formData, page_number: e.target.value})}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="juz_number" className="text-base font-semibold">رقم الجزء</Label>
                    <Input
                      id="juz_number"
                      type="number"
                      value={formData.juz_number}
                      onChange={(e) => setFormData({...formData, juz_number: e.target.value})}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surah_name" className="text-base font-semibold">اسم السورة</Label>
                  <Input
                    id="surah_name"
                    value={formData.surah_name}
                    onChange={(e) => setFormData({...formData, surah_name: e.target.value})}
                    required
                    className="h-11"
                    placeholder="مثال: سورة الفاتحة"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arabic_image" className="text-base font-semibold">
                    صورة الصفحة العربية *
                  </Label>
                  <Input
                    id="arabic_image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setArabicImageFile(e.target.files?.[0] || null)}
                    required={!editingPage?.arabic_image_url}
                    className="h-11"
                  />
                  {editingPage?.arabic_image_url && (
                    <p className="text-sm text-muted-foreground">
                      ✓ توجد صورة محفوظة - يمكنك رفع صورة جديدة لاستبدالها
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="translation_image" className="text-base font-semibold">
                    صورة الترجمة الإنجليزية (اختياري)
                  </Label>
                  <Input
                    id="translation_image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setTranslationImageFile(e.target.files?.[0] || null)}
                    className="h-11"
                  />
                  {editingPage?.translation_image_url && (
                    <p className="text-sm text-muted-foreground">
                      ✓ توجد صورة محفوظة - يمكنك رفع صورة جديدة لاستبدالها
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arabic_text" className="text-base font-semibold">
                    النص العربي (اختياري - للبحث والأرشفة)
                  </Label>
                  <Textarea
                    id="arabic_text"
                    value={formData.arabic_text}
                    onChange={(e) => setFormData({...formData, arabic_text: e.target.value})}
                    rows={4}
                    className="font-arabic text-lg leading-loose"
                    dir="rtl"
                    placeholder="أدخل النص القرآني هنا للأرشفة (اختياري)..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="translation_text" className="text-base font-semibold text-right">
                    الترجمة الإنجليزية (اختياري - للبحث)
                  </Label>
                  <Textarea
                    id="translation_text"
                    value={formData.translation_text}
                    onChange={(e) => setFormData({...formData, translation_text: e.target.value})}
                    rows={4}
                    dir="ltr"
                    placeholder="Enter English translation for archiving (optional)..."
                    className="text-base text-left"
                  />
                </div>

                <div className="space-y-2 bg-muted/30 p-4 rounded-lg border">
                  <Label htmlFor="admin_notes" className="text-base font-semibold flex items-center gap-2">
                    <span>📝</span>
                    تعليقات المدير (خاصة)
                  </Label>
                  <Textarea
                    id="admin_notes"
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
                    rows={3}
                    dir="rtl"
                    placeholder="أضف ملاحظاتك الخاصة حول هذه الصفحة..."
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    هذه التعليقات خاصة بالإدارة فقط ولن تظهر للمستخدمين
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="points_reward" className="text-base font-semibold">النقاط المكتسبة</Label>
                    <Input
                      id="points_reward"
                      type="number"
                      value={formData.points_reward}
                      onChange={(e) => setFormData({...formData, points_reward: e.target.value})}
                      required
                      className="h-11"
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order" className="text-base font-semibold">ترتيب العرض</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                      required
                      className="h-11"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} size="lg" disabled={uploadingImage}>
                    إلغاء
                  </Button>
                  <Button type="submit" size="lg" className="shadow-md hover:shadow-lg transition-all" disabled={uploadingImage}>
                    {uploadingImage ? '⏳ جاري الرفع...' : editingPage ? '✓ تحديث الصفحة' : '+ إضافة الصفحة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-muted/50 to-muted/20">
                  <TableHead className="font-bold text-right">رقم الصفحة</TableHead>
                  <TableHead className="font-bold text-right">الجزء</TableHead>
                  <TableHead className="font-bold text-right">السورة</TableHead>
                  <TableHead className="font-bold text-right">النقاط</TableHead>
                  <TableHead className="font-bold text-right">الحالة</TableHead>
                  <TableHead className="font-bold text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold text-primary text-right">{page.page_number}</TableCell>
                    <TableCell className="font-semibold text-right">{page.juz_number}</TableCell>
                    <TableCell className="font-semibold text-right">{page.surah_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg w-fit">
                        <span className="font-bold text-primary">{page.points_reward}</span>
                        <span className="text-xs text-muted-foreground">نقطة</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {page.is_active ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-500/20">
                          ✓ نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-500/15 text-gray-700 dark:text-gray-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-500/20">
                          ✗ غير نشط
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(page)}
                          className="hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(page.id)}
                          className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuranPagesManagement;