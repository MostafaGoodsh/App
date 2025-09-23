import { Helmet } from "react-helmet-async";
import LearningTimeline from "@/components/learning/LearningTimeline";
import { ContentSubmissionForm } from "@/components/learning/ContentSubmissionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Plus, FileText } from "lucide-react";

export default function Learning() {
  const canonical = `${window.location.origin}/learning`;
  const { user } = useAuth();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  return (
    <>
      <Helmet>
        <title>التعلم والتطوير — Black & Gold Crypto</title>
        <meta name="description" content="منصة تعليمية تفاعلية لتعلم العملات الرقمية والتداول مع مجتمع من المتعلمين والخبراء." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <section className="py-8 arabic-content">
        <div className="container mx-auto px-4 mb-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="font-playfair text-2xl md:text-4xl font-bold mb-4 arabic-text">Timeline | المنصة التفاعلية</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto arabic-text">
              تعلم، شارك، وتفاعل مع مجتمع المتداولين والمستثمرين في العملات الرقمية
            </p>
            
            {/* زر إضافة محتوى للمستخدمين المسجلين */}
            {user && (
              <Button
                onClick={() => setShowSubmissionForm(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                <FileText className="w-4 h-4" />
                شارك محتوى تعليمي
              </Button>
            )}
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          <Tabs defaultValue="crypto" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/20 border border-white/20">
              <TabsTrigger 
                value="crypto" 
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10"
              >
                مالي Crypto
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10"
              >
                عام General
              </TabsTrigger>
              <TabsTrigger 
                value="divine" 
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10"
              >
                ديني Divine
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="crypto">
              <LearningTimeline category="crypto" />
            </TabsContent>
            
            <TabsContent value="general">
              <LearningTimeline category="general" />
            </TabsContent>
            
            <TabsContent value="divine">
              <LearningTimeline category="divine" />
            </TabsContent>
          </Tabs>
        </div>
          </section>
        </div>
      </div>
      
      {/* Content Submission Form */}
      <ContentSubmissionForm
        open={showSubmissionForm}
        onOpenChange={setShowSubmissionForm}
        onSuccess={() => {
          // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
        }}
      />
    </>
  );
}