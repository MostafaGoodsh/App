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

export default function BlockchainAdmin() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<PageContent[]>([]);
  const [types, setTypes] = useState<ContributionType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);

  const [editContent, setEditContent] = useState<PageContent | null>(null);
  const [editType, setEditType] = useState<ContributionType | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [c, t, k, a, ctr] = await Promise.all([
      supabase.from("blockchain_page_content").select("*").order("display_order"),
      supabase.from("blockchain_contribution_types").select("*").order("display_order"),
      supabase.from("blockchain_tasks").select("*").order("display_order"),
      supabase.from("blockchain_contributor_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("blockchain_contributors").select("*").order("total_points", { ascending: false }),
    ]);
    setContents((c.data as any) || []);
    setTypes((t.data as any) || []);
    setTasks((k.data as any) || []);
    setApplications((a.data as any) || []);
    setContributors((ctr.data as any) || []);
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
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="applications" className="gap-1"><Users className="h-4 w-4" />{isAr ? "الطلبات" : "Applications"} {pendingCount > 0 && <Badge className="ml-1">{pendingCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="contributors" className="gap-1"><Sparkles className="h-4 w-4" />{isAr ? "المساهمون" : "Contributors"}</TabsTrigger>
          <TabsTrigger value="content" className="gap-1"><FileText className="h-4 w-4" />{isAr ? "المحتوى" : "Content"}</TabsTrigger>
          <TabsTrigger value="types" className="gap-1"><Layers className="h-4 w-4" />{isAr ? "الأنواع" : "Types"}</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1"><ListChecks className="h-4 w-4" />{isAr ? "المهام" : "Tasks"}</TabsTrigger>
        </TabsList>

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
    </div>
  );
}
