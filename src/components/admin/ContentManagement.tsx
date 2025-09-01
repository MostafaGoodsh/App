import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pencil, Plus, Image, FileText, Upload, X, Zap, MousePointer, RefreshCw, Eye, EyeOff } from "lucide-react";

interface AppContent {
  id: string;
  content_key: string;
  content_type: string;
  text_content?: string;
  image_url?: string;
  alt_text?: string;
  position_order: number;
  is_active: boolean;
}

export default function ContentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contents, setContents] = useState<AppContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<AppContent | null>(null);
  
  const [formData, setFormData] = useState({
    content_key: "",
    content_type: "text",
    text_content: "",
    image_url: "",
    alt_text: "",
    position_order: 0,
    is_active: true
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      console.log('Fetching content management data...');
      const { data, error } = await supabase
        .from('app_content')
        .select('*')
        .order('position_order', { ascending: true });

      if (error) throw error;
      console.log('Content management data loaded:', data?.length || 0, 'items');
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب المحتوى",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchContents();
    // Trigger refresh on frontend
    window.dispatchEvent(new CustomEvent('app-content-updated'));
    toast({
      title: "تم التحديث",
      description: "تم تحديث قائمة المحتوى بنجاح"
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `app-content/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('learning-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('learning-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let imageUrl = formData.image_url;
      
      if (selectedFile && (formData.content_type === 'image' || formData.content_type === 'msra_mining_card')) {
        imageUrl = await uploadImage(selectedFile);
      }

      const contentData = {
        ...formData,
        image_url: (formData.content_type === 'image' || formData.content_type === 'msra_mining_card') ? imageUrl : null,
        text_content: (formData.content_type === 'text' || formData.content_type === 'msra_mining_card') ? formData.text_content : null,
        created_by: user.id
      };

      if (editingContent) {
        const { error } = await supabase
          .from('app_content')
          .update(contentData)
          .eq('id', editingContent.id);

        if (error) throw error;
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث المحتوى بنجاح"
        });
      } else {
        const { error } = await supabase
          .from('app_content')
          .insert([contentData]);

        if (error) throw error;
        
        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء المحتوى بنجاح"
        });
      }

      setShowDialog(false);
      resetForm();
      await fetchContents();
      
      // Force refresh of app content
      window.dispatchEvent(new CustomEvent('app-content-updated'));
      
      // Add slight delay to ensure the event is processed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ المحتوى",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      content_key: "",
      content_type: "text",
      text_content: "",
      image_url: "",
      alt_text: "",
      position_order: 0,
      is_active: true
    });
    setEditingContent(null);
    setSelectedFile(null);
  };

  const handleEdit = (content: AppContent) => {
    setEditingContent(content);
    setFormData({
      content_key: content.content_key,
      content_type: content.content_type,
      text_content: content.text_content || "",
      image_url: content.image_url || "",
      alt_text: content.alt_text || "",
      position_order: content.position_order,
      is_active: content.is_active
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;

    try {
      const { error } = await supabase
        .from('app_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المحتوى بنجاح"
      });
      
      await fetchContents();
      // Force refresh of app content
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف المحتوى",
        variant: "destructive"
      });
    }
  };

  const toggleContentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('app_content')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "تم التحديث",
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المحتوى`
      });
      
      await fetchContents();
      // Force refresh of app content
      window.dispatchEvent(new CustomEvent('app-content-updated'));
    } catch (error) {
      console.error('Error toggling content status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث حالة المحتوى",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة محتوى التطبيق</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة محتوى جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingContent ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingContent ? 'تعديل محتوى موجود في التطبيق' : 'إضافة محتوى جديد للتطبيق'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="content_key">مفتاح المحتوى</Label>
                <Input
                  id="content_key"
                  value={formData.content_key}
                  onChange={(e) => setFormData({...formData, content_key: e.target.value})}
                  placeholder="مثال: hero_title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content_type">نوع المحتوى</Label>
                <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="text">نص عام</SelectItem>
                   <SelectItem value="image">صورة</SelectItem>
                   <SelectItem value="hero_content">محتوى الصفحة الرئيسية</SelectItem>
                   <SelectItem value="hero_button">أزرار الصفحة الرئيسية</SelectItem>
                   <SelectItem value="msra_mining_card">كارت التعدين Ms-Ra</SelectItem>
                   <SelectItem value="wallet_card">كارت المحفظة</SelectItem>
                   <SelectItem value="learning_card">كارت التعلم والمعرفة</SelectItem>
                   <SelectItem value="updates_content">محتوى صفحة التحديثات</SelectItem>
                   <SelectItem value="stable_coin_content">محتوى صفحة العملة المستقرة</SelectItem>
                   <SelectItem value="rwa_content">محتوى صفحة الأصول الحقيقية</SelectItem>
                   <SelectItem value="call_out_content">محتوى صفحة المجتمع</SelectItem>
                   <SelectItem value="sidebar_content">محتوى الشريط الجانبي</SelectItem>
                   <SelectItem value="admin_content">محتوى لوحة الإدارة</SelectItem>
                 </SelectContent>
                </Select>
              </div>

              {(formData.content_type === 'text' || 
                formData.content_type === 'hero_content' || 
                formData.content_type === 'updates_content' || 
                formData.content_type === 'stable_coin_content' || 
                formData.content_type === 'rwa_content' || 
                formData.content_type === 'call_out_content' || 
                formData.content_type === 'sidebar_content' || 
                formData.content_type === 'admin_content') ? (
                <div>
                  <Label htmlFor="text_content">المحتوى النصي</Label>
                  <Textarea
                    id="text_content"
                    value={formData.text_content}
                    onChange={(e) => setFormData({...formData, text_content: e.target.value})}
                    placeholder="اكتب النص هنا..."
                    rows={4}
                    required
                  />
                </div>
              ) : formData.content_type === 'msra_mining_card' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card_title">عنوان الكارت</Label>
                    <Input
                      id="card_title"
                      value={formData.text_content}
                      onChange={(e) => setFormData({...formData, text_content: e.target.value})}
                      placeholder="مثال: تعدين Ms-Ra"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="card_background">صورة خلفية الكارت</Label>
                    <Input
                      id="card_background"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    
                    {formData.image_url && (
                      <div className="relative">
                        <img src={formData.image_url} alt="خلفية الكارت" className="w-full h-32 object-cover rounded" />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="card_alt_text">وصف صورة الخلفية</Label>
                      <Input
                        id="card_alt_text"
                        value={formData.alt_text}
                        onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                        placeholder="وصف خلفية كارت التعدين..."
                      />
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">معاينة كارت التعدين Ms-Ra</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.text_content || "عنوان الكارت"}
                    </p>
                   </div>
                 </div>
                ) : (formData.content_type === 'hero_button' || 
                     formData.content_type === 'wallet_card' || 
                     formData.content_type === 'learning_card') ? (
                 <div className="space-y-4">
                   <div>
                     <Label htmlFor="button_text">نص الزر/الكارت</Label>
                     <Input
                       id="button_text"
                       value={formData.text_content}
                       onChange={(e) => setFormData({...formData, text_content: e.target.value})}
                       placeholder="مثال: انضم الآن | Join Now"
                     />
                   </div>
                   
                   {(formData.content_type === 'wallet_card' || formData.content_type === 'learning_card') && (
                     <div className="space-y-2">
                       <Label htmlFor="card_image">صورة الكارت</Label>
                       <Input
                         id="card_image"
                         type="file"
                         accept="image/*"
                         onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                       />
                       
                       {formData.image_url && (
                         <div className="relative">
                           <img src={formData.image_url} alt="صورة الكارت" className="w-full h-32 object-cover rounded" />
                         </div>
                       )}
                       
                       <div>
                         <Label htmlFor="card_alt_text">وصف صورة الكارت</Label>
                         <Input
                           id="card_alt_text"
                           value={formData.alt_text}
                           onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                           placeholder="وصف صورة الكارت..."
                         />
                       </div>
                     </div>
                   )}
                   
                   <div className="text-center p-4 bg-primary/10 rounded-lg">
                     <p className="text-sm font-medium">
                       معاينة {formData.content_type === 'hero_button' ? 'الزر' : 'الكارت'}
                     </p>
                     <div className="mt-2 px-4 py-2 border border-primary/30 rounded bg-transparent text-primary">
                       {formData.text_content || "نص العنصر"}
                     </div>
                   </div>
                 </div>
               ) : (
                <div className="space-y-2">
                  <Label htmlFor="image_file">رفع صورة</Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  
                  {formData.image_url && (
                    <div className="relative">
                      <img src={formData.image_url} alt="معاينة" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="alt_text">نص بديل للصورة</Label>
                    <Input
                      id="alt_text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                      placeholder="وصف الصورة..."
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="position_order">ترتيب العرض</Label>
                <Input
                  id="position_order"
                  type="number"
                  value={formData.position_order}
                  onChange={(e) => setFormData({...formData, position_order: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>

                <Button type="submit" className="w-full">
                  {editingContent ? 'تحديث' : 'إنشاء'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {contents.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">لا توجد محتويات حالياً</p>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة أول محتوى
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                 {content.content_type === 'text' ? 
                   <FileText className="h-4 w-4" /> : 
                   content.content_type === 'msra_mining_card' ?
                   <Zap className="h-4 w-4" /> :
                   content.content_type === 'hero_button' ?
                   <MousePointer className="h-4 w-4" /> :
                   <Image className="h-4 w-4" />
                 }
                {content.content_key}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleContentStatus(content.id, content.is_active)}
                  title={content.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                >
                  {content.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(content)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(content.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Text-based content types */}
              {(content.content_type === 'text' || 
                content.content_type === 'hero_content' ||
                content.content_type === 'updates_content' ||
                content.content_type === 'stable_coin_content' ||
                content.content_type === 'rwa_content' ||
                content.content_type === 'call_out_content' ||
                content.content_type === 'sidebar_content' ||
                content.content_type === 'admin_content') ? (
                <div>
                  <p className="text-muted-foreground">{content.text_content}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    النوع: {content.content_type}
                  </div>
                </div>
              ) : content.content_type === 'msra_mining_card' ? (
                <div>
                  {content.image_url && (
                    <img src={content.image_url} alt={content.alt_text} className="w-32 h-32 object-cover rounded mb-2" />
                  )}
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">
                      {content.text_content || "كارت التعدين Ms-Ra"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {content.alt_text || "يعرض نظام التعدين والعناوين المسجلة"}
                     </p>
                   </div>
                 </div>
               ) : (content.content_type === 'hero_button' ||
                     content.content_type === 'wallet_card' ||
                     content.content_type === 'learning_card') ? (
                 <div>
                   {content.image_url && (
                     <img src={content.image_url} alt={content.alt_text} className="w-32 h-32 object-cover rounded mb-2" />
                   )}
                   <div className="text-center p-4 bg-primary/10 rounded-lg">
                     <div className="px-4 py-2 border border-primary/30 rounded bg-transparent text-primary">
                       {content.text_content || "نص العنصر"}
                     </div>
                     <p className="text-xs text-muted-foreground mt-2">
                       النوع: {content.content_type}
                     </p>
                   </div>
                 </div>
               ) : (
                <div>
                  {content.image_url && (
                    <img src={content.image_url} alt={content.alt_text} className="w-32 h-32 object-cover rounded mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground">{content.alt_text}</p>
                </div>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>الترتيب: {content.position_order}</span>
                <span className={content.is_active ? "text-green-600" : "text-red-600"}>
                  {content.is_active ? "نشط" : "غير نشط"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}