import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Clock, User, FileText, Calendar, Image, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface KYCRequest {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  address: string;
  document_type: string;
  document_number: string;
  document_front_url: string;
  document_back_url: string;
  selfie_url: string;
  status: string;
  verification_notes: string;
  created_at: string;
  updated_at: string;
  verified_at: string;
}

export default function KYCManagement() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const fetchKYCRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("identity_verification")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل طلبات التحقق",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateKYCStatus = async (verificationId: string, newStatus: string, notes?: string) => {
    setProcessingId(verificationId);
    try {
      const updateData: any = {
        status: newStatus,
        verification_notes: notes || adminNotes,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'approved') {
        updateData.verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('identity_verification')
        .update(updateData)
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${newStatus === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`,
      });

      // Refresh the requests
      await fetchKYCRequests();
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "مقبول";
      case "rejected":
        return "مرفوض";
      default:
        return "قيد المراجعة";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إدارة طلبات التحقق من الهوية</h1>
          <p className="text-muted-foreground">مراجعة وإدارة طلبات KYC</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إدارة طلبات التحقق من الهوية</h1>
        <p className="text-muted-foreground">مراجعة وإدارة طلبات KYC</p>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات تحقق</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{request.full_name || "غير محدد"}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(request.status)}
                      {getStatusText(request.status)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ الميلاد</p>
                    <p className="font-medium">{request.date_of_birth || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">الجنسية</p>
                    <p className="font-medium">{request.nationality || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">نوع الوثيقة</p>
                    <p className="font-medium">{request.document_type || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">رقم الوثيقة</p>
                    <p className="font-medium">{request.document_number || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium">{request.phone_number || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">العنوان</p>
                    <p className="font-medium truncate" title={request.address}>
                      {request.address || "غير محدد"}
                    </p>
                  </div>
                </div>

                {/* Document Images Section */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">الوثائق والصور المرفوعة</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Document Front */}
                    {request.document_front_url ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">الوثيقة - الوجه الأمامي</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative cursor-pointer group">
                              <img 
                                src={`https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.document_front_url}`}
                                alt="الوثيقة - الوجه الأمامي"
                                className="w-full h-32 object-cover rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                                onError={(e) => {
                                  console.error('Failed to load document front image:', request.document_front_url);
                                  console.error('Full URL:', `https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.document_front_url}`);
                                }}
                                onLoad={() => {
                                  console.log('Document front image loaded successfully:', request.document_front_url);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center transition-all">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogTitle>الوثيقة - الوجه الأمامي</DialogTitle>
                            <DialogDescription>
                              عرض الوثيقة الرسمية - الوجه الأمامي لـ {request.full_name}
                            </DialogDescription>
                            <img 
                              src={`https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.document_front_url}`}
                              alt="الوثيقة - الوجه الأمامي"
                              className="w-full max-h-[80vh] object-contain rounded-lg"
                              onError={(e) => {
                                console.error('Failed to load document front image in dialog:', request.document_front_url);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Image className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">لم يتم رفع الوجه الأمامي</p>
                        </div>
                      </div>
                    )}

                    {/* Document Back */}
                    {request.document_back_url ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">الوثيقة - الوجه الخلفي</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative cursor-pointer group">
                              <img 
                                src={`https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.document_back_url}`}
                                alt="الوثيقة - الوجه الخلفي"
                                className="w-full h-32 object-cover rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center transition-all">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogTitle>الوثيقة - الوجه الخلفي</DialogTitle>
                            <DialogDescription>
                              عرض الوثيقة الرسمية - الوجه الخلفي لـ {request.full_name}
                            </DialogDescription>
                            <img 
                              src={`https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.document_back_url}`}
                              alt="الوثيقة - الوجه الخلفي"
                              className="w-full max-h-[80vh] object-contain rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Image className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">لم يتم رفع الوجه الخلفي</p>
                        </div>
                      </div>
                    )}

                    {/* Selfie */}
                    {request.selfie_url ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">صورة شخصية (سيلفي)</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative cursor-pointer group">
                              <img 
                                src={`https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.selfie_url}`}
                                alt="صورة شخصية"
                                className="w-full h-32 object-cover rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                                onError={(e) => {
                                  console.error('Failed to load selfie image:', request.selfie_url);
                                  console.error('Full URL:', `https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.selfie_url}`);
                                }}
                                onLoad={() => {
                                  console.log('Selfie image loaded successfully:', request.selfie_url);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center transition-all">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogTitle>الصورة الشخصية</DialogTitle>
                            <DialogDescription>
                              عرض الصورة الشخصية (السيلفي) لـ {request.full_name}
                            </DialogDescription>
                            <img 
                              src={`https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/identity-documents/${request.selfie_url}`}
                              alt="صورة شخصية"
                              className="w-full max-h-[80vh] object-contain rounded-lg"
                              onError={(e) => {
                                console.error('Failed to load selfie image in dialog:', request.selfie_url);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <User className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">لم يتم رفع الصورة الشخصية</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {request.verification_notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">ملاحظات المراجعة</p>
                    <p className="text-sm bg-muted p-2 rounded">{request.verification_notes}</p>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  {request.status === "pending" && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            disabled={processingId === request.id}
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes("");
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            قبول
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>قبول طلب التحقق</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من قبول طلب التحقق لـ {request.full_name}؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">ملاحظات (اختيارية)</label>
                            <Textarea
                              placeholder="أضف ملاحظات للمستخدم..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => updateKYCStatus(request.id, "approved")}
                              disabled={processingId === request.id}
                            >
                              قبول الطلب
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={processingId === request.id}
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes("");
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            رفض
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>رفض طلب التحقق</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من رفض طلب التحقق لـ {request.full_name}؟ يرجى إضافة سبب الرفض.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">سبب الرفض *</label>
                            <Textarea
                              placeholder="يرجى توضيح سبب رفض الطلب..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              required
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => updateKYCStatus(request.id, "rejected")}
                              disabled={processingId === request.id || !adminNotes.trim()}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              رفض الطلب
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}

                  {request.verified_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      تم التحديث: {new Date(request.verified_at).toLocaleDateString("ar-SA")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}