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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Globe, Users } from 'lucide-react';

interface PrivacySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacySettingsDialog({ open, onOpenChange }: PrivacySettingsDialogProps) {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
    showSocialLinks: true,
    allowMessages: true,
    showActivity: false,
  });

  const handleSave = () => {
    // TODO: Save privacy settings to database
    console.log('Saving privacy settings:', settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="arabic-text flex items-center gap-2">
            <Shield className="w-5 h-5" />
            إعدادات الخصوصية | Privacy Settings
          </DialogTitle>
          <DialogDescription className="arabic-text">
            تحكم في من يمكنه رؤية معلوماتك الشخصية ونشاطك على المنصة
            <br />
            Control who can see your personal information and activity on the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text flex items-center gap-2">
                <Eye className="w-4 h-4" />
                رؤية البروفايل | Profile Visibility
              </CardTitle>
              <CardDescription className="arabic-text">
                التحكم في إمكانية رؤية الآخرين لبروفايلك | Control who can see your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visibility" className="arabic-text">
                  البروفايل مرئي للجميع | Profile visible to everyone
                </Label>
                <Switch
                  id="profile-visibility"
                  checked={settings.profileVisibility}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, profileVisibility: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-email" className="arabic-text">
                  إظهار البريد الإلكتروني | Show email address
                </Label>
                <Switch
                  id="show-email"
                  checked={settings.showEmail}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showEmail: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-phone" className="arabic-text">
                  إظهار رقم الهاتف | Show phone number
                </Label>
                <Switch
                  id="show-phone"
                  checked={settings.showPhone}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showPhone: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-social" className="arabic-text">
                  إظهار روابط التواصل الاجتماعي | Show social media links
                </Label>
                <Switch
                  id="show-social"
                  checked={settings.showSocialLinks}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showSocialLinks: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg arabic-text flex items-center gap-2">
                <Users className="w-4 h-4" />
                التفاعل | Interaction
              </CardTitle>
              <CardDescription className="arabic-text">
                إعدادات التواصل والتفاعل مع الآخرين | Communication and interaction settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-messages" className="arabic-text">
                  السماح بالرسائل من المستخدمين | Allow messages from users
                </Label>
                <Switch
                  id="allow-messages"
                  checked={settings.allowMessages}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowMessages: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-activity" className="arabic-text">
                  إظهار النشاط الأخير | Show recent activity
                </Label>
                <Switch
                  id="show-activity"
                  checked={settings.showActivity}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showActivity: checked })
                  }
                />
              </div>
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