import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Search,
  Flame,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserEngagementData {
  user_id: string;
  full_name: string | null;
  email: string | null;
  current_streak: number;
  longest_streak: number;
  total_sessions: number;
  profile_completion_score: number;
  last_login_date: string | null;
  total_content_views: number;
  total_comments: number;
  total_likes: number;
}

interface EngagementSummary {
  total_users: number;
  avg_streak: number;
  active_users_today: number;
  total_sessions: number;
}

const EngagementStatsManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserEngagementData[]>([]);
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      
      // Fetch user engagement stats 
      const { data: engagementData, error: engagementError } = await supabase
        .from('user_engagement_stats')
        .select('*')
        .order('current_streak', { ascending: false });

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      if (engagementError || profilesError) {
        console.error('Error fetching data:', engagementError || profilesError);
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات التفاعل",
          variant: "destructive",
        });
        return;
      }

      // Create profiles map for easy lookup
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.user_id, profile])
      );

      // Transform data
      const transformedData: UserEngagementData[] = (engagementData || []).map(item => {
        const profile = profilesMap.get(item.user_id);
        return {
          user_id: item.user_id,
          full_name: profile?.full_name || null,
          email: profile?.email || null,
        current_streak: item.current_streak,
        longest_streak: item.longest_streak,
        total_sessions: item.total_sessions,
        profile_completion_score: item.profile_completion_score,
        last_login_date: item.last_login_date,
          total_content_views: item.total_content_views,
          total_comments: item.total_comments,
          total_likes: item.total_likes,
        };
      });

      setUsers(transformedData);

      // Calculate summary statistics
      const today = new Date().toISOString().split('T')[0];
      const totalUsers = transformedData.length;
      const avgStreak = totalUsers > 0 
        ? transformedData.reduce((sum, user) => sum + user.current_streak, 0) / totalUsers 
        : 0;
      const activeUsersToday = transformedData.filter(user => 
        user.last_login_date === today
      ).length;
      const totalSessions = transformedData.reduce((sum, user) => sum + user.total_sessions, 0);

      setSummary({
        total_users: totalUsers,
        avg_streak: Math.round(avgStreak * 10) / 10,
        active_users_today: activeUsersToday,
        total_sessions: totalSessions,
      });

    } catch (error) {
      console.error('Error fetching engagement data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { text: "ماسي", variant: "default", className: "bg-purple-600" };
    if (streak >= 14) return { text: "ذهبي", variant: "default", className: "bg-yellow-600" };
    if (streak >= 7) return { text: "فضي", variant: "secondary", className: "" };
    if (streak >= 3) return { text: "برونزي", variant: "outline", className: "" };
    return { text: "مبتدئ", variant: "outline", className: "" };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جارٍ تحميل إحصائيات التفاعل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط الحضور المتتالي</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avg_streak}</div>
              <p className="text-xs text-muted-foreground">يوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نشط اليوم</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.active_users_today}</div>
              <p className="text-xs text-muted-foreground">مستخدم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الجلسات</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_sessions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Engagement Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>إحصائيات التفاعل المفصلة</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button onClick={fetchEngagementData} variant="outline" size="sm">
                تحديث
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>الحضور الحالي</TableHead>
                <TableHead>أطول سلسلة</TableHead>
                <TableHead>الجلسات</TableHead>
                <TableHead>قوة الحساب</TableHead>
                <TableHead>آخر دخول</TableHead>
                <TableHead>التفاعل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const streakBadge = getStreakBadge(user.current_streak);
                return (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.full_name || "غير محدد"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-bold">{user.current_streak}</span>
                        <Badge 
                          variant={streakBadge.variant as any}
                          className={streakBadge.className}
                        >
                          {streakBadge.text}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{user.longest_streak}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.total_sessions}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>{user.profile_completion_score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_login_date 
                        ? new Date(user.last_login_date).toLocaleDateString('ar-SA')
                        : "لم يسجل دخول"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>👁️ {user.total_content_views} مشاهدة</div>
                        <div>💬 {user.total_comments} تعليق</div>
                        <div>❤️ {user.total_likes} إعجاب</div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات متاحة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementStatsManagement;