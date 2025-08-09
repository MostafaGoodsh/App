import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const EarlyAccess = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/early-access";
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder persistence until Supabase wiring
    const existing = JSON.parse(localStorage.getItem("earlyAccess") || "[]");
    existing.push({ name, email, ts: Date.now() });
    localStorage.setItem("earlyAccess", JSON.stringify(existing));
    toast({ title: "تم الإرسال", description: "شكراً لانضمامك إلى الوصول المبكر" });
    setName("");
    setEmail("");
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
          <Button size="lg" type="submit">انضم الآن (Join Now)</Button>
        </form>
      </section>
    </>
  );
};

export default EarlyAccess;
