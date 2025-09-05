import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string;
  responses: any;
  completed_at: string;
  surveys?: {
    title: string;
    questions: any;
  };
}

interface SurveyStats {
  survey_id: string;
  survey_title: string;
  total_responses: number;
  latest_response: string;
}

export default function SurveyResponsesManagement() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [surveyStats, setSurveyStats] = useState<SurveyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const { toast } = useToast();

  const fetchSurveyResponses = async () => {
    try {
      setLoading(true);
      
      // جلب إحصائيات الاستبيانات
      const { data: statsData, error: statsError } = await supabase
        .from("survey_responses")
        .select(`
          survey_id,
          surveys!inner(title),
          completed_at
        `);

      if (statsError) throw statsError;

      // تجميع الإحصائيات
      const stats = statsData?.reduce((acc: Record<string, any>, curr) => {
        const surveyId = curr.survey_id;
        if (!acc[surveyId]) {
          acc[surveyId] = {
            survey_id: surveyId,
            survey_title: curr.surveys?.title,
            total_responses: 0,
            latest_response: curr.completed_at
          };
        }
        acc[surveyId].total_responses += 1;
        if (curr.completed_at > acc[surveyId].latest_response) {
          acc[surveyId].latest_response = curr.completed_at;
        }
        return acc;
      }, {}) || {};

      setSurveyStats(Object.values(stats));

      // جلب آخر الإجابات
      const { data: responsesData, error: responsesError } = await supabase
        .from("survey_responses")
        .select(`
          *,
          surveys(title, questions)
        `)
        .order("completed_at", { ascending: false })
        .limit(20);

      if (responsesError) throw responsesError;

      setResponses((responsesData as any) || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب إجابات الاستبيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyResponses();
  }, []);

  const exportResponses = async (surveyId?: string) => {
    try {
      const query = supabase
        .from("survey_responses")
        .select(`
          *,
          surveys(title, questions)
        `)
        .order("completed_at", { ascending: false });

      if (surveyId) {
        query.eq("survey_id", surveyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // تصدير البيانات كـ JSON
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `survey-responses-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم التصدير",
        description: "تم تصدير الإجابات بنجاح",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تصدير الإجابات",
      });
    }
  };

  const formatResponseValue = (question: any, value: string) => {
    switch (question.type) {
      case 'rating':
        return `${value}/5 ⭐`;
      case 'multiple_choice':
        return value;
      case 'text':
        return value;
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* إحصائيات الاستبيانات */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">إجابات الاستبيانات</h1>
            <p className="text-muted-foreground mt-1">عرض وإدارة إجابات المستخدمين على الاستبيانات</p>
          </div>
          <Button onClick={() => exportResponses()} variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير جميع الإجابات
          </Button>
        </div>

        {surveyStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {surveyStats.map((stat) => (
              <Card key={stat.survey_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg truncate">{stat.survey_title}</span>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 ml-1" />
                      {stat.total_responses}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      آخر إجابة: {new Date(stat.latest_response).toLocaleDateString('ar')}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportResponses(stat.survey_id)}
                    >
                      <Download className="h-3 w-3 ml-1" />
                      تصدير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد إجابات بعد</h3>
              <p className="text-muted-foreground">لم يتم الإجابة على أي استبيان حتى الآن</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* آخر الإجابات */}
      {responses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">آخر الإجابات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responses.map((response) => (
              <Card key={response.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base truncate">{response.surveys?.title}</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 ml-1" />
                          عرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>{response.surveys?.title}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh]">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">معرف المستخدم:</span>
                                <p>{response.user_id}</p>
                              </div>
                              <div>
                                <span className="font-medium">تاريخ الإجابة:</span>
                                <p>{new Date(response.completed_at).toLocaleString('ar')}</p>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">الإجابات:</h4>
                              {(response.surveys?.questions as any[])?.map((question: any, index: number) => (
                                <div key={question.id} className="border rounded-lg p-4">
                                  <h5 className="font-medium mb-2">
                                    {index + 1}. {question.question}
                                  </h5>
                                  <div className="bg-muted p-3 rounded">
                                    {response.responses[question.id] ? (
                                      formatResponseValue(question, response.responses[question.id])
                                    ) : (
                                      <span className="text-muted-foreground">لم يتم الإجابة</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">معرف المستخدم:</span> {response.user_id}
                    </div>
                    <div>
                      <span className="font-medium">تاريخ الإجابة:</span> {new Date(response.completed_at).toLocaleDateString('ar')}
                    </div>
                    <div>
                      <span className="font-medium">عدد الأسئلة:</span> {Object.keys(response.responses || {}).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}