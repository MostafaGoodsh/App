import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Image as ImageIcon, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import MainLayout from "@/layouts/MainLayout";

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerified, setMfaVerified] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى اختيار صورة (JPG, PNG) أو PDF فقط",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
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
    // Simple MFA verification - in production, this should be server-side
    if (mfaCode === "123456") { // Demo code
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-cairo text-4xl font-bold text-primary mb-4">
            رفع الوثائق والصور
          </h1>
          <p className="text-muted-foreground text-lg">
            قم برفع وثائقك وصورك الشخصية بشكل آمن مع مصادقة ثنائية
          </p>
        </div>

        <div className="grid gap-6">
          {/* MFA Verification Card */}
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

          {/* File Upload Card */}
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

          {/* Info Card */}
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
    </MainLayout>
  );
};

export default Documents;
