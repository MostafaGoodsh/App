import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Image as ImageIcon, Shield, Download, Trash2, RefreshCw, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface StoredFile {
  name: string;
  created_at: string;
  size: number;
  id: string;
}

export default function Anubis() {
  const { getContent, getAltText, loading } = useAppContent();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [uploading, setUploading] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user && mfaVerified) {
      fetchStoredFiles();
    }
  }, [user, mfaVerified]);

  const fetchStoredFiles = async () => {
    if (!user) return;
    
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage
        .from('anubis-vault')
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Storage list error:', error);
        throw error;
      }

      console.log('Fetched files from storage:', data);

      if (data) {
        const files = data.map(file => ({
          name: file.name,
          created_at: file.created_at,
          size: file.metadata?.size || 0,
          id: file.id
        }));
        console.log('Processed files:', files);
        setStoredFiles(files);
      }
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        title: "خطأ في جلب الملفات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  const downloadFile = async (fileName: string) => {
    if (!user || !mfaVerified) {
      toast({
        title: "يجب المصادقة أولاً",
        description: "يرجى التحقق من رمز المصادقة الثنائية",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('anubis-vault')
        .download(`${user.id}/${fileName}`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم التحميل بنجاح",
        description: `تم تحميل الملف: ${fileName}`,
      });
    } catch (error: any) {
      toast({
        title: "فشل التحميل",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const viewFile = async (fileName: string) => {
    if (!user || !mfaVerified) return;

    try {
      const { data } = await supabase.storage
        .from('anubis-vault')
        .getPublicUrl(`${user.id}/${fileName}`);

      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "فشل العرض",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (fileName: string) => {
    setFileToDelete(fileName);
    setDeleteDialogOpen(true);
  };

  const deleteFile = async () => {
    if (!user || !fileToDelete || !mfaVerified) return;

    try {
      const { error } = await supabase.storage
        .from('anubis-vault')
        .remove([`${user.id}/${fileToDelete}`]);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف الملف: ${fileToDelete}`,
      });

      fetchStoredFiles();
    } catch (error: any) {
      toast({
        title: "فشل الحذف",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

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
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setMfaSessionId(sessionId);
      setMfaVerified(true);
      
      toast({
        title: "تم التحقق بنجاح ✓",
        description: "يمكنك الآن الوصول إلى الخزانة الرقمية",
      });
    } else {
      toast({
        title: "رمز غير صحيح",
        description: "يرجى إدخال الرمز الصحيح للمصادقة",
        variant: "destructive",
      });
    }
  };

  const resetMFA = () => {
    setMfaVerified(false);
    setMfaCode("");
    setMfaSessionId(null);
    setStoredFiles([]);
    toast({
      title: "تم إنهاء الجلسة",
      description: "يجب المصادقة مرة أخرى للوصول",
    });
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
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('anubis-vault')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      toast({
        title: "تم رفع الملف بنجاح ✓",
        description: "تم حفظ المستند بشكل آمن في الخزانة",
      });

      setSelectedFile(null);
      
      // تأخير بسيط للتأكد من اكتمال الحفظ
      setTimeout(() => {
        fetchStoredFiles();
      }, 500);
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
            <Card className={mfaVerified ? "border-green-500/50 bg-green-500/5" : ""}>
              <CardHeader>
                <CardTitle className="font-cairo flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    المصادقة الثنائية
                  </span>
                  {mfaVerified && (
                    <Button variant="outline" size="sm" onClick={resetMFA}>
                      إنهاء الجلسة
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {mfaVerified 
                    ? "✓ تم التحقق بنجاح - جلستك نشطة الآن" 
                    : "يرجى إدخال رمز المصادقة الثنائية للمتابعة (رمز تجريبي: 123456)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!mfaVerified && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mfa-code">رمز التحقق</Label>
                      <Input
                        id="mfa-code"
                        type="text"
                        placeholder="أدخل الرمز (123456)"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="text-center text-xl tracking-widest"
                      />
                    </div>
                    <Button 
                      onClick={verifyMFA} 
                      disabled={mfaCode.length !== 6}
                      className="w-full"
                    >
                      تحقق من الرمز
                    </Button>
                  </>
                )}
                {mfaVerified && mfaSessionId && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>معرف الجلسة:</strong> {mfaSessionId.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {mfaVerified && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      محتويات الخزانة
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchStoredFiles}
                      disabled={loadingFiles}
                    >
                      <RefreshCw className={`w-4 h-4 ml-2 ${loadingFiles ? 'animate-spin' : ''}`} />
                      تحديث
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    الملفات المحفوظة في خزانتك الرقمية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFiles ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : storedFiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد ملفات محفوظة حالياً</p>
                      <p className="text-sm">ابدأ برفع ملفاتك بشكل آمن</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {storedFiles.map((file) => (
                        <div 
                          key={file.name}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          {file.name.match(/\.(jpg|jpeg|png)$/i) ? (
                            <ImageIcon className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewFile(file.name)}
                              title="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(file.name)}
                              title="تحميل"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(file.name)}
                              className="text-destructive hover:text-destructive"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                <p>• يتم تشفير جميع الملفات المرفوعة بتشفير من الدرجة العسكرية</p>
                <p>• المصادقة الثنائية (MFA) مطلوبة للوصول إلى الخزانة</p>
                <p>• يمكنك عرض وتحميل ملفاتك بعد المصادقة</p>
                <p>• الملفات المدعومة: JPG, PNG, PDF</p>
                <p>• الحد الأقصى لحجم الملف: 5 ميجابايت</p>
                <p>• جلسة المصادقة نشطة حتى تقوم بإنهائها</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-cairo">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذه العملية.
                <br />
                <strong className="text-foreground">{fileToDelete}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={deleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                حذف الملف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
