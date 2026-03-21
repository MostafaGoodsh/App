import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pencil, Plus, Image, FileText, Upload, X, Zap, MousePointer, RefreshCw, Eye, EyeOff, Building, Coins, Video } from "lucide-react";
import { ReelsManagement } from "@/components/admin/ReelsManagement";

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

  const rwaContents = contents.filter(c => c.content_type === 'rwa_content');
  const stableCoinContents = contents.filter(c => c.content_type === 'stable_coin_content');
  const otherContents = contents.filter(c => c.content_type !== 'rwa_content' && c.content_type !== 'stable_coin_content');

  return (
    <div className="box-border w-full max-w-[100vw] overflow-x-hidden px-2 py-4 sm:px-4 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-3xl font-bold">إدارة محتوى التطبيق</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                إضافة محتوى جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-md">
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

      <Tabs defaultValue="content" className="w-full max-w-full overflow-hidden">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
          <TabsTrigger value="content" className="min-w-0 px-2 py-2 text-xs sm:text-sm">
            <FileText className="w-4 h-4" />
            المحتوى النصي
          </TabsTrigger>
          <TabsTrigger value="reels" className="min-w-0 px-2 py-2 text-xs sm:text-sm">
            <Video className="w-4 h-4" />
            الريلز
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4 w-full max-w-full overflow-hidden">
          <Tabs defaultValue="all" className="w-full max-w-full overflow-hidden">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
              <TabsTrigger value="all" className="min-w-0 px-2 py-2 text-[11px] sm:text-sm">جميع المحتويات</TabsTrigger>
              <TabsTrigger value="rwa" className="min-w-0 gap-1 px-2 py-2 text-[11px] sm:text-sm">
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                RWA
              </TabsTrigger>
              <TabsTrigger value="stablecoin" className="min-w-0 gap-1 px-2 py-2 text-[11px] sm:text-sm">
                <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
                العملة المستقرة
              </TabsTrigger>
              <TabsTrigger value="other" className="min-w-0 px-2 py-2 text-[11px] sm:text-sm">محتويات أخرى</TabsTrigger>
            </TabsList>
        
        <TabsContent value="all" className="mt-6 w-full max-w-full overflow-hidden">
          <div className="grid gap-4">
            {contents.map((content) => (
              <Card key={content.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="flex min-w-0 items-start gap-2 break-words text-base leading-snug sm:text-lg">
                     {content.content_type === 'text' ? 
                       <FileText className="h-4 w-4" /> : 
                       content.content_type === 'msra_mining_card' ?
                       <Zap className="h-4 w-4" /> :
                       content.content_type === 'hero_button' ?
                       <MousePointer className="h-4 w-4" /> :
                       <Image className="h-4 w-4" />
                     }
                    <span className="min-w-0 break-all">{content.content_key}</span>
                  </CardTitle>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
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
                      <p className="break-words text-muted-foreground">{content.text_content}</p>
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
                  <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                    <span>الترتيب: {content.position_order}</span>
                    <span className={content.is_active ? "text-green-600" : "text-red-600"}>
                      {content.is_active ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rwa" className="mt-6 w-full max-w-full overflow-hidden">
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">إدارة محتوى الأصول الحقيقية (RWA)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              إدارة النصوص والمحتوى الخاص بصفحة الأصول الحقيقية المرموزة
            </p>
          </div>
          <div className="grid gap-4">
            {rwaContents.length > 0 ? rwaContents.map((content) => (
              <Card key={content.id} className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex min-w-0 items-start gap-2 break-words text-base sm:text-lg">
                        <Building className="h-4 w-4" />
                        <span className="min-w-0 break-all">{content.content_key}</span>
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {content.content_type}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          #{content.position_order}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleContentStatus(content.id, content.is_active)}
                        className="h-8 w-8 p-0"
                      >
                        {content.is_active ? 
                          <Eye className="h-4 w-4 text-green-600" /> : 
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(content)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(content.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {content.content_type === 'image' && content.image_url && (
                    <div className="mb-3">
                      <img 
                        src={content.image_url} 
                        alt={content.alt_text || 'صورة'} 
                        className="w-full h-32 object-cover rounded border"
                      />
                      {content.alt_text && (
                        <p className="text-xs text-muted-foreground mt-1">
                          النص البديل: {content.alt_text}
                        </p>
                      )}
                    </div>
                  )}
                  {content.text_content && (
                    <p className="break-words text-muted-foreground text-sm leading-relaxed">
                      {content.text_content.length > 200 
                        ? `${content.text_content.substring(0, 200)}...` 
                        : content.text_content
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            )) : (
              <Card className="border-dashed border-2 border-primary/30">
                <CardContent className="text-center py-8">
                  <Building className="w-12 h-12 mx-auto mb-4 text-primary/60" />
                  <p className="text-muted-foreground">لا يوجد محتوى RWA حتى الآن</p>
                  <p className="text-sm text-muted-foreground mt-1">أضف محتوى جديد من نوع "rwa_content"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stablecoin" className="mt-6 w-full max-w-full overflow-hidden">
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">إدارة محتوى العملة المستقرة</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              إدارة النصوص والمحتوى الخاص بصفحة العملة المستقرة MSR
            </p>
          </div>
          <div className="grid gap-4">
            {stableCoinContents.length > 0 ? stableCoinContents.map((content) => (
              <Card key={content.id} className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex min-w-0 items-start gap-2 break-words text-base sm:text-lg">
                        <Coins className="h-4 w-4" />
                        <span className="min-w-0 break-all">{content.content_key}</span>
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {content.content_type}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          #{content.position_order}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleContentStatus(content.id, content.is_active)}
                        className="h-8 w-8 p-0"
                      >
                        {content.is_active ? 
                          <Eye className="h-4 w-4 text-green-600" /> : 
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(content)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(content.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {content.content_type === 'image' && content.image_url && (
                    <div className="mb-3">
                      <img 
                        src={content.image_url} 
                        alt={content.alt_text || 'صورة'} 
                        className="w-full h-32 object-cover rounded border"
                      />
                      {content.alt_text && (
                        <p className="text-xs text-muted-foreground mt-1">
                          النص البديل: {content.alt_text}
                        </p>
                      )}
                    </div>
                  )}
                  {content.text_content && (
                    <p className="break-words text-muted-foreground text-sm leading-relaxed">
                      {content.text_content.length > 200 
                        ? `${content.text_content.substring(0, 200)}...` 
                        : content.text_content
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            )) : (
              <Card className="border-dashed border-2 border-primary/30">
                <CardContent className="text-center py-8">
                  <Coins className="w-12 h-12 mx-auto mb-4 text-primary/60" />
                  <p className="text-muted-foreground">لا يوجد محتوى العملة المستقرة حتى الآن</p>
                  <p className="text-sm text-muted-foreground mt-1">أضف محتوى جديد من نوع "stable_coin_content"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="other" className="mt-6 w-full max-w-full overflow-hidden">
          <div className="grid gap-4">
            {otherContents.map((content) => (
              <Card key={content.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="min-w-0 break-all text-base sm:text-lg">{content.content_key}</CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {content.content_type}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          #{content.position_order}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleContentStatus(content.id, content.is_active)}
                        className="h-8 w-8 p-0"
                      >
                        {content.is_active ? 
                          <Eye className="h-4 w-4 text-green-600" /> : 
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(content)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(content.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {content.content_type === 'image' && content.image_url && (
                    <div className="mb-3">
                      <img 
                        src={content.image_url} 
                        alt={content.alt_text || 'صورة'} 
                        className="w-full h-32 object-cover rounded border"
                      />
                      {content.alt_text && (
                        <p className="text-xs text-muted-foreground mt-1">
                          النص البديل: {content.alt_text}
                        </p>
                      )}
                    </div>
                  )}
                  {content.text_content && (
                    <p className="break-words text-muted-foreground text-sm leading-relaxed">
                       {content.text_content.length > 200 
                        ? `${content.text_content.substring(0, 200)}...` 
                        : content.text_content
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          </TabsContent>
        </Tabs>
        </TabsContent>

        <TabsContent value="reels">
          <ReelsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}