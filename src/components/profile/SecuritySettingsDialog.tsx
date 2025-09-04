import { useState } from 'react';
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
  CheckCircle2 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecuritySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecuritySettingsDialog({ open, onOpenChange }: SecuritySettingsDialogProps) {
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordChangeRequired: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    // TODO: Save security settings
    console.log('Saving security settings:', settings);
    onOpenChange(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمات المرور غير متطابقة | Passwords do not match');
      return;
    }
    // TODO: Change password
    console.log('Changing password');
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

              <Button onClick={handlePasswordChange} className="w-full arabic-text">
                تغيير كلمة المرور | Change Password
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
                طبقة حماية إضافية لحسابك | Additional security layer for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="arabic-text">
                    تفعيل المصادقة الثنائية | Enable 2FA
                  </Label>
                  <p className="text-sm text-muted-foreground arabic-text">
                    حماية إضافية عبر الهاتف المحمول | Extra protection via mobile phone
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, twoFactorEnabled: checked })
                  }
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="arabic-text">
            إلغاء | Cancel
          </Button>
          <Button onClick={handleSave} className="arabic-text">
            حفظ الإعدادات | Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}