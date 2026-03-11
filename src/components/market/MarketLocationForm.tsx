import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MapPin, X, Coins } from "lucide-react";

interface MarketLocationFormProps {
  latitude: number;
  longitude: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MarketLocationForm = ({ latitude, longitude, onSuccess, onCancel }: MarketLocationFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    name_en: "",
    description: "",
    location_type: "store",
    address: "",
    phone: "",
    website: "",
    accepts_msra: true,
    cooperation_note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("market_locations").insert({
        user_id: user.id,
        name: form.name.trim(),
        name_en: form.name_en.trim() || null,
        description: form.description.trim() || null,
        location_type: form.location_type,
        latitude,
        longitude,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        status: "pending",
        accepts_msra: form.accepts_msra,
        cooperation_note: form.cooperation_note.trim() || null,
      });

      if (error) throw error;
      toast.success("تم إرسال طلب التعاون بنجاح! سيتم مراجعته من الإدارة");
      onSuccess();
    } catch (error) {
      console.error("Error submitting location:", error);
      toast.error("حدث خطأ أثناء الإرسال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/70 backdrop-blur-sm border-primary/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-primary" />
          إنشاء تعاون جديد
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4 text-white" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          {/* Cooperation Toggle */}
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-white font-semibold text-sm">قبول التعامل بـ <span dir="ltr" className="text-primary">$MS-RA</span></p>
                    <p className="text-white/50 text-xs">اقبل الدفع بالعملة الرقمية في متجرك</p>
                  </div>
                </div>
                <Switch
                  checked={form.accepts_msra}
                  onCheckedChange={(v) => setForm({ ...form, accepts_msra: v })}
                />
              </div>
            </CardContent>
          </Card>

          {form.accepts_msra && (
            <div className="space-y-2">
              <Label className="text-white">ملاحظات التعاون (اختياري)</Label>
              <Textarea
                value={form.cooperation_note}
                onChange={(e) => setForm({ ...form, cooperation_note: e.target.value })}
                placeholder="مثال: نقبل الدفع بـ $MS-RA على جميع المنتجات بخصم 10%"
                rows={2}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">الاسم *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسم المتجر / المحل"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Name (EN)</Label>
              <Input
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                placeholder="Store name in English"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">نوع النشاط</Label>
            <Select value={form.location_type} onValueChange={(v) => setForm({ ...form, location_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="store">متجر</SelectItem>
                <SelectItem value="market">سوق</SelectItem>
                <SelectItem value="shop">محل</SelectItem>
                <SelectItem value="restaurant">مطعم</SelectItem>
                <SelectItem value="service">خدمات</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">الوصف</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف قصير للنشاط"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">العنوان</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="العنوان التفصيلي"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">رقم الهاتف</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">الموقع الإلكتروني</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="text-white/50 text-xs">
            📍 الإحداثيات: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الإرسال..." : "إرسال طلب التعاون"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};