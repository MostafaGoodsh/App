import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, AlertCircle, TrendingUp, Users, Activity, Coins } from "lucide-react";

interface ConversionSettings {
  id: string;
  points_to_token_rate: number;
  minimum_conversion_points: number;
  maximum_conversion_points: number;
  daily_conversion_limit: number;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversionStats {
  total_conversions: number;
  total_points_converted: number;
  total_tokens_issued: number;
  daily_conversions: number;
  active_users: number;
}

export const ConversionSettingsManagement = () => {
  const [settings, setSettings] = useState<ConversionSettings | null>(null);
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('conversion_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setSettings(settingsData);

      // Load statistics
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('point_to_token_conversions')
        .select('*');

      if (conversionsError) {
        console.error('Error loading conversion stats:', conversionsError);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const todayConversions = conversionsData?.filter(c => 
          c.created_at.startsWith(today) && c.status === 'completed'
        ) || [];

        const completedConversions = conversionsData?.filter(c => c.status === 'completed') || [];
        
        const statsData: ConversionStats = {
          total_conversions: completedConversions.length,
          total_points_converted: completedConversions.reduce((sum, c) => sum + c.points_amount, 0),
          total_tokens_issued: completedConversions.reduce((sum, c) => sum + c.token_amount, 0),
          daily_conversions: todayConversions.length,
          active_users: new Set(completedConversions.map(c => c.user_id)).size
        };

        setStats(statsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('conversion_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof ConversionSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: value
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>جارٍ تحميل الإعدادات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي التحويلات</p>
                  <p className="text-2xl font-bold">{stats.total_conversions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">النقاط المحولة</p>
                  <p className="text-2xl font-bold">{stats.total_points_converted.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tokens صادرة</p>
                  <p className="text-2xl font-bold">{stats.total_tokens_issued.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">مستخدمين نشطين</p>
                  <p className="text-2xl font-bold">{stats.active_users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">تحويلات اليوم</p>
                  <p className="text-2xl font-bold">{stats.daily_conversions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات تحويل النقاط إلى Tokens
          </CardTitle>
          <CardDescription>
            تكوين نظام تحويل النقاط المكتسبة إلى DevNet tokens
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!settings ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لم يتم العثور على إعدادات. سيتم إنشاء إعدادات افتراضية.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">تفعيل نظام التحويل</Label>
                  <p className="text-sm text-muted-foreground">
                    تمكين أو تعطيل تحويل النقاط إلى tokens
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={settings.is_active}
                  onCheckedChange={(value) => updateSetting('is_active', value)}
                />
              </div>

              <Separator />

              {/* Token Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token_name">اسم الـ Token</Label>
                  <Input
                    id="token_name"
                    value={settings.token_name}
                    onChange={(e) => updateSetting('token_name', e.target.value)}
                    placeholder="MsRa DevNet Token"
                  />
                </div>

                <div>
                  <Label htmlFor="token_symbol">رمز الـ Token</Label>
                  <Input
                    id="token_symbol"
                    value={settings.token_symbol}
                    onChange={(e) => updateSetting('token_symbol', e.target.value)}
                    placeholder="MSRA"
                  />
                </div>

                <div>
                  <Label htmlFor="token_decimals">عدد الخانات العشرية</Label>
                  <Input
                    id="token_decimals"
                    type="number"
                    value={settings.token_decimals}
                    onChange={(e) => updateSetting('token_decimals', parseInt(e.target.value))}
                    min="0"
                    max="18"
                  />
                </div>

                <div>
                  <Label htmlFor="points_to_token_rate">معدل التحويل</Label>
                  <Input
                    id="points_to_token_rate"
                    type="number"
                    value={settings.points_to_token_rate}
                    onChange={(e) => updateSetting('points_to_token_rate', parseFloat(e.target.value))}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    كم نقطة = 1 token
                  </p>
                </div>
              </div>

              <Separator />

              {/* Conversion Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minimum_conversion_points">الحد الأدنى للتحويل</Label>
                  <Input
                    id="minimum_conversion_points"
                    type="number"
                    value={settings.minimum_conversion_points}
                    onChange={(e) => updateSetting('minimum_conversion_points', parseInt(e.target.value))}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    أقل عدد نقاط يمكن تحويله
                  </p>
                </div>

                <div>
                  <Label htmlFor="maximum_conversion_points">الحد الأقصى للتحويل</Label>
                  <Input
                    id="maximum_conversion_points"
                    type="number"
                    value={settings.maximum_conversion_points}
                    onChange={(e) => updateSetting('maximum_conversion_points', parseInt(e.target.value))}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    أكبر عدد نقاط يمكن تحويله
                  </p>
                </div>

                <div>
                  <Label htmlFor="daily_conversion_limit">الحد اليومي</Label>
                  <Input
                    id="daily_conversion_limit"
                    type="number"
                    value={settings.daily_conversion_limit}
                    onChange={(e) => updateSetting('daily_conversion_limit', parseInt(e.target.value))}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    إجمالي النقاط المسموح تحويلها يومياً
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">معاينة التحويل:</h4>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    {settings.minimum_conversion_points} نقطة = {(settings.minimum_conversion_points / settings.points_to_token_rate).toFixed(4)} {settings.token_symbol}
                  </Badge>
                  <Badge variant="outline">
                    {settings.maximum_conversion_points} نقطة = {(settings.maximum_conversion_points / settings.points_to_token_rate).toFixed(4)} {settings.token_symbol}
                  </Badge>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Settings className="h-4 w-4 animate-spin ml-2" />
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};