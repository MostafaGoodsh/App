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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  TrendingUp,
  Heart,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationSettingsDialog({ open, onOpenChange }: NotificationSettingsDialogProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    socialUpdates: true,
    transactionAlerts: true,
    miningUpdates: true,
    frequency: 'instant',
    quietHoursEnabled: false,
    quietStart: '22:00',
    quietEnd: '08:00',
  });

  const handleSave = () => {
    // TODO: Save notification settings
    console.log('Saving notification settings:', settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="arabic-text flex items-center gap-2">
            <Bell className="w-5 h-5" />
            إعدادات الإشعارات | Notification Settings
          </DialogTitle>
          <DialogDescription className="arabic-text">
            تخصيص تفضيلاتك للإشعارات والتنبيهات
            <br />
            Customize your notification and alert preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                قنوات الإشعارات | Notification Channels
              </CardTitle>
              <CardDescription className="arabic-text">
                اختر كيفية تلقي الإشعارات | Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Label className="arabic-text">
                    إشعارات البريد الإلكتروني | Email Notifications
                  </Label>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <Label className="arabic-text">
                    الإشعارات المنبثقة | Push Notifications
                  </Label>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <Label className="arabic-text">
                    رسائل SMS | SMS Messages
                  </Label>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text">
                أنواع الإشعارات | Notification Types
              </CardTitle>
              <CardDescription className="arabic-text">
                اختر أنواع الإشعارات التي تريد تلقيها | Select which types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <Label className="arabic-text">
                    تنبيهات الأمان | Security Alerts
                  </Label>
                </div>
                <Switch
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, securityAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Label className="arabic-text">
                    تنبيهات المعاملات | Transaction Alerts
                  </Label>
                </div>
                <Switch
                  checked={settings.transactionAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, transactionAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <Label className="arabic-text">
                    تحديثات التعدين | Mining Updates
                  </Label>
                </div>
                <Switch
                  checked={settings.miningUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, miningUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <Label className="arabic-text">
                    التحديثات الاجتماعية | Social Updates
                  </Label>
                </div>
                <Switch
                  checked={settings.socialUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, socialUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="arabic-text">
                    الرسائل التسويقية | Marketing Emails
                  </Label>
                  <p className="text-xs text-muted-foreground arabic-text">
                    عروض وأخبار المنصة | Platform offers and news
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, marketingEmails: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text">
                تكرار الإشعارات | Notification Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="arabic-text">
                  تكرار الإرسال | Delivery Frequency
                </Label>
                <Select
                  value={settings.frequency}
                  onValueChange={(value) => setSettings({ ...settings, frequency: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">فوري | Instant</SelectItem>
                    <SelectItem value="hourly">كل ساعة | Hourly</SelectItem>
                    <SelectItem value="daily">يومي | Daily</SelectItem>
                    <SelectItem value="weekly">أسبوعي | Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="arabic-text">
                    ساعات الهدوء | Quiet Hours
                  </Label>
                  <p className="text-xs text-muted-foreground arabic-text">
                    عدم إرسال إشعارات خلال ساعات معينة | No notifications during specific hours
                  </p>
                </div>
                <Switch
                  checked={settings.quietHoursEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, quietHoursEnabled: checked })
                  }
                />
              </div>

              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="arabic-text">من | From</Label>
                    <Input
                      type="time"
                      value={settings.quietStart}
                      onChange={(e) =>
                        setSettings({ ...settings, quietStart: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="arabic-text">إلى | To</Label>
                    <Input
                      type="time"
                      value={settings.quietEnd}
                      onChange={(e) =>
                        setSettings({ ...settings, quietEnd: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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