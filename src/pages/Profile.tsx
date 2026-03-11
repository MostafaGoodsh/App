import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Edit, 
  Settings, 
  Activity,
  Calendar,
  MapPin,
  Languages,
  Wallet,
  Star,
  ClipboardList,
  ExternalLink,
  Users
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useEngagementStats } from "@/hooks/useEngagementStats";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTonAddress } from '@tonconnect/ui-react';
import StreakDisplay from "@/components/engagement/StreakDisplay";
import DailyTasksList from "@/components/engagement/DailyTasksList";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { PrivacySettingsDialog } from '@/components/profile/PrivacySettingsDialog';
import { SecuritySettingsDialog } from '@/components/profile/SecuritySettingsDialog';
import { NotificationSettingsDialog } from '@/components/profile/NotificationSettingsDialog';
import { AccountStatsCard } from '@/components/profile/AccountStatsCard';
import { EngagementStatsCard } from '@/components/profile/EngagementStatsCard';
import { FollowStats } from '@/components/profile/FollowStats';
import { TodoList } from '@/components/profile/TodoList';
import FamilyManagement from '@/components/family/FamilyManagement';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const viewUserId = searchParams.get('user');
  const { profile, loading } = useProfile(viewUserId || undefined);
  const { user } = useAuth();
  const isOwnProfile = !viewUserId || viewUserId === user?.id;
  
  const { 
    stats, 
    dailyTasks, 
    completedTasks, 
    completeTask, 
    isTaskCompleted,
    loading: statsLoading 
  } = useEngagementStats();
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [completedSurveys, setCompletedSurveys] = useState<any[]>([]);
  const [xpBalance, setXpBalance] = useState(0);
  const [connectedWallets, setConnectedWallets] = useState<{solana?: string; ton?: string; evm?: string}>({});
  const tonAddress = useTonAddress();
  const [totalPoints, setTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);

  // Fetch extra profile data
  useEffect(() => {
    const targetUserId = viewUserId || user?.id;
    if (!targetUserId) return;

    // Fetch completed surveys
    const fetchSurveys = async () => {
      const { data } = await supabase
        .from('survey_responses' as any)
        .select('id, survey_id, created_at, surveys:survey_id(title)')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      if (data) setCompletedSurveys(data);
    };

    // Fetch XP / points
    const fetchPoints = async () => {
      const { data } = await supabase
        .from('user_points_balance')
        .select('total_points')
        .eq('user_id', targetUserId)
        .maybeSingle();
      if (data) setTotalPoints(data.total_points || 0);

      // Fetch internal XP balance
      const { data: balData } = await supabase
        .from('internal_wallet_balances')
        .select('balance, internal_tokens!inner(symbol)')
        .eq('user_id', targetUserId);
      if (balData) {
        const xp = balData.find((b: any) => b.internal_tokens?.symbol === 'XP');
        if (xp) setXpBalance(xp.balance);
      }
    };

    // Fetch connected wallets from profile
    const fetchWallets = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('solana_address')
        .eq('user_id', targetUserId)
        .maybeSingle();
      
      // Read EVM wallet from localStorage
      let evmAddress: string | undefined;
      try {
        const savedWallet = localStorage.getItem('connectedWallet');
        if (savedWallet) {
          const parsed = JSON.parse(savedWallet);
          evmAddress = parsed?.address;
        }
      } catch {}

      setConnectedWallets({
        solana: data?.solana_address || undefined,
        evm: evmAddress,
        ton: tonAddress || undefined,
      });
    };

    // Fetch user badges
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('user_badges')
        .select('*, badges(name, icon_emoji, badge_color)')
        .eq('user_id', targetUserId);
      if (data) setUserBadges(data);
    };

    fetchSurveys();
    fetchPoints();
    fetchWallets();
    fetchBadges();
  }, [viewUserId, user?.id, tonAddress]);

  if (loading || statsLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2 arabic-text">البروفايل غير متوفر</h2>
            <p className="text-muted-foreground arabic-text">لم يتم العثور على بيانات البروفايل</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
        <div className="container max-w-4xl mx-auto p-6 arabic-content">
      <ProfileHeader profile={profile} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="overview" className="flex-col py-2 gap-1 text-xs">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="arabic-text hidden sm:inline">نظرة عامة</span>
            <span className="arabic-text sm:hidden">عامة</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-col py-2 gap-1 text-xs">
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="arabic-text hidden sm:inline">تحرير</span>
            <span className="arabic-text sm:hidden">تعديل</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-col py-2 gap-1 text-xs">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="arabic-text hidden sm:inline">النشاط</span>
            <span className="arabic-text sm:hidden">نشاط</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-col py-2 gap-1 text-xs">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="arabic-text hidden sm:inline">الإعدادات</span>
            <span className="arabic-text sm:hidden">إعدادات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text text-right">معلومات الملف الشخصي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground arabic-text">الاسم</p>
                      <p className="font-medium arabic-text text-lg">{profile.full_name || 'غير محدد'}</p>
                    </div>
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-3 justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground arabic-text">تاريخ الانضمام</p>
                      <p className="font-medium arabic-text">
                        {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-3 justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground arabic-text">اللغة المفضلة</p>
                      <p className="font-medium arabic-text">
                        {profile.preferred_language === 'ar' ? 'العربية' : 'English'}
                      </p>
                    </div>
                    <Languages className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {/* Social Links Section */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4 arabic-text text-right text-lg">روابط التواصل</h3>
                  <div className="grid gap-3">
                    {[
                      { name: 'الموقع الشخصي', url: profile.website_url },
                      { name: 'Instagram', url: profile.instagram_url },
                      { name: 'Twitter', url: profile.twitter_url },
                      { name: 'LinkedIn', url: profile.linkedin_url },
                      { name: 'Facebook', url: profile.facebook_url }
                    ].filter(link => link.url && link.url.trim() !== '').map((link) => (
                      <Button
                        key={link.name}
                        variant="outline"
                        size="sm"
                        asChild
                        className="justify-start text-right w-full arabic-text"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <span className="text-sm arabic-text">{link.name}</span>
                        </a>
                      </Button>
                    ))}
                    {![
                      profile.website_url,
                      profile.instagram_url,
                      profile.twitter_url,
                      profile.linkedin_url,
                      profile.facebook_url
                    ].some(url => url && url.trim() !== '') && (
                      <p className="text-sm text-muted-foreground arabic-text text-center py-4">
                        لا توجد روابط متاحة
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Badges */}
          {userBadges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text text-right flex items-center gap-2 justify-end">
                  <span>البادجات</span>
                  <Star className="w-5 h-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-end">
                  {userBadges.map((ub: any) => (
                    <div key={ub.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: (ub.badges as any)?.badge_color }}>
                      <span className="text-lg">{(ub.badges as any)?.icon_emoji}</span>
                      <span className="text-sm font-cairo" style={{ color: (ub.badges as any)?.badge_color }}>{(ub.badges as any)?.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* XP & Points */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text text-right flex items-center gap-2 justify-end">
                <span>نقاط الخبرة</span>
                <Star className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{totalPoints.toLocaleString('ar-EG')}</p>
                  <p className="text-xs text-muted-foreground font-cairo">إجمالي النقاط</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{xpBalance.toLocaleString('ar-EG')}</p>
                  <p className="text-xs text-muted-foreground font-cairo">رصيد XP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Wallets */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text text-right flex items-center gap-2 justify-end">
                <span>المحافظ المربوطة</span>
                <Wallet className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-2">
                {connectedWallets.solana && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-xs">Solana</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {connectedWallets.solana.slice(0, 6)}...{connectedWallets.solana.slice(-4)}
                    </span>
                  </div>
                )}
                {connectedWallets.evm && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-xs">Ethereum</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {connectedWallets.evm.slice(0, 6)}...{connectedWallets.evm.slice(-4)}
                    </span>
                  </div>
                )}
                {connectedWallets.ton && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-xs">TON</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {connectedWallets.ton.slice(0, 6)}...{connectedWallets.ton.slice(-4)}
                    </span>
                  </div>
                )}
                {!connectedWallets.solana && !connectedWallets.ton && !connectedWallets.evm && (
                  <p className="text-sm text-muted-foreground text-center font-cairo py-2">لا توجد محافظ مربوطة</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completed Surveys */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text text-right flex items-center gap-2 justify-end">
                <span>الاستبيانات المكتملة</span>
                <ClipboardList className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedSurveys.length > 0 ? (
                <div className="space-y-2">
                  {completedSurveys.map((survey: any) => (
                    <div key={survey.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-cairo">{(survey.surveys as any)?.title || 'استبيان'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(survey.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center font-cairo py-2">لم يتم إكمال أي استبيان بعد</p>
              )}
            </CardContent>
          </Card>

          {isOwnProfile ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AccountStatsCard />
              <EngagementStatsCard />
              {profile.user_id && <FollowStats userId={profile.user_id} />}
            </div>
          ) : (
            <div className="flex justify-center">
              {profile.user_id && <FollowStats userId={profile.user_id} />}
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit">
          <ProfileEditForm profile={profile} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <TodoList />
          
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">سجل النشاط</CardTitle>
              <CardDescription className="arabic-text">تتبع نشاطاتك الأخيرة على المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground arabic-text">لا توجد أنشطة مسجلة حتى الآن</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">إعدادات الحساب</CardTitle>
              <CardDescription className="arabic-text">إدارة إعدادات الخصوصية والأمان</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium arabic-text">إعدادات الخصوصية</h3>
                    <p className="text-sm text-muted-foreground arabic-text">
                      التحكم في من يمكنه رؤية معلوماتك
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setPrivacyDialogOpen(true)}
                    className="arabic-text"
                  >
                    إعدادات
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium arabic-text">الأمان</h3>
                    <p className="text-sm text-muted-foreground arabic-text">
                      تغيير كلمة المرور والمصادقة الثنائية
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setSecurityDialogOpen(true)}
                    className="arabic-text"
                  >
                    إعدادات
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium arabic-text">الإشعارات</h3>
                    <p className="text-sm text-muted-foreground arabic-text">
                      إدارة تفضيلات الإشعارات
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setNotificationDialogOpen(true)}
                    className="arabic-text"
                  >
                    إعدادات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Dialogs */}
      <PrivacySettingsDialog 
        open={privacyDialogOpen} 
        onOpenChange={setPrivacyDialogOpen} 
      />
      <SecuritySettingsDialog 
        open={securityDialogOpen} 
        onOpenChange={setSecurityDialogOpen} 
      />
      <NotificationSettingsDialog 
        open={notificationDialogOpen} 
        onOpenChange={setNotificationDialogOpen} 
      />
        </div>
      </div>
    </div>
  );
}