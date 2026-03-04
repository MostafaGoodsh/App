import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, ExternalLink } from "lucide-react";

interface Application {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  social_media_links: any;
  follower_count: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

const LiveStreamApprovalsAdmin = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('live_stream_approvals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data || []) as Application[]);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحميل الطلبات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('live_stream_approvals')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', appId);

      if (error) throw error;

      toast({
        title: "تم الاعتماد",
        description: "تم اعتماد الطلب بنجاح"
      });

      fetchApplications();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في اعتماد الطلب",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (appId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال سبب الرفض",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('live_stream_approvals')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: rejectionReason
        })
        .eq('id', appId);

      if (error) throw error;

      toast({
        title: "تم الرفض",
        description: "تم رفض الطلب"
      });

      fetchApplications();
      setDialogOpen(false);
      setRejectionReason("");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في رفض الطلب",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">معتمد</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">جاري التحميل...</div>;
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden px-2 py-3 sm:px-4 sm:py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-cairo">إدارة طلبات البث المباشر</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-cairo">الاسم</TableHead>
                <TableHead className="font-cairo">البريد الإلكتروني</TableHead>
                <TableHead className="font-cairo">المتابعين</TableHead>
                <TableHead className="font-cairo">الحالة</TableHead>
                <TableHead className="font-cairo">تاريخ التقديم</TableHead>
                <TableHead className="font-cairo">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-cairo">{app.full_name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.follower_count.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{new Date(app.created_at).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl">تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">الاسم الكامل</Label>
                  <p className="font-cairo">{selectedApp.full_name}</p>
                </div>
                <div>
                  <Label className="font-bold">البريد الإلكتروني</Label>
                  <p>{selectedApp.email}</p>
                </div>
                <div>
                  <Label className="font-bold">رقم الهاتف</Label>
                  <p className="font-cairo">{selectedApp.phone || "غير متوفر"}</p>
                </div>
                <div>
                  <Label className="font-bold">عدد المتابعين</Label>
                  <p className="font-cairo">{selectedApp.follower_count.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="font-bold">روابط وسائل التواصل</Label>
                <div className="space-y-2 mt-2">
                  {Array.isArray(selectedApp.social_media_links) && selectedApp.social_media_links.map((link: string, index: number) => (
                    <a 
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {link}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-bold">نبذة عن المتقدم</Label>
                <p className="font-cairo mt-2 p-4 bg-muted rounded-md">{selectedApp.description}</p>
              </div>

              <div>
                <Label className="font-bold">الحالة الحالية</Label>
                <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
              </div>

              {selectedApp.rejection_reason && (
                <div>
                  <Label className="font-bold">سبب الرفض</Label>
                  <p className="font-cairo mt-2 p-4 bg-destructive/10 rounded-md text-destructive">
                    {selectedApp.rejection_reason}
                  </p>
                </div>
              )}

              {selectedApp.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      اعتماد
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rejection_reason">سبب الرفض (اختياري)</Label>
                    <Textarea
                      id="rejection_reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="أدخل سبب الرفض..."
                      className="font-cairo"
                      rows={3}
                    />
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveStreamApprovalsAdmin;
