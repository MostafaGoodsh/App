import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Calendar, User, DollarSign } from "lucide-react";

interface AnubisSubscription {
  id: string;
  user_id: string;
  subscription_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  payment_amount: number | null;
  payment_currency: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export default function AnubisSubscriptionsAdmin() {
  const [subscriptions, setSubscriptions] = useState<AnubisSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("anubis_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(sub => sub.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone")
          .in("user_id", userIds);

        if (!profilesError && profiles) {
          const subsWithProfiles = data.map(sub => ({
            ...sub,
            profiles: profiles.find(p => p.user_id === sub.user_id)
          }));
          setSubscriptions(subsWithProfiles as AnubisSubscription[]);
        } else {
          setSubscriptions(data as AnubisSubscription[]);
        }
      } else {
        setSubscriptions([]);
      }
    } catch (error: any) {
      toast.error("فشل في تحميل الاشتراكات: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === "active" && !subscriptions.find(s => s.id === id)?.start_date) {
        updates.start_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("anubis_subscriptions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast.success("تم تحديث حالة الاشتراك بنجاح");
      fetchSubscriptions();
    } catch (error: any) {
      toast.error("فشل في تحديث الحالة: " + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50";
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/50";
      case "expired":
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/50";
      case "cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة اشتراكات أنوبيس - لوحة التحكم</title>
      </Helmet>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">إدارة اشتراكات أنوبيس</h1>
          <p className="text-muted-foreground mt-2">
            عرض وإدارة جميع اشتراكات خزانة أنوبيس الرقمية
          </p>
        </div>

        <div className="grid gap-4">
          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">لا توجد اشتراكات حالياً</p>
              </CardContent>
            </Card>
          ) : (
            subscriptions.map((sub) => (
              <Card key={sub.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {sub.profiles?.full_name || "مستخدم غير معروف"}
                    </CardTitle>
                    <Badge className={getStatusColor(sub.status)}>
                      {sub.status === "active" ? "نشط" :
                       sub.status === "pending" ? "قيد الانتظار" :
                       sub.status === "expired" ? "منتهي" :
                       sub.status === "cancelled" ? "ملغي" : sub.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                        <p className="text-sm font-medium">{sub.profiles?.email || "غير متوفر"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                        <p className="text-sm font-medium">{sub.profiles?.phone || "غير متوفر"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">نوع الاشتراك</p>
                        <p className="text-sm font-medium">
                          {sub.subscription_type === "free_trial" ? "تجريبي مجاني" : sub.subscription_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                        <p className="text-sm font-medium">
                          {new Date(sub.created_at).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <label className="text-sm font-medium">تغيير الحالة:</label>
                    <Select
                      value={sub.status}
                      onValueChange={(value) => updateSubscriptionStatus(sub.id, value)}
                      disabled={updating === sub.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="expired">منتهي</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                    {updating === sub.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </RequireAdmin>
  );
}