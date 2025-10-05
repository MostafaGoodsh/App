import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SupportAdmin = () => {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: messages, refetch } = useQuery({
    queryKey: ["support-messages-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_messages")
        .select(`
          *,
          profiles!support_messages_user_id_fkey(full_name, email),
          responded_by_profile:profiles!support_messages_responded_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleRespond = async () => {
    if (!selectedMessage) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("support_messages")
        .update({
          admin_response: response,
          responded_by: user?.id,
          responded_at: new Date().toISOString(),
          status: newStatus || selectedMessage.status,
        })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      toast({
        title: "تم إرسال الرد",
        description: "تم إرسال الرد للمستخدم بنجاح",
      });

      setSelectedMessage(null);
      setResponse("");
      setNewStatus("");
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

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      low: { variant: "outline", label: "منخفض" },
      normal: { variant: "secondary", label: "عادي" },
      high: { variant: "default", label: "عالي" },
      urgent: { variant: "destructive", label: "عاجل" },
    };

    const config = variants[priority] || variants.normal;

    return (
      <Badge variant={config.variant}>
        {priority === "urgent" && <AlertCircle className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  const filterMessages = (status?: string) => {
    if (!messages) return [];
    if (!status) return messages;
    return messages.filter((msg: any) => msg.status === status);
  };

  const MessageCard = ({ msg }: { msg: any }) => (
    <Card
      key={msg.id}
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => {
        setSelectedMessage(msg);
        setNewStatus(msg.status);
        setResponse(msg.admin_response || "");
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{msg.subject}</CardTitle>
            <CardDescription>
              من: {msg.profiles?.full_name || "مستخدم"} ({msg.profiles?.email})
            </CardDescription>
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
            {getPriorityBadge(msg.priority)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {msg.message}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>إدارة رسائل الدعم - لوحة التحكم</title>
        <meta name="description" content="إدارة رسائل الدعم والرد على المستخدمين" />
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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold lang-ar">إدارة رسائل الدعم</h1>
            <h2 className="text-2xl font-semibold lang-en">Support Messages Management</h2>
            <p className="text-muted-foreground lang-ar">عرض والرد على رسائل المستخدمين</p>
            <p className="text-sm text-muted-foreground lang-en">View and respond to user messages</p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                <span className="lang-ar">الكل ({messages?.length || 0})</span>
                <span className="lang-en">All ({messages?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="pending">
                <span className="lang-ar">قيد الانتظار ({filterMessages("pending").length})</span>
                <span className="lang-en">Pending ({filterMessages("pending").length})</span>
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                <span className="lang-ar">قيد المعالجة ({filterMessages("in_progress").length})</span>
                <span className="lang-en">In Progress ({filterMessages("in_progress").length})</span>
              </TabsTrigger>
              <TabsTrigger value="resolved">
                <span className="lang-ar">تم الحل ({filterMessages("resolved").length})</span>
                <span className="lang-en">Resolved ({filterMessages("resolved").length})</span>
              </TabsTrigger>
              <TabsTrigger value="closed">
                <span className="lang-ar">مغلق ({filterMessages("closed").length})</span>
                <span className="lang-en">Closed ({filterMessages("closed").length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {messages && messages.length > 0 ? (
                messages.map((msg: any) => <MessageCard key={msg.id} msg={msg} />)
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground lang-ar">لا توجد رسائل</p>
                    <p className="text-sm text-muted-foreground lang-en">No messages</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {filterMessages("pending").map((msg: any) => (
                <MessageCard key={msg.id} msg={msg} />
              ))}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4 mt-6">
              {filterMessages("in_progress").map((msg: any) => (
                <MessageCard key={msg.id} msg={msg} />
              ))}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4 mt-6">
              {filterMessages("resolved").map((msg: any) => (
                <MessageCard key={msg.id} msg={msg} />
              ))}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4 mt-6">
              {filterMessages("closed").map((msg: any) => (
                <MessageCard key={msg.id} msg={msg} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              من: {selectedMessage?.profiles?.full_name} ({selectedMessage?.profiles?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                <span className="lang-ar">رسالة المستخدم:</span>
                <span className="lang-en">User Message:</span>
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {selectedMessage?.message}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                <span className="lang-ar">تغيير الحالة</span>
                <span className="lang-en">Change Status</span>
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending"><span className="lang-ar">قيد الانتظار</span><span className="lang-en">Pending</span></SelectItem>
                  <SelectItem value="in_progress"><span className="lang-ar">قيد المعالجة</span><span className="lang-en">In Progress</span></SelectItem>
                  <SelectItem value="resolved"><span className="lang-ar">تم الحل</span><span className="lang-en">Resolved</span></SelectItem>
                  <SelectItem value="closed"><span className="lang-ar">مغلق</span><span className="lang-en">Closed</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                <span className="lang-ar">الرد على الرسالة</span>
                <span className="lang-en">Reply to Message</span>
              </label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="اكتب ردك هنا / Write your response here..."
                rows={6}
              />
            </div>

            <Button
              onClick={handleRespond}
              disabled={isSubmitting || !response.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              <span className="lang-ar">{isSubmitting ? "جاري الإرسال..." : "إرسال الرد"}</span>
              <span className="lang-en">{isSubmitting ? "Sending..." : "Send Reply"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportAdmin;
