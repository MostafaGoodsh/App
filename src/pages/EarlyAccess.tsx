import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

const EarlyAccess = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Egypt",
    reason: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('early_access')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          reason: formData.reason
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("تم تسجيل طلبك بنجاح! سنتواصل معك قريباً");
    } catch (error) {
      console.error('Error submitting early access request:', error);
      toast.error("حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  const canonical = typeof window !== "undefined" ? window.location.href : "/early-access";

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>شكراً لك - Crypto-MSR</title>
          <meta name="description" content="شكراً لك على التسجيل في الوصول المبكر لمنصة Crypto-MSR" />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <main className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="font-playfair text-2xl">شكراً لك!</CardTitle>
              <CardDescription>
                تم تسجيل طلبك للوصول المبكر بنجاح. سنتواصل معك قريباً عبر البريد الإلكتروني.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/">العودة إلى الصفحة الرئيسية</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>الوصول المبكر - Crypto-MSR | محفظة العملات الرقمية</title>
        <meta name="description" content="انضم إلى قائمة الانتظار للحصول على الوصول المبكر لمنصة Crypto-MSR - محفظة العملات الرقمية الآمنة" />
        <meta name="keywords" content="وصول مبكر, عملات رقمية, محفظة, مصر, crypto, early access" />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <main className="min-h-screen bg-background">
        <div className="relative bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
                الوصول المبكر
                <br />
                <span className="text-primary">Early Access</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                كن من أوائل المستخدمين لمنصة Crypto-MSR واحصل على إمكانيات حصرية
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl text-center">طلب الانضمام</CardTitle>
                  <CardDescription className="text-center">
                    املأ البيانات التالية للحصول على الوصول المبكر
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">الاسم الكامل *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="اكتب اسمك الكامل"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+20 1234567890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">البلد</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر البلد" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Egypt">مصر - Egypt</SelectItem>
                          <SelectItem value="UAE">الإمارات - UAE</SelectItem>
                          <SelectItem value="Saudi Arabia">السعودية - Saudi Arabia</SelectItem>
                          <SelectItem value="Jordan">الأردن - Jordan</SelectItem>
                          <SelectItem value="Lebanon">لبنان - Lebanon</SelectItem>
                          <SelectItem value="Other">أخرى - Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">لماذا تريد الانضمام؟</Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="أخبرنا لماذا تريد استخدام المنصة..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        "إرسال الطلب"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  * سنتواصل معك خلال 24-48 ساعة للموافقة على طلبك
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EarlyAccess;