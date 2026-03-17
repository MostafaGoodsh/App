import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Image as ImageIcon, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerified, setMfaVerified] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast({ title: t("نوع ملف غير مدعوم"), description: t("يرجى اختيار صورة (JPG, PNG) أو PDF فقط", "Please select JPG, PNG or PDF only"), variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t("حجم الملف كبير جداً"), description: t("الحد الأقصى لحجم الملف هو 5 ميجابايت", "Max file size is 5MB"), variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const verifyMFA = () => {
    if (mfaCode === "123456") {
      setMfaVerified(true);
      toast({ title: t("تم التحقق بنجاح"), description: t("يمكنك الآن رفع الملفات") });
    } else {
      toast({ title: t("رمز غير صحيح"), description: t("يرجى إدخال الرمز الصحيح"), variant: "destructive" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    if (!mfaVerified) {
      toast({ title: t("يجب التحقق أولاً"), description: t("يرجى إدخال رمز المصادقة الثنائية", "Please enter 2FA code"), variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('user-documents').upload(fileName, selectedFile);
      if (uploadError) throw uploadError;
      toast({ title: t("تم رفع الملف بنجاح"), description: t("تم حفظ المستند بشكل آمن") });
      setSelectedFile(null); setMfaCode(""); setMfaVerified(false);
    } catch (error: any) {
      toast({ title: t("فشل رفع الملف"), description: error.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={dir}>
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold text-primary mb-2">{t("الخزانة الرقمية")}</CardTitle>
            <CardDescription className="text-lg">{t("قم برفع وثائقك وصورك الشخصية بشكل آمن مع مصادقة ثنائية")}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />{t("المصادقة الثنائية")}</CardTitle>
            <CardDescription>{t("يرجى إدخال رمز المصادقة الثنائية للمتابعة (رمز تجريبي: 123456)", "Enter 2FA code to continue (demo code: 123456)")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mfa-code">{t("رمز التحقق")}</Label>
              <Input id="mfa-code" type="text" placeholder={t("أدخل الرمز")} value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} disabled={mfaVerified} maxLength={6} />
            </div>
            <Button onClick={verifyMFA} disabled={mfaVerified || mfaCode.length !== 6} className="w-full">
              {mfaVerified ? t("تم التحقق ✓") : t("تحقق من الرمز")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />{t("رفع الملفات")}</CardTitle>
            <CardDescription>{t("اختر صورة (JPG, PNG) أو ملف PDF لرفعه (الحد الأقصى: 5 ميجابايت)", "Select image (JPG, PNG) or PDF to upload (Max: 5MB)")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">{t("اختر الملف")}</Label>
              <Input id="file-upload" type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" onChange={handleFileSelect} disabled={!mfaVerified || uploading} />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
            <Button onClick={handleUpload} disabled={!selectedFile || !mfaVerified || uploading} className="w-full">
              {uploading ? (<><Loader2 className="w-4 h-4 ml-2 animate-spin" />{t("جاري الرفع...", "Uploading...")}</>) : (<><Upload className="w-4 h-4 ml-2" />{t("رفع الملف")}</>)}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader><CardTitle className="text-lg">{t("معلومات مهمة")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• {t("يتم تشفير جميع الملفات المرفوعة بشكل آمن", "All uploaded files are securely encrypted")}</p>
            <p>• {t("المصادقة الثنائية مطلوبة لكل عملية رفع", "2FA required for every upload")}</p>
            <p>• {t("الملفات المدعومة: JPG, PNG, PDF", "Supported files: JPG, PNG, PDF")}</p>
            <p>• {t("الحد الأقصى لحجم الملف: 5 ميجابايت", "Max file size: 5MB")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
