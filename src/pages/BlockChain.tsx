import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Network, Cpu, Coins, Users, Shield, Layers, Zap, Globe,
  CheckCircle2, Clock, XCircle, Sparkles, ArrowRight, Database
} from "lucide-react";

type Application = {
  id: string;
  status: string;
  contribution_type: string;
  created_at: string;
  admin_notes: string | null;
};

const contributionTypes = [
  { value: "validator", labelAr: "مُشغّل عقدة (Validator)", labelEn: "Validator Node Operator", icon: Shield },
  { value: "developer", labelAr: "مطوّر (Developer)", labelEn: "Developer", icon: Cpu },
  { value: "investor", labelAr: "مستثمر مؤسس", labelEn: "Founding Investor", icon: Coins },
  { value: "community", labelAr: "سفير مجتمع", labelEn: "Community Ambassador", icon: Users },
];

const capabilities = [
  { icon: Network, titleAr: "FireFly SuperNode", titleEn: "FireFly SuperNode", descAr: "نود مؤسسي على Kaleido يربط Ethereum وIPFS وموصّلات التوكنز ERC20/ERC721.", descEn: "Enterprise node on Kaleido connecting Ethereum, IPFS, and ERC20/ERC721 token connectors." },
  { icon: Layers, titleAr: "تعدد Namespaces", titleEn: "Multi-Namespace", descAr: "بيئتان منفصلتان (XcX و Goodsh) لفصل بيئات التطوير والإنتاج.", descEn: "Two isolated namespaces (XcX & Goodsh) for staging and production." },
  { icon: Coins, titleAr: "إصدار التوكنز", titleEn: "Token Issuance", descAr: "إنشاء وإدارة عملات قابلة للتداول (ERC20) وأصول رقمية فريدة (ERC721/NFT).", descEn: "Mint and manage fungible (ERC20) and non-fungible (ERC721/NFT) assets." },
  { icon: Database, titleAr: "تخزين IPFS", titleEn: "IPFS Storage", descAr: "تخزين لامركزي للوثائق والملفات مع روابط ثابتة (CID) قابلة للتحقق.", descEn: "Decentralized storage for documents with verifiable content IDs (CIDs)." },
  { icon: Zap, titleAr: "بث الرسائل", titleEn: "Message Broadcasting", descAr: "إرسال بيانات وأحداث على السلسلة بشكل موثّق وقابل للمراجعة.", descEn: "Broadcast verifiable, auditable data and events on-chain." },
  { icon: Globe, titleAr: "جاهز للتوسع", titleEn: "Scale Ready", descAr: "بنية تحتية مرنة قابلة للتوسع نحو شبكة عامة كاملة لاحقاً.", descEn: "Flexible infrastructure ready to expand into a full public network." },
];

export default function BlockChain() {
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const isAr = language === "ar";

  const [loading, setLoading] = useState(false);
  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: user?.email || "",
    phone: "",
    country: "",
    contribution_type: "validator",
    expertise_areas: "",
    experience_summary: "",
    motivation: "",
    technical_resources: "",
    investment_range: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("blockchain_contributor_applications")
        .select("id,status,contribution_type,created_at,admin_notes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setExistingApp(data as Application);
      setForm((f) => ({ ...f, email: user.email || f.email }));
    })();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: isAr ? "يجب تسجيل الدخول" : "Sign in required", variant: "destructive" });
      return;
    }
    if (!form.full_name || !form.email || !form.motivation) {
      toast({ title: isAr ? "يرجى إكمال الحقول المطلوبة" : "Please complete required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error, data } = await supabase
      .from("blockchain_contributor_applications")
      .insert({
        user_id: user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        country: form.country || null,
        contribution_type: form.contribution_type,
        expertise_areas: form.expertise_areas
          ? form.expertise_areas.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        experience_summary: form.experience_summary || null,
        motivation: form.motivation,
        technical_resources: form.technical_resources || null,
        investment_range: form.investment_range || null,
      })
      .select("id,status,contribution_type,created_at,admin_notes")
      .single();
    setLoading(false);
    if (error) {
      toast({ title: isAr ? "فشل الإرسال" : "Submission failed", description: error.message, variant: "destructive" });
      return;
    }
    setExistingApp(data as Application);
    toast({ title: isAr ? "تم استلام طلبك" : "Application received", description: isAr ? "سنراجع طلبك ونعود إليك قريباً." : "We'll review your application shortly." });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { ar: string; en: string; Icon: typeof Clock; cls: string }> = {
      pending: { ar: "قيد المراجعة", en: "Pending Review", Icon: Clock, cls: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
      approved: { ar: "تمت الموافقة", en: "Approved", Icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
      rejected: { ar: "تم الرفض", en: "Rejected", Icon: XCircle, cls: "bg-rose-500/15 text-rose-500 border-rose-500/30" },
    };
    const s = map[status] || map.pending;
    return (
      <Badge variant="outline" className={s.cls}>
        <s.Icon className="h-3 w-3 mr-1" />
        {isAr ? s.ar : s.en}
      </Badge>
    );
  };

  return (
    <div dir={dir} className="min-h-[calc(100dvh-4rem)] w-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {isAr ? "مرحلة التأسيس | Founding Phase" : "Founding Phase"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
            {isAr ? "ساهم في تأسيس بلوكتشين MSR" : "Help Build the MSR Blockchain"}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-6">
            {isAr
              ? "نبني شبكة بلوكتشين خاصة بمنصة MSR على بنية FireFly SuperNode من Kaleido. ندعو مشتركي المنصة للانضمام كمؤسسين: مشغلي عُقد، مطوّرين، مستثمرين، وسفراء مجتمع."
              : "We're building MSR's blockchain on Kaleido's FireFly SuperNode infrastructure. We invite our platform members to join as founders: validators, developers, investors, and community ambassadors."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href="#apply">
                {isAr ? "قدّم طلبك الآن" : "Apply Now"}
                <ArrowRight className={`h-4 w-4 ${isAr ? "mr-2 rotate-180" : "ml-2"}`} />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#capabilities">{isAr ? "اكتشف الإمكانات" : "Explore Capabilities"}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          {isAr ? "إمكانات الشبكة" : "Network Capabilities"}
        </h2>
        <p className="text-muted-foreground mb-8">
          {isAr ? "ما يمكنك بناؤه فوق بنيتنا التحتية" : "What you can build on top of our infrastructure"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Card key={i} className="border-primary/10 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{isAr ? c.titleAr : c.titleEn}</CardTitle>
                <CardDescription>{isAr ? c.descAr : c.descEn}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Application */}
      <section id="apply" className="mx-auto max-w-3xl px-4 py-12">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isAr ? "طلب الانضمام كمؤسس" : "Founding Contributor Application"}
            </CardTitle>
            <CardDescription>
              {isAr
                ? "املأ النموذج وسيتواصل معك فريق التأسيس بعد المراجعة."
                : "Fill the form and our founding team will reach out after review."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  {isAr ? "يجب تسجيل الدخول لتقديم طلب." : "Please sign in to apply."}
                </p>
                <Button asChild><Link to="/auth">{isAr ? "تسجيل الدخول" : "Sign In"}</Link></Button>
              </div>
            ) : existingApp ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {isAr ? "حالة طلبك" : "Application Status"}
                    </div>
                    <StatusBadge status={existingApp.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(existingApp.created_at).toLocaleDateString()}
                  </div>
                </div>
                {existingApp.admin_notes && (
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm font-medium mb-1">
                      {isAr ? "ملاحظات الإدارة:" : "Admin Notes:"}
                    </div>
                    <p className="text-sm text-muted-foreground">{existingApp.admin_notes}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {isAr
                    ? "سنعلمك بأي تحديث على طلبك عبر الإشعارات."
                    : "We'll notify you of any updates via notifications."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="full_name">{isAr ? "الاسم الكامل *" : "Full Name *"}</Label>
                    <Input id="full_name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="email">{isAr ? "البريد الإلكتروني *" : "Email *"}</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="phone">{isAr ? "الهاتف" : "Phone"}</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="country">{isAr ? "الدولة" : "Country"}</Label>
                    <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label>{isAr ? "نوع المساهمة *" : "Contribution Type *"}</Label>
                  <Select value={form.contribution_type} onValueChange={(v) => setForm({ ...form, contribution_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {contributionTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{isAr ? t.labelAr : t.labelEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expertise_areas">
                    {isAr ? "مجالات الخبرة (مفصولة بفاصلة)" : "Expertise Areas (comma separated)"}
                  </Label>
                  <Input id="expertise_areas" placeholder={isAr ? "Solidity, DevOps, Tokenomics" : "Solidity, DevOps, Tokenomics"} value={form.expertise_areas} onChange={(e) => setForm({ ...form, expertise_areas: e.target.value })} />
                </div>

                <div>
                  <Label htmlFor="experience_summary">{isAr ? "ملخص خبرتك" : "Experience Summary"}</Label>
                  <Textarea id="experience_summary" rows={3} value={form.experience_summary} onChange={(e) => setForm({ ...form, experience_summary: e.target.value })} />
                </div>

                <div>
                  <Label htmlFor="motivation">{isAr ? "لماذا تريد المساهمة؟ *" : "Why do you want to contribute? *"}</Label>
                  <Textarea id="motivation" required rows={4} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} />
                </div>

                <div>
                  <Label htmlFor="technical_resources">
                    {isAr ? "الموارد التقنية المتاحة (للمشغّلين)" : "Available Technical Resources (for validators)"}
                  </Label>
                  <Textarea id="technical_resources" rows={2} placeholder={isAr ? "سعر السيرفر، النطاق الترددي، الموقع..." : "Server specs, bandwidth, location..."} value={form.technical_resources} onChange={(e) => setForm({ ...form, technical_resources: e.target.value })} />
                </div>

                <div>
                  <Label htmlFor="investment_range">
                    {isAr ? "نطاق الاستثمار (للمستثمرين)" : "Investment Range (for investors)"}
                  </Label>
                  <Input id="investment_range" placeholder={isAr ? "مثال: 5,000 - 25,000 USD" : "e.g., $5,000 - $25,000"} value={form.investment_range} onChange={(e) => setForm({ ...form, investment_range: e.target.value })} />
                </div>

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? (isAr ? "جاري الإرسال..." : "Submitting...") : (isAr ? "إرسال الطلب" : "Submit Application")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
