import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CameraCapture } from "@/components/ui/camera-capture";
import { Megaphone, Plus, Edit, Upload, Camera, Archive, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActiveCallout {
  id: string;
  personality_name: string;
  personality_title: string | null;
  personality_description: string | null;
  personality_image_url: string | null;
  callout_text: string;
  contact_link: string;
  contact_button_text: string;
  created_at: string;
  updated_at: string;
}

const ActiveCalloutManagement = () => {
  const [activeCallout, setActiveCallout] = useState<ActiveCallout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [formData, setFormData] = useState({
    personality_name: "",
    personality_title: "",
    personality_description: "",
    personality_image_url: "",
      callout_text: "العقيدة و الأخلاق هي نقطة تميزنا و تفردنا ، لذلك انشأنا هذا القسم خصيصا لارسال دعوات استدعاء شرفي لكل انسان مؤثر حول العالم و كل من يتبني و يخدم عقيدتنا و أهدافنا ،،، سعدنا بوضعك في قائمة الاستدعاء الشرفيه و يثرينا قبولك.",
    contact_link: "#",
    contact_button_text: "تواصل مع الشخصية"
  });

  useEffect(() => {
    fetchActiveCallout();
  }, []);

  const fetchActiveCallout = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('active_callouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setActiveCallout(data);
      
      if (data) {
        setFormData({
          personality_name: data.personality_name,
          personality_title: data.personality_title || "",
          personality_description: data.personality_description || "",
          personality_image_url: data.personality_image_url || "",
          callout_text: data.callout_text,
          contact_link: data.contact_link,
          contact_button_text: data.contact_button_text
        });
        setImagePreview(data.personality_image_url);
      }
    } catch (error) {
      console.error('Error fetching active callout:', error);
      toast.error('حدث خطأ في تحميل الاستدعاء النشط');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `callout-${Date.now()}.${fileExt}`;
      const filePath = `personalities/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('callout-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('callout-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      setFormData(prev => ({ ...prev, personality_image_url: imageUrl }));
      setImagePreview(imageUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('حدث خطأ في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (formData.personality_image_url) {
      setImagePreview(formData.personality_image_url);
      toast.success('تم تحديد رابط الصورة');
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setImagePreview(imageData);
    setFormData(prev => ({ ...prev, personality_image_url: imageData }));
    setShowCamera(false);
    toast.success('تم التقاط الصورة بنجاح');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.personality_name.trim()) {
      toast.error('يجب إدخال اسم الشخصية');
      return;
    }

    try {
      setSubmitting(true);

      // استخدام الدالة المخصصة لإنشاء استدعاء جديد
      const { data, error } = await supabase.rpc('create_new_callout', {
        p_personality_name: formData.personality_name.trim(),
        p_personality_title: formData.personality_title.trim() || null,
        p_personality_description: formData.personality_description.trim() || null,
        p_personality_image_url: formData.personality_image_url || null,
        p_callout_text: formData.callout_text.trim(),
        p_contact_link: formData.contact_link.trim(),
        p_contact_button_text: formData.contact_button_text.trim()
      });

      if (error) throw error;

      const result = data as any;
      toast.success(result.message || 'تم حفظ الاستدعاء بنجاح');
      if (result.archived_previous) {
        toast.info('تم نقل الاستدعاء السابق إلى الأرشيف');
      }
      
      setIsDialogOpen(false);
      // إعادة تحميل البيانات مع تأخير قصير للتأكد من التحديث
      setTimeout(() => {
        fetchActiveCallout();
      }, 500);
    } catch (error) {
      console.error('Error creating callout:', error);
      toast.error('حدث خطأ في إنشاء الاستدعاء');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      personality_name: "",
      personality_title: "",
      personality_description: "",
      personality_image_url: "",
      callout_text: "العقيدة و الأخلاق هي نقطة تميزنا و تفردنا ، لذلك انشأنا هذا القسم خصيصا لارسال دعوات استدعاء شرفي لكل انسان مؤثر حول العالم و كل من يتبني و يخدم عقيدتنا و أهدافنا ،،، سعدنا بوضعك في قائمة الاستدعاء الشرفيه و يثرينا قبولك.",
      contact_link: "#",
      contact_button_text: "تواصل مع الشخصية"
    });
    setImagePreview(null);
    setShowCamera(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 arabic-text">
            <Megaphone className="w-6 h-6 text-primary" />
            إدارة الاستدعاء النشط
          </h1>
          <p className="text-muted-foreground arabic-text">
            إدارة الاستدعاء النشط المعروض في الصفحة الرئيسية
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="arabic-text"
            >
              <Plus className="w-4 h-4 ml-2" />
              {activeCallout ? 'تحديث الاستدعاء' : 'إنشاء استدعاء جديد'}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="arabic-text">
                {activeCallout ? 'تحديث الاستدعاء النشط' : 'إنشاء استدعاء جديد'}
              </DialogTitle>
              <DialogDescription className="arabic-text">
                {activeCallout ? 
                  'سيتم نقل الاستدعاء الحالي إلى الأرشيف وإنشاء استدعاء جديد' :
                  'إنشاء أول استدعاء نشط على المنصة'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personality_name" className="arabic-text">اسم الشخصية *</Label>
                <Input
                  id="personality_name"
                  value={formData.personality_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality_name: e.target.value }))}
                  placeholder="مثال: د. أحمد زويل"
                  className="arabic-text text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality_title" className="arabic-text">اللقب أو المنصب</Label>
                <Input
                  id="personality_title"
                  value={formData.personality_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality_title: e.target.value }))}
                  placeholder="مثال: عالم الكيمياء الحائز على نوبل"
                  className="arabic-text text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality_description" className="arabic-text">وصف مختصر</Label>
                <Textarea
                  id="personality_description"
                  value={formData.personality_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality_description: e.target.value }))}
                  placeholder="وصف مختصر عن الشخصية وإنجازاتها"
                  className="arabic-text text-right"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="arabic-text">صورة الشخصية</Label>
                
                {imagePreview && (
                  <div className="mb-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة" 
                      className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-primary/20"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full arabic-text" 
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 ml-2" />
                          {uploading ? 'جاري الرفع...' : 'رفع صورة'}
                        </span>
                      </Button>
                    </label>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCamera(!showCamera)}
                    className="arabic-text"
                  >
                    <Camera className="w-4 h-4 ml-2" />
                    التقاط صورة
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleUrlSubmit}
                    className="arabic-text"
                  >
                    استخدام الرابط
                  </Button>
                </div>

                {showCamera && (
                  <div className="mt-4">
                    {/* <CameraCapture onCapture={handleCameraCapture} /> */}
                    <div className="text-center p-4 border border-dashed rounded-lg">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground arabic-text">الكاميرا غير متاحة حالياً</p>
                    </div>
                  </div>
                )}

                <Input
                  value={formData.personality_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality_image_url: e.target.value }))}
                  placeholder="أو أدخل رابط الصورة هنا"
                  className="arabic-text text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="callout_text" className="arabic-text">نص الاستدعاء</Label>
                <Textarea
                  id="callout_text"
                  value={formData.callout_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, callout_text: e.target.value }))}
                  className="arabic-text text-right"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_button_text" className="arabic-text">نص زر التواصل</Label>
                  <Input
                    id="contact_button_text"
                    value={formData.contact_button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_button_text: e.target.value }))}
                    className="arabic-text text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_link" className="arabic-text">رابط التواصل</Label>
                  <Input
                    id="contact_link"
                    value={formData.contact_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_link: e.target.value }))}
                    placeholder="https://..."
                    className="text-left"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="arabic-text"
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={submitting} className="arabic-text">
                  {submitting ? 'جاري الحفظ...' : (activeCallout ? 'تحديث' : 'إنشاء')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* الاستدعاء النشط الحالي */}
      {activeCallout ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="arabic-text flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  الاستدعاء النشط الحالي
                </CardTitle>
                <CardDescription className="arabic-text">
                  تم إنشاؤه في {new Date(activeCallout.created_at).toLocaleDateString('ar-SA')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      personality_name: activeCallout.personality_name,
                      personality_title: activeCallout.personality_title || "",
                      personality_description: activeCallout.personality_description || "",
                      personality_image_url: activeCallout.personality_image_url || "",
                      callout_text: activeCallout.callout_text,
                      contact_link: activeCallout.contact_link,
                      contact_button_text: activeCallout.contact_button_text
                    });
                    setImagePreview(activeCallout.personality_image_url);
                    setIsDialogOpen(true);
                  }}
                  className="arabic-text"
                >
                  <Edit className="w-4 h-4 ml-1" />
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm('هل أنت متأكد من حذف الاستدعاء النشط؟')) {
                      try {
                        const { error } = await supabase
                          .from('active_callouts')
                          .delete()
                          .eq('id', activeCallout.id);
                        
                        if (error) throw error;
                        
                        toast.success('تم حذف الاستدعاء بنجاح');
                        fetchActiveCallout();
                      } catch (error) {
                        console.error('Error deleting callout:', error);
                        toast.error('حدث خطأ في حذف الاستدعاء');
                      }
                    }
                  }}
                  className="arabic-text text-destructive hover:text-destructive"
                >
                  حذف
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold arabic-text">اسم الشخصية</h3>
                  <p className="text-muted-foreground arabic-text">{activeCallout.personality_name}</p>
                </div>
                
                {activeCallout.personality_title && (
                  <div>
                    <h3 className="font-semibold arabic-text">اللقب</h3>
                    <p className="text-muted-foreground arabic-text">{activeCallout.personality_title}</p>
                  </div>
                )}
                
                {activeCallout.personality_description && (
                  <div>
                    <h3 className="font-semibold arabic-text">الوصف</h3>
                    <p className="text-muted-foreground arabic-text">{activeCallout.personality_description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold arabic-text">نص الاستدعاء</h3>
                  <p className="text-muted-foreground arabic-text">{activeCallout.callout_text}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                {activeCallout.personality_image_url ? (
                  <img 
                    src={activeCallout.personality_image_url} 
                    alt={activeCallout.personality_name}
                    className="w-48 h-48 object-cover rounded-full border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-48 h-48 bg-muted/50 rounded-full flex items-center justify-center">
                    <Megaphone className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {activeCallout.contact_link !== '#' && (
                  <a 
                    href={activeCallout.contact_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 arabic-text"
                  >
                    {activeCallout.contact_button_text}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold arabic-text mb-2">لا يوجد استدعاء نشط</h3>
            <p className="text-muted-foreground arabic-text mb-4">
              لم يتم إنشاء أي استدعاء نشط بعد
            </p>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="arabic-text"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء أول استدعاء
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActiveCalloutManagement;