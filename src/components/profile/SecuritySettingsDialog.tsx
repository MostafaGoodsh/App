import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SecuritySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecuritySettingsDialog({ open, onOpenChange }: SecuritySettingsDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordChangeRequired: false,
  });
  const [anubisUser, setAnubisUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // جلب بيانات المستخدم من Anubis
  useEffect(() => {
    const fetchAnubisUser = async () => {
      if (!user?.email || !open) return;
      
      setLoadingSettings(true);
      try {
        const { data, error } = await supabase
          .from('anubis_users_safe' as any)
          .select('id, email, full_name, phone, status, subscription_type, two_factor_enabled, created_at, updated_at, last_login, end_date')
          .eq('email', user.email)
          .single();

        if (data) {
          const userData = data as any;
          setAnubisUser(userData);
          setSettings(prev => ({
            ...prev,
            twoFactorEnabled: userData.two_factor_enabled || false
          }));
        }
      } catch (error) {
        console.error('Error fetching Anubis user:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchAnubisUser();
  }, [user?.email, open]);

  const handleSave = async () => {
    if (!user?.email) {
      toast.error('خطأ | Error', {
        description: 'لم يتم العثور على بيانات المستخدم | User data not found'
      });
      return;
    }

    // إذا لم يكن لديه حساب Anubis وحاول تفعيل 2FA
    if (!anubisUser && settings.twoFactorEnabled) {
      toast.error('حساب Anubis مطلوب | Anubis Account Required', {
        description: 'يجب إنشاء حساب Anubis أولاً لتفعيل المصادقة الثنائية | Create an Anubis account first to enable 2FA',
        action: {
          label: 'إنشاء حساب | Create Account',
          onClick: () => {
            onOpenChange(false);
            navigate('/anubis-auth');
          }
        }
      });
      return;
    }

    setLoading(true);
    try {
      // تحديث إعدادات 2FA في Anubis
      const { error } = await supabase
        .from('anubis_users')
        .update({ two_factor_enabled: settings.twoFactorEnabled })
        .eq('email', user.email);

      if (error) throw error;

      toast.success('تم الحفظ | Saved', {
        description: 'تم حفظ إعدادات الأمان بنجاح | Security settings saved successfully'
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('خطأ | Error', {
        description: error.message || 'فشل حفظ الإعدادات | Failed to save settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('خطأ | Error', {
        description: 'كلمات المرور غير متطابقة | Passwords do not match'
      });
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('خطأ | Error', {
        description: 'يرجى ملء جميع الحقول | Please fill all fields'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('تم التحديث | Updated', {
        description: 'تم تغيير كلمة المرور بنجاح | Password changed successfully'
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('خطأ | Error', {
        description: error.message || 'فشل تغيير كلمة المرور | Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="arabic-text flex items-center gap-2">
            <Shield className="w-5 h-5" />
            إعدادات الأمان | Security Settings
          </DialogTitle>
          <DialogDescription className="arabic-text">
            تأمين حسابك وحماية معلوماتك الشخصية
            <br />
            Secure your account and protect your personal information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text flex items-center gap-2">
                <Lock className="w-4 h-4" />
                تغيير كلمة المرور | Change Password
              </CardTitle>
              <CardDescription className="arabic-text">
                تحديث كلمة المرور لحماية أفضل | Update your password for better security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password" className="arabic-text">
                  كلمة المرور الحالية | Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="أدخل كلمة المرور الحالية | Enter current password"
                />
              </div>

              <div>
                <Label htmlFor="new-password" className="arabic-text">
                  كلمة المرور الجديدة | New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="أدخل كلمة المرور الجديدة | Enter new password"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="arabic-text">
                  تأكيد كلمة المرور | Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="أعد إدخال كلمة المرور | Re-enter password"
                />
              </div>

              <Button 
                onClick={handlePasswordChange} 
                className="w-full arabic-text"
                disabled={loading}
              >
                {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور | Change Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                المصادقة الثنائية | Two-Factor Authentication
              </CardTitle>
              <CardDescription className="arabic-text">
                طبقة حماية إضافية لحسابك عبر نظام Anubis
                <br />
                Additional security layer for your account via Anubis system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!anubisUser ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="arabic-text space-y-2">
                    <p>يجب إنشاء حساب Anubis أولاً لتفعيل المصادقة الثنائية</p>
                    <p className="text-sm">You need to create an Anubis account first to enable 2FA</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        navigate('/anubis-auth');
                      }}
                      className="mt-2 w-full arabic-text"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      إنشاء حساب Anubis | Create Anubis Account
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="arabic-text">
                        تفعيل المصادقة الثنائية | Enable 2FA
                      </Label>
                      <p className="text-sm text-muted-foreground arabic-text">
                        حماية إضافية عبر البريد الإلكتروني | Extra protection via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, twoFactorEnabled: checked })
                      }
                      disabled={loadingSettings}
                    />
                  </div>

                  {settings.twoFactorEnabled && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription className="arabic-text">
                        المصادقة الثنائية مفعلة وتحمي حسابك | Two-factor authentication is active and protecting your account
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/anubis-auth');
                    }}
                    className="w-full arabic-text"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    تسجيل الدخول إلى Anubis | Login to Anubis
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text flex items-center gap-2">
                <Key className="w-4 h-4" />
                تفضيلات الأمان | Security Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="arabic-text">
                    تنبيهات تسجيل الدخول | Login Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground arabic-text">
                    إشعار عند تسجيل الدخول من جهاز جديد | Notify when logging in from new device
                  </p>
                </div>
                <Switch
                  checked={settings.loginAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, loginAlerts: checked })
                  }
                />
              </div>

              <div>
                <Label className="arabic-text">
                  انتهاء الجلسة (بالدقائق) | Session Timeout (minutes)
                </Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })
                  }
                  min="5"
                  max="480"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1 arabic-text">
                  تسجيل الخروج التلقائي بعد فترة عدم النشاط | Auto logout after inactivity period
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="arabic-text">
              تأكد من استخدام كلمة مرور قوية وتفعيل المصادقة الثنائية لحماية أفضل
              <br />
              Make sure to use a strong password and enable 2FA for better protection
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="arabic-text"
            disabled={loading}
          >
            إلغاء | Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="arabic-text"
            disabled={loading || loadingSettings}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات | Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}