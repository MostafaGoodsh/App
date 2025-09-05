import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import SurveyParticipation from "@/components/surveys/SurveyParticipation";

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: any;
  created_at: string;
}

const Surveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canonical = typeof window !== "undefined" ? window.location.href : "/surveys";

  useEffect(() => {
    fetchActiveSurveys();
  }, []);

  const fetchActiveSurveys = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('surveys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>الاستبيانات — آراء وملاحظات</title>
        <meta name="description" content="الاستبيانات (Surveys) لجمع آراء المستخدمين وتحسين التجربة." />
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
          <section className="container mx-auto px-4 py-16 arabic-content">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 arabic-text">الاستبيانات (Surveys)</h1>
        <p className="text-muted-foreground max-w-2xl mb-8 arabic-text">
          شاركنا آراءك وساهم في تحسين تجربة المستخدمين على منصتنا.
        </p>

        {!user && (
          <Card className="mb-8 border-accent/50">
            <CardContent className="text-center py-6">
              <p className="text-muted-foreground mb-4 arabic-text">
                يجب تسجيل الدخول للمشاركة في الاستبيانات
              </p>
              <Button asChild>
                <Link to="/auth">تسجيل الدخول</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : surveys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground arabic-text">لا توجد استبيانات نشطة حالياً.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {surveys.map((survey) => (
                <Card key={survey.id} className="group hover:border-primary/50 transition-colors arabic-content">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg arabic-text">{survey.title}</CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      نشط
                    </Badge>
                  </div>
                  <CardDescription className="arabic-text">
                    {survey.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {survey.questions && Array.isArray(survey.questions) 
                        ? `${survey.questions.length} أسئلة` 
                        : 'عدة أسئلة'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(survey.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  {user && (
                    <SurveyParticipation survey={survey} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Surveys;
