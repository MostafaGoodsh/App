import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Edit, 
  Settings, 
  Activity,
  Calendar,
  MapPin,
  Languages
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useEngagementStats } from "@/hooks/useEngagementStats";
import StreakDisplay from "@/components/engagement/StreakDisplay";
import DailyTasksList from "@/components/engagement/DailyTasksList";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { PrivacySettingsDialog } from '@/components/profile/PrivacySettingsDialog';
import { SecuritySettingsDialog } from '@/components/profile/SecuritySettingsDialog';
import { NotificationSettingsDialog } from '@/components/profile/NotificationSettingsDialog';

export default function Profile() {
  const { profile, loading } = useProfile();
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
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold arabic-text mb-2">
          <span className="block sm:hidden">البروفايل الشخصي</span>
          <span className="hidden sm:block">البروفايل الشخصي | Personal Profile</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground arabic-text">
          <span className="block sm:hidden">إدارة معلوماتك الشخصية وإعدادات الحساب</span>
          <span className="hidden sm:block">إدارة معلوماتك الشخصية وإعدادات الحساب | Manage your personal information and account settings</span>
        </p>
      </div>

      <ProfileHeader profile={profile} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="arabic-text flex-col py-2 gap-1">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">
              <span className="block sm:hidden">نظرة عامة</span>
              <span className="hidden sm:block">نظرة عامة | Overview</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="arabic-text flex-col py-2 gap-1">
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">
              <span className="block sm:hidden">تحرير</span>
              <span className="hidden sm:block">تحرير | Edit</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="arabic-text flex-col py-2 gap-1">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">
              <span className="block sm:hidden">النشاط</span>
              <span className="hidden sm:block">النشاط | Activity</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="arabic-text flex-col py-2 gap-1">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">
              <span className="block sm:hidden">الإعدادات</span>
              <span className="hidden sm:block">الإعدادات | Settings</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">
                  معلومات الملف الشخصي | Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground arabic-text">الاسم</p>
                    <p className="font-medium arabic-text">{profile.full_name || 'غير محدد'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground arabic-text">تاريخ الانضمام</p>
                    <p className="font-medium arabic-text">
                      {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground arabic-text">اللغة المفضلة</p>
                    <p className="font-medium arabic-text">
                      {profile.preferred_language === 'ar' ? 'العربية' : 'English'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">
                  إحصائيات الحساب | Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground arabic-text">المنشورات</p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <p className="text-2xl font-bold text-secondary-foreground">0</p>
                    <p className="text-sm text-muted-foreground arabic-text">المتابعون</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <SocialLinks profile={profile} />
        </TabsContent>

        <TabsContent value="edit">
          <ProfileEditForm profile={profile} />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">
                سجل النشاط | Activity Log
              </CardTitle>
              <CardDescription className="arabic-text">
                تتبع نشاطاتك الأخيرة على المنصة | Track your recent activities on the platform
              </CardDescription>
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
              <CardTitle className="arabic-text">
                إعدادات الحساب | Account Settings
              </CardTitle>
              <CardDescription className="arabic-text">
                إدارة إعدادات الخصوصية والأمان | Manage privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium arabic-text">
                      إعدادات الخصوصية | Privacy Settings
                    </h3>
                    <p className="text-sm text-muted-foreground arabic-text">
                      التحكم في من يمكنه رؤية معلوماتك | Control who can see your information
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="arabic-text"
                    onClick={() => setPrivacyDialogOpen(true)}
                  >
                    إعدادات | Settings
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium arabic-text">الأمان | Security</h3>
                    <p className="text-sm text-muted-foreground arabic-text">
                      تغيير كلمة المرور والمصادقة الثنائية | Change password and two-factor authentication
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="arabic-text"
                    onClick={() => setSecurityDialogOpen(true)}
                  >
                    إعدادات | Settings
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium arabic-text">الإشعارات | Notifications</h3>
                    <p className="text-sm text-muted-foreground arabic-text">
                      إدارة تفضيلات الإشعارات | Manage notification preferences
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="arabic-text"
                    onClick={() => setNotificationDialogOpen(true)}
                  >
                    إعدادات | Settings
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
  );
}