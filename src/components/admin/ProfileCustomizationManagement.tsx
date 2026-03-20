import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, RefreshCw, User, Settings } from "lucide-react";

interface ProfileCustomization {
  id?: string;
  user_id?: string;
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
}

export default function ProfileCustomizationManagement() {
  const [customization, setCustomization] = useState<ProfileCustomization>({
    layout_type: 'standard',
    card_arrangement: ['overview', 'stats', 'activity'],
    background_image: null,
    background_color: '#ffffff',
    background_gradient: null,
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
    show_join_date: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCustomization = async () => {
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
        setCustomization({
          ...data,
          card_arrangement: Array.isArray(data.card_arrangement) 
            ? (data.card_arrangement as string[]) 
            : ['overview', 'stats', 'activity'],
          external_widgets: Array.isArray(data.external_widgets) 
            ? data.external_widgets 
            : []
        });
      }
    } catch (error) {
      console.error('Error fetching customization:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل إعدادات البروفايل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomization();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        ...customization,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Try update first
      const { data: existing } = await supabase
        .from('profile_customization')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existing) {
        ({ error } = await supabase
          .from('profile_customization')
          .update(payload)
          .eq('user_id', user.id));
      } else {
        ({ error } = await supabase
          .from('profile_customization')
          .insert(payload));
      }

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات البروفايل بنجاح"
      });
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive"
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            إدارة تخصيصات البروفايل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="layout" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="layout">التخطيط</TabsTrigger>
              <TabsTrigger value="styling">التصميم</TabsTrigger>
              <TabsTrigger value="typography">الخطوط</TabsTrigger>
              <TabsTrigger value="visibility">الخصوصية</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-2">
                <Label>نوع التخطيط</Label>
                <Select 
                  value={customization.layout_type} 
                  onValueChange={(value) => setCustomization({...customization, layout_type: value})}
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
              </div>

              <div className="space-y-4">
                <Label>عرض المكونات</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_stats" className="cursor-pointer">عرض الإحصائيات</Label>
                    <Switch
                      id="show_stats"
                      checked={customization.show_stats}
                      onCheckedChange={(checked) => setCustomization({...customization, show_stats: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_activity" className="cursor-pointer">عرض النشاط</Label>
                    <Switch
                      id="show_activity"
                      checked={customization.show_activity}
                      onCheckedChange={(checked) => setCustomization({...customization, show_activity: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_follow" className="cursor-pointer">عرض المتابعين</Label>
                    <Switch
                      id="show_follow"
                      checked={customization.show_follow_stats}
                      onCheckedChange={(checked) => setCustomization({...customization, show_follow_stats: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_todo" className="cursor-pointer">عرض قائمة المهام</Label>
                    <Switch
                      id="show_todo"
                      checked={customization.show_todo_list}
                      onCheckedChange={(checked) => setCustomization({...customization, show_todo_list: checked})}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="styling" className="space-y-4">
              <div className="space-y-2">
                <Label>صورة الخلفية (URL)</Label>
                <Input 
                  value={customization.background_image || ''} 
                  onChange={(e) => setCustomization({...customization, background_image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>لون الخلفية</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={customization.background_color} 
                      onChange={(e) => setCustomization({...customization, background_color: e.target.value})}
                      className="w-20"
                    />
                    <Input 
                      value={customization.background_color} 
                      onChange={(e) => setCustomization({...customization, background_color: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>وضع السمة</Label>
                  <Select 
                    value={customization.theme_mode} 
                    onValueChange={(value) => setCustomization({...customization, theme_mode: value})}
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
              </div>

              <div className="space-y-2">
                <Label>Gradient الخلفية (اختياري)</Label>
                <Input 
                  value={customization.background_gradient || ''} 
                  onChange={(e) => setCustomization({...customization, background_gradient: e.target.value})}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع الخط</Label>
                  <Select 
                    value={customization.font_family} 
                    onValueChange={(value) => setCustomization({...customization, font_family: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cairo">Cairo</SelectItem>
                      <SelectItem value="Amiri">Amiri</SelectItem>
                      <SelectItem value="Tajawal">Tajawal</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>سمك الخط</Label>
                  <Select 
                    value={customization.font_weight} 
                    onValueChange={(value) => setCustomization({...customization, font_weight: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="bold">عريض</SelectItem>
                      <SelectItem value="light">خفيف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>حجم خط العناوين</Label>
                  <Select 
                    value={customization.header_font_size} 
                    onValueChange={(value) => setCustomization({...customization, header_font_size: value})}
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
                <div className="space-y-2">
                  <Label>حجم خط المحتوى</Label>
                  <Select 
                    value={customization.content_font_size} 
                    onValueChange={(value) => setCustomization({...customization, content_font_size: value})}
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

            <TabsContent value="visibility" className="space-y-4">
              <div className="space-y-2">
                <Label>خصوصية البروفايل</Label>
                <Select 
                  value={customization.profile_visibility} 
                  onValueChange={(value) => setCustomization({...customization, profile_visibility: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">عام</SelectItem>
                    <SelectItem value="private">خاص</SelectItem>
                    <SelectItem value="followers_only">للمتابعين فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_social" className="cursor-pointer">عرض روابط التواصل</Label>
                  <Switch
                    id="show_social"
                    checked={customization.show_social_links}
                    onCheckedChange={(checked) => setCustomization({...customization, show_social_links: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_join" className="cursor-pointer">عرض تاريخ الانضمام</Label>
                  <Switch
                    id="show_join"
                    checked={customization.show_join_date}
                    onCheckedChange={(checked) => setCustomization({...customization, show_join_date: checked})}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={fetchCustomization}>
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة تحميل
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              حفظ التغييرات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}