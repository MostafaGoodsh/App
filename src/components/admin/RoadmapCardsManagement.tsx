import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RoadmapCard {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  description?: string;
  description_en?: string;
  background_gradient: string;
  display_order: number;
  is_active: boolean;
  page_title?: string;
  page_content?: string;
  icon_url?: string;
}

const RoadmapCardsManagement = () => {
  const [cards, setCards] = useState<RoadmapCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<Partial<RoadmapCard> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmap_cards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingCard) return;

    try {
      if (editingCard.id) {
        const { error } = await supabase
          .from('roadmap_cards')
          .update(editingCard)
          .eq('id', editingCard.id);

        if (error) throw error;
        toast({ title: "تم التحديث بنجاح" });
      } else {
        const { error } = await supabase
          .from('roadmap_cards')
          .insert([editingCard as any]);

        if (error) throw error;
        toast({ title: "تم الإضافة بنجاح" });
      }

      setIsDialogOpen(false);
      setEditingCard(null);
      fetchCards();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "تم الحذف بنجاح" });
      fetchCards();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف البيانات",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingCard({
      title: '',
      slug: '',
      background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display_order: cards.length + 1,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (card: RoadmapCard) => {
    setEditingCard(card);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة فقط",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `roadmap-icons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // حذف الصورة القديمة إذا وجدت
      if (editingCard?.icon_url && editingCard.icon_url.includes('avatars/')) {
        const oldPath = editingCard.icon_url.split('avatars/')[1];
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      setEditingCard({ ...editingCard, icon_url: publicUrl });

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم تحميل الأيقونة بنجاح",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">الكروت ({cards.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة كارت جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard?.id ? 'تعديل الكارت' : 'إضافة كارت جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الكارت
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>العنوان (عربي)</Label>
                  <Input
                    value={editingCard?.title || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    placeholder="العنوان بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={editingCard?.title_en || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, title_en: e.target.value })}
                    placeholder="Title in English"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={editingCard?.slug || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, slug: e.target.value })}
                  placeholder="white-paper"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الوصف (عربي)</Label>
                  <Textarea
                    value={editingCard?.description || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    placeholder="الوصف بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={editingCard?.description_en || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description_en: e.target.value })}
                    placeholder="Description in English"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>أيقونة الكارت</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4 animate-pulse" />
                      جاري الرفع...
                    </div>
                  )}
                </div>
                {editingCard?.icon_url && (
                  <div className="mt-2">
                    <img 
                      src={editingCard.icon_url} 
                      alt="Icon preview" 
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Background Gradient (CSS)</Label>
                <Input
                  value={editingCard?.background_gradient || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, background_gradient: e.target.value })}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
                <div 
                  className="w-full h-20 rounded-lg"
                  style={{ background: editingCard?.background_gradient }}
                />
              </div>

              <div className="space-y-2">
                <Label>عنوان الصفحة</Label>
                <Input
                  value={editingCard?.page_title || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, page_title: e.target.value })}
                  placeholder="عنوان الصفحة الداخلية"
                />
              </div>

              <div className="space-y-2">
                <Label>محتوى الصفحة (HTML)</Label>
                <Textarea
                  value={editingCard?.page_content || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, page_content: e.target.value })}
                  placeholder="<p>المحتوى هنا...</p>"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ترتيب العرض</Label>
                  <Input
                    type="number"
                    value={editingCard?.display_order || 0}
                    onChange={(e) => setEditingCard({ ...editingCard, display_order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse pt-8">
                  <Switch
                    checked={editingCard?.is_active}
                    onCheckedChange={(checked) => setEditingCard({ ...editingCard, is_active: checked })}
                  />
                  <Label>نشط</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
              <Button onClick={handleSave}>
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>الترتيب</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ background: card.background_gradient }}
                  />
                  {card.title}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{card.slug}</TableCell>
              <TableCell>{card.display_order}</TableCell>
              <TableCell>
                {card.is_active ? (
                  <span className="text-green-600">نشط</span>
                ) : (
                  <span className="text-gray-500">غير نشط</span>
                )}
              </TableCell>
              <TableCell className="text-left">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف "{card.title}"؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(card.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoadmapCardsManagement;
