import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useVaultSubscription } from "@/hooks/useVaultSubscription";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const VaultSubscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAccess, createSubscription } = useVaultSubscription();
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    agreeToTerms: false
  });

  useEffect(() => {
    if (hasAccess) {
      navigate('/wallet');
    }
  }, [hasAccess, navigate]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast.error("يجب الموافقة على الشروط والأحكام");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    try {
      await createSubscription.mutateAsync({
        subscription_type: 'free_trial',
        payment_amount: 0,
        payment_method: 'free',
        status: 'active'
      });
      
      toast.success("تم تسجيلك بنجاح! مرحباً بك في الخزانة الرقمية");
      setTimeout(() => navigate('/wallet'), 1500);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التسجيل");
    }
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>التسجيل في الخزانة الرقمية - منصة مصر</title>
        <meta name="description" content="سجل الآن في الخزانة الرقمية واحصل على تخزين آمن ومشفر لملفاتك - مجاني لفترة محدودة" />
      </Helmet>
      <div className="min-h-screen py-16 px-4" style={{
        backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="min-h-screen bg-background/95 py-8">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-cairo text-4xl font-bold text-primary mb-2">
                الخزانة الرقمية
              </h1>
              <p className="font-cairo text-lg text-muted-foreground">
                Digital Vault | احم بياناتك بأعلى مستويات الأمان
              </p>
            </div>

            <Alert className="mb-6 border-primary/50 bg-primary/5">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertDescription className="font-cairo text-base">
                <strong>عرض خاص:</strong> الخدمة مجانية لفترة محدودة! سجل الآن واستفد من جميع المميزات
              </AlertDescription>
            </Alert>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-cairo text-2xl">التسجيل في الخزانة الرقمية</CardTitle>
                <CardDescription className="font-cairo text-base">
                  املأ البيانات التالية للحصول على وصول فوري وآمن
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-cairo text-base">الاسم الكامل *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                      className="font-cairo h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-cairo text-base">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="font-cairo h-12"
                      disabled={!!user?.email}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-cairo text-base">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+20 1XX XXX XXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      className="font-cairo h-12"
                      dir="ltr"
                    />
                  </div>

                  <div className="bg-muted/40 rounded-lg p-5 space-y-3 border border-border/50">
                    <h3 className="font-cairo font-bold text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      المميزات المتاحة مجاناً:
                    </h3>
                    <ul className="space-y-3 font-cairo">
                      <li className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>رفع وتخزين الوثائق بشكل آمن ومشفر</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>حماية بالمصادقة الثنائية (2FA) لأمان إضافي</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>تشفير من الطرف إلى الطرف لجميع البيانات</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, agreeToTerms: checked as boolean})
                      }
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="font-cairo leading-relaxed cursor-pointer text-sm">
                      أوافق على الشروط والأحكام وسياسة الخصوصية الخاصة بالخزانة الرقمية وأدرك أن الخدمة مجانية حالياً وقد تصبح مدفوعة في المستقبل
                    </Label>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full font-cairo text-lg py-6 h-14"
                    disabled={createSubscription.isPending || !formData.agreeToTerms}
                  >
                    {createSubscription.isPending ? 'جاري التسجيل...' : 'تسجيل والبدء الآن 🚀'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Alert className="mt-6 border-muted bg-muted/30">
              <AlertDescription className="text-center font-cairo text-sm">
                ✨ الخدمة <strong>مجانية تماماً</strong> حالياً | قد تصبح مدفوعة لاحقاً
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </>
  );
};

export default VaultSubscription;
