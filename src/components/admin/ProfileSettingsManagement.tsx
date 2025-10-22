import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw, User, Eye, EyeOff } from "lucide-react";

interface ProfileCustomization {
  id: string;
  user_id: string;
  layout_type: string;
  card_arrangement: string[];
  background_image: string | null;
  background_color: string;
  background_gradient: string | null;
  theme_mode: string;
  header_font_size: string;
  content_font_size: string;
  font_family: string;
  font_weight: string;
  show_stats: boolean;
  show_activity: boolean;
  show_follow_stats: boolean;
  show_todo_list: boolean;
  external_widgets: any[];
  profile_visibility: string;
  show_social_links: boolean;
  show_join_date: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfileSettingsManagement() {
  const [settings, setSettings] = useState<ProfileCustomization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profile_customization')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          ...data,
          card_arrangement: (Array.isArray(data.card_arrangement) ? data.card_arrangement : ['overview', 'stats', 'activity']) as string[],
          external_widgets: (Array.isArray(data.external_widgets) ? data.external_widgets : []) as any[],
        });
      } else {
        // Create default settings
        const defaultSettings = {
          user_id: user.id,
          layout_type: 'standard',
          card_arrangement: ['overview', 'stats', 'activity'],
          background_color: '#ffffff',
          theme_mode: 'auto',
          header_font_size: 'large',
          content_font_size: 'medium',
          font_family: 'Cairo',
          font_weight: 'normal',
          show_stats: true,
          show_activity: true,
          show_follow_stats: true,
          show_todo_list: true,
          external_widgets: [],
          profile_visibility: 'public',
          show_social_links: true,
          show_join_date: true,
        };

        const { data: newData, error: insertError } = await supabase
          .from('profile_customization')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings({
          ...newData,
          card_arrangement: (Array.isArray(newData.card_arrangement) ? newData.card_arrangement : ['overview', 'stats', 'activity']) as string[],
          external_widgets: (Array.isArray(newData.external_widgets) ? newData.external_widgets : []) as any[],
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profile_customization')
        .update({
          layout_type: settings.layout_type,
          card_arrangement: settings.card_arrangement,
          background_image: settings.background_image,
          background_color: settings.background_color,
          background_gradient: settings.background_gradient,
          theme_mode: settings.theme_mode,
          header_font_size: settings.header_font_size,
          content_font_size: settings.content_font_size,
          font_family: settings.font_family,
          font_weight: settings.font_weight,
          show_stats: settings.show_stats,
          show_activity: settings.show_activity,
          show_follow_stats: settings.show_follow_stats,
          show_todo_list: settings.show_todo_list,
          external_widgets: settings.external_widgets,
          profile_visibility: settings.profile_visibility,
          show_social_links: settings.show_social_links,
          show_join_date: settings.show_join_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات البروفايل بنجاح",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">فشل في تحميل الإعدادات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="arabic-text flex items-center gap-2">
                <User className="h-5 w-5" />
                إدارة إعدادات البروفايل
              </CardTitle>
              <CardDescription className="arabic-text">
                تخصيص تصميم وعرض صفحة البروفايل
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="layout">التخطيط</TabsTrigger>
              <TabsTrigger value="styling">التصميم</TabsTrigger>
              <TabsTrigger value="typography">الخطوط</TabsTrigger>
              <TabsTrigger value="visibility">العرض</TabsTrigger>
              <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="layout_type">نوع التخطيط</Label>
                <Select
                  value={settings.layout_type}
                  onValueChange={(value) => setSettings({ ...settings, layout_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">قياسي</SelectItem>
                    <SelectItem value="compact">مضغوط</SelectItem>
                    <SelectItem value="extended">موسع</SelectItem>
                    <SelectItem value="minimal">بسيط</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  اختر تخطيط عرض صفحة البروفايل
                </p>
              </div>

              <div className="space-y-2">
                <Label>ترتيب الأقسام</Label>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    الترتيب الحالي: {settings.card_arrangement.join(' → ')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOrder = [...settings.card_arrangement].reverse();
                      setSettings({ ...settings, card_arrangement: newOrder });
                    }}
                  >
                    عكس الترتيب
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="styling" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="background_image">صورة الخلفية (URL)</Label>
                <Input
                  id="background_image"
                  value={settings.background_image || ''}
                  onChange={(e) => setSettings({ ...settings, background_image: e.target.value })}
                  placeholder="/lovable-uploads/profile-bg.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">لون الخلفية</Label>
                <Input
                  id="background_color"
                  value={settings.background_color}
                  onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_gradient">تدرج الخلفية (CSS)</Label>
                <Input
                  id="background_gradient"
                  value={settings.background_gradient || ''}
                  onChange={(e) => setSettings({ ...settings, background_gradient: e.target.value })}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme_mode">وضع السمة</Label>
                <Select
                  value={settings.theme_mode}
                  onValueChange={(value) => setSettings({ ...settings, theme_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="auto">تلقائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font_family">نوع الخط</Label>
                  <Select
                    value={settings.font_family}
                    onValueChange={(value) => setSettings({ ...settings, font_family: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cairo">Cairo</SelectItem>
                      <SelectItem value="Tajawal">Tajawal</SelectItem>
                      <SelectItem value="Amiri">Amiri</SelectItem>
                      <SelectItem value="Almarai">Almarai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font_weight">وزن الخط</Label>
                  <Select
                    value={settings.font_weight}
                    onValueChange={(value) => setSettings({ ...settings, font_weight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header_font_size">حجم خط العناوين</Label>
                  <Select
                    value={settings.header_font_size}
                    onValueChange={(value) => setSettings({ ...settings, header_font_size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">صغير</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">كبير</SelectItem>
                      <SelectItem value="xlarge">كبير جداً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_font_size">حجم خط المحتوى</Label>
                  <Select
                    value={settings.content_font_size}
                    onValueChange={(value) => setSettings({ ...settings, content_font_size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">صغير</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">كبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visibility" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_stats">عرض الإحصائيات</Label>
                    <p className="text-sm text-muted-foreground">إظهار إحصائيات الحساب</p>
                  </div>
                  <Switch
                    id="show_stats"
                    checked={settings.show_stats}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_stats: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_activity">عرض النشاط</Label>
                    <p className="text-sm text-muted-foreground">إظهار سجل النشاط</p>
                  </div>
                  <Switch
                    id="show_activity"
                    checked={settings.show_activity}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_activity: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_follow_stats">عرض إحصائيات المتابعة</Label>
                    <p className="text-sm text-muted-foreground">إظهار المتابعين والمتابعون</p>
                  </div>
                  <Switch
                    id="show_follow_stats"
                    checked={settings.show_follow_stats}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_follow_stats: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_todo_list">عرض قائمة المهام</Label>
                    <p className="text-sm text-muted-foreground">إظهار قائمة المهام</p>
                  </div>
                  <Switch
                    id="show_todo_list"
                    checked={settings.show_todo_list}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_todo_list: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_social_links">عرض روابط التواصل</Label>
                    <p className="text-sm text-muted-foreground">إظهار روابط وسائل التواصل</p>
                  </div>
                  <Switch
                    id="show_social_links"
                    checked={settings.show_social_links}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_social_links: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_join_date">عرض تاريخ الانضمام</Label>
                    <p className="text-sm text-muted-foreground">إظهار تاريخ إنشاء الحساب</p>
                  </div>
                  <Switch
                    id="show_join_date"
                    checked={settings.show_join_date}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_join_date: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="profile_visibility">ظهور البروفايل</Label>
                <Select
                  value={settings.profile_visibility}
                  onValueChange={(value) => setSettings({ ...settings, profile_visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>عام - مرئي للجميع</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="followers_only">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>للمتابعين فقط</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>خاص - لي فقط</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  تحديد من يمكنه رؤية معلومات البروفايل
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-semibold text-sm">ملاحظة:</p>
                <p className="text-sm text-muted-foreground">
                  إعدادات الخصوصية تتحكم في من يمكنه رؤية معلوماتك الشخصية. المعلومات العامة مثل الاسم والصورة ستكون مرئية دائماً.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}