import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: messages, refetch } = useQuery({
    queryKey: ["support-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("support_messages").select(`*, profiles!support_messages_user_id_fkey(full_name), responded_by_profile:profiles!support_messages_responded_by_fkey(full_name)`).eq("user_id", user?.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("support_messages").insert({ user_id: user.id, subject, message, priority });
      if (error) throw error;
      toast({ title: t("تم إرسال الرسالة"), description: t("سيتم الرد عليك في أقرب وقت ممكن") });
      setSubject(""); setMessage(""); setPriority("normal"); refetch();
    } catch (error: any) {
      toast({ title: t("خطأ"), description: error.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "secondary", label: t("قيد الانتظار"), icon: Clock },
      in_progress: { variant: "default", label: t("قيد المعالجة"), icon: MessageSquare },
      resolved: { variant: "default", label: t("تم الحل"), icon: CheckCircle2 },
      closed: { variant: "outline", label: t("مغلق"), icon: CheckCircle2 },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (<Badge variant={config.variant} className="gap-1"><Icon className="h-3 w-3" />{config.label}</Badge>);
  };

  const getPriorityLabel = (p: string) => {
    const labels: Record<string, string> = { low: t("منخفض"), normal: t("عادي"), high: t("عالي"), urgent: t("عاجل") };
    return labels[p] || p;
  };

  return (
    <>
      <Helmet>
        <title>{t("الدعم")} - Crypto-MSR</title>
        <meta name="description" content={t("إرسال رسالة")} />
      </Helmet>

      <div className="min-h-screen p-6" style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">{t("رسالة جديدة")}</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5" />{t("إرسال الرسالة")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("الموضوع")}</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("موضوع الرسالة")} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("الأولوية")}</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("منخفض")}</SelectItem>
                      <SelectItem value="normal">{t("عادي")}</SelectItem>
                      <SelectItem value="high">{t("عالي")}</SelectItem>
                      <SelectItem value="urgent">{t("عاجل")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("الرسالة")}</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("نص الرسالة")} rows={6} required />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  <Send className="h-4 w-4 mr-2" />{isSubmitting ? t("جاري الإرسال...") : t("إرسال الرسالة")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t("رسائلك السابقة")}</h2>
            {messages && messages.length > 0 ? (
              messages.map((msg: any) => (
                <Card key={msg.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{msg.subject}</CardTitle>
                        <CardDescription>{new Date(msg.created_at).toLocaleDateString(dir === 'rtl' ? "ar-EG" : language === 'ru' ? "ru-RU" : "en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</CardDescription>
                      </div>
                      <div className="flex gap-2">{getStatusBadge(msg.status)}<Badge variant="outline">{getPriorityLabel(msg.priority)}</Badge></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("رسالتك:")}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    {msg.admin_response && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-1 text-primary">{t("رد الإدارة:")}</p>
                        <p className="text-sm whitespace-pre-wrap">{msg.admin_response}</p>
                        {msg.responded_at && (<p className="text-xs text-muted-foreground mt-2">{new Date(msg.responded_at).toLocaleDateString(dir === 'rtl' ? "ar-EG" : language === 'ru' ? "ru-RU" : "en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card><CardContent className="text-center py-12"><MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t("لا توجد رسائل سابقة")}</p></CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
