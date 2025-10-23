import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Image as ImageIcon, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Anubis() {
  const { getContent, getAltText, loading } = useAppContent();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [uploading, setUploading] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerified, setMfaVerified] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى اختيار صورة (JPG, PNG) أو PDF فقط",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "الحد الأقصى لحجم الملف هو 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const verifyMFA = () => {
    if (mfaCode === "123456") {
      setMfaVerified(true);
      toast({
        title: "تم التحقق بنجاح",
        description: "يمكنك الآن رفع الملفات",
      });
    } else {
      toast({
        title: "رمز غير صحيح",
        description: "يرجى إدخال الرمز الصحيح",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    if (!mfaVerified) {
      toast({
        title: "يجب التحقق أولاً",
        description: "يرجى إدخال رمز المصادقة الثنائية",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      toast({
        title: "تم رفع الملف بنجاح",
        description: "تم حفظ المستند بشكل آمن",
      });

      setSelectedFile(null);
      setMfaCode("");
      setMfaVerified(false);
    } catch (error: any) {
      toast({
        title: "فشل رفع الملف",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const title = getContent('anubis_card_title', 'أنوبيس - حامي الأسرار');
  const backgroundImage = getContent('anubis_card_background', '/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png');

  return (
    <>
      <Helmet>
        <title>{title} | Crypto-MSR</title>
        <meta name="description" content="الخزانة الرقمية - قم برفع وثائقك وصورك الشخصية بشكل آمن" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="relative h-[30vh] overflow-hidden">
          <img 
            src={backgroundImage}
            alt={getAltText('anubis_card_image', 'تمثال أنوبيس المصري الذهبي')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="font-cairo text-4xl md:text-5xl text-primary font-bold">
              الخزانة الرقمية
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-cairo text-3xl font-bold text-primary mb-2">
                  {title}
                </CardTitle>
                <CardDescription className="text-lg">
                  قم برفع وثائقك وصورك الشخصية بشكل آمن مع مصادقة ثنائية
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-cairo flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  المصادقة الثنائية
                </CardTitle>
                <CardDescription>
                  يرجى إدخال رمز المصادقة الثنائية للمتابعة (رمز تجريبي: 123456)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mfa-code">رمز التحقق</Label>
                  <Input
                    id="mfa-code"
                    type="text"
                    placeholder="أدخل الرمز"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    disabled={mfaVerified}
                    maxLength={6}
                  />
                </div>
                <Button 
                  onClick={verifyMFA} 
                  disabled={mfaVerified || mfaCode.length !== 6}
                  className="w-full"
                >
                  {mfaVerified ? "تم التحقق ✓" : "تحقق من الرمز"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-cairo flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  رفع الملفات
                </CardTitle>
                <CardDescription>
                  اختر صورة (JPG, PNG) أو ملف PDF لرفعه (الحد الأقصى: 5 ميجابايت)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">اختر الملف</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileSelect}
                    disabled={!mfaVerified || uploading}
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || !mfaVerified || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 ml-2" />
                      رفع الملف
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="font-cairo text-lg">معلومات مهمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• يتم تشفير جميع الملفات المرفوعة بشكل آمن</p>
                <p>• المصادقة الثنائية مطلوبة لكل عملية رفع</p>
                <p>• الملفات المدعومة: JPG, PNG, PDF</p>
                <p>• الحد الأقصى لحجم الملف: 5 ميجابايت</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
