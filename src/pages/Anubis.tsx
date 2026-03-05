import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";
import { useAnubisAuth } from "@/hooks/useAnubisAuth";
import RequireAnubisAccess from "@/components/auth/RequireAnubisAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Image as ImageIcon, Shield, Download, Trash2, RefreshCw, Eye, Lock, CreditCard } from "lucide-react";
import { UnifiedPaymentGateway } from "@/components/payment/UnifiedPaymentGateway";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface StoredFile {
  name: string;
  created_at: string;
  size: number;
  id: string;
}

export default function Anubis() {
  const { getContent, getAltText } = useAppContent();
  const { user, sessionToken } = useAnubisAuth();
  const { toast } = useToast();
  
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStoredFiles();
    }
  }, [user]);

  const fetchStoredFiles = async () => {
    if (!user || !sessionToken) return;
    
    setLoadingFiles(true);
    try {
      const response = await fetch(
        `https://wnwfnziozwarlihrnjex.supabase.co/functions/v1/list-vault-files`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch files');
      }

      const result = await response.json();
      console.log('Fetched files from storage:', result.data);

      if (result.data) {
        const files = result.data.map((file: any) => ({
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
    if (!user || !sessionToken) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `https://wnwfnziozwarlihrnjex.supabase.co/functions/v1/download-vault-file?fileName=${encodeURIComponent(fileName)}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
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
    if (!user || !sessionToken) return;

    try {
      // For now, download instead of view since we need proper authentication
      await downloadFile(fileName);
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
    if (!user || !fileToDelete || !sessionToken) return;

    try {
      const response = await fetch(
        `https://wnwfnziozwarlihrnjex.supabase.co/functions/v1/delete-vault-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileName: fileToDelete }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
      }

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


  const handleUpload = async () => {
    if (!selectedFile || !user || !sessionToken) return;

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', fileName);

      const response = await fetch(
        `https://wnwfnziozwarlihrnjex.supabase.co/functions/v1/upload-vault-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

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
  const introduction = getContent('anubis_card_introduction', 'قم برفع وثائقك وصورك الشخصية بشكل آمن');
  const backgroundImage = getContent('anubis_card_background', '/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png');

  return (
    <RequireAnubisAccess>
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
                <CardDescription className="text-lg whitespace-pre-line">
                  {introduction}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6">
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
                              className="hover:bg-destructive/10 hover:text-destructive"
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

            <Card>
                <CardHeader>
                  <CardTitle className="font-cairo flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    رفع ملف جديد
                  </CardTitle>
                  <CardDescription>
                    قم برفع صورة أو مستند PDF (الحد الأقصى: 5 ميجابايت)
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
                      disabled={uploading}
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        الملف المحدد: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
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
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الملف "{fileToDelete}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={deleteFile} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RequireAnubisAccess>
  );
}