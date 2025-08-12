import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EarlyAccess = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/early-access";
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any)
        .from('early_access')
        .insert([
          {
            full_name: name,
            email: email,
            phone: phone || null
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({ 
            title: "البريد الإلكتروني مسجل مسبقاً", 
            description: "هذا البريد الإلكتروني مسجل في قائمة الوصول المبكر بالفعل",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({ 
          title: "تم الإرسال بنجاح", 
          description: "شكراً لانضمامك إلى قائمة الوصول المبكر! سنتواصل معك قريباً" 
        });
        setName("");
        setEmail("");
        setPhone("");
      }
    } catch (error) {
      console.error('Error submitting early access:', error);
      toast({ 
        title: "خطأ في الإرسال", 
        description: "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>الوصول المبكر — Black & Gold Crypto</title>
        <meta name="description" content="سجّل بريدك للحصول على الوصول المبكر إلى المنصة (Early Access)." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container mx-auto px-4 py-16">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">الوصول المبكر (Early Access)</h1>
        <p className="text-muted-foreground max-w-2xl mb-10">
          احصل على إشعار بأولوية عند إطلاق الميزات الأولى، بما في ذلك "المحفظة" و"توثيق الهوية".
        </p>
        <form onSubmit={onSubmit} className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم (Name)</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني (Email)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف (Phone) - اختياري</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الإرسال..." : "انضم الآن (Join Now)"}
          </Button>
        </form>
      </section>
    </>
  );
};

export default EarlyAccess;
