import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface InternalBalance {
  token_symbol: string;
  balance: number;
}

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  masked_email: string;
  masked_phone: string;
  solana_address: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  verification_status: string | null;
  verification_type: string | null;
  verified_at: string | null;
  total_points: number;
  internal_balances: InternalBalance[];
}

const UsersManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // استخدام الدالة المحمية لجلب بيانات المستخدمين
      const { data: profilesData, error: profilesError } = await supabase.rpc(
        'get_profiles_admin_view'
      );

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات المستخدمين",
          variant: "destructive",
        });
        return;
      }

      // جلب حالات التحقق من الهوية
      const { data: verificationsData, error: verificationsError } = await supabase
        .from('identity_verification')
        .select('user_id, status, verification_type, verified_at');

      if (verificationsError) {
        console.error("Error fetching verifications:", verificationsError);
      }

      // جلب نقاط المستخدمين
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points_balance')
        .select('user_id, total_points');

      if (pointsError) {
        console.error("Error fetching points data:", pointsError);
      }

      // جلب العملات الداخلية للمستخدمين
      const { data: balancesData, error: balancesError } = await supabase
        .from('internal_wallet_balances')
        .select(`
          user_id,
          balance,
          internal_tokens!inner(symbol)
        `);

      if (balancesError) {
        console.error("Error fetching internal balances:", balancesError);
      }

      // دمج البيانات
      const usersWithVerification = profilesData?.map((profile: any) => {
        const verification = verificationsData?.find((v: any) => v.user_id === profile.user_id);
        const pointsInfo = pointsData?.find((p: any) => p.user_id === profile.user_id);
        const userBalances = balancesData?.filter((b: any) => b.user_id === profile.user_id) || [];
        const internal_balances: InternalBalance[] = userBalances.map((b: any) => ({
          token_symbol: b.internal_tokens?.symbol || '',
          balance: b.balance || 0
        }));
        
        return {
          ...profile,
          solana_address: profile.solana_address || null,
          verification_status: verification?.status || null,
          verification_type: verification?.verification_type || null,
          verified_at: verification?.verified_at || null,
          total_points: pointsInfo?.total_points || 0,
          internal_balances,
        };
      }) || [];

      setUsers(usersWithVerification);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getVerificationBadge = (status: string | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          لم يقدم طلب
        </Badge>
      );
    }

    switch (status) {
      case 'approved':
      case 'verified':
        return (
          <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3" />
            موثق
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            مرفوض
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            قيد المراجعة
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            غير محدد
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy - HH:mm', { locale: ar });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          جاري تحميل بيانات المستخدمين...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <div>
              <CardTitle>إدارة المستخدمين</CardTitle>
              <CardDescription>
                عرض ومتابعة جميع المستخدمين المسجلين وحالة التحقق من الهوية
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات مستخدمين
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم الكامل</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>العملات الداخلية</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>عنوان Solana</TableHead>
                    <TableHead>اللغة المفضلة</TableHead>
                    <TableHead>حالة التحقق</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell 
                        className="font-medium"
                        onClick={() => navigate(`/profile?user=${user.user_id}`)}
                      >
                        {user.full_name || "غير محدد"}
                      </TableCell>
                      <TableCell
                        onClick={() => navigate(`/profile?user=${user.user_id}`)}
                      >
                        <Badge variant="secondary" className="gap-1">
                          {user.total_points.toLocaleString('ar-EG')} نقطة
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.internal_balances.length > 0 ? (
                            user.internal_balances.map((balance, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {balance.balance.toLocaleString('ar-EG')} {balance.token_symbol}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">لا توجد عملات</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.masked_email || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        {user.masked_phone || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        {user.solana_address ? (
                          <div className="font-mono text-xs">
                            {user.solana_address.slice(0, 6)}...{user.solana_address.slice(-4)}
                          </div>
                        ) : (
                          "غير مسجل"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.preferred_language === 'ar' ? 'العربية' : 'English'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(user.verification_status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            إجمالي المستخدمين: {users.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;