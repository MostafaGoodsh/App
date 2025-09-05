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
    <div className="container max-w-4xl mx-auto p-6 arabic-content">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 arabic-text">
          البروفايل الشخصي
        </h1>
        <p className="text-sm text-muted-foreground arabic-text">
          إدارة معلوماتك الشخصية وإعدادات الحساب
        </p>
      </div>

      <ProfileHeader profile={profile} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="flex-col py-2 gap-1">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs arabic-text">نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-col py-2 gap-1">
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs arabic-text">تحرير</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-col py-2 gap-1">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs arabic-text">النشاط</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-col py-2 gap-1">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs arabic-text">الإعدادات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">معلومات الملف الشخصي</CardTitle>
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
                    <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">اللغة المفضلة</p>
                    <p className="font-medium">
                      {profile.preferred_language === 'ar' ? 'العربية' : 'English'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-primary">0</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">المنشورات</p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-secondary-foreground">0</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">المتابعون</p>
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
              <CardTitle>سجل النشاط</CardTitle>
              <CardDescription>تتبع نشاطاتك الأخيرة على المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد أنشطة مسجلة حتى الآن</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الحساب</CardTitle>
              <CardDescription>إدارة إعدادات الخصوصية والأمان</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">إعدادات الخصوصية</h3>
                    <p className="text-sm text-muted-foreground">
                      التحكم في من يمكنه رؤية معلوماتك
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setPrivacyDialogOpen(true)}
                  >
                    إعدادات
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">الأمان</h3>
                    <p className="text-sm text-muted-foreground">
                      تغيير كلمة المرور والمصادقة الثنائية
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setSecurityDialogOpen(true)}
                  >
                    إعدادات
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">الإشعارات</h3>
                    <p className="text-sm text-muted-foreground">
                      إدارة تفضيلات الإشعارات
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setNotificationDialogOpen(true)}
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
  );
}