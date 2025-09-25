import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Star, Award, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalloutPersonality {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  contact_link: string;
  contact_button_text: string;
}

const CalloutPersonalitiesManagement = () => {
  const [personalities, setPersonalities] = useState<CalloutPersonality[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingPersonality, setEditingPersonality] = useState<CalloutPersonality | null>(null);
  
  // Form state for personalities
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    image_url: "",
    category: "public_figure",
    is_featured: false,
    display_order: 0,
    is_active: true,
    contact_link: "#",
    contact_button_text: "تواصل معي"
  });

  // Form state for page content
  const [contentData, setContentData] = useState({
    title: "نداء التقدير والإلهام",
    intro: "العقيدة و الأخلاق هي نقطة تميزنا و تفردنا ، لذلك انشأنا هذا القسم خصيصا لارسال دعوات استدعاء شرفي لكل انسان مؤثر حول العالم و كل من يتبني و يخدم عقيدتنا و أهدافنا ،،، سعدنا بوضعك في قائمة الاستدعاء الشرفيه و يثرينا قبولك."
  });

  const categories = [
    { value: "scientist", label: "عالم", icon: Award },
    { value: "artist", label: "فنان", icon: Sparkles },
    { value: "intellectual", label: "مفكر", icon: Users },
    { value: "public_figure", label: "شخصية عامة", icon: Star }
  ];

  useEffect(() => {
    fetchPersonalities();
  }, []);

  const fetchPersonalities = async () => {
    try {
      const { data, error } = await supabase
        .from('callout_personalities')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setPersonalities(data || []);
    } catch (error) {
      console.error('Error fetching personalities:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPersonality) {
        const { error } = await supabase
          .from('callout_personalities')
          .update(formData)
          .eq('id', editingPersonality.id);
          
        if (error) throw error;
        toast.success('تم تحديث الشخصية بنجاح');
      } else {
        const { error } = await supabase
          .from('callout_personalities')
          .insert([formData]);
          
        if (error) throw error;
        toast.success('تم إضافة الشخصية بنجاح');
      }
      
      await fetchPersonalities();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving personality:', error);
      toast.error('فشل في حفظ البيانات');
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Store content in localStorage for now
      localStorage.setItem('callout_content', JSON.stringify(contentData));
      toast.success('تم حفظ محتوى الصفحة بنجاح');
      setIsContentDialogOpen(false);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('فشل في حفظ المحتوى');
    }
  };

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('callout_content');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContentData(parsedContent);
      } catch (error) {
        console.error('Error parsing saved content:', error);
      }
    }
  }, []);

  const handleEdit = (personality: CalloutPersonality) => {
    setEditingPersonality(personality);
      setFormData({
        name: personality.name,
        title: personality.title || "",
        description: personality.description || "",
        image_url: personality.image_url || "",
        category: personality.category,
        is_featured: personality.is_featured,
        display_order: personality.display_order,
        contact_link: personality.contact_link || '#',
        contact_button_text: personality.contact_button_text || 'تواصل معي',
        is_active: personality.is_active
      });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشخصية؟')) return;
    
    try {
      const { error } = await supabase
        .from('callout_personalities')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      await fetchPersonalities();
      toast.success('تم حذف الشخصية بنجاح');
    } catch (error) {
      console.error('Error deleting personality:', error);
      toast.error('فشل في حذف الشخصية');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      image_url: "",
      category: "public_figure",
      is_featured: false,
      display_order: 0,
      is_active: true,
      contact_link: "#",
      contact_button_text: "تواصل معي"
    });
    setEditingPersonality(null);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    if (!categoryData) return <Star className="w-4 h-4" />;
    const Icon = categoryData.icon;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.label || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة قائمة الاستدعاء الشرفية</h1>
          <p className="text-muted-foreground">إدارة الشخصيات المكرمة في قائمة الاستدعاء</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                تعديل العنوان والمقدمة
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تعديل محتوى الصفحة</DialogTitle>
                <DialogDescription>
                  تعديل العنوان والمقدمة الخاصة بصفحة الاستدعاء الشرفي
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleContentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">عنوان الصفحة</label>
                  <Input
                    value={contentData.title}
                    onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
                    placeholder="عنوان الصفحة"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">المقدمة</label>
                  <Textarea
                    value={contentData.intro}
                    onChange={(e) => setContentData({ ...contentData, intro: e.target.value })}
                    placeholder="النص التعريفي للصفحة"
                    rows={6}
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    حفظ التغييرات
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة شخصية جديدة
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPersonality ? 'تعديل الشخصية' : 'إضافة شخصية جديدة'}
              </DialogTitle>
              <DialogDescription>
                أدخل معلومات الشخصية المراد إضافتها لقائمة الاستدعاء الشرفية
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اسم الشخصية"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">اللقب/المنصب</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثل: عالم الكيمياء"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف موجز عن الشخصية وإنجازاتها"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الصورة</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="رابط صورة الشخصية"
                  type="url"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">التصنيف</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">ترتيب العرض</label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">رابط التواصل</label>
                  <Input
                    value={formData.contact_link}
                    onChange={(e) => setFormData({ ...formData, contact_link: e.target.value })}
                    placeholder="https://wa.me/1234567890"
                    type="url"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">نص زر التواصل</label>
                  <Input
                    value={formData.contact_button_text}
                    onChange={(e) => setFormData({ ...formData, contact_button_text: e.target.value })}
                    placeholder="تواصل معي"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <label className="text-sm font-medium">شخصية مميزة</label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <label className="text-sm font-medium">نشط</label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingPersonality ? 'حفظ التغييرات' : 'إضافة الشخصية'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الشخصيات</CardTitle>
          <CardDescription>
            إجمالي الشخصيات: {personalities.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الشخصية</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personalities.map((personality) => (
                <TableRow key={personality.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {personality.image_url && (
                        <img
                          src={personality.image_url}
                          alt={personality.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {personality.name}
                          {personality.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        {personality.title && (
                          <div className="text-sm text-muted-foreground">
                            {personality.title}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {getCategoryIcon(personality.category)}
                      {getCategoryLabel(personality.category)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={personality.is_active ? "default" : "secondary"}>
                      {personality.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>{personality.display_order}</TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(personality)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(personality.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {personalities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد شخصيات مضافة بعد
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalloutPersonalitiesManagement;