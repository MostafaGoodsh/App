import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Settings, Activity, Calendar, MapPin, Languages, Wallet, Star, ClipboardList, ExternalLink, Users } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useProfileCustomization } from '@/hooks/useProfileCustomization';
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
import { useLanguage } from '@/contexts/LanguageContext';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const viewUserId = searchParams.get('user');
  const { profile, loading } = useProfile(viewUserId || undefined);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isOwnProfile = !viewUserId || viewUserId === user?.id;
  const { customization, containerStyle, backgroundStyle } = useProfileCustomization(viewUserId || undefined);
  
  const { stats, dailyTasks, completedTasks, completeTask, isTaskCompleted, loading: statsLoading } = useEngagementStats();
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [completedSurveys, setCompletedSurveys] = useState<any[]>([]);
  const [xpBalance, setXpBalance] = useState(0);
  const [connectedWallets, setConnectedWallets] = useState<{solana?: string; ton?: string; evm?: string}>({});
  const tonAddress = useTonAddress();
  const [totalPoints, setTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isKycVerified, setIsKycVerified] = useState(false);

  useEffect(() => {
    const targetUserId = viewUserId || user?.id;
    if (!targetUserId) return;

    const fetchSurveys = async () => {
      const { data } = await supabase.from('survey_responses').select('id, survey_id, completed_at, surveys(title)').eq('user_id', targetUserId).order('completed_at', { ascending: false });
      if (data) setCompletedSurveys(data);
    };

    const fetchPoints = async () => {
      const { data } = await supabase.from('user_points_balance').select('total_points').eq('user_id', targetUserId).maybeSingle();
      if (data) setTotalPoints(data.total_points || 0);
      const { data: balData } = await supabase.from('internal_wallet_balances').select('balance, internal_tokens!inner(symbol)').eq('user_id', targetUserId);
      if (balData) {
        const xp = balData.find((b: any) => b.internal_tokens?.symbol === 'XP');
        if (xp) setXpBalance(xp.balance);
      }
    };

    const fetchWallets = async () => {
      const { data } = await supabase.from('profiles').select('solana_address').eq('user_id', targetUserId).maybeSingle();
      let evmAddress: string | undefined;
      try { const saved = localStorage.getItem('connectedWallet'); if (saved) evmAddress = JSON.parse(saved)?.address; } catch {}
      setConnectedWallets({ solana: data?.solana_address || undefined, evm: evmAddress, ton: tonAddress || undefined });
    };

    const fetchBadges = async () => {
      const { data } = await supabase.from('user_badges').select('*, badges(name, icon_emoji, badge_color)').eq('user_id', targetUserId);
      if (data) setUserBadges(data);
    };

    const fetchKycStatus = async () => {
      const { data } = await supabase.from('identity_verification').select('status').eq('user_id', targetUserId).eq('status', 'approved').maybeSingle();
      setIsKycVerified(!!data);
    };

    fetchSurveys(); fetchPoints(); fetchWallets(); fetchBadges(); fetchKycStatus();
  }, [viewUserId, user?.id, tonAddress]);

  if (loading || statsLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card><CardContent className="flex flex-col items-center justify-center py-12">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("البروفايل غير متوفر")}</h2>
          <p className="text-muted-foreground">{t("لم يتم العثور على بيانات البروفايل")}</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      ...backgroundStyle,
      ...((!customization.background_gradient && !customization.background_image) 
        ? { backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
        : {}),
    }}>
      <div className="min-h-screen bg-background/90">
        <div className="container max-w-full sm:max-w-4xl mx-auto px-2 sm:p-6 py-4 arabic-content" style={containerStyle}>
          <ProfileHeader profile={profile} badges={userBadges} isKycVerified={isKycVerified} />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 h-12 p-1 gap-0.5">
              <TabsTrigger value="overview" className="flex-col py-1.5 gap-0.5 text-[10px] sm:text-xs px-1 data-[state=active]:bg-primary/10">
                <User className="w-4 h-4" />
                <span>{t("عامة")}</span>
              </TabsTrigger>
              <TabsTrigger value="family" className="flex-col py-1.5 gap-0.5 text-[10px] sm:text-xs px-1 data-[state=active]:bg-primary/10">
                <Users className="w-4 h-4" />
                <span>{t("عائلة")}</span>
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex-col py-1.5 gap-0.5 text-[10px] sm:text-xs px-1 data-[state=active]:bg-primary/10">
                <Edit className="w-4 h-4" />
                <span>{t("تعديل")}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-col py-1.5 gap-0.5 text-[10px] sm:text-xs px-1 data-[state=active]:bg-primary/10">
                <Activity className="w-4 h-4" />
                <span>{t("نشاط")}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-col py-1.5 gap-0.5 text-[10px] sm:text-xs px-1 data-[state=active]:bg-primary/10">
                <Settings className="w-4 h-4" />
                <span>{t("إعدادات")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-right">{t("معلومات الملف الشخصي")}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("الاسم")}</p>
                        <p className="font-medium text-lg">{profile.full_name || t('غير محدد')}</p>
                      </div>
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    {customization.show_join_date && (
                    <div className="flex items-center gap-3 justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("تاريخ الانضمام")}</p>
                        <p className="font-medium">{new Date(profile.created_at).toLocaleDateString(language === 'ar' || language === 'both' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US')}</p>
                      </div>
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    )}
                    <div className="flex items-center gap-3 justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("اللغة المفضلة")}</p>
                        <p className="font-medium">{profile.preferred_language === 'ar' ? t('العربية') : 'English'}</p>
                      </div>
                      <Languages className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  {customization.show_social_links && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-4 text-right text-lg">{t("روابط التواصل")}</h3>
                    <div className="grid gap-3">
                      {[
                        { name: t('الموقع الشخصي'), url: profile.website_url },
                        { name: 'Instagram', url: profile.instagram_url },
                        { name: 'Twitter', url: profile.twitter_url },
                        { name: 'LinkedIn', url: profile.linkedin_url },
                        { name: 'Facebook', url: profile.facebook_url }
                      ].filter(link => link.url && link.url.trim() !== '').map((link) => (
                        <Button key={link.name} variant="outline" size="sm" asChild className="justify-start text-right w-full">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <span className="text-sm">{link.name}</span>
                          </a>
                        </Button>
                      ))}
                      {![profile.website_url, profile.instagram_url, profile.twitter_url, profile.linkedin_url, profile.facebook_url].some(url => url && url.trim() !== '') && (
                        <p className="text-sm text-muted-foreground text-center py-4">{t("لا توجد روابط متاحة")}</p>
                      )}
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle className="text-right flex items-center gap-2 justify-end">
                    <span>{t("نقاط الخبرة")}</span><Star className="w-5 h-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">{totalPoints.toLocaleString(language === 'ar' || language === 'both' ? 'ar-EG' : 'en-US')}</p>
                      <p className="text-xs text-muted-foreground font-cairo">{t("إجمالي النقاط")}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{xpBalance.toLocaleString(language === 'ar' || language === 'both' ? 'ar-EG' : 'en-US')}</p>
                      <p className="text-xs text-muted-foreground font-cairo">{t("رصيد XP")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-right flex items-center gap-2 justify-end">
                    <span>{t("المحافظ المربوطة")}</span><Wallet className="w-5 h-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {connectedWallets.solana && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="text-xs">Solana</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{connectedWallets.solana.slice(0, 6)}...{connectedWallets.solana.slice(-4)}</span>
                      </div>
                    )}
                    {connectedWallets.evm && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="text-xs">Ethereum</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{connectedWallets.evm.slice(0, 6)}...{connectedWallets.evm.slice(-4)}</span>
                      </div>
                    )}
                    {connectedWallets.ton && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="text-xs">TON</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{connectedWallets.ton.slice(0, 6)}...{connectedWallets.ton.slice(-4)}</span>
                      </div>
                    )}
                    {!connectedWallets.solana && !connectedWallets.ton && !connectedWallets.evm && (
                      <p className="text-sm text-muted-foreground text-center font-cairo py-2">{t("لا توجد محافظ مربوطة")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-right flex items-center gap-2 justify-end">
                    <span>{t("الاستبيانات المكتملة")}</span><ClipboardList className="w-5 h-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedSurveys.length > 0 ? (
                    <div className="space-y-2">
                      {completedSurveys.map((survey: any) => (
                        <div key={survey.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-sm font-cairo">{survey.surveys?.title || t('استبيان')}</span>
                          <span className="text-xs text-muted-foreground">{new Date(survey.completed_at).toLocaleDateString(language === 'ar' || language === 'both' ? 'ar-SA' : language === 'ru' ? 'ru-RU' : 'en-US')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center font-cairo py-2">{t("لم يتم إكمال أي استبيان بعد")}</p>
                  )}
                </CardContent>
              </Card>

              {customization.show_stats && isOwnProfile && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <AccountStatsCard />
                  <EngagementStatsCard />
                  {customization.show_follow_stats && profile.user_id && <FollowStats userId={profile.user_id} />}
                </div>
              )}
              {customization.show_follow_stats && !isOwnProfile && (
                <div className="flex justify-center">
                  {profile.user_id && <FollowStats userId={profile.user_id} />}
                </div>
              )}
            </TabsContent>

            <TabsContent value="family"><FamilyManagement /></TabsContent>
            <TabsContent value="edit"><ProfileEditForm profile={profile} /></TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {customization.show_todo_list && <TodoList />}
              <Card>
                <CardHeader>
                  <CardTitle>{t("سجل النشاط")}</CardTitle>
                  <CardDescription>{t("تتبع نشاطاتك الأخيرة على المنصة")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t("لا توجد أنشطة مسجلة حتى الآن")}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>{t("إعدادات الحساب")}</CardTitle>
                  <CardDescription>{t("إدارة إعدادات الخصوصية والأمان")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{t("إعدادات الخصوصية")}</h3>
                        <p className="text-sm text-muted-foreground">{t("التحكم في من يمكنه رؤية معلوماتك")}</p>
                      </div>
                      <Button variant="outline" onClick={() => setPrivacyDialogOpen(true)}>{t("إعدادات")}</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{t("الأمان")}</h3>
                        <p className="text-sm text-muted-foreground">{t("تغيير كلمة المرور والمصادقة الثنائية")}</p>
                      </div>
                      <Button variant="outline" onClick={() => setSecurityDialogOpen(true)}>{t("إعدادات")}</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{t("الإشعارات")}</h3>
                        <p className="text-sm text-muted-foreground">{t("إدارة تفضيلات الإشعارات")}</p>
                      </div>
                      <Button variant="outline" onClick={() => setNotificationDialogOpen(true)}>{t("إعدادات")}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <PrivacySettingsDialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen} />
          <SecuritySettingsDialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen} />
          <NotificationSettingsDialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen} />
        </div>
      </div>
    </div>
  );
}
