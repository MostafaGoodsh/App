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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: messages, refetch } = useQuery({
    queryKey: ["support-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_messages")
        .select(`
          *,
          profiles!support_messages_user_id_fkey(full_name),
          responded_by_profile:profiles!support_messages_responded_by_fkey(full_name)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

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
      const { error } = await supabase.from("support_messages").insert({
        user_id: user.id,
        subject,
        message,
        priority,
      });

      if (error) throw error;

      toast({
        title: "تم إرسال الرسالة",
        description: "سيتم الرد عليك في أقرب وقت ممكن",
      });

      setSubject("");
      setMessage("");
      setPriority("normal");
      refetch();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "secondary", label: "قيد الانتظار", icon: Clock },
      in_progress: { variant: "default", label: "قيد المعالجة", icon: MessageSquare },
      resolved: { variant: "default", label: "تم الحل", icon: CheckCircle2 },
      closed: { variant: "outline", label: "مغلق", icon: CheckCircle2 },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: "منخفض",
      normal: "عادي",
      high: "عالي",
      urgent: "عاجل",
    };
    return labels[priority] || priority;
  };

  return (
    <>
      <Helmet>
        <title>الدعم الفني - تواصل مع الإدارة</title>
        <meta name="description" content="تواصل مع إدارة المنصة للحصول على المساعدة" />
      </Helmet>

      <div
        className="min-h-screen p-6"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold lang-ar">رسالة جديدة</h1>
          <h2 className="text-xl font-semibold lang-en">New Message</h2>
        </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5" />
                <span className="lang-ar">إرسال الرسالة</span>
                <span className="lang-en">Send Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <span className="lang-ar">الموضوع</span>
                    <span className="lang-en">Subject</span>
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="عنوان الرسالة / Message title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <span className="lang-ar">الأولوية</span>
                    <span className="lang-en">Priority</span>
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low"><span className="lang-ar">منخفض</span><span className="lang-en">Low</span></SelectItem>
                      <SelectItem value="normal"><span className="lang-ar">عادي</span><span className="lang-en">Normal</span></SelectItem>
                      <SelectItem value="high"><span className="lang-ar">عالي</span><span className="lang-en">High</span></SelectItem>
                      <SelectItem value="urgent"><span className="lang-ar">عاجل</span><span className="lang-en">Urgent</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <span className="lang-ar">الرسالة</span>
                    <span className="lang-en">Message</span>
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا / Write your message here..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  <span className="lang-ar">{isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}</span>
                  <span className="lang-en">{isSubmitting ? "Sending..." : "Send Message"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold lang-ar">رسائلك السابقة</h2>
            <h3 className="text-lg font-semibold lang-en">Previous Messages</h3>
            {messages && messages.length > 0 ? (
              messages.map((msg: any) => (
                <Card key={msg.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{msg.subject}</CardTitle>
                        <CardDescription>
                          {new Date(msg.created_at).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(msg.status)}
                        <Badge variant="outline">{getPriorityLabel(msg.priority)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        <span className="lang-ar">رسالتك:</span>
                        <span className="lang-en">Your message:</span>
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>

                    {msg.admin_response && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-1 text-primary">
                          <span className="lang-ar">رد الإدارة:</span>
                          <span className="lang-en">Admin Response:</span>
                        </p>
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.admin_response}
                        </p>
                        {msg.responded_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(msg.responded_at).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground lang-ar">لا توجد رسائل سابقة</p>
                  <p className="text-sm text-muted-foreground lang-en">No previous messages</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
