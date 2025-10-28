import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import RequireAdmin from "@/components/auth/RequireAdmin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VaultSubscription {
  id: string;
  user_id: string;
  subscription_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  payment_amount: number;
  payment_currency: string;
  payment_method: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
  } | null;
}

const VaultSubscriptionsAdmin = () => {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["vault-subscriptions-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vault_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(s => s.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", userIds);

        // Merge profiles with subscriptions
        return data.map(subscription => ({
          ...subscription,
          profiles: profiles?.find(p => p.user_id === subscription.user_id) || null
        })) as VaultSubscription[];
      }

      return [] as VaultSubscription[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      
      if (status === "active" && !subscriptions?.find(s => s.id === id)?.start_date) {
        updates.start_date = new Date().toISOString();
        
        // Calculate end_date based on subscription_type
        const subscription = subscriptions?.find(s => s.id === id);
        if (subscription && subscription.subscription_type !== "lifetime") {
          const endDate = new Date();
          if (subscription.subscription_type === "monthly") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (subscription.subscription_type === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }
          updates.end_date = endDate.toISOString();
        }
      }

      const { error } = await supabase
        .from("vault_subscriptions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-subscriptions-admin"] });
      toast.success("تم تحديث حالة الاشتراك");
    },
    onError: (error) => {
      console.error("Error updating subscription:", error);
      toast.error("فشل تحديث حالة الاشتراك");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      active: "default",
      expired: "destructive",
      cancelled: "outline",
    };

    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      active: "نشط",
      expired: "منتهي",
      cancelled: "ملغى",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      monthly: "شهري",
      yearly: "سنوي",
      lifetime: "مدى الحياة",
    };

    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة اشتراكات الخزانة - لوحة التحكم</title>
      </Helmet>
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <div className="container mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl arabic-text">
                  إدارة اشتراكات الخزانة الرقمية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions?.length === 0 ? (
                    <p className="text-center text-muted-foreground arabic-text py-8">
                      لا توجد اشتراكات حتى الآن
                    </p>
                  ) : (
                    subscriptions?.map((subscription) => (
                      <Card key={subscription.id}>
                        <CardContent className="pt-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold arabic-text">المستخدم:</span>
                                <span className="arabic-text">
                                  {subscription.profiles?.full_name || "غير محدد"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold arabic-text">رقم الهاتف:</span>
                                <span>{subscription.profiles?.phone || "غير محدد"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold arabic-text">نوع الاشتراك:</span>
                                {getTypeBadge(subscription.subscription_type)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold arabic-text">المبلغ:</span>
                                <span>
                                  {subscription.payment_amount} {subscription.payment_currency}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold arabic-text">الحالة:</span>
                                {getStatusBadge(subscription.status)}
                              </div>
                              {subscription.start_date && (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold arabic-text">تاريخ البداية:</span>
                                  <span className="text-sm">
                                    {format(new Date(subscription.start_date), "PPP", { locale: ar })}
                                  </span>
                                </div>
                              )}
                              {subscription.end_date && (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold arabic-text">تاريخ الانتهاء:</span>
                                  <span className="text-sm">
                                    {format(new Date(subscription.end_date), "PPP", { locale: ar })}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-bold arabic-text">طريقة الدفع:</span>
                                <span className="text-sm">
                                  {subscription.payment_method || "غير محدد"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <span className="font-bold arabic-text">تغيير الحالة:</span>
                            <Select
                              value={subscription.status}
                              onValueChange={(value) =>
                                updateStatus.mutate({ id: subscription.id, status: value })
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="active">نشط</SelectItem>
                                <SelectItem value="expired">منتهي</SelectItem>
                                <SelectItem value="cancelled">ملغى</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
};

export default VaultSubscriptionsAdmin;
