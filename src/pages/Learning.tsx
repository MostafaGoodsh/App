import { Helmet } from "react-helmet-async";
import LearningTimeline from "@/components/learning/LearningTimeline";
import { ContentSubmissionForm } from "@/components/learning/ContentSubmissionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Plus, FileText, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface PlatformMessage {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export default function Learning() {
  const canonical = `${window.location.origin}/learning`;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [messages, setMessages] = useState<PlatformMessage[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    const { data } = await supabase.from('app_content').select('*').eq('content_type', 'platform_message').eq('is_active', true).order('position_order', { ascending: true });
    if (data) {
      setMessages(data.map(d => ({ id: d.id, title: d.content_key, content: d.text_content || '', is_active: d.is_active ?? true, created_at: d.created_at })));
    }
  };

  const currentMsg = messages[currentMsgIndex];

  return (
    <>
      <Helmet>
        <title>{t("التعلم")} — Crypto-MSR</title>
        <meta name="description" content={t("تعلم، شارك، وتفاعل مع مجتمع المتداولين والمستثمرين في العملات الرقمية")} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <div className="min-h-screen" style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="min-h-screen bg-background/90">
          <section className="py-8 arabic-content" dir={t("rtl", "ltr")}>
            <div className="container mx-auto px-4 mb-8" style={{ textAlign: t("right", "left") as any }}>
              <div className="flex flex-col gap-4" style={{ alignItems: t("flex-end", "flex-start") as any }}>
                <h1 className="font-playfair text-2xl md:text-4xl font-bold mb-4">
                  {t("المنصة التفاعلية", "Interactive Platform")} | Timeline
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {t("تعلم، شارك، وتفاعل مع مجتمع المتداولين والمستثمرين في العملات الرقمية")}
                </p>
                {user && (
                  <Button onClick={() => setShowSubmissionForm(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" /><FileText className="w-4 h-4" />{t("شارك محتوى تعليمي", "Share educational content")}
                  </Button>
                )}
              </div>
            </div>

            {messages.length > 0 && (
              <div className="container mx-auto px-4 mb-8">
                <Button onClick={() => { setCurrentMsgIndex(0); setShowMessages(true); }} variant="outline"
                  className="w-full h-14 text-base font-cairo border-primary/30 bg-gradient-to-r from-primary/10 via-card/80 to-primary/10 hover:from-primary/20 hover:to-primary/20 gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="text-primary font-bold">{t("رسالة المنصة")}</span>
                  <span className="text-muted-foreground text-sm">({messages.length})</span>
                </Button>
              </div>
            )}

            <Dialog open={showMessages} onOpenChange={setShowMessages}>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-cairo flex items-center justify-center gap-2 text-primary">
                    <MessageCircle className="w-5 h-5" />{t("رسالة المنصة")} ({currentMsgIndex + 1}/{messages.length})
                  </DialogTitle>
                </DialogHeader>
                {currentMsg && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-cairo font-bold text-lg text-primary mb-2">{currentMsg.title}</h3>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
                    </div>
                    <p className="font-cairo text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap" dir="rtl">{currentMsg.content}</p>
                    {messages.length > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Button variant="outline" size="sm" onClick={() => setCurrentMsgIndex(prev => prev - 1)} disabled={currentMsgIndex === 0}>
                          <ChevronRight className="w-4 h-4 ml-1" />{t("السابقة")}
                        </Button>
                        <span className="text-xs text-muted-foreground">{currentMsgIndex + 1} / {messages.length}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMsgIndex(prev => prev + 1)} disabled={currentMsgIndex === messages.length - 1}>
                          {t("التالية")}<ChevronLeft className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <div className="container mx-auto px-4">
              <Tabs defaultValue="crypto" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/20 border border-white/20">
                  <TabsTrigger value="crypto" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10">
                    {t("مالي", "Financial")} Crypto
                  </TabsTrigger>
                  <TabsTrigger value="general" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10">
                    {t("عام", "General")}
                  </TabsTrigger>
                  <TabsTrigger value="divine" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10">
                    {t("ديني", "Religious")} Divine
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="crypto"><LearningTimeline category="crypto" /></TabsContent>
                <TabsContent value="general"><LearningTimeline category="general" /></TabsContent>
                <TabsContent value="divine"><LearningTimeline category="divine" /></TabsContent>
              </Tabs>
            </div>
          </section>
        </div>
      </div>
      
      <ContentSubmissionForm open={showSubmissionForm} onOpenChange={setShowSubmissionForm} onSuccess={() => {}} />
    </>
  );
}
