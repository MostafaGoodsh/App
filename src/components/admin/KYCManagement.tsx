import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Clock, User, FileText, Calendar } from "lucide-react";

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