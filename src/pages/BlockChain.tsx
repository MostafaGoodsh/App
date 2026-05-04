import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, Sparkles, ArrowRight, Loader2, LogIn } from "lucide-react";

type PageContent = {
  id: string;
  section_key: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  content: string | null;
  content_en: string | null;
  image_url: string | null;
  icon: string | null;
};

type ContributionType = {
  type_key: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  icon: string;
  color: string;
  required_points: number;
  benefits: string | null;
  benefits_en: string | null;
};

type Task = {
  id: string;
  task_key: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  contribution_type_key: string | null;
  points_reward: number;
  frequency: string;
  icon: string;
};

type Application = {
  id: string;
  status: string;
  contribution_type: string;
  contribution_role: string | null;
};

type Contributor = {
  total_points: number;
  current_streak: number;
  contribution_type_key: string;
};

type SuperNode = {
  id: string;
  display_name: string;
  display_name_en: string | null;
  entity_type: string;
  economic_category: string;
  description: string | null;
  description_en: string | null;
  logo_url: string | null;
  website_url: string | null;
};

type BCSettings = {
  show_super_nodes_section: boolean;
  show_node_sale_section: boolean;
  node_sale_active: boolean;
  super_nodes_title: string;
  super_nodes_title_en: string;
  super_nodes_description: string | null;
  super_nodes_description_en: string | null;
  node_sale_title: string | null;
  node_sale_title_en: string | null;
  node_sale_description: string | null;
  node_sale_description_en: string | null;
};

export default function BlockChain() {
  const { user } = useAuth();
  const { language, dir } = useLanguage();
  const isAr = language === "ar";

  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<PageContent[]>([]);
  const [types, setTypes] = useState<ContributionType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contributorsCount, setContributorsCount] = useState(0);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [myContributor, setMyContributor] = useState<Contributor | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [superNodes, setSuperNodes] = useState<SuperNode[]>([]);
  const [bcSettings, setBcSettings] = useState<BCSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    contribution_role: "routine",
    motivation: "",
  });

  const loadData = async () => {
    setLoading(true);
    const [c, t, k, ctrCount, sn, st] = await Promise.all([
      supabase.from("blockchain_page_content").select("*").eq("is_active", true).order("display_order"),
      supabase.from("blockchain_contribution_types").select("*").eq("is_active", true).order("display_order"),
      supabase.from("blockchain_tasks").select("*").eq("is_active", true).order("display_order"),
      supabase.from("blockchain_contributors").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("blockchain_super_nodes" as any).select("*").eq("is_public", true).eq("status", "active").order("display_order"),
      supabase.from("blockchain_settings" as any).select("*").maybeSingle(),
    ]);
    setContents((c.data as any) || []);
    setTypes((t.data as any) || []);
    setTasks((k.data as any) || []);
    setContributorsCount(ctrCount.count || 0);
    setSuperNodes((sn.data as any) || []);
    setBcSettings((st.data as any) || null);

    if (user) {
      const [app, ctr, today] = await Promise.all([
        supabase.from("blockchain_contributor_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("blockchain_contributors").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("blockchain_task_completions").select("task_id").eq("user_id", user.id).eq("completion_date", new Date().toISOString().split("T")[0]),
      ]);
      setMyApplication((app.data as any) || null);
      setMyContributor((ctr.data as any) || null);
      setCompletedToday(new Set((today.data || []).map((x: any) => x.task_id)));
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user?.id]);

  const submitApplication = async () => {
    if (!user) return;
    if (!form.full_name || !form.email) {
      toast({ title: isAr ? "الرجاء ملء البيانات" : "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("blockchain_contributor_applications").insert({
      user_id: user.id,
      full_name: form.full_name,
      email: form.email,
      contribution_type: form.contribution_role,
      contribution_role: form.contribution_role,
      motivation: form.motivation,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isAr ? "تم إرسال طلبك ✅" : "Application sent ✅", description: isAr ? "سنراجع طلبك قريباً" : "We'll review your application soon" });
    loadData();
  };

  const completeTask = async (task: Task) => {
    if (!user) return;
    if (completedToday.has(task.id) && task.frequency === "daily") {
      toast({ title: isAr ? "تم إنجازها اليوم" : "Already completed today" });
      return;
    }
    const { error } = await supabase.from("blockchain_task_completions").insert({
      user_id: user.id,
      task_id: task.id,
      points_earned: task.points_reward,
      completion_date: new Date().toISOString().split("T")[0],
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isAr ? `+${task.points_reward} نقطة 🎉` : `+${task.points_reward} pts 🎉` });
    loadData();
  };

  const getContent = (key: string) => contents.find(c => c.section_key === key);
  const getText = (c: PageContent | undefined, field: "title" | "description" | "content") => {
    if (!c) return "";
    const en = (c as any)[`${field}_en`];
    return isAr ? (c as any)[field] : (en || (c as any)[field]);
  };

  const hero = getContent("hero");
  const howItWorks = getContent("how_it_works");
  const examplePi = getContent("example_pi");
  const yourRole = getContent("your_role");
  const rewards = getContent("rewards");

  // Network growth visualization (target: 10,000 contributors)
  const networkTarget = 10000;
  const networkProgress = Math.min((contributorsCount / networkTarget) * 100, 100);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const isContributor = !!myContributor;
  const userType = myContributor ? types.find(t => t.type_key === myContributor.contribution_type_key) : null;
  const myTasks = tasks.filter(t => !myContributor || !t.contribution_type_key || t.contribution_type_key === myContributor.contribution_type_key || t.contribution_type_key === "routine");

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6 font-cairo" dir={dir}>
      {/* HERO */}
      {hero && (
        <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
          <CardContent className="p-6 md:p-10 text-center space-y-3">
            <div className="text-6xl mb-2">{hero.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold">{getText(hero, "title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{getText(hero, "description")}</p>
            {hero.content && <p className="text-sm leading-relaxed max-w-2xl mx-auto">{getText(hero, "content")}</p>}
          </CardContent>
        </Card>
      )}

      {/* Network Stats */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {isAr ? "نمو شبكتنا" : "Our Network Growth"}
            </h2>
            <Badge variant="secondary" className="text-sm">
              {contributorsCount.toLocaleString()} / {networkTarget.toLocaleString()} {isAr ? "مساهم" : "contributors"}
            </Badge>
          </div>
          <Progress value={networkProgress} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {isAr
              ? `اكتملت الشبكة بنسبة ${networkProgress.toFixed(1)}% — كل مساهم جديد يقربنا من الإطلاق الرسمي 🚀`
              : `Network is ${networkProgress.toFixed(1)}% complete — every new contributor brings us closer to launch 🚀`}
          </p>
        </CardContent>
      </Card>

      {/* Super Nodes Council */}
      {bcSettings?.show_super_nodes_section && superNodes.length > 0 && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              {isAr ? bcSettings.super_nodes_title : bcSettings.super_nodes_title_en}
            </CardTitle>
            {(bcSettings.super_nodes_description || bcSettings.super_nodes_description_en) && (
              <p className="text-sm text-muted-foreground">{isAr ? bcSettings.super_nodes_description : bcSettings.super_nodes_description_en}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {superNodes.map(sn => (
                <div key={sn.id} className="p-3 rounded-lg border border-amber-500/20 bg-background/50 flex gap-3 items-start">
                  {sn.logo_url ? (
                    <img src={sn.logo_url} alt={sn.display_name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-2xl">🏛️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{isAr ? sn.display_name : (sn.display_name_en || sn.display_name)}</p>
                    <div className="flex gap-1 flex-wrap mt-1">
                      <Badge variant="outline" className="text-[10px]">{sn.entity_type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{sn.economic_category}</Badge>
                    </div>
                    {(sn.description || sn.description_en) && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{isAr ? sn.description : (sn.description_en || sn.description)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Node Sale (Coming Soon / Active) */}
      {bcSettings?.show_node_sale_section && (
        <Card className="border-primary/30">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                {isAr ? bcSettings.node_sale_title : bcSettings.node_sale_title_en}
              </h2>
              <Badge variant={bcSettings.node_sale_active ? "default" : "secondary"}>
                {bcSettings.node_sale_active ? (isAr ? "متاح الآن" : "Live") : (isAr ? "قريباً" : "Coming Soon")}
              </Badge>
            </div>
            {(bcSettings.node_sale_description || bcSettings.node_sale_description_en) && (
              <p className="text-sm text-muted-foreground">{isAr ? bcSettings.node_sale_description : bcSettings.node_sale_description_en}</p>
            )}
          </CardContent>
        </Card>
      )}

      {isContributor && userType && (
        <Card className="border-2" style={{ borderColor: userType.color }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <span className="text-3xl">{userType.icon}</span>
                {isAr ? "أنت" : "You are a"} <span style={{ color: userType.color }}>{isAr ? userType.name : userType.name_en}</span>
              </span>
              <div className="flex gap-3 text-sm">
                <Badge>🏆 {myContributor.total_points} {isAr ? "نقطة" : "pts"}</Badge>
                <Badge variant="outline">🔥 {myContributor.current_streak} {isAr ? "أيام" : "days"}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{isAr ? userType.benefits : userType.benefits_en}</p>
          </CardContent>
        </Card>
      )}

      {/* Daily Tasks (if contributor) */}
      {isContributor && myTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "مهامك اليوم" : "Your Tasks Today"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myTasks.map(task => {
              const done = completedToday.has(task.id);
              return (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${done ? "bg-muted/40 opacity-60" : "hover:bg-muted/40"}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{task.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{isAr ? task.title : task.title_en || task.title}</p>
                      <p className="text-xs text-muted-foreground">{isAr ? task.description : task.description_en || task.description}</p>
                    </div>
                  </div>
                  <Button size="sm" variant={done ? "ghost" : "default"} disabled={done} onClick={() => completeTask(task)}>
                    {done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : `+${task.points_reward}`}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      {howItWorks && (
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="text-4xl">{howItWorks.icon}</div>
            <h2 className="text-2xl font-bold">{getText(howItWorks, "title")}</h2>
            <p className="text-muted-foreground">{getText(howItWorks, "description")}</p>
            {howItWorks.content && <p className="text-sm leading-relaxed mt-2 whitespace-pre-line">{getText(howItWorks, "content")}</p>}
          </CardContent>
        </Card>
      )}

      {/* Pi example */}
      {examplePi && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-6 space-y-2">
            <div className="text-4xl">{examplePi.icon}</div>
            <h2 className="text-xl font-bold">{getText(examplePi, "title")}</h2>
            <p className="text-muted-foreground text-sm">{getText(examplePi, "description")}</p>
            {examplePi.content && <p className="text-sm leading-relaxed mt-2 whitespace-pre-line">{getText(examplePi, "content")}</p>}
          </CardContent>
        </Card>
      )}

      {/* Contribution Types */}
      {yourRole && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-6 space-y-2">
              <div className="text-4xl">{yourRole.icon}</div>
              <h2 className="text-2xl font-bold">{getText(yourRole, "title")}</h2>
              <p className="text-muted-foreground">{getText(yourRole, "description")}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {types.map(t => (
              <Card key={t.type_key} className="border-2 hover:shadow-lg transition-shadow" style={{ borderColor: `${t.color}40` }}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{t.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: t.color }}>{isAr ? t.name : t.name_en}</h3>
                      <Badge variant="outline" className="text-xs">{t.required_points} {isAr ? "نقطة مطلوبة" : "pts required"}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{isAr ? t.description : t.description_en}</p>
                  <div className="text-xs pt-2 border-t">
                    <span className="font-semibold">{isAr ? "المزايا: " : "Benefits: "}</span>
                    {isAr ? t.benefits : t.benefits_en}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rewards */}
      {rewards && (
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6 space-y-2">
            <div className="text-4xl">{rewards.icon}</div>
            <h2 className="text-2xl font-bold">{getText(rewards, "title")}</h2>
            <p className="text-muted-foreground">{getText(rewards, "description")}</p>
            {rewards.content && <p className="text-sm leading-relaxed mt-2 whitespace-pre-line">{getText(rewards, "content")}</p>}
          </CardContent>
        </Card>
      )}

      {/* Application form / Status */}
      {!user ? (
        <Card className="text-center">
          <CardContent className="p-6 space-y-3">
            <p className="text-muted-foreground">{isAr ? "سجّل دخولك لتقديم طلب الانضمام" : "Sign in to apply"}</p>
            <Button asChild><Link to="/auth"><LogIn className="h-4 w-4 me-2" />{isAr ? "تسجيل الدخول" : "Sign In"}</Link></Button>
          </CardContent>
        </Card>
      ) : isContributor ? null : myApplication ? (
        <Card>
          <CardHeader><CardTitle>{isAr ? "حالة طلبك" : "Your Application Status"}</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            {myApplication.status === "pending" && <><Clock className="h-5 w-5 text-amber-500" /><span>{isAr ? "طلبك قيد المراجعة" : "Application under review"}</span></>}
            {myApplication.status === "approved" && <><CheckCircle2 className="h-5 w-5 text-green-500" /><span>{isAr ? "تمت الموافقة! حدّث الصفحة" : "Approved! Refresh the page"}</span></>}
            {myApplication.status === "rejected" && <><XCircle className="h-5 w-5 text-destructive" /><span>{isAr ? "تم رفض الطلب" : "Application rejected"}</span></>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowRight className="h-5 w-5" />{isAr ? "انضم لتأسيس الشبكة" : "Join & Build the Network"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label>{isAr ? "الاسم الكامل" : "Full Name"} *</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>{isAr ? "البريد الإلكتروني" : "Email"} *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div>
              <Label>{isAr ? "أرغب أن أكون" : "I want to be"} *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {types.map(t => (
                  <button
                    key={t.type_key}
                    type="button"
                    onClick={() => setForm({ ...form, contribution_role: t.type_key })}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${form.contribution_role === t.type_key ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                  >
                    <div className="text-2xl">{t.icon}</div>
                    <div className="text-xs font-medium mt-1">{isAr ? t.name : t.name_en}</div>
                  </button>
                ))}
              </div>
            </div>
            <div><Label>{isAr ? "لماذا تريد الانضمام؟ (اختياري)" : "Why do you want to join? (optional)"}</Label><Textarea rows={3} value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })} /></div>
            <Button onClick={submitApplication} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isAr ? "إرسال الطلب" : "Submit Application")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
