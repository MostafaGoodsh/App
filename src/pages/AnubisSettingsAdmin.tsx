import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Settings, DollarSign, Lock } from "lucide-react";

export default function AnubisSettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    payment_enabled: false,
    free_tier_enabled: true,
    monthly_price: 0,
    quarterly_price: 0,
    yearly_price: 0,
    currency: "EGP"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("anubis_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings({
          payment_enabled: data.payment_enabled,
          free_tier_enabled: data.free_tier_enabled,
          monthly_price: Number(data.monthly_price) || 0,
          quarterly_price: Number(data.quarterly_price) || 0,
          yearly_price: Number(data.yearly_price) || 0,
          currency: data.currency || "EGP"
        });
      }
    } catch (error: any) {
      toast.error("فشل في تحميل الإعدادات: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("anubis_settings")
        .update({
          payment_enabled: settings.payment_enabled,
          free_tier_enabled: settings.free_tier_enabled,
          monthly_price: settings.monthly_price,
          quarterly_price: settings.quarterly_price,
          yearly_price: settings.yearly_price,
          currency: settings.currency,
          updated_at: new Date().toISOString()
        })
        .eq("id", (await supabase.from("anubis_settings").select("id").single()).data?.id);

      if (error) throw error;

      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error: any) {
      toast.error("فشل في حفظ الإعدادات: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RequireAdmin>
      <Helmet>
        <title>إعدادات خزانة أنوبيس - لوحة التحكم</title>
      </Helmet>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            إعدادات خزانة أنوبيس
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة إعدادات التسجيل والدفع لخدمة خزانة أنوبيس
          </p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                التحكم في نوع الاشتراك المتاح للمستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="free-tier">الفترة المجانية</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح بالتسجيل المجاني لجميع المستخدمين
                  </p>
                </div>
                <Switch
                  id="free-tier"
                  checked={settings.free_tier_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, free_tier_enabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-enabled">تفعيل الدفع</Label>
                  <p className="text-sm text-muted-foreground">
                    عرض خطط الدفع للمستخدمين (سيتم تطبيقها مستقبلاً)
                  </p>
                </div>
                <Switch
                  id="payment-enabled"
                  checked={settings.payment_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, payment_enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                إعدادات الأسعار
              </CardTitle>
              <CardDescription>
                تحديد أسعار خطط الاشتراك (سيتم تفعيلها عند تفعيل الدفع)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    placeholder="EGP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly">السعر الشهري</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={settings.monthly_price}
                    onChange={(e) =>
                      setSettings({ ...settings, monthly_price: Number(e.target.value) })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quarterly">السعر ربع السنوي</Label>
                  <Input
                    id="quarterly"
                    type="number"
                    value={settings.quarterly_price}
                    onChange={(e) =>
                      setSettings({ ...settings, quarterly_price: Number(e.target.value) })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearly">السعر السنوي</Label>
                  <Input
                    id="yearly"
                    type="number"
                    value={settings.yearly_price}
                    onChange={(e) =>
                      setSettings({ ...settings, yearly_price: Number(e.target.value) })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}