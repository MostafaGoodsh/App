import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, CheckCircle2, XCircle, Users, Layers, ListChecks, FileText, Sparkles, Crown, Settings } from "lucide-react";

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
  display_order: number;
  is_active: boolean;
};

type ContributionType = {
  id: string;
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
  display_order: number;
  is_active: boolean;
};

type Task = {
  id: string;
  task_key: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  task_type: string;
  contribution_type_key: string | null;
  points_reward: number;
  frequency: string;
  icon: string;
  display_order: number;
  is_active: boolean;
};

type Application = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  contribution_type: string;
  contribution_role: string | null;
  status: string;
  motivation: string | null;
  experience_summary: string | null;
  created_at: string;
  admin_notes: string | null;
};

type Contributor = {
  id: string;
  user_id: string;
  contribution_type_key: string;
  total_points: number;
  current_streak: number;
  last_activity_date: string | null;
  status: string;
  joined_at: string;
};

type SuperNode = {
  id: string;
  user_id: string | null;
  display_name: string;
  display_name_en: string | null;
  entity_type: string;
  economic_category: string;
  description: string | null;
  description_en: string | null;
  logo_url: string | null;
  website_url: string | null;
  revenue_share_percent: number;
  governance_weight: number;
  status: string;
  is_public: boolean;
  display_order: number;
};

type Policy = {
  id: string;
  contribution_type_key: string;
  min_points: number;
  required_streak_days: number;
  kyc_required: boolean;
  allowed_device: string;
  max_contributors: number | null;
  revenue_share_percent: number;
  is_open_for_applications: boolean;
  notes: string | null;
};

type BCSettings = {
  id: string;
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

export default function BlockchainAdmin() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<PageContent[]>([]);
  const [types, setTypes] = useState<ContributionType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [superNodes, setSuperNodes] = useState<SuperNode[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [settings, setSettings] = useState<BCSettings | null>(null);

  const [editContent, setEditContent] = useState<PageContent | null>(null);
  const [editType, setEditType] = useState<ContributionType | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editSuperNode, setEditSuperNode] = useState<SuperNode | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [c, t, k, a, ctr, sn, po, st] = await Promise.all([
      supabase.from("blockchain_page_content").select("*").order("display_order"),
      supabase.from("blockchain_contribution_types").select("*").order("display_order"),
      supabase.from("blockchain_tasks").select("*").order("display_order"),
      supabase.from("blockchain_contributor_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("blockchain_contributors").select("*").order("total_points", { ascending: false }),
      supabase.from("blockchain_super_nodes" as any).select("*").order("display_order"),
      supabase.from("blockchain_network_policy" as any).select("*").order("contribution_type_key"),
      supabase.from("blockchain_settings" as any).select("*").maybeSingle(),
    ]);
    setContents((c.data as any) || []);
    setTypes((t.data as any) || []);
    setTasks((k.data as any) || []);
    setApplications((a.data as any) || []);
    setContributors((ctr.data as any) || []);
    setSuperNodes((sn.data as any) || []);
    setPolicies((po.data as any) || []);
    setSettings((st.data as any) || null);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // ====== Page Content ======
  const saveContent = async () => {
    if (!editContent) return;
    const payload = { ...editContent };
    delete (payload as any).id;
    const { error } = editContent.id
      ? await supabase.from("blockchain_page_content").update(payload).eq("id", editContent.id)
      : await supabase.from("blockchain_page_content").insert(payload as any);
    if (error) {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isAr ? "تم الحفظ" : "Saved" });
    setEditContent(null);
    loadAll();
  };

  const deleteContent = async (id: string) => {
    if (!confirm(isAr ? "تأكيد الحذف؟" : "Confirm delete?")) return;
    const { error } = await supabase.from("blockchain_page_content").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else loadAll();
  };

  // ====== Contribution Types ======
  const saveType = async () => {
    if (!editType) return;
    const payload = { ...editType };
    delete (payload as any).id;
    const { error } = editType.id
      ? await supabase.from("blockchain_contribution_types").update(payload).eq("id", editType.id)
      : await supabase.from("blockchain_contribution_types").insert(payload as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isAr ? "تم الحفظ" : "Saved" });
    setEditType(null);
    loadAll();
  };

  const deleteType = async (id: string) => {
    if (!confirm(isAr ? "تأكيد الحذف؟" : "Confirm delete?")) return;
    await supabase.from("blockchain_contribution_types").delete().eq("id", id);
    loadAll();
  };

  // ====== Tasks ======
  const saveTask = async () => {
    if (!editTask) return;
    const payload = { ...editTask };
    delete (payload as any).id;
    const { error } = editTask.id
      ? await supabase.from("blockchain_tasks").update(payload).eq("id", editTask.id)
      : await supabase.from("blockchain_tasks").insert(payload as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isAr ? "تم الحفظ" : "Saved" });
    setEditTask(null);
    loadAll();
  };

  const deleteTask = async (id: string) => {
    if (!confirm(isAr ? "تأكيد الحذف؟" : "Confirm delete?")) return;
    await supabase.from("blockchain_tasks").delete().eq("id", id);
    loadAll();
  };

  // ====== Applications ======
  const reviewApplication = async (app: Application, status: "approved" | "rejected", role?: string) => {
    const { error } = await supabase
      .from("blockchain_contributor_applications")
      .update({
        status,
        contribution_role: role || app.contribution_role || "observer",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", app.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // إذا وافقنا، أضف للمساهمين
    if (status === "approved") {
      await supabase.from("blockchain_contributors").upsert({
        user_id: app.user_id,
        contribution_type_key: role || app.contribution_role || "observer",
        status: "active",
      }, { onConflict: "user_id" });
    }

    toast({ title: status === "approved" ? (isAr ? "تمت الموافقة" : "Approved") : (isAr ? "تم الرفض" : "Rejected") });
    loadAll();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const newContent = (): PageContent => ({
    id: "", section_key: "", title: "", title_en: "", description: "", description_en: "",
    content: "", content_en: "", image_url: "", icon: "✨", display_order: 0, is_active: true,
  });
  const newType = (): ContributionType => ({
    id: "", type_key: "", name: "", name_en: "", description: "", description_en: "",
    icon: "⚡", color: "#FFD700", required_points: 0, benefits: "", benefits_en: "",
    display_order: 0, is_active: true,
  });
  const newTask = (): Task => ({
    id: "", task_key: "", title: "", title_en: "", description: "", description_en: "",
    task_type: "daily", contribution_type_key: "routine", points_reward: 5, frequency: "daily",
    icon: "✓", display_order: 0, is_active: true,
  });
  const newSuperNode = (): SuperNode => ({
    id: "", user_id: null, display_name: "", display_name_en: "",
    entity_type: "institution", economic_category: "general",
    description: "", description_en: "", logo_url: "", website_url: "",
    revenue_share_percent: 0, governance_weight: 1,
    status: "active", is_public: true, display_order: 0,
  });

  const saveSuperNode = async () => {
    if (!editSuperNode) return;
    const payload: any = { ...editSuperNode };
    delete payload.id;
    if (!payload.user_id) delete payload.user_id;
    const { error } = editSuperNode.id
      ? await supabase.from("blockchain_super_nodes" as any).update(payload).eq("id", editSuperNode.id)
      : await supabase.from("blockchain_super_nodes" as any).insert(payload);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: isAr ? "تم الحفظ" : "Saved" });
    setEditSuperNode(null);
    loadAll();
  };

  const deleteSuperNode = async (id: string) => {
    if (!confirm(isAr ? "تأكيد الحذف؟" : "Confirm delete?")) return;
    await supabase.from("blockchain_super_nodes" as any).delete().eq("id", id);
    loadAll();
  };

  const updatePolicy = async (p: Policy, patch: Partial<Policy>) => {
    const { error } = await supabase.from("blockchain_network_policy" as any).update(patch).eq("id", p.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPolicies(prev => prev.map(x => x.id === p.id ? { ...x, ...patch } : x));
  };

  const updateSettings = async (patch: Partial<BCSettings>) => {
    if (!settings) return;
    const { error } = await supabase.from("blockchain_settings" as any).update(patch).eq("id", settings.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSettings({ ...settings, ...patch });
    toast({ title: isAr ? "تم التحديث" : "Updated" });
  };


  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          {isAr ? "إدارة البلوكتشين" : "Blockchain Management"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "تحكم كامل في صفحة البلوكتشين والمساهمين والمهام" : "Full control over blockchain page, contributors and tasks"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{isAr ? "المساهمون" : "Contributors"}</div><div className="text-2xl font-bold">{contributors.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{isAr ? "طلبات معلقة" : "Pending"}</div><div className="text-2xl font-bold text-amber-500">{pendingCount}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{isAr ? "المهام" : "Tasks"}</div><div className="text-2xl font-bold">{tasks.filter(t=>t.is_active).length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{isAr ? "أقسام المحتوى" : "Sections"}</div><div className="text-2xl font-bold">{contents.length}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-7 h-auto">
          <TabsTrigger value="applications" className="gap-1"><Users className="h-4 w-4" />{isAr ? "الطلبات" : "Applications"} {pendingCount > 0 && <Badge className="ml-1">{pendingCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="contributors" className="gap-1"><Sparkles className="h-4 w-4" />{isAr ? "المساهمون" : "Contributors"}</TabsTrigger>
          <TabsTrigger value="supernodes" className="gap-1"><Crown className="h-4 w-4" />{isAr ? "السوبر نودز" : "Super Nodes"}</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1"><Settings className="h-4 w-4" />{isAr ? "إعدادات" : "Settings"}</TabsTrigger>
          <TabsTrigger value="content" className="gap-1"><FileText className="h-4 w-4" />{isAr ? "المحتوى" : "Content"}</TabsTrigger>
          <TabsTrigger value="types" className="gap-1"><Layers className="h-4 w-4" />{isAr ? "الأنواع" : "Types"}</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1"><ListChecks className="h-4 w-4" />{isAr ? "المهام" : "Tasks"}</TabsTrigger>
        </TabsList>

        {/* === Super Nodes === */}
        <TabsContent value="supernodes" className="space-y-3 mt-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">{isAr ? "تعيين يدوي للمؤسسين والمؤسسات والشركاء" : "Manually assign founders, institutions, and partners"}</p>
            <Button onClick={() => setEditSuperNode(newSuperNode())} size="sm"><Plus className="h-4 w-4 me-1" />{isAr ? "إضافة سوبر نود" : "Add Super Node"}</Button>
          </div>
          {superNodes.length === 0 && <p className="text-center text-muted-foreground py-8">{isAr ? "لا يوجد سوبر نودز بعد" : "No super nodes yet"}</p>}
          {superNodes.map(sn => (
            <Card key={sn.id} className="border-l-4" style={{ borderLeftColor: '#D4AF37' }}>
              <CardContent className="p-4 flex flex-wrap justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <h3 className="font-semibold">{sn.display_name}</h3>
                    <Badge variant="outline">{sn.entity_type}</Badge>
                    <Badge variant="secondary">{sn.economic_category}</Badge>
                    {!sn.is_public && <Badge variant="destructive">{isAr ? "مخفي" : "Hidden"}</Badge>}
                    <Badge>{sn.revenue_share_percent}%</Badge>
                  </div>
                  {sn.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{sn.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditSuperNode(sn)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteSuperNode(sn.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* === Settings (Network Policy + Visibility) === */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          {settings && (
            <Card>
              <CardHeader><CardTitle className="text-base">{isAr ? "إظهار/إخفاء أقسام الواجهة" : "Public Sections Visibility"}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><Label>{isAr ? "إظهار قسم السوبر نودز" : "Show Super Nodes section"}</Label><Switch checked={settings.show_super_nodes_section} onCheckedChange={v => updateSettings({ show_super_nodes_section: v })} /></div>
                <div className="flex items-center justify-between"><Label>{isAr ? "إظهار قسم بيع النودز" : "Show Node Sale section"}</Label><Switch checked={settings.show_node_sale_section} onCheckedChange={v => updateSettings({ show_node_sale_section: v })} /></div>
                <div className="flex items-center justify-between"><Label>{isAr ? "تفعيل البيع الرسمي" : "Node sale active"}</Label><Switch checked={settings.node_sale_active} onCheckedChange={v => updateSettings({ node_sale_active: v })} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t">
                  <div><Label>{isAr ? "عنوان السوبر نودز (AR)" : "Super Nodes Title (AR)"}</Label><Input value={settings.super_nodes_title} onChange={e => setSettings({ ...settings, super_nodes_title: e.target.value })} onBlur={e => updateSettings({ super_nodes_title: e.target.value })} /></div>
                  <div><Label>Super Nodes Title (EN)</Label><Input value={settings.super_nodes_title_en} onChange={e => setSettings({ ...settings, super_nodes_title_en: e.target.value })} onBlur={e => updateSettings({ super_nodes_title_en: e.target.value })} /></div>
                  <div><Label>{isAr ? "عنوان بيع النودز (AR)" : "Node Sale Title (AR)"}</Label><Input value={settings.node_sale_title || ""} onChange={e => setSettings({ ...settings, node_sale_title: e.target.value })} onBlur={e => updateSettings({ node_sale_title: e.target.value })} /></div>
                  <div><Label>Node Sale Title (EN)</Label><Input value={settings.node_sale_title_en || ""} onChange={e => setSettings({ ...settings, node_sale_title_en: e.target.value })} onBlur={e => updateSettings({ node_sale_title_en: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>{isAr ? "وصف بيع النودز (AR)" : "Node Sale Description (AR)"}</Label><Textarea rows={2} value={settings.node_sale_description || ""} onChange={e => setSettings({ ...settings, node_sale_description: e.target.value })} onBlur={e => updateSettings({ node_sale_description: e.target.value })} /></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">{isAr ? "سياسة الشبكة (لكل دور)" : "Network Policy (per role)"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {policies.map(p => (
                <div key={p.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="outline" className="text-sm">{p.contribution_type_key}</Badge>
                    <div className="flex items-center gap-2 text-xs"><Label>{isAr ? "مفتوح للتقديم" : "Open"}</Label><Switch checked={p.is_open_for_applications} onCheckedChange={v => updatePolicy(p, { is_open_for_applications: v })} /></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div><Label className="text-xs">{isAr ? "حد أدنى نقاط" : "Min pts"}</Label><Input type="number" defaultValue={p.min_points} onBlur={e => updatePolicy(p, { min_points: parseInt(e.target.value) || 0 })} /></div>
                    <div><Label className="text-xs">{isAr ? "Streak أيام" : "Streak"}</Label><Input type="number" defaultValue={p.required_streak_days} onBlur={e => updatePolicy(p, { required_streak_days: parseInt(e.target.value) || 0 })} /></div>
                    <div><Label className="text-xs">{isAr ? "حصة %" : "Share %"}</Label><Input type="number" defaultValue={p.revenue_share_percent} onBlur={e => updatePolicy(p, { revenue_share_percent: parseFloat(e.target.value) || 0 })} /></div>
                    <div><Label className="text-xs">{isAr ? "حد أقصى" : "Max"}</Label><Input type="number" defaultValue={p.max_contributors || 0} onBlur={e => updatePolicy(p, { max_contributors: parseInt(e.target.value) || null })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <Label className="text-xs">{isAr ? "الجهاز" : "Device"}</Label>
                      <Select defaultValue={p.allowed_device} onValueChange={v => updatePolicy(p, { allowed_device: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">{isAr ? "أي" : "Any"}</SelectItem>
                          <SelectItem value="mobile">{isAr ? "موبايل" : "Mobile"}</SelectItem>
                          <SelectItem value="desktop">{isAr ? "كمبيوتر" : "Desktop"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 mt-5"><Switch checked={p.kyc_required} onCheckedChange={v => updatePolicy(p, { kyc_required: v })} /><Label className="text-xs">{isAr ? "يتطلب KYC" : "KYC required"}</Label></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>


        {/* === Applications === */}
        <TabsContent value="applications" className="space-y-3 mt-4">
          {applications.length === 0 && <p className="text-center text-muted-foreground py-8">{isAr ? "لا توجد طلبات" : "No applications"}</p>}
          {applications.map(app => (
            <Card key={app.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{app.full_name}</h3>
                      <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>{app.status}</Badge>
                      <Badge variant="outline">{app.contribution_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    {app.motivation && <p className="text-sm mt-2 line-clamp-2">{app.motivation}</p>}
                  </div>
                  {app.status === "pending" && (
                    <div className="flex gap-2 items-center">
                      <Select defaultValue="observer" onValueChange={(v) => reviewApplication(app, "approved", v)}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder={isAr ? "وافق كـ..." : "Approve as..."} /></SelectTrigger>
                        <SelectContent>
                          {types.map(t => <SelectItem key={t.type_key} value={t.type_key}>{t.icon} {isAr ? t.name : t.name_en || t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="destructive" onClick={() => reviewApplication(app, "rejected")}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* === Contributors === */}
        <TabsContent value="contributors" className="space-y-3 mt-4">
          {contributors.length === 0 && <p className="text-center text-muted-foreground py-8">{isAr ? "لا يوجد مساهمون بعد" : "No contributors yet"}</p>}
          {contributors.map(c => {
            const type = types.find(t => t.type_key === c.contribution_type_key);
            return (
              <Card key={c.id}>
                <CardContent className="p-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{type?.icon || "⚡"}</span>
                      <div>
                        <p className="font-medium text-sm">{c.user_id.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">{type ? (isAr ? type.name : type.name_en) : c.contribution_type_key}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div><p className="text-lg font-bold text-primary">{c.total_points}</p><p className="text-xs text-muted-foreground">{isAr ? "نقطة" : "Points"}</p></div>
                    <div><p className="text-lg font-bold">🔥 {c.current_streak}</p><p className="text-xs text-muted-foreground">{isAr ? "أيام" : "Streak"}</p></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* === Page Content === */}
        <TabsContent value="content" className="space-y-3 mt-4">
          <Button onClick={() => setEditContent(newContent())} size="sm"><Plus className="h-4 w-4 me-1" />{isAr ? "إضافة قسم" : "Add Section"}</Button>
          {contents.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4 flex justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.icon}</span>
                    <h3 className="font-semibold">{c.title}</h3>
                    <Badge variant="outline">{c.section_key}</Badge>
                    {!c.is_active && <Badge variant="secondary">{isAr ? "غير نشط" : "Inactive"}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditContent(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteContent(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* === Contribution Types === */}
        <TabsContent value="types" className="space-y-3 mt-4">
          <Button onClick={() => setEditType(newType())} size="sm"><Plus className="h-4 w-4 me-1" />{isAr ? "إضافة نوع" : "Add Type"}</Button>
          {types.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4 flex justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">{t.icon}</span>
                    <h3 className="font-semibold" style={{ color: t.color }}>{t.name}</h3>
                    <Badge variant="outline">{t.type_key}</Badge>
                    <Badge>{t.required_points} {isAr ? "نقطة" : "pts"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditType(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteType(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* === Tasks === */}
        <TabsContent value="tasks" className="space-y-3 mt-4">
          <Button onClick={() => setEditTask(newTask())} size="sm"><Plus className="h-4 w-4 me-1" />{isAr ? "إضافة مهمة" : "Add Task"}</Button>
          {tasks.map(k => (
            <Card key={k.id}>
              <CardContent className="p-4 flex justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">{k.icon}</span>
                    <h3 className="font-semibold">{k.title}</h3>
                    <Badge variant="outline">{k.frequency}</Badge>
                    <Badge>+{k.points_reward}</Badge>
                    {k.contribution_type_key && <Badge variant="secondary">{k.contribution_type_key}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{k.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditTask(k)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteTask(k.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* === Edit Content Dialog === */}
      <Dialog open={!!editContent} onOpenChange={(o) => !o && setEditContent(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader><DialogTitle>{editContent?.id ? (isAr ? "تعديل قسم" : "Edit Section") : (isAr ? "قسم جديد" : "New Section")}</DialogTitle></DialogHeader>
          {editContent && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isAr ? "المفتاح" : "Key"}</Label><Input value={editContent.section_key} onChange={e => setEditContent({ ...editContent, section_key: e.target.value })} /></div>
                <div><Label>{isAr ? "الأيقونة (إيموجي)" : "Icon"}</Label><Input value={editContent.icon || ""} onChange={e => setEditContent({ ...editContent, icon: e.target.value })} /></div>
              </div>
              <div><Label>{isAr ? "العنوان (عربي)" : "Title (AR)"}</Label><Input value={editContent.title} onChange={e => setEditContent({ ...editContent, title: e.target.value })} /></div>
              <div><Label>{isAr ? "العنوان (إنجليزي)" : "Title (EN)"}</Label><Input value={editContent.title_en || ""} onChange={e => setEditContent({ ...editContent, title_en: e.target.value })} /></div>
              <div><Label>{isAr ? "الوصف (عربي)" : "Description (AR)"}</Label><Textarea rows={2} value={editContent.description || ""} onChange={e => setEditContent({ ...editContent, description: e.target.value })} /></div>
              <div><Label>{isAr ? "الوصف (إنجليزي)" : "Description (EN)"}</Label><Textarea rows={2} value={editContent.description_en || ""} onChange={e => setEditContent({ ...editContent, description_en: e.target.value })} /></div>
              <div><Label>{isAr ? "المحتوى (عربي)" : "Content (AR)"}</Label><Textarea rows={4} value={editContent.content || ""} onChange={e => setEditContent({ ...editContent, content: e.target.value })} /></div>
              <div><Label>{isAr ? "المحتوى (إنجليزي)" : "Content (EN)"}</Label><Textarea rows={4} value={editContent.content_en || ""} onChange={e => setEditContent({ ...editContent, content_en: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isAr ? "رابط الصورة" : "Image URL"}</Label><Input value={editContent.image_url || ""} onChange={e => setEditContent({ ...editContent, image_url: e.target.value })} /></div>
                <div><Label>{isAr ? "ترتيب العرض" : "Order"}</Label><Input type="number" value={editContent.display_order} onChange={e => setEditContent({ ...editContent, display_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editContent.is_active} onCheckedChange={v => setEditContent({ ...editContent, is_active: v })} /><Label>{isAr ? "نشط" : "Active"}</Label></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditContent(null)}>{isAr ? "إلغاء" : "Cancel"}</Button><Button onClick={saveContent}>{isAr ? "حفظ" : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Edit Type Dialog === */}
      <Dialog open={!!editType} onOpenChange={(o) => !o && setEditType(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader><DialogTitle>{editType?.id ? (isAr ? "تعديل نوع" : "Edit Type") : (isAr ? "نوع جديد" : "New Type")}</DialogTitle></DialogHeader>
          {editType && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isAr ? "المفتاح" : "Key"}</Label><Input value={editType.type_key} onChange={e => setEditType({ ...editType, type_key: e.target.value })} /></div>
                <div><Label>{isAr ? "الأيقونة" : "Icon"}</Label><Input value={editType.icon} onChange={e => setEditType({ ...editType, icon: e.target.value })} /></div>
              </div>
              <div><Label>{isAr ? "الاسم (عربي)" : "Name (AR)"}</Label><Input value={editType.name} onChange={e => setEditType({ ...editType, name: e.target.value })} /></div>
              <div><Label>{isAr ? "الاسم (إنجليزي)" : "Name (EN)"}</Label><Input value={editType.name_en || ""} onChange={e => setEditType({ ...editType, name_en: e.target.value })} /></div>
              <div><Label>{isAr ? "الوصف (عربي)" : "Description (AR)"}</Label><Textarea rows={2} value={editType.description || ""} onChange={e => setEditType({ ...editType, description: e.target.value })} /></div>
              <div><Label>{isAr ? "الوصف (إنجليزي)" : "Description (EN)"}</Label><Textarea rows={2} value={editType.description_en || ""} onChange={e => setEditType({ ...editType, description_en: e.target.value })} /></div>
              <div><Label>{isAr ? "المزايا (عربي)" : "Benefits (AR)"}</Label><Textarea rows={2} value={editType.benefits || ""} onChange={e => setEditType({ ...editType, benefits: e.target.value })} /></div>
              <div><Label>{isAr ? "المزايا (إنجليزي)" : "Benefits (EN)"}</Label><Textarea rows={2} value={editType.benefits_en || ""} onChange={e => setEditType({ ...editType, benefits_en: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>{isAr ? "اللون" : "Color"}</Label><Input type="color" value={editType.color} onChange={e => setEditType({ ...editType, color: e.target.value })} /></div>
                <div><Label>{isAr ? "نقاط مطلوبة" : "Required Pts"}</Label><Input type="number" value={editType.required_points} onChange={e => setEditType({ ...editType, required_points: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>{isAr ? "ترتيب" : "Order"}</Label><Input type="number" value={editType.display_order} onChange={e => setEditType({ ...editType, display_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editType.is_active} onCheckedChange={v => setEditType({ ...editType, is_active: v })} /><Label>{isAr ? "نشط" : "Active"}</Label></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditType(null)}>{isAr ? "إلغاء" : "Cancel"}</Button><Button onClick={saveType}>{isAr ? "حفظ" : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Edit Task Dialog === */}
      <Dialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader><DialogTitle>{editTask?.id ? (isAr ? "تعديل مهمة" : "Edit Task") : (isAr ? "مهمة جديدة" : "New Task")}</DialogTitle></DialogHeader>
          {editTask && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isAr ? "المفتاح" : "Key"}</Label><Input value={editTask.task_key} onChange={e => setEditTask({ ...editTask, task_key: e.target.value })} /></div>
                <div><Label>{isAr ? "الأيقونة" : "Icon"}</Label><Input value={editTask.icon} onChange={e => setEditTask({ ...editTask, icon: e.target.value })} /></div>
              </div>
              <div><Label>{isAr ? "العنوان (عربي)" : "Title (AR)"}</Label><Input value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} /></div>
              <div><Label>{isAr ? "العنوان (إنجليزي)" : "Title (EN)"}</Label><Input value={editTask.title_en || ""} onChange={e => setEditTask({ ...editTask, title_en: e.target.value })} /></div>
              <div><Label>{isAr ? "الوصف (عربي)" : "Description (AR)"}</Label><Textarea rows={2} value={editTask.description || ""} onChange={e => setEditTask({ ...editTask, description: e.target.value })} /></div>
              <div><Label>{isAr ? "الوصف (إنجليزي)" : "Description (EN)"}</Label><Textarea rows={2} value={editTask.description_en || ""} onChange={e => setEditTask({ ...editTask, description_en: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{isAr ? "نوع المساهمة" : "Contribution Type"}</Label>
                  <Select value={editTask.contribution_type_key || ""} onValueChange={v => setEditTask({ ...editTask, contribution_type_key: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{types.map(t => <SelectItem key={t.type_key} value={t.type_key}>{t.icon} {isAr ? t.name : t.name_en}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isAr ? "التكرار" : "Frequency"}</Label>
                  <Select value={editTask.frequency} onValueChange={v => setEditTask({ ...editTask, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{isAr ? "يومي" : "Daily"}</SelectItem>
                      <SelectItem value="weekly">{isAr ? "أسبوعي" : "Weekly"}</SelectItem>
                      <SelectItem value="monthly">{isAr ? "شهري" : "Monthly"}</SelectItem>
                      <SelectItem value="unlimited">{isAr ? "غير محدود" : "Unlimited"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isAr ? "نقاط المكافأة" : "Points Reward"}</Label><Input type="number" value={editTask.points_reward} onChange={e => setEditTask({ ...editTask, points_reward: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>{isAr ? "ترتيب" : "Order"}</Label><Input type="number" value={editTask.display_order} onChange={e => setEditTask({ ...editTask, display_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editTask.is_active} onCheckedChange={v => setEditTask({ ...editTask, is_active: v })} /><Label>{isAr ? "نشط" : "Active"}</Label></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditTask(null)}>{isAr ? "إلغاء" : "Cancel"}</Button><Button onClick={saveTask}>{isAr ? "حفظ" : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Edit Super Node Dialog === */}
      <Dialog open={!!editSuperNode} onOpenChange={(o) => !o && setEditSuperNode(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader><DialogTitle>{editSuperNode?.id ? (isAr ? "تعديل سوبر نود" : "Edit Super Node") : (isAr ? "سوبر نود جديد" : "New Super Node")}</DialogTitle></DialogHeader>
          {editSuperNode && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isAr ? "الاسم (عربي)" : "Name (AR)"}</Label><Input value={editSuperNode.display_name} onChange={e => setEditSuperNode({ ...editSuperNode, display_name: e.target.value })} /></div>
                <div><Label>Name (EN)</Label><Input value={editSuperNode.display_name_en || ""} onChange={e => setEditSuperNode({ ...editSuperNode, display_name_en: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{isAr ? "نوع الكيان" : "Entity Type"}</Label>
                  <Select value={editSuperNode.entity_type} onValueChange={v => setEditSuperNode({ ...editSuperNode, entity_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="founder">{isAr ? "مؤسس" : "Founder"}</SelectItem>
                      <SelectItem value="institution">{isAr ? "مؤسسة" : "Institution"}</SelectItem>
                      <SelectItem value="government">{isAr ? "حكومي" : "Government"}</SelectItem>
                      <SelectItem value="premium_user">{isAr ? "مستخدم مميز" : "Premium User"}</SelectItem>
                      <SelectItem value="external_partner">{isAr ? "شريك خارجي" : "External Partner"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isAr ? "الفئة الاقتصادية" : "Economic Category"}</Label>
                  <Select value={editSuperNode.economic_category} onValueChange={v => setEditSuperNode({ ...editSuperNode, economic_category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{isAr ? "عام" : "General"}</SelectItem>
                      <SelectItem value="coins">{isAr ? "عملات" : "Coins"}</SelectItem>
                      <SelectItem value="rwa">RWA</SelectItem>
                      <SelectItem value="affiliate">Affiliate</SelectItem>
                      <SelectItem value="regulatory">{isAr ? "تنظيمي" : "Regulatory"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>{isAr ? "الوصف (عربي)" : "Description (AR)"}</Label><Textarea rows={2} value={editSuperNode.description || ""} onChange={e => setEditSuperNode({ ...editSuperNode, description: e.target.value })} /></div>
              <div><Label>Description (EN)</Label><Textarea rows={2} value={editSuperNode.description_en || ""} onChange={e => setEditSuperNode({ ...editSuperNode, description_en: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isAr ? "رابط الشعار" : "Logo URL"}</Label><Input value={editSuperNode.logo_url || ""} onChange={e => setEditSuperNode({ ...editSuperNode, logo_url: e.target.value })} /></div>
                <div><Label>Website</Label><Input value={editSuperNode.website_url || ""} onChange={e => setEditSuperNode({ ...editSuperNode, website_url: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>{isAr ? "حصة الإيرادات %" : "Revenue Share %"}</Label><Input type="number" value={editSuperNode.revenue_share_percent} onChange={e => setEditSuperNode({ ...editSuperNode, revenue_share_percent: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>{isAr ? "وزن الحوكمة" : "Governance Weight"}</Label><Input type="number" value={editSuperNode.governance_weight} onChange={e => setEditSuperNode({ ...editSuperNode, governance_weight: parseInt(e.target.value) || 1 })} /></div>
                <div><Label>{isAr ? "ترتيب" : "Order"}</Label><Input type="number" value={editSuperNode.display_order} onChange={e => setEditSuperNode({ ...editSuperNode, display_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div><Label>{isAr ? "معرّف المستخدم (اختياري)" : "User ID (optional)"}</Label><Input value={editSuperNode.user_id || ""} onChange={e => setEditSuperNode({ ...editSuperNode, user_id: e.target.value || null })} /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={editSuperNode.is_public} onCheckedChange={v => setEditSuperNode({ ...editSuperNode, is_public: v })} /><Label>{isAr ? "ظاهر للجمهور" : "Public"}</Label></div>
                <div>
                  <Select value={editSuperNode.status} onValueChange={v => setEditSuperNode({ ...editSuperNode, status: v })}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{isAr ? "نشط" : "Active"}</SelectItem>
                      <SelectItem value="pending">{isAr ? "قيد المراجعة" : "Pending"}</SelectItem>
                      <SelectItem value="suspended">{isAr ? "موقوف" : "Suspended"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditSuperNode(null)}>{isAr ? "إلغاء" : "Cancel"}</Button><Button onClick={saveSuperNode}>{isAr ? "حفظ" : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
